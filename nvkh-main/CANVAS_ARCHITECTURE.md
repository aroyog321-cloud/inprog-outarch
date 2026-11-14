# CANVAS ARCHITECTURE

**Project:** OUTARCH — Infinite Development Canvas  
**Companion documents:** `OUTARCH_CANVAS_MASTER_SPEC.md` · `CANVAS_IMPLEMENTATION_TRACKER.md` · `CANVAS_BUG_LOG.md`  
**Rule:** This document describes the actual implementation, not an imagined one. Update it when architectural decisions or behaviour change.

---

## 1. Actual architecture

### Layers

```
App.jsx (WorkspaceView)
  ├─ freeCanvasState = useFreeCanvas(workspaceKey, {sessions, stageRef})   [canvasFree.js]
  │    geometry engine, doc state, drag/nudge, persistence
  ├─ node render blocks (in the free-canvas layer)
  │    ├─ terminal panes / browser / assistant  (reserved + session-bound nodes)
  │    ├─ notes                                  [free-canvas-note]
  │    ├─ native app nodes (§19.6.3)             [free-canvas-app]
  │    └─ drawing nodes (§3.6)                   [free-canvas-drawing]
  │         └─ CanvasDrawingSurface.jsx (lazy)   [Excalidraw engine]
  └─ dock bar / omnibar / toolbar
```

- **canvasFree.js** owns the workspace document (`doc`): mode, backdrop, viewport, node rectangles, notes, wires, native-app records, drawings. It is the only writer of canvas state.
- **App.jsx** owns presentation, chrome wiring, and debounced drawing-scene persistence.
- **CanvasDrawingSurface.jsx** owns nothing but the scene: it is the single contact surface between OUTARCH and the Excalidraw engine.
- The engine owns drawing interactions; the Canvas owns placement, geometry, persistence, and workspace organization (§6).

### Object kinds and identity

| Kind | Identity | Session-bound? | Pruned by session list? |
| --- | --- | --- | --- |
| Terminal pane | session id | yes | yes (`pruneFreeCanvasDoc`) |
| Browser | `@browser` | no | never |
| Assistant | `@assistant` | no | never |
| Note | `note-*` | no | never |
| Native app (§19.6.3) | `app-*` (main-process window id) | window lives in main | never (main owns lifecycle) |
| Drawing (§3.6) | `drawing-*` | no | never |

## 2. Object lifecycle (actual)

Every node kind shares one lifecycle implemented on the shared geometry core:

1. **Create** — `addNote` / `addDrawing` / `addAppNode` cascade placement (40px offsets), clamped to the visible viewport.
2. **Render** — screen rect computed from world coords + viewport (`nodeScreenRect`); absolute-positioned inside the free-canvas layer.
3. **Move / Resize** — one drag engine (`startDrag`): pointer captured at down, rAF-throttled, recomputed from the origin rect each frame (no error accumulation), snapped to the 20px grid. `nudge` steps by the same grid.
4. **Persist** — debounced doc write (300ms) to `localStorage` under `mission-control:canvas-free:v1:<workspace>`, flushed on workspace switch and unmount.
5. **Restore from persistence** — `readFreeCanvasDoc` → `normalizeFreeCanvasDoc` (versioned, whitelisted, clamped, capped).
6. **Cleanup** — `removeNote` / `removeDrawing` / `removeAppNode`; unmount flush writes the final doc.

## 3. Drawing integration boundary (§3.6, §5.6)

### Package decision

- `@excalidraw/excalidraw@0.18.1`, official npm package, **MIT**. Peer dep `react ^18.2` — app is on react 18.3.1. No source fork; the `D:\Downloads\excalidraw-master` checkout is evaluation/reference only.
- The engine is ~1.07MB minified (~350KB gzip) and is the codebase's **first lazy chunk**: `React.lazy(() => import("./CanvasDrawingSurface.jsx"))` + `<Suspense>`. App startup never pays for it; it loads on the first drawing creation.

### Boundary contract (CanvasDrawingSurface.jsx)

- **In:** `scene = { elements, files }` — raw Excalidraw data, passed as `initialData` on mount only (`useMemo`, empty deps). The engine's `restore()` normalizes partial elements, so the exact array previously emitted by `onChange` is directly reusable — no host-side element normalization.
- **Out:** `onScene({ elements, files })` on every engine interaction tick. `appState` (tool state) is deliberately dropped: it is not workspace state (§7 distinguishes layout state from tool-specific state).
- Engine props: `theme="dark"`, `detectScroll={false}` (the free canvas owns the viewport; inner scroll detection would fight it), `handleKeyboardGlobally={false}` (OUTARCH owns global keys; engine shortcuts stay local to a focused surface), `UIOptions.canvasActions` all disabled (persistence/export is OUTARCH's job until the export feature ships).
- Nothing else in the app imports `@excalidraw/excalidraw` directly.

### Asset pipeline

- Scene fonts are **self-hosted**: `renderer/public/excalidraw-assets/fonts/` (8 families, 0.42MB — Xiaolai, a 12.08MB CJK font, is intentionally excluded; CJK text degrades to system-font metrics, a documented degradation, not an error).
- `window.EXCALIDRAW_ASSET_PATH = new URL("excalidraw-assets/", document.baseURI).href` is set in `main.jsx` before the lazy chunk can load. The engine resolves its statically-bundled relative font URIs against this base and `fetch()`es the woff2 files.
- UI fonts (Assistant etc.) ride in via `@excalidraw/excalidraw/index.css`, which Vite bundles with the lazy chunk's CSS.
- CSP: **no changes needed**. Verified empirically (`scripts/visual/probe-drawing-sandbox.cjs`) under the app's exact CSP + `sandbox: true` + `contextIsolation: true` on `file://`: `fetch` of a sibling woff2 works, module workers from file:// work, FontFace registration works, canvas rendering works, zero console errors. Excalidraw's worker/subsetting paths degrade to main-thread fallbacks on failure (non-fatal).
- CDN fallback (`esm.sh`) exists in the engine but is unreachable under CSP (`connect-src 'self'`); it is only reached when local fonts are missing, which the self-hosted copy prevents.

## 4. Persistence model (§7)

### Doc shape (v1)

```js
{
  version: 1,
  mode: "canvas" | "grid",
  backdrop, viewport: {x, y, z},
  nodes: { [id]: rect },
  notes: [{ id, x, y, w, h, content }],
  wires: [{ id, fromNode, fromPort, toNode, toPort }],
  apps: [{ id, command, title, state, x, y, w, h }],
  drawings: [{ id, title, x, y, w, h, scene: { elements: [...], files: { id: dataURL } } }]
}
```

### Drawing scene budget (defence in depth)

`normalizeDrawingScene` whitelists the scene (elements: plain objects with string ids; files: string data URLs) with caps **2000 elements / 64 files**; `drawingSceneFits` enforces **≤1.2MB serialized per scene**. Enforcement happens:

1. On restore (tampered/oversized stored scene → empty drawing, never a crash).
2. On every write (`setDrawingScene` — rejected writes return `false`).
3. On unmount flush (`flushDrawingScene` — same rules).

A rejected scene is surfaced honestly with a workspace toast ("Drawing too large to save — export it as an image instead."); nothing is silently truncated.

### Debounce and unmount safety

- Excalidraw `onChange` fires on every interaction tick, so App buffers the latest scene per drawing in a ref and writes to the doc on a **600ms** settle. This keeps engine ticks out of React state (one doc update per 600ms max, not per pointer event).
- Because React drops state updates during unmount, the hook provides `flushDrawingScene(id, scene)`: a synchronous merge into `docRef` + immediate `writeFreeCanvasDoc`. App's unmount effect (empty deps, `freeCanvasState` via ref) flushes all still-buffered scenes after the hook's own unmount write — the final write is a superset of the hook's.
- Doc writes are localStorage single-key writes: effectively atomic on this platform; corrupt JSON restores an empty doc rather than crashing.

## 5. Rendering and event handling (§5.3)

- **Interaction ownership:** titlebar/grip drag moves a node; the corner handle resizes; node interiors (engine, textarea) receive their own input; the canvas backdrop receives pan; wheel over the stage zooms around the pointer. No broad propagation hacks.
- Engine shortcuts are local (`handleKeyboardGlobally={false}`), so an active terminal keeps its keys even while a drawing surface is mounted.
- Z-order is currently static per kind (drawing 31, app 32, dock bar above). Bring-forward/send-backward is not implemented (tracked in §3.2).

## 6. Important technical decisions

1. **Package over fork** (§3.6): official npm package; upgrade path is `npm install`; the only local fork surface is the asset directory.
2. **First lazy chunk** (§5.4): the heaviest surface is split at a UI boundary, not a library boundary, so the engine cost is paid exactly when the feature is first used.
3. **Scene = elements + files, appState dropped** (§7): tool state is not workspace state; the doc stays small and version-stable.
4. **Xiaolai excluded** (§5.4): 12.08MB of CJK glyphs for a handwriting font is not worth the startup disk/memory cost; degradation is honest and documented.
5. **Drawing nodes are never session-pruned** (§7): they are not process-bound; pruning rules are the same as notes.
6. **Un-mount-safe flush** (§7): debounced writers must not rely on React state during unmount — the hook exposes a synchronous storage flush.
7. **CSP untouched** (§5.5/§5.6): the strict policy already permits everything the engine needs under Electron's `file://` renderer; no security posture was traded for the feature.
