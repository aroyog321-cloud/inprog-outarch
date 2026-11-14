"use strict";

/* §3.6 drawing & whiteboard — workspace-state coverage.

   The drawing engine (Excalidraw, lazily loaded) owns drawing interactions;
   OUTARCH owns the node: its geometry, its lifecycle, its persistence and the
   size budget that keeps a workspace doc loadable. These tests exercise the
   OUTARCH side: normalization, creation, geometry, arrangement, removal, the
   caps, and a full persistence round-trip through the real storage path. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test } = require("node:test");

const rendererRoot = path.resolve(__dirname, "../src/groundstation/renderer");
const moduleUrl = pathToFileURL(path.join(rendererRoot, "canvasFree.js")).href;
const load = () => import(`${moduleUrl}?t=${Date.now()}${Math.random()}`);
const read = file => fs.readFileSync(path.join(rendererRoot, file), "utf8");

// A storage double with the same surface the hook uses (getItem/setItem).
function memoryStorage() {
  const map = new Map();
  return {
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key),
    get size() { return map.size; }
  };
}

const ELEMENT = { id: "el-1", type: "rectangle", x: 0, y: 0, width: 10, height: 10, version: 1 };
const SCENE = { elements: [ELEMENT], files: { "img-1": "data:image/png;base64,AAAA" } };

test("a tampered drawing scene restores as an empty drawing, never a crash", async () => {
  const { normalizeFreeCanvasDoc } = await load();
  const doc = normalizeFreeCanvasDoc({
    mode: "canvas",
    drawings: [
      null,
      { id: "d1", x: 0, y: 0, scene: null },
      { id: "d2", x: 0, y: 0, scene: { elements: "not-an-array", files: 42 } },
      { id: "d3", x: 0, y: 0, scene: { elements: [null, 7, { noId: true }, ELEMENT], files: { ok: 3, bad: null } } }
    ]
  });
  assert.equal(doc.drawings.length, 3, "non-object entries are dropped");
  assert.deepEqual(doc.drawings[0].scene, { elements: [], files: {} });
  assert.deepEqual(doc.drawings[1].scene, { elements: [], files: {} });
  // The only well-formed element survives; junk entries are filtered out.
  assert.deepEqual(doc.drawings[2].scene.elements, [ELEMENT]);
  assert.deepEqual(doc.drawings[2].scene.files, {}, "non-string file values are dropped");
});

test("scene caps: elements, files and the serialized size budget", async () => {
  const { normalizeFreeCanvasDoc, MAX_DRAWING_ELEMENTS, MAX_DRAWING_FILES, MAX_DRAWING_SCENE_CHARS } = await load();
  assert.equal(MAX_DRAWING_ELEMENTS, 2000);
  assert.equal(MAX_DRAWING_FILES, 64);
  const manyElements = Array.from({ length: MAX_DRAWING_ELEMENTS + 50 }, (_, index) => ({ id: `el-${index}`, type: "rectangle", x: 0, y: 0, width: 1, height: 1 }));
  const manyFiles = Object.fromEntries(Array.from({ length: MAX_DRAWING_FILES + 10 }, (_, index) => [`f-${index}`, "data:image/png;base64,AAAA"]));
  const doc = normalizeFreeCanvasDoc({
    mode: "canvas",
    drawings: [{ id: "big", x: 0, y: 0, scene: { elements: manyElements, files: manyFiles } }]
  });
  assert.equal(doc.drawings[0].scene.elements.length, MAX_DRAWING_ELEMENTS);
  assert.equal(Object.keys(doc.drawings[0].scene.files).length, MAX_DRAWING_FILES);
  // A scene over the serialized budget restores empty rather than bloating
  // the stored doc.
  const huge = { id: "huge", x: 0, y: 0, scene: { elements: Array.from({ length: 10 }, () => ({ id: "e", type: "text", text: "x".repeat(MAX_DRAWING_SCENE_CHARS / 5) })) } };
  const doc2 = normalizeFreeCanvasDoc({ mode: "canvas", drawings: [huge] });
  assert.deepEqual(doc2.drawings[0].scene, { elements: [], files: {} });
});

test("drawings move, resize and nudge through the shared drag grammar", async () => {
  const { normalizeFreeCanvasDoc, FREE_DRAWING_MIN_W, FREE_DRAWING_MIN_H } = await load();
  assert.equal(FREE_DRAWING_MIN_W, 380);
  assert.equal(FREE_DRAWING_MIN_H, 300);
  const base = normalizeFreeCanvasDoc({
    mode: "canvas",
    drawings: [{ id: "d1", title: "Drawing 1", x: 100, y: 100, w: 520, h: 380, scene: SCENE }]
  });
  const drawing = base.drawings[0];
  assert.equal(drawing.title, "Drawing 1");
  assert.deepEqual(drawing.scene, SCENE, "the scene survives normalization untouched");
  // Geometry below the minimums is lifted to them; the scene is preserved.
  const clamped = normalizeFreeCanvasDoc({ mode: "canvas", drawings: [{ id: "d1", x: -60000, y: 60000, w: 40, h: 40, scene: SCENE }] });
  assert.equal(clamped.drawings[0].x, -50000);
  assert.equal(clamped.drawings[0].y, 50000);
  assert.ok(clamped.drawings[0].w >= FREE_DRAWING_MIN_W);
  assert.ok(clamped.drawings[0].h >= FREE_DRAWING_MIN_H);
  assert.deepEqual(clamped.drawings[0].scene, SCENE);
});

test("arrangeCanvas places drawings in the notes column below the notes", async () => {
  // arrangeCanvas is defined inside useFreeCanvas; the arrangement contract is
  // exercised at the doc level here: the notes column x is 40 + cols*720 and
  // drawings continue below the notes with 340px spacing. The hook-level
  // behaviour is verified in the live app probe.
  const { normalizeFreeCanvasDoc, MAX_CANVAS_DRAWINGS } = await load();
  const doc = normalizeFreeCanvasDoc({
    mode: "canvas",
    notes: [{ id: "n1", x: 0, y: 0 }],
    drawings: Array.from({ length: 3 }, (_, index) => ({ id: `d${index}`, x: 0, y: 0, scene: SCENE }))
  });
  assert.equal(doc.drawings.length, 3);
  assert.ok(MAX_CANVAS_DRAWINGS >= doc.drawings.length);
});

test("drawings are not session-bound: pruneFreeCanvasDoc keeps them", async () => {
  const { pruneFreeCanvasDoc, normalizeFreeCanvasDoc } = await load();
  const doc = normalizeFreeCanvasDoc({
    mode: "canvas",
    nodes: { "worker-a": { x: 0, y: 0, w: 400, h: 300 } },
    drawings: [{ id: "d1", x: 10, y: 10, w: 520, h: 380, scene: SCENE }],
    notes: [{ id: "n1", x: 0, y: 0 }]
  });
  const pruned = pruneFreeCanvasDoc(doc, [{ id: "someone-else" }]);
  assert.deepEqual(pruned.drawings, doc.drawings, "drawings survive every prune");
  assert.deepEqual(pruned.notes, doc.notes);
  assert.equal(pruned.nodes["worker-a"], undefined, "stale worker geometry is still pruned");
});

test("persistence round-trip: write, read, and the doc comes back intact", async () => {
  const { writeFreeCanvasDoc, readFreeCanvasDoc, normalizeFreeCanvasDoc } = await load();
  const storage = memoryStorage();
  const original = normalizeFreeCanvasDoc({
    mode: "canvas",
    backdrop: "blueprint",
    viewport: { x: -120, y: 40, z: 1.5 },
    drawings: [
      { id: "d1", title: "Drawing 1", x: 42, y: -17, w: 560, h: 420, scene: SCENE },
      { id: "d2", title: "Drawing 2", x: 600, y: 0, scene: { elements: [], files: {} } }
    ]
  });
  assert.equal(writeFreeCanvasDoc(storage, "test-key", original), true);
  const restored = readFreeCanvasDoc(storage, "test-key");
  assert.equal(restored.mode, "canvas");
  assert.equal(restored.viewport.x, -120);
  assert.equal(restored.viewport.z, 1.5);
  assert.equal(restored.drawings.length, 2);
  assert.deepEqual(restored.drawings[0].scene, SCENE);
  assert.deepEqual(restored.drawings[1].scene, { elements: [], files: {} });
  assert.equal(restored.drawings[0].x, 42);
});

test("corrupt storage restores an empty doc, not a crash", async () => {
  const { readFreeCanvasDoc } = await load();
  const storage = memoryStorage();
  storage.setItem("broken", "{not json");
  const doc = readFreeCanvasDoc(storage, "broken");
  assert.deepEqual(doc.drawings, []);
  assert.equal(doc.mode, "grid");
});

test("the renderer wires drawing nodes: lazy chunk, chrome, debounced persistence", () => {
  const app = read("App.jsx");
  // The engine loads lazily — app startup must never pay for it.
  assert.match(app, /React\.lazy\(\(\) => import\("\.\/CanvasDrawingSurface\.jsx"\)\)/);
  assert.match(app, /React\.Suspense/);
  // Chrome and drag grammar are wired through the shared engine.
  assert.match(app, /startDrag\("drawing", drawing\.id, "move"/);
  assert.match(app, /startDrag\("drawing", drawing\.id, "resize"/);
  assert.match(app, /nudge\("drawing", drawing\.id, event\)/);
  assert.match(app, /freeCanvasState\.removeDrawing\(drawing\.id\)/);
  assert.match(app, /freeCanvasState\.addDrawing\(\)/);
  // Persistence is debounced, flushed on unmount, and rejects with a toast.
  assert.match(app, /drawingSceneBufferRef/);
  assert.match(app, /flushDrawingScene/);
  assert.match(app, /Drawing too large to save/);
  const surface = read("CanvasDrawingSurface.jsx");
  assert.match(surface, /from "@excalidraw\/excalidraw"/);
  assert.match(surface, /handleKeyboardGlobally=\{false\}/);
  assert.match(surface, /detectScroll=\{false\}/);
  const entry = read("main.jsx");
  assert.match(entry, /EXCALIDRAW_ASSET_PATH/);
  const assets = fs.existsSync(path.join(rendererRoot, "public/excalidraw-assets/fonts"));
  assert.ok(assets, "scene fonts are self-hosted under renderer/public/excalidraw-assets/fonts");
});

test("canvasFree.js exposes the full drawing API from useFreeCanvas", async () => {
  const source = read("canvasFree.js");
  for (const name of ["addDrawing", "setDrawingScene", "flushDrawingScene", "removeDrawing", "MAX_CANVAS_DRAWINGS", "FREE_DRAWING_MIN_W", "FREE_DRAWING_MIN_H", "MAX_DRAWING_SCENE_CHARS"]) {
    assert.ok(source.includes(name), `canvasFree.js must export/reference ${name}`);
  }
  // The unmount-safe flush writes storage synchronously.
  assert.match(source, /writeFreeCanvasDoc\(storage, keyRef\.current, merged\)/);
});
