"use strict";

// §19.6.3 — Native App Nodes.
//
// The plan is explicit about what this is and is not: Electron cannot embed a
// native Windows application as an interactive child surface inside a renderer
// DOM node. `BrowserView`/`WebContentsView` host web content only, a
// desktop capture is one-way video, and a DWM thumbnail is compositor-level
// and cannot be addressed into a DOM element. What the plan keeps is the
// DELIVERY MODEL, and this service is that model:
//
//   1. Launch the real app (detached, never through a shell the renderer can
//      talk into).
//   2. Discover and OWN the window — in the MAIN process, because the
//      renderer is sandboxed and cannot ask the OS for a window handle.
//   3. Preview the window in the node as an image surface. The plan's
//      cross-platform fallback for the DWM thumbnail is `desktopCapturer`, and
//      that is what this uses; where a preview is not available the node says
//      so plainly rather than showing a broken frame.
//   4. Control it — focus, minimize, restore, close — through native calls.
//   5. State it plainly in the UI: the node is a LIVE PREVIEW, and the
//      operator interacts with the app in its own window.
//
// Nothing here grants the renderer more authority than it had: the renderer
// asks for a named action, and this service decides what that action means.

const { spawn, execFile } = require("node:child_process");
const { desktopCapturer } = require("electron");

const LAUNCH_TIMEOUT_MS = 12000;
const WINDOW_POLL_MS = 400;
const PREVIEW_WIDTH = 720;
const PREVIEW_HEIGHT = 450;

// A command is turned into a process. It may not contain a shell
// metacharacter, because the launch runs through the shell only so that the
// `.cmd` shims Windows ships for tools like `code` and `npm` can be started;
// the metacharacter ban is what makes that safe.
const SHELL_METACHARACTERS = /[&|<>^$`;"'\\\r\n(){}[\]]/;

function validateCommand(command) {
  const value = String(command ?? "").trim();
  if (!value) throw new Error("An application command is required");
  if (value.length > 120) throw new Error("That application command is too long");
  if (SHELL_METACHARACTERS.test(value)) {
    throw new Error("That application command contains characters that are not allowed");
  }
  return value;
}

// The window helper. It is a PowerShell script with the user32 entry points it
// needs, driven by environment variables so that no value ever has to be
// quoted into a command line.
const WINDOWS_HELPER = `
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class OutarchNativeWindow {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
'@
function Get-WindowList {
  $items = New-Object System.Collections.ArrayList
  $cb = [OutarchNativeWindow+EnumProc]{
    param($h, $l)
    $pidValue = 0
    [void][OutarchNativeWindow]::GetWindowThreadProcessId($h, [ref]$pidValue)
    if ($pidValue -ne 0 -and [OutarchNativeWindow]::IsWindowVisible($h)) {
      $text = New-Object System.Text.StringBuilder 512
      [void][OutarchNativeWindow]::GetWindowTextW($h, $text, 512)
      $title = $text.ToString()
      if ($title.Trim().Length -gt 0) {
        $rect = New-Object OutarchNativeWindow+RECT
        [void][OutarchNativeWindow]::GetWindowRect($h, [ref]$rect)
        [void]$items.Add([pscustomobject]@{
          pid = [int]$pidValue
          hwnd = $h.ToInt64().ToString()
          title = $title
          left = $rect.Left
          top = $rect.Top
          width = $rect.Right - $rect.Left
          height = $rect.Bottom - $rect.Top
        })
      }
    }
    return $true
  }
  [void][OutarchNativeWindow]::EnumWindows($cb, [IntPtr]::Zero)
  return $items
}
$mode = $env:OUTARCH_NATIVE_MODE
if ($mode -eq 'list') {
  ConvertTo-Json -InputObject @(Get-WindowList) -Compress
  exit 0
}
$hwnd = [IntPtr]::new([int64]$env:OUTARCH_NATIVE_HWND)
switch ($mode) {
  'focus'   { [void][OutarchNativeWindow]::SetForegroundWindow($hwnd); Write-Output 'ok' }
  'minimize'{ [void][OutarchNativeWindow]::ShowWindow($hwnd, 6); Write-Output 'ok' }
  'restore' { [void][OutarchNativeWindow]::ShowWindow($hwnd, 9); Write-Output 'ok' }
  'close'   { [void][OutarchNativeWindow]::PostMessage($hwnd, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero); Write-Output 'ok' }
  default   { Write-Output 'unknown' }
}
`;

function encodePowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

class NativeAppManager {
  #apps = new Map();
  #nextId = 1;
  #platform;
  #execFile;
  #spawn;

  constructor({ platform = process.platform, execFile: run = execFile, spawn: launch = spawn, desktopCapturer: capture = desktopCapturer } = {}) {
    this.#platform = platform;
    this.#execFile = run;
    this.#spawn = launch;
    this.#capturer = capture;
  }

  #capturer;

  // Runs the window helper and returns its parsed output. Only the ACTIONS
  // need a window handle, so a platform without one reports that plainly
  // instead of pretending the application could not be started.
  async #runHelper(mode, extra = {}) {
    if (this.#platform !== "win32") {
      throw new Error("Native application windows are managed on Windows only");
    }
    const env = { ...process.env, OUTARCH_NATIVE_MODE: mode, ...extra };
    return new Promise((resolve, reject) => {
      this.#execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encodePowerShell(WINDOWS_HELPER)],
        { windowsHide: true, timeout: 15000, env, maxBuffer: 4 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(new Error(String(stderr || error.message || "The window helper failed").trim().slice(0, 300)));
            return;
          }
          const text = String(stdout || "").trim();
          if (!text) {
            resolve(null);
            return;
          }
          try {
            resolve(JSON.parse(text));
          } catch {
            resolve(text);
          }
        }
      );
    });
  }

  async #listWindows() {
    // Off Windows there is no window handle to own, and that is not a
    // failure: the application still runs, and the node says the preview and
    // the window controls are unavailable here.
    if (this.#platform !== "win32") return [];
    const raw = await this.#runHelper("list");
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [];
  }

  // Finds the window that belongs to a launched process. An app's main window
  // appears a moment after the process starts, so this polls briefly. On a
  // platform with no window handle there is nothing to wait for.
  async #findWindow(pid, deadline) {
    if (this.#platform !== "win32") return null;
    while (Date.now() < deadline) {
      const windows = await this.#listWindows();
      const owned = windows.filter(item => Number(item.pid) === Number(pid));
      if (owned.length) {
        // The largest visible window is the app's main window.
        owned.sort((a, b) => (Number(b.width) * Number(b.height)) - (Number(a.width) * Number(a.height)));
        return owned[0];
      }
      await new Promise(resolve => setTimeout(resolve, WINDOW_POLL_MS));
    }
    return null;
  }

  // §19.6.3 step 1 and 2: launch the real app and own its window.
  async launch({ command, args } = {}) {
    const run = validateCommand(command);
    const extraArgs = Array.isArray(args) ? args.map(item => String(item)).filter(Boolean) : [];
    if (extraArgs.some(item => SHELL_METACHARACTERS.test(item))) {
      throw new Error("Those application arguments are not allowed");
    }
    const id = `app-${this.#nextId++}`;
    let child;
    try {
      child = this.#spawn(run, extraArgs, {
        detached: true,
        stdio: "ignore",
        shell: true,
        windowsHide: false
      });
    } catch (error) {
      throw new Error(`That application could not be started: ${error instanceof Error ? error.message : String(error)}`);
    }
    child.unref?.();
    const pid = child.pid || 0;
    const deadline = Date.now() + LAUNCH_TIMEOUT_MS;
    const window = pid ? await this.#findWindow(pid, deadline) : null;
    const app = {
      id,
      command: run,
      args: extraArgs,
      pid,
      hwnd: window ? window.hwnd : null,
      title: window ? window.title : run,
      // The application is running as soon as the process started. Whether a
      // preview and the window controls are available is a separate fact, and
      // the node reports that itself.
      state: pid ? "running" : "launching",
      launchedAt: Date.now()
    };
    this.#apps.set(id, app);
    return { ...app };
  }

  list() {
    return Array.from(this.#apps.values()).map(app => ({ ...app }));
  }

  #require(id) {
    const app = this.#apps.get(String(id));
    if (!app) throw new Error("That application is no longer tracked");
    return app;
  }

  // §19.6.3 step 4: the controls. Each one is a native call on the window
  // this service owns.
  async #act(id, mode) {
    const app = this.#require(id);
    if (!app.hwnd) throw new Error("That application has no window to control yet");
    const result = await this.#runHelper(mode, { OUTARCH_NATIVE_HWND: app.hwnd });
    if (mode === "close") {
      app.state = "closed";
      this.#apps.delete(app.id);
    }
    return { ok: result === "ok" || result === true, id: app.id, action: mode };
  }

  focus(id) { return this.#act(id, "focus"); }
  minimize(id) { return this.#act(id, "minimize"); }
  restore(id) { return this.#act(id, "restore"); }
  close(id) { return this.#act(id, "close"); }

  // §19.6.3 step 3: the preview. `desktopCapturer` is the plan's cross-platform
  // fallback for the DWM thumbnail, and it needs the window's TITLE to find
  // the right source. When no source matches, the node says so instead of
  // showing a broken frame.
  async frame(id) {
    const app = this.#require(id);
    if (!app.title) return { id: app.id, image: null, reason: "no-title" };
    try {
      const sources = await this.#capturer.getSources({
        types: ["window"],
        thumbnailSize: { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }
      });
      const command = String(app.command || "").toLowerCase();
      const source = sources.find(item => item.name === app.title)
        || sources.find(item => item.name && app.title.includes(item.name))
        || sources.find(item => item.name && item.name.includes(app.title))
        // Off Windows there is no window handle, so the title is the only thing
        // that can match a source to the application.
        || sources.find(item => item.name && command && item.name.toLowerCase().includes(command));
      if (!source || !source.thumbnail || source.thumbnail.isEmpty()) {
        return { id: app.id, image: null, reason: "no-preview" };
      }
      return { id: app.id, image: source.thumbnail.toDataURL(), title: source.name, reason: null };
    } catch (error) {
      return { id: app.id, image: null, reason: "capture-failed" };
    }
  }

  dispose() {
    this.#apps.clear();
  }
}

module.exports = { NativeAppManager, validateCommand, PREVIEW_WIDTH, PREVIEW_HEIGHT };
