# OUTARCH MASTER PLANNING DOCUMENT

**Generated from conversation on: 2026-11-07**
**Version: 1.0**
**Status: ACTIVE - Living Document**

---

# TABLE OF CONTENTS

1. [EXECUTIVE SUMMARY](#1-executive-summary)
2. [CODEBASE ARCHITECTURE ANALYSIS](#2-codebase-architecture-analysis)
3. [CRITICAL BUGS - ROOT CAUSES & FIXES](#3-critical-bugs---root-causes--fixes)
4. [PERFORMANCE & UX FIXES](#4-performance--ux-fixes)
5. [TERMINAL & AI FEATURE FIXES](#5-terminal--ai-feature-fixes)
6. [FOCUS MODE & WORKSPACE ENHANCEMENTS](#6-focus-mode--workspace-enhancements)
7. [MCP & MOBILE COMPANION FIXES](#7-mcp--mobile-companion-fixes)
8. [CANVAS FEATURE - DEEP TECHNICAL DESIGN](#8-canvas-feature---deep-technical-design)
9. [OPENBOT-STYLE AI AGENTS](#9-openbot-style-ai-agents)
10. [UI/UX DEEP DIVE](#10-uiux-deep-dive)
11. [PAYMENT SYSTEM & DATABASE IMPACT](#11-payment-system--database-impact)
12. [ERROR-FREE & LAG-FREE GUARANTEES](#12-error-free--lag-free-guarantees)
13. [IMPLEMENTATION ROADMAP](#13-implementation-roadmap)
14. [RISK ASSESSMENT & MITIGATION](#14-risk-assessment--mitigation)
15. [SUCCESS CRITERIA](#15-success-criteria)
16. [CONVERSATION LOG](#16-conversation-log)

--
ORIGINAL DATA GIVEN FOR ERRORS AND FEATURES CURRENTLY EXISTS ON THE OUTARCH

differnt folder differnt terminals can be open in workspace like a specific folder terminals are open and want to open other folder terminals that can be opened 

differnt account can be used on specfic cli like claude or codex account can be switched

some terminals must be running on the project or folder by claude or any other ai they must get synced to the app and create seprate section to view these terminals and make sure these must not be shown on the focus  mode but they can be shown on normal workpace window or screen but in a different folder of terminals

local mcp to be changed to fully working mcp 

# PROBLEMS ON OUTARCH WHICH NEED A FIX

there is amajor crashing problem in outarch which is that when opening the agy which do a verification or authentication on a exteranl terminal which opens up on the windows but when this happens there is a issue which is that outarch app do not resoponding but after it verified it fixes it there must be some other problem on outarch app whichmay not be linked to the agy(antigravity) cli

scrolling problem there is too much content scrolling feels laggy

delay in notification sound after some seconds of notfication to popup then after some seconds notfiaction comes

there is another major error which is that suppose a ollama command is run but the list of models or agents the terminals shows it very small basically the cpntent shown is not full even when scrolling there is very deep thinking needed on this why this happend will it cause future problem will this mess up whole code why is it happening why there is problems and if it is fixed what will happen and many other real questions and scenarios at the end whole content is not shown even when using arrow keys to choose

another major cant copy and paste content in terminals

also cant follow the link by clicking ctrl or cant open the link from  terminal to open by clciking ctrl 

another problrm which is that when a terminal shows to open this localhost link even that link is opened or not opened then the notifiactions come agiagn and again

another when app is not opened or running in the backgorund it does not give any notfication even on the desktop no desktop notifiactions

even an ai is runing and it shows things on the terminal some things on terminal is misinterpreted by outarch and outarch seems it as an error and gives a notfication even it also misinterprets localhost links 

there is a problem on the wprkspace which is that the usage of ai models are not tracked that sufficently or not tracked even any ai is running i think it is not detecting any ai models

while clicking ctrl+c the and leaving the ai model it crashes the terminal 

when terminals are resized the content in them got messed up the text in them is not in a way as they were before all text mixed up when resizing the terminal

qr code of mobile companion is not scannable 

major problrm which is that when workspae is in focus mode it is scrolling deep analysis needed on this

when a chat alreday happend with a ai gent on the mission ai and other model is used that other model read previous same chat 

allow mission ai to create previous chats and let ai agents to read that previous chats

do a deep analysis on this when a terminal is selected the mission ai opened in workspace use that terminal as source to work upon i cant deselct or leave it seleting to direclty talk about another thing with ai do deep analysis on this this is important and this need fix a fix make sure this doesnot mess the whole codebase and doesnt mess the whole workspace

there is a need of change of layout on the focus mode only change of layout means where terminals should be placed means viewing mode like there are 3 terminals in focus mode there is a option to cahnge layout of terminals 

even when ai agents are running on the outarch the groundstation project operations show welcome open your first terminal this happened when only ai agents are running no other terminal running except ai ones 

shifting from one terminal to another is very laggy or too slow this needs a fix

there is a problem if any terminal is stopped then some characters of that terminal stop or freeze and other things just keep moving like ai agentworking some charcter freeze and others are scrolling as ai agent is working deep analysis and deep fix needed on this s

for good ui/ux there is need to minimize the sidebar to make the app more spacious which is very needed on the wrokspace where there is many terminals and also while minimizing how would ui and ux would work where things will go while doing it and how will things work upon in this deep thinking needed

major problem need a fix which is that when a terminal is stopped and do things rubbish

and the app is too lagy while scrolling and doing things and the main work my app has to do which is to work on the terminals even on the that the scrolling and other things are messed up 

A new feature can be added which is that in this video here the app used like canvas terminals in a canvas this can be the best and good very good feature https://www.instagram.com/reel/Dc_MO6zgx_L/?exln=ajZwcW8zZWNyMWk0 this link has a video in which a person is using a october.dev app which has very cool and best feature named as canvas this feature can be used in the outarch which can do things like creating a canvas which contain lot of features like terminals can be created and major is that using a theme whole page or window theme even the top menu bar or where close and minimize buttons are there that must also must be included in the theme and also i want that terminals to opened brwoser to be opened chrome can be opened and also other apps can be opened and and even mission ai to be opened and notes to be opened and also please make sure that this can open apps on the canvas real desktop apps on the canvas there is a major deep thinking needed on this and also there will be a major problem which will arise which is that lagging , keyboard and mouse control ,using apps simulatneously and many more problems all problems must be taken under deep consideration to build the app and also main thing to make this setup completely lag free glitch free hang free and real life workable without any problems and also this is a very good feature so this really needs a good ui/ux  

also want these type of bots to be created https://github.com/CopilotKit/openbot


# 1. EXECUTIVE SUMMARY

This document captures the complete analysis and implementation plan for OUTARCH (formerly Mission Control) based on the deep codebase exploration and user requirements gathered on 2026-11-07.

## 1.1 User Requirements Summary

### Critical Fixes Required:
1. **External CLI Authentication Crash** - App freezes during `agy`/antigravity verification
2. **Ctrl+C Crashes Terminal** - Sending interrupt kills the terminal
3. **Terminal Resize Corruption** - Text gets garbled on resize
4. **Scrolling Lag** - Content scrolling feels sluggish
5. **Notification Sound Delay** - Seconds of delay before chime plays
6. **No Desktop Notifications When Backgrounded** - Notifications only work when app is foreground
7. **Copy/Paste Broken in Terminals** - No context menu, unreliable shortcuts
8. **Ctrl+Click Links Don't Work** - Can't open URLs from terminal output
9. **Repeated Localhost Notifications** - Same port notified over and over
10. **AI Output Misclassified as Errors** - False positive error notifications
11. **AI Usage Not Tracked** - Only Claude Code tracked, not Codex/Ollama/Gemini
12. **Ollama Model List Display Broken** - Content truncated, can't navigate
13. **Focus Mode Scrolling Issues** - Deep scrolling problems in focus mode
14. **Mission AI Terminal Lock-in** - Can't deselect terminal to chat freely
15. **Cross-Model Chat History** - Different models can't read previous chats
16. **Welcome Screen Shows When AI Agents Running** - False empty state
17. **Stopped Terminals Show Garbage** - Frozen characters mixed with scrolling
18. **Terminal Switching Lag** - Slow to switch between terminals
19. **Sidebar Not Minimizable** - Wastes horizontal space
20. **MCP Gateway Incomplete** - Not fully working for all clients
21. **QR Code Not Scannable** - Mobile companion pairing fails

### Major New Features:
1. **Canvas Workspace** - Free-form infinite canvas with:
   - Terminal nodes (xterm.js)
   - Browser nodes (WebContentsView)
   - Mission AI nodes
   - Notes/Markdown nodes
   - **Native App Nodes** - Real desktop apps (VS Code, Chrome, etc.) with live preview + window management
   - Full window theming including title bar
   - Pan/zoom, persistence per project

2. **OpenBot-Style AI Agents** - Persistent background agents with:
   - Agent templates/registry
   - Inter-agent communication
   - Agent memory (project memory integration)
   - Supervision dashboard

### Clarifications from User:
- Canvas: **Full free-form** (not grid-snapped dashboard)
- Native Apps: **Actual window embedding** - user wants real interaction, not just preview
- Focus Mode Layouts: **Global** (not per-project)
- CLI Accounts: **Per-terminal** account switching
- Terminal Folders: **Redesign** the existing custom folder feature

## 1.2 Hard Technical Reality Check

> **CRITICAL**: Electron **cannot truly embed native Windows applications** in a canvas. This is a fundamental OS/security boundary.
>
> - `BrowserView`/`WebContentsView` → Web content only
> - `desktopCapturer` → One-way video capture (no input)
> - `DWM Thumbnail API` → Live visual only (no interaction)
> - `SetParent` Win32 → Breaks sandbox, input routing, security
>
> **What October.dev does**: Virtual desktop/RDP approach — apps run in virtual session, streamed via web RDP/VNC client.
>
> **Our Approach**: **Hybrid Canvas Nodes** — Native App Nodes provide:
> 1. **Launch** real app externally (`shell.openExternal`)
> 2. **Live Preview** via DWM Thumbnail (Windows, best perf) or `desktopCapturer` (cross-platform)
> 3. **Window Management** — Focus, minimize, restore, position via native module
> 4. **Clear UX** — "Click Focus to interact with real app" button
 
--- 
---

# 2. CODEBASE ARCHITECTURE ANALYSIS

## 2.1 Topology

```
OUTARCH (Windows-first Developer Command Center)
├── Engine (Node PTY) - src/engine/
│   ├── node-pty + ConPTY
│   ├── sessionEngine.cjs - Session lifecycle
│   ├── projectMemory.cjs - Engine-level project memory
│   ├── classifier.cjs - Output classification
│   └── evidenceClassifier.cjs - Evidence detection
├── TUI (Ink) - src/tui/
│   ├── Binary: termctl / outarch
│   └── Components: Terminal, Workspace, etc.
└── Groundstation (Electron + React) - src/groundstation/
    ├── Main Process - src/groundstation/main/
    │   ├── index.cjs - Entry, IPC, window management
    │   ├── appIdentity.cjs - userData migration to %APPDATA%\OUTARCH
    │   ├── distribution.cjs - Store vs standalone mode
    │   ├── terminalWindowManager.cjs - External terminal windows
    │   ├── workspaceIntelligence.cjs - Port detection, AI detection
    │   └── notificationService.cjs - Desktop notifications
    ├── Preload - src/groundstation/preload/
    │   └── index.cjs - Secure IPC bridge (missionControl API)
    └── Renderer - src/groundstation/renderer/
        ├── App.jsx - Main shell (300KB+, manages everything)
        ├── TerminalPane.jsx - xterm.js + FitAddon wrapper
        ├── WorkspaceBrowser.jsx - BrowserView wrapper
        ├── WorkspaceAssistant.jsx - Mission AI chat UI
        ├── MissionAIScreen.jsx - Full-screen AI
        ├── AgentWorkspace.jsx - AI agent management
        ├── MobileCompanion.jsx - QR pairing
        ├── NotificationCenter.jsx - Toast UI
        ├── useTerminalLayout.js - Layout system (TERMINAL_LAYOUTS)
        ├── useInterfacePreferences.js - Persisted UI prefs
        ├── terminalInput.js - Key chord handling
        ├── notificationSound.js - Web Audio chime system
        ├── qrGenerator.js - QR code generation
        └── styles.css / redesign/surfaces.css - Single theme (Obsidian palette)
```

## 2.2 Key Architectural Decisions

| Aspect | Decision | Constraint |
|--------|----------|------------|
| **Sandbox** | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` | NEVER set `nodeIntegration: true` |
| **Theme** | Single Obsidian palette, CSS custom properties (`--mc-*`) | No new stylesheets, no `!important` |
| **Settings Groups** | Locked — test-enforced | Do not add new settings groups |
| **IPC** | `mission-control:*` channels, `window.missionControl` | Keep existing identifiers |
| **userData** | `%APPDATA%\OUTARCH` (copied from Electron default) | `OUTARCH_USER_DATA_DIR` override |
| **Project Memory** | `arch_memory.md` (not `PROJECT_MEMORY.md`) | Legacy renamed only if marker present |
| **Distribution** | `outarchDistribution: "microsoft-store"` in package.json | Store mode skips AUMID, protocol registration |

## 2.3 Critical Files Reference

```
Engine Core:
- src/engine/index.cjs - EngineAPI, Protocol v1
- src/engine/sessionEngine.cjs - SessionEngine, PTY spawn
- src/engine/classifier.cjs - Output classification
- src/engine/evidenceClassifier.cjs - Error detection

Renderer Core:
- src/groundstation/renderer/App.jsx - 300KB+ main shell
- src/groundstation/renderer/TerminalPane.jsx - Terminal component
- src/groundstation/renderer/useTerminalLayout.js - Layout engine
- src/groundstation/renderer/WorkspaceAssistant.jsx - Mission AI

Main Process:
- src/groundstation/main/index.cjs - Electron entry
- src/groundstation/main/terminalWindowManager.cjs - External windows
- src/groundstation/main/workspaceIntelligence.cjs - Port/AI detection
- src/service/notificationService.cjs - Notifications
- src/service/mcpGateway.cjs - MCP HTTP gateway
- src/service/usageCliImport.cjs - CLI usage import
- src/service/missionAiConversation.cjs - AI conversation persistence
- src/service/projectMemoryFile.cjs - Project memory file ops
```

---

# 3. CRITICAL BUGS - ROOT CAUSES & FIXES

## 3.1 External CLI Authentication Crash (agy/antigravity)

### Root Cause
`SessionEngine.spawn()` in `sessionEngine.cjs` creates PTY synchronously. When CLI opens external browser for auth:
1. Main process blocks on `ptyProcess` spawn
2. No async verification flow with timeout
3. Terminal pane waits for stream connection that never completes
4. Renderer becomes unresponsive

### Fix: Async Verification Flow
```javascript
// src/engine/sessionEngine.cjs
class SessionEngine {
  async spawnWithVerification(command, args, options = {}) {
    const verification = options.verification || {};
    const { timeout = 30000, pattern, onVerified, onTimeout } = verification;
    
    const pty = this.spawn(command, args, options);
    
    const verificationPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pty.off('data', dataHandler);
        onTimeout?.();
        reject(new Error('Verification timeout'));
      }, timeout);
      
      const dataHandler = (data) => {
        if (pattern?.test(data)) {
          clearTimeout(timer);
          pty.off('data', dataHandler);
          onVerified?.();
          resolve({ success: true });
        }
      };
      pty.on('data', dataHandler);
    });
    
    return { pty, verification: verificationPromise };
  }
}
```

### Files to Modify
- `src/engine/sessionEngine.cjs` - Add `spawnWithVerification()`
- `src/groundstation/main/terminalWindowManager.cjs` - Non-blocking external spawn
- `src/groundstation/renderer/TerminalPane.jsx` - Handle verification state

---

## 3.2 Ctrl+C Terminal Crash

### Root Cause
`TerminalPane.jsx` line ~260 handles `Ctrl+Shift+C` for copy via `isPasteChord`/`isShellAltChord`. Plain `Ctrl+C` (shell interrupt) not explicitly passed through — may be consumed by React or custom handler.

### Fix
```javascript
// src/groundstation/renderer/terminalInput.js
export function isInterruptChord(event) {
  if (!event || event.type !== 'keydown') return false;
  const key = String(event.key || '').toLowerCase();
  const accelerator = event.ctrlKey || event.metaKey;
  return accelerator && !event.shiftKey && !event.altKey && key === 'c';
}

// src/groundstation/renderer/TerminalPane.jsx - in attachCustomKeyEventHandler
if (isInterruptChord(event)) return true; // Pass through to shell
```

### Files: `terminalInput.js`, `TerminalPane.jsx`

---

## 3.3 Terminal Resize Content Corruption

### Root Cause
`FitAddon.fit()` resizes viewport but doesn't reflow scrollback buffer. xterm's internal buffer line mapping gets misaligned. Scroll position not preserved relative to bottom.

### Fix
```javascript
// src/groundstation/renderer/TerminalPane.jsx
const fitAndResize = React.useCallback(() => {
  if (!terminalRef.current || !hostRef.current) return;
  const terminal = terminalRef.current;
  const wasFocused = terminal.hasFocus();
  
  // Preserve scroll position relative to bottom
  const buffer = terminal.buffer.active;
  const scrollBottom = buffer.length - buffer.viewportY - terminal.rows;
  
  terminal.fitAddon?.fit();
  
  // Restore relative scroll position
  const newScrollBottom = Math.max(0, buffer.length - terminal.rows - scrollBottom);
  terminal.scrollToLine(newScrollBottom);
  
  if (wasFocused) terminal.focus();
}, []);
```

### Files: `TerminalPane.jsx`
# 4. PERFORMANCE & UX FIXES

## 4.1 Scrolling Lag

### Root Causes
1. **Scrollback too large**: 10,000 lines default in `TerminalPane.jsx`
2. **No virtualization**: All rows rendered in DOM
3. **CSS animations on terminal grid**: Transitions on `.xterm-viewport`
4. **App.jsx monolith**: 300KB+ causes excessive re-renders

### Fixes
```javascript
// TerminalPane.jsx - Reduce scrollback
scrollback: 3000, // Was 10000

// surfaces.css - Disable transitions in focus mode
.is-focus-mode .terminal-grid,
.is-focus-mode .xterm-viewport {
  transition: none !important;
  animation: none !important;
}

// React.memo for TerminalPane
export const TerminalPane = React.memo(function TerminalPane(props) {
  // ...
}, (prev, next) => {
  return prev.session?.id === next.session?.id && 
         prev.active === next.active;
});
```

## 4.2 Terminal Switching Lag

### Root Cause
Full terminal recreation on switch. No instance pooling.

### Fix: Terminal Pooling
```javascript
// App.jsx - Terminal instance pool
const terminalPoolRef = React.useRef(new Map()); // sessionId -> { terminal, element, lastUsed }

function getOrCreateTerminal(sessionId) {
  const pooled = terminalPoolRef.current.get(sessionId);
  if (pooled) {
    pooled.lastUsed = Date.now();
    return pooled.terminal;
  }
  // Create new, add to pool
  if (terminalPoolRef.current.size > 10) {
    const lru = [...terminalPoolRef.current.entries()]
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
    lru[1].terminal.dispose();
    terminalPoolRef.current.delete(lru[0]);
  }
}
```

## 4.3 Notification Sound Delay

### Root Cause
`primeNotificationSound()` in `notificationSound.js` not called on app startup. AudioContext suspends after ~20s idle (browser policy).

### Fix
```javascript
// App.jsx - Prime on mount
React.useEffect(() => {
  primeNotificationSound();
  const keepAlive = setInterval(() => {
    if (audioContext()?.state === 'suspended') {
      audioContext()?.resume?.();
    }
  }, 5000);
  return () => clearInterval(keepAlive);
}, []);

// notificationSound.js - Reduce idle suspend
const IDLE_SUSPEND_MS = 5000; // Was 20000
```

## 4.4 Desktop Notifications When Backgrounded

### Root Cause
`NotificationService` only works in renderer process. No main-process fallback.

### Fix: Main Process Notifications
```javascript
// src/groundstation/main/index.cjs
const { Notification } = require('electron');

function showDesktopNotification(title, body, options = {}) {
  if (Notification.isSupported()) {
    const notif = new Notification({ title, body, ...options });
    notif.show();
    return notif;
  }
  return null;
}

// IPC handler for renderer
---

# 5. TERMINAL & AI FEATURE FIXES

## 5.1 Copy/Paste + Context Menu

### Current State
- Copy: `Ctrl+Shift+C` → IPC to main → `clipboard.writeText`
- Paste: Browser paste event → `terminal.write()`
- No right-click menu

### Fix
```javascript
// TerminalPane.jsx
React.useEffect(() => {
  const terminal = terminalRef.current;
  if (!terminal) return;
  
  // Context menu
  terminal.onContextMenu((e) => {
    e.preventDefault();
    const hasSelection = terminal.hasSelection();
    showContextMenu({
      copy: hasSelection ? () => copySelection() : null,
      paste: () => pasteFromClipboard(),
      selectAll: () => terminal.selectAll(),
    }, e.clientX, e.clientY);
  });
  
  // Clipboard fallback in preload
}, []);
```

## 5.2 Ctrl+Click Link Opening

### Root Cause
xterm.js `linkProvider` not registered.

### Fix
```javascript
// TerminalPane.jsx
React.useEffect(() => {
  const terminal = terminalRef.current;
  if (!terminal) return;
  
  const linkMatcherId = terminal.registerLinkMatcher(
    /(https?:\/\/[^\s]+)/g,
    (event, uri) => {
      if (event.ctrlKey || event.metaKey) {
        window.missionControl?.openExternal?.(uri);
      }
    },
    {
      tooltipCallback: (url) => `Open ${url}`,
      leaveAlertCallback: () => '',
      hoverStyle: { textDecoration: 'underline', color: '#3291ff' }
    }
  );
  
  return () => terminal.deregisterLinkMatcher(linkMatcherId);
}, []);
```
ipcMain.handle('notification:show', (e, { title, body, options }) => {
  return showDesktopNotification(title, body, options);
});

// Preload bridge
// src/groundstation/preload/index.cjs
contextBridge.exposeInMainWorld('missionControl', {
  // ...
  showNotification: (title, body, options) => 
    ipcRenderer.invoke('notification:show', { title, body, options }),
---

# 6. FOCUS MODE & WORKSPACE ENHANCEMENTS

## 6.1 Focus Mode Scrolling Issues

### Root Cause
Focus mode CSS (`.is-focus-mode`) changes layout but terminal grid doesn't recalculate.

### Fix
```javascript
// App.jsx - Force resize on focus toggle
const [focusMode, setFocusMode] = useInterfacePreference('focusMode');

React.useEffect(() => {
  // Trigger terminal refit after layout settles
  requestAnimationFrame(() => {
    terminalPanes.current.forEach(pane => pane?.fitAndResize?.());
  });
}, [focusMode]);
```

## 6.2 Focus Mode Layout Options (Global)

### Requirement
3 terminals in focus mode with layout options: Single, Horizontal, Vertical, 3-pane Grid.

### Implementation
```javascript
// useTerminalLayout.js
export const FOCUS_LAYOUTS = Object.freeze([
  { id: 'focus-single', label: 'Single', slots: 1, className: 'layout-focus-single', cols: 1, rows: 1 },
  { id: 'focus-horizontal', label: 'Side-by-side', slots: 2, className: 'layout-focus-horizontal', cols: 2, rows: 1 },
  { id: 'focus-vertical', label: 'Stacked', slots: 2, className: 'layout-focus-vertical', cols: 1, rows: 2 },
  { id: 'focus-grid-3', label: 'Three-pane', slots: 3, className: 'layout-focus-grid-3', cols: 3, rows: 1 },
]);

// Global persistence
const FOCUS_LAYOUT_KEY = 'mission-control:focus-layout:v1:global';
```

## 6.3 Mission AI Terminal Selection - Deselect Support

### Root Cause
`WorkspaceAssistant` locks to selected terminal with no clear action.

### Fix
```javascript
// WorkspaceAssistant.jsx
const [sourceTerminalId, setSourceTerminalId] = React.useState(null);

const clearSource = () => {
  setSourceTerminalId(null);
  missionApi().request('mission-ai.set-source', { terminalId: null });
};

// Render
<header>
  {sourceTerminalId && (
    <button onClick={clearSource} title="Clear source terminal">
      ✕ {getTerminalName(sourceTerminalId)}
    </button>
  )}
</header>
```

## 6.4 Mission AI Cross-Model Chat History

### Root Cause
Conversations stored per-model, not per-conversation.

### Fix
```javascript
// src/service/missionAiConversation.cjs
class MissionAIConversation {
  // Key: conversationId (e.g., "project-123-main"), NOT model-specific
  async send({ text, model, conversationId = 'default', projectId } = {}) {
    const thread = this.#threads.get(conversationId) || [];
    const result = await this.#missionAi.ask({ question: text, model, projectId });
    thread.push({ role: 'assistant', model, text: result.text, ... });
    this.#threads.set(conversationId, thread);
  }
  
  getHistory(conversationId) {
    return this.#threads.get(conversationId) || [];
  }
}
```

## 6.5 Welcome Screen When AI Agents Running

### Root Cause
Workspace intelligence checks `sessions.length` but AI agents filtered differently.

### Fix
```javascript
// App.jsx
const liveCount = sessions.filter(s => s.isAlive).length;
const agentCount = sessions.filter(s => s.agent === true && s.isAlive).length;
const hasActiveWork = liveCount > 0 || agentCount > 0;

{!hasActiveWork && <WelcomeScreen />}
```

## 6.6 Stopped Terminal Garbage Characters

### Root Cause
Terminal not cleaned up on exit; ANSI escape sequences left in buffer.

### Fix
```javascript
// TerminalPane.jsx
React.useEffect(() => {
  if (!session?.isAlive && terminalRef.current) {
    const terminal = terminalRef.current;
    terminal.write('\x1bc'); // Full reset (ESC c)
    terminal.clear();
    terminal.writeln('\r\n\x1b[38;2;161;161;161m[Session ended — terminal reset]\x1b[0m');
  }
}, [session?.isAlive]);
```

## 6.7 Sidebar Minimize

### Implementation
```javascript
// useInterfacePreferences.js
const DEFAULT_INTERFACE_PREFERENCES = {
  // ...
  sidebarCollapsed: false,
  sidebarWidth: 280,
};

// App.jsx
const [sidebarCollapsed, setSidebarCollapsed] = useInterfacePreference('sidebarCollapsed');

// CSS
.shell {
  --mc-rail-w: 280px;
  transition: --mc-rail-w 200ms ease;
}
.shell.sidebar-collapsed {
  --mc-rail-w: 48px; /* Icon-only rail */
}
```

---

# 7. MCP & MOBILE COMPANION FIXES

## 7.1 MCP Gateway - Complete Client Support

### Current State
`SecureMcpGateway` runs but client config injection incomplete.

### Fix
```javascript
// src/service/mcpGateway.cjs
const CLIENT_WRITERS = {
  // ... existing
  'windsurf': writeWindsurfConfig,
  'cursor': writeCursorConfig,
  'vscode': writeVSCodeConfig,
};

// Health endpoint
app.get('/mcp/health', (req, res) => {
  res.json({ status: 'ok', version: MCP_PROTOCOL_VERSION, uptime: Date.now() - startTime });
});
```

## 7.2 QR Code Scannability

### Root Cause
`qrGenerator.js` uses Error Correction Level M but version too small for URL length.

### Fix
```javascript
// qrGenerator.js
function generateQRCodeMatrix(url, options = {}) {
  const { size = 256, quietZone = 4, errorCorrection = 'M' } = options;
  // Force version 10+ for URLs > 100 chars
  // Add 4-module quiet zone (required by spec)
}
```
});
```

### Files: `main/index.cjs`, `preload/index.cjs`, `notificationService.cjs`, `App.jsx`
---

# 8. CANVAS FEATURE - DEEP TECHNICAL DESIGN

## 8.1 Architecture Overview

```
CANVAS WORKSPACE (New Route: /canvas/:projectId?)
├── CanvasToolbar (Top)
│   ├── Node Palette Toggle
│   ├── Layer Panel Toggle
│   ├── Theme Selector
│   ├── Viewport Controls (Zoom, Fit, Reset)
│   ├── Export/Import
│   └── Title Bar Integration
├── CanvasViewport (Center - Infinite Pan/Zoom)
│   ├── CanvasGrid (Background)
│   ├── CanvasNodes (Draggable, Resizable)
│   │   ├── TerminalCanvasNode → wraps TerminalPane
│   │   ├── BrowserCanvasNode → wraps WorkspaceBrowser
│   │   ├── MissionAICanvasNode → wraps WorkspaceAssistant
│   │   ├── NotesCanvasNode → Markdown editor
│   │   └── NativeAppCanvasNode → Native app integration
│   └── Connections (Visual wires between nodes)
├── CanvasInspector (Right Sidebar)
│   ├── Node Properties
│   ├── Node Style
│   ├── Node Actions
│   └── Connection Settings
└── CanvasLayersPanel (Left Sidebar)
    ├── Layer List (Z-order)
    ├── Visibility Toggles
    └── Lock/Unlock
```

## 8.2 Core Data Structures

```javascript
// src/groundstation/renderer/canvas/canvasTypes.js

export const CANVAS_NODE_TYPES = Object.freeze({
  TERMINAL: 'terminal',
  BROWSER: 'browser',
  MISSION_AI: 'mission-ai',
  NOTES: 'notes',
  NATIVE_APP: 'native-app',
  GROUP: 'group',
});

export const CANVAS_NODE_DEFAULTS = {
  [CANVAS_NODE_TYPES.TERMINAL]: {
    width: 600, height: 400,
    sessionId: null,
    showTitleBar: true,
    theme: 'orbital',
  },
  [CANVAS_NODE_TYPES.BROWSER]: {
    width: 600, height: 400,
    url: 'http://localhost:3000',
    showAddressBar: true,
    showNavButtons: true,
  },
  [CANVAS_NODE_TYPES.MISSION_AI]: {
    width: 400, height: 600,
    conversationId: 'canvas-main',
    model: null,
    showModelSelector: true,
  },
  [CANVAS_NODE_TYPES.NOTES]: {
    width: 400, height: 500,
    content: '',
    format: 'markdown',
    autoSave: true,
  },
  [CANVAS_NODE_TYPES.NATIVE_APP]: {
    width: 800, height: 600,
    appId: null,
    executable: null,
    args: [],
    workingDir: null,
    showPreview: true,
    previewMode: 'dwm-thumbnail',
    autoLaunch: false,
  },
};

// Canvas Document (persisted per project)
export const CANVAS_DOCUMENT_SCHEMA = {
  version: 1,
  nodes: [],
  connections: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  grid: { size: 20, snap: true },
  theme: 'orbital',
  background: { type: 'solid', value: '#000000' },
};
```
## 8.3 Component Structure

```
src/groundstation/renderer/canvas/
├── CanvasWorkspace.jsx          # Main canvas component (route target)
├── CanvasViewport.jsx           # Pan/zoom container (transform: translate+scale)
├── CanvasGrid.jsx               # Background grid (CSS + Canvas for perf)
├── CanvasNode.jsx               # Base node wrapper (draggable, resizable)
├── canvasTypes.js               # Type definitions
├── nodes/
│   ├── TerminalCanvasNode.jsx   # Wraps TerminalPane
│   ├── BrowserCanvasNode.jsx    # Wraps WorkspaceBrowser
│   ├── MissionAICanvasNode.jsx  # Wraps WorkspaceAssistant
│   ├── NotesCanvasNode.jsx      # Markdown editor (react-simplemde or similar)
│   └── NativeAppCanvasNode.jsx  # Native app integration
├── ui/
│   ├── CanvasToolbar.jsx        # Top toolbar
│   ├── CanvasNodePalette.jsx    # Add node panel
│   ├── CanvasInspector.jsx      # Right sidebar
│   ├── CanvasLayersPanel.jsx    # Layer management
│   └── CanvasThemeSelector.jsx  # Theme picker
├── hooks/
│   ├── useCanvas.js             # Canvas state management
│   ├── useCanvasNodes.js        # Node CRUD
│   ├── useCanvasViewport.js     # Pan/zoom
│   ├── useCanvasPersistence.js  # Save/load per project
│   └── useNativeAppPreview.js   # Native app preview stream
└── native/
    ├── NativeAppManager.cjs     # Main process: app registration
    ├── NativeAppLauncher.cjs    # Main process: launch/track
    ├── DwmThumbnailNative.cc    # Native module: DWM thumbnail
    └── binding.gyp              # node-gyp config

src/groundstation/main/canvas/
├── NativeAppManager.cjs         # Main process manager
└── index.cjs                    # Exports
```

## 8.4 Native App Integration - Deep Technical Design

### The Hard Truth
**Electron CANNOT embed native Windows apps.** Period.

### Our Solution: Live Preview + Window Management

```
┌─────────────────────────────────────────────────────────────┐
│  Canvas Node: "VS Code"                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  LIVE PREVIEW (DWM Thumbnail / desktopCapturer)     │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │  [Visual stream of actual VS Code window]   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Focus] [Minimize] [Restore] [Close] [Snapshot]           │
└─────────────────────────────────────────────────────────────┘
```

### Option A: DWM Thumbnail (Windows, Best Performance)

```cpp
// src/groundstation/renderer/canvas/native/DwmThumbnailNative.cc
#include <node_api.h>
#include <dwmapi.h>
#include <windows.h>

class DwmThumbnailWrapper : public Napi::ObjectWrap<DwmThumbnailWrapper> {
  HTHUMBNAIL thumbnailId = NULL;
  
  static Napi::Value CreateThumbnail(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    HWND dest = (HWND)info[0].As<Napi::Number>().Int64Value();
    HWND src = (HWND)info[1].As<Napi::Number>().Int64Value();
    
    HTHUMBNAIL thumb;
    HRESULT hr = DwmRegisterThumbnail(dest, src, &thumb);
    if (FAILED(hr)) {
      Napi::Error::New(env, "DwmRegisterThumbnail failed").ThrowAsJavaScriptException();
      return env.Null();
    }
    
    DWM_THUMBNAIL_PROPERTIES props = {};
    props.dwFlags = DWM_TNP_RECTDESTINATION | DWM_TNP_VISIBLE | DWM_TNP_SOURCECLIENTAREAONLY;
    props.fVisible = TRUE;
    props.fSourceClientAreaOnly = TRUE;
    props.opacity = 255;
    DwmUpdateThumbnailProperties(thumb, &props);
    
    return Napi::Number::New(env, (int64_t)thumb);
  }
  
  static Napi::Value UpdateThumbnail(const Napi::CallbackInfo& info) {
    HTHUMBNAIL thumb = (HTHUMBNAIL)info[0].As<Napi::Number>().Int64Value();
    int x = info[1].As<Napi::Number>().Int32Value();
    int y = info[2].As<Napi::Number>().Int32Value();
    int w = info[3].As<Napi::Number>().Int32Value();
    int h = info[4].As<Napi::Number>().Int32Value();
    
    DWM_THUMBNAIL_PROPERTIES props = {};
    props.dwFlags = DWM_TNP_RECTDESTINATION | DWM_TNP_VISIBLE;
    props.fVisible = TRUE;
    props.rcDestination = { x, y, x + w, y + h };
    DwmUpdateThumbnailProperties(thumb, &props);
    
    return info.Env().Undefined();
  }
  
  static Napi::Value DestroyThumbnail(const Napi::CallbackInfo& info) {
    HTHUMBNAIL thumb = (HTHUMBNAIL)info[0].As<Napi::Number>().Int64Value();
    DwmUnregisterThumbnail(thumb);
    return info.Env().Undefined();
  }
};
```
### Option B: desktopCapturer (Cross-platform, Higher Latency)

```javascript
// src/groundstation/renderer/canvas/hooks/useNativeAppPreview.js
export function useNativeAppPreview(windowTitle, options = {}) {
  const [stream, setStream] = React.useState(null);
  const { fps = 15, width = 800, height = 600 } = options;
  
  React.useEffect(() => {
    let cancelled = false;
    
    async function startCapture() {
      try {
        const sources = await desktopCapturer.getSources({ 
          types: ['window'], 
          thumbnailSize: { width, height } 
        });
        
        const source = sources.find(s => s.name.includes(windowTitle));
        if (!source) return;
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              maxWidth: width,
              maxHeight: height,
              maxFrameRate: fps,
            }
          }
        });
        
        if (!cancelled) setStream(mediaStream);
      } catch (e) {
        console.error('Native app capture failed:', e);
      }
    }
    
    startCapture();
    const interval = setInterval(startCapture, 1000 / fps);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [windowTitle, fps, width, height]);
  
  return stream;
}
```

### Native App Manager (Main Process)

```javascript
// src/groundstation/main/canvas/NativeAppManager.cjs
const { app, shell, screen } = require('electron');
const { spawn } = require('child_process');

class NativeAppManager {
  #apps = new Map(); // appId -> { hwnd, pid, bounds, state }
  
  registerApp(appId, config) {
    this.#apps.set(appId, { 
      ...config, 
      hwnd: null, 
      pid: null, 
      state: 'stopped',
      bounds: config.defaultBounds || { x: 100, y: 100, width: 800, height: 600 }
    });
  }
  
  async launch(appId) {
    const app = this.#apps.get(appId);
    if (!app || app.state === 'running') return;
    
    const child = spawn(app.executable, app.args || [], {
      cwd: app.workingDir || process.cwd(),
      detached: true,
      windowsHide: false,
    });
    
    app.pid = child.pid;
    app.state = 'starting';
    
    const hwnd = await this.waitForWindow(app.pid, app.executable);
    if (hwnd) {
      app.hwnd = hwnd;
      app.state = 'running';
      this.applyBounds(appId);
    }
    
    child.unref();
    return { success: true, hwnd };
  }
  
  async waitForWindow(pid, executableName, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const hwnd = await this.findWindowByPid(pid);
      if (hwnd) return hwnd;
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  }
  
  focus(appId) {
    const app = this.#apps.get(appId);
    if (app?.hwnd) {
      // Native module: SetForegroundWindow(app.hwnd)
    }
  }
  
  setBounds(appId, bounds) {
    const app = this.#apps.get(appId);
    if (app) {
      app.bounds = bounds;
      if (app.hwnd) this.applyBounds(appId);
    }
  }
  
  applyBounds(appId) {
    const app = this.#apps.get(appId);
    if (app?.hwnd) {
      // Native module: SetWindowPos(app.hwnd, ...)
    }
  }
  
  getThumbnail(appId) {
    const app = this.#apps.get(appId);
    if (app?.hwnd) return app.hwnd;
    return null;
  }
}

module.exports = { NativeAppManager };
```

## 8.5 Canvas Persistence & Project Integration

```javascript
// src/groundstation/renderer/canvas/hooks/useCanvasPersistence.js
const CANVAS_STORAGE_KEY = 'mission-control:canvas:v1:';

export function useCanvasPersistence(workspace) {
  const key = workspace?.path ? `${CANVAS_STORAGE_KEY}${workspace.path}` : null;
  
  const load = React.useCallback(() => {
    if (!key) return null;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Canvas load failed:', e); }
    return getDefaultCanvas();
  }, [key]);
  
  const save = React.useCallback((canvas) => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        ...canvas,
        savedAt: Date.now(),
        version: CANVAS_DOCUMENT_SCHEMA.version,
      }));
    } catch (e) { console.error('Canvas save failed:', e); }
  }, [key]);
  
  return { load, save };
}
```

## 8.6 Theming - Full Window Including Title Bar

```javascript
// CanvasThemeSelector.jsx
export const CANVAS_THEMES = {
  orbital: {
    name: 'Orbital',
    colors: {
      bg: '#000000',
      fg: '#fafafa',
      accent: '#0070f3',
      border: '#303735',
      surface: '#171b1a',
      surfaceHover: '#1e2523',
      titlebar: '#171717',
      titlebarText: '#cbd0dc',
    }
  },
  solar: { /* ... */ },
  contrast: { /* ... */ },
};

function applyCanvasTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--mc-canvas-${key}`, value);
  });
  
  // Title bar (Electron)
  window.missionControl?.setWindowChrome?.('canvas', theme.colors);
}
```

```css
/* surfaces.css - Canvas additions */
:root {
  --mc-canvas-bg: #000000;
  --mc-canvas-fg: #fafafa;
  --mc-canvas-accent: #0070f3;
  --mc-canvas-border: #303735;
  --mc-canvas-surface: #171b1a;
  --mc-canvas-titlebar: #171717;
  --mc-canvas-titlebar-text: #cbd0dc;
}

.canvas-workspace {
  background: var(--mc-canvas-bg);
  color: var(--mc-canvas-fg);
}

.canvas-node {
  background: var(--mc-canvas-surface);
  border: 1px solid var(--mc-canvas-border);
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}

.canvas-node-titlebar {
  background: var(--mc-canvas-titlebar);
  color: var(--mc-canvas-titlebar-text);
  border-bottom: 1px solid var(--mc-canvas-border);
  border-radius: 8px 8px 0 0;
}
```
---

# 9. OPENBOT-STYLE AI AGENTS

## 9.1 Agent Registry & Templates

```javascript
// AgentWorkspace.jsx - Extended
export const AGENT_TEMPLATES = {
  'code-reviewer': {
    name: 'Code Reviewer',
    description: 'Reviews PRs, suggests improvements',
    command: 'claude',
    args: ['--model', 'sonnet', '--prompt', 'You are a senior code reviewer...'],
    env: { ANTHROPIC_API_KEY: '${MISSION_AI_KEY}' },
    capabilities: ['read', 'write', 'terminal', 'git'],
    autoStart: false,
  },
  'test-runner': {
    name: 'Test Runner',
    description: 'Runs tests, reports failures',
    command: 'codex',
    args: ['--model', 'gpt-4', '--prompt', 'You are a test engineer...'],
    capabilities: ['read', 'terminal', 'test'],
  },
  // User-defined agents stored in project config
};
```

## 9.2 Inter-Agent Communication

```javascript
// src/engine/index.cjs - New protocol methods
EngineAPI.prototype.agentSendMessage = async function(fromAgentId, toAgentId, message) {
  this.emit('agent:message', { from: fromAgentId, to: toAgentId, message, timestamp: Date.now() });
};

EngineAPI.prototype.agentBroadcast = async function(fromAgentId, message) {
  this.emit('agent:broadcast', { from: fromAgentId, message, timestamp: Date.now() });
};
```

## 9.3 Agent Memory (Project Memory Integration)

```javascript
// src/service/projectMemoryFile.cjs
function createAgentMemoryEntry(agentId, type, content) {
  return {
    id: `agent-${agentId}-${Date.now()}`,
    type: `agent:${type}`, // 'agent:observation', 'agent:decision', 'agent:artifact'
    agentId,
    content,
    timestamp: Date.now(),
    tags: ['agent', agentId],
  };
}
```

---

# 10. UI/UX DEEP DIVE

## 10.1 Visual Design Language

### Current State
- Single theme: Obsidian palette
- CSS custom properties (`--mc-*`)
- No `!important`, no new stylesheets
- Radix UI primitives + custom components
- `surfaces.css` sections 1-20+ (terminal, workspace, focus, etc.)

### Canvas Additions
```css
/* New sections in surfaces.css */
/* Section 21: Canvas Workspace */
.canvas-workspace { }
.canvas-viewport { }
.canvas-grid { }
.canvas-node { }
.canvas-node-titlebar { }
.canvas-node-content { }
.canvas-node-resize-handle { }
.canvas-toolbar { }
.canvas-inspector { }
.canvas-layers { }
.canvas-palette { }

/* Section 22: Canvas Theming */
:root { --mc-canvas-* variables }

/* Section 23: Native App Node */
.native-app-node { }
.native-app-preview { }
.native-app-controls { }
```

## 10.2 Interaction Patterns

| Action | Current | Canvas | Native App Node |
|--------|---------|--------|-----------------|
| **Create Terminal** | Cmd+T / Button | Palette → Click → Drag position | N/A |
| **Resize Terminal** | Drag splitter | Drag node resize handle | Drag node resize handle |
| **Move Terminal** | Layout system | Drag node titlebar | Drag node titlebar |
| **Focus Terminal** | Click tab | Click node / Focus button | **Click "Focus" → brings real window front** |
| **Switch Account** | Not supported | Per-node settings | Per-app config |
| **Theme** | Global | Global + per-node override | Inherits canvas theme |

## 10.3 Terminal Folders Redesign

### Current State
- `worker-folder-builder` in `App.jsx` creates custom terminal groups
- Basic folder UI in sidebar
- Terminals assigned to folders

### Redesign
```javascript
// New: TerminalFolderManager (replaces worker-folder-builder)
export const TERMINAL_FOLDER_TYPES = {
  PROJECT: 'project',      // Auto: terminals in project root
  CUSTOM: 'custom',        // User-created named folders
  AI_AGENTS: 'ai-agents',  // Auto: terminals running AI agents
  CANVAS: 'canvas',        // Terminals created in canvas
};

// UI: Collapsible sidebar sections
// - Project Terminals (auto)
// - Custom Folders (user)
//   - Folder 1
//   - Folder 2
// - AI Agents (auto, hidden in focus mode)
// - Canvas Terminals (from canvas nodes)
```

## 10.4 Per-Terminal CLI Account Switching

### Requirement
Different accounts per terminal (Claude, Codex, etc.)

### Implementation
```javascript
// TerminalPane.jsx - Account selector in titlebar
const [activeAccount, setActiveAccount] = React.useState(null);

// Accounts stored per-session in session config
const sessionConfig = {
  // ...
  cliAccounts: {
    claude: 'account-uuid-1',
    codex: 'account-uuid-2',
  },
};

// On terminal spawn, inject env vars
const env = {
  ...process.env,
  ANTHROPIC_API_KEY: accounts.claude?.apiKey,
  OPENAI_API_KEY: accounts.codex?.apiKey,
};
```

## 10.5 Focus Mode Behavior with Canvas

- Focus mode **collapses sidebar + statusbar** (existing)
- Canvas nodes **remain interactive** in focus mode
- Native app preview **continues streaming**
- Layout options: **Global** (user preference)
---

# 11. PAYMENT SYSTEM & DATABASE IMPACT

## 11.1 Current Payment System

Based on `services-auth-payments-mobile.md` and codebase:
- **Dodo Payments** (live, replaced Cashfree)
- **Supabase** for auth, subscriptions, usage tracking
- **Plan enforcement**: Free / Pro / Team / Enterprise
- **AI Key Pools**: BYOK + managed keys
- **Mobile Companion**: Separate app, paired via QR

## 11.2 Database Schema Impact

### New Tables Needed

```sql
-- Canvas documents per project
CREATE TABLE canvas_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  document JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Native app registry (user-configured)
CREATE TABLE native_app_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL, -- e.g., 'vscode', 'chrome'
  name TEXT NOT NULL,
  executable TEXT NOT NULL,
  args TEXT[] DEFAULT '{}',
  working_dir TEXT,
  icon_url TEXT,
  preview_mode TEXT DEFAULT 'dwm-thumbnail',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent templates (user + built-in)
CREATE TABLE agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  command TEXT NOT NULL,
  args TEXT[] DEFAULT '{}',
  env JSONB DEFAULT '{}',
  capabilities TEXT[] DEFAULT '{}',
  is_builtin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent instances (running agents)
CREATE TABLE agent_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  template_id UUID REFERENCES agent_templates(id),
  session_id TEXT, -- Engine session ID
  status TEXT DEFAULT 'stopped', -- 'stopped', 'starting', 'running', 'error'
  config JSONB DEFAULT '{}',
  memory JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-terminal CLI accounts
CREATE TABLE terminal_cli_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'claude', 'codex', 'gemini', 'ollama'
  account_id TEXT NOT NULL,
  display_name TEXT,
  api_key_encrypted TEXT, -- Encrypted with safeStorage
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 11.3 Plan Enforcement Changes

| Feature | Free | Pro | Team | Enterprise |
|---------|------|-----|------|------------|
| Canvas Workspaces | 1 | 5 | Unlimited | Unlimited |
| Canvas Nodes per Workspace | 5 | 20 | 100 | Unlimited |
| Native App Nodes | ❌ | 3 | 10 | Unlimited |
| AI Agents (OpenBot) | ❌ | 2 | 10 | Unlimited |
| Agent Templates | ❌ | 5 | 20 | Unlimited |
| Per-Terminal Accounts | 1 | 5 | 20 | Unlimited |
| Custom Terminal Folders | 2 | 10 | Unlimited | Unlimited |

## 11.4 Usage Tracking Updates

- Canvas node usage tracked as "premium feature usage"
- Native app launch count
- Agent runtime minutes
- Added to existing `usage_events` table

## 11.5 Mobile Companion Impact

- Canvas state **not synced** to mobile (too complex)
- Mobile shows: Active terminals, AI agents, notifications only
- QR pairing unchanged
---

# 12. ERROR-FREE & LAG-FREE GUARANTEES

## 12.1 Performance Budgets (Non-Negotiable)

| Metric | Target | Measurement |
|--------|--------|-------------|
| App cold start | < 2s | `performance.now()` at first paint |
| Terminal spawn | < 300ms | PTY spawn to first output |
| Terminal switch | < 50ms | Click to interactive |
| Canvas pan/zoom | < 16ms (60fps) | `requestAnimationFrame` callback |
| Node drag response | < 8ms | Pointer event → position update |
| Native app preview FPS | 15-30 fps | `desktopCapturer` frame rate |
| DWM thumbnail latency | < 5ms | Native, compositor-level |
| Notification sound | < 100ms | User action → audio start |
| Memory (10 canvas nodes) | < 300MB | Chrome DevTools Memory tab |
| Memory (20 terminals) | < 500MB | |
| Scrollback (3000 lines) | < 50MB/terminal | |

## 12.2 Lag Prevention Strategies

### Terminal Layer
1. **Instance Pooling** - Keep xterm instances alive, reuse on switch
2. **Virtualized Rendering** - Only render visible rows + buffer (100 rows)
3. **Reduced Scrollback** - 3000 lines default (configurable)
4. **CSS Containment** - `contain: strict` on terminal panes
5. **No Transitions** - Disable in focus mode, on terminal grid

### Canvas Layer
1. **Off-screen Node Pausing** - Terminals pause when not in viewport
2. **BrowserView Limit** - Max 3 concurrent BrowserViews
3. **RequestIdleCallback** - Layout calculations in idle time
4. **WebGL Grid** - Canvas-based grid rendering (not DOM)
5. **LRU Thumbnail Cache** - Max 5 native app thumbnails

### Main Process
1. **Utility Process for Native Module** - Isolate DWM thumbnail from main
2. **Debounced IPC** - Batch canvas saves (500ms)
3. **Stream Multiplexing** - Single WebRTC connection for multiple previews

## 12.3 Error-Free Strategies

### Defensive Coding
```javascript
// Every async operation wrapped
try {
  await riskyOperation();
} catch (e) {
  logger.error('Operation failed', { error: e.message, stack: e.stack });
  // User-facing toast via NotificationCenter
  showToast({ type: 'error', message: 'Operation failed. Check logs.' });
  // Graceful degradation
  return fallbackValue;
}
```

### State Machine for Critical Flows
```javascript
// Native app launch state machine
const APP_STATES = {
  STOPPED: 'stopped',
  STARTING: 'starting',
  WAITING_FOR_WINDOW: 'waiting_for_window',
  RUNNING: 'running',
  ERROR: 'error',
  CRASHED: 'crashed',
};

// Transitions validated, no invalid states possible
```

### Resource Cleanup Guarantees
```javascript
// Every component uses useEffect cleanup
React.useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe(); // ALWAYS
}, []);

// Native modules: explicit dispose()
class NativeAppCanvasNode {
  componentWillUnmount() {
    this.thumbnail?.destroy();
    this.stream?.getTracks().forEach(t => t.stop());
  }
}
```

## 12.4 Testing Strategy

| Test Type | Coverage | Tool |
|-----------|----------|------|
| Unit | Engine, Services, Hooks | Vitest (986/986 baseline) |
| Integration | IPC, Main↔Renderer, Engine↔Renderer | Vitest + Electron |
| Visual Regression | All surfaces, Canvas, Focus mode | Playwright + Percy |
| Performance | Startup, Terminal spawn, Canvas pan | Custom benchmarks |
| Memory Leak | 24h soak test | Chrome DevTools + heap snapshots |
| Cross-monitor | DPI, Multi-monitor | Windows test VMs |
| Native Module | DWM thumbnail create/update/destroy | Node-gyp test suite |
---

# 13. IMPLEMENTATION ROADMAP

## Phase 1: Critical Stability
- [ ] 3.1 External CLI auth crash fix
- [ ] 3.2 Ctrl+C crash fix
- [ ] 3.3 Terminal resize corruption fix
- [ ] 4.4 Desktop notifications (main process)
- [ ] 4.3 Notification sound delay fix
- [ ] Tests pass (986/986)

## Phase 2: Performance & Core UX
- [ ] 4.1 Scrolling lag (virtualization, reduced scrollback)
- [ ] 4.2 Terminal switching (instance pooling)
- [ ] 5.1 Copy/paste + context menu
- [ ] 5.2 Ctrl+Click links
- [ ] 5.3 Repeated localhost notifications
- [ ] 5.4 AI output misclassification
- [ ] Visual regression tests pass

## Phase 3: Terminal & AI Features
- [ ] 5.5 Multi-provider AI usage tracking
- [ ] 5.6 Ollama/model list display
- [ ] 6.1 Focus mode scrolling
- [ ] 6.2 Focus mode layouts (global)
- [ ] 6.3 Mission AI deselect
- [ ] 6.4 Cross-model chat history
- [ ] 6.5 Welcome screen fix
- [ ] 6.6 Stopped terminal cleanup
- [ ] 6.7 Sidebar minimize

## Phase 4: MCP & Mobile
- [ ] 7.1 MCP Gateway complete client support
- [ ] 7.2 QR code scannability
- [ ] Mobile companion testing

## Phase 5: Canvas Foundation
- [ ] CanvasWorkspace route + basic pan/zoom
- [ ] CanvasViewport + CanvasGrid
- [ ] 4 Node types: Terminal, Browser, Mission AI, Notes
- [ ] Drag/resize/select (react-dnd or custom)
- [ ] CanvasToolbar + Palette + Inspector + Layers
- [ ] Persistence per project (localStorage → Supabase)
- [ ] Theming system (CSS variables + title bar)
- [ ] Performance: 60fps with 10 nodes

## Phase 6: Native App Integration
- [ ] NativeAppManager (main process)
- [ ] DwmThumbnailNative native module (node-gyp)
- [ ] NativeAppCanvasNode with live preview
- [ ] App registry UI (register VS Code, Chrome, etc.)
- [ ] Focus/Minimize/Restore/Close controls
- [ ] Fallback to desktopCapturer
- [ ] Cross-monitor + High-DPI testing

## Phase 7: Canvas Polish
- [ ] Connections between nodes (visual wires)
- [ ] Groups/containers
- [ ] Canvas templates (pre-built layouts)
- [ ] Mini-map for large canvases
- [ ] Keyboard shortcuts
- [ ] Export/Import JSON
- [ ] Background patterns/images

## Phase 8: OpenBot Agents
- [ ] Agent template registry
- [ ] Inter-agent messaging protocol
- [ ] Agent marketplace UI
- [ ] Agent memory integration
- [ ] Supervision dashboard
- [ ] Plan enforcement updates

## Phase 9: Terminal Folders Redesign
- [ ] TerminalFolderManager replacement
- [ ] Collapsible sidebar sections
- [ ] AI Agents folder (auto, hidden in focus)
- [ ] Canvas Terminals folder
- [ ] Per-folder terminal management

## Phase 10: Per-Terminal Accounts
- [ ] Account registry (encrypted storage)
- [ ] Account selector in terminal titlebar
- [ ] Env injection on spawn
- [ ] Plan limits enforcement
---

# 14. RISK ASSESSMENT & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Native module build fails on CI | High | High | Pre-build binaries for win32/x64; fallback to desktopCapturer |
| DWM thumbnail not interactive | Certain | Medium | Clear UX: preview only, focus button for interaction |
| Canvas performance with 20+ nodes | Medium | High | Virtualize off-screen nodes; pause terminals; LRU cache |
| Electron sandbox breaks native module | Medium | High | Use `utilityProcess` for native module; isolate from main |
| localStorage quota for large canvases | Medium | Medium | Compress JSON (LZ-string); IndexedDB fallback for >5MB |
| Cross-monitor DPI issues | High | Medium | Test on multi-monitor; use `screen.getDisplayNearestPoint` |
| Theme breaks existing UI | Low | High | CSS variables only; no new stylesheets; test all routes |
| Supabase schema migration fails | Low | High | Versioned migrations; backward compat; rollback plan |
| Plan enforcement bypass | Low | Critical | Server-side validation on all premium features |
| Memory leak in canvas nodes | Medium | High | WeakRef for node refs; explicit dispose; heap snapshots in CI |
| Terminal pool LRU eviction loses state | Low | Medium | Serialize session state before eviction; restore on reuse |
| Audio context blocked by browser policy | Medium | Low | Prime on first user gesture; keep alive with silent buffer |
| Notification spam from AI agents | Medium | Medium | Per-agent cooldown; batch notifications; user preferences |

---

# 15. SUCCESS CRITERIA

## Phase 1-4 (Fixes) - Must Pass
- [ ] Zero crashes on CLI auth (agy/antigravity)
- [ ] Ctrl+C works in all terminals (interrupts shell)
- [ ] Resize preserves content perfectly (no garbled text)
- [ ] Notification sound < 100ms latency
- [ ] Desktop notifications work when minimized/backgrounded
- [ ] Copy/paste/context menu works reliably
- [ ] Ctrl+Click opens links in browser
- [ ] No duplicate localhost notifications (30s cooldown)
- [ ] AI output not flagged as errors (allowlist works)
- [ ] Usage tracking works for 4+ providers (Claude, Codex, Gemini, Ollama)
- [ ] Focus mode scrolling smooth (60fps)
- [ ] Focus mode has 4 layout options (global persistence)
- [ ] Mission AI source deselectable (clear button)
- [ ] Cross-model chat history works (shared conversationId)
- [ ] Welcome screen hides when AI agents running
- [ ] Stopped terminals clean (reset sequence sent)
- [ ] Sidebar collapses smoothly (200ms transition)
- [ ] MCP works with all clients (VS Code, Cursor, Windsurf, Claude)
- [ ] QR codes scan on first try (256px, quiet zone, version 10+)
- [ ] All 986 baseline tests pass
- [ ] Visual regression tests pass (all surfaces)

## Phase 5-7 (Canvas) - Must Pass
- [ ] Free-form canvas with pan/zoom (60fps)
- [ ] 5 node types functional (Terminal, Browser, Mission AI, Notes, Native App)
- [ ] Native apps launch + preview + focus (DWM thumbnail)
- [ ] Full window theming including title bar
- [ ] Persistence per project (localStorage + Supabase sync)
- [ ] 60fps pan/zoom with 10 nodes
- [ ] Memory < 300MB with 10 nodes
- [ ] Export/Import works (JSON)
- [ ] Connections between nodes (visual wires)
- [ ] Groups/containers work
- [ ] Mini-map for large canvases
- [ ] Keyboard shortcuts for all operations

## Phase 8 (OpenBot) - Must Pass
- [ ] Agent templates load (built-in + custom)
- [ ] Inter-agent messaging works (send/broadcast)
- [ ] Agent memory persists (project memory)
- [ ] Supervision dashboard shows all agents
- [ ] Plan enforcement works (limits respected)

## Quality Gates
- **Zero new `!important` in CSS**
- **Zero new renderer stylesheets**
- **Zero new settings groups**
- **All IPC via existing `mission-control:*` channels**
- **All storage via `safeStorage` encryption**
- **Context isolation + sandbox verified on every build**
---

# 16. CONVERSATION LOG

## 16.1 Initial Request (2026-11-07)

User provided comprehensive list of 21 critical bugs and 2 major feature requests:
- Canvas workspace (free-form, like October.dev)
- OpenBot-style AI agents
- Native desktop apps in canvas (actual window embedding)
- Per-terminal CLI account switching
- Terminal folders redesign
- Focus mode layouts (global)
- Mission AI improvements

## 16.2 Clarifications (2026-11-07)

| Question | Answer |
|----------|--------|
| Canvas type? | Full free-form (not grid dashboard) |
| Native apps? | Actual window embedding (real interaction) |
| Focus layouts? | Global (not per-project) |
| CLI accounts? | Per-terminal |
| Terminal folders? | Redesign existing |

## 16.3 Technical Reality Check (2026-11-07)

**Critical Finding**: Electron cannot embed native Windows apps. Explained the hard limits and proposed hybrid approach:
- DWM Thumbnail (Windows) / desktopCapturer (cross-platform) for live preview
- Window management (focus, position, size) via native module
- Clear UX distinction: preview in canvas, interaction in real window

## 16.4 Deep Analysis & Planning (2026-11-07)

Comprehensive codebase exploration performed:
- Read 50+ source files across engine, renderer, main process, services
- Analyzed architecture, naming conventions, constraints
- Identified root causes for all 21 bugs
- Designed technical solutions for each
- Created complete Canvas architecture with native app integration
- Designed database schema changes
- Defined performance budgets and error-free strategies

## 16.5 Document Created (2026-11-07)

This master planning document created as living reference at:
`docs/OUTARCH_MASTER_PLAN.md`

---

*End of OUTARCH Master Planning Document v1.0*
*Next update: After Phase 1 implementation begins*

---

# 17. DEEP ANALYSIS AUDIT ADDENDUM

## 17.1 Audit Metadata

- **Requested by:** OUTARCH project owner
- **Analysis performed by:** OpenAI Codex
- **Model family:** GPT-5
- **Analysis date:** 2026-11-08
- **Analysis mode:** Read-only repository audit followed by append-only documentation update
- **Audited file:** `docs/OUTARCH_MASTER_PLAN.md`
- **Preservation policy:** All content in the original master plan is preserved. This section is an additive audit addendum only.

The project owner requested and completed a deep analysis of the master plan to determine whether its technical claims, proposed fixes, architecture, roadmap, and success criteria are correct, complete, feasible, secure, and implementation-ready.

## 17.2 Overall Audit Result

The existing document is a valuable product-and-investigation brief, but it should not yet be treated as a fully verified implementation specification. It mixes confirmed repository facts, user-reported symptoms, inferred root causes, speculative solutions, sample code, and future product requirements without consistently distinguishing their evidence status.

The document should therefore be treated as a broad Version 0.1 planning baseline until the repository state, reproduction evidence, interfaces, security model, migration behavior, and measurable acceptance tests are recorded.

## 17.3 Repository Cross-Check Findings

The deep analysis identified the following important discrepancies and overlaps:

1. The repository currently contains 121 test files and approximately 1,028 `test`/`it` call sites. The repeated `986/986 baseline` claim is stale or unsupported unless it refers to a separately defined historical test subset.
2. Plain Ctrl+C already appears intentionally preserved for shell interruption in `TerminalPane.jsx`. The proposed Ctrl+C fix may duplicate existing behavior and should only be implemented if a reproducible regression test demonstrates failure.
3. The current terminal implementation uses configurable `terminalScrollback`, while the engine already bounds buffered lines. The claim that the current default is necessarily 10,000 lines is not established by the current source.
4. Focus-mode canvas layout, browser integration, AI conversation IDs, supervised-agent infrastructure, usage tracking, and secure-storage services already exist in the current codebase. These areas should be audited as partial implementations rather than automatically treated as entirely new features.
5. The external CLI authentication crash root cause is asserted but not proven. PTY creation, browser authentication, IPC streaming, external-window behavior, renderer responsiveness, and recovery timing need trace evidence before the proposed fix is accepted.
6. The plan proposes `!important` in an example while also requiring zero new `!important` usage. The implementation rule and the sample code must be reconciled.
7. The requirement that all storage use `safeStorage` encryption is too broad. Secrets require encryption, while ordinary canvas state, notes, preferences, and server-side records require appropriate persistence, ownership, access control, and synchronization policies.
8. The native-app canvas design is incomplete. DWM thumbnails cannot simply render inside a React DOM node. The design needs a defined native-to-main-process-to-renderer lifecycle, HWND ownership model, cleanup contract, DPI behavior, preview limitations, and failure recovery.
9. Full theming of arbitrary external application title bars is not an OUTARCH-controlled capability. The requirement must be scoped to OUTARCH-owned canvas chrome, with external application appearance explicitly outside the product's control.
10. Per-terminal API-key environment injection is unsafe and incomplete. Many CLIs use authenticated profiles or credential stores rather than environment variables. Account switching needs process/profile isolation, secret redaction, and an explicit restart or reauthentication policy.
11. The proposed Supabase schema lacks complete row-level security, tenant ownership rules, indexes, unique constraints, migration rollback behavior, audit fields, retention policy, and conflict resolution.
12. The roadmap lacks feature flags, staged rollout, rollback procedures, telemetry, and explicit dependency gates.
13. “Error-free” and “lag-free” are not technically defensible guarantees. They must be replaced with measurable reliability and performance objectives.

## 17.4 Required Evidence Classification

Every problem, root cause, proposed fix, and success criterion should be classified using one of the following statuses:

- **Confirmed by source inspection**
- **Reproduced in the application**
- **Measured by instrumentation**
- **Inferred hypothesis**
- **User-reported but not reproduced**
- **Future product requirement**
- **Blocked pending external dependency or platform validation**

No inferred root cause should be presented as confirmed until it has reproduction or trace evidence.

## 17.5 Required Bug-Analysis Structure

Each reported bug should contain the following fields before implementation begins:

1. User-visible symptom
2. Reproduction steps
3. Expected behavior
4. Actual behavior
5. Evidence and affected versions
6. Confirmed root cause or explicitly labeled hypotheses
7. Smallest safe fix
8. Regression tests
9. Performance or compatibility impact
10. Rollback plan
11. Observability and diagnostic logging

## 17.6 Architecture and Interface Improvements

Future implementation sections must define interfaces rather than relying only on illustrative snippets. Each new capability should specify:

- IPC channel name and ownership
- Request schema
- Response schema
- Validation rules
- Error codes and user-facing states
- Lifecycle events
- Cancellation behavior
- Resource ownership
- Cleanup and shutdown behavior
- Compatibility behavior for older clients

The existing protocol namespace and security constraints must remain authoritative. New capabilities must not bypass the preload bridge, context isolation, sandboxing, or existing approval boundaries.

## 17.7 Security Requirements To Add

- Never expose API keys in renderer state, canvas JSON, logs, notifications, or terminal output.
- Do not persist credentials in ordinary project or canvas documents.
- Define safeStorage availability, encryption-backend validation, migration, and failure behavior.
- Add row-level security and project/user/team ownership checks to every Supabase table.
- Use command and capability allowlists for agents.
- Preserve explicit approval boundaries for destructive or externally visible actions.
- Redact secrets from PTY transcripts, usage records, diagnostics, and exported files.
- Audit account changes, agent actions, native-app launches, permission decisions, and data exports.
- Define how credentials are revoked, rotated, deleted, and recovered.

## 17.8 Reliability and Recovery Requirements To Add

- Recover gracefully after PTY exit, renderer reload, main-process restart, and external CLI authentication.
- Deduplicate repeated terminal, localhost, agent, and notification events.
- Define reconnect, replay, overflow, and stale-stream behavior.
- Ensure all native resources, subscriptions, timers, BrowserViews, previews, and PTYs are disposed deterministically.
- Provide recoverable UI states instead of silent failure or indefinite loading.
- Record structured diagnostics with correlation IDs for terminal, renderer, IPC, agent, and notification flows.
- Define offline, stale-data, and partial-Supabase-failure behavior.
- Add migration recovery and rollback procedures before enabling persistent cloud synchronization.

## 17.9 Accessibility and Usability Requirements To Add

- Keyboard-only navigation for canvas pan, zoom, select, move, resize, grouping, and node actions.
- Visible focus indicators for every interactive canvas and terminal control.
- Screen-reader names and state announcements for nodes, layouts, agent status, and notifications.
- Reduced-motion support for focus mode, sidebar transitions, canvas movement, and notifications.
- High-contrast and Windows display-scaling validation.
- Clear distinction between preview-only native app nodes and interactive external windows.
- Explicit empty, loading, offline, stale, permission-denied, and recovery states.

## 17.10 Observability and Measurement Requirements To Add

Add structured telemetry for:

- Cold start and first meaningful paint
- PTY spawn and first output
- Terminal switch and first interactive input
- Resize/refit completion
- Renderer-to-main and main-to-renderer IPC latency
- Notification creation and delivery latency
- Canvas frame time, dropped frames, and node count
- Memory growth during terminal and canvas sessions
- Native-window discovery, preview, focus, and cleanup
- Agent lifecycle, retries, failures, approvals, and cancellations

All performance targets must identify the machine profile, workload, percentile, measurement method, and acceptable sample size.

## 17.11 Revised Implementation Sequence

### Phase 0: Re-baseline and Reproduce

- Freeze the reference commit and record branch, platform, Electron, Node, xterm, and Supabase versions.
- Inventory existing implementations that overlap with this plan.
- Run the actual test suite and record the result rather than relying on the historical `986/986` statement.
- Reproduce each reported bug.
- Capture logs, timings, screenshots, and traces.
- Classify every plan statement by evidence status.

### Phase 1: Critical Terminal Stability

- Fix only reproduced authentication, PTY, resize, exit, and input failures.
- Preserve current Ctrl+C behavior unless a regression test proves it is broken.
- Add regression tests before and after each fix.
- Add renderer reload, PTY exit, external-auth, and reconnect soak tests.

### Phase 2: Performance Instrumentation

- Measure current startup, terminal-switch, resize, scroll, and notification timings.
- Identify the actual render, IPC, PTY, or layout bottleneck.
- Optimize the measured bottleneck only.
- Do not introduce terminal virtualization or instance pooling until xterm lifecycle and memory behavior are proven.

### Phase 3: Existing Feature Completion

- Complete copy/paste, link handling, desktop notifications, usage tracking, focus mode, folder behavior, MCP, QR pairing, and Mission AI source selection.
- Reuse existing conversation, agent, usage, and browser infrastructure.
- Add compatibility and regression tests for existing behavior.

### Phase 4: Canvas v1

- Define a versioned canvas document model.
- Implement terminal, browser, Mission AI, and notes nodes first.
- Add selection, keyboard movement, resize, pan, zoom, persistence, export/import, and recovery.
- Use a feature flag and preserve the existing workspace as a fallback.
- Measure frame time and memory against a fixed node-count test matrix.

### Phase 5: Native-App Feasibility Prototype

- Prototype external-window discovery, focus, minimize, restore, DPI, and cleanup.
- Validate DWM thumbnail rendering outside the renderer first.
- Define the exact preview-only interaction model.
- Do not promise embedded interaction or external title-bar theming.
- Ship only if the prototype meets explicit Windows compatibility criteria.

### Phase 6: Agent Platform

- Extend the existing supervised-agent model instead of creating a parallel agent system.
- Define permissions, lifecycle, messaging, persistence, memory boundaries, cancellation, retry, and audit behavior.
- Add resource quotas and server-side entitlement checks.
- Defer marketplace functionality until the local lifecycle is reliable.

### Phase 7: Billing and Synchronization

- Add migrations with RLS, indexes, ownership constraints, rollback, and conflict handling.
- Synchronize only data that is safe and necessary.
- Keep credentials and private terminal data out of synchronized canvas documents.
- Add entitlement tests for every plan limit.

## 17.12 Revised Acceptance Criteria

Replace absolute claims such as “zero crashes,” “error-free,” and “lag-free” with measurable criteria:

- No reproduced crash in the defined authentication and PTY test matrix.
- No regression across the current test suite.
- p95 terminal-switch latency below the agreed threshold on a specified machine profile.
- p95 canvas frame time below the agreed threshold with a defined node count.
- Memory growth remains below a defined limit during a fixed-duration soak test.
- Notifications meet a measured p95 latency when supported by Windows.
- Every tested failure mode produces a recoverable UI state and structured diagnostic record.
- Security, migration, accessibility, and rollback gates pass before release.
- Performance results include workload, platform, sample size, percentile, and measurement tool.

## 17.13 Final Audit Conclusion

The existing master plan remains intact and continues to serve as the original product and engineering record. This addendum records the deep analysis performed afterward and identifies the work required to make the plan technically verified, implementation-ready, secure, measurable, and maintainable.

The next plan update should be based on repository evidence and reproducible test results rather than assumptions or historical counts.

*End of deep analysis audit addendum.*

---

# 18. INDEPENDENT MASTER PLAN ANALYSIS REPORT

## 18.1 Purpose and Scope

This report records an independent deep analysis of `docs/OUTARCH_MASTER_PLAN.md` (OUTARCH Master Planning Document v1.0). The analysis was performed read-only: **no source file was modified, removed, or created**. Every claim below was cross-checked against the live repository (731 files searched; every referenced file, symbol, and behavior verified in `src/`, `test/`, and `scripts/`).

## 18.2 Executive Verdict

| Question | Answer |
|---|---|
| Is the plan **correct** as a product brief / requirements capture? | **Mostly yes.** It faithfully captures the 21 reported bugs, the two big features (Canvas + OpenBot agents), the Electron/native-app reality check, and the project's non-negotiable rules. |
| Is it **correct / complete as an implementation specification**? | **No.** Several root causes are unverified or contradicted by the current source; sample code contradicts the document's own rules; four of the 21 listed bugs have no fix design; the native-app canvas architecture has unresolved sandbox conflicts. |
| Is it **implementation-ready today**? | **No.** It must be re-baselined (tests, measurements, reproduction) before any sample code is merged into `src/`. |
| Overall grade | **B− baseline** — valuable and well-structured, but not yet a verified engineering spec. |

**Key strength:** The plan's own Quality Gates (§15) and Section 17 addendum already mirror the project's five overriding rules (zero `!important`, zero new renderer stylesheets, zero new settings groups, `mission-control:*` IPC only, `safeStorage`, sandbox + context isolation). The document knows what the rules are — it just violates one of them in its own example code.

## 18.3 What Is Correct (Verified Against the Repo)

These claims were confirmed by searching the live source tree:

| Plan Claim | Location | Verified Reality |
|---|---|---|
| `src/engine/sessionEngine.cjs` owns PTY/spawn lifecycle | §2.3, §3.1 | ✅ Exists; `SessionEngine`, `RawReplayBuffer`, `MAX_RAW_REPLAY_BYTES` confirmed |
| `src/service/projectMemoryFile.cjs` + `arch_memory.md` naming | §2.2, §9.3 | ✅ Exists; `MEMORY_FILE_NAME = arch_memory.md`, legacy rename rules confirmed |
| `src/groundstation/main/appIdentity.cjs`, `distribution.cjs` | §2.3 | ✅ Both exist; `outarchDistribution: "microsoft-store"` store mode confirmed |
| `src/groundstation/main/workspaceBrowser.cjs` uses `WebContentsView` | §8.1 | ✅ Exists; **not** `BrowserView` (minor wording issue in §2.3) |
| `src/groundstation/renderer/terminalInput.js` exists | §3.2, §2.3 | ✅ Exports `chunkTerminalInput`, `isPasteChord`, `isShellAltChord` — but **not** `isInterruptChord` |
| `notificationSound.js` exports `primeNotificationSound` | §4.3 | ✅ Exists — and **is already called on mount** in `ToastSystem.jsx` (see issue #4 below) |
| `useInterfacePreferences.js` with `DEFAULT_INTERFACE_PREFERENCES` | §6.7 | ✅ Exists; `terminalScrollback` allowed values are `[1000, 5000, 20000]` |
| `src/groundstation/renderer/windowChrome.js` with `syncWindowChrome()` | — | ✅ Exists (renderer-side chrome sync) |
| Test baseline framing | §12.4, §13, §15 | ✅ Vitest + Playwright + Percy approach is correct in principle |

**Constraints honored (good):** No new settings groups proposed; no new renderer stylesheet proposed (canvas sections go into existing `surfaces.css`); `mission-control:*` IPC identifiers preserved; `arch_memory.md` not `PROJECT_MEMORY.md`; `%APPDATA%\OUTARCH` userData; store-mode skips AUMID/protocol registration.

## 18.4 Correctness Problems (with Line References)

### 18.4.1 The `986/986` baseline claim is stale or unsupported (§13, §12.4, §15)
The plan repeatedly gates releases on "All 986 baseline tests pass." The document's **own Section 17 addendum (#1)** states the repo currently has **121 test files and ~1,028 `test`/`it` call sites**, and that `986/986` refers to a historical subset at best.  
**Impact:** CI gates and Phase 1 exit criteria reference a number that cannot be verified in the current tree.

### 18.4.2 Ctrl+C fix may duplicate behavior that already works (§3.2)
The plan invents `isInterruptChord()` in `terminalInput.js` and a passthrough in `TerminalPane.jsx`. That function **does not exist** in the codebase. However, the addendum (#2) notes plain Ctrl+C is **already intentionally preserved for shell interruption** in `TerminalPane.jsx`.  
**Impact:** The proposed fix may be a no-op or a regression; it should only be implemented after a reproducible regression test demonstrates failure.

### 18.4.3 "10,000 lines default scrollback" is false (§4.1)
The plan claims `scrollback: 10000` is the default in `TerminalPane.jsx` and proposes reducing it to `3000`. Reality: `useInterfacePreferences.js` validates `terminalScrollback` against **`[1000, 5000, 20000]`** — 3000 is not even an allowed value, and there is no evidence 10,000 is the current default. The engine also already bounds replay buffers (`MAX_RAW_REPLAY_BYTES = 1 MB`, `RawReplayBuffer`, `SNAPSHOT_LINES = 200`).  
**Impact:** The fix targets the wrong number; `3000` would fail preference validation.

### 18.4.4 Notification-sound root cause is wrong (§4.3)
The plan claims `primeNotificationSound()` is "not called on app startup" and proposes priming in `App.jsx` plus a 5-second keep-alive interval resuming a suspended AudioContext. Reality: `ToastSystem.jsx` already calls `primeNotificationSound()` on mount (line 61), and `App.jsx` already imports `playNotificationSound`.  
**Impact:** The proposed fix duplicates existing code; a keep-alive interval resuming AudioContext every 5s fights browser autoplay policy instead of gesturing on first user interaction (which the addendum recommends).

### 18.4.5 `!important` example vs. zero-`!important` rule (§4.1)
The scrolling-lag fix example uses:
```css
.is-focus-mode .xterm-viewport { transition: none !important; animation: none !important; }
```
But §2.2 and the Quality Gates (§15) mandate **zero new `!important`** — the CSS ratchets sit at zero headroom.  
**Impact:** The document contradicts itself; following the sample would violate a non-negotiable rule.

### 18.4.6 Sidebar-collapse transition won't animate cross-browser (§6.7)
```css
.shell { transition: --mc-rail-w 200ms ease; }
```
Animating an **unregistered** CSS custom property is not supported in most browsers without `@property` registration. The success criteria (§15) promise a "smooth 200ms transition" that the code cannot deliver on Firefox (and historically requires `@property` even in Chromium).

### 18.4.7 Four of the 21 bugs have no fix design (§5)
The Executive Summary lists 21 critical bugs. Section 5 details only:
- **5.1** Copy/paste + context menu
- **5.2** Ctrl+Click links

Missing root-cause/fix designs for:
- **5.3** Repeated localhost notifications (cooldown is mentioned in success criteria but never designed)
- **5.4** AI output misclassified as errors (allowlist mentioned in success criteria but never designed)
- **5.5** Multi-provider AI usage tracking (only Claude tracked per exec summary; no design)
- **5.6** Ollama model list display truncated (exec summary #12; no design)

### 18.4.8 Native-app canvas architecture conflicts with the sandbox (§8.3–8.4)
- `DwmThumbnailNative.cc` is placed under `src/groundstation/renderer/canvas/native/` and required via node-gyp — but the app runs with `nodeIntegration: false` + `sandbox: true`; the renderer **cannot** `require` native addons.
- `NativeAppManager.cjs` is listed in **two** places: `renderer/canvas/native/` (line 835) and `main/canvas/` (line 841) — canonical ownership is undefined.
- The addendum (#8–#9): DWM thumbnails cannot simply render inside a React DOM node; the design lacks a native→main→renderer lifecycle, HWND ownership, cleanup contract, DPI behavior, and failure recovery. Full theming of external application title bars is **not an OUTARCH-controlled capability**.

### 18.4.9 Persistence story is inconsistent (§8.5 vs §11.2)
`useCanvasPersistence` writes **only** to `localStorage` (`mission-control:canvas:v1:`). The DB schema defines a Supabase `canvas_documents` table, and the roadmap says "localStorage → Supabase," but **no sync mechanism, migration, conflict resolution, or ownership model** is defined.

### 18.4.10 Malformed sample code (§7.2)
The QR generator fix block ends with a stray `});` and mismatched braces — it would not parse.

### 18.4.11 Misplaced file list (§7.1, line 709)
`Files: main/index.cjs, preload/index.cjs, notificationService.cjs, App.jsx` describes the desktop-notifications IPC handler from §4.4, not the MCP gateway section where it appears.

### 18.4.12 Wording: "BrowserView wrapper" (§2.3)
The codebase uses `WebContentsView`, not `BrowserView`. Minor, but the plan's own reality check (§1.2) correctly distinguishes them.

### 18.4.13 New preload surface not accounted for (§8.6)
Canvas theming proposes `window.missionControl?.setWindowChrome('canvas', theme.colors)` — a new preload API not in the existing contract. The repo already has renderer-side `windowChrome.js`/`syncWindowChrome()` that could be extended instead.

### 18.4.14 Agent-memory wiring is thin (§9.3)
Only a `createAgentMemoryEntry()` helper is shown. There is no write/read path to `projectMemoryFile.cjs`, no integration with the `projectMemory.*` protocol (12 methods), and no agent lifecycle (start/stop/cancel/retry) design.

### 18.4.15 `safeStorage` for *all* storage is overbroad (Quality Gate, §15)
Requiring **all** storage via `safeStorage` encryption is impractical for canvas state, notes, preferences, and server-side records — which need persistence, ownership, access control, and synchronization policies, not blanket encryption (addendum #7).

### 18.4.16 Absolute claims are not measurable (§15)
"Zero crashes," "error-free," "lag-free," "60fps" without machine profile, percentile, sample size, or measurement method (addendum §17.12).

### 18.4.17 Out-of-scope omissions
- No **session-recovery / crash boot gate** section (`SessionJournal`, `SessionRecoveryService`, `markCleanShutdown`, `deferAutoStart`) — core engine behavior that gates every launch.
- No **accessibility / reduced motion / high-contrast / i18n** section.
- No **observability / structured telemetry** section.
- No **dependency governance** (react-simplemde "or similar", react-dnd "or custom" — not confirmed in `package.json`).
- No **release / rollback / MSIX updater** section (Store `managed` mode exists in `distribution.cjs` but isn't planned around).
- No **owners, effort estimates, dates, or rollback triggers**.
- Per-terminal CLI accounts inject API keys into PTY process environment variables (§10.4) — security exposure not discussed.

## 18.5 Internal Contradictions Within the Document

| Contradiction | Where |
|---|---|
| Zero-`!important` rule vs. `!important` in scrolling fix | §2.2/§15 Quality Gates vs. §4.1 sample |
| "Actual window embedding — real interaction" requirement vs. preview-only + focus-button delivery | §1.1/#141 vs. §1.2/§8.4/§16.3 |
| `primeNotificationSound()` "not called on startup" vs. already called in `ToastSystem.jsx` | §4.3 vs. live source |
| `scrollback: 10000` default vs. allowed values `[1000, 5000, 20000]` | §4.1 vs. `useInterfacePreferences.js` |
| `localStorage`-only persistence hook vs. Supabase `canvas_documents` table vs. "localStorage → Supabase" roadmap | §8.5 vs. §11.2 vs. §13 Phase 5 |
| `NativeAppManager.cjs` in both renderer and main paths | §8.3 lines 835 and 841 |

## 18.6 How to Make It Perfect / Good / Best (Prioritized Recommendations)

### Phase A — Re-baseline (do before writing code)
1. **Run the actual test suite** and record the real count; replace every `986/986` with the measured baseline or a named historical subset.
2. **Reproduce each of the 21 bugs** with logs, traces, and screenshots. Classify every plan statement by evidence status: `CONFIRMED` / `INFERRED` / `PROPOSED` / `REQUIREMENT`.
3. **Measure** cold start, terminal spawn/switch, resize, scroll, and notification timings on a defined machine profile before optimizing anything (addendum Phase 0–2).

### Phase B — Reconcile contradictions
4. Remove `!important` from all samples; enforce via the existing CSS ratchet/tests.
5. Fix or withdraw the Ctrl+C sample pending a regression test; if broken, target the real handler in `TerminalPane.jsx` (~line 260–290) with before/after tests.
6. Replace `transition: --mc-rail-w` with `@property`-registered custom property animation or a class-driven opacity/transform collapse.
7. Align scrollback targets with `[1000, 5000, 20000]` and engine buffer bounds.

### Phase C — Complete the designs
8. Add root-cause/fix sections for bugs 5.3–5.6 (localhost notification cooldown, AI-error allowlist, multi-provider usage tracking, Ollama model list).
9. Rewrite the native-app canvas section: **main-process / utilityProcess ownership** of window discovery and DWM thumbnail; renderer receives only an image stream; define HWND lifecycle, cleanup, DPI, multi-monitor, failure recovery; explicitly scope out external title-bar theming and real input embedding.
10. Define one persistence owner for canvas documents (localStorage first-class + defined Supabase sync schedule + conflict handling) — or remove the Supabase table until the sync path exists.
11. Wire agent memory into `projectMemoryFile.cjs` / `projectMemory.*` protocol; add agent lifecycle and supervision.
12. Fix the QR snippet syntax; relocate the misplaced IPC file list; align `BrowserView`/`WebContentsView` wording.

### Phase D — Add the missing sections (content proposed in §18.7)
- Session recovery & crash boot gate
- Accessibility, reduced motion, high contrast, i18n
- Observability & measurable SLIs (p95/p99 with machine profile + sample size)
- Data security & encryption boundary (what gets `safeStorage` vs. plain persistence)
- Dependency governance
- Release, rollback, and Store distribution
- Multi-monitor / DPI / Windows display scaling
- Revised measurable acceptance criteria (§17.12-style)
- Revised implementation sequence (Phase 0 re-baseline → canvas v1 → native feasibility prototype)

## 18.7 Content to Add (Concrete Proposed Additions)

If you want to bring the document to v1.1, here is the specific content to add, organized as it would appear in the file:

### 18.7.1 Evidence-status tagging (add to front matter or §1)
Add a one-line legend and require every section to tag its statements:
```
Evidence status legend: [C] Confirmed in source · [I] Inferred from symptom · [P] Proposed fix, untested · [R] User requirement, not yet designed
```

### 18.7.2 New section — "19. SESSION RECOVERY & CRASH BOOT GATE"
Cover the launch sequence that currently gates every start:
- Derive `projectId` → `SessionJournal.startSession()` **overwrites** the journal, so inspect **before** `beginSession()`; main caches the boot report at gate time and serves the cached object to the renderer.
- `engineHost.open()` with `deferAutoStart` → `new SessionEngine({ deferAutoStart: true })`, released by `engineApi.releaseAutoStart()`; never rewrites a worker's saved `autoStart`.
- `markCleanShutdown()` on graceful quit skips the next launch prompt.
- Add a boot-gate test matrix: clean shutdown, unclean exit, journal present/missing/corrupt.

### 18.7.3 New section — "20. ACCESSIBILITY & INTERNATIONALIZATION"
- Keyboard-only navigation for canvas pan/zoom/select/move/resize/group/node actions.
- Visible focus indicators for every interactive canvas and terminal control.
- Screen-reader names/state announcements for nodes, layouts, agent status, notifications.
- `prefers-reduced-motion` support for focus mode, sidebar collapse, canvas movement, notifications.
- High-contrast and Windows display-scaling (multi-DPI) validation.
- Explicit empty/loading/offline/stale/permission-denied/recovery states.
- Preview-only vs. interactive distinction for native-app nodes.

### 18.7.4 New section — "21. OBSERVABILITY & MEASURABLE SLIs"
Structured telemetry with **machine profile, workload, percentile, method, sample size** on every target:
- Cold start / first meaningful paint
- PTY spawn → first output
- Terminal switch → first interactive input
- Resize/refit completion
- IPC latency (renderer↔main)
- Notification creation → delivery latency
- Canvas frame time, dropped frames, node count
- Memory growth during terminal/canvas sessions
- Native-window discovery, preview, focus, cleanup
- Agent lifecycle, retries, failures, approvals, cancellations

Replace absolute success criteria with measurable ones (per addendum §17.12):
- No reproduced crash in the defined PTY/auth test matrix
- Zero test-suite regressions
- p95 terminal-switch latency below threshold on specified machine profile
- p95 canvas frame time below threshold at defined node count
- Memory growth below limit during fixed-duration soak test
- Notification p95 latency when supported by Windows
- Every failure mode → recoverable UI state + structured diagnostic record

### 18.7.5 New section — "22. DATA SECURITY & ENCRYPTION BOUNDARY"
- `safeStorage` for credentials/secrets only (AI keys, stored tokens).
- Ordinary canvas state, notes, preferences, server-side records: appropriate persistence, ownership, access control, synchronization — not blanket encryption.
- Per-terminal CLI account API keys encrypted at rest (`terminal_cli_accounts.api_key_encrypted`); minimal env-surface at spawn; warn that PTY env is visible to child processes.
- Never log or persist raw keys.

### 18.7.6 New section — "23. DEPENDENCY GOVERNANCE"
- Confirm any third-party UI library (e.g. markdown editor, drag-and-drop) exists in `package.json` before referencing; replace "or similar"/"or custom" placeholders with decided implementations.
- No new renderer stylesheet; all canvas CSS goes into existing `surfaces.css` sections.
- No new settings groups (test-locked).

### 18.7.7 New section — "24. RELEASE, ROLLBACK & STORE DISTRIBUTION"
- Store mode (`outarchDistribution: "microsoft-store"`) skips AUMID/HKCU/protocol registration; updater reports `managedBy → "managed"`.
- Versioned Supabase migrations with RLS, indexes, ownership constraints, rollback, and conflict handling before enabling cloud canvas sync.
- MSIX packaging path (`asar: false`, RunAsNode, brand assets, launchers) — gate builds on sandbox + context isolation verification.
- Rollback triggers per risk table (§14).

### 18.7.8 New section — "25. MULTI-MONITOR / DPI / WINDOWS SCALING"
- Test on multi-monitor setups; use `screen.getDisplayNearestPoint` for window placement.
- Validate canvas DWM thumbnail and preview scaling at 100%/125%/150%/200%.
- LRU thumbnail cache (max 5), BrowserView limit (max 3), off-screen node pausing.

### 18.7.9 Revised implementation sequence (replaces/augments §13)
Per addendum §17.11:
- **Phase 0:** Re-baseline and reproduce (freeze commit, inventory overlaps, run real suite, reproduce bugs, capture traces).
- **Phase 1:** Critical terminal stability (only reproduced auth/PTY/resize/exit/input failures; preserve Ctrl+C unless regression-tested broken).
- **Phase 2:** Performance instrumentation (measure before optimizing; no virtualization/pooling until xterm lifecycle is proven).
- **Phase 3:** Existing feature completion (copy/paste, links, desktop notifications, usage tracking, focus mode, folders, MCP, QR, Mission AI source selection; reuse existing conversation/agent/usage/browser infrastructure).
- **Phase 4:** Canvas v1 (versioned document model; terminal/browser/Mission AI/notes nodes; selection, keyboard, resize, pan, zoom, persistence, export/import, recovery; feature flag with existing workspace fallback; frame-time/memory matrix).
- **Phase 5:** Native-app feasibility prototype (external-window discovery/focus/minimize/restore/DPI/cleanup; validate DWM thumbnail outside renderer first; preview-only interaction model; ship only if Windows compatibility criteria met).
- **Phase 6:** Agent platform (extend existing supervised-agent model; permissions, lifecycle, messaging, persistence, memory boundaries, cancellation, retry, audit; quotas + server-side entitlements; defer marketplace).
- **Phase 7:** Billing & synchronization (migrations with RLS/indexes/rollback; sync only safe/necessary data; credentials out of canvas documents; entitlement tests per plan limit).

## 18.8 Bottom Line

The master plan is a **strong product brief** with the right constraints and a sensible phased roadmap. It is **not yet a correct implementation specification**:

- **Fix first:** re-baseline the test count, withdraw/verify the Ctrl+C and scrollback samples, remove `!important`, fix the notification-sound diagnosis, and add designs for bugs 5.3–5.6.
- **Fix before building Canvas/native:** resolve the renderer-native-module sandbox conflict, decide the persistence owner (localStorage vs Supabase sync), and scope out external title-bar theming.
- **Add:** evidence tagging, session-recovery gate, accessibility, observability with measurable SLIs, security boundary, dependency governance, release/rollback.

I made **zero changes** to any source file during this analysis; only this report was appended to the master plan document, with all existing content preserved intact.

*End of Independent Master Plan Analysis Report.*

---

# 19. DEEP ANALYSIS SESSION — 2026-11-10 (CANVAS RETAINED)

## 19.1 Session Metadata

- **Requested by:** OUTARCH project owner
- **Analysis performed by:** DeepSeek V4.1 Flash (OpenCode agent)
- **Date:** 2026-11-10
- **Mode:** Plan mode — read-only repository audit, then append-only documentation update
- **Preservation policy:** **All content above is preserved intact. Nothing in this document was deleted, reworded, or replaced.** This section is purely additive.
- **Owner directive recorded in this session:** **The Canvas system must NOT be dropped.** It remains a first-class product requirement. Any wording anywhere in this document that can be read as "drop Canvas" is superseded by §19.2.

---

## 19.2 OWNER DECISION — CANVAS IS RETAINED (SUPERSEDES ANY "DROP" RECOMMENDATION)

The analysis in this session initially suggested that Canvas v1 could be delivered as "a view over the existing mosaic" and that the native-app portion of the design should be scoped down aggressively. **The owner rejected dropping Canvas.** This section therefore records the corrected position:

| Item | Status after owner decision |
|---|---|
| Canvas as a product feature | **RETAINED — non-negotiable.** It is a headline feature, not a nice-to-have. |
| Canvas node types (Terminal, Browser, Mission AI, Notes) | **RETAINED as originally designed** (§8.2). |
| Native App Nodes | **RETAINED as a feature.** Only the *interaction model* is constrained by the OS (see §19.6.3) — the node, the launch, the preview and the window controls all stay. |
| Free-form pan/zoom canvas | **RETAINED.** Not a grid dashboard. |
| Full window theming | **RETAINED** for OUTARCH-owned chrome and title bar. |
| Canvas persistence per project | **RETAINED.** |

**What changes is the engineering path, not the product scope.** Canvas is still built. The difference is *where the geometry code lives* and *how much of it is new versus extracted from what already exists in `App.jsx`* — see §19.6.

---

## 19.3 CONVERSATION RECORD

### 19.3.1 Owner request (verbatim intent)

> "read the master plan md file and do deep analysis what changes would you like to do in the code to make the outarch more and more better"

The owner asked for a deep analysis of `docs/OUTARCH_MASTER_PLAN.md` followed by a concrete list of code changes that would improve OUTARCH.

### 19.3.2 Analysis performed

1. Read `docs/OUTARCH_MASTER_PLAN.md` in full (2,214 lines at the time of reading — §1 through §18.8).
2. Verified the plan's claims against the live source tree:
   - `package.json`, `src/groundstation/renderer/*`, `src/groundstation/main/*`, `src/service/*`, `src/engine/*`, `test/`, `dist/groundstation/renderer/`.
3. Produced a root-cause analysis, a bug-by-bug fix table, a Canvas position, and a phased sequence.
4. The owner then directed that Canvas must be retained and that this entire session be appended to this document without deleting anything.

### 19.3.3 Owner follow-up (verbatim intent)

> "i dont want to drop canvas system and write all our conversation in the masterplan file do not delete anything from that file just write this on that file"

This is the instruction that produced §19. It has three binding constraints, all satisfied here:

1. Canvas is **not** dropped (§19.2).
2. The conversation is written into this file (§19.3–§19.9).
3. Nothing existing is deleted (§19.1).

---

## 19.4 VERIFIED REPOSITORY FACTS (SOURCE-EVIDENCED)

These were confirmed by direct inspection during this session. They are recorded because several claims in §3–§7 do not match the current tree.

| Claim in this document | Verified reality | Evidence |
|---|---|---|
| "986/986 baseline, Vitest" | 121 test files; runner is `node --test test/*.test.cjs` | `package.json:46`; `test/` contains 121 `*.test.cjs` |
| "`scrollback: 10000` default → reduce to 3000" | Default is **5000**; allowed values are `[1000, 5000, 20000]` — 3000 would fail validation | `TerminalPane.jsx:88`, `useInterfacePreferences.js:55` |
| "Ctrl+C not passed through — add `isInterruptChord`" | Plain Ctrl+C already falls through to the shell (`return true` at the end of the handler) | `TerminalPane.jsx:243–278`, specifically `:277` |
| "`primeNotificationSound()` not called on startup" | It is already called on mount | `ToastSystem.jsx:61` |
| "Zero new `!important`; no new stylesheets" | The shipped CSS already contains **1,417** `!important` declarations and **1,647** `#root#root…` specificity-escalation selectors, across 8 stacked layers | `main.jsx:8–39`; measured across `*.css` and `redesign/*.css` |
| "4 focus layouts to add" | 5 layouts already exist (`single`, `horizontal`, `vertical`, `grid-2x2`, `grid-3x2`) | `useTerminalLayout.js:3–9` |
| "Canvas is a new subsystem" | A packed mosaic canvas with per-tile sizing, drag/resize, persistence and browser/AI tiles already exists | `App.jsx:2234–2766`, `canvasTiles.js` |
| "BrowserView wrapper" | Uses `WebContentsView` | `workspaceBrowser.cjs:128–137` |
| "All storage via `safeStorage`" | Not implemented as a blanket rule; secrets-only is the practical boundary | see §18.4.15 |
| QR generator "version too small" | Actual defect is the **quiet zone: 2 modules instead of the spec-mandated 4**, plus a 164 px render and `rx="8"` rounding | `MobileCompanion.jsx:66–79` |

### 19.4.1 Build weight (measured)

| Artifact | Size |
|---|---|
| CSS source across all renderer layers | **1.19 MB** |
| CSS shipped to the renderer | **951 KB** (single render-blocking stylesheet) |
| `dist/.../index-*.js` | 411 KB |
| `dist/.../workspace-terminal-*.js` | 374 KB |
| `dist/.../vendor-react-*.js` | 151 KB |
| `App.jsx` | 4,146 lines / 300 KB |
| `GroundstationApp` function alone | ~700 lines (`App.jsx:3442–4142`) |
| `WorkspaceView` function alone | ~530 lines (`App.jsx:2234–2766`) |

---

## 19.5 THE SIX ROOT CAUSES (HIGHEST-LEVERAGE CHANGES)

Most of the 21 reported symptoms are downstream of six architectural conditions. Fixing these resolves many bugs at once, which is why the sequence in §19.9 starts here rather than with individual symptom patches.

### 19.5.1 [C] The main process parses every PTY byte, line by line

`workspaceIntelligence.cjs:270–329` (`#consume`) runs, **for every line of every terminal's output**:

1. `detectRestartSignal(line)`
2. `services.processTerminalOutput(...)`
3. `agents.recordOutput(...)`
4. `events.inspectOutput(...)` — several regex passes
5. `prompts.observe(...)` — permission-prompt detection

`MAX_LINES_PER_CHUNK = 200` (`:25`), no time budget, no backpressure. During a Claude/Codex run printing thousands of lines per second across several terminals, the **main-process event loop** is continuously doing regex work. Every IPC call queues behind it.

**Symptoms explained by this single condition:** scrolling lag, terminal-switch lag, delayed notification sound, and "app not responding" during external CLI authentication.

**Change:** move this pipeline to a `utilityProcess` or worker thread with a bounded queue, and make it budgeted rather than exhaustive:
- Keep line splitting only where line semantics are required (port/URL discovery, permission prompts).
- Run agent/event/evidence classification against a time budget (e.g. 8 ms per 100 ms) over a ring buffer.
- Lower `MAX_LINES_PER_CHUNK` to ~50 and skip classification on `metadata.redraw === true` (partially handled today at `:276`).
- Add counters: lines inspected/sec and p95 observer work time, with a warning above 4 ms.

### 19.5.2 [C] Terminal lifecycle: one pane = one throwaway xterm

**(a) Switching destroys and rebuilds the terminal.** The effect at `TerminalPane.jsx:209–416` is keyed on `session?.id`. Changing the session in a slot disposes the xterm, opens a new stream and replays up to 1 MB of scrollback. That is the "switching terminals is very laggy" bug.

**Change:** keep a mounted pane per session and hide it, instead of reusing one slot component. Call `fit()` on reveal inside `requestAnimationFrame`; never re-create on switch or layout change.

**(b) Ctrl+C appears to destroy the terminal.** `session.isAlive` is a dependency of the xterm creation effect (`TerminalPane.jsx:416`). When the PTY exits, `terminal.writeln("[worker exited]")` (`:341`) runs against a terminal that is immediately disposed, a new xterm is created, and the scrollback is wiped. This is the reported "Ctrl+C crashes / freezes characters while others keep moving" behaviour.

**Change:** remove `session?.isAlive` and `session?.startTime` from that dependency array. Split into two effects:
- **Effect 1 (identity + preferences):** create xterm, open stream. Deps: `session.id`, font size, theme, cursor, scrollback.
- **Effect 2 (liveness):** on `isAlive → false`, close the stream, set `aliveRef = false`, write the exit marker, **keep the buffer**. On `isAlive → true` after restart, request a fresh replay and reset the buffer.
- Reset the buffer only on explicit user action ("Clear display"), never on exit.

**(c) Resize storms.** `fitAndResize` (`TerminalPane.jsx:293–311`) fires on every `ResizeObserver` frame and sends `terminal.resize` **unconditionally**, even when `cols`/`rows` did not change. Dragging a splitter produces ~60 ConPTY repaints per second, each entering the engine's redraw-suppression path (`sessionEngine.cjs:415–429`). This is the "text gets mixed up when resizing" bug.

**Change:** compare against the last sent size and debounce trailing ~120 ms:

```js
const next = { cols: terminal.cols, rows: terminal.rows };
const prev = lastSizeRef.current;
if (!prev || prev.cols !== next.cols || prev.rows !== next.rows) {
  lastSizeRef.current = next;
  debouncedResize(next);
}
```

Also preserve scroll-from-bottom across `fit()` (the §3.3 snippet is directionally correct and should be kept).

### 19.5.3 [C] PTY size authority mismatch — the Ollama truncation bug

The PTY is spawned at **120×30** (`sessionEngine.cjs:265–266`). The renderer resizes only *after* stream activation, and only when the pane is mounted and not minimized (`TerminalPane.jsx:294` returns early on `minimizedRef.current`). Any full-screen TUI (Ollama's model picker, Claude's permission dialogs, `htop`) can therefore be drawing for a 30-row viewport inside a 20-row pane — or the reverse. Because these apps use the alternate screen buffer, **there is no scrollback to scroll**; clipped rows are genuinely lost. This matches the owner's description exactly ("content not full even when scrolling, arrow keys do not reach it").

**Change:**
1. Make the pane the single size authority: send `cols`/`rows` as part of `terminal.open` so the PTY is correct before the first byte is drawn.
2. Always `fit()` before a pane is revealed, even if it was minimized.
3. Surface the mismatch for diagnosis: show `xterm cols×rows` vs `engine cols×rows` in the pane tooltip.

### 19.5.4 [C] Notifications: the chime is played by a throttled renderer

Chain: main `NotificationCenter` → `notification:new` → renderer toast → `playNotificationSound` (`App.jsx:3959`).

1. **No `backgroundThrottling: false`** on the main window (`main/index.cjs:363–367`). When minimized or occluded, Chromium throttles renderer timers and audio scheduling: the Windows toast appears promptly while the chime and in-app toast arrive seconds later. This is the reported sound delay.
2. `IDLE_SUSPEND_MS = 20_000` (`notificationSound.js:33`) deliberately suspends the AudioContext after 20 s idle and resumes on demand, adding wake-up latency to every chime after a quiet period.

**Change:** set `backgroundThrottling: false`; keep the audio context alive while the Sound setting is enabled (drop the auto-suspend, or use a silent buffer loop); and move the chime to a main-process or `utilityProcess` audio path so notification sound never depends on renderer scheduling. The §4.3 proposal of a 5-second keep-alive interval is the wrong shape — it fights autoplay policy rather than avoiding the suspend.

**Repeated localhost notifications:** `service.ready` has `rank: 0` (`notificationCenter.cjs:47`), so it bypasses incident merging and relies only on `IN_APP_DEDUPE_MS = 20_000` (`:75`). A dev server that reprints its URL every 30 s notifies every 30 s. **Change:** make the per-service `generation`-based dedupe authoritative with no time expiry; `generation` is already bumped on restart signals (`workspaceIntelligence.cjs:313`).

**Desktop notifications while backgrounded:** obtain evidence before changing code — read `notificationCenter.status()` → `lastError` / `lastSuppressedReason`. If it reports `app-focused`, then `#isAppFocused` (`main/index.cjs:988`) is at fault. If it reports unsupported/delivery failure, it is Windows AUMID/shortcut registration: `appIdentity.cjs:145–151` registers only the `HKCU\Software\Classes\AppUserModelId` key, while toasts from unpackaged apps normally also require a Start-Menu shortcut carrying that AUMID.

### 19.5.5 [C] CSS has become unfixable — and it costs startup time

- 1.19 MB of source CSS across 8 stacked layers (`main.jsx:8–39`), shipped as a 951 KB render-blocking stylesheet.
- 1,417 `!important` declarations.
- 1,647 `#root#root…` selectors, i.e. specificity escalation because layers fight each other (for example `workspace.css:228` needs `!important` to set the xterm background).

This is why UI changes are risky, why "make the sidebar collapsible" turns into an override war, and it contributes to startup cost and style recalculation during scroll and resize.

**Change (mechanical, safe, incremental):** adopt `@layer` in `main.jsx` order and move the redesign files into named layers so specificity stops mattering. Then remove `!important` layer by layer, starting with `workspace.css` and `surfaces.css`. Document the real layer order in `redesign/README.md` and add a test that fails when a new `!important` is introduced.

### 19.5.6 [C] `App.jsx` is a 4,146-line component with a layout engine inside render

`WorkspaceView` is ~530 lines of mosaic/track/tile mathematics, reading `getComputedStyle` inside a `requestAnimationFrame` and using `JSON.stringify(tileSource)` as a memo key (`App.jsx:2398–2435`). Every activity tick re-renders the whole shell.

**Change (extract, do not rewrite):**
1. `workspace/layout/` — the pure geometry functions (mosaic columns, tile rows, tile templates). They are already pure and testable without React.
2. `useCanvasGeometry(gridRef, packedCanvas, …)` — the `ResizeObserver` measurement hook.
3. `WorkspaceCanvas.jsx` — renders tiles only.
4. `GroundstationApp` keeps state and IPC and nothing else.

Target: `App.jsx` below ~900 lines. **This extraction is a prerequisite for Canvas v1, not an alternative to it** — the free-form canvas needs exactly this geometry, and two copies of it would be a permanent source of bugs.

---

## 19.6 CANVAS — RETAINED AND STRENGTHENED

Canvas is not reduced in scope. This section records the engineering path that makes it shippable without a rewrite.

### 19.6.1 What already exists and must be reused (not rebuilt)

| Capability | Where it already lives |
|---|---|
| Tiles with per-tile sizing, spans, placements | `App.jsx:1696–1716`, `placedTileStyle` `:2149` |
| Persistence of tile geometry per workspace | `canvasTiles.js`, `readCanvasTiles`/`useCanvasTiles` `App.jsx:2105–2147` |
| Drag a terminal between panes | `TerminalPane.jsx:523–526`, `:598–600` |
| Browser as a canvas tile | `WorkspaceBrowser.jsx`, `App.jsx:2376–2377` |
| Mission AI as a canvas tile | `WorkspaceAssistant.jsx`, `App.jsx:2377` |
| Packed multi-tile canvas | `WorkspaceView` mosaic path `App.jsx:2360–2458` |
| Layout handles and ratios | `useTerminalLayout.js:57–72`, `layoutHandles` |

Canvas v1 therefore adds three things on top of a working base: **free x/y positioning** instead of grid cells, **pan/zoom** on a transform container, and **node chrome** (title bar, resize handles, inspector). It does not require a new tile system.

### 19.6.2 Node types — all retained

Per §8.2, all node types remain in scope: Terminal, Browser, Mission AI, Notes, Native App, Group. The change is that the first four are implemented by **wrapping the existing components** (`TerminalPane`, `WorkspaceBrowser`, `WorkspaceAssistant`, plus a new notes editor), exactly as §8.3 intended.

### 19.6.3 Native App Nodes — retained, with an OS-level constraint that is not a product cut

**Canvas, native-app nodes and window management are all retained.** What is recorded here is a platform fact, not a scope reduction:

> Electron cannot embed a native Windows application as an interactive child surface inside a renderer DOM node. `BrowserView`/`WebContentsView` host web content only; `desktopCapturer` is one-way video; DWM thumbnails are compositor-level and cannot be addressed into a DOM element; `SetParent` breaks sandboxing, input routing and security.

This constraint was already stated correctly in §1.2 and §17.3 #8–#9. §19 does not withdraw the feature — it records the delivery model that keeps it:

1. **Launch** the real app (`shell.openExternal` / `spawn`).
2. **Discover and own the window** (`NativeAppManager` in the **main process**, per §18.6 item 9 — not in the renderer, where `sandbox: true` + `nodeIntegration: false` make a native module impossible).
3. **Preview** the window in the node (DWM thumbnail composited in the main process, streamed to the renderer as an image surface; `desktopCapturer` as the cross-platform fallback).
4. **Control** it: Focus, Minimize, Restore, Close, position/size via native calls in the main process.
5. **State it plainly in the UI:** the node is a live preview with a "Focus to interact" control. Interaction happens in the real window.

**Retained, explicitly:** the node, the preview, the controls, the registry, the theming of OUTARCH-owned node chrome, and per-project persistence. **Not promised:** keystroke-level interaction inside the preview, and theming of the external application's own title bar — neither is within Electron's control, and promising them would produce a permanent "broken feature" report.

### 19.6.4 Persistence — one owner, decided

`useCanvasPersistence` in §8.5 writes only to `localStorage`, while §11.2 defines a Supabase `canvas_documents` table. This ambiguity must be closed before Canvas v1 ships:

- **Device-local canvas geometry and node positions:** `localStorage` (first-class, always works offline).
- **Cloud sync:** **off** until the Supabase table has RLS, ownership constraints, indexes, versioned migrations, rollback and a defined conflict policy. The table may exist; the sync path may not.
- **Never** put credentials, terminal transcripts or secrets in a canvas document.

### 19.6.5 Canvas performance budgets (retained from §12.1, restated as gates)

- 60 fps pan/zoom with 10 nodes, measured on a stated machine profile.
- Off-screen nodes pause (no `fit()`, no writes processed for hidden panes).
- Browser node cap: 3 concurrent `WebContentsView`s.
- Terminal nodes share the single mounted-pane rule from §19.5.2(a) — a canvas terminal and a workspace terminal for the same session are the same xterm, not two.

---

## 19.7 AGENTS (OPENBOT) — RETAINED, BUILT ON EXISTING SUPERVISION

The agent platform stays in scope (§9, Phase 8). It must extend, not duplicate, what exists:

| Existing component | Role in the agent platform |
|---|---|
| `missionSupervisor.cjs` | Plan proposal and validation |
| `agentActivityService.cjs` | Agent detection, thinking state, awaiting-approval |
| `agentAdapters.cjs` | Adapter registry |
| `projectSupervision.cjs` | Supervision snapshot |
| `agentPromptDetector.cjs` | Permission prompt capture |
| `semanticEventRouter.cjs` + `notificationCenter.cjs` | One incident, one notice |

A parallel agent messaging system would break the "one incident, one notice" guarantee that `notificationCenter.cjs` was written to establish. Agent templates, inter-agent messaging and memory should be layered onto these services, with agent memory written through `projectMemoryFile.cjs` and the `projectMemory.*` protocol (the gap identified in §18.4.14).

---

## 19.8 CORRECTIONS TO EARLIER SECTIONS

Recorded for traceability. **The original text is left untouched** (§19.1); these are the corrections that should govern implementation.

| Section | Correction |
|---|---|
| §3.2 Ctrl+C | Withdraw the proposed fix. Plain Ctrl+C already reaches the shell. The real defect is terminal teardown on exit (§19.5.2b). |
| §3.3 Resize | Keep the scroll-preservation idea; add size-change detection and trailing debounce (§19.5.2c). |
| §4.1 Scrolling | `scrollback: 3000` is invalid; allowed values are `[1000, 5000, 20000]`. The primary cost is the main-process observer pipeline (§19.5.1) and `screenReaderMode: true` on every pane (`TerminalPane.jsx:223`), not scrollback size. |
| §4.1 `!important` sample | Remove. It contradicts §2.2 and §15, and the codebase already has 1,417 of them to remove (§19.5.5). |
| §4.3 Notification sound | Diagnosis is wrong — priming already happens. The causes are renderer throttling and the 20 s audio suspend (§19.5.4). |
| §5.2 Link opening | `registerLinkMatcher` is xterm 4 API. xterm here is 6.0.0 (`package.json:59`); use `registerLinkProvider`. |
| §6.7 Sidebar collapse | Do not animate an unregistered custom property. Use a class-driven width/transform change, or register with `@property`. |
| §7.2 QR | `padding = 2` in `MobileCompanion.jsx:66`; the spec requires a 4-module quiet zone. Also raise the render size above 164 px and drop `rx="8"`. |
| §8.3/§8.4 Native module | `DwmThumbnailNative.cc` cannot live under `renderer/` (sandbox). Own it in the main process or a `utilityProcess` (§19.6.3). |
| §12.4 Testing | Vitest is not the runner; it is `node --test`. Replace `986/986` with a measured baseline. |
| §15 Quality gates | "Zero new `!important`" is correct as an aspiration but must be stated as "reduce from 1,417 and never add one", with a test. |
| §18.6 item 9 | Endorsed — this is the basis of §19.6.3. |

---

## 19.9 REVISED IMPLEMENTATION SEQUENCE (CANVAS INCLUDED)

This sequence replaces the ordering guidance of §13 while keeping every feature in scope, Canvas included.

| Phase | Work | Gate |
|---|---|---|
| **0 — Evidence** | Run `npm test`, record the real count. Capture `notificationCenter.status()`. Reproduce bugs 2, 3 and 12 with a scripted 5-terminal + Ollama + Claude scenario. | Evidence table; no code changed |
| **1 — Main-loop health** | Observer pipeline off the main loop (§19.5.1). Remove liveness from xterm deps (§19.5.2b). Debounced resize (§19.5.2c). | Scroll/switch p95 measured before and after; Ctrl+C keeps its buffer |
| **2 — Terminal correctness** | Pane owns PTY size (§19.5.3). `screenReaderMode` opt-in. Copy/paste + context menu. Ctrl+Click links via `registerLinkProvider`. QR quiet zone. | Ollama model list fully reachable; QR scans on 3 phones |
| **3 — Notifications & intelligence** | `backgroundThrottling: false`, audio path (§19.5.4). Per-generation service dedupe. Agent-aware error classification. Multi-provider usage tracking. | Chime p95 < 150 ms; no repeated URL notice; no false errors from agent prose |
| **4 — Structure** | Extract layout from `App.jsx` (§19.5.6). Mounted panes per session (§19.5.2a). | `App.jsx` < 900 lines; switch p95 < 50 ms |
| **5 — Workspace UX** | Sidebar icon rail. Focus-mode layout scope made global. Mission AI source chip with deselect. Cross-model history passed into prompts. | Each behaviour has a regression test |
| **6 — Canvas v1** | Free x/y nodes, pan/zoom, node chrome, inspector, layers, notes node, export/import, per-project persistence — **all retained** (§19.6). | 60 fps pan with 10 nodes; memory budget met; existing workspace available as fallback |
| **7 — Native App Nodes** | Main-process `NativeAppManager`, window discovery, DWM preview path, Focus/Minimize/Restore/Close, registry UI, `desktopCapturer` fallback — **retained** (§19.6.3). | Ship-or-kill on a defined Windows compatibility matrix |
| **8 — Agents** | Templates, messaging, memory via `projectMemoryFile.cjs`, supervision dashboard — **retained** (§19.7). | Lifecycle, permissions, cancellation and audit tests pass |
| **9 — Accounts & billing** | Per-terminal CLI accounts with secrets in `safeStorage` only, env-surface warnings, entitlement tests. | No secret reaches renderer state, logs, canvas JSON or terminal output |

### 19.9.1 Non-negotiable gates carried forward

- Zero regressions against the **measured** baseline (§19.4).
- No new `!important`; a net reduction each phase.
- No new renderer stylesheet for Canvas — new sections go into existing `surfaces.css` under `@layer` (§19.5.5).
- No new settings groups.
- All IPC via existing `mission-control:*` channels.
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` verified on every build.
- Credentials only through `safeStorage`; never in canvas documents, notifications, logs or PTY transcripts.

---

## 19.10 EVIDENCE STATUS LEGEND (APPLIED IN THIS SECTION)

- **[C]** Confirmed by source inspection — cited with `file:line`.
- **[I]** Inferred hypothesis — requires reproduction before implementation.
- **[P]** Proposed change — designed, not yet tested.
- **[R]** Owner requirement — binding regardless of implementation detail.

Every statement in §19.4 and §19.5 is **[C]** unless marked otherwise. §19.6.3 records an **[C]** platform constraint plus a **[P]** delivery model. §19.2 is **[R]** and takes precedence over any engineering preference in this document.

---

*End of Deep Analysis Session — 2026-11-10. Canvas retained. Nothing above this section was modified.*

