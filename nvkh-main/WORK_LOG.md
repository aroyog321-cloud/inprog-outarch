# Mission Control / Outarch UI Redesign — Work Log

Source-of-truth task list: `docs/OUTARCH_MASTER_PLAN.md` §19 (source-verified fixes),
executed task-by-task per user instruction ("do not do the things in phases").
Repo is NOT a git repo; all changes are uncommitted working-tree edits.

## Result

`npm test` (`node --test --test-concurrency=1 test/*.test.cjs`): **1012 pass / 1 fail**
(after the tenth session — see "Sessions 6–10" below)
- Baseline was 972 pass / 8 fail (failures: 94, 95, 414, 482, 581, 608, 638, 677).
- Fixed: 94, 95 (AI Reporting wiring), 581, 608, 638, 677 (pre-existing CRLF + open-external contract), 485 (mobile-web page, Session 5) + all §19 functional fixes.
- Remaining 1 (427 — renumbered by the new tests) is a pre-existing baseline failure, unchanged by this work:
  - 427 (was 416) — `packaging/msix/store.config.json` placeholder identity (private Partner Center identity, declared not-fixable-in-source; documented, not fixed).

## Changes made

### 1. TerminalPane lifecycle split — `src/groundstation/renderer/TerminalPane.jsx`
Split the monolith effect (deps `[session?.id, session?.isAlive, session?.startTime, ...]`) into:
- **Creation/reflow effect** (deps `[session?.id, terminalFontSize, terminalTheme, terminalCursor, terminalScrollback]`): builds xterm once, attaches key handler + link provider, owns `ResizeObserver` (disconnects on cleanup). No longer torn down when the worker exits — fixes the Ctrl+C "frozen chars" bug where the exit notification tore the widget down mid-render.
- **Connection effect** (deps `[session?.id, session?.isAlive, session?.startTime]`): owns exactly one `terminal.open`/`terminal.close` stream pair. On exit keeps the transcript on screen and closes the stream here; on restart closes any stale stream and opens a new one into the existing widget (calls `terminal.reset()` first) instead of rebuilding xterm.

Keying details preserved per the strict source contract (verified against `test/terminalWorkspaceLayout.test.cjs` and friends):
- `aliveRef = React.useRef(...)`; exit does `aliveRef.current = false;\n setConnection("exited")`.
- `terminal.resize` gated by `if (streamId && aliveRef.current)`; local `fit.fit()` ungated.
- `missionApi().request("terminal.resize", ...)` inside `requestAnimationFrame(fitAndResize)`.
- No `terminal.open` followed by `resize` within 40 chars; `sendResize` (capital R) is safe.
- Exactly one `role="menu"` (the session chooser); exactly 2 `DropdownMenu.Separator className="terminal-action-separator"`; no `terminal-pane-tray`, no `@radix-ui/react-popover`.
- `screenReaderMode: true` retained with its NVDA/VoiceOver limitation comment.
- All header facts, chooser keyboard contract, popout control, run control, drag entry, paste-chord order (`copyText` import, no `navigator.clipboard`), `onTerminalErrorRef`/`onTerminalRecoveredRef` reporters, overflow copy, observer + cleanup, `cursorBlink: active`, `DropdownMenu.Portal` all present.

### 2. Debounced, size-gated PTY resize (§19.5)
- Trailing debounce (~120ms) coalesces slider-drag/window-resettle bursts into one `terminal.resize`.
- Size-gated: shape only sent when cols/rows changed since last send (`sentGeometry` compare); skipped entirely when the stream is dead (`aliveRef.current`) or the pane is minimized/disposed.
- Reveal effect (`[active, expanded, minimized]`) now also calls `fitAndResizeRef.current()` after restore from minimized, so the engine gets the settled shape even if the ResizeObserver missed the 1px strip.
- Engine spawns PTY at 120×30; pane now states measured geometry at open (see protocol change) to fix Ollama alternate-screen truncation.

### 3. PTY size authority via `terminal.open {cols, rows}` — `src/protocol/index.cjs`
`terminal.open` accepts optional validated `cols`/`rows` (integers 1..1000, both required together; same contract as `terminal.resize`). Applied to `rawStream.resize` **inside the try block, before replay capture**, so replayed rows wrap at the pane's actual columns. Best effort: tolerated failure; watching view with no write lease skips silently (`terminalLeases.isAuthorized` guard) so a second window can't drag the shared PTY around.

### 4. Ctrl+Click links via xterm 6 `registerLinkProvider` — `TerminalPane.jsx`
No addon (xterm 6.0.0 has `registerLinkProvider` natively). Provider matches `https://...` runs on a buffer line; `activate` fires only on Ctrl/Cmd Click (plain click preserves selection). Falls back to `window.missionControl.openExternal`, which the main process scheme-gates to http/https/mailto.

### 5. Right-click copy/paste context menu — `TerminalPane.jsx` + `surfaces.css` + preload + main
Hand-built menu (Copy/Paste/Select all/Clear/Find), no `role="menu"`, no popover primitive, no Radix. Opened via `onContextMenu` on the terminal host (so popped-out windows get it too); dismissed by outside pointer-down, non-modifier key, Escape, and window blur. Paste reads the clipboard through a new main-process channel (`mission-control:clipboard-read-text` → `clipboard.readText()`, size-bounded to match `copy-text`), exposed on `window.missionControl.readClipboardText`. CSS in `surfaces.css` (unscoped `var(--mc-*)` tokens; adds 0 raw colours, no `!important`).

### 6. `backgroundThrottling: false` — both Electron windows — `src/groundstation/main/index.cjs`
Added to `webPreferences` of the pop-out window (~363) and the main window (~475), with a section comment explaining output must never throttle (§19.6). Sandbox/contextIsolation preserved.

### 7. `mission-control:open-external` rewrite — `src/groundstation/main/index.cjs`
Replaced the two-URL GitHub allow-list with scheme validation (`^(?:https?|mailto):`, control chars stripped) and the exact contract string "Only http, https, and mailto URLs are allowed" (satisfies `productFoundation.test.cjs` test 638 and gives terminal links a safe general URL opener). All three callers (App.jsx:3190, ReportAiDialog.jsx:64, WorkspaceBrowser.jsx:152) remain compatible.

### 8. `mission-control:clipboard-read-text` — preload + main — `src/groundstation/preload/index.cjs`, `main/index.cjs`
Preload: `readClipboardText()` invokes `mission-control:clipboard-read-text`; added to the frozen `missionControl` object (keeping the locked `request, copyText, openExternal,` order). Main: `assertTrustedAppFrame` + `clipboard.readText()`, size-bounded.

### 9. Notification sound idle-suspend 20s → 60s — `src/groundstation/renderer/notificationSound.js`
`IDLE_SUSPEND_MS` 20_000 → 60_000 with rationale comment (§19.4).

### 10. Generation-based no-expiry `service.ready` dedupe — `src/service/notificationCenter.cjs`
`publish()`: `if (previous !== undefined && (at - previous < IN_APP_DEDUPE_MS || notice.kind === "service.ready"))`. Safe because `service.ready` dedupe keys are generation-stamped (`...:${data.generation}`), so the same cycle never re-notifies and the next generation does. Verified against `notificationCenter.test.cjs` (same cycle notifies once; next generation notifies again) and `acknowledgedErrors.test.cjs` (30s-separated generations both shown).

### 11. QR quiet zone 2 → 4 + drop `rx="8"` — `src/groundstation/renderer/MobileCompanion.jsx`
`padding = 4` (ISO/IEC 18004 4-module quiet zone) and removed the rounded white rect that clipped finder patterns.

### 12. AI Reporting wiring — `AssistantChat.jsx`, `ReportAiDialog.jsx` (exists, LF, unwired), `redesign/surfaces.css`
- `import ReportAiDialog, { FlagIcon } from "./ReportAiDialog.jsx"`.
- Assistant answers get an `ai-msg__report-btn` (FlagIcon + "Report", hidden until hover/focus) that opens `ReportAiDialog` pre-filled with the message (Microsoft Policy 11.16: always a way to flag from where it was read).
- `surfaces.css`: `.shell .ai-msg__report-btn` (hover/focus reveal, warning tint) + full `.ai-report-dialog` block (backdrop z-index 140, themed tokens, `color-mix`, no raw colours, no `!important`).

### 13. Pre-existing test repairs (CRLF normalization)
`src/groundstation/main/index.cjs` and `src/service/mobileWebCompanion.cjs` CRLF → LF (fixes 5 pre-existing failures: 482 partially, 581, 608, 677 and line-ending-sensitive assertions).

## Files edited
- `src/groundstation/renderer/TerminalPane.jsx` (lifecycle split, resize debounce/gating, link provider, context menu)
- `src/protocol/index.cjs` (terminal.open cols/rows authority)
- `src/groundstation/main/index.cjs` (backgroundThrottling ×2, open-external scheme gate, clipboard-read handler)
- `src/groundstation/preload/index.cjs` (readClipboardText exposed)
- `src/groundstation/renderer/notificationSound.js` (IDLE_SUSPEND_MS 60_000)
- `src/service/notificationCenter.cjs` (service.ready no-expiry dedupe)
- `src/groundstation/renderer/MobileCompanion.jsx` (QR quiet zone)
- `src/groundstation/renderer/AssistantChat.jsx` (AI Reporting import + button + dialog state)
- `src/groundstation/renderer/redesign/surfaces.css` (context menu + report button + dialog styles)

## Verification
- All 83 locked TerminalPane source contracts re-checked programmatically (ALL PASS).
- esbuild JSX transform + `node --check` on all edited CJS/JS files: clean.
- `npm test`: 978 pass / 2 fail; both remaining failures are pre-existing baseline failures (414 documented not-fixable, 482).

## Session 2 — remaining §19 items closed

### 14. §19.5.1 — budgeted observer pipeline + observable counters — `src/groundstation/main/workspaceIntelligence.cjs`
The in-source parts of the main-loop-health fix (full `utilityProcess` relocation remains a larger follow-up, see below):
- `MAX_LINES_PER_CHUNK` 200 → **50** (plan: "~50"); flooded chunks stop reaching back further.
- **Classification time budget** (`CLASSIFY_BUDGET_MS = 8`): once a chunk's budget is spent, remaining lines keep their restart-signal and port/URL discovery semantics (line-semantics-required steps stay per-line) but skip the agent-activity and semantic-event passes, so a printing agent can never hold the main loop. Verified by smoke test: under budget pressure 50 candidates classify until the budget trips, and a dev-server address printed later is still discovered.
- **Counters + p95**: every chunk records its hold time and inspected/skipped lines; `observerMetrics()` reports `chunks`, `linesInspected`, `linesSkippedByBudget`, `linesInspectedPerSecond` (10s sliding window) and `p95ChunkMs` (ring of last 50 chunks). A p95 above the 4 ms budget warns on the main-process console, rate-limited to once per 60 s (`lastWarnedAt` starts at `-Infinity` so the first slow p95 warns immediately — caught in review that a `0` init would suppress warnings for the first 60 s of process uptime).
- `metadata.redraw === true` handling verified already correct: the engine pre-separates repaint rows from new lines and the observer reads only `analysisText`, so repaints are never re-classified (the plan's "partially handled at :276" — handled correctly).
- **Exposure**: new protocol method `workspace.observerMetrics` (METHODS allowlist + case in `src/protocol/index.cjs`; threaded `observerMetrics` through `src/groundstation/main/ipcHost.cjs` and `src/groundstation/main/index.cjs` following the existing `importCliUsage` function-option pattern). Renderer can call `missionControl.request("workspace.observerMetrics")`.
- Regression test added to `test/workspaceIntelligence.test.cjs`: flooded chunk is capped at 50 candidates and fully accounted for (inspected + skipped), p95 and rate are reported, and discovery still finds an address under the budget.

### 15. §6.3 — workspace assistant source chip with deselect — `src/groundstation/renderer/WorkspaceAssistant.jsx` + `surfaces.css`
- The `ai-pane__context` chip ("This terminal means …") was a dead `<span>`: once a terminal had focus, the assistant was locked to it with no way out.
- The chip is now a **clear button** (`aria-label="Clear source terminal. …"`, × glyph, hover/focus tint): clicking it deselects the source so the conversation answers about the whole workspace again (`sourceSession = sourceCleared ? null : focusedSession` drives suggestions, welcome copy, composer placeholder, `conversation.send(text, …)` and `focusWorkerId`).
- Focusing a different terminal re-arms the chip (`React.useEffect(() => { setSourceCleared(false); }, [focusedSession?.id])`), so the lock only lasts until the next deliberate terminal choice.
- CSS in `surfaces.css`: button chrome reset, × glyph, hover/focus states — tokens only, 0 raw colours, no `!important`.
- Regression test added to `test/productFoundation.test.cjs` ("the workspace assistant's source terminal can be deselected").

### 16. §6.4 — cross-model chat history: **verified already satisfied** (no change needed)
The plan's sample (`missionAiConversation.cjs` keyed per-model) predates the current architecture. In `src/service/aiAssistant.cjs`, conversations are keyed by `conversationId` (not model), each turn's answering model is recorded per display message, and `#call()` sends `#modelMessages(conversation)` — the full shared `conversation.model` transcript — to whichever model answers the current turn. Switching models mid-conversation keeps the whole history in the prompt. No change required; documented here.

### 17. Sidebar icon rail: **verified complete** (no code change kept)
- The rail exists and is regression-tested: icon-rail base block (`base.css`), labeled expansion ("2.19 shell contract"), narrow-width steps (184px / 58px icon rail), focus-mode collapse via `--mc-rail-w: 0px` + `visibility: hidden` (pinned by `readinessPass2.test.cjs`), keyboard/aria labels always present (`aria-label` on every nav button, tooltips only at collapsed widths), pinned by `cockpitDensity`, `workspaceUnboxed`, `outarchReadiness`, `productFoundation`.
- **Smooth-collapse decision**: the §6.7/§17 "200ms transition" criterion was implemented (width + grid-column transitions) and then **reverted** — the enforced design gate **T165** (`test/designSystem.test.cjs` "motion never animates layout") fails any layout-property transition, and §18.6 Phase B item 6 itself directs replacing `transition: --mc-rail-w` with a class-driven collapse. The rail changes size only at state boundaries (breakpoints, focus mode), which land as one step. The gate wins; the criterion is superseded and recorded here.

## Session 2 files edited
- `src/groundstation/main/workspaceIntelligence.cjs` (budget + metrics + warn)
- `src/protocol/index.cjs` (`workspace.observerMetrics`)
- `src/groundstation/main/ipcHost.cjs` + `src/groundstation/main/index.cjs` (observerMetrics threading)
- `src/groundstation/renderer/WorkspaceAssistant.jsx` (deselectable source chip)
- `src/groundstation/renderer/redesign/surfaces.css` (chip-as-button styles)
- `test/workspaceIntelligence.test.cjs`, `test/productFoundation.test.cjs` (regression tests)

## Remaining plan items (larger follow-ups, not closed)
- §19.5.1 full `utilityProcess`/worker-thread relocation of the observation pipeline (the budgeting above is the in-main-process part; relocation is an architectural change with its own test matrix).
- Test 414 (Store identity — not fixable in source) and 482 (pre-existing) remain documented.
- Work-log maintenance (this file).

## Session 3 — links, Windsurf, Codex usage import, observer-budget guard

### 18. Link opening: **verified every path opens in the system default browser** (no code change to the openers)
- The single opener is `mission-control:open-external` (`src/groundstation/main/index.cjs` ~869): scheme-gated to http/https/mailto, then `shell.openExternal` — always the OS default browser, never an OUTARCH window. The renderer windows additionally refuse navigation themselves (`setWindowOpenHandler` deny + `will-navigate` preventDefault), so nothing can even try to open inside the app.
- Paths verified: terminal links (Ctrl/Cmd+Click via `registerLinkProvider`), AI-report dialog links (`ReportAiDialog.jsx`), About implementation references (`App.jsx` ResourceLinks), workspace-browser "Open in system browser" button (`WorkspaceBrowser.jsx`), service URLs (engine `openServiceUrl`, `target: "system"`).
- Terminal links need **Ctrl/Cmd+Click by design** (plain click preserves text selection); if links "do nothing" on a plain click, that is why.

### 19. §6-adjacent — AI chat markdown now renders links (was dead text)
`src/groundstation/renderer/aiMarkdown.jsx`:
- `inlineMarkdown` split gained `\bhttps?://…` and `\bmailto:…` tokens (URL charset excludes whitespace, backtick, angle brackets, brackets/braces, quote, pipe, backslash, caret); a matched address renders through a new `ExternalLink` component instead of staying plain text.
- `ExternalLink` strips trailing sentence punctuation (`.`, `,`, `;`, `:`, `!`, `?`, `)`, `]`, quotes), re-checks the scheme, and intercepts the click (`event.preventDefault()`) to call `window.missionControl?.openExternal?.(trimmed)` — the scheme-gated default-browser opener. `href` is kept for semantics/focus/pointer; the title says "opens in your system browser".
- No raw HTML injection: everything is React elements (pinned: no `dangerouslySetInnerHTML`).
- `src/groundstation/renderer/redesign/surfaces.css`: `.mai-md-link` (accent ink, partial-underline via `color-mix`, full on hover, `:focus-visible` outline) — tokens only, 0 raw colours, no `!important`.
- Regression test added to `test/missionAiRenderer.test.cjs` ("addresses in an answer are links that open in the system browser").

### 20. §7.1 — Windsurf added as an MCP client install target
- `src/service/mcpGateway.cjs`: `resolveClientConfigPath` case `windsurf` → `~/.codeium/windsurf/mcp_config.json`; `CLIENT_LABELS` entry "Windsurf"; `installClient` writes the remote `serverUrl` + `headers.Authorization` shape (same as Antigravity — Windsurf rejects `url`/`httpUrl`). Removal rides the existing generic JSON path; `clientStatus` covers it automatically (iterates `CLIENT_LABELS`).
- `src/groundstation/renderer/McpGateway.jsx`: "Windsurf" card in Local AI tool connections (`~/.codeium/windsurf/mcp_config.json`, copyable JSON snippet) and it is named in the panel description.
- `test/mcpGateway.test.cjs`: install assertions (path, `["headers","serverUrl"]` keys, Bearer token), status true after install / false after remove, remove returns `removed: true`.

### 21. §6.5 — welcome screen vs running AI agents: **verified already satisfied** + pinned
- In this architecture AI agents *are* engine sessions (`agent.create` returns a session id; `isAgentSession` filters the same `sessions` list the canvas reads — `agent-` prefix ids or live CLI classification). The welcome gate is `canvasEmpty = sessions.length === 0 && !activeFolder && !browserOpen && !assistantOpen` (App.jsx), so a running agent always keeps the welcome screen hidden; the plan's separate agent counter would double-count the same source of truth.
- Pinned by a new test in `test/groundstationRenderer.test.cjs` ("the empty-workspace welcome gate covers running AI agents (§6.5)").

### 22. §6.6 — stopped-terminal cleanup: **verified satisfied by the session-2 lifecycle design** (supersedes the plan's full-reset snippet)
- On exit the pane keeps the transcript on screen (documented at `TerminalPane.jsx` connection effect) and writes a `[worker exited]` marker; the stream is closed here and a restart resets the widget before the fresh replay. The plan's `\x1bc` full-reset-on-death would erase the transcript the redesign deliberately keeps; the underlying root cause (stale escape garbage after exit) is addressed by that same reset-on-restart. Recorded as superseded.

### 23. §5.5 — Codex CLI usage import (multi-provider tracking)
`src/service/usageCliImport.cjs`:
- New `projectCodexUsageLine`: reads `token_count` events from Codex rollouts (`~/.codex/sessions/<year>/<month>/<day>/rollout-*.jsonl`), projecting **`last_token_usage`** (the per-turn delta) — never `total_token_usage` (the session's running sum, which would multiply real spend by the turn count). `reasoning_output_tokens` is left unread because Codex already includes reasoning inside `output_tokens` (OpenAI's completion accounting). Only counts, model id, session id and timestamp survive; prompts/tool calls are discarded at parse time. Both the modern `event_msg` wrapper and the bare `token_count` shape are handled; a cumulative-only event with no turn delta is skipped rather than double-counted.
- `CliUsageImporter` gained a bounded **recursive** scan (`MAX_SCAN_DEPTH = 8`, same `MAX_FILES_PER_SCAN` cap) for the date-nested root; default roots now include `{ provider: "codex", dir: ~/.codex/sessions, recursive: true }`. Date-nested rollouts carry no project folder, so their records import as **unassigned** rather than being credited to whichever project is open.
- `src/service/usageLedger.cjs`: an absent model id now stays unknown (`params.model || null`) instead of defaulting to `gemini-2.5-flash`, which mislabelled other providers' spend in the by-model breakdown; the ledger's aggregate already reports such requests as "unknown".
- Tests: 6 new cases in `test/usageCliImport.test.cjs` (turn-delta projection, cumulative-only skip, noise/partial lines, recursive date-nested import + no re-count + unassigned attribution, unknown model stays unknown, `projectUsageLine` dispatch). `usageCliImport`, `usageLedger`, `protocol`, `protocolExpansion` suites all green.

### 24. Test 38 flake fixed — observer budget no longer starves a single-line chunk
`src/groundstation/main/workspaceIntelligence.cjs`: the §19.5.1 budget check measured the **whole** consume call, including the pre-classification work (restart signals, service discovery). Under full-suite load that pre-work could spend the entire 8 ms budget before classification ran, so a chunk consisting of a single line was skipped entirely — correctness traded for nothing (there is no backlog to resume later). The yield now only applies when the chunk has more than one candidate line (`hasBacklog`), preserving the anti-lag purpose for real floods. Fixed `test/acknowledgedErrors.test.cjs` "service discovery and build events skip repaints and acknowledged errors", which failed in two full-suite runs and passed in isolation.

## Session 3 files edited
- `src/groundstation/renderer/aiMarkdown.jsx` (links)
- `src/groundstation/renderer/redesign/surfaces.css` (`.mai-md-link`)
- `src/service/mcpGateway.cjs` (Windsurf target)
- `src/groundstation/renderer/McpGateway.jsx` (Windsurf card + description)
- `src/service/usageCliImport.cjs` (Codex import + recursive scan)
- `src/service/usageLedger.cjs` (unknown model stays unknown)
- `src/groundstation/main/workspaceIntelligence.cjs` (budget backlog guard)
- `test/missionAiRenderer.test.cjs`, `test/mcpGateway.test.cjs`, `test/groundstationRenderer.test.cjs`, `test/usageCliImport.test.cjs` (regression tests)

## Verification
- esbuild JSX transform on edited JSX files + `node --check` on edited CJS files: clean.
- `npm test` after Session 3: **987 pass / 2 fail** (test numbering shifted: 415 = Store identity, 484 = pre-existing mobile-web page; both documented, not fixable in source). Session 3 net: +7 tests (989 total, was 982).

## Remaining plan items (larger follow-ups, not closed)
- §19.5.1 full `utilityProcess`/worker-thread relocation (unchanged from Session 2).
- §5.5 success criterion "4+ providers": Claude + Codex import now; Gemini/Ollama CLI transcripts would need a verified format reference (Gemini CLI does not write JSONL usage transcripts; Ollama reports no per-request tokens without a proxy). Mission AI's own gemini/nvidia spend is already metered at the network boundary.
- §5.6 Ollama model list: blocked by the "no new settings groups" gate (Ollama needs a server URL setting); would also need the model provider surface in `aiProviders.cjs`.
- Later phases (canvas workspace, native DWM thumbnails, OpenBot agents, per-terminal accounts) are new builds, not source fixes; not started.

## Session 4 — §5.4 misclassification, VS Code target, verified supersessions

### 25. §5.4 — AI output misclassified as errors: **designed and fixed** (the plan never designed this)
- Root cause found in source: `semanticEventRouter.inspectOutput` classified **every** line from every worker with no agent gate, and its bare `typeerror:`/`syntaxerror:` pattern fires on AI agents *quoting* errors in their narration (explaining a stack trace, reading someone else's logs) — false "build failed" alarms from a terminal that is talking, not building.
- Fix (two confidence tiers in `src/service/semanticEventRouter.cjs`): `BUILD_FAIL_TOOL_PATTERNS` (compiler/bundler/package-manager evidence: `npm ERR!`, `error TS…`, "failed to compile", vite/webpack, cargo) vs `BUILD_FAIL_INTERPRETER_PATTERNS` (bare `typeerror:`/`syntaxerror:`). `BUILD_FAIL_PATTERNS` stays exported unchanged (both tiers concatenated) — plain workers classify exactly as before.
- An agent terminal (`metadata.isAgent === true`) gets **only** tool-reported evidence: its prose cannot ring the alarm, but a real build it runs still fires via the tool tier. The trade-off is deliberate: a script's own failure almost always also trips a tool pattern; agent narration almost never does.
- `isAgent` threaded end to end: `workspaceIntelligence.cjs #consume` captures the agent-activity lookup it already performed for prompt detection and puts `isAgent` on the shared line context (also passed to `#agents.recordOutput`, which ignores extra fields — verified).
- Tests: `agentActivityService.test.cjs` (agent narration → null; `npm ERR!`/`Failed to compile` from an agent → build.failed; the same narration from a plain worker → build.failed) and a full-stack test in `workspaceIntelligence.test.cjs` (agent session detected from its `claude` command line, exactly as `attachEngine` does it).

### 26. §7.1 — VS Code (Copilot) added as an MCP client install target
- Verified against VS Code's official MCP configuration reference (fetched 2026-11-12): the editor-managed `.vscode/mcp.json` `servers` format belongs to the **deprecated Local harness** (removal February 2027) and is not read directly by Copilot sessions; the current native destination is the portable `mcpServers` file `~/.copilot/mcp-config.json` (moved by `COPILOT_HOME`). Also confirmed the Windsurf path `~/.codeium/windsurf/mcp_config.json` matches the official discovery table.
- `src/service/mcpGateway.cjs`: `resolveClientConfigPath` case `vscode` → `$COPILOT_HOME/mcp-config.json` or `~/.copilot/mcp-config.json`; `CLIENT_LABELS` entry "VS Code (Copilot)"; `installClient` writes `{ type: "http", url, headers.Authorization }` — the portable HTTP shape. Removal rides the generic JSON path; `clientStatus` covers it automatically.
- `McpGateway.jsx`: "VS Code (Copilot)" card (`~/.copilot/mcp-config.json`, copyable snippet) and named in the panel description.
- Setup reference page (`#renderDiscoveryHtml`): added Windsurf and VS Code sample sections with per-client file paths, and the token note now mentions the one-click install writes the real token.
- Tests: install assertions (path, `["headers","type","url"]` keys, `type: "http"`, 127.0.0.1 endpoint, Bearer token), status true/false, remove returns `removed: true`.

### 27. Verified superseded / already satisfied (documented, no change)
- **§5.3 repeated localhost notifications**: the plan's 30-second cooldown is superseded by the generation-based dedupe (`service.ready:${project}:${worker}:${service}:${generation}` in `notificationCenter.cjs` — the same address re-printed inside one readiness cycle is not news; a restart makes it news again). A time cooldown would both miss restarts and re-notify after expiry; generation identity is the correct key.
- **§4.1 scrolling lag**: addressed by the budgeted observer (§19.5.1), debounced/size-gated resize, the configurable `terminalScrollback` preference, and the shared PTY stream — no per-line repaint work in the renderer path.
- **§4.2 terminal switching (instance pooling)**: satisfied structurally — the canvas keeps its DOM in session order and lays tiles out with CSS `order`, so "rearranging never unmounts a terminal: an xterm that is torn down and rebuilt loses its scrollback" (App.jsx comment). No pool needed because nothing is torn down.
- **§4.4 desktop notifications**: main-process `Notification` delivery already exists (`notificationCenter.cjs` / `notificationService.cjs` with injected `Notification`, driven by engine events, coalesced — not renderer-side as the plan assumed).
- **"Zero crashes on CLI auth (agy)"**: no synchronous OS calls exist in the main process (verified: no `execSync`/`spawnSync`/`tasklist` anywhere in `src`), and the observation pipeline is budget-bound (§19.5.1), so an auth window's output burst cannot hold the main loop.

## Session 4 files edited
- `src/service/semanticEventRouter.cjs` (build-failure confidence tiers + agent gate)
- `src/groundstation/main/workspaceIntelligence.cjs` (`isAgent` on the line context)
- `src/service/mcpGateway.cjs` (VS Code target + Windsurf/VS Code setup-page sections)
- `src/groundstation/renderer/McpGateway.jsx` (VS Code card + description)
- `test/agentActivityService.test.cjs`, `test/workspaceIntelligence.test.cjs`, `test/mcpGateway.test.cjs` (regression tests)

## Verification
- esbuild JSX transform on edited JSX + `node --check` on edited CJS: clean.
- `npm test` after Session 4: **989 pass / 2 fail** (renumbered pre-existing: 416 Store identity, 485 mobile-web page). Session 4 net: +2 tests (991 total).

## Session 5 — mobile-web page fix, §19.5.3/§5.6 verification + test pin

### 28. Failing test 485 fixed — the mobile companion page had CRLF line endings
- Root cause: `src/service/mobileWebCompanion.html` was saved at some point with Windows CRLF line endings (3040 `\r\n` pairs), but the test `mobileCompanion0922.test.cjs #266` pins the served page bytes to LF-only (`assert.doesNotMatch(html, /\r/)`), and the same bytes are served to the phone. A real defect in the shipped page's determinism, not a test problem.
- Fix: converted the file to LF-only (3040 pairs normalized; verified 0 remaining `\r` before/after, and no lone-CR corruption). The file's content is otherwise byte-identical.
- Verified the whole mobile-page consumer set still passes: `mobileCompanion0922` (13/13), `legalPolicies`, `mobileCompanionPhone`, `mobileWebCompanion`, `mobileWebCompanionEscaping`, `outarchBrand` (49/49 combined).
- This closes the last fixable failure — only the documented Store identity failure (416) remains.

### 29. §5.6 / #12 "Ollama model list truncated" — verified fixed by §19.5.3; regression test added
- The plan's own §19.5.3 analysis names the root cause: the PTY is spawned at 120×30 and the renderer resizes only after stream activation, so alternate-screen programs (e.g. `ollama list`) render into the wrong geometry — output truncates and cannot be navigated. Session 1 item 3 fixed exactly this (`terminal.open {cols, rows}` applied to the PTY **before** replay capture). The "no new settings groups" blocker noted earlier applies to a hypothetical *display* setting, not to the truncation bug itself — the bug is fixed at the protocol layer with no UI change.
- The fix had no test pinning it (every other fix does). Added `protocol.test.cjs` "terminal.open applies the pane's stated geometry to the PTY and refuses invalid geometry", pinning all four behaviors: (1) stated geometry reaches the PTY before streaming, (2) a watching view (no write lease) never resizes the shared PTY, (3) invalid geometry (rows > 1000, rows missing with cols present) is refused `INVALID_PARAMS` and leaks no raw stream, (4) a PTY that refuses the resize still opens the pane (best effort). 25/25 in the file.

### 30. Verified TerminalPane "Find" is fully implemented (no dangling affordance)
- Checked the whole chain: toolbar "Find" button, header dropdown item, Ctrl+F signal, Esc/close, next/previous cursor tracking, and the search itself — `terminal.buffer.active` scanned row by row, `terminal.select(column, row, query.length)` + `scrollToLine`, "Line N" / "No match" status. Nothing to fix.

## Session 5 files edited
- `src/service/mobileWebCompanion.html` (CRLF → LF only; no content change)
- `test/protocol.test.cjs` (§19.5.3 regression test)

## Verification
- `npm test` after Session 5: **991 pass / 1 fail** (992 total; 416 Store identity is the only remaining failure — documented unfixable in source).

### 31. Evaluated and declined with evidence — Phase 4 "extract layout from App.jsx (§19.5.6)"
- The gate ("App.jsx < 900 lines", currently 3952) is a structural refactor target, not a bug. App.jsx is pinned by **140 exact-string test references across 20+ test files** (the suite reads JSX source as text); extracting layout would move those strings and break pinned tests wholesale — a wholesale codebase-shake against the explicit constraint not to damage the code. Declined; recorded here so the plan's unchecked checkbox has a documented reason.

## Session 6 — §19.7 agent memory (the A18.4.14 gap): designed and built

### 32. Agent work now lands in the project memory (§9.3 + §19.7 + §18.4.14)
The plan flagged this gap explicitly: §9.3 designed only a `createAgentMemoryEntry()` helper; §18.4.14 found "no write/read path to `projectMemoryFile.cjs`, no integration with the `projectMemory.*` protocol, and no agent lifecycle"; §19.7 requires agent memory to be layered onto the existing supervision services, with entries written through `projectMemoryFile.cjs`. Built exactly that, with **no IPC, no protocol surface, no settings, no UI change** (the recorder is main-process, wired between two services that already exist):

- **`src/service/agentMemoryRecorder.cjs`** (new): watches `AgentActivityService` events (the one source of agent state) and turns each agent **work stretch** into one memory entry. A stretch accumulates observed facts — tool-step transitions, approval waits, the token total the agent itself printed — and is handed to the memory when the agent pauses: it goes idle, its terminal leaves the agent classification (the CLI handed the shell back), or the terminal is removed. Rate rules: one entry per terminal per interval (default 10 min) so a chatty agent produces one entry, not one per turn; a stretch also flushes early once ≥ 20 tool steps pile up; a refused write keeps its observation and retries at the next pause; talk-only stretches write nothing (the memory file's own rule 8); every failure is swallowed — recording memory must never break, slow down or alarm the agent pipeline.
- **`projectMemoryFile.cjs` — new `recordAgentActivity()`** (memory side): validates and clamps every count, writes the entry in the file's own format (`formatEntry`) with author = the agent's label (Claude Code, Codex CLI, Gemini CLI, Antigravity CLI, OpenCode; unknown types get "X agent"), model = "model unknown" (the file's rules demand never guessing), kind = "session" (the honest catch-all — the recorder cannot know fix/feature), a `Source:` line saying it was recorded automatically, and a `Changed:` line containing **only observed facts** ("at least N tool steps (the last using the X tool); waited for approval M times; about T tokens reported by the agent"). No file paths, no reasons, no error stories are invented; the existing `clean()` redaction applies to every free-text field. It honors the `#busy` single-writer guard (returns `{written:false, reason:"busy"}`, never throws), requires the project memory to be enabled, and stamps `lastUpdate.by = "OUTARCH agent (label)"` so a later by-hand update counts the agent's work as already recorded (no double entry from two writers).
- **Lifecycle wiring in `main/index.cjs`**: constructed right after the memory service (`agents: workspaceIntelligence.agents`, worker names resolved from the engine snapshot); `flushAll()` on project switch — written to the *closing* project's memory while the service still points at the old workspace — and `flushAll()` at shutdown before the engine teardown, then `dispose()`.
- Tests: **11 in `test/agentMemoryRecorder.test.cjs`** — one factual entry per stretch with exact counts and the worker's real name; interval accumulation instead of flooding; downgrade flush; removal flush; refused-write retry; talk-only silence; token carry; dispose; and the memory side end-to-end against a real `ProjectMemoryFile` (format round-trips `parseEntries`, invents nothing, refuses when disabled or empty, unknown agent type formats cleanly).

## Session 6 files edited
- `src/service/agentMemoryRecorder.cjs` (new)
- `src/service/projectMemoryFile.cjs` (`recordAgentActivity`)
- `src/groundstation/main/index.cjs` (require, declaration, construction, switch + shutdown flush/dispose)
- `test/agentMemoryRecorder.test.cjs` (new, 11 tests)

### 33. Phase 5 "Sidebar icon rail" — verified superseded by the shipped design (documented, no change)
- The icon rail exists in the shipped CSS: a 58px `--mc-rail-w` rail with hidden labels, centered 44px icon targets and tooltip-carried labels — as the **≤760px narrow-window fallback** (`base.css` media query at the end of the file).
- At desktop widths the redesign deliberately keeps the **labeled** sidebar. The "2.19 shell contract" block (`base.css` §2.19 shell contract, ~line 296) states the reason: "The earlier icon-only rail hid core capabilities and forced tooltip-driven navigation. The markup already contains useful labels, so this final block restores them." A manual collapse preference would reintroduce exactly the behavior that contract was written to fix — a UI/UX regression, not a feature.
- Mechanically it would also require new `!important` width rules: every desktop sidebar width rule is `!important`-locked (`#root#root .shell > .app-sidebar { width: var(--mc-rail-w, 212px) !important; }`), and the "no new `!important`" gate forbids that; a variable-only override changes the width while the labels stay visible, which is broken.
- §6.7's collapse *transition* was already superseded by the T165 design gate (Session 2): "the rail's width is never transitioned" is pinned in `base.css`. Phase 5 is therefore fully accounted for: icon rail = narrow fallback (shipped), focus-mode layouts = superseded by the mosaic design (Session 3), Mission AI source chip deselect = done (Session 2), cross-model history = verified (Session 3).

## Verification
- `node --check` on all three edited CJS files: clean.
- `npm test` after Session 6: **1002 pass / 1 fail** (1003 total; net +11 tests). The only failure is 427 — the documented Store identity one.

## Session 7 — Canvas v1: free x/y canvas on top of the existing mosaic (§8, §19.6)

### 34. Canvas v1 built: free positioning, pan/zoom, node chrome — no new tile system (§19.6.1)

The plan's §8 free-form node canvas is built **on top of the existing mosaic** — not a new tile system. Every canvas node is one of the already-mounted panes (`TerminalPane`, `WorkspaceBrowser`, `WorkspaceAssistant`) given an absolute screen rectangle instead of a grid cell. Nothing wraps, reparents, or remounts: a canvas terminal and a workspace terminal for the same session are the **same mounted xterm** (A19.5.2a), so scrollback survives mode switches. The mosaic's CSS grid is left exactly as it is (its `display` is `!important`-locked); absolutely positioned children leave grid flow anyway, and the grid's `overflow: hidden` clip becomes the canvas viewport.

**New file: `src/groundstation/renderer/canvasFree.js`** — pure geometry + persistence + the `useFreeCanvas` hook:
- `normalizeFreeCanvasDoc()` whitelists the doc field by field (version, mode, viewport, node rectangles, notes). Anything else — including credentials or transcripts — is dropped on read (A19.6.4).
- `readFreeCanvasDoc()`/`writeFreeCanvasDoc()` use `window.localStorage` only, keyed `mission-control:canvas-free:v1:<workspaceKey>`. Device-local, never cloud sync, never secrets (A19.6.4).
- `clampRect()`/`clampNumber()` reject NaN, clamp to sane bounds, so a stale doc can never place a node off the map or at zero size.
- `panViewport()`/`zoomViewport()` implement screen = canvas·z + pan with anchor-preserving zoom; zoom clamped to 0.25–2 (A19.6.5).
- `nodeScreenRect()`/`rectVisible()` compute screen geometry and off-screen pausing: invisible nodes get `visibility: hidden` while the engine keeps owning their processes (A19.6.5).
- `useFreeCanvas()` — debounced localStorage writes (300ms during interaction, flush on unmount), Alt+V toggle between grid and canvas, prune of workers that left the canvas, per-workspace docs, rAF-throttled drag engine (drag-from-origin so snapping never drifts), arrow-key nudging by the 20px snap grid, add/edit/remove notes with 2000-char cap and 20-note cap.

**Edited: `src/groundstation/renderer/App.jsx`** — all additive, every pinned substring intact:
- Import of `useFreeCanvas`, `freePaneStyle`, `nodeScreenRect`, `rectVisible`, `BROWSER_NODE_ID`, `ASSISTANT_NODE_ID`.
- `TerminalSlot` gains `freeStyle` (absolute rect) and `freeHideEmpty` props; empty slots return `null` in canvas mode; pane style falls through to `TerminalPane` unchanged when not in canvas mode.
- `freeCanvas` state from `useFreeCanvas(workspaceKey, { sessions, stageRef: gridRef })`, gated `!activeFolder && !expandedId && sessions.length > 0`.
- Alt+V toggle (documented in the exit button title).
- `packedCanvas` and `tilesActive` stay `false` in canvas mode so the packed-grid machinery doesn't fight free positioning.
- `freeScreen` memo maps every doc rectangle through the viewport, with `visibility: hidden` for off-screen nodes.
- `freeStyle` passed to worker slots, browser, and assistant tiles; each gets a rect keyed by its reserved id (`@browser`, `@assistant`).
- Chrome layer (`free-canvas-layer`): small grab handle at top-left (pointers pass through to the terminal everywhere else), name label, corner resize grip. Notes layer (`free-canvas-note`): movable textarea with delete and resize.
- Floating toolbar (`free-canvas-toolbar`): zoom in/out with level readout, add note, reset view, exit canvas — positioned top-right, z-index above the layer.

**Edited: `src/groundstation/renderer/redesign/surfaces.css`** — Section 21 appended, **zero** `!important`, **zero** raw hex/rgb colours — only `var(--mc-*)` tokens:
- `.free-canvas-layer` fills the grid, `pointer-events: none`, z-index 30.
- `.free-canvas-chrome` floats above panes (`pointer-events: none` on the wrapper, `auto` only on grips), themed with `--mc-surface`, `--mc-border`, `--mc-shadow-float`, `--mc-radius-md`.
- `.free-canvas-toolbar` pinned top-right, pill-shaped, `--mc-radius-pill`.
- `.free-canvas-note` themed with `--mc-surface-2`, delete button uses `--mc-danger`/`--mc-danger-soft`.
- `prefers-reduced-motion` reduces animations to none (T165: transforms never transitioned).

## Verification (Session 7)
- `node --check` on `canvasFree.js`: clean.
- App.jsx JSX + surfaces.css parse cleanly; full suite: **1002 pass / 1 fail** (427 Store identity, pre-existing).
- CSS baseline test (5/5): `!important` ceiling (1,417) and raw-colour ceiling (1,169) both respected — 0 new `!important`, 0 new raw colours in the new CSS section.
- All pinned strings in `terminalWorkspaceLayout.test.cjs`, `workspaceCanvasDominance.test.cjs`, `workspaceControlReach.test.cjs`, `groundstationRenderer.test.cjs` verified intact.

## Session 7 files edited
- `src/groundstation/renderer/canvasFree.js` (new)
- `src/groundstation/renderer/App.jsx` (import, TerminalSlot props, freeCanvas hook, screen geometry, chrome layer, toolbar)
- `src/groundstation/renderer/redesign/surfaces.css` (Section 21 free canvas layer)

## Session 8 — Canvas deep analysis: the defects a real render exposed

The user reported three things about the canvas: the terminals inside were there but **their content did not resize** (text stayed tiny or too large), the canvas **was not the whole screen** (the sidebar stayed), and **two bottom bars cut into each other**. Rather than reason from the source, a probe (`scripts/visual/probe-free-canvas.cjs`) was built that boots the real renderer in Electron, turns the free canvas on, and measures the live DOM and captures a screenshot. It found four real defects, all fixed.

### 35. The pane was sized in canvas units under a CSS transform, so xterm never reflowed
- **Cause**: `freePaneStyle()` set `width`/`height` to the node's *canvas* size and applied `transform: scale(zoom)`. xterm's fit addon measures the **layout** box it is given, so the terminal laid out at the unscaled size and was then painted scaled — text came out at the wrong size, and shrinking a node did not reflow the terminal into it.
- **Fix**: the pane's box is now its **on-screen** size (canvas units × zoom) and there is no transform. The fit addon measures what the operator actually sees, so the terminal reflows to the new size. Measured: host 638×346 with 17 rows before, 958×556 with 28 rows after a zoom; a smaller node now reflows to fewer columns.

### 36. The browser and assistant tiles ignored their canvas rectangle
- `WorkspaceBrowser` and `WorkspaceAssistant` were handed a `freeStyle` prop that **no component ever read** — both applied only `style`, so they stayed in the CSS grid while the worker panes moved free. Both now take `freeStyle` and apply it (`freeStyle || style`), so every node type on the canvas is positioned by the same rule.

### 37. The canvas did not own the frame — the sidebar and the workspace bands stayed
- **Fix**: the free canvas now mirrors focus mode's own mechanism onto the document element (`data-workspace-canvas="on"`), and one CSS block collapses the rail through `--mc-rail-w: 0px` — the variable the base layer already reads, so **no raised weight is needed**. The sidebar, the status tape, the workspace bands and the ops rail step aside, exactly as focus mode does. Measured: grid 1278×587 at x=230 → **1490×686 at x=18**, sidebar 212px → 20px and `visibility: hidden` — byte-identical to focus mode's own numbers.

### 38. Two bottom bars cut into each other
- **Cause**: the dock carried **both** `free-canvas-dock` and the older `free-canvas-toolbar` classes, and the old toolbar rule (`position: absolute; top: 10px; right: 10px`) pulled the dock out of the dock bar's column, landing it on top of the omni bar.
- **Fix**: `.free-canvas-dock` states its own placement (`position: static`) so it is the lower row of the bar's column. Measured: omni at y=681, dock at y=734 — two separate bars, no overlap.

### 39. Node chrome sat on top of the terminal's own content
- The name label duplicated the terminal's own header (the session name appeared twice, clipped); the green connection ports drew a row of bright dots across live terminal text; the grab handle covered the pane's header buttons. Fixed: the duplicate name label is gone (a terminal already carries its name), the ports are quiet until the node is hovered, and the grab handle moved to sit **above** the node's top edge so the header, the buttons and the run control stay reachable.

### 40. A CSS comment counted against the `!important` ceiling
- The baseline guard counts the literal string in the file, comments included. A comment that *mentioned* the raised-weight keyword pushed the total to 1,418 against a 1,417 ceiling. Reworded — the total is back to 1,417 and the guard passes.

## Session 8 files edited
- `src/groundstation/renderer/canvasFree.js` (`freePaneStyle` — on-screen sizing, no transform)
- `src/groundstation/renderer/App.jsx` (canvas chrome attribute effect, chrome layer cleanup, canvas node list)
- `src/groundstation/renderer/WorkspaceBrowser.jsx` (`freeStyle` applied)
- `src/groundstation/renderer/WorkspaceAssistant.jsx` (`freeStyle` applied)
- `src/groundstation/renderer/redesign/surfaces.css` (canvas frame collapse, port/handle placement, dock placement)
- `scripts/visual/probe-free-canvas.cjs` (new — live canvas probe)

## Verification (Session 8)
- `npm run groundstation:build`: clean.
- `npx electron scripts/visual/probe-free-canvas.cjs`: canvas mode on (`data-workspace-canvas="on"`), grid `is-free-canvas`, sidebar collapsed to focus-mode numbers, ops rail hidden, omni and dock separated, terminal hosts 638×346/17 rows reflowing to 958×556/28 rows on zoom, no console errors.
- `npm test`: **1002 pass / 1 fail** — only 427, the documented Store identity one.
- CSS baseline (5/5): `!important` 1,417 and raw colours within ceiling; the canvas section itself has **0** raised-weight declarations and **0** raw colours.

## Session 9 — Canvas deep audit: every affordance exercised, five real defects fixed

The operator reported that much of the canvas did not work, that an external app could not be launched, and that the result was "too bad" in use. Rather than patch by inspection, the canvas was exercised **end to end** with real pointer events (`scripts/visual/probe-free-canvas.cjs`: toggle → move → resize → pan → notes → wires → launcher → arrange → backdrop → exit → command bar), measuring the live DOM and capturing the render at every step. That found five real defects, and one of them was invisible to any source reading.

### 41. The external app launcher did nothing at all
- **Cause**: the button called `window.prompt(...)`. Electron does not implement `window.prompt` in a sandboxed renderer, so no dialog ever appeared; the `window.open` fallback never ran either (the promise returned by `openExternal` is truthy, so `||` never fired), and a refused link failed silently. Typing an application name silently opened an empty worker form.
- **Fix**: a real in-app dialog (`CanvasAppLauncher`) in the app's own vocabulary — the app's confirmation surface, portaled, with one field and an honest choice. A **link** (http/https/mailto) opens through the main process's scheme-gated bridge and says so out loud when it is refused; anything else becomes a **supervised terminal worker** prefilled with that command, which is what the main process can actually do with an executable (A19.6.3 keeps arbitrary app launching in the main process, behind `NativeAppManager`). The button now does what it says.

### 42. A question typed into the canvas command bar opened a worker dialog
- **Cause**: the bar matched command words *anywhere* in the query, so "what is my worker doing" matched `/worker/i` and opened the create-worker form instead of asking Mission AI.
- **Fix**: a canvas command is a **verb**, matched at the start of the query (`^(arrange|add|create|open|launch|run)…`). Everything else is a question and goes to Mission AI. Verified: "arrange my canvas", "add a note" and "open the browser" act on the canvas; "what is my worker doing" leaves the workspace for Mission AI and never opens a worker form.

### 43. Portaled dialogs were painted UNDER the canvas — a bug that hid every popup
- **Cause**: the canvas's floating bars used `backdrop-filter: blur(20px)`. A backdrop filter promotes the bar to its own composited layer, and Chromium then painted the **portaled** dialog — the launcher's modal, a toast, the command palette — beneath that layer. The dialog was in the DOM, correctly stacked (z 150 over the overlay's 140) and hit-testable, yet the operator would never see it.
- **Proof**: a control probe shot the app's own confirmation dialog (visible outside the canvas) and the same dialog with the app's own markup inside the canvas's launcher (invisible). Removing the blur alone made the launcher paint perfectly.
- **Fix**: the two floating bars are opaque now (`--mc-surface-2` / `--mc-surface-3`). The blur was decoration; the solid surface is what the app needs.

### 44. The note header showed three window dots, two of which did nothing
- **Cause**: a macOS-style traffic light with one working dot (delete) and two dead ones (minimize, maximize).
- **Fix**: one control that works — delete — beside the NOTE badge.

### 45. "Arrange my canvas" moved the workers and left everything else stacked on them
- **Cause**: the arrangement only placed the workers; the browser, the assistant and the notes kept their old positions and landed on top of the grid. It also forced the zoom to 0.8, rescaling the canvas out from under the operator.
- **Fix**: every node kind is arranged — workers, the reserved browser/assistant ids and the notes (in a column beside the grid) — and the operator's zoom is left alone; only the pan is reset to bring the origin into view.

### 46. A temporal-dead-zone crash in the new launcher
- The first implementation of the link handler referenced `workspaceToast` in its dependency array before that binding was declared, which threw during render and took the whole workspace view down with it (the probe reported "no toggle" — no canvas button at all). The handler now sits below the toast it uses.

### 47. The move handle sat on top of the terminal's own header
- The grab handle was inside the node's top edge, so it covered the session name ("Web dev server" read as "eb dev server") and the header buttons. It is now a slim grip tab on the node's **left edge, outside the pane** — the name, the buttons and the run control are all readable and reachable.

### 48. A connection wire between distant nodes drew a loop over the canvas
- The bezier bow was 45% of the span, capped at 180px, so a wire across the canvas arced 180px out of the way and read as a stray loop. The bow is now 22% of the span, capped at 110px: a wire reads as a connection.

## Session 9 files edited
- `src/groundstation/renderer/App.jsx` (`CanvasAppLauncher` component, launcher state/handlers, command-bar routing, note header)
- `src/groundstation/renderer/canvasFree.js` (`arrangeCanvas` — every node kind, operator's zoom kept)
- `src/groundstation/renderer/redesign/surfaces.css` (launcher dialog styles — unscoped, because the dialog is portaled; opaque floating bars; note header)
- `scripts/visual/probe-free-canvas.cjs` (new — exercises every canvas affordance)
- `scripts/visual/probe-portal-paint.cjs`, `scripts/visual/probe-launcher-isolate.cjs` (new — isolate the portal-paint defect)

## Verification (Session 9)
- `npm run groundstation:build`: clean.
- `npx electron scripts/visual/probe-free-canvas.cjs`: **every affordance verified** — toggle (7 panes), move (pane x 58→158, persisted), resize **with the terminal reflowing** (host 638→418px, 17→12 rows), pan (viewport x 112, y 48), note add/type/persist/delete (1→0), a wire drawn between two different nodes (1 stored, 1 drawn), the launcher dialog opening with a live field and a label that follows the input ("Open link" / "Run application"), the link path closing the dialog, the application path prefilling the worker form, arrange, backdrop cycling (scenic→dotgrid), exit returning to the grid — **zero console errors**.
- The launcher's visual result is captured and correct (single column, kicker, title, field, hint, error state, Cancel/primary actions).
- `npm test`: **1002 pass / 1 fail** — only 427, the documented Store identity one.
- CSS baseline (5/5): `!important` 1,417 and raw colours within ceiling; the canvas section has **0** raised-weight declarations, **0** raw colours, and **no** backdrop filter.

## Session 10 — Native App Nodes: an application opens ON the canvas (§19.6.3)

The operator asked for an application to open **in the canvas**. That is §19.6.3's native app node, and the plan keeps the node, its preview and its controls while stating plainly what is NOT promised: keystroke-level interaction inside the preview, because Electron cannot put a native application inside a DOM node (A19.6.3 — `BrowserView`/`WebContentsView` host web content only, a desktop capture is one-way video, and a DWM thumbnail is compositor-level).

### 49. The delivery model, built in the main process
**New: `src/groundstation/main/nativeAppManager.cjs`** — the window owner lives in the main process, because the renderer is sandboxed and cannot ask the OS for a window handle:
- **Launch** — the app is started detached, so it outlives the call. The command is vetted first: a shell metacharacter is refused, and so are the arguments. The shell is used only so Windows' `.cmd` shims (`code`, `npm`) can start at all; the metacharacter ban is what makes that safe.
- **Own the window** — on Windows the service enumerates the top-level visible windows (user32, through a PowerShell helper driven by environment variables so no value is ever quoted into a command line), matches the launched process, and keeps the handle, title and rectangle.
- **Preview** — `desktopCapturer` is the plan's cross-platform fallback for the DWM thumbnail; the window source is matched by title and streamed to the canvas as an image surface. Where no source matches, the node says the preview is unavailable rather than showing a broken frame.
- **Control** — focus, minimize, restore and close are named actions the main process carries out on the window it owns.
- **Off Windows** the application still starts, and the node reports that the preview and the window controls are unavailable here. Refusing to launch would be a worse lie than a node that cannot own a window.

### 50. The protocol and the canvas
- **`src/protocol/index.cjs`** — `nativeApp.launch|list|frame|focus|minimize|restore|close` added to the method whitelist and dispatched to the service. Launching and closing an application reach outside the app, so both carry a confirmation token like every other outward-facing action.
- **`src/groundstation/main/ipcHost.cjs` / `index.cjs`** — the service is constructed in the main process and passed to the protocol.
- **`src/groundstation/renderer/canvasFree.js`** — the canvas doc carries app nodes (id, command, title, state, rectangle). The window handle never reaches the renderer; the doc holds only what the node needs to draw itself and ask for its window again.
- **`src/groundstation/renderer/App.jsx`** — the node shows a LIVE PREVIEW of the application's window, with Focus / Minimize / Restore / Close, a state badge, and the honest line "Live preview · the application keeps its own window". The preview is refreshed every 1.5s for the nodes on the canvas. The launcher's application path now opens an app NODE; if the platform cannot own a window the same command still runs as a supervised terminal worker, so nothing the operator typed is lost.
- **`src/groundstation/renderer/redesign/surfaces.css`** — the app node's own surface, themed with `--mc-*` tokens only.

## Session 10 files edited
- `src/groundstation/main/nativeAppManager.cjs` (new)
- `src/groundstation/main/index.cjs`, `src/groundstation/main/ipcHost.cjs` (wiring)
- `src/protocol/index.cjs` (methods + dispatch)
- `src/groundstation/renderer/canvasFree.js` (app nodes in the doc)
- `src/groundstation/renderer/App.jsx` (app node UI, launch path, preview)
- `src/groundstation/renderer/redesign/surfaces.css` (app node surface)
- `test/nativeAppManager.test.cjs` (new — 10 tests)

## Verification (Session 10)
- `node --check` on the new service and every edited CJS file: clean.
- `npm run groundstation:build`: clean.
- `node --test test/nativeAppManager.test.cjs`: **10/10** — a command with shell metacharacters is refused; arguments are vetted; the app is launched detached and its window discovered and owned; the window controls are named actions on the owned handle; closing stops tracking; the preview is an image surface; a missing source and a failed capture are reported rather than thrown at the operator; off Windows the app still starts and the controls say so.
- `npm test`: **1012 pass / 1 fail** (1013 total; net +10 tests). The only failure is 427, the documented Store identity one.

## What's left (documented blockers — do not start without user direction)
- Phase 8 agent templates/messaging (§19.7 one-incident-one-notice)
- Phase 9 per-terminal CLI accounts (§18.4.17 security exposure)

## Session 11 — §3.6 Drawing & Whiteboard: Excalidraw as a canvas node type

The OUTARCH Canvas master spec (§3.6) asked for a drawing/whiteboard engine — Excalidraw evaluated as a package, never as a source fork, never as the whole Canvas. The OUTARCH Canvas owns the workspace, object management, persistence and interaction between tools; the engine owns drawing interactions inside one node type.

### 51. The evaluation, settled empirically
- **Package:** official `@excalidraw/excalidraw@0.18.1` (MIT), peer-compatible with react 18.3.1. Installed; the `D:\Downloads\excalidraw-master` checkout was used for API evaluation only.
- **Sandbox probe (`scripts/visual/probe-drawing-sandbox.cjs`)** — under the app's exact CSP + `sandbox: true` + `contextIsolation: true` on `file://`: `fetch` of a sibling woff2 works (24,956B), module workers from file:// work, FontFace registration + canvas usage work, zero console errors. **No CSP changes needed.** The engine's worker/subsetting paths degrade to main-thread fallbacks (non-fatal by design).
- **Assets:** scene fonts self-hosted at `src/groundstation/renderer/public/excalidraw-assets/fonts/` (8 families, 0.42MB). Xiaolai (12.08MB CJK) deliberately excluded — CJK glyphs degrade to system metrics, a documented limitation. UI fonts ride in via the engine's `index.css`, bundled by Vite with the lazy chunk.
- **`window.EXCALIDRAW_ASSET_PATH`** set in `main.jsx` before the lazy chunk can load.

### 52. The boundary (spec §5.6)
- **`src/groundstation/renderer/CanvasDrawingSurface.jsx` (new)** — the single contact surface between OUTARCH and the engine. In: `scene {elements, files}` as mount-only `initialData`. Out: `onScene({elements, files})`; `appState` dropped at the source (tool state is not workspace state). `handleKeyboardGlobally={false}` (OUTARCH owns global keys), `detectScroll={false}` (the free canvas owns the viewport), engine's own save/export menu disabled wholesale.
- **First lazy chunk in the codebase** — `React.lazy` + `Suspense` in App.jsx; the ~350KB-gzip engine is paid on the first drawing creation, never at app startup. Build verified: engine split into its own chunk; app entry references it only through the dynamic-import map.

### 53. The node, on the shared geometry core
- **`canvasFree.js`** — the doc carries `drawings` (id, title, geometry, scene). Scene normalization whitelists elements (plain objects with ids) and files (data-URL strings), caps 2000 elements / 64 files, and enforces a 1.2MB serialized budget per scene — on restore, on every write, and on unmount flush. A rejected scene is an honest toast, never silent truncation. Drawings move/resize/nudge through the same drag grammar as every node (`startDrag`/`nudge` type `"drawing"`); `arrangeCanvas` places them in the notes column below the notes (340px spacing); they are not session-bound, so pruning never touches them.
- **`App.jsx`** — `is-draw` dock button; drawing nodes render with chrome (move grip, title, delete, resize corner) exactly like notes/apps; omnibar understands "add drawing". Persistence: Excalidraw's `onChange` fires every interaction tick, so scenes buffer in a ref and write to the doc on a 600ms settle; a **synchronous unmount flush** (`flushDrawingScene` in the hook) merges still-pending scenes into `docRef` and writes storage directly, because React state updates are dead during unmount (CANVAS-003).
- **`surfaces.css` Section 21** — the drawing node's chrome, `--mc-*` tokens only, 0 `!important`, 0 raw colours.

### 54. Canvas documentation created (spec §9–§11)
- `OUTARCH_CANVAS_MASTER_SPEC.md` (the authoritative spec, verbatim)
- `CANVAS_IMPLEMENTATION_TRACKER.md` (living status per requirement)
- `CANVAS_BUG_LOG.md` (CANVAS-001 TDZ crash, CANVAS-002 font-copy ENOENT, CANVAS-003 unmount data-loss window)
- `CANVAS_ARCHITECTURE.md` (actual architecture, boundaries, persistence model)

## Session 11 files edited
- `src/groundstation/renderer/CanvasDrawingSurface.jsx` (new — lazy engine surface)
- `src/groundstation/renderer/canvasFree.js` (drawings in the doc, drag/nudge/arrange, scene budget, unmount flush)
- `src/groundstation/renderer/App.jsx` (lazy chunk, dock button, node chrome, debounced persistence, omnibar)
- `src/groundstation/renderer/main.jsx` (`EXCALIDRAW_ASSET_PATH`)
- `src/groundstation/renderer/redesign/surfaces.css` (drawing node surface, Section 21)
- `src/groundstation/renderer/public/excalidraw-assets/fonts/` (new — 25 files, self-hosted scene fonts)
- `scripts/visual/probe-drawing-sandbox.cjs` (new — sandbox capability probe), `scripts/visual/probe-canvas-drawing.cjs` (new — end-to-end node probe)
- `test/canvasDrawings.test.cjs` (new — 9 tests)
- `OUTARCH_CANVAS_MASTER_SPEC.md`, `CANVAS_IMPLEMENTATION_TRACKER.md`, `CANVAS_BUG_LOG.md`, `CANVAS_ARCHITECTURE.md` (new — spec §11 records)

## Verification (Session 11)
- `scripts/visual/probe-drawing-sandbox.cjs`: passed (fetch/worker/FontFace/canvas under the exact CSP; zero console errors).
- `npm run groundstation:build`: clean (three passes); engine confirmed as its own lazy chunk; fonts copied into `dist`.
- `node --test test/canvasDrawings.test.cjs`: **9/9**.
- `npm test`: **1021 pass / 1 fail** (1022 total; net +9). The only failure is 427, the documented Store identity one (verified in `microsoftStore.test.cjs`, pre-existing).
- CSS baselines: `!important` 1,410 ≤ 1,417; raw hex colours 473 ≤ 1,169 (Section 21 additions: zero of both).
- Live probe `scripts/visual/probe-canvas-drawing.cjs` (real input via `sendInputEvent`): engine mounts ~1–3.5s lazily; rectangle drawn and persisted (`elements: 1`); grip move persists geometry with the scene intact; **unmount flush saves the in-flight stroke** (draw + exit inside the 600ms window → `elements: 2` in storage); reload restores the doc (mode, geometry, 2 elements); toggle back re-mounts engine + scene; delete empties the doc. Screenshots: `artifacts/visual/canvas-drawing/01–03`.
- Found and fixed during the probe: the engine wrapper collapsed to `height: 0` (CANVAS-004); CANVAS-003 verified by the in-window exit.

## Session 11 bugs
- CANVAS-002 font-copy ENOENT (destination dir not created) — fixed.
- CANVAS-003 unmount data-loss window — fixed by `flushDrawingScene` (synchronous merge + storage write), verified live.
- CANVAS-004 engine wrapper height 0 — fixed with `.free-canvas-drawing__engine { height: 100% }`.
- CANVAS-005 engine CDN font fallback logs CSP violations — cosmetic; scene fonts render via data-URL subsets. Investigating a clean resolution.
