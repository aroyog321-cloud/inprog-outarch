// The free canvas, exercised end to end: every affordance the dock and the
// node chrome offer, driven with real pointer events, with the console watched
// throughout. Reports what each action actually did, so a broken affordance is
// visible rather than assumed.
//
//   npx electron scripts/visual/probe-free-canvas.cjs --out artifacts/visual/free-canvas
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const fixtures = require("./fixtures.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
const argv = process.argv.slice(2);
const flag = (name, fallback) => { const i = argv.indexOf(`--${name}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
const outDir = path.resolve(repoRoot, flag("out", "artifacts/visual/free-canvas"));
fs.mkdirSync(outDir, { recursive: true });

ipcMain.handle("mission-control:request", async (_event, message) => {
  try { return { version: 1, id: message.id, ok: true, result: await fixtures.handle(message.method, message.params) }; }
  catch (error) { return { version: 1, id: message.id, ok: false, error: { code: "HARNESS", message: String((error && error.message) || error) } }; }
});
// The renderer's route to the system shell. It refuses anything that is not
// http/https/mailto, exactly as the shipped main process does.
ipcMain.handle("mission-control:open-external", async (_event, url) => {
  const parsed = String(url || "").replace(/[\u0000-\u001f]/g, "");
  if (!/^(?:https?|mailto):/i.test(parsed)) throw new Error("Only http, https, and mailto URLs are allowed");
  return true;
});

const wait = ms => new Promise(r => setTimeout(r, ms));
const withTimeout = (promise, ms) => Promise.race([promise, wait(ms).then(() => "TIMEOUT")]);

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
  const js = source => withTimeout(window.webContents.executeJavaScript(source), 9000);
  const shoot = async name => {
    window.webContents.invalidate();
    await wait(700);
    if (latest) { fs.writeFileSync(path.join(outDir, name), latest.toPNG()); console.log("  wrote", name); }
  };
  const step = async (name, fn) => { const out = await fn(); console.log("  " + name + ":", out); return out; };

  // Known starting state.
  await js(`(function(){ Object.keys(localStorage).forEach(function(k){ if(k.indexOf('canvas-free') >= 0) localStorage.removeItem(k); }); return true; })();`);
  for (let i = 0; i < 20; i++) {
    if (await js(`!!document.querySelector('.terminal-grid')`)) break;
    await js(`(function(){var b=document.querySelector('.top-navigation button[aria-label="Workspace"]');if(b)b.click();return !!b;})();`);
    await wait(700);
  }
  await wait(1200);

  console.log("== turning the canvas on");
  await step("toggle", () => js(`(function(){ var b=document.querySelector('.workspace-canvas-toggle'); if(!b) return "no toggle"; b.click(); return "clicked"; })();`));
  await wait(2200);
  await step("state", () => js(`JSON.stringify({ attr: document.documentElement.getAttribute('data-workspace-canvas'), grid: String(document.querySelector('.terminal-grid').className).indexOf('is-free-canvas') >= 0, panes: document.querySelectorAll('.terminal-pane').length })`));

  console.log("== moving a node by its grab handle");
  await step("before", () => js(`(function(){ var p=document.querySelector('.terminal-pane'); var r=p.getBoundingClientRect(); var g=document.querySelector('.free-canvas-chrome__move'); var gr=g?g.getBoundingClientRect():null; return JSON.stringify({ pane:{x:Math.round(r.left),y:Math.round(r.top)}, grip: gr?{x:Math.round(gr.left),y:Math.round(gr.top)}:null }); })()`));
  await step("drag", () => js(`(async function(){
    var g=document.querySelector('.free-canvas-chrome__move'); if(!g) return "no grip";
    var r=g.getBoundingClientRect(); var x=r.left+r.width/2, y=r.top+r.height/2;
    var opts=function(cx){ return { bubbles:true, cancelable:true, clientX:cx, clientY:y, pointerId:1, button:0, buttons:1, pointerType:'mouse' }; };
    g.dispatchEvent(new PointerEvent('pointerdown', opts(x)));
    for (var i=1;i<=8;i++){ window.dispatchEvent(new PointerEvent('pointermove', opts(x+i*12))); await new Promise(function(r){requestAnimationFrame(r);}); }
    window.dispatchEvent(new PointerEvent('pointerup', opts(x+96)));
    return "dragged";
  })();`));
  await wait(900);
  await step("after", () => js(`(function(){ var p=document.querySelector('.terminal-pane'); var r=p.getBoundingClientRect(); var d=JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(function(k){return k.indexOf('canvas-free')>=0;})[0])||'{}'); return JSON.stringify({ pane:{x:Math.round(r.left),y:Math.round(r.top)}, storedNode: d.nodes && d.nodes[Object.keys(d.nodes||{})[0]] }); })()`));

  console.log("== resizing a node and watching the terminal reflow");
  await step("rows before", () => js(`(function(){ var h=document.querySelector('.terminal-host'); return JSON.stringify({ w:Math.round(h.getBoundingClientRect().width), rows:h.querySelectorAll('.xterm-rows > div').length }); })()`));
  await step("resize drag", () => js(`(async function(){
    var g=document.querySelector('.free-canvas-chrome__resize'); if(!g) return "no resize grip";
    var r=g.getBoundingClientRect(); var x=r.left+r.width/2, y=r.top+r.height/2;
    var opts=function(cx,cy){ return { bubbles:true, cancelable:true, clientX:cx, clientY:cy, pointerId:1, button:0, buttons:1, pointerType:'mouse' }; };
    g.dispatchEvent(new PointerEvent('pointerdown', opts(x,y)));
    for (var i=1;i<=10;i++){ window.dispatchEvent(new PointerEvent('pointermove', opts(x-i*22,y-i*10))); await new Promise(function(r){requestAnimationFrame(r);}); }
    window.dispatchEvent(new PointerEvent('pointerup', opts(x-220,y-100)));
    return "resized";
  })();`));
  await wait(1200);
  await step("rows after", () => js(`(function(){ var h=document.querySelector('.terminal-host'); var p=document.querySelector('.terminal-pane'); return JSON.stringify({ pane:{w:Math.round(p.getBoundingClientRect().width),h:Math.round(p.getBoundingClientRect().height)}, host:{w:Math.round(h.getBoundingClientRect().width), rows:h.querySelectorAll('.xterm-rows > div').length } }); })()`));

  console.log("== panning the background");
  await step("pan", () => js(`(async function(){
    var g=document.querySelector('.terminal-grid'); var r=g.getBoundingClientRect();
    var x=r.left+40, y=r.bottom-30;
    var opts=function(cx,cy){ return { bubbles:true, cancelable:true, clientX:cx, clientY:cy, pointerId:1, button:0, buttons:1, pointerType:'mouse' }; };
    g.dispatchEvent(new PointerEvent('pointerdown', opts(x,y)));
    for (var i=1;i<=8;i++){ window.dispatchEvent(new PointerEvent('pointermove', opts(x+i*14,y+i*6))); await new Promise(function(r){requestAnimationFrame(r);}); }
    window.dispatchEvent(new PointerEvent('pointerup', opts(x+112,y+48)));
    return "panned";
  })();`));
  await wait(700);
  await step("viewport", () => js(`(function(){ var d=JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(function(k){return k.indexOf('canvas-free')>=0;})[0])||'{}'); return JSON.stringify(d.viewport); })()`));

  console.log("== notes");
  await step("add note", () => js(`(function(){ var b=document.querySelector('[data-free-canvas-note="add"]'); if(!b) return "no add button"; b.click(); return "clicked"; })();`));
  await wait(700);
  await step("notes present", () => js(`JSON.stringify({ notes: document.querySelectorAll('.free-canvas-note').length, textareas: document.querySelectorAll('.free-canvas-note__text').length })`));
  await step("type in note", () => js(`(function(){ var t=document.querySelector('.free-canvas-note__text'); if(!t) return "no textarea"; t.value='hello canvas'; t.dispatchEvent(new Event('input',{bubbles:true})); return "typed"; })();`));
  await wait(900);
  await step("note persisted", () => js(`(function(){ var d=JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(function(k){return k.indexOf('canvas-free')>=0;})[0])||'{}'); return JSON.stringify((d.notes||[]).map(function(n){return n.content;})); })()`));
  await step("delete note", () => js(`(function(){ var b=document.querySelector('.free-canvas-note__delete'); if(!b) return "no delete"; b.click(); return "clicked"; })();`));
  await wait(700);
  await step("notes after delete", () => js(`String(document.querySelectorAll('.free-canvas-note').length)`));

  console.log("== connection wires");
  await step("draw wire", () => js(`(async function(){
    // A wire must join two DIFFERENT nodes, so take the first port of one node
    // and the first port of the next.
    var byNode={};
    Array.from(document.querySelectorAll('.free-canvas-port')).forEach(function(p){
      var n=p.getAttribute('data-port-node');
      if(!byNode[n]) byNode[n]=p;
    });
    var ids=Object.keys(byNode);
    if(ids.length < 2) return "not enough nodes";
    var a=byNode[ids[0]], b=byNode[ids[1]];
    var ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
    var opts=function(cx,cy){ return { bubbles:true, cancelable:true, clientX:cx, clientY:cy, pointerId:1, button:0, buttons:1, pointerType:'mouse' }; };
    a.dispatchEvent(new PointerEvent('pointerdown', opts(ra.left+ra.width/2, ra.top+ra.height/2)));
    window.dispatchEvent(new PointerEvent('pointermove', opts(rb.left+rb.width/2, rb.top+rb.height/2)));
    window.dispatchEvent(new PointerEvent('pointerup', opts(rb.left+rb.width/2, rb.top+rb.height/2)));
    return "dragged "+ids[0]+" to "+ids[1];
  })();`));
  await wait(900);
  await step("wires", () => js(`(function(){ var d=JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(function(k){return k.indexOf('canvas-free')>=0;})[0])||'{}'); return JSON.stringify({ count:(d.wires||[]).length, drawn: document.querySelectorAll('.free-canvas-wire').length }); })()`));

  // The command bar is exercised LAST: a question is handed to Mission AI,
  // which leaves the workspace, so every later step would find no canvas.

  console.log("== the external app launcher");
  await step("open app button", () => js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-app'); if(!b) return "no app button"; b.click(); return "clicked"; })();`));
  await wait(900);
  await step("dialog open", () => js(`(function(){ var d=document.querySelector('.canvas-launcher-dialog'); if(!d) return "NO DIALOG"; var i=d.querySelector('input'); return JSON.stringify({ dialog:true, title:(d.querySelector('[id="canvas-launcher-title"]')||{}).textContent, hasInput:!!i, hint:(d.querySelector('small')||{}).textContent }); })()`));
  await step("dialog metrics", () => js(`(function(){
    var d=document.querySelector('.canvas-launcher-dialog'); if(!d) return "no dialog";
    var cs=getComputedStyle(d); var r=d.getBoundingClientRect();
    var t=d.querySelector('[id="canvas-launcher-title"]'); var ts=t?getComputedStyle(t):null;
    var kids=Array.from(d.children).map(function(k){ var kr=k.getBoundingClientRect(); return { cls:String(k.className).slice(0,40), tag:k.tagName, w:Math.round(kr.width), h:Math.round(kr.height), x:Math.round(kr.left) }; });
    var ov=document.querySelector('.palette-backdrop');
    var root=document.getElementById('root');
    return JSON.stringify({ box:{w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)}, display:cs.display, cols:cs.gridTemplateColumns, bg:cs.backgroundColor, color:cs.color, z:cs.zIndex, titleColor:ts&&ts.color, opacity:cs.opacity, visibility:cs.visibility, transform:cs.transform, parent:String(d.parentElement&&d.parentElement.tagName), overlayZ:ov?getComputedStyle(ov).zIndex:null, rootZ:root?getComputedStyle(root).zIndex:null, rootPos:root?getComputedStyle(root).position:null, kids:kids });
  })();`));
  await wait(2500);
  await step("dialog after settle", () => js(`(function(){ var d=document.querySelector('.canvas-launcher-dialog'); if(!d) return "gone"; var cs=getComputedStyle(d); var r=d.getBoundingClientRect(); return JSON.stringify({ opacity:cs.opacity, visibility:cs.visibility, transform:cs.transform, w:Math.round(r.width), h:Math.round(r.height), x:Math.round(r.left), y:Math.round(r.top), anim:cs.animationName, animDur:cs.animationDuration }); })();`));
  await shoot("free-canvas-launcher.png");
  await step("type a link", () => js(`(function(){ var i=document.querySelector('.canvas-launcher-dialog input'); if(!i) return "no input"; var s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(i,'https://github.com'); i.dispatchEvent(new Event('input',{bubbles:true})); return "typed"; })();`));
  await wait(500);
  await step("button label", () => js(`(function(){ var b=document.querySelector('.canvas-launcher-dialog footer button.primary'); return b?b.textContent:'no button'; })()`));
  await step("submit link", () => js(`(function(){ var b=document.querySelector('.canvas-launcher-dialog footer button.primary'); if(!b) return "no button"; b.click(); return "clicked"; })();`));
  await wait(1200);
  await step("dialog closed after link", () => js(`String(!!document.querySelector('.canvas-launcher-dialog'))`));

  console.log("== the external app launcher, with an application name");
  await js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-app'); if(b) b.click(); return true; })();`);
  await wait(700);
  await step("type an app name", () => js(`(function(){ var i=document.querySelector('.canvas-launcher-dialog input'); if(!i) return "no input"; var s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(i,'notepad'); i.dispatchEvent(new Event('input',{bubbles:true})); var b=document.querySelector('.canvas-launcher-dialog footer button.primary'); return b?b.textContent:'no button'; })();`));
  await step("submit app", () => js(`(function(){ var b=document.querySelector('.canvas-launcher-dialog footer button.primary'); if(!b) return "no button"; b.click(); return "clicked"; })();`));
  await wait(2500);
  await step("app node on the canvas", () => js(`(function(){
    var nodes=document.querySelectorAll('.free-canvas-app');
    var workerForm=!!document.querySelector('.worker-dialog, .pm-dialog');
    var d=JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(function(k){return k.indexOf('canvas-free')>=0;})[0])||'{}');
    return JSON.stringify({ appNodes:nodes.length, workerFormFallback:workerForm, docApps:(d.apps||[]).map(function(a){return { command:a.command, state:a.state };}) });
  })();`));
  await step("close the worker form if open", () => js(`(function(){ var b=Array.from(document.querySelectorAll('button')).filter(function(x){return /cancel/i.test(x.textContent||'');})[0]; if(b) b.click(); return "cancelled"; })();`));
  await wait(700);

  console.log("== arrange and backdrop");
  await step("arrange", () => js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-arrange'); if(!b) return "no arrange"; b.click(); return "clicked"; })();`));
  await wait(900);
  await step("backdrop", () => js(`(function(){ var b=document.querySelector('.free-canvas-dock__btn.is-theme'); if(!b) return "no theme"; b.click(); return "clicked"; })();`));
  await wait(700);
  await step("backdrop now", () => js(`(function(){ var e=document.querySelector('.free-canvas-backdrop'); return e ? e.getAttribute('data-canvas-backdrop') : 'none'; })()`));

  await shoot("free-canvas-final.png");

  console.log("== leaving the canvas");
  await step("exit", () => js(`(function(){ var b=document.querySelector('[data-free-canvas-exit="canvas"]'); if(!b) return "no exit"; b.click(); return "clicked"; })();`));
  await wait(2000);
  await step("after exit", () => js(`JSON.stringify({ attr: document.documentElement.getAttribute('data-workspace-canvas'), grid: String(document.querySelector('.terminal-grid').className).indexOf('is-free-canvas') >= 0, panes: document.querySelectorAll('.terminal-pane').length, rows: (document.querySelector('.terminal-host')||{querySelectorAll:function(){return []}}).querySelectorAll('.xterm-rows > div').length })`));
  await shoot("free-canvas-exited.png");

  console.log("== the command bar");
  // Back to the workspace with the canvas on.
  await js(`(function(){ var b=document.querySelector('.top-navigation button[aria-label="Workspace"]'); if(b) b.click(); return true; })();`);
  await wait(1400);
  await js(`(function(){ var b=document.querySelector('.workspace-canvas-toggle'); if(b && !b.classList.contains('is-current')) b.click(); return true; })();`);
  await wait(1600);
  for (const q of ["arrange my canvas", "add a note", "open the browser", "what is my worker doing"]) {
    await step("omni: " + q, () => js(`(function(){
      var i=document.querySelector('.free-canvas-omni__input'); if(!i) return "no omni";
      var setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i, ${JSON.stringify(q)}); i.dispatchEvent(new Event('input',{bubbles:true}));
      var f=i.closest('form'); if(f) f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
      return "sent";
    })();`));
    await wait(1200);
    await step("  worker form open?", () => js(`String(!!document.querySelector('.worker-dialog, .pm-dialog, [role="dialog"]'))`));
    await step("  still on the workspace?", () => js(`String(!!document.querySelector('.free-canvas-omni'))`));
  }

  console.log("== console errors:", JSON.stringify(errors.slice(0, 10), null, 1));
  window.destroy();
  app.quit();
});
