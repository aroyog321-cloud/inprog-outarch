// Isolation: the app's confirmation dialog paints; the canvas launcher did
// not. This swaps the launcher's INNER MARKUP for the app's proven markup
// inside the same dialog element, so one frame shows whether the difference
// is the markup or the styles.
//
//   npx electron scripts/visual/probe-launcher-isolate.cjs
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fixtures = require("./fixtures.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
const OUT = path.join(repoRoot, "artifacts", "visual", "free-canvas");

ipcMain.handle("mission-control:request", async (_event, message) => {
  try { return { version: 1, id: message.id, ok: true, result: await fixtures.handle(message.method, message.params) }; }
  catch (error) { return { version: 1, id: message.id, ok: false, error: { code: "HARNESS", message: String((error && error.message) || error) } }; }
});
ipcMain.handle("mission-control:open-external", async () => true);

const wait = ms => new Promise(r => setTimeout(r, ms));

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1600, height: 960, show: false, frame: false, webPreferences: { preload: path.join(__dirname, "preload.cjs"), offscreen: true, sandbox: false, contextIsolation: true } });
  let latest = null;
  window.webContents.on("paint", (_e, _d, image) => { latest = image; });
  window.webContents.setFrameRate(30);
  await window.loadFile(path.join(repoRoot, "dist", "groundstation", "renderer", "index.html"));
  await wait(2600);
  const js = s => window.webContents.executeJavaScript(s);
  const shoot = async name => {
    window.webContents.invalidate();
    await wait(900);
    if (latest) { fs.writeFileSync(path.join(OUT, name), latest.toPNG()); console.log("wrote", name); }
  };

  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await wait(1400);

  // Open the canvas, then the launcher.
  await js(`(function(){ var b=document.querySelector('.workspace-canvas-toggle'); if(b) b.click(); return true; })();`);
  await wait(2200);
  await js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-app'); if(b) b.click(); return true; })();`);
  await wait(1400);
  console.log("launcher present:", await js(`String(!!document.querySelector('.canvas-launcher-dialog'))`));

  // Swap the inner markup for the app's proven confirmation markup, keeping the
  // same dialog element (and therefore the same class list and CSS).
  console.log("after swap:", await js(`(function(){
    var d=document.querySelector('.canvas-launcher-dialog'); if(!d) return "no dialog";
    d.innerHTML='<span class="confirmation-mark">!</span><div><span class="section-kicker">CONFIRM OPERATION</span><h2 id="t">Swapped markup</h2><p>Same dialog element, the app\\'s own markup inside it.</p></div><footer><button>Cancel</button><button class="danger-confirm">Go</button></footer>';
    var r=d.getBoundingClientRect();
    return JSON.stringify({ w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top), text:(d.textContent||'').slice(0,40) });
  })();`));
  await wait(700);
  await shoot("isolate-swapped.png");

  // And the launcher markup, in a plain in-DOM dialog element (no portal).
  console.log("plain:", await js(`(function(){
    var old=document.querySelector('.canvas-launcher-dialog'); if(old) old.remove();
    var d=document.createElement('div'); d.className='confirmation-dialog canvas-launcher-dialog';
    d.innerHTML='<div><span class="section-kicker">OPEN EXTERNAL</span><h2 id="t">Plain in-DOM launcher</h2><p>Same markup, not portaled.</p></div><label class="canvas-launcher-field"><span>Link or command</span><input value="https://github.com"><small>Opens in your system browser.</small></label><footer><button>Cancel</button><button class="primary">Open link</button></footer>';
    document.body.appendChild(d);
    var r=d.getBoundingClientRect();
    return JSON.stringify({ w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top) });
  })();`));
  await wait(700);
  await shoot("isolate-plain.png");

  window.destroy();
  app.quit();
});
