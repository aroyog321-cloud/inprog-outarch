"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const {
  CliUsageImporter,
  projectUsageLine,
  encodeProjectPath,
  outputTokensAreTrustworthy
} = require("../src/service/usageCliImport.cjs");
const { UsageLedger } = require("../src/service/usageLedger.cjs");

const assistantLine = (overrides = {}) => JSON.stringify({
  type: "assistant",
  uuid: overrides.uuid || "evt-1",
  sessionId: "sess-1",
  timestamp: "2026-09-08T10:00:00.000Z",
  message: {
    id: "msg_1",
    model: overrides.model || "claude-opus-5",
    usage: {
      input_tokens: overrides.input ?? 1500,
      output_tokens: overrides.output ?? 420,
      cache_read_input_tokens: overrides.cacheRead ?? 200,
      cache_creation_input_tokens: overrides.cacheWrite ?? 0
    },
    // Content must never be projected out; it is here to prove it is dropped.
    content: [{ type: "text", text: "SECRET ANSWER TEXT" }]
  }
});

test("a transcript line yields counts and identity, and no content whatsoever", () => {
  const record = projectUsageLine(assistantLine());
  assert.equal(record.tokens.input, 1500);
  assert.equal(record.tokens.output, 420);
  assert.equal(record.tokens.cacheRead, 200);
  assert.equal(record.model, "claude-opus-5");
  assert.equal(record.sourceEventId, "evt-1");
  assert.equal(record.source, "local-import");

  // Nothing derived from the message body may survive the projection.
  assert.equal(JSON.stringify(record).includes("SECRET ANSWER TEXT"), false);
  assert.equal("content" in record, false);
});

test("the known placeholder output_tokens bug is recorded as unknown, not as 1 token", () => {
  // anthropics/claude-code#25941: output_tokens is written as 1-2 regardless of
  // the real completion size. Trusting it would under-report cost enormously.
  const record = projectUsageLine(assistantLine({ input: 24_000, output: 1 }));
  assert.equal(record.tokens.input, 24_000);
  assert.equal(record.tokens.output, null, "a placeholder is unknown, never a real count");
  assert.equal(record.coverage, "partial");
  assert.deepEqual(record.unreliableFields, ["output"]);

  // A genuinely tiny completion after a tiny prompt is still believable.
  const honest = projectUsageLine(assistantLine({ input: 40, output: 2 }));
  assert.equal(honest.tokens.output, 2);
  assert.equal(honest.coverage, "complete");
});

test("outputTokensAreTrustworthy separates a real short reply from the placeholder", () => {
  assert.equal(outputTokensAreTrustworthy(50, 2), true);
  assert.equal(outputTokensAreTrustworthy(9000, 1), false);
  assert.equal(outputTokensAreTrustworthy(9000, 850), true);
  assert.equal(outputTokensAreTrustworthy(100, null), false);
});

test("non-assistant lines, partial lines and noise are ignored", () => {
  assert.equal(projectUsageLine(JSON.stringify({ type: "user", message: { content: "hi" } })), null);
  assert.equal(projectUsageLine(JSON.stringify({ type: "assistant", message: {} })), null);
  assert.equal(projectUsageLine('{"type":"assistant","message":{"usage":{'), null, "a half-written line is normal");
  assert.equal(projectUsageLine(""), null);
  assert.equal(projectUsageLine("not json at all"), null);
});

function fixtureImporter(files, ledger) {
  const dirs = new Map();
  const contents = new Map();
  for (const [filePath, body] of Object.entries(files)) {
    contents.set(filePath, body);
    const dir = path.dirname(filePath);
    if (!dirs.has(dir)) dirs.set(dir, []);
    dirs.get(dir).push({ name: path.basename(filePath), isFile: () => true, isDirectory: () => false });
  }
  const root = "/home/dev/.claude/projects";
  const projectDirs = [...new Set([...contents.keys()].map(file => path.basename(path.dirname(file))))]
    .map(name => ({ name, isFile: () => false, isDirectory: () => true }));

  return new CliUsageImporter({
    ledger,
    roots: [{ provider: "claude", dir: root }],
    readDir: dir => (dir === root ? projectDirs : dirs.get(dir) || []),
    readFile: file => contents.get(file) ?? "",
    statFile: file => ({ size: Buffer.byteLength(contents.get(file) ?? "", "utf8") }),
    setContent: (file, body) => contents.set(file, body)
  });
}

test("an import records usage once and skips it on a re-scan", () => {
  const ledger = new UsageLedger();
  const file = path.join("/home/dev/.claude/projects", "D--work-acme", "sess-1.jsonl");
  const importer = fixtureImporter({
    [file]: `${assistantLine({ uuid: "a" })}\n${assistantLine({ uuid: "b", input: 900, output: 300 })}\n`
  }, ledger);

  const first = importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });
  assert.equal(first.recordsImported, 2);
  assert.equal(ledger.getAggregate().callCount, 2);

  // Nothing changed on disk, so a second scan imports nothing new.
  const second = importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });
  assert.equal(second.recordsImported, 0);
  assert.equal(ledger.getAggregate().callCount, 2, "a re-scan must not double-count");
});

test("usage is attributed to the project only when the transcript belongs to it", () => {
  const ledger = new UsageLedger();
  const mine = path.join("/home/dev/.claude/projects", "D--work-acme", "sess-1.jsonl");
  const other = path.join("/home/dev/.claude/projects", "D--work-somethingelse", "sess-2.jsonl");
  const importer = fixtureImporter({
    [mine]: `${assistantLine({ uuid: "mine" })}\n`,
    [other]: `${assistantLine({ uuid: "theirs" })}\n`
  }, ledger);

  importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });

  const scoped = ledger.getAggregate({ projectId: "proj-1" });
  assert.equal(scoped.callCount, 1, "only this project's transcript is credited to it");
  assert.equal(ledger.getAggregate().callCount, 2, "the other one is still recorded, unassigned");
});

test("encodeProjectPath matches the CLI's folder naming for comparison", () => {
  // One dash per character, not one per run: the POSIX root keeps its leading
  // dash, and a Windows drive keeps the doubled dash from ":" plus separator.
  assert.equal(encodeProjectPath("/Users/you/code/my-app"), "-Users-you-code-my-app");
  assert.equal(encodeProjectPath("D:\\work\\acme"), "D--work-acme");
});

/* ------------------------------------------------------------------ Codex */

const codexTokenCountLine = (overrides = {}) => JSON.stringify({
  timestamp: "2026-11-11T09:15:00.123Z",
  type: "event_msg",
  session_id: "rollout-abc",
  payload: {
    type: "token_count",
    info: {
      // The session's running sum — importing this instead of the turn delta
      // would multiply real spend by the number of turns.
      total_token_usage: {
        input_tokens: 5000, cached_input_tokens: 1200, output_tokens: 700,
        reasoning_output_tokens: 300, total_tokens: 6900
      },
      last_token_usage: {
        input_tokens: overrides.input ?? 2000,
        cached_input_tokens: overrides.cacheRead ?? 400,
        output_tokens: overrides.output ?? 300,
        reasoning_output_tokens: 120,
        total_tokens: 2700
      },
      model_context_window: 272000,
      model: overrides.model ?? "gpt-5-codex"
    },
    rate_limits: { primary: { used_percent: 1 } }
  }
});

test("a Codex token_count event yields the turn delta, never the running total", () => {
  const record = projectUsageLine(codexTokenCountLine(), { provider: "codex" });
  assert.equal(record.provider, "codex");
  assert.equal(record.model, "gpt-5-codex");
  assert.equal(record.source, "local-import");
  assert.equal(record.at, Date.parse("2026-11-11T09:15:00.123Z"));
  assert.equal(record.tokens.input, 2000, "the turn delta, not the session total");
  assert.equal(record.tokens.cacheRead, 400);
  assert.equal(record.tokens.output, 300);
  assert.equal(record.tokens.reasoning, null, "reasoning is inside output already; a disjoint reading would double-count");
  assert.equal(record.countSemantics, "disjoint");

  // Nothing but counts, model and identity survives the projection.
  assert.equal(JSON.stringify(record).includes("rate_limits"), false);
  assert.equal(JSON.stringify(record).includes("model_context_window"), false);
});

test("a Codex line without a turn delta is skipped rather than double-counted", () => {
  const cumulative = JSON.stringify({
    timestamp: "2026-11-11T09:16:00.000Z",
    type: "event_msg",
    payload: {
      type: "token_count",
      info: {
        total_token_usage: { input_tokens: 7000, cached_input_tokens: 1600, output_tokens: 1000, reasoning_output_tokens: 420, total_tokens: 9600 },
        last_token_usage: null
      }
    }
  });
  assert.equal(projectUsageLine(cumulative, { provider: "codex" }), null);
});

test("Codex prompt, tool and noise lines never yield usage", () => {
  assert.equal(projectUsageLine(JSON.stringify({
    timestamp: "2026-11-11T09:10:00.000Z", type: "response_item",
    payload: { type: "message", role: "user", content: [{ type: "input_text", text: "SECRET PROMPT" }] }
  }), { provider: "codex" }), null);
  assert.equal(projectUsageLine(JSON.stringify({ type: "session_meta", payload: {} }), { provider: "codex" }), null);
  assert.equal(projectUsageLine('{"type":"event_msg","payload":{"type":"token_cou', { provider: "codex" }), null);
  assert.equal(projectUsageLine("", { provider: "codex" }), null);
  assert.equal(projectUsageLine("not json at all", { provider: "codex" }), null);
});

// A generic directory tree: readDir lists direct children of each directory,
// which is what the recursive Codex walk needs (year/month/day nesting).
function treeReader(files) {
  const contents = new Map(Object.entries(files));
  return {
    readDir: dir => {
      const seen = new Map();
      for (const file of contents.keys()) {
        if (path.dirname(file) === dir) {
          const name = path.basename(file);
          seen.set(name, { name, isFile: () => true, isDirectory: () => false });
          continue;
        }
        const marker = dir.endsWith(path.sep) ? dir : dir + path.sep;
        if (file.startsWith(marker)) {
          const first = file.slice(marker.length).split(path.sep)[0];
          if (first && !seen.has(first)) seen.set(first, { name: first, isFile: () => false, isDirectory: () => true });
        }
      }
      return [...seen.values()];
    },
    readFile: file => contents.get(file) ?? "",
    statFile: file => ({ size: Buffer.byteLength(contents.get(file) ?? "", "utf8") })
  };
}

test("Codex rollouts nested by date are imported per turn, unassigned, and never re-counted", () => {
  const ledger = new UsageLedger();
  const root = path.join("/home", "dev", ".codex", "sessions");
  const day = path.join(root, "2026", "11", "11");
  const file = path.join(day, "rollout-abc.jsonl");
  const importer = new CliUsageImporter({
    ledger,
    roots: [{ provider: "codex", dir: root, recursive: true }],
    ...treeReader({ [file]: `${codexTokenCountLine()}\n${codexTokenCountLine({ input: 900, output: 100 })}\n` })
  });

  const first = importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });
  assert.equal(first.recordsImported, 2);
  assert.deepEqual(first.providers, ["codex"]);

  const totals = ledger.getAggregate();
  assert.equal(totals.callCount, 2);
  assert.equal(totals.breakdown.input, 2900, "deltas, not running totals");
  assert.deepEqual(Object.keys(totals.byModel), ["gpt-5-codex"]);

  // Date-nested rollouts carry no project folder, so the spend is recorded
  // unassigned instead of being credited to whichever project is open.
  assert.equal(ledger.getAggregate({ projectId: "proj-1" }).callCount, 0);

  const second = importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });
  assert.equal(second.recordsImported, 0, "a re-scan must not double-count");
  assert.equal(ledger.getAggregate().callCount, 2);
});

test("a Codex record without a model id stays unknown rather than borrowing another provider's label", () => {
  const line = JSON.stringify({
    timestamp: "2026-11-11T09:17:00.000Z",
    type: "token_count",
    info: { last_token_usage: { input_tokens: 10, output_tokens: 5 } }
  });
  const record = projectUsageLine(line, { provider: "codex" });
  assert.equal(record.model, null);
  assert.equal(record.tokens.input, 10);
  assert.equal(record.tokens.output, 5);
});

test("a partially reported import reaches the ledger as partial coverage, not as cheap", () => {
  const ledger = new UsageLedger();
  const file = path.join("/home/dev/.claude/projects", "D--work-acme", "sess-1.jsonl");
  const importer = fixtureImporter({
    [file]: `${assistantLine({ uuid: "placeholder", input: 30_000, output: 1 })}\n`
  }, ledger);

  const summary = importer.import({ projectId: "proj-1", projectPath: "D:\\work\\acme" });
  assert.equal(summary.partialRecords, 1);

  const totals = ledger.getAggregate({ projectId: "proj-1" });
  assert.equal(totals.callCount, 1);
  assert.equal(totals.breakdown.input, 30_000);
  assert.equal(totals.breakdown.output, 0, "an unknown output contributes nothing rather than a wrong number");
});
