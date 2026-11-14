"use strict";

// §19.7 — agent memory. The plan's §9.3 designed only the entry helper; the
// write path was missing (A18.4.14). These lock: an agent's work stretch lands
// as ONE factual memory entry per interval (a chatty agent does not flood the
// file), the entry records only what OUTARCH observed, talk-only stretches
// write nothing (the memory's own rule 8), a terminal leaving the agent
// classification or being removed flushes what was seen, a refused write is
// retried at the next pause, and the entries round-trip the real memory file's
// format that agents themselves read first.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { AgentActivityService } = require("../src/service/agentActivityService.cjs");
const { AgentMemoryRecorder, DEFAULT_MIN_INTERVAL_MS } = require("../src/service/agentMemoryRecorder.cjs");
const { MEMORY_FILE_NAME, ProjectMemoryFile, parseEntries } = require("../src/service/projectMemoryFile.cjs");

function rig({ minIntervalMs = DEFAULT_MIN_INTERVAL_MS, record = null } = {}) {
  let now = new Date("2026-11-12T10:00:00").getTime();
  const calls = [];
  const agents = new AgentActivityService({ now: () => now });
  const memory = {
    recordAgentActivity(input) {
      calls.push(input);
      return record ? record(input) : { written: true };
    }
  };
  const recorder = new AgentMemoryRecorder({
    agents,
    memory,
    now: () => now,
    minIntervalMs,
    workerName: id => (id === "w-1" ? "API" : id)
  });
  return { agents, calls, recorder, advance: ms => { now += ms; }, now: () => now };
}

// A work stretch: start an agent, observe two tool steps and one approval
// wait, then let the turn end. Drives the real AgentActivityService, whose
// change events are what the recorder reads.
function runStretch(agents, { withApproval = true } = {}) {
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "tool use: Read\n");
  if (withApproval) agents.recordOutput("w-1", "r-1", "do you want to run this?\n");
}

test("an agent's work stretch lands as one factual entry with the observed counts", () => {
  const { agents, calls, advance } = rig();
  runStretch(agents);
  assert.equal(calls.length, 0, "nothing is written before a pause");

  advance(11 * 60_000);
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 1);
  const entry = calls[0];
  assert.equal(entry.agentType, "claude");
  assert.equal(entry.workerName, "API", "the worker's real name is used");
  assert.equal(entry.toolSteps, 2);
  assert.equal(entry.lastTool, "Read");
  assert.equal(entry.approvals, 1);
  assert.equal(entry.minutes, 11);
  assert.equal(entry.tokens, 0);
});

test("a chatty agent produces one entry per interval, not one per turn", () => {
  const { agents, calls, advance } = rig();
  // The first stretch after start is always written: the interval counts from
  // an empty slate.
  runStretch(agents);
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 1);

  // Two more short stretches inside the interval accumulate instead of writing.
  advance(60_000);
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  advance(60_000);
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "tool use: Edit\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 1, "stretches inside the interval stay pending");

  advance(9 * 60_000);
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "tool use: Bash\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 2, "the next pause past the interval writes what accumulated");
  assert.equal(calls[1].toolSteps, 3, "the accumulated steps are all counted");
  assert.equal(calls[1].lastTool, "Bash");
});

test("a terminal going back to a plain shell flushes what was observed", () => {
  const { agents, calls } = rig();
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "running command\n");
  // The CLI exits and the shell prompt returns: the classification reverses.
  agents.recordOutput("w-1", "r-1", "goodbye!\nPS D:\\acme>\n");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].toolSteps, 1);
});

test("removing the terminal flushes its pending stretch", () => {
  const { agents, calls } = rig();
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.clearWorker("w-1");
  assert.equal(calls.length, 1);
});

test("a refused write keeps its observation and retries at the next pause", () => {
  const { agents, calls, advance } = rig({ record: () => ({ written: false }) });
  runStretch(agents);
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 1, "the attempt was made");
  advance(11 * 60_000);
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 2, "the observation was not lost");
});

test("a talk-only stretch writes nothing, by the memory's own rule 8", () => {
  const { agents, calls } = rig();
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "thinking...\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 0);
});

test("tokens the agent itself reported are carried into the entry", () => {
  const { agents, calls, advance } = rig();
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.recordOutput("w-1", "r-1", "tokens: 12,400\n");
  advance(11 * 60_000);
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].tokens, 12400);
});

test("dispose stops the recorder", () => {
  const { agents, calls, recorder } = rig();
  recorder.dispose();
  agents.noteCommand("w-1", "r-1", "claude");
  agents.recordOutput("w-1", "r-1", "running command\n");
  agents.recordOutput("w-1", "r-1", "task completed\n");
  assert.equal(calls.length, 0);
});

// ---------------------------------------------------------------- the memory side

function memoryFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "outarch-agent-memory-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const project = path.join(root, "acme");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src", "app.ts"), "export const answer: number = 42;\n".repeat(20));
  fs.writeFileSync(path.join(project, "package.json"), JSON.stringify({ name: "acme", scripts: { dev: "vite" }, dependencies: { react: "18" }, devDependencies: { typescript: "5" } }));
  let now = new Date("2026-11-12T10:00:00").getTime();
  const engine = { getWorkspace: () => ({ persistent: true, name: "acme", directory: project, path: path.join(project, "termctl.config.json") }) };
  const memory = new ProjectMemoryFile({ getEngineApi: () => engine, preferencesPath: path.join(root, "userData", "project-memory.json"), now: () => now });
  return { memory, file: path.join(project, MEMORY_FILE_NAME), advance: ms => { now += ms; } };
}

test("the memory writes the observed facts in the file's own format, and invents nothing", async t => {
  const { memory, file } = memoryFixture(t);
  await memory.enable({ pointers: false });

  const result = memory.recordAgentActivity({ agentType: "claude", workerName: "API", toolSteps: 3, lastTool: "Bash", approvals: 2, tokens: 12400, minutes: 11 });
  assert.equal(result.written, true);
  const content = fs.readFileSync(file, "utf8");
  assert.match(content, /^### 2026-11-12 10:00 · Claude Code \(model unknown\) · session$/m);
  assert.match(content, /- \*\*Source:\*\* Recorded automatically from OUTARCH while the agent worked\./);
  assert.match(content, /- \*\*Changed:\*\* An AI agent \(Claude Code\) worked in the API terminal for about 11 minutes: at least 3 tool steps \(the last using the Bash tool\); waited for approval 2 times; about 12,400 tokens reported by the agent\./);
  assert.match(content, /- \*\*Why:\*\* Not stated\./);
  const entryBlock = content.slice(content.indexOf("### 2026-11-12 10:00 · Claude Code"));
  assert.doesNotMatch(entryBlock, /- \*\*Files:\*\*/, "no file paths are invented");
  assert.doesNotMatch(entryBlock, /- \*\*Errors and fixes:\*\*/, "no errors are invented");
  const parsed = parseEntries(content);
  const agent = parsed.at(-1);
  assert.equal(agent.tool, "Claude Code");
  assert.equal(agent.model, "model unknown");
  assert.equal(agent.kind, "session");
  assert.match(memory.status().lastUpdate.by, /OUTARCH agent \(Claude Code\)/);
});

test("the memory refuses to record when project memory is off, or when nothing was observed", async t => {
  const { memory, file } = memoryFixture(t);
  assert.deepEqual(memory.recordAgentActivity({ agentType: "claude", workerName: "API", toolSteps: 2 }), { written: false, reason: "disabled" });

  await memory.enable({ pointers: false });
  assert.deepEqual(memory.recordAgentActivity({ agentType: "claude", workerName: "API" }), { written: false, reason: "nothing-observed" });
  const content = fs.readFileSync(file, "utf8");
  assert.doesNotMatch(content, /Claude Code \(model unknown\)/, "nothing was appended");
  assert.equal(content.includes("Change log"), true, "the file itself was untouched");
});

test("an unknown agent type still formats cleanly", async t => {
  const { memory, file } = memoryFixture(t);
  await memory.enable({ pointers: false });
  const result = memory.recordAgentActivity({ agentType: "aider", workerName: "Refactor", toolSteps: 1, minutes: 2 });
  assert.equal(result.written, true);
  const content = fs.readFileSync(file, "utf8");
  assert.match(content, /Aider agent \(model unknown\) · session/);
  assert.match(content, /for about 2 minutes: at least 1 tool step\./);
});
