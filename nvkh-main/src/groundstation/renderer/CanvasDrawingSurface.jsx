import React, { useMemo } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

/* §3.6 drawing & whiteboard engine.

   This component is the entire contact surface between OUTARCH and
   Excalidraw. It is loaded lazily (see App.jsx) so the ~2.8MB engine never
   touches app startup, and it owns nothing but the scene: geometry, chrome,
   persistence and workspace state all live in canvasFree.js and App.jsx.

   Boundary contract (master spec §5.6):
   - IN:  `scene` = { elements, files } — raw Excalidraw data, restored as-is.
     The engine's restore() normalizes partial elements, so the exact array
     this component previously emitted via onChange is directly reusable.
   - OUT: `onScene({ elements, files })` — fired on every engine interaction
     tick. App.jsx debounces persistence; appState (tool state) is deliberately
     dropped, it is not workspace state.

   Everything user-facing is constrained: keyboard shortcuts stay local to the
   surface (OUTARCH owns global keys), the scene menu is stripped to nothing
   because persistence is OUTARCH's job, and the viewport is locked so the
   canvas's own pan/zoom cannot fight the free-canvas viewport model. */

const DISABLED_CANVAS_ACTIONS = {
  loadScene: false,
  saveToActiveFile: false,
  export: false,
  saveAsImage: false,
  loadLibrary: false,
  toggleTheme: false
};

export default function CanvasDrawingSurface({ scene, onScene }) {
  // Mount-only: rebuilding initialData on every parent render would reset the
  // scene. Live scene updates flow through onChange only.
  const initialData = useMemo(
    () => ({
      elements: scene?.elements ?? [],
      files: scene?.files ?? {},
      appState: { viewBackgroundColor: "transparent" }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by design
    []
  );

  const handleChange = React.useCallback(
    (elements, _appState, files) => {
      onScene?.({ elements, files });
    },
    [onScene]
  );

  return (
    <div className="free-canvas-drawing__engine">
      <Excalidraw
        initialData={initialData}
        onChange={handleChange}
        theme="dark"
        // OUTARCH's free canvas owns pan/zoom and wheel gestures; the engine's
        // own scroll detection would fight the workspace viewport.
        detectScroll={false}
        // Drawing shortcuts must not swallow OUTARCH's global keys while the
        // surface is mounted but not focused.
        handleKeyboardGlobally={false}
        // Persistence is the Canvas's job (debounced doc writes); the engine's
        // own file/save/export menu is disabled wholesale.
        UIOptions={{ canvasActions: DISABLED_CANVAS_ACTIONS }}
      />
    </div>
  );
}
