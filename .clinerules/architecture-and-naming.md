# Architecture & Naming — OUTARCH

> Source notes: `outarch-rebrand.md` (2026-09-16), `outarch-project-memory-0922.md`
> (2026-09-22/23), `outarch-microsoft-store-0923.md`, `mission-control-recovery-journal.md`,
> `mc-project-overview.md` (2026-08-24). Full detail: `docs/OUTARCH_PROJECT_MEMORY.md` §1–§2.

## Topology

Windows-first developer command center around a **Node PTY engine**
(`src/engine`, `node-pty` + ConPTY). Two clients share `EngineAPI` over Protocol v1:

- **TUI** — Ink (`src/tui`), binary `termctl` / `outarch`
- **Groundstation** — Electron + React + Radix + cmdk + xterm.js
  (`src/groundstation/renderer/`)

Renderer surfaces: Groundstation, Workspace, Needs You, Agents, History, Projects,
Settings. Overlays: MissionAI, MissionGraph, WorkspaceRecipes, McpGateway,
AutomationWorkflows, MobileCompanion, WorkerQuickLook, WorkerFocus, CommandPalette.

Electron hardening (verified 2026-09-02 and 2026-09-26): `contextIsolation`,
`sandbox`, **`nodeIntegration: false`**, IPC restricted to main-frame senders,
allow-listed `openExternal`, `safeStorage`-encrypted credentials, CSP + nav lock.

> **Never set `nodeIntegration: true`.** The packaged app is verified with the
> sandbox and context isolation on.

## Naming

- **OUTARCH** (all caps) wherever a *person reads* the product name — prose,
  comments, UI copy.
- **lowercase `outarch`** only for identifiers (bin alias, file names).
- Feature names kept: **Groundstation, Mission AI, Mission Command**.

### Keep as `mission-control` / `MC_*` (other tools + saved user data depend on them)

`mission-control:*` IPC channels and localStorage keys · `window.missionControl` ·
MCP server key, `mission-control://` URIs, `mission_control_*` tool names ·
Android package `dev.missioncontrol.companion` · `MC_*` / `MISSION_CONTROL_*`
env vars · `--mc-*` CSS custom properties · `termctl` CLI.

`test/outarchBrand.test.cjs` fails if the string "Mission Control" reappears in
`src/`, the VS Code extension, Android, or plugin examples.

**VS Code extension id changed on 2026-09-26**: `mission-control.bridge` →
`outarch.outarch-bridge` (Marketplace rejected the bare name "bridge"). The
`vscode://` connect link in `src/service/vscodeBridge.cjs` and 4 tests were
updated. **This change was intentional** — do not "restore" the old id.

## userData

The app never used to name itself, so its data lived in `%APPDATA%\Electron`
(shared with every unpackaged Electron program).
`src/groundstation/main/appIdentity.cjs` now **copies (never moves)** the app's
files plus `Local State` (the `safeStorage` key — sealed keys are unreadable
without it) and `Local Storage` into **`%APPDATA%\OUTARCH`**, via a staging
folder + rename, falling back to the old folder on failure. Honours
`OUTARCH_USER_DATA_DIR`. A single-instance lock was added (skipped with
`--config` or visual capture). AUMID `OUTARCH.Desktop` is registered under HKCU
for toasts.

Consequence: the real app profile is no longer `%APPDATA%\Electron` after its
first new launch. Probe scripts that assume the old path cannot touch it;
`probe-eval.cjs` uses `%TEMP%\outarch-visual-harness`.

## Project-memory feature (`arch_memory.md`)

Per-project Markdown memory that every AI agent reads and appends to (model
name, short summary, why), never deletes.

- Service `src/service/projectMemoryFile.cjs`; UI
  `src/groundstation/renderer/ProjectMemory.jsx`; protocol `projectMemory.*`
  (12 methods); CSS section "19 · project memory" in `redesign/surfaces.css`.
- The file is **`arch_memory.md`** (`MEMORY_FILE_NAME`). `LEGACY_FILE_NAMES =
  ["PROJECT_MEMORY.md"]`; a legacy file is renamed **only if it carries
  `MEMORY_MARKER`** — someone else's `PROJECT_MEMORY.md` is left alone.
  `#repointAgents()` rewrites existing pointer blocks so `CLAUDE.md`'s `@`
  import follows. `MEMORY_EXCLUDES` covers both names in git pathspecs.
- Deliberately **not** renamed: error code `PROJECT_MEMORY_ERROR`, MCP resource
  `project_memory`, the UI name "Project memory", the file's H1.
- The "different API key" requirement = a new model surface **`memory`** in
  `aiAssistant` (`SELECTION_SURFACES`), plus `compose()` (one tool-less call).
  Mission AI returns **JSON**; OUTARCH formats the entry — a model cannot inject
  headings.
- Settings group ids are test-locked: **do not add a new settings group**.

> **Name-clash trap:** `src/groundstation/renderer/projectMemory.css` (lowercase p)
> is **NOT** this feature — it styles the History page's engine "Project Memory 2"
> (`src/engine/projectMemory.cjs`). The History header also says "PROJECT MEMORY".
> **Grep case-insensitively before calling any file unused.**

## Session recovery gate

`SessionJournal.startSession()` **overwrites** the journal file, so inspect
**before** `beginSession()` — afterwards you are inspecting the run you just
started, which always looks unclean. The renderer cannot get the crash report
from `recovery.inspect` (the session is already open); main caches the boot
report at gate time and serves that cached object.

Order in `main/index.cjs`: derive the project id (`projectIdFor(configPath)`,
must match the post-open id) → inspect → pass `deferAutoStart` to
`engineHost.open()` → `beginSession()`. Deferral is
`new SessionEngine({ deferAutoStart: true })`, released by
`engineApi.releaseAutoStart()`; it never rewrites a worker's saved `autoStart`.
`markCleanShutdown()` on graceful quit makes the next launch skip the prompt.

## Distribution modes

`src/groundstation/main/distribution.cjs` — Store mode when `package.json` has
`outarchDistribution: "microsoft-store"` or `process.windowsStore` is set. Store
mode skips `setAppUserModelId`, HKCU AUMID registration and
`setAsDefaultProtocolClient`; the updater reports `managedBy → "managed"`; it
`chdir`s to home if launched from System32 / an install dir.
