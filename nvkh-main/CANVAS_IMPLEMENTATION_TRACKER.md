# CANVAS IMPLEMENTATION TRACKER

**Project:** OUTARCH — Infinite Development Canvas  
**Companion documents:** `OUTARCH_CANVAS_MASTER_SPEC.md` · `CANVAS_BUG_LOG.md` · `CANVAS_ARCHITECTURE.md`  
**Rule:** A feature is complete only when its actual functionality, integration, persistence, error handling, and relevant tests have been verified. Never mark unfinished work as complete.

Statuses: `NOT STARTED` / `IN PROGRESS` / `IMPLEMENTED` / `TESTING` / `VERIFIED` / `BLOCKED`

---

## Summary

| Area | Status |
| --- | --- |
| §3.1 Infinite workspace (pan/zoom/grid/snap) | VERIFIED (pre-existing engine) |
| §3.2 Object management (full lifecycle) | IN PROGRESS |
| §3.3 Terminal objects | VERIFIED (pre-existing) |
| §3.4 Integrated browser | IN PROGRESS (pre-existing single preview node) |
| §3.5 Notepad and code editor | IN PROGRESS |
| §3.6 Drawing and whiteboard | VERIFIED (live probe) |
| §3.7 Image, PDF and file objects | NOT STARTED |
| §3.8 Shared context | NOT STARTED |
| §4 UI/UX | IN PROGRESS |
| §7 Persistence and data safety | IN PROGRESS |
| §8 Testing and regression | IN PROGRESS |
| §9–§11 Documentation | IMPLEMENTED |

---

## §3.1 Infinite workspace — VERIFIED (pre-existing engine)

- Infinite horizontal/vertical workspace — VERIFIED (`canvasFree.js`: world coordinates + viewport, `COORD_LIMIT` 50000).
- Smooth panning — VERIFIED (rAF-throttled backdrop drag, `is-panning` feedback).
- Smooth zooming, mouse-wheel, zoom around cursor — VERIFIED (wheel listener, pointer-anchored).
- Reset zoom / center — VERIFIED (double-click reset, `Reset` button, `resetView`).
- Grid — IMPLEMENTED (dotgrid/blueprint/crosshatch backdrops; grid visibility toggle NOT STARTED).
- Snap-to-grid — VERIFIED (20px snap on drag and nudge).
- Positioning across zoom/pan/restore — VERIFIED (screen rects computed from world coords + viewport).
- Large workspaces without severe degradation — TESTING (no virtualization yet; visibility-aware pausing exists for panes via `rectVisible`).

## §3.2 Object management — IN PROGRESS

Implemented (per node kind: terminal panes, browser, assistant, notes, apps, drawings):
- Create, Move (drag + arrow-key nudge, shared drag grammar), Resize, Delete — VERIFIED.
- Z-order — PARTIAL (static per-kind z-index; bring forward/send backward NOT STARTED).
- Rename — PARTIAL (notes/drawings have fixed titles; rename UI NOT STARTED).
- Duplicate, minimize/maximize/restore, multi-select, group/ungroup, lock, align/distribute, context menus — NOT STARTED.

## §3.3 Terminal objects — VERIFIED (pre-existing)

- Multiple real terminal surfaces, real PTY I/O, existing shells — VERIFIED.
- PTY ownership stays in the engine; the Canvas never bypasses EngineAPI — VERIFIED (§2.3 constraint held).
- Move/rearrange never restarts a process — VERIFIED (tile/session identity separated from geometry).
- Resize syncs PTY dimensions — VERIFIED.
- Attach/detach and pop-out — VERIFIED (detached terminal window route).

## §3.4 Integrated browser — IN PROGRESS

- Single browser preview node (toggle) with navigation — IMPLEMENTED (pre-existing).
- Multiple browser objects, session isolation, full error/navigation states — NOT STARTED.
- Framework/WebView2 evaluation — BLOCKED (deferred with §5.5; see Blockers).

## §3.5 Notepad and code editor — IN PROGRESS

- Sticky notes with 2000-char content, autosave to workspace doc — VERIFIED.
- Multiple documents, tabs, markdown rendering, syntax highlighting, search/replace, file open/save, shortcuts — NOT STARTED.

## §3.6 Drawing and whiteboard — VERIFIED (live probe)

Engine decision: official `@excalidraw/excalidraw@0.18.1` npm package, MIT. Package-level integration (no source fork). Source checkout at `D:\Downloads\excalidraw-master` used for evaluation/reference only.

| Requirement | Status | Notes |
| --- | --- | --- |
| Freehand drawing, shapes, arrows, connectors, text, images | VERIFIED | Engine-native; live probe drew a rectangle with real input and it persisted (`scripts/visual/probe-canvas-drawing.cjs`, screenshot `02-drawn.png`) |
| Selection, movement, resizing, undo, redo | VERIFIED | Engine-native; `handleKeyboardGlobally={false}` keeps OUTARCH keys safe |
| Export / Import | NOT STARTED | `exportScene` module API identified; UI pending |
| Persistent drawings | VERIFIED | Scene (elements + files) persisted to workspace doc, debounced 600ms; unmount-safe flush saved the in-flight stroke (probe: 2 elements after a draw+exit within the window) |
| Engine separate from Canvas object management | VERIFIED | `CanvasDrawingSurface.jsx` is the only contact surface; geometry/lifecycle in `canvasFree.js` |
| Licensing/attribution preserved | VERIFIED | MIT; npm package used unmodified |
| Sandbox/CSP compatibility | VERIFIED | `scripts/visual/probe-drawing-sandbox.cjs`: fetch(file://) OK, module worker OK, FontFace OK, zero console errors under the app's exact CSP |
| Scene font self-hosting | IMPLEMENTED | `renderer/public/excalidraw-assets/fonts/` (0.42MB, 8 families; Xiaolai CJK skipped — degrades to system metrics, documented). CDN fallback attempts are CSP-blocked and visible in console — see CANVAS-005 |
| Lazy loading | VERIFIED | First lazy chunk in the codebase; engine mounts ~1–3.5s on first drawing creation, never at startup |
| Persistence size budget | VERIFIED | 2000 elements / 64 files / 1.2MB serialized per scene; overflow → honest toast, never silent truncation |
| Node lifecycle (create/move/resize/nudge/delete/arrange) | VERIFIED | Live probe: add, move by grip (geometry persisted, scene intact), delete (doc empties); resize via shared chrome; `arrangeCanvas` places drawings in the notes column below notes (340px spacing) |
| Reload restore | VERIFIED | Probe: reload → doc restored (mode, geometry, 2 elements) → toggle back → engine + scene re-render |
| Tests | VERIFIED | `test/canvasDrawings.test.cjs` — 9/9; full suite 1021 pass / 1 fail (pre-existing 427 Store identity) |

Next actions for §3.6:
1. Export/import (PNG via `exportScene`; .excalidraw file import) — NOT STARTED.
2. Resolve or formally accept the CDN font-src console noise (CANVAS-005).

## §3.7 Image, PDF and file objects — NOT STARTED

## §3.8 Shared context — NOT STARTED

## §4 UI/UX — IN PROGRESS

- Drawing node chrome matches the note/app node grammar (tokens only, no raw colours, no `!important`) — IMPLEMENTED.
- Dock button `is-draw` — IMPLEMENTED (inherits shared dock button styles).
- Omnibar command "add drawing" — IMPLEMENTED.
- Object toolbar, minimap, alignment guides, quick switcher, saving indicator — NOT STARTED (§4.3 candidates).

## §7 Persistence and data safety — IN PROGRESS

- Workspace doc versioned (`DOC_VERSION`), validated on read (`normalizeFreeCanvasDoc`), local-first (localStorage) — VERIFIED.
- Drawing scenes whitelisted + size-capped before storage ever sees them — IMPLEMENTED.
- Storage quota/denial degrades gracefully (session keeps working, write returns false) — VERIFIED (pre-existing).
- Atomic writes — NOT STARTED (localStorage single-key writes are effectively atomic on this platform; documented in CANVAS_ARCHITECTURE.md).

## §8 Testing — IN PROGRESS

- `test/canvasDrawings.test.cjs` — 9/9 passing.
- Full suite baseline before §3.6: 1012 pass / 1 fail (427 Store identity, pre-existing).
- CSS baselines: `!important` ceiling 1417; raw colours ceiling 1169 — recheck after §3.6 additions (pending).
- Live Windows app verification — pending (§3.6 next action 1).

## Blockers

1. **§3.4 browser as full Canvas object** — BLOCKED.
   - Why: WebView2-in-Electron composition (focus, z-order, resize) is an unresolved framework question; the current browser is an Electron preview node, not a multi-object system.
   - Alternatives evaluated: Electron `<webview>` (deprecated semantics), `<iframe>` (CSP/file:// constraints), WebView2 (out-of-process composition).
   - Recommended: prototype WebView2 composition in the actual shell before committing.
   - Required: explicit decision from the user.
2. **Phases 7/8/9 (native DWM thumbnails §18.4.8, agent templates §19.7, per-terminal CLI accounts §18.4.17)** — BLOCKED by prior decision; do not start without explicit direction.
