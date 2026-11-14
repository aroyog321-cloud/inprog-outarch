import React from "react";
import Chevron from "./Chevron.jsx";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import {
  missionApi,
  notificationPayload,
  notificationType,
  streamIdentifier
} from "./missionApi.js";
import { CrashLens } from "./CrashLens.jsx";
import { describeLaunch } from "./launchLabel.js";
import { copyText } from "./clipboard.js";
import { chunkTerminalInput, isPasteChord, isShellAltChord } from "./terminalInput.js";

const TERMINAL_THEMES = {
  // ANSI has sixteen slots and a program picks whichever it likes, so the
  // bright half is stated too: leaving it to xterm's defaults let a `FAIL`
  // line paint its own red next to the palette's.
  //
  // The scrollbar slider is stated as well. xterm derives it from the
  // foreground at a fifth opacity and writes it into the terminal's own style
  // element, which on a near-white foreground is a pale bar down the pane.
  // These three keep it at the weight the rest of the app's scrollbars use.
  orbital: { background: "#000000", foreground: "#fafafa", cursor: "#0070f3", cursorAccent: "#000000", selectionBackground: "#1f3a5f", black: "#171717", red: "#ff5f5f", green: "#32d583", yellow: "#f5b942", blue: "#3291ff", magenta: "#6cb2ff", cyan: "#32d583", white: "#fafafa", brightBlack: "#a1a1a1", brightRed: "#ff8a8a", brightGreen: "#5ce8a3", brightYellow: "#ffcf5c", brightBlue: "#6cb2ff", brightMagenta: "#8cc6ff", brightCyan: "#5ce8a3", brightWhite: "#ffffff", scrollbarSliderBackground: "#fafafa1a", scrollbarSliderHoverBackground: "#fafafa33", scrollbarSliderActiveBackground: "#fafafa47" }
};

function PaneIcon({ name, size = 14 }) {
  const paths = {
    grip: <><circle cx="8" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="17" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="1.3" fill="currentColor" stroke="none"/></>,
    expand: <><path d="M14 5h5v5"/><path d="m19 5-7 7"/><path d="M10 19H5v-5"/><path d="m5 19 7-7"/></>,
    restore: <><rect x="5" y="7" width="12" height="12" rx="2"/><path d="M8 7V5h11v11h-2"/></>,
    more: <><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
    controls: <><path d="M4 8h7"/><path d="M17 8h3"/><path d="M4 16h3"/><path d="M13 16h7"/><circle cx="14" cy="8" r="2.2"/><circle cx="10" cy="16" r="2.2"/></>,
    search: <><circle cx="11" cy="11" r="6"/><path d="m20 20-3.7-3.7"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></>,
    play: <><path d="M8 5.6a.9.9 0 0 1 1.37-.77l9 6.4a.9.9 0 0 1 0 1.54l-9 6.4A.9.9 0 0 1 8 18.4Z" fill="currentColor" stroke="none"/></>,
    stop: <><rect x="6.5" y="6.5" width="11" height="11" rx="1.8" fill="currentColor" stroke="none"/></>,
    restart: <><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.6h-4.6"/></>,
    bell: <><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/></>,
    rename: <><path d="M4 20h16"/><path d="M14.5 4.5a2.1 2.1 0 0 1 3 3L8.5 16.5 4.5 17.5l1-4Z"/></>,
    settings: <><path d="M4 7h9"/><path d="M18 7h2"/><path d="M4 17h4"/><path d="M13 17h7"/><circle cx="15.5" cy="7" r="2.4"/><circle cx="10.5" cy="17" r="2.4"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></>,
    clear: <><path d="M4 18h16"/><path d="m9 14 7.5-7.5a2.1 2.1 0 0 1 3 3L12 17H7Z"/></>,
    up: <><path d="m6 15 6-6 6 6"/></>,
    down: <><path d="m6 9 6 6 6-6"/></>,
    close: <><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></>,
    popout: <><path d="M14 4h6v6"/><path d="m20 4-8 8"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></>,
    duplicate: <><rect x="4" y="4" width="11" height="11" rx="2"/><path d="M9 19h8a2 2 0 0 0 2-2V9"/></>,
    trash: <><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2"/></>,
    power: <><path d="M12 4v8"/><path d="M18.4 7.6a9 9 0 1 1-12.8 0"/></>
  };
  return <svg className="pane-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

// Uptime derived from the engine-reported runtime. Never invented: an idle or
// exited worker reports no uptime rather than a stale duration.
function uptime(session) {
  if (!session?.isAlive || !Number.isFinite(session?.startTime)) return null;
  const minutes = Math.max(0, Math.floor((Date.now() - session.startTime) / 60000));
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

// Ownership is a fact, not a guess: OUTARCH owns every PTY it spawns.
// The PID comes straight from the engine summary when a process is live.
function ownership(session) {
  if (session?.isAlive && Number.isFinite(session?.pid)) return `Engine PTY · pid ${session.pid}`;
  if (session?.isAlive) return "Engine-owned PTY";
  if (session?.status === "failed") return Number.isInteger(session?.exitCode) ? `Exited ${session.exitCode}` : "Failed";
  if (session?.status === "exited") return Number.isInteger(session?.exitCode) ? `Exited ${session.exitCode}` : "Exited";
  return "No process";
}

// One short line describing what the worker is doing right now, using only
// engine-reported evidence. Falls back to silence, never to a fabricated state.
function activity(session, connection) {
  if (session?.attentionRequired && session.attentionReason) return session.attentionReason;
  if (session?.spawnError) return session.spawnError;
  if (!session?.isAlive) return session?.status === "failed" ? "Review the last output before restarting" : "Not running";
  if (connection === "overflow") return "Output exceeded the desktop stream buffer";
  const line = String(session?.lastLine || "").trim();
  return line ? line.slice(0, 140) : "Running · no output reported yet";
}

export default function TerminalPane({ session, sessions, profile, active, expanded, minimized = false, shortcut, style, canEmpty = true, terminalFontSize = 13, terminalTheme = "orbital", terminalCursor = "bar", terminalScrollback = 5000, onFocus, onToggleExpanded, onAction, onSelectSession, onDropSession, onReconfigure, onDuplicate, onTerminalError, onTerminalRecovered, onAskAI, canPopOut = true, chrome = "pane", findSignal = 0 }) {
  const hostRef = React.useRef(null);
  const terminalRef = React.useRef(null);
  const fitRef = React.useRef(null);
  const streamRef = React.useRef(null);
  // Tracks whether the engine-owned PTY behind this pane is still running.
  // Once it exits, the pane keeps reflowing xterm locally but must never send
  // another `terminal.resize` to a dead stream.
  const aliveRef = React.useRef(Boolean(session?.isAlive));
  // Cross-effect invitations: the terminal effect owns the reflow routine and
  // the connection effect owns the operational-error reporter, and each other's
  // scope reaches them through these. Both are always set before anything can
  // call them (the terminal effect runs first on mount).
  const fitAndResizeRef = React.useRef(null);
  const reportOperationalErrorRef = React.useRef(null);
  const headerRef = React.useRef(null);
  // A pane header sheds its lowest-value controls as the pane narrows (the
  // `pane-head` container queries own that, in CSS). Everything it sheds is in
  // the ⋯ menu, which is present at every width, so a narrow pane never has a
  // capability that is simply gone from the screen. The pane used to carry a
  // second panel beside that menu holding the same three entries; one list is
  // enough, and the width mirror that decided when to show it is gone with it.
  const minimizedRef = React.useRef(Boolean(minimized));
  const onTerminalErrorRef = React.useRef(onTerminalError);
  const onTerminalRecoveredRef = React.useRef(onTerminalRecovered);
  onTerminalErrorRef.current = onTerminalError;
  onTerminalRecoveredRef.current = onTerminalRecovered;
  const [connection, setConnection] = React.useState(session?.isAlive ? "connecting" : "offline");
  const [message, setMessage] = React.useState("");
  const [chooserOpen, setChooserOpen] = React.useState(false);
  const chooserRef = React.useRef(null);
  const chooserTriggerRef = React.useRef(null);
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  React.useEffect(() => { if (renaming) setRenameValue(session.name || ""); }, [renaming, session.name]);
  const [dragOver, setDragOver] = React.useState(false);
  const [findOpen, setFindOpen] = React.useState(false);
  const [findQuery, setFindQuery] = React.useState("");
  const [findMessage, setFindMessage] = React.useState("");
  // §19.8 — right-click is the desktop convention for terminal actions, and a
  // popped-out window (which draws no pane header at all) needs the same
  // copy/paste route without one. Hand-built, like the session chooser: the
  // pane's one hand-built menu is already accounted for, so this one uses no
  // menu role and no popover primitive.
  const [contextMenu, setContextMenu] = React.useState(null);
  const contextMenuRef = React.useRef(null);
  const findCursorRef = React.useRef(null);
  // The search floats over the top of the output instead of taking a row of
  // its own, so opening it never shrinks and refits the terminal it searches.
  const [findTop, setFindTop] = React.useState(34);
  // In its own window the pane is only the terminal: the window strip carries
  // the name, state, search and the way back, so the pane header (grid-only
  // controls: pane shortcut, drag to another pane, maximise) and the activity
  // line are not drawn at all.
  const windowChrome = chrome === "window";
  React.useEffect(() => { if (findSignal) setFindOpen(true); }, [findSignal]);
  const closeFind = React.useCallback(() => {
    setFindOpen(false);
    setFindMessage("");
    terminalRef.current?.clearSelection();
    terminalRef.current?.focus();
  }, []);

  React.useLayoutEffect(() => {
    minimizedRef.current = Boolean(minimized);
  }, [minimized]);

  // Right-click menu contract: any pointer-down outside it closes it, any
  // non-modifier key closes it, and Escape closes it. Opening the menu keeps
  // the terminal focused, so the keys the shell expects are unaffected.
  React.useEffect(() => {
    if (!contextMenu) return undefined;
    const closeContextMenu = () => setContextMenu(null);
    const onKey = event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeContextMenu(); return; }
      if (!["Shift", "Control", "Alt", "Meta"].includes(event.key)) closeContextMenu();
    };
    const onDown = event => { if (!contextMenuRef.current?.contains(event.target)) closeContextMenu(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("pointerdown", onDown, true);
    window.addEventListener("blur", closeContextMenu);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("blur", closeContextMenu);
    };
  }, [contextMenu]);

  // Session chooser keyboard + dismissal contract: focus the first item on open,
  // Arrow keys roam, Escape and an outside pointer close it and return focus to
  // the trigger.
  React.useEffect(() => {
    if (!chooserOpen) return undefined;
    const menu = chooserRef.current;
    const items = () => (menu ? [...menu.querySelectorAll('[role="menuitem"]')] : []);
    const list = items();
    (list.find(node => node.classList.contains("is-current")) || list[0])?.focus();
    const restore = () => { setChooserOpen(false); chooserTriggerRef.current?.focus(); };
    const onKey = event => {
      if (event.key === "Escape") { event.preventDefault(); restore(); return; }
      if (event.key === "Tab") { restore(); return; }
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        const nodes = items();
        const index = nodes.indexOf(document.activeElement);
        const target = event.key === "Home" ? 0
          : event.key === "End" ? nodes.length - 1
          : event.key === "ArrowDown" ? (index + 1) % nodes.length
          : (index - 1 + nodes.length) % nodes.length;
        nodes[target]?.focus();
      }
    };
    const onPointerDown = event => {
      if (menu && !menu.contains(event.target) && event.target !== chooserTriggerRef.current) setChooserOpen(false);
    };
    menu?.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      menu?.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [chooserOpen]);

  React.useLayoutEffect(() => {
    if (!findOpen) return;
    const host = hostRef.current;
    const header = headerRef.current;
    const top = host && host.offsetHeight > 0
      ? host.offsetTop
      : header ? header.offsetTop + header.offsetHeight : 28;
    setFindTop(top + 6);
  }, [findOpen, message]);

  const find = React.useCallback(direction => {
    const terminal = terminalRef.current;
    const query = findQuery.trim();
    if (!terminal || !query) return;
    const buffer = terminal.buffer.active;
    const previous = findCursorRef.current?.query === query ? findCursorRef.current : null;
    const firstRow = previous ? previous.row + direction : direction > 0 ? 0 : Math.max(0, buffer.length - 1);
    for (let offset = 0; offset < buffer.length; offset++) {
      const row = (firstRow + direction * offset + buffer.length) % buffer.length;
      const text = buffer.getLine(row)?.translateToString(true) || "";
      const column = direction > 0 ? text.toLowerCase().indexOf(query.toLowerCase()) : text.toLowerCase().lastIndexOf(query.toLowerCase());
      if (column < 0) continue;
      terminal.select(column, row, query.length);
      terminal.scrollToLine(row);
      findCursorRef.current = { query, row, column };
      setFindMessage(`Line ${row + 1}`);
      return;
    }
    setFindMessage("No match");
  }, [findQuery]);

  // The terminal's own life cycle. This effect owns the xterm instance — its
  // handlers, link following and reflow — and deliberately does NOT depend on
  // the worker's liveness: §19.5. A stream exiting or restarting keeps this
  // widget, its scrollback and its settings exactly where they are; the
  // connection effect below owns the stream. Rebuilding xterm because
  // `isAlive` changed was the bug behind the frozen column of a Ctrl+C'd
  // shell — the exit notification tore the widget down mid-render — and every
  // restart threw the transcript away with it.
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || !session) return undefined;

    const terminal = new Terminal({
      allowProposedApi: false,
      convertEol: false,
      cursorBlink: active,
      cursorStyle: terminalCursor,
      // xterm exposes an aria-live mirror of the viewport for NVDA (Windows) and
      // VoiceOver (macOS). Limitation: it announces newly printed rows and cursor
      // movement, not arbitrary scrollback review — use Ctrl+F search / "Copy all"
      // for a full transcript with assistive tech.
      screenReaderMode: true,
      fontFamily: "'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
      fontSize: terminalFontSize,
      fontWeight: "400",
      fontWeightBold: "600",
      letterSpacing: 0.15,
      lineHeight: 1.3,
      scrollback: terminalScrollback,
      theme: TERMINAL_THEMES[terminalTheme] || TERMINAL_THEMES.orbital
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(host);
    // Every OUTARCH shortcut is a `window` keydown listener, and xterm
    // finishes a key it claims by calling stopPropagation on it. While a
    // terminal had focus — which on the Workspace is nearly always — not one
    // of them ever ran: the palette, the navigation chords, focus mode and the
    // pane shortcuts were all dead exactly where they were most useful.
    // Returning false here makes xterm skip the key without cancelling it, so
    // it keeps propagating; every other key still belongs to the shell.
    terminal.attachCustomKeyEventHandler(event => {
      if (event.type !== "keydown") return true;
      const key = String(event.key || "").toLowerCase();
      const accelerator = event.ctrlKey || event.metaKey;
      // This pane's own search. Its control has always advertised Ctrl F and
      // nothing was ever listening for it. It is bound on the terminal rather
      // than on the window because exactly one terminal has focus, and it is
      // the one the search should open on.
      if (accelerator && !event.shiftKey && !event.altKey && key === "f") {
        event.preventDefault();
        event.stopPropagation();
        setFindOpen(true);
        return false;
      }
      // Copy is the terminal convention Ctrl Shift C, so a selection can be
      // copied without the pane menu — which a popped-out window does not draw.
      // Ctrl C alone stays the shell's interrupt.
      if (accelerator && event.shiftKey && !event.altKey && key === "c") {
        event.preventDefault();
        const selection = terminal.getSelection();
        if (selection) void copyText(selection).catch(() => {});
        return false;
      }
      // Paste: Ctrl V, Ctrl Shift V and Shift Insert go to the browser, which
      // pastes into xterm (terminalInput.js explains why xterm cannot).
      if (isPasteChord(event)) return false;
      // Alt V is Claude Code's image paste on Windows and no shortcut here.
      if (isShellAltChord(event)) return true;
      // Alt is the workspace modifier: pane focus, layout, focus mode, the
      // in-app browser and every route jump.
      if (event.altKey && !accelerator) return false;
      if (accelerator && !event.altKey && (key === "k" || key === "n")) return false;
      if (accelerator && event.shiftKey && ["b", "r", "s"].includes(key)) return false;
      if (event.key === "F1") return false;
      return true;
    });
    terminalRef.current = terminal;
    fitRef.current = fit;

    let disposed = false;
    let resizeFrame = null;
    let engineResizeTimer = null;
    let sentGeometry = null;
    let inputDisposable = { dispose() {} };

    const fitAndResize = () => {
      if (disposed || !host.isConnected || minimizedRef.current) return;
      try {
        fit.fit();
      } catch {
        return;
      }
      // Reflow xterm locally on every geometry change, but only tell the
      // engine about a new PTY shape while the worker is still alive and only
      // when the columns or rows changed since the last send. A trailing
      // debounce coalesces the burst a slider drag or a window resettle
      // produces (§19.5), so the PTY sees the settled shape, not every
      // intermediate one. Sizing an exited stream is rejected by the Protocol
      // and must not be attempted.
      const streamId = streamRef.current;
      if (streamId && aliveRef.current) {
        if (engineResizeTimer) window.clearTimeout(engineResizeTimer);
        engineResizeTimer = window.setTimeout(() => {
          engineResizeTimer = null;
          if (disposed || minimizedRef.current || !host.isConnected) return;
          const currentStream = streamRef.current;
          if (!currentStream || !aliveRef.current) return;
          const cols = terminal.cols;
          const rows = terminal.rows;
          if (sentGeometry && sentGeometry.cols === cols && sentGeometry.rows === rows) return;
          sentGeometry = { cols, rows };
          void missionApi().request("terminal.resize", {
            streamId: currentStream,
            cols,
            rows
          }).catch(error => { if (!disposed) reportOperationalErrorRef.current?.(error); });
        }, 120);
      } else if (engineResizeTimer) {
        // The stream exited between scroll and send: never deliver a shape a
        // dead worker did not ask to hold.
        window.clearTimeout(engineResizeTimer);
        engineResizeTimer = null;
      }
    };
    fitAndResizeRef.current = fitAndResize;

    const resizeObserver = new ResizeObserver(() => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(fitAndResize);
    });
    resizeObserver.observe(host);

    // §19.8 — URLs a worker prints were inert text. xterm 6 resolves provider
    // links with no addon surface, and the follow gesture is the terminal
    // convention: Ctrl or Cmd Click, never a plain click, which keeps the
    // terminal's own selecting behavior. The main-process opener is
    // scheme-gated, so only http(s) links are offered here at all.
    terminal.registerLinkProvider({
      provideLinks(bufferLineNumber, callback) {
        const row = terminal.buffer.active.getLine(bufferLineNumber);
        if (!row) return callback(undefined);
        const line = row.translateToString(true);
        const links = [];
        for (const match of line.matchAll(/https?:\/\/[^\s"'<>()\[\]{}\\^`|]+/g)) {
          const url = line.slice(match.index, match.index + match[0].length).replace(/[.,;:!?)\]'"”’]+$/, "");
          if (!url) continue;
          links.push({
            range: {
              start: { x: match.index + 1, y: bufferLineNumber },
              end: { x: match.index + url.length, y: bufferLineNumber }
            },
            text: url,
            decorations: { underline: true, pointerCursor: true },
            activate(event, linkText) {
              if (!event.ctrlKey && !event.metaKey) return;
              event.preventDefault();
              void window.missionControl?.openExternal?.(linkText)?.catch?.(() => {});
            }
          });
        }
        callback(links.length ? links : undefined);
      }
    });

    inputDisposable = terminal.onData(data => {
      const currentStream = streamRef.current;
      if (!currentStream) return;
      // A long paste arrives as one string; it is sent in pieces the
      // protocol accepts. Requests reach the main process in order.
      for (const piece of chunkTerminalInput(data)) {
        void missionApi().request("terminal.write", { streamId: currentStream, data: piece }).catch(error => {
          if (!disposed) reportOperationalErrorRef.current?.(error);
        });
      }
    });

    return () => {
      disposed = true;
      if (engineResizeTimer) window.clearTimeout(engineResizeTimer);
      resizeObserver.disconnect();
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      inputDisposable.dispose();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
      fitAndResizeRef.current = null;
    };
  // Liveness and startTime are intentionally not here. The stream is owned by
  // the connection effect below; re-dressing the terminal (a font, theme,
  // cursor or scrollback change) rebuilds xterm and nothing else, and a
  // worker exit or restart never tears this side down at all.
  }, [session?.id, terminalFontSize, terminalTheme, terminalCursor, terminalScrollback]);

  // The connection's life cycle: one subscription and at most one open stream
  // at a time, owned by the stream rather than by the terminal (§19.5). An
  // exit keeps the transcript on screen and closes the stream here. A restart
  // — `isAlive` flipping true with a fresh `startTime` — closes any stale
  // stream and opens a new one into the terminal this pane already has,
  // instead of rebuilding the widget. A font or theme change never runs this
  // effect at all, so re-dressing the terminal cannot drop a live stream.
  React.useEffect(() => {
    if (!session) return undefined;
    aliveRef.current = Boolean(session.isAlive);

    let disposed = false;
    const reportOperationalError = value => {
      const reason = value instanceof Error ? value.message : String(value || "Terminal connection failed");
      setMessage(reason);
      onTerminalErrorRef.current?.(session.id, reason);
      return reason;
    };
    reportOperationalErrorRef.current = reportOperationalError;

    const unsubscribe = missionApi().subscribe(notification => {
      const type = notificationType(notification);
      if (!["terminal:data", "terminal:exit", "terminal.exit", "terminal:overflow"].includes(type)) return;
      const payload = notificationPayload(notification);
      if (!streamRef.current || streamIdentifier(payload) !== streamRef.current) return;

      if (type === "terminal:data") {
        terminalRef.current?.write(String(payload.data ?? ""));
      } else if (type === "terminal:exit" || type === "terminal.exit") {
        aliveRef.current = false;
        setConnection("exited");
        terminalRef.current?.writeln("\r\n\x1b[38;2;161;161;161m[worker exited]\x1b[0m");
      } else {
        setConnection("overflow");
        reportOperationalError("Output exceeded the desktop stream buffer. Reopen this pane to resync.");
      }
    });

    const open = async () => {
      const terminal = terminalRef.current;
      if (!session.isAlive || !terminal) return;
      setConnection("connecting");
      try {
        // A restart clears the previous run's rows before the fresh stream's
        // replay arrives — the transcript on screen already said what ended.
        terminal.reset();
        // State the pane's measured geometry with the stream request, so the
        // engine wraps the PTY at these columns before the replay is captured
        // (§19.5.3): an alternate screen (a TUI like Ollama's) arrives drawn,
        // not truncated at the kernel's spawn default of 120×30. The
        // measurement is best effort — the engine default size is usable, and
        // the post-activation resync negotiates the settled shape.
        try { fitRef.current?.fit(); } catch { /* pane mid-transition */ }
        const params = { sessionId: session.id };
        if (Number.isInteger(terminal.cols) && terminal.cols > 1 && Number.isInteger(terminal.rows) && terminal.rows > 1) {
          params.cols = terminal.cols;
          params.rows = terminal.rows;
        }
        const opened = await missionApi().request("terminal.open", params);
        if (disposed) {
          const orphanId = streamIdentifier(opened);
          if (orphanId) void missionApi().request("terminal.close", { streamId: orphanId }).catch(() => {});
          return;
        }
        if (opened?.ok === false) throw new Error(opened.error || "Terminal stream was rejected");

        const streamId = streamIdentifier(opened);
        if (!streamId) throw new Error("Terminal stream did not return an identifier");
        streamRef.current = streamId;

        const replay = opened.replay;
        const replayData = typeof replay === "string" ? replay : replay?.data;
        const replayComplete = typeof replay === "string" || replay?.complete !== false;
        if (replayData && (replayComplete || replay?.source === "snapshot")) {
          terminalRef.current?.write(replayData);
        } else {
          const fallbackLines = opened.snapshot?.lines || opened.snapshotLines || [];
          if (fallbackLines.length) terminalRef.current?.write(`${fallbackLines.join("\r\n")}\r\n`);
        }

        const activated = await missionApi().request("terminal.activate", { streamId });
        if (disposed) return;
        const pending = activated?.pending ?? activated?.data ?? opened.pending;
        if (pending) terminalRef.current?.write(String(pending));
        setConnection("live");
        onTerminalRecoveredRef.current?.(session.id);
        window.requestAnimationFrame(() => fitAndResizeRef.current?.());

      } catch (openError) {
        if (!disposed) {
          setConnection("error");
          const reason = reportOperationalError(openError);
          terminalRef.current?.writeln(`\x1b[38;2;255;95;95m[terminal unavailable: ${reason}]\x1b[0m`);
        }
      }
    };

    void open();

    return () => {
      disposed = true;
      unsubscribe?.();
      // The stream the pane opened is the connection's responsibility. It is
      // closed here — when the worker switches into this pane, exits, or is
      // restarted — and NOT when the terminal above is rebuilt, which is what
      // keeps a font or theme change reading the same PTY stream.
      const streamId = streamRef.current;
      streamRef.current = null;
      if (streamId) void missionApi().request("terminal.close", { streamId }).catch(() => {});
      reportOperationalErrorRef.current = null;
    };
  // startTime is the terminal epoch exposed by the engine summary. A fast
  // restart can transition back to running before React observes the exited
  // state, so this dependency still replaces the stale stream deterministically.
  }, [session?.id, session?.isAlive, session?.startTime]);

  React.useEffect(() => {
    const handle = event => {
      if (!active || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "f") return;
      event.preventDefault();
      setFindOpen(true);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [active]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        fitRef.current?.fit();
        if (active) terminalRef.current?.focus();
      } catch {
        // The pane may be transitioning between grid and focus mode.
      }
      // A restore from a minimized strip settles at a size the engine has
      // never seen; the reflow routine's trailing debounce carries it there
      // (§19.5) even if the ResizeObserver already missed the 1px strip.
      fitAndResizeRef.current?.();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active, expanded, minimized]);

  React.useEffect(() => {
    if (terminalRef.current) terminalRef.current.options.cursorBlink = active;
  }, [active]);

  // Uptime is a clock, so it needs its own slow tick. It runs only while the
  // engine reports the worker alive and is cleared on exit or unmount, so no
  // timer survives a stopped pane.
  const [, setUptimeTick] = React.useState(0);
  React.useEffect(() => {
    if (!session?.isAlive) return undefined;
    const timer = window.setInterval(() => setUptimeTick(value => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, [session?.isAlive, session?.startTime]);

  if (!session) return null;
  const uptimeLabel = uptime(session);
  const activityLabel = activity(session, connection);
  // What an idle pane says about itself, from engine-reported state only: a
  // worker that never started and one that ran and exited are different
  // situations and the pane should not call both of them the same thing.
  // Said as what starting it does, not as the shell wrapper the Add terminal
  // form stores ("powershell.exe -NoLogo -NoProfile -NoExit -Command claude").
  const launch = describeLaunch(session.command, session.args);
  const idleState = session.spawnError
    ? { title: "Could not start", detail: session.spawnError }
    : session.status === "exited"
      ? {
          title: session.exitCode === 0 ? "Finished" : "Stopped",
          detail: Number.isInteger(session.exitCode)
            ? `The process exited with code ${session.exitCode}.`
            : "The process is no longer running."
        }
      : {
          title: "Not running",
          detail: launch.shell && !launch.runs
            ? `Starting it opens an interactive ${launch.shell} in this project.`
            : launch.shell ? `Starting it opens ${launch.shell} and runs:` : "Starting it runs:"
        };
  const requestAction = (type, fields = {}) => {
    setActionMenuOpen(false);
    onAction?.(type, session.id, fields);
  };
  const copySelection = async () => {
    setActionMenuOpen(false);
    const value = terminalRef.current?.getSelection();
    if (!value) {
      setMessage("Select terminal text before copying.");
      return;
    }
    try {
      await copyText(value);
      setMessage("Selection copied.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The selection could not be copied.");
    }
  };
  const clearDisplay = () => {
    setActionMenuOpen(false);
    terminalRef.current?.clear();
    setMessage("Display cleared. The worker is still running.");
  };

  // The right-click menu's entries. A popped-out window draws no pane header,
  // so this route is the only copy path it shares with the keyboard chord —
  // every entry below works there too.
  const closeContextMenu = () => setContextMenu(null);
  const contextItems = [
    { key: "copy", label: "Copy", disabled: !terminalRef.current?.hasSelection(), run: () => { const value = terminalRef.current?.getSelection(); if (value) void copyText(value).catch(() => {}); } },
    { key: "paste", label: "Paste", run: async () => { try { const text = await window.missionControl?.readClipboardText?.(); if (text) terminalRef.current?.paste(text); } catch { /* clipboard refused */ } } },
    { key: "select-all", label: "Select all", run: () => terminalRef.current?.selectAll() },
    { key: "clear", label: "Clear display", run: clearDisplay },
    { key: "find", label: "Find in output", run: () => setFindOpen(true) }
  ];

  const detachToWindow = async () => {
    try {
      // The pane this terminal is leaving is named so a later recall can return
      // it to the same slot and split rather than a fallback position.
      await missionApi().request("terminal.window.detach", {
        workerId: session.id,
        slotId: Number.isInteger(shortcut) ? `slot-${shortcut - 1}` : null
      });
    } catch (error) {
      // The three-window limit and a failed window open both land here, and
      // both need to be read: silently doing nothing looks like a broken menu.
      setMessage(error instanceof Error ? error.message : "This terminal could not be opened in its own window.");
    }
  };

  return (
    <article
      className={`terminal-pane role-${profile?.key || "terminal"} ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""} ${minimized ? "is-minimized" : ""} ${dragOver ? "is-drop-target" : ""}`}
      style={style}
      aria-label={minimized ? `${session.name}, minimized terminal` : undefined}
      onMouseDown={onFocus}
      onDragEnter={event => { if (event.dataTransfer.types.includes("application/x-mission-worker")) setDragOver(true); }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false); }}
      onDragOver={event => { if (event.dataTransfer.types.includes("application/x-mission-worker")) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }}
      onDrop={event => { event.preventDefault(); setDragOver(false); const id = event.dataTransfer.getData("application/x-mission-worker"); if (id && id !== session.id) onDropSession(id); }}
    >
      {minimized ? <header className="terminal-pane__header terminal-pane__header--minimized" onClick={onToggleExpanded}>
        <div className="terminal-pane__identity">
          <span className={`status-dot status-${session.status} role-${profile?.key || "terminal"}`}/>
          <div><strong>{session.name}</strong><span className={`terminal-role-tag role-${profile?.key || "terminal"}`} title="Role inferred from the command — not an engine-reported fact">{profile?.label || "Terminal"}</span></div>
        </div>
        <span className="terminal-minimized-state">{session.isAlive ? "Live" : session.status}</span>
        <button type="button" className="icon-button terminal-restore" title={`Maximize ${session.name}`} aria-label={`Maximize ${session.name}`} onClick={event => { event.stopPropagation(); onToggleExpanded?.(); }}><PaneIcon name="restore"/></button>
      </header> : <>
      {!windowChrome && <header className="terminal-pane__header" ref={headerRef}>
        <div className="terminal-pane__identity">
          <span className={`status-dot status-${session.status} role-${profile?.key || "terminal"}`} />
          <div>
            <button
              ref={chooserTriggerRef}
              type="button"
              className="terminal-session-trigger"
              onClick={event => { event.stopPropagation(); setChooserOpen(value => !value); }}
              onKeyDown={event => { if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && !chooserOpen) { event.preventDefault(); setChooserOpen(true); } }}
              aria-expanded={chooserOpen}
              aria-haspopup="menu"
              title={`${session.name} · ${session.command}
${ownership(session)} · ${session.cwd || "."}
Switch pane`}
            >
              <strong>{session.name}</strong><span aria-hidden="true"><Chevron/></span>
            </button>
            {chooserOpen && <div ref={chooserRef} className="terminal-session-menu" role="menu" onMouseDown={event => event.stopPropagation()}>
              <div className="terminal-session-menu__label">{canEmpty ? "SHOW IN THIS PANE" : "MOVE A TERMINAL HERE"}</div>
              {sessions.map(option => <button type="button" role="menuitem" className={option.id === session.id ? "is-current" : ""} key={option.id} onClick={() => { onSelectSession(option.id); setChooserOpen(false); }}><i className={`status-${option.status}`}/><span><strong>{option.name}</strong><small>{option.command}</small></span>{option.id === session.id && <b>Current</b>}</button>)}
              {/* Freeing a position only means something where a position can be
                  empty. The mosaic mounts every worker, so there is nothing to
                  free and the option would do nothing if offered. */}
              {canEmpty && <button type="button" role="menuitem" onClick={() => { onSelectSession(""); setChooserOpen(false); }}><i/><span><strong>Empty pane</strong><small>Free this position</small></span></button>}
            </div>}
            {/* T086/T087 — progressive disclosure. State is the one fact that is
                always visible, because it is the reason you would look at a pane
                header at all. Role and uptime are useful when there is room and
                are dropped by container query as panes narrow. Ownership and cwd
                are reference detail: they stay reachable on the identity tooltip
                and in the inspector, but they no longer compete with the state
                of six panes at once. Engine-reported facts only. */}
            <span className="terminal-pane__facts">
              {profile?.label && <b className={`terminal-role-tag role-${profile.key}`} title="Role inferred from the command — not an engine-reported fact">{profile.label}</b>}
              <em className="terminal-pane__state">{session.status}</em>
              {uptimeLabel && <em className="terminal-pane__uptime" title="Uptime since the engine started this worker">{uptimeLabel}</em>}
            </span>
          </div>
        </div>
        {renaming && <form className="terminal-rename" onSubmit={event => {
        event.preventDefault();
        const next = renameValue.trim();
        setRenaming(false);
        if (!next || next === session.name) return;
        // T093 — a label change is a `rename` action, which the command router
        // classifies as safe. It never touches the command, the cwd or the PTY.
        onAction?.("rename", session.id, { name: next });
      }}>
        <input
          autoFocus
          value={renameValue}
          maxLength={60}
          aria-label={`Rename ${session.name}`}
          onChange={event => setRenameValue(event.target.value)}
          onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setRenaming(false); } }}
        />
        <button type="submit" disabled={!renameValue.trim()}>Rename</button>
        <button type="button" onClick={() => setRenaming(false)}>Cancel</button>
      </form>}
        <div className="terminal-pane__actions">
          {shortcut && <kbd className="terminal-shortcut" title={`Focus pane · Alt ${shortcut}`}>Alt {shortcut}</kbd>}
          <button type="button" className="terminal-drag-handle" draggable title="Drag terminal to another pane" aria-label={`Move ${session.name} to another terminal pane`} onMouseDown={event => event.stopPropagation()} onDragStart={event => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-mission-worker", session.id); event.dataTransfer.setData("text/plain", session.id); }}>
            <PaneIcon name="grip"/>
          </button>
          <button type="button" className="quiet-button" onClick={() => (findOpen ? closeFind() : setFindOpen(true))} aria-expanded={findOpen} title="Search terminal · Ctrl F">Find</button>
          {/* Running or not running is the one thing about a terminal you change
              most often, and it was two levels down a menu whose own label had
              to be read to learn which of the two it would do. It is a control
              now: one glyph, one verb, and the state is the glyph. */}
          <button
            type="button"
            className={`icon-button terminal-pane__run ${session.isAlive ? "terminal-pane__run--stop" : "terminal-pane__run--start"}`}
            title={session.isAlive ? `Stop ${session.name}` : `Start ${session.name} · ${session.command || "configured command"}`}
            aria-label={session.isAlive ? `Stop ${session.name}` : `Start ${session.name}`}
            onMouseDown={event => event.stopPropagation()}
            onClick={() => requestAction(session.isAlive ? "kill" : "start")}
          ><PaneIcon name={session.isAlive ? "stop" : "play"}/></button>
          <DropdownMenu.Root open={actionMenuOpen} onOpenChange={setActionMenuOpen}>
            <DropdownMenu.Trigger asChild><button type="button" className="icon-button terminal-more" aria-label={`More actions for ${session.name}`} onMouseDown={event => event.stopPropagation()}><PaneIcon name="more"/></button></DropdownMenu.Trigger>
            {/* One grammar for every entry: a glyph, the verb, and either the
                key that does it or one line saying what it touches. The pane
                used to carry a second panel of its own alongside this one, so
                half of these appeared twice with two different shapes; there is
                one list now, and it is this one. */}
            <DropdownMenu.Portal><DropdownMenu.Content className="terminal-action-menu" align="end" sideOffset={7} collisionPadding={12} onCloseAutoFocus={event => event.preventDefault()}>
              <DropdownMenu.Label className="terminal-action-label">This terminal</DropdownMenu.Label>
              <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={() => { setActionMenuOpen(false); onFocus?.(); terminalRef.current?.focus(); }}><PaneIcon name="target"/><span>Focus terminal</span>{shortcut ? <kbd>Alt {shortcut}</kbd> : null}</DropdownMenu.Item>
              <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={() => { setActionMenuOpen(false); setFindOpen(true); }}><PaneIcon name="search"/><span>Find in output</span><kbd>Ctrl F</kbd></DropdownMenu.Item>
              <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={() => void copySelection()}><PaneIcon name="copy"/><span>Copy selection</span><kbd>Ctrl Shift C</kbd></DropdownMenu.Item>
              <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={clearDisplay}><PaneIcon name="clear"/><span>Clear display</span></DropdownMenu.Item>
              {/* Drag is the pane's own gesture, so this offers the gesture
                  rather than a button pretending to be one. It closes as the
                  drag begins so the canvas underneath is visible while aiming. */}
              <div
                className="terminal-action-item is-compact terminal-action-drag"
                role="menuitem"
                tabIndex={-1}
                draggable
                aria-label={`Move ${session.name} to another terminal pane`}
                onDragStart={event => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-mission-worker", session.id); event.dataTransfer.setData("text/plain", session.id); setActionMenuOpen(false); }}
              ><PaneIcon name="grip"/><span>Move to another pane</span><small>Drag onto the pane you want it in</small></div>

              <DropdownMenu.Separator className="terminal-action-separator"/>
              <DropdownMenu.Label className="terminal-action-label">This worker</DropdownMenu.Label>
              {session.isAlive && <DropdownMenu.Item className="terminal-action-item" onSelect={() => requestAction("restart")}><PaneIcon name="restart"/><span>Restart worker</span><small>Stop the running process and start it again</small></DropdownMenu.Item>}
              {session.attentionRequired && <DropdownMenu.Item className="terminal-action-item" onSelect={() => requestAction("acknowledge")}><PaneIcon name="bell"/><span>Acknowledge alert</span><small>Clear the operator notification only</small></DropdownMenu.Item>}
              <DropdownMenu.Item className="terminal-action-item" onSelect={() => { setActionMenuOpen(false); setRenaming(true); }}><PaneIcon name="rename"/><span>Rename</span><small>Change the display label only — the command and process are untouched</small></DropdownMenu.Item>
              {onReconfigure && <DropdownMenu.Item className="terminal-action-item" onSelect={() => { setActionMenuOpen(false); onReconfigure(session); }}><PaneIcon name="settings"/><span>Reconfigure worker</span><small>Edit command, arguments, directory and restore policy</small></DropdownMenu.Item>}
              {/* The launch policy is a setting, so it is offered as one: a
                  checkbox item that states whether it is on, rather than an
                  action whose label has to be read to learn the current state. */}
              <DropdownMenu.CheckboxItem className="terminal-action-item" checked={Boolean(session.autoStart)} onCheckedChange={checked => requestAction("setAutoStart", { enabled: checked === true })}>
                <PaneIcon name="power"/>
                <span>Start with workspace</span>
                <small>{session.autoStart ? "On — starts when this project opens" : "Off — stays idle until you start it"}</small>
              </DropdownMenu.CheckboxItem>
              {onDuplicate && <DropdownMenu.Item className="terminal-action-item" onSelect={() => { setActionMenuOpen(false); onDuplicate(session); }}><PaneIcon name="duplicate"/><span>Duplicate worker</span><small>Opens a new worker pre-filled from this one — review the command and directory before it is created</small></DropdownMenu.Item>}
              <DropdownMenu.Separator className="terminal-action-separator"/>
              <DropdownMenu.Item className="terminal-action-item is-danger" onSelect={() => requestAction("remove")}><PaneIcon name="trash"/><span>Delete terminal</span><small>Remove this worker definition after confirmation</small></DropdownMenu.Item>
            </DropdownMenu.Content></DropdownMenu.Portal>
          </DropdownMenu.Root>
          {/* Pop out is a window action, so it sits with the other one — beside
              maximise — as a control, not three levels down the menu. A pane
              already in its own window does not offer it. */}
          {canPopOut && <button
            type="button"
            className="icon-button terminal-pane__popout"
            title="Pop out terminal · its own window, the worker keeps running"
            aria-label={`Pop out ${session.name} into its own window`}
            onMouseDown={event => event.stopPropagation()}
            onClick={() => void detachToWindow()}
          ><PaneIcon name="popout"/></button>}
          <button
            type="button"
            className="icon-button"
            title={expanded ? "Return to grid" : "Focus terminal"}
            aria-label={expanded ? "Return to terminal grid" : `Focus ${session.name}`}
            onClick={onToggleExpanded}
          >
            <PaneIcon name={expanded ? "restore" : "expand"}/>
          </button>
        </div>
      </header>}
      {findOpen && <form
        className="terminal-find"
        role="search"
        style={{ top: findTop }}
        onSubmit={event => { event.preventDefault(); find(1); }}
        onMouseDown={event => event.stopPropagation()}
      >
        <PaneIcon name="search" size={13}/>
        <input
          autoFocus
          value={findQuery}
          onChange={event => { setFindQuery(event.target.value); setFindMessage(""); findCursorRef.current = null; }}
          onKeyDown={event => {
            if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeFind(); }
            else if (event.key === "Enter" && event.shiftKey) { event.preventDefault(); find(-1); }
          }}
          placeholder="Find in output"
          aria-label={`Find in ${session.name} output`}
          spellCheck={false}
        />
        <span className={`terminal-find__status ${findMessage === "No match" ? "is-miss" : ""}`} aria-live="polite">{findMessage}</span>
        <button type="button" className="terminal-find__button" onClick={() => find(-1)} disabled={!findQuery.trim()} aria-label="Previous match" title="Previous match · Shift Enter"><PaneIcon name="up" size={14}/></button>
        <button type="submit" className="terminal-find__button" disabled={!findQuery.trim()} aria-label="Next match" title="Next match · Enter"><PaneIcon name="down" size={14}/></button>
        <button type="button" className="terminal-find__button terminal-find__close" onClick={closeFind} aria-label="Close terminal search" title="Close · Esc"><PaneIcon name="close" size={13}/></button>
      </form>}
      {message && <div className="terminal-warning">{message}</div>}
      {/* Current activity, straight from engine state — never a fake progress bar. */}
      {!windowChrome && <div className={`terminal-pane__activity ${session.attentionRequired ? "is-attention" : ""} ${session.status === "failed" ? "is-failed" : ""}`} title={activityLabel}>
        <i aria-hidden="true"/><span>{activityLabel}</span>
      </div>}
      </>}
      {/* A worker that is not running used to say so as one grey line printed
          into an otherwise empty terminal, pointing at a "Start" that was two
          levels down a menu. An empty pane is the clearest place in the app to
          offer the one thing you would want from it, so it offers it: what the
          worker is, what starting it will run, and the control that does it.
          A failed worker is not idle — it keeps the crash lens below instead. */}
      {!minimized && !session.isAlive && session.status !== "failed" && (
        <div className="terminal-idle">
          <span className="terminal-idle__mark" aria-hidden="true"><PaneIcon name="power" size={20}/></span>
          <strong>{idleState.title}</strong>
          <p>{idleState.detail}</p>
          {launch.runs && <code title={launch.full}>{launch.runs}</code>}
          <button type="button" className="terminal-idle__start" onClick={() => requestAction("start")}>
            <PaneIcon name="play"/><span>Start {session.name}</span>
          </button>
          <small>{session.autoStart ? "Starts automatically when this project opens." : "Stays idle until you start it. To start it with the workspace, choose Start with workspace in the ⋯ menu."}</small>
        </div>
      )}
      <div className="terminal-host" ref={hostRef} aria-hidden={minimized || undefined} inert={minimized ? "" : undefined} onContextMenu={event => {
        if (minimized || !terminalRef.current) return;
        event.preventDefault();
        // Clamp so the menu never paints off the right or bottom edge.
        const x = Math.min(event.clientX, Math.max(0, window.innerWidth - 170));
        const y = Math.min(event.clientY, Math.max(0, window.innerHeight - 200));
        setContextMenu({ x, y });
      }}/>
      {contextMenu && <div ref={contextMenuRef} className="terminal-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} role="group" aria-label="Terminal actions">
        {contextItems.map(item => <button key={item.key} type="button" disabled={item.disabled} onMouseDown={event => event.preventDefault()} onClick={() => { closeContextMenu(); item.run(); }}>{item.label}</button>)}
      </div>}
      {session?.status === "failed" && (
        <CrashLens
          session={session}
          onAction={onAction}
          onAskAI={onAskAI ? prompt => onAskAI(prompt) : undefined}
        />
      )}
    </article>
  );
}
