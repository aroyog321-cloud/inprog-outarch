// One-off: after a drawing node mounts, report which scene fonts actually
// load (data-URL subset faces) versus the blocked CDN fallback, so the
// font-src noise can be classified correctly.
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fixtures = require("./fixtures.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
ipcMain.handle("mission-control:request", async (_e, m) => {
  try { return { version: 1, id: m.id, ok: true, result: await fixtures.handle(m.method, m.params) }; }
  catch (error) { return { version: 1, id: m.id, ok: false, error: { code: "HARNESS", message: String(error.message || error) } }; }
});
const wait = ms => new Promise(r => setTimeout(r, ms));

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1600, height: 960, show: false, frame: false, webPreferences: { preload: path.join(__dirname, "preload.cjs"), offscreen: true, sandbox: false, contextIsolation: true } });
  await window.loadFile(path.join(repoRoot, "dist", "groundstation", "renderer", "index.html"));
  await wait(2600);
  const js = s => window.webContents.executeJavaScript(s);
  await js(`(function(){ Object.keys(localStorage).forEach(function(k){ if(k.indexOf('canvas-free')>=0) localStorage.removeItem(k); }); return true; })();`);
  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await wait(1200);
  await js(`(function(){ var b=document.querySelector('.workspace-canvas-toggle'); if(b) b.click(); return true; })();`);
  await wait(2000);
  await js(`(function(){ var b=document.querySelector('[data-free-canvas-drawing="add"]'); if(b) b.click(); return true; })();`);
  for (let i = 0; i < 40; i++) {
    if (await js(`!!document.querySelector('.free-canvas-drawing .excalidraw')`)) break;
    await wait(250);
  }
  await wait(2500);
  const report = await js(`(async function(){
    var faces=[];
    document.fonts.forEach(function(f){ faces.push({ family: f.family, status: f.status }); });
    var dataFaces=faces.filter(function(f){ return f.status==='loaded'; });
    var styleRules=0, subsetRules=0;
    for (var i=0;i<document.styleSheets.length;i++){
      var sheet=document.styleSheets[i];
      var rules; try{ rules=sheet.cssRules; }catch(e){ continue; }
      for (var j=0;j<rules.length;j++){
        if(rules[j].type===CSSRule.FONT_FACE_RULE){ styleRules++; if(String(rules[j].cssText).indexOf('data:')>=0) subsetRules++; }
      }
    }
    return JSON.stringify({ totalFaces: faces.length, loadedFaces: dataFaces.length, loadedFamilies: dataFaces.map(function(f){return f.family;}).slice(0,14), fontFaceRules: styleRules, dataUrlRules: subsetRules });
  })();`);
  console.log("fonts:", report);
  window.destroy();
  app.quit();
}).catch(e => { console.error("failed:", e); app.quit(1); });
