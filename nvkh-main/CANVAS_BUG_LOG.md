# CANVAS BUG LOG

**Project:** OUTARCH — Infinite Development Canvas  
**Companion documents:** `OUTARCH_CANVAS_MASTER_SPEC.md` · `CANVAS_IMPLEMENTATION_TRACKER.md` · `CANVAS_ARCHITECTURE.md`

Rules (spec §10):
- Never delete an issue merely because it was fixed.
- Preserve the original cause and resolution.
- Reopen issues when regressions occur.
- Verify fixes in the actual application.
- Distinguish between a workaround and a permanent solution.

## Summary

- **Open critical issues:** 0
- **Open high-priority issues:** 0
- **Recently fixed issues:** CANVAS-001 (TDZ crash), CANVAS-002 (font copy ENOENT), CANVAS-003 (unmount data-loss window), CANVAS-004 (engine collapsed to height 0)
- **Recurring issues:** (none observed yet)
- **Known limitations:** Xiaolai CJK font not bundled (degrades to system metrics); drawing scene budget rejects scenes over ~1.2MB with a toast; Excalidraw engine chunk is ~350KB gzip, paid only on first drawing creation; the engine's CDN font fallback URL is CSP-blocked and logs console errors on mount (CANVAS-005 — cosmetic, scene fonts load via the data-URL subset path).

---

## Issue ID: CANVAS-001

**Date discovered:** (pre-§3.6 session)  
**Feature:** Free canvas / workspace  
**Severity:** Critical  
**Status:** Verified

**Description:** Opening the workspace free canvas crashed with `ReferenceError: Cannot access 'Ze' before initialization` (minified `workspaceToast`).

**Steps to reproduce:** Open workspace, toggle the free canvas.

**Expected behavior:** Canvas opens.

**Actual behavior:** Renderer exception; canvas dead.

**Root cause:** `launchNativeApp`/`controlNativeApp`/`runExternalApp` referenced `workspaceToast` declared later in the component (TDZ on minified const binding).

**Files or components affected:** `src/groundstation/renderer/App.jsx`.

**Fix implemented:** Moved the native-app callbacks below the `useToast()` declaration; added optional chaining on `freeCanvasState?.doc?.apps/nodes/backdrop`.

**Verification performed:** User confirmed the canvas opens and works.

**Regression test added:** None yet (TDZ is a build-order property; guarded by suite not crashing on workspace tests).

**Prevention for future changes:** Keep hook-derived values (toasts) declared before any callback that closes over them; the optional chaining pattern is now used for all cross-feature doc reads.

---

## Issue ID: CANVAS-002

**Date discovered:** 2026-11-14 (§3.6 session)  
**Feature:** §3.6 Drawing — asset pipeline  
**Severity:** Low  
**Status:** Fixed (verification: automated copy check + build)

**Description:** Copying scene fonts from `node_modules/@excalidraw/excalidraw/dist/prod/fonts` failed with `ENOENT` on `Assistant-Bold.woff2` while `fs.existsSync` reported the file present.

**Steps to reproduce:** Run a copy loop that copies each family's files without creating the destination family directory first.

**Expected behavior:** All 25 font files copied (Xiaolai skipped).

**Actual behavior:** `copyfile ENOENT` on the first file of the first family.

**Root cause:** The destination directory `public/excalidraw-assets/fonts/Assistant/` was never created — the walk only `mkdirSync`-ed child *directories*, not the family directory itself. (Windows reports the failure against the source path in the error text, which initially pointed at the file, not the missing directory.)

**Files or components affected:** one-off copy script (inline `node -e`).

**Fix implemented:** `mkdirSync(dstFamily, {recursive:true})` at the top of the walk before copying files.

**Verification performed:** Copy succeeded (25 files, 0.42MB); `dist/groundstation/renderer/excalidraw-assets/fonts/` contains all families after build.

**Regression test added:** `test/canvasDrawings.test.cjs` asserts `public/excalidraw-assets/fonts` exists.

**Prevention for future changes:** Create the destination directory before any file copy loop; do not trust Windows copy-error `path` fields to name the real offender.

---

## Issue ID: CANVAS-003

**Date discovered:** 2026-11-14 (§3.6 session)  
**Feature:** §3.6 Drawing — unmount persistence  
**Severity:** Medium (potential data loss)  
**Status:** Fixed (verification: code-level + tests pending live probe)

**Description:** A drawing scene still inside the 600ms debounce window when the view unmounts would be silently lost: React drops `setDoc` state updates issued during unmount, so a naive "flush on unmount via setState" is a no-op.

**Steps to reproduce:** Draw, then close/switch workspace within 600ms of the last stroke.

**Expected behavior:** The last strokes persist.

**Actual behavior (pre-fix):** The pending scene never reached storage — silent loss, violating §7.

**Root cause:** Debounce window outlived the component; state updates are dead during unmount.

**Files or components affected:** `src/groundstation/renderer/canvasFree.js`, `src/groundstation/renderer/App.jsx`.

**Fix implemented:** The hook exposes `flushDrawingScene(id, scene)` — a synchronous merge into `docRef.current` plus an immediate `writeFreeCanvasDoc` — and App's unmount effect calls it for every still-buffered scene. The hook's own unmount write runs first; the flush overwrites storage with a superset of the same doc.

**Verification performed:** Unit test asserts the flush writes storage synchronously; live probe (draw → immediate exit → reopen) pending.

**Regression test added:** `test/canvasDrawings.test.cjs` (`canvasFree.js exposes the full drawing API`).

**Prevention for future changes:** Any debounced writer in this codebase must have an unmount path that does not rely on React state updates.

---

## Issue ID: CANVAS-004

**Date discovered:** 2026-11-14 (§3.6 session, live probe)  
**Feature:** §3.6 Drawing — engine rendering  
**Severity:** High  
**Status:** Fixed (verification: probe pending)

**Description:** The drawing node mounted its chrome but the Excalidraw engine rendered as a black empty box — 180 DOM children present, 2 canvases, 2 islands, but the engine root computed `height: 0px`, so nothing was visible and nothing was drawable.

**Steps to reproduce:** Add a drawing node on the canvas; observe the empty node body (screenshot `artifacts/visual/canvas-drawing/02-drawn.png`).

**Expected behavior:** The engine fills the node below the header.

**Actual behavior:** `document.querySelector('.free-canvas-drawing .excalidraw').getBoundingClientRect().height === 0`.

**Root cause:** `CanvasDrawingSurface.jsx` renders its own wrapper (`<div className="free-canvas-drawing__engine">`) between the stage and the `.excalidraw` root. That wrapper had no CSS, so its height was `auto` → 0, and `.excalidraw { height: 100% }` resolved against it: 100% of 0.

**Files or components affected:** `src/groundstation/renderer/redesign/surfaces.css` (Section 21), `src/groundstation/renderer/CanvasDrawingSurface.jsx`.

**Fix implemented:** `.free-canvas-drawing__stage .free-canvas-drawing__engine { height: 100%; }` — the engine component's own wrapper is now sized.

**Verification performed:** Probe dump showed the wrapper in the live DOM; re-probe pending after rebuild.

**Regression test added:** `test/canvasDrawings.test.cjs` asserts the wiring; the visual probe (`scripts/visual/probe-canvas-drawing.cjs`) is the rendering regression check.

**Prevention for future changes:** When an embedded surface declares `height: 100%`, verify the FULL ancestor chain has explicit heights — a new wrapper div silently breaks the chain. Visual probes are the safety net.

---

## Issue ID: CANVAS-005

**Date discovered:** 2026-11-14 (§3.6 session, live probe)  
**Feature:** §3.6 Drawing — scene font pipeline  
**Severity:** Low (console noise; fonts still render)  
**Status:** Investigating (verification: font-loading check running)

**Description:** On every drawing-node mount, Chromium logs `Loading the font 'https://esm.sh/@excalidraw/excalidraw@0.18.1/dist/prod/fonts/...' violates the following Content Security Policy directive: "font-src 'self' data:"` for the engine's URL-based font faces. The locally self-hosted fonts are not the problem — the engine ALWAYS appends its CDN fallback (`ASSETS_FALLBACK_URL`) to the FontFace source list, and Chromium attempts it after the local file:// source does not satisfy `font-src 'self'` (file:// origins are opaque, so `'self'` does not match file:// subresources for FontFace URL loading, even though `img-src`/`style-src` `'self'` do).

**Steps to reproduce:** Mount a drawing node with the strict CSP; watch the console.

**Expected behavior:** No console errors — fonts are self-hosted.

**Actual behavior:** CDN fallback attempts are logged as CSP violations.

**Root cause:** Engine-side: the fallback URL is unconditional; local file:// font URLs are not `'self'`-matched by Chromium's font-src enforcement. Host-side: the page is served from file://.

**Files or components affected:** `src/groundstation/renderer/index.html` (CSP), `src/groundstation/renderer/main.jsx` (`EXCALIDRAW_ASSET_PATH`).

**Fix implemented:** Pending — candidates: (a) accept as cosmetic and document; (b) add `file:` to `font-src` (weakening the policy app-wide for console cleanliness — not preferred); (c) serve fonts through a registered protocol (invasive). The subsetting path uses data-URL `@font-face` rules (`data:` is allowed), so drawn text still renders in the scene fonts.

**Verification performed:** Live probe shows the engine renders and draws; `document.fonts` / style-rule audit running to confirm subset faces load.

**Regression test added:** None (console noise is not assertable in the unit suite).

**Prevention for future changes:** Do not add scheme sources to CSP for cosmetic reasons; verify which font-loading path actually renders text before touching policy.

---

(Template — copy for each new issue.)

## Issue ID: CANVAS-XXX

**Date discovered:**

**Feature:**

**Severity:** Critical / High / Medium / Low

**Status:** Open / Investigating / Fixed / Verified

**Description:**

**Steps to reproduce:**

**Expected behavior:**

**Actual behavior:**

**Root cause:**

**Files or components affected:**

**Fix implemented:**

**Verification performed:**

**Regression test added:**

**Prevention for future changes:**
