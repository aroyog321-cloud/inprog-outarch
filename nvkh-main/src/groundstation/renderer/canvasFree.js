import React from "react";

// §19.6 Canvas v1 — the free canvas: free x/y positioning, pan and zoom on top
// of the existing mosaic (A19.6.1). It is not a new tile system: the canvas
// keeps the mosaic's worker set, so every mounted pane stays the same mounted
// xterm and is never remounted (A19.5.2a). Free positioning is done by giving
// the already-mounted panes absolute screen rectangles instead of grid cells —
// the mosaic's CSS grid is left exactly as it is (its display is locked, and
// absolutely positioned children leave grid flow anyway), and the grid's own
// overflow clip becomes the canvas viewport.
//
// Two contracts shape everything below:
//
// - A19.6.4 persistence: device-local geometry in localStorage only. The doc
//   is whitelisted field by field on read, so a stale or tampered entry can
//   never inject anything but numbers and note text. No credentials, no
//   transcripts, no cloud sync.
// - A19.6.5 budgets: pan and zoom are pure arithmetic over the viewport (the
//   same visual result as a transform container, without fighting the locked
//   grid display), zoom is clamped to 0.25–2, notes are capped, and off-screen
//   nodes drop out of paint via `visibility` while the engine keeps owning
//   their processes. Engine-side write pausing for hidden panes stays with the
//   main process (A19.6.3) and is not a renderer concern.

const DOC_VERSION = 1;

export const FREE_CANVAS_PREFIX = "mission-control:canvas-free:v1:";
// Canvas coordinates snap to this grid while dragging; keyboard nudges step by it.
export const FREE_CANVAS_GRID = 20;
export const FREE_CANVAS_MIN_ZOOM = 0.25;
export const FREE_CANVAS_MAX_ZOOM = 2;
// A node may never become unreadable, whatever a stale doc says.
export const FREE_NODE_MIN_W = 240;
export const FREE_NODE_MIN_H = 160;
export const FREE_NODE_MAX_W = 4000;
export const FREE_NODE_MAX_H = 4000;
export const FREE_NOTE_MIN_W = 180;
export const FREE_NOTE_MIN_H = 100;
export const MAX_CANVAS_NOTES = 20;
export const MAX_CANVAS_WIRES = 64;
// §19.6.3 — native application nodes.
export const MAX_CANVAS_APPS = 8;
export const FREE_APP_MIN_W = 320;
export const FREE_APP_MIN_H = 220;
export const MAX_NOTE_CHARS = 2000;

// §3.6 — drawing nodes. Six drawings is a deliberate ceiling: each surface
// holds a full Excalidraw engine instance, so an unbounded count would let
// memory grow silently. The scene cap bounds persistence, not the engine —
// a scene that refuses to fit is rejected with a visible toast (App.jsx),
// never truncated in place.
export const MAX_CANVAS_DRAWINGS = 6;
export const FREE_DRAWING_MIN_W = 380;
export const FREE_DRAWING_MIN_H = 300;
export const MAX_DRAWING_ELEMENTS = 2000;
export const MAX_DRAWING_FILES = 64;
export const MAX_DRAWING_SCENE_CHARS = 1200000;
// Reserved geometry ids for the browser and assistant tiles. A `@` cannot
// collide with an engine worker id.
export const BROWSER_NODE_ID = "@browser";
export const ASSISTANT_NODE_ID = "@assistant";
const COORD_LIMIT = 50000;

export function portScreenPos(screenRect, port = "e") {
  const r = screenRect || { left: 0, top: 0, width: 0, height: 0 };
  switch (port) {
    case "n": return { x: r.left + r.width / 2, y: r.top };
    case "s": return { x: r.left + r.width / 2, y: r.top + r.height };
    case "w": return { x: r.left, y: r.top + r.height / 2 };
    case "e":
    default:
      return { x: r.left + r.width, y: r.top + r.height / 2 };
  }
}

export function bezierWirePath(p1, port1 = "e", p2, port2 = "w") {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  // The bow is a fraction of the span and is capped, so a wire between two
  // distant nodes reads as a connection and not as a loop thrown over the
  // canvas.
  const curvature = Math.max(24, Math.min(110, Math.max(dx, dy) * 0.22));
  let cp1x = p1.x;
  let cp1y = p1.y;
  let cp2x = p2.x;
  let cp2y = p2.y;

  if (port1 === "e") cp1x += curvature;
  else if (port1 === "w") cp1x -= curvature;
  else if (port1 === "s") cp1y += curvature;
  else if (port1 === "n") cp1y -= curvature;

  if (port2 === "e") cp2x += curvature;
  else if (port2 === "w") cp2x -= curvature;
  else if (port2 === "s") cp2y += curvature;
  else if (port2 === "n") cp2y -= curvature;

  return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
}

function clampNumber(value, fallback, low, high) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(high, Math.max(low, number));
}

// A rectangle from the doc is untrusted: it outlives releases. Anything that
// is not a finite number falls back, and everything is clamped.
export function clampRect(rect) {
  const source = rect && typeof rect === "object" ? rect : {};
  return {
    x: clampNumber(source.x, 0, -COORD_LIMIT, COORD_LIMIT),
    y: clampNumber(source.y, 0, -COORD_LIMIT, COORD_LIMIT),
    w: clampNumber(source.w, 640, FREE_NODE_MIN_W, FREE_NODE_MAX_W),
    h: clampNumber(source.h, 420, FREE_NODE_MIN_H, FREE_NODE_MAX_H)
  };
}

// A node that has never been placed cascades from the canvas origin, so a
// fresh canvas is already a readable grid instead of a pile at (0,0).
export function defaultRect(index, cols = 3) {
  const position = Math.max(0, Math.floor(Number(index) || 0));
  return {
    x: 40 + (position % cols) * 680,
    y: 40 + Math.floor(position / cols) * 460,
    w: 640,
    h: 420
  };
}

export function snapValue(value, grid = FREE_CANVAS_GRID) {
  const step = Number(grid) > 0 ? Number(grid) : FREE_CANVAS_GRID;
  return Math.round(value / step) * step;
}

export function panViewport(viewport, dx, dy) {
  const source = viewport && typeof viewport === "object" ? viewport : { x: 0, y: 0, z: 1 };
  return {
    x: clampNumber(source.x + dx, 0, -COORD_LIMIT, COORD_LIMIT),
    y: clampNumber(source.y + dy, 0, -COORD_LIMIT, COORD_LIMIT),
    z: clampNumber(source.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM)
  };
}

// Zoom keeps the canvas point under the anchor fixed: screen = canvas * z + pan,
// so the anchor's canvas point must land on the same screen point at the new z.
export function zoomViewport(viewport, factor, anchorX = 0, anchorY = 0) {
  const source = viewport && typeof viewport === "object" ? viewport : { x: 0, y: 0, z: 1 };
  const requested = clampNumber(source.z * factor, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM);
  if (requested === source.z) return source;
  const applied = requested / source.z;
  return {
    x: clampNumber(anchorX - (anchorX - source.x) * applied, 0, -COORD_LIMIT, COORD_LIMIT),
    y: clampNumber(anchorY - (anchorY - source.y) * applied, 0, -COORD_LIMIT, COORD_LIMIT),
    z: requested
  };
}

// Where a canvas rectangle lands on screen right now.
export function nodeScreenRect(rect, viewport) {
  const source = rect && typeof rect === "object" ? rect : { x: 0, y: 0, w: 0, h: 0 };
  const view = viewport && typeof viewport === "object" ? viewport : { x: 0, y: 0, z: 1 };
  const zoom = clampNumber(view.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM);
  return {
    left: source.x * zoom + view.x,
    top: source.y * zoom + view.y,
    width: source.w * zoom,
    height: source.h * zoom
  };
}

// A node fully outside the viewport drops out of paint. An unmeasured stage
// (width 0) is treated as infinitely large so nothing is hidden by mistake.
export function rectVisible(screen, stage) {
  const size = stage && typeof stage === "object" ? stage : { w: 0, h: 0 };
  if (!(Number(size.w) > 0) || !(Number(size.h) > 0)) return true;
  return screen.left < size.w && screen.top < size.h
    && screen.left + screen.width > 0 && screen.top + screen.height > 0;
}

// The inline style a canvas node carries.
//
// Width and height are the node's ON SCREEN size (canvas units × zoom), and
// there is no CSS transform. xterm's fit addon measures the layout box it is
// given, so a scaled pane would keep the columns and rows it had at the old
// size and render its text too small — the symptom of "the terminal shrank
// but the text inside did not". Sizing the box itself lets the terminal
// reflow to what the operator actually sees.
export function freePaneStyle(rect, viewport, visible = true, zIndex = 10) {
  const screen = nodeScreenRect(rect, viewport);
  const style = {
    position: "absolute",
    left: `${Math.round(screen.left)}px`,
    top: `${Math.round(screen.top)}px`,
    width: `${Math.round(screen.width)}px`,
    height: `${Math.round(screen.height)}px`,
    zIndex
  };
  if (!visible) style.visibility = "hidden";
  return style;
}

// The doc is whitelisted field by field: version, mode, viewport, node
// rectangles and note text. Nothing else survives the read, so a stale or
// tampered entry can never smuggle credentials, transcripts or code.
export function normalizeFreeCanvasDoc(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const view = source.viewport && typeof source.viewport === "object" ? source.viewport : {};
  const nodes = {};
  if (source.nodes && typeof source.nodes === "object") {
    for (const [id, rect] of Object.entries(source.nodes)) {
      if (typeof id !== "string" || id.length > 80 || !id) continue;
      if (Object.keys(nodes).length >= 64) break;
      nodes[id] = clampRect(rect);
    }
  }
  const notes = [];
  if (Array.isArray(source.notes)) {
    for (const note of source.notes) {
      if (notes.length >= MAX_CANVAS_NOTES) break;
      if (!note || typeof note !== "object") continue;
      const id = typeof note.id === "string" ? note.id.slice(0, 64) : "";
      if (!id) continue;
      const rect = clampRect({ w: 320, h: 200, ...note });
      notes.push({
        id,
        x: rect.x,
        y: rect.y,
        w: Math.max(FREE_NOTE_MIN_W, Math.min(FREE_NODE_MAX_W, rect.w)),
        h: Math.max(FREE_NOTE_MIN_H, Math.min(FREE_NODE_MAX_H, rect.h)),
        content: typeof note.content === "string" ? note.content.slice(0, MAX_NOTE_CHARS) : ""
      });
    }
  }
  const wires = [];
  if (Array.isArray(source.wires)) {
    for (const wire of source.wires) {
      if (wires.length >= MAX_CANVAS_WIRES) break;
      if (!wire || typeof wire !== "object") continue;
      const id = typeof wire.id === "string" ? wire.id.slice(0, 64) : "";
      const fromNode = typeof wire.fromNode === "string" ? wire.fromNode.slice(0, 80) : "";
      const toNode = typeof wire.toNode === "string" ? wire.toNode.slice(0, 80) : "";
      const fromPort = ["n", "s", "e", "w"].includes(wire.fromPort) ? wire.fromPort : "e";
      const toPort = ["n", "s", "e", "w"].includes(wire.toPort) ? wire.toPort : "w";
      if (!id || !fromNode || !toNode || fromNode === toNode) continue;
      wires.push({ id, fromNode, toNode, fromPort, toPort });
    }
  }
  const validBackdrops = ["scenic", "dotgrid", "blueprint", "crosshatch"];
  const backdrop = validBackdrops.includes(source.backdrop) ? source.backdrop : "scenic";
  // §19.6.3 — native application nodes. The doc holds only what the node
  // needs to draw itself and to ask for its window again: an id, the command
  // that started it, and the rectangle it sits in. The window handle lives in
  // the main process and never reaches the renderer.
  const apps = [];
  if (Array.isArray(source.apps)) {
    for (const app of source.apps) {
      if (apps.length >= MAX_CANVAS_APPS) break;
      if (!app || typeof app !== "object") continue;
      const id = typeof app.id === "string" ? app.id.slice(0, 64) : "";
      const command = typeof app.command === "string" ? app.command.slice(0, 120) : "";
      if (!id || !command) continue;
      const rect = clampRect({ w: 520, h: 340, ...app });
      apps.push({
        id,
        command,
        title: typeof app.title === "string" ? app.title.slice(0, 160) : command,
        state: ["running", "launching", "closed", "unavailable"].includes(app.state) ? app.state : "launching",
        x: rect.x,
        y: rect.y,
        w: Math.max(FREE_APP_MIN_W, Math.min(FREE_NODE_MAX_W, rect.w)),
        h: Math.max(FREE_APP_MIN_H, Math.min(FREE_NODE_MAX_H, rect.h))
      });
    }
  }
  // §3.6 — drawing nodes. Scene data is whitelisted and size-capped above;
  // geometry is clamped like every other node kind. Drawings are NOT
  // session-bound, so pruneFreeCanvasDoc never touches them.
  const drawings = [];
  if (Array.isArray(source.drawings)) {
    for (const drawing of source.drawings) {
      if (drawings.length >= MAX_CANVAS_DRAWINGS) break;
      if (!drawing || typeof drawing !== "object") continue;
      const id = typeof drawing.id === "string" ? drawing.id.slice(0, 64) : "";
      if (!id) continue;
      const rect = clampRect({ w: 520, h: 380, ...drawing });
      const scene = normalizeDrawingScene(drawing.scene);
      drawings.push({
        id,
        title: typeof drawing.title === "string" ? drawing.title.slice(0, 160) : "Drawing",
        x: rect.x,
        y: rect.y,
        w: Math.max(FREE_DRAWING_MIN_W, Math.min(FREE_NODE_MAX_W, rect.w)),
        h: Math.max(FREE_DRAWING_MIN_H, Math.min(FREE_NODE_MAX_H, rect.h)),
        scene: drawingSceneFits(scene) ? scene : { elements: [], files: {} }
      });
    }
  }
  return {
    version: DOC_VERSION,
    mode: source.mode === "canvas" ? "canvas" : "grid",
    backdrop,
    viewport: {
      x: clampNumber(view.x, 0, -COORD_LIMIT, COORD_LIMIT),
      y: clampNumber(view.y, 0, -COORD_LIMIT, COORD_LIMIT),
      z: clampNumber(view.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM)
    },
    nodes,
    notes,
    wires,
    apps,
    drawings
  };
}

// §3.6 — a drawing's scene is raw Excalidraw data, stored under an explicit
// whitelist: an elements array of plain objects and a files map of data-URL
// strings. Restoration through the engine's own restore() re-normalizes each
// element, so the exact array onChange emitted is directly re-usable here.
// Oversized or tampered scenes restore as empty drawings — visible, honest,
// and never a crash.
function normalizeDrawingScene(scene) {
  if (!scene || typeof scene !== "object") return { elements: [], files: {} };
  let elements = Array.isArray(scene.elements)
    ? scene.elements.filter(element => element && typeof element === "object" && typeof element.id === "string")
    : [];
  if (elements.length > MAX_DRAWING_ELEMENTS) elements = elements.slice(0, MAX_DRAWING_ELEMENTS);
  const files = {};
  if (scene.files && typeof scene.files === "object") {
    for (const [id, value] of Object.entries(scene.files)) {
      if (Object.keys(files).length >= MAX_DRAWING_FILES) break;
      if (typeof id !== "string" || !id || id.length > 128) continue;
      if (typeof value !== "string") continue;
      files[id] = value;
    }
  }
  return { elements, files };
}

// The whole scene must stringify under the cap. This runs on restore and on
// every persisted write, so the budget is enforced before storage ever sees
// the data (§7: validate stored data before restoration).
function drawingSceneFits(scene) {
  try {
    return JSON.stringify(scene).length <= MAX_DRAWING_SCENE_CHARS;
  } catch {
    return false; // A scene that cannot serialize cannot be persisted.
  }
}

function safeStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  } catch { /* A denied storage partition leaves the doc in memory. */ }
  return null;
}

export function readFreeCanvasDoc(storage, key) {
  if (!storage) return normalizeFreeCanvasDoc(null);
  try {
    return normalizeFreeCanvasDoc(JSON.parse(storage.getItem(key) || "null"));
  } catch {
    return normalizeFreeCanvasDoc(null);
  }
}

export function writeFreeCanvasDoc(storage, key, doc) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(normalizeFreeCanvasDoc(doc)));
    return true;
  } catch {
    return false; // Quota or a denied partition: the session keeps working.
  }
}

// Drop geometry for workers that no longer exist. Reserved ids stay, so the
// browser's place survives closing and reopening it. A transient empty
// session list (a project switching) never prunes anything.
export function pruneFreeCanvasDoc(doc, sessions) {
  if (!sessions || sessions.length === 0) return doc;
  const live = new Set(sessions.map(session => session?.id).filter(Boolean));
  const nodes = doc.nodes;
  const stale = Object.keys(nodes).filter(id => !live.has(id) && id !== BROWSER_NODE_ID && id !== ASSISTANT_NODE_ID);
  if (!stale.length) return doc;
  const next = { ...doc, nodes: { ...nodes } };
  for (const id of stale) delete next.nodes[id];
  return next;
}

// The free-canvas state for one workspace: the persisted doc (mode, viewport,
// node rectangles, notes), live viewport operations, and the pointer/keyboard
// interaction engine for node chrome. Dragging is rAF-throttled and computed
// from the rectangle captured at drag start, so snapping never drifts.
export function useFreeCanvas(workspaceKey, { sessions = [], stageRef = null } = {}) {
  const storageKey = FREE_CANVAS_PREFIX + (workspaceKey || "default");
  const storage = safeStorage();
  const [doc, setDoc] = React.useState(() => readFreeCanvasDoc(storage, storageKey));
  const docRef = React.useRef(doc);
  const keyRef = React.useRef(storageKey);
  docRef.current = doc;
  keyRef.current = storageKey;
  const viewportRef = React.useRef(doc.viewport);
  viewportRef.current = doc.viewport;
  const [stageSize, setStageSize] = React.useState({ w: 0, h: 0 });

  // Follow the workspace: each workspace owns its own arrangement.
  React.useEffect(() => {
    setDoc(readFreeCanvasDoc(storage, storageKey));
  }, [storage, storageKey]);

  // Device-local persistence, debounced while interacting and flushed when
  // the workspace changes or the view unmounts.
  React.useEffect(() => {
    if (!storage) return undefined;
    const timer = window.setTimeout(() => writeFreeCanvasDoc(storage, keyRef.current, docRef.current), 300);
    return () => window.clearTimeout(timer);
  }, [doc, storage]);

  React.useEffect(() => () => {
    if (storage) writeFreeCanvasDoc(storage, keyRef.current, docRef.current);
  }, [storage]);

  // Geometry for workers that left the canvas is dropped; nothing else.
  React.useEffect(() => {
    setDoc(current => pruneFreeCanvasDoc(current, sessions));
  }, [sessions]);

  // The viewport clip is measured for off-screen pausing and default placement.
  React.useEffect(() => {
    const stage = stageRef?.current;
    if (!stage || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => setStageSize({ w: stage.clientWidth, h: stage.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    return () => observer.disconnect();
  }, [stageRef, doc.mode === "canvas"]);

  const active = doc.mode === "canvas";

  const toggleMode = React.useCallback(() => {
    setDoc(current => ({ ...current, mode: current.mode === "canvas" ? "grid" : "canvas" }));
  }, []);
  const exitCanvas = React.useCallback(() => {
    setDoc(current => (current.mode === "canvas" ? { ...current, mode: "grid" } : current));
  }, []);

  const rectFor = React.useCallback((id, index = 0) => {
    return docRef.current.nodes[id] || defaultRect(index);
  }, []);

  const zoomAt = React.useCallback((factor, anchorX = 0, anchorY = 0) => {
    setDoc(current => ({ ...current, viewport: zoomViewport(current.viewport, factor, anchorX, anchorY) }));
  }, []);

  const panBy = React.useCallback((dx, dy) => {
    setDoc(current => ({ ...current, viewport: panViewport(current.viewport, dx, dy) }));
  }, []);

  const resetView = React.useCallback(() => {
    setDoc(current => ({ ...current, viewport: { x: 0, y: 0, z: 1 } }));
  }, []);

  // One drag engine for every node kind: worker panes, the browser, the
  // assistant and notes. `origin` is the rectangle captured at pointerdown;
  // every frame recomputes from it, so a snapped drag never accumulates error.
  const startDrag = React.useCallback((type, id, kind, origin, event) => {
    if (!event || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    let frame = 0;
    let latest = null;
    const apply = () => {
      frame = 0;
      if (!latest) return;
      const zoom = clampNumber(viewportRef.current.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM);
      const dx = (latest.clientX - startX) / zoom;
      const dy = (latest.clientY - startY) / zoom;
      setDoc(current => {
        if (type === "note") {
          const notes = current.notes;
          const index = notes.findIndex(note => note.id === id);
          if (index < 0) return current;
          // dx/dy are measured from the drag-start pointer, so origin is always
          // the base — using the previous frame's rect would double-count.
          const base = origin;
          const next = kind === "resize"
            ? { ...base, w: clampNumber(snapValue(base.w + dx), base.w, FREE_NOTE_MIN_W, FREE_NODE_MAX_W), h: clampNumber(snapValue(base.h + dy), base.h, FREE_NOTE_MIN_H, FREE_NODE_MAX_H) }
            : { ...base, x: clampNumber(snapValue(base.x + dx), base.x, -COORD_LIMIT, COORD_LIMIT), y: clampNumber(snapValue(base.y + dy), base.y, -COORD_LIMIT, COORD_LIMIT) };
          if (next === base) return current;
          const notesNext = notes.slice();
          notesNext[index] = next;
          return { ...current, notes: notesNext };
        }
        // §19.6.3 — an application node moves and resizes like any other node.
        if (type === "app") {
          const apps = current.apps || [];
          const index = apps.findIndex(app => app.id === id);
          if (index < 0) return current;
          const base = origin;
          if (!base) return current;
          const next = kind === "resize"
            ? { ...base, w: clampNumber(snapValue(base.w + dx), base.w, FREE_APP_MIN_W, FREE_NODE_MAX_W), h: clampNumber(snapValue(base.h + dy), base.h, FREE_APP_MIN_H, FREE_NODE_MAX_H) }
            : { ...base, x: clampNumber(snapValue(base.x + dx), base.x, -COORD_LIMIT, COORD_LIMIT), y: clampNumber(snapValue(base.y + dy), base.y, -COORD_LIMIT, COORD_LIMIT) };
          if (next.x === base.x && next.y === base.y && next.w === base.w && next.h === base.h) return current;
          const appsNext = apps.slice();
          appsNext[index] = next;
          return { ...current, apps: appsNext };
        }
        // §3.6 — a drawing node moves and resizes like any other node; the
        // scene rides along untouched (only geometry changes).
        if (type === "drawing") {
          const drawings = current.drawings || [];
          const index = drawings.findIndex(drawing => drawing.id === id);
          if (index < 0) return current;
          const base = origin;
          if (!base) return current;
          const next = kind === "resize"
            ? { ...base, w: clampNumber(snapValue(base.w + dx), base.w, FREE_DRAWING_MIN_W, FREE_NODE_MAX_W), h: clampNumber(snapValue(base.h + dy), base.h, FREE_DRAWING_MIN_H, FREE_NODE_MAX_H) }
            : { ...base, x: clampNumber(snapValue(base.x + dx), base.x, -COORD_LIMIT, COORD_LIMIT), y: clampNumber(snapValue(base.y + dy), base.y, -COORD_LIMIT, COORD_LIMIT) };
          if (next.x === base.x && next.y === base.y && next.w === base.w && next.h === base.h) return current;
          const drawingsNext = drawings.slice();
          drawingsNext[index] = next;
          return { ...current, drawings: drawingsNext };
        }
        // dx/dy are measured from the drag-start pointer, so origin is always
        // the base — using the previous frame's rect would double-count.
        const base = origin;
        if (!base) return current;
        const next = kind === "resize"
          ? { ...base, w: clampNumber(snapValue(base.w + dx), base.w, FREE_NODE_MIN_W, FREE_NODE_MAX_W), h: clampNumber(snapValue(base.h + dy), base.h, FREE_NODE_MIN_H, FREE_NODE_MAX_H) }
          : { ...base, x: clampNumber(snapValue(base.x + dx), base.x, -COORD_LIMIT, COORD_LIMIT), y: clampNumber(snapValue(base.y + dy), base.y, -COORD_LIMIT, COORD_LIMIT) };
        if (next.x === base.x && next.y === base.y && next.w === base.w && next.h === base.h) return current;
        return { ...current, nodes: { ...current.nodes, [id]: next } };
      });
    };
    const onMove = moveEvent => {
      latest = moveEvent;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const onEnd = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      latest = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }, []);

  // Keyboard nudges step by the snap grid, so a node moved by keys lands
  // exactly where a dragged node would.
  const nudge = React.useCallback((type, id, event) => {
    if (!event) return;
    const key = event.key;
    if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowDown") return;
    event.preventDefault();
    const dx = key === "ArrowLeft" ? -FREE_CANVAS_GRID : key === "ArrowRight" ? FREE_CANVAS_GRID : 0;
    const dy = key === "ArrowUp" ? -FREE_CANVAS_GRID : key === "ArrowDown" ? FREE_CANVAS_GRID : 0;
    setDoc(current => {
      if (type === "note") {
        const notes = current.notes;
        const index = notes.findIndex(note => note.id === id);
        if (index < 0) return current;
        const base = notes[index];
        const next = { ...base, x: base.x + dx, y: base.y + dy };
        const notesNext = notes.slice();
        notesNext[index] = next;
        return { ...current, notes: notesNext };
      }
      // §19.6.3 — an application node nudges like any other node.
      if (type === "app") {
        const apps = current.apps || [];
        const index = apps.findIndex(app => app.id === id);
        if (index < 0) return current;
        const base = apps[index];
        const appsNext = apps.slice();
        appsNext[index] = { ...base, x: base.x + dx, y: base.y + dy };
        return { ...current, apps: appsNext };
      }
      // §3.6 — a drawing node nudges like any other node.
      if (type === "drawing") {
        const drawings = current.drawings || [];
        const index = drawings.findIndex(drawing => drawing.id === id);
        if (index < 0) return current;
        const base = drawings[index];
        const drawingsNext = drawings.slice();
        drawingsNext[index] = { ...base, x: base.x + dx, y: base.y + dy };
        return { ...current, drawings: drawingsNext };
      }
      const base = current.nodes[id];
      if (!base) return current;
      return { ...current, nodes: { ...current.nodes, [id]: { ...base, x: base.x + dx, y: base.y + dy } } };
    });
  }, []);

  const addNote = React.useCallback(() => {
    setDoc(current => {
      if (current.notes.length >= MAX_CANVAS_NOTES) return current;
      const zoom = clampNumber(current.viewport.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM);
      const offset = current.notes.length * 40;
      const note = {
        id: `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        x: snapValue(-current.viewport.x / zoom + 60 + offset),
        y: snapValue(-current.viewport.y / zoom + 60 + offset),
        w: 320,
        h: 200,
        content: ""
      };
      return { ...current, notes: [...current.notes, note] };
    });
  }, []);

  const setNoteContent = React.useCallback((id, content) => {
    setDoc(current => {
      const index = current.notes.findIndex(note => note.id === id);
      if (index < 0) return current;
      const text = String(content || "").slice(0, MAX_NOTE_CHARS);
      if (current.notes[index].content === text) return current;
      const notes = current.notes.slice();
      notes[index] = { ...notes[index], content: text };
      return { ...current, notes };
    });
  }, []);

  const removeNote = React.useCallback((id) => {
    setDoc(current => ({ ...current, notes: current.notes.filter(note => note.id !== id) }));
  }, []);

  // §19.6.3 — native application nodes. The renderer records that an
  // application belongs on the canvas and where it sits; the main process
  // owns the window itself.
  const addAppNode = React.useCallback((app) => {
    const id = typeof app?.id === "string" && app.id ? app.id : `app-node-${Date.now().toString(36)}`;
    const command = String(app?.command || "").trim();
    if (!command) return null;
    setDoc(current => {
      const apps = current.apps || [];
      if (apps.length >= MAX_CANVAS_APPS) return current;
      const rect = clampRect({ w: 520, h: 340, ...(app?.rect || {}) });
      const next = {
        id,
        command,
        title: String(app?.title || command).slice(0, 160),
        state: app?.state === "running" ? "running" : "launching",
        x: rect.x,
        y: rect.y,
        w: Math.max(FREE_APP_MIN_W, Math.min(FREE_NODE_MAX_W, rect.w)),
        h: Math.max(FREE_APP_MIN_H, Math.min(FREE_NODE_MAX_H, rect.h))
      };
      return { ...current, apps: [...apps.filter(item => item.id !== id), next] };
    });
    return id;
  }, []);

  const updateAppNode = React.useCallback((id, patch) => {
    setDoc(current => {
      const apps = current.apps || [];
      const index = apps.findIndex(app => app.id === id);
      if (index < 0) return current;
      const next = apps.slice();
      next[index] = { ...next[index], ...patch, id: next[index].id };
      return { ...current, apps: next };
    });
  }, []);

  const removeAppNode = React.useCallback((id) => {
    setDoc(current => ({ ...current, apps: (current.apps || []).filter(app => app.id !== id) }));
  }, []);

  // §3.6 — drawing nodes. Creation cascades like a note: offset by 40px per
  // existing drawing so consecutive additions are visibly separate.
  const addDrawing = React.useCallback(() => {
    let created = null;
    setDoc(current => {
      const existing = current.drawings || [];
      if (existing.length >= MAX_CANVAS_DRAWINGS) return current;
      const zoom = clampNumber(current.viewport.z, 1, FREE_CANVAS_MIN_ZOOM, FREE_CANVAS_MAX_ZOOM);
      const offset = existing.length * 40;
      const rect = clampRect({
        w: 520,
        h: 380,
        x: snapValue(-current.viewport.x / zoom + 80 + offset),
        y: snapValue(-current.viewport.y / zoom + 80 + offset)
      });
      created = {
        id: `drawing-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        title: `Drawing ${existing.length + 1}`,
        x: rect.x,
        y: rect.y,
        w: Math.max(FREE_DRAWING_MIN_W, Math.min(FREE_NODE_MAX_W, rect.w)),
        h: Math.max(FREE_DRAWING_MIN_H, Math.min(FREE_NODE_MAX_H, rect.h)),
        scene: { elements: [], files: {} }
      };
      return { ...current, drawings: [...existing, created] };
    });
    return created;
  }, []);

  // A debounced scene write from App.jsx. Acceptance is computed synchronously
  // (a setDoc updater may run after this returns), so a scene over the §3.6
  // budget is refused before it ever reaches the doc, and the host can surface
  // an honest rejection toast.
  const setDrawingScene = React.useCallback((id, scene) => {
    const next = normalizeDrawingScene(scene);
    if (!drawingSceneFits(next)) return false;
    setDoc(current => {
      const drawings = current.drawings || [];
      const index = drawings.findIndex(drawing => drawing.id === id);
      if (index < 0) return current;
      const drawingsNext = drawings.slice();
      drawingsNext[index] = { ...drawings[index], scene: next };
      return { ...current, drawings: drawingsNext };
    });
    return true;
  }, []);

  const removeDrawing = React.useCallback((id) => {
    setDoc(current => ({ ...current, drawings: (current.drawings || []).filter(drawing => drawing.id !== id) }));
  }, []);

  // §3.6 — a synchronous scene write for the moment React state updates stop
  // being honoured: unmount. The host debounces scene writes for interactivity;
  // whatever is still pending when the view goes away merges into docRef
  // directly and is written to storage immediately. Returning false means the
  // scene genuinely could not be kept (unknown id, over budget) — never a
  // silent drop.
  const flushDrawingScene = React.useCallback((id, scene) => {
    const current = docRef.current;
    if (!current || !Array.isArray(current.drawings) || !current.drawings.some(drawing => drawing.id === id)) return false;
    const next = normalizeDrawingScene(scene);
    if (!drawingSceneFits(next)) return false;
    const merged = {
      ...current,
      drawings: current.drawings.map(drawing => (drawing.id === id ? { ...drawing, scene: next } : drawing))
    };
    docRef.current = merged;
    return writeFreeCanvasDoc(storage, keyRef.current, merged);
  }, [storage]);

  const addWire = React.useCallback((fromNode, fromPort, toNode, toPort) => {
    if (!fromNode || !toNode || fromNode === toNode) return;
    setDoc(current => {
      const wires = current.wires || [];
      if (wires.length >= MAX_CANVAS_WIRES) return current;
      // Prevent duplicate exact wire
      if (wires.some(w => w.fromNode === fromNode && w.toNode === toNode && w.fromPort === fromPort && w.toPort === toPort)) {
        return current;
      }
      const newWire = {
        id: `wire-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        fromNode,
        fromPort,
        toNode,
        toPort
      };
      return { ...current, wires: [...wires, newWire] };
    });
  }, []);

  const removeWire = React.useCallback((wireId) => {
    setDoc(current => ({ ...current, wires: (current.wires || []).filter(w => w.id !== wireId) }));
  }, []);

  const setBackdrop = React.useCallback((backdrop) => {
    const valid = ["scenic", "dotgrid", "blueprint", "crosshatch"];
    if (!valid.includes(backdrop)) return;
    setDoc(current => ({ ...current, backdrop }));
  }, []);

  const arrangeCanvas = React.useCallback(() => {
    setDoc(current => {
      // Every node kind on the canvas is arranged, not just the workers: the
      // browser and the assistant keep their reserved ids, and the notes go in
      // a column beside the grid. Leaving them where they were stacked them
      // on top of the arrangement.
      const workers = sessions.map(s => s.id);
      const reserved = Object.keys(current.nodes || {}).filter(id => id.startsWith("@"));
      const all = [...workers, ...reserved];
      const cols = Math.max(2, Math.ceil(Math.sqrt(all.length * 1.5)));
      const nextNodes = { ...current.nodes };
      all.forEach((id, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        nextNodes[id] = {
          x: 40 + col * 720,
          y: 60 + row * 480,
          w: 660,
          h: 440
        };
      });
      const nextNotes = (current.notes || []).map((note, idx) => ({
        ...note,
        x: 40 + cols * 720,
        y: 60 + idx * 240
      }));
      // §3.6 — drawings join the notes column, below the notes, with their own
      // (larger) spacing so a resized drawing never overlaps its neighbour.
      const noteEnd = 60 + (current.notes || []).length * 240;
      const nextDrawings = (current.drawings || []).map((drawing, idx) => ({
        ...drawing,
        x: 40 + cols * 720,
        y: noteEnd + idx * 340
      }));
      return {
        ...current,
        // The operator's zoom is theirs: arranging moves the nodes and brings
        // the origin back into view, but it does not silently rescale the
        // canvas out from under them.
        viewport: { ...current.viewport, x: 30, y: 30 },
        nodes: nextNodes,
        notes: nextNotes,
        drawings: nextDrawings
      };
    });
  }, [sessions]);

  // Pan by dragging the canvas background, zoom on the wheel anchored at the
  // pointer, double-click to reset. Native listeners so the wheel can be
  // prevented (React wheel listeners are passive).
  React.useEffect(() => {
    const stage = stageRef?.current;
    if (!active || !stage) return undefined;
    const localPoint = event => {
      const bounds = stage.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const onWheel = event => {
      event.preventDefault();
      const point = localPoint(event);
      const factor = Math.min(1.5, Math.max(0.67, Math.exp(-event.deltaY * 0.0022)));
      zoomAt(factor, point.x, point.y);
    };
    let pan = null;
    let frame = 0;
    let latest = null;
    const flushPan = () => {
      frame = 0;
      if (!pan || !latest) return;
      panBy(latest.clientX - pan.x, latest.clientY - pan.y);
      pan = { x: latest.clientX, y: latest.clientY };
    };
    const onMove = moveEvent => {
      latest = moveEvent;
      if (!frame) frame = window.requestAnimationFrame(flushPan);
    };
    const onDown = downEvent => {
      const isBackdrop = downEvent.target === stage || downEvent.target.classList?.contains("free-canvas-backdrop") || downEvent.target.classList?.contains("free-canvas-layer");
      if (!isBackdrop || downEvent.button !== 0) return;
      downEvent.preventDefault();
      pan = { x: downEvent.clientX, y: downEvent.clientY };
      stage.classList.add("is-panning");
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    const onUp = () => {
      pan = null;
      latest = null;
      stage.classList.remove("is-panning");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const onDoubleClick = () => resetView();
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("dblclick", onDoubleClick);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("dblclick", onDoubleClick);
      onUp();
    };
  }, [active, stageRef, zoomAt, panBy, resetView]);

  return {
    doc,
    active,
    viewport: doc.viewport,
    stageSize,
    toggleMode,
    exitCanvas,
    rectFor,
    zoomAt,
    panBy,
    resetView,
    startDrag,
    nudge,
    addNote,
    setNoteContent,
    removeNote,
    addAppNode,
    updateAppNode,
    removeAppNode,
    addDrawing,
    setDrawingScene,
    flushDrawingScene,
    removeDrawing,
    addWire,
    removeWire,
    setBackdrop,
    arrangeCanvas
  };
}
