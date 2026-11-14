"use strict";

// §19.6.3 — native application nodes.
//
// The plan keeps the node and its controls and states plainly what is NOT
// promised: keystroke-level interaction inside the preview, because Electron
// cannot put a native application inside a DOM node. These tests lock the
// delivery model the plan does promise — the app is launched and its window
// OWNED in the main process, the preview is an image surface, the controls
// are named actions, and nothing that reaches outside the app happens without
// the command being vetted first.

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { NativeAppManager, validateCommand } = require("../src/groundstation/main/nativeAppManager.cjs");

function rig({ platform = "win32", execFile, spawn, capture } = {}) {
  const calls = { exec: [], spawn: [], capture: 0 };
  const manager = new NativeAppManager({
    platform,
    execFile: execFile || ((file, args, options, done) => {
      calls.exec.push({ file, args, options });
      if (options.env.OUTARCH_NATIVE_MODE === "list") {
        done(null, JSON.stringify([{ pid: 4242, hwnd: "1001", title: "Notes", left: 0, top: 0, width: 800, height: 600 }]), "");
        return;
      }
      done(null, "ok", "");
    }),
    spawn: spawn || ((command, args, options) => {
      calls.spawn.push({ command, args, options });
      return { pid: 4242, unref() {} };
    }),
    desktopCapturer: capture || {
      async getSources() {
        calls.capture += 1;
        return [{ name: "Notes", thumbnail: { isEmpty: () => false, toDataURL: () => "data:image/png;base64,AAA" } }];
      }
    }
  });
  return { manager, calls };
}

test("a command with shell metacharacters is refused", () => {
  for (const bad of ["code & calc", "a|b", "x > out", "cmd `whoami`", 'quote"', "a;b", "a\nb"]) {
    assert.throws(() => validateCommand(bad), /not allowed|too long|required/i, `accepted ${JSON.stringify(bad)}`);
  }
  assert.equal(validateCommand("  code  "), "code");
  assert.equal(validateCommand("notepad.exe"), "notepad.exe");
});

test("an empty command is refused", () => {
  assert.throws(() => validateCommand(""), /required/i);
  assert.throws(() => validateCommand(null), /required/i);
});

test("launching starts the app detached and owns its window", async () => {
  const { manager, calls } = rig();
  const app = await manager.launch({ command: "notepad" });
  assert.equal(app.command, "notepad");
  assert.equal(app.pid, 4242);
  assert.equal(app.hwnd, "1001", "the window was discovered and is owned by the service");
  assert.equal(app.title, "Notes");
  assert.equal(app.state, "running");
  assert.equal(calls.spawn.length, 1);
  assert.equal(calls.spawn[0].command, "notepad");
  assert.equal(calls.spawn[0].options.detached, true, "the app outlives this call");
  assert.equal(calls.spawn[0].options.shell, true, "the shell is used only so a .cmd shim can start");
});

test("arguments are vetted too", async () => {
  const { manager } = rig();
  await assert.rejects(() => manager.launch({ command: "code", args: ["--wait&calc"] }), /not allowed/i);
});

test("the window controls are named actions on the owned window", async () => {
  const { manager, calls } = rig();
  const app = await manager.launch({ command: "notepad" });
  for (const action of ["focus", "minimize", "restore"]) {
    calls.exec.length = 0;
    const result = await manager[action](app.id);
    assert.equal(result.ok, true, `${action} failed`);
    const call = calls.exec.find(item => item.options.env.OUTARCH_NATIVE_MODE === action);
    assert.ok(call, `${action} did not reach the window helper`);
    assert.equal(call.options.env.OUTARCH_NATIVE_HWND, "1001", "the action names the window the service owns");
  }
});

test("closing an application stops tracking it", async () => {
  const { manager } = rig();
  const app = await manager.launch({ command: "notepad" });
  await manager.close(app.id);
  assert.equal(manager.list().length, 0);
  await assert.rejects(() => manager.focus(app.id), /no longer tracked/i);
});

test("the preview is an image surface from the window source", async () => {
  const { manager, calls } = rig();
  const app = await manager.launch({ command: "notepad" });
  const frame = await manager.frame(app.id);
  assert.equal(frame.id, app.id);
  assert.ok(String(frame.image).startsWith("data:image/png"), "the preview is an image, not an embedded app");
  assert.equal(calls.capture, 1);
});

test("when no window source matches, the node is told the preview is unavailable", async () => {
  const { manager } = rig({ capture: { async getSources() { return [{ name: "Some other window", thumbnail: { isEmpty: () => true } }]; } } });
  const app = await manager.launch({ command: "notepad" });
  const frame = await manager.frame(app.id);
  assert.equal(frame.image, null);
  assert.ok(frame.reason, "the reason is reported so the node can say so plainly");
});

test("a capture that fails does not throw at the operator", async () => {
  const { manager } = rig({ capture: { async getSources() { throw new Error("no capture on this platform"); } } });
  const app = await manager.launch({ command: "notepad" });
  const frame = await manager.frame(app.id);
  assert.equal(frame.image, null);
  assert.equal(frame.reason, "capture-failed");
});

test("off Windows the application still starts and says the window controls are unavailable", async () => {
  const { manager } = rig({ platform: "darwin" });
  // The application is launched — refusing to start it would be a worse lie
  // than a node that cannot own a window.
  const app = await manager.launch({ command: "notes" });
  assert.equal(app.command, "notes");
  assert.equal(app.pid, 4242, "the application was started");
  assert.equal(app.hwnd, null, "no window handle is claimed that does not exist");
  await assert.rejects(() => manager.focus(app.id), /no window to control/i);
});
