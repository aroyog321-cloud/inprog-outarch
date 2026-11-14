// §3.6 drawing node, exercised end to end in the built renderer with REAL
// input events (webContents.sendInputEvent — synthetic PointerEvents would die
// on Excalidraw's setPointerCapture): lazy engine load, real drawing, debounced
// persistence, restore after reload, unmount-flush safety, move chrome, and
// delete — with the console watched throughout.
//
//   npx electron scripts/visual/probe-canvas-drawing.cjs --out artifacts/visual/canvas-drawing
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fixtures = require("./fixtures.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
const outDir = path.resolve(repoRoot, flag("out", "artifacts/visual/canvas-drawing"));
fs.mkdirSync(outDir, { recursive: true });

ipcMain.handle("mission-control:request", async (_event, message) => {
  try { return { version: 1, id: message.id, ok: true, result: await fixtures.handle(message.method, message.params) }; }
  catch (error) { return { version: 1, id: message.id, ok: false, error: { code: "HARNESS", message: String((error && error.message) || error) } }; }
});
ipcMain.handle("mission-control:open-external", async (_event, url) => {
  const parsed = String(url || "").replace(/[\u0000-\u001f]/g, "");
  if (!/^(?:https?|mailto):/i.test(parsed)) throw new Error("Only http, https, and mailto URLs are allowed");
  return true;
});

const wait = ms => new Promise(r => setTimeout(r, ms));

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1600, height: 960, show: false, frame: false, webPreferences: { preload: path.join(__dirname, "preload.cjs"), offscreen: true, sandbox: false, contextIsolation: true } });
  const errors = [];
  window.webContents.on("console-message", event => { if (event.level === "error") errors.push(String(event.message).slice(0, 300)); });
  window.webContents.on("render-process-gone", (_e, d) => errors.push("RENDERER GONE: " + JSON.stringify(d)));
  let latest = null;
  window.webContents.on("paint", (_e, _d, image) => { latest = image; });
  window.webContents.setFrameRate(30);
  await window.loadFile(path.join(repoRoot, "dist", "groundstation", "renderer", "index.html"));
  await wait(2600);
  const js = s => window.webContents.executeJavaScript(s);
  const shoot = async name => {
    window.webContents.invalidate();
    await wait(700);
    if (latest) { fs.writeFileSync(path.join(outDir, name), latest.toPNG()); console.log("  wrote", name); }
  };
  const step = async (name, fn) => { const out = await fn(); console.log("  " + name + ":", out); return out; };

  // Real-input helpers. Coordinates are content-relative, which is what
  // getBoundingClientRect reports inside a frameless offscreen window.
  const center = async selector => js(`(function(){ var el=document.querySelector(${JSON.stringify(selector)}); if(!el) return null; var r=el.getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }); })();`).then(JSON.parse);
  const move = (x, y) => window.webContents.sendInputEvent({ type: "mouseMove", x, y });
  const down = (x, y) => window.webContents.sendInputEvent({ type: "mouseDown", x, y, button: "left", clickCount: 1 });
  const up = (x, y) => window.webContents.sendInputEvent({ type: "mouseUp", x, y, button: "left", clickCount: 1 });
  const click = async (x, y) => { move(x, y); await wait(80); down(x, y); await wait(80); up(x, y); await wait(120); };
  const drag = async (fromX, fromY, toX, toY, steps = 8) => {
    move(fromX, fromY); await wait(80);
    down(fromX, fromY); await wait(120);
    for (let i = 1; i <= steps; i++) { move(Math.round(fromX + (toX - fromX) * i / steps), Math.round(fromY + (toY - fromY) * i / steps)); await wait(40); }
    up(toX, toY); await wait(200);
  };
  const docKey = `Object.keys(localStorage).find(function(k){return k.indexOf('canvas-free')>=0;})`;
  const doc = `JSON.parse(localStorage.getItem(${docKey})||'{}')`;

  // Known starting state.
  await js(`(function(){ Object.keys(localStorage).forEach(function(k){ if(k.indexOf('canvas-free') >= 0) localStorage.removeItem(k); }); return true; })();`);
  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await wait(1200);

  console.log("== turning the canvas on");
  const toggleBtn = await center(".workspace-canvas-toggle");
  if (!toggleBtn) { console.log("  FATAL: no canvas toggle"); window.destroy(); app.quit(1); return; }
  await step("toggle", () => click(toggleBtn.x, toggleBtn.y).then(() => "clicked"));
  await wait(2000);

  console.log("== adding a drawing node (lazy engine load)");
  const t0 = Date.now();
  const addBtn = await center('[data-free-canvas-drawing="add"]');
  if (!addBtn) { console.log("  FATAL: no add-drawing button"); window.destroy(); app.quit(1); return; }
  await click(addBtn.x, addBtn.y);
  let mounted = "TIMEOUT";
  for (let i = 0; i < 40; i++) {
    mounted = await js(`(function(){ var n=document.querySelector('.free-canvas-drawing'); if(!n) return "no node"; var e=n.querySelector('.excalidraw'); return e ? "engine-mounted" : "node-only"; })();`);
    if (mounted === "engine-mounted" || mounted === "no node") break;
    await wait(250);
  }
  console.log("  engine-load:", mounted, "in", Date.now() - t0, "ms");
  await shoot("01-drawing-added.png");

  console.log("== drawing a rectangle inside the engine (real input)");
  let engineCanvas = null;
  const rectTool = await center('.free-canvas-drawing input[aria-label="Rectangle"]');
  if (!rectTool) { console.log("  draw: no rectangle tool"); }
  else {
    await click(rectTool.x, rectTool.y);
    await wait(200);
    engineCanvas = await js(`(function(){ var n=document.querySelector('.free-canvas-drawing'); var c=n.querySelector('canvas.excalidraw__canvas.interactive')||n.querySelector('canvas'); if(!c) return null; var r=c.getBoundingClientRect(); return JSON.stringify({ x: Math.round(r.left+r.width/2), y: Math.round(r.top+r.height/2) }); })();`).then(JSON.parse);
    if (!engineCanvas) console.log("  draw: no canvas");
    else {
      await drag(engineCanvas.x - 60, engineCanvas.y - 60, engineCanvas.x + 80, engineCanvas.y + 50, 10);
      console.log("  draw: strokes sent");
    }
  }
  // Let the 600ms debounce settle.
  await wait(1400);
  const persisted = await js(`(function(){ var d=${doc}; var dr=d.drawings||[]; return JSON.stringify({ count: dr.length, elements: dr.length ? ((dr[0].scene||{}).elements||[]).length : -1 }); })();`);
  console.log("  persisted:", persisted);
  await shoot("02-drawn.png");

  console.log("== moving the drawing node by its grip (real input)");
  const grip = await center(".free-canvas-drawing .free-canvas-chrome__move");
  if (!grip) console.log("  move: no grip");
  else {
    await drag(grip.x, grip.y, grip.x + 120, grip.y + 80, 8);
    await wait(900);
    await step("moved-doc", () => js(`(function(){ var d=${doc}; var dr=(d.drawings||[])[0]||{}; return JSON.stringify({ x: dr.x, y: dr.y, w: dr.w, h: dr.h, hasScene: !!(dr.scene && (dr.scene.elements||[]).length) }); })();`));
  }

  console.log("== unmount-flush safety: draw again, exit within the debounce window");
  if (rectTool && engineCanvas) {
    await click(rectTool.x, rectTool.y);
    await wait(200);
    await drag(engineCanvas.x + 60, engineCanvas.y + 60, engineCanvas.x + 150, engineCanvas.y + 120, 6);
    // Exit the canvas within the 600ms debounce window — the flush must save it.
    const exitBtn = await center('[data-free-canvas-exit="canvas"]');
    if (exitBtn) await click(exitBtn.x, exitBtn.y); else console.log("  quick-exit: no exit button");
    await wait(1000);
    const afterFlush = await js(`(function(){ var d=${doc}; var dr=(d.drawings||[])[0]||{}; return JSON.stringify({ elements: dr.scene ? (dr.scene.elements||[]).length : -1 }); })();`);
    console.log("  after-unmount-flush:", afterFlush);
  }

  console.log("== reload: the scene must come back");
  window.webContents.reload();
  await wait(3500);
  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await step("restore-doc", () => js(`(function(){ var d=${doc}; var dr=(d.drawings||[])[0]||{}; return JSON.stringify({ count: (d.drawings||[]).length, mode: d.mode, x: dr.x, elements: dr.scene ? (dr.scene.elements||[]).length : -1 }); })();`));
  await step("boot-state", () => js(`(function(){ return JSON.stringify({ grid: !!document.querySelector('.terminal-grid'), toggle: !!document.querySelector('.workspace-canvas-toggle'), exit: !!document.querySelector('[data-free-canvas-exit="canvas"]'), canvasAttr: document.documentElement.getAttribute('data-workspace-canvas'), drawingsInDom: document.querySelectorAll('.free-canvas-drawing').length }); })();`));
  const toggleBack = await center(".workspace-canvas-toggle");
  if (toggleBack) { await click(toggleBack.x, toggleBack.y); console.log("  toggle-back: clicked"); await wait(2000); }
  else console.log("  toggle-back: no toggle");
  let restored = "TIMEOUT";
  for (let i = 0; i < 40; i++) {
    restored = await js(`(function(){ var n=document.querySelector('.free-canvas-drawing'); var e=n&&n.querySelector('.excalidraw'); return e ? "engine-restored" : (n ? "node-only" : "no node"); })();`);
    if (restored === "engine-restored" || restored === "no node") break;
    await wait(250);
  }
  console.log("  restore:", restored);
  await shoot("03-restored.png");

  console.log("== delete");
  const del = await center(".free-canvas-drawing .free-canvas-drawing__delete");
  if (!del) console.log("  delete: no delete button");
  else {
    await click(del.x, del.y);
    await wait(900);
    await step("after-delete", () => js(`(function(){ var d=${doc}; return JSON.stringify({ count: (d.drawings||[]).length, nodes: document.querySelectorAll('.free-canvas-drawing').length }); })();`));
  }

  console.log("== console errors:", errors.length ? errors.slice(0, 10).map(e => e.replace(/\n/g, " ").slice(0, 220)).join("\n   || ") : "(none)");
  window.destroy();
  app.quit();
}).catch(error => { console.error("probe failed:", error); app.quit(1); });
