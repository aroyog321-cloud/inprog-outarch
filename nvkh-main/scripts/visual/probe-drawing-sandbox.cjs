"use strict";

// §3.6 drawing engine — sandbox capability probe.
//
// Excalidraw loads its scene fonts at runtime with fetch() against a
// statically-bundled manifest of relative URLs, resolved against
// window.EXCALIDRAW_ASSET_PATH. The groundstation renderer runs on the
// file:// protocol inside a sandboxed, contextIsolation window under the
// application CSP. Whether that pipeline can fetch a sibling woff2 file is
// not something to guess: this probe measures it in the real shell.
//
// It also measures module workers from file:// (Excalidraw's font subsetting
// worker) and FontFace registration — the two other capabilities the
// integration leans on. Failures are reported, not swallowed: the fallback
// behaviour (system-font text) is a documented degradation, and this probe
// tells us which regime we are in.

const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow } = require("electron");

const ROOT = path.resolve(__dirname, "../..");
const TARGET = path.join(ROOT, "artifacts", "visual", "drawing-sandbox");

const FONT_SOURCE = path.join(
  ROOT,
  "node_modules/@excalidraw/excalidraw/dist/prod/fonts/Excalifont/Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2"
);

// The exact CSP the renderer ships, from src/groundstation/renderer/index.html.
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'";

// The exact webPreferences the app's windows use (preload removed — nothing
// here needs the bridge, and the question is about the renderer's web APIs).
const WEB_PREFERENCES = {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  spellcheck: false,
  backgroundThrottling: false
};

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
</head><body><script type="module" src="./probe.mjs"></script></body></html>`;

const SCRIPT = `(async function () {
  const report = { fetchFont: null, workerModule: null, fontFace: null, canvasFont: null };
  // 1 — fetch() a sibling woff2, exactly the shape Excalidraw uses.
  try {
    const response = await fetch("./Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2", { cache: "force-cache" });
    report.fetchFont = response.ok ? "ok " + (await response.arrayBuffer()).byteLength + "B" : "http " + response.status;
  } catch (error) { report.fetchFont = "threw: " + error; }
  // 2 — module worker from a sibling file.
  report.workerModule = await new Promise(resolve => {
    try {
      const worker = new Worker("./worker.mjs", { type: "module" });
      worker.onmessage = event => { resolve("ok: " + event.data); worker.terminate(); };
      worker.onerror = event => { resolve("error: " + (event.message || "unknown")); worker.terminate(); };
      setTimeout(() => resolve("timeout"), 5000);
    } catch (error) { resolve("threw: " + error); }
  });
  // 3 — register the fetched font and check the family becomes available.
  try {
    const response = await fetch("./Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2");
    const face = new FontFace("ProbeExcalifont", await response.arrayBuffer());
    await face.load();
    document.fonts.add(face);
    report.fontFace = document.fonts.check("16px ProbeExcalifont") ? "registered" : "registered-but-not-resolvable";
  } catch (error) { report.fontFace = "threw: " + error; }
  // 4 — does a canvas pick the registered family up.
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px ProbeExcalifont";
    report.canvasFont = context.font.includes("ProbeExcalifont") ? "usable" : "fallback: " + context.font;
  } catch (error) { report.canvasFont = "threw: " + error; }
  document.title = "REPORT:" + JSON.stringify(report);
})();`;

const WORKER = "self.postMessage('alive');\n";

async function main() {
  await app.whenReady();
  fs.mkdirSync(TARGET, { recursive: true });
  fs.copyFileSync(FONT_SOURCE, path.join(TARGET, "Excalifont-Regular-a88b72a24fb54c9f94e3b5fdaa7481c9.woff2"));
  fs.writeFileSync(path.join(TARGET, "probe.html"), PAGE, "utf8");
  fs.writeFileSync(path.join(TARGET, "probe.mjs"), SCRIPT, "utf8");
  fs.writeFileSync(path.join(TARGET, "worker.mjs"), WORKER, "utf8");

  const window = new BrowserWindow({ show: false, webPreferences: WEB_PREFERENCES });
  const errors = [];
  window.webContents.on("console-message", (_event, _level, message) => errors.push(message));
  await window.loadFile(path.join(TARGET, "probe.html"));
  await window.webContents.executeJavaScript(
    "new Promise(resolve => { const start = Date.now(); const timer = setInterval(() => { if (document.title.startsWith('REPORT:') || Date.now() - start > 12000) { clearInterval(timer); resolve(document.title); } }, 100); })"
  );
  const raw = window.webContents.getTitle().replace(/^REPORT:/, "");
  let report;
  try { report = JSON.parse(raw); } catch { report = { unparsed: raw }; }
  console.log("== drawing sandbox capabilities ==");
  for (const [key, value] of Object.entries(report)) console.log(`  ${key}: ${value}`);
  console.log(`  console messages: ${errors.length ? errors.slice(0, 4).join(" || ") : "(none)"}`);
  window.destroy();
  app.quit();
}

main().catch(error => { console.error("probe failed:", error); app.quit(1); });
