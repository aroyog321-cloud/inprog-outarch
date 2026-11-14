// Control: does the OFFSCREEN renderer paint a portaled dialog at all?
// The app's own confirmation dialog (Stop all) is portaled exactly like the
// canvas launcher, so shooting both answers whether a missing dialog in a
// capture is a real defect or an offscreen-renderer artifact.
//
//   npx electron scripts/visual/probe-portal-paint.cjs
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fixtures = require("./fixtures.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
const OUT = path.join(repoRoot, "artifacts", "visual", "free-canvas");
fs.mkdirSync(OUT, { recursive: true });

ipcMain.handle("mission-control:request", async (_event, message) => {
  try { return { version: 1, id: message.id, ok: true, result: await fixtures.handle(message.method, message.params) }; }
  catch (error) { return { version: 1, id: message.id, ok: false, error: { code: "HARNESS", message: String((error && error.message) || error) } }; }
});
ipcMain.handle("mission-control:open-external", async (_event, url) => {
  const parsed = String(url || "").replace(/[\u0000-\u001f]/g, "");
  if (!/^(?:https?|mailto):/i.test(parsed)) throw new Error("Only http, https and mailto URLs are allowed");
  return true;
});

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

  // Open the workspace.
  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await wait(1400);

  // The app's OWN confirmation dialog: Stop all.
  await js(`(function(){ var b=document.querySelector('.workspace-pause'); if(b) b.click(); return true; })();`);
  await wait(1400);
  console.log("confirmation in DOM:", await js(`(function(){ var d=document.querySelector('.confirmation-dialog'); if(!d) return "NONE"; var r=d.getBoundingClientRect(); return JSON.stringify({ cls:d.className, w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top), bg:getComputedStyle(d).backgroundColor }); })()`));
  await shoot("control-confirmation.png");
  console.log("what is on top of it:", await js(`(function(){
    var d=document.querySelector('.confirmation-dialog'); if(!d) return "no dialog";
    var r=d.getBoundingClientRect();
    var stack=document.elementsFromPoint(r.left+r.width/2, r.top+r.height/2).slice(0,6).map(function(e){
      var cs=getComputedStyle(e);
      return { tag:e.tagName, cls:String(e.className).slice(0,40), z:cs.zIndex, pos:cs.position, op:cs.opacity };
    });
    return JSON.stringify(stack, null, 1);
  })()`));
  await js(`(function(){ var b=Array.from(document.querySelectorAll('button')).filter(function(x){return /cancel/i.test(x.textContent||'');})[0]; if(b) b.click(); return true; })();`);
  await wait(800);

  // Now the same question with the canvas ON.
  await js(`(function(){ var b=document.querySelector('.workspace-canvas-toggle'); if(b) b.click(); return true; })();`);
  await wait(2200);
  await js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-app'); if(b) b.click(); return true; })();`);
  await wait(1400);
  console.log("canvas: what is on top of the dialog:", await js(`(function(){
    var d=document.querySelector('.canvas-launcher-dialog'); if(!d) return "no dialog";
    var r=d.getBoundingClientRect();
    var stack=document.elementsFromPoint(r.left+r.width/2, r.top+r.height/2).slice(0,8).map(function(e){
      var cs=getComputedStyle(e);
      return { tag:e.tagName, cls:String(e.className).slice(0,44), z:cs.zIndex, pos:cs.position, op:cs.opacity, filter:cs.filter, mix:cs.mixBlendMode };
    });
    return JSON.stringify(stack, null, 1);
  })()`));

  // Hypothesis: the floating bars' backdrop-filter creates a composited layer
  // that the portaled dialog is painted under. Drop it and see.
  console.log("without backdrop-filter:", await js(`(function(){
    var n=0;
    Array.from(document.querySelectorAll('.free-canvas-omni, .free-canvas-dock, .free-canvas-omni__send, .free-canvas-dock__btn')).forEach(function(e){
      var cs=getComputedStyle(e); if(cs.backdropFilter && cs.backdropFilter !== 'none'){ e.style.backdropFilter='none'; e.style.webkitBackdropFilter='none'; n++; }
    });
    return String(n)+" elements changed";
  })()`));
  await wait(900);
  await shoot("control-no-backdrop.png");
  console.log("dialog still in DOM:", await js(`String(!!document.querySelector('.canvas-launcher-dialog'))`));

  // A plain in-DOM element as a paint control.
  await js(`(function(){ var d=document.createElement('div'); d.id='paint-control'; d.style.cssText='position:fixed;left:600px;top:400px;width:320px;height:120px;background:#e5bd62;color:#000;font:700 20px Inter,sans-serif;display:grid;place-items:center;z-index:400'; d.textContent='PAINT CONTROL'; document.body.appendChild(d); return true; })();`);
  await wait(600);
  await shoot("control-paint.png");

  window.destroy();
  app.quit();
});
