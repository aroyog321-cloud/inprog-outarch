"use strict";

// §19.7 / A18.4.14 — agent memory. The plan's §9.3 designed only the entry
// helper; the write path was missing. This recorder watches the agent activity
// service (the one source of agent state) and, when an agent's work pauses —
// it goes idle, its terminal leaves the agent classification, or the terminal
// is removed — hands ONE factual summary per interval to the project memory
// through `projectMemoryFile.recordAgentActivity`.
//
// Rate and honesty rules:
// - A write is due when the interval has passed since this terminal last
//   wrote, or when a lot of tool steps piled up. Between those, stretches
//   accumulate, so a chatty agent that finishes a turn every few seconds
//   produces one entry, not one per turn.
// - Only what OUTARCH observed is written: tool steps, approval waits, and
//   the token total the agent itself printed. No file paths, no reasons, no
//   model guesses.
// - Every failure is swallowed: recording memory must never break, slow down
//   or alarm the agent pipeline. A refused write keeps its observation and
//   tries again at the next pause.

const DEFAULT_MIN_INTERVAL_MS = 10 * 60_000;
// Past this many observed tool steps an entry is written even inside the
// interval: a long stretch loses accuracy if it waits too long to be written.
const FORCE_AT_TOOL_STEPS = 20;

class AgentMemoryRecorder {
  #agents;
  #memory;
  #now;
  #minIntervalMs;
  #workerName;
  #unsubscribers = [];
  #disposed = false;
  // workerId -> { startedAt, agentType, toolSteps, lastTool, approvals, tokens }
  #pending = new Map();
  // workerId -> timestamp of the last entry actually written for it
  #lastWrittenAt = new Map();

  constructor({ agents, memory, now = Date.now, minIntervalMs = DEFAULT_MIN_INTERVAL_MS, workerName = null } = {}) {
    if (!agents || typeof agents.on !== "function") throw new TypeError("AgentMemoryRecorder requires an agent activity service");
    if (!memory || typeof memory.recordAgentActivity !== "function") throw new TypeError("AgentMemoryRecorder requires a project memory");
    this.#agents = agents;
    this.#memory = memory;
    this.#now = typeof now === "function" ? now : Date.now;
    this.#minIntervalMs = Number.isInteger(minIntervalMs) && minIntervalMs > 0 ? minIntervalMs : DEFAULT_MIN_INTERVAL_MS;
    this.#workerName = typeof workerName === "function" ? workerName : () => null;
    const onChange = activity => this.#onChange(activity);
    const onRemoved = ({ workerId } = {}) => this.#flush(workerId, { terminalGone: true });
    this.#agents.on("change", onChange);
    this.#agents.on("removed", onRemoved);
    this.#unsubscribers.push(
      () => this.#agents.off("change", onChange),
      () => this.#agents.off("removed", onRemoved)
    );
  }

  #onChange(activity) {
    if (this.#disposed || !activity) return;
    const workerId = activity.workerId;
    if (!workerId) return;
    // A terminal that leaves the agent classification (its CLI handed the
    // terminal back to the shell) has finished its work: write what was seen.
    if (!activity.isAgent) {
      this.#flush(workerId, { terminalGone: true });
      return;
    }
    if (!activity.agentType) return;
    const pending = this.#pending.get(workerId) || { startedAt: activity.updatedAt || this.#now(), agentType: activity.agentType, toolSteps: 0, lastTool: null, approvals: 0, tokens: 0 };
    pending.agentType = activity.agentType;
    // Counting transitions, not lines: a "change" arrives when the state
    // moves, so one step into `executing_tool` is one observed tool action.
    if (activity.state === "executing_tool") {
      pending.toolSteps += 1;
      if (activity.currentTool) pending.lastTool = activity.currentTool;
    } else if (activity.state === "awaiting_approval") {
      pending.approvals += 1;
    } else if (activity.state === "idle") {
      this.#pending.set(workerId, pending);
      this.#flush(workerId, { terminalGone: false });
      return;
    }
    if (activity.lastTurnTokens && Number.isFinite(activity.lastTurnTokens.totalTokens) && activity.lastTurnTokens.totalTokens > pending.tokens) {
      pending.tokens = Math.floor(activity.lastTurnTokens.totalTokens);
    }
    this.#pending.set(workerId, pending);
  }

  #flush(workerId, { terminalGone }) {
    if (this.#disposed || !workerId) return;
    const pending = this.#pending.get(workerId);
    if (!pending) return;
    if (!pending.toolSteps && !pending.approvals) {
      // Nothing of substance was observed (the agent was only talking); there
      // is no entry to write, by the memory's own rule 8.
      this.#pending.delete(workerId);
      return;
    }
    const last = this.#lastWrittenAt.get(workerId) || 0;
    const due = terminalGone || pending.toolSteps >= FORCE_AT_TOOL_STEPS || (this.#now() - last) >= this.#minIntervalMs;
    if (!due) return; // keep accumulating; the next pause past the interval writes it all
    const minutes = Math.round((this.#now() - pending.startedAt) / 60_000);
    let written = false;
    try {
      written = this.#memory.recordAgentActivity({
        agentType: pending.agentType,
        workerName: this.#workerName(workerId) || workerId,
        toolSteps: pending.toolSteps,
        lastTool: pending.lastTool,
        approvals: pending.approvals,
        tokens: pending.tokens,
        minutes: minutes > 0 ? minutes : 0
      })?.written === true;
    } catch {
      written = false; // recording never breaks the agent pipeline
    }
    if (written) {
      this.#lastWrittenAt.set(workerId, this.#now());
      this.#pending.delete(workerId);
    }
    // A refused write keeps its observation; the next pause tries again.
  }

  dispose() {
    this.#disposed = true;
    for (const off of this.#unsubscribers) {
      try { off(); } catch { /* best effort */ }
    }
    this.#unsubscribers = [];
    this.#pending.clear();
  }

  // Writes every pending stretch now. A project switch or a shutdown ends
  // each agent's work window whether the agent went idle or not; the memory
  // service still resolves to the old project when this is called first.
  flushAll() {
    for (const workerId of [...this.#pending.keys()]) this.#flush(workerId, { terminalGone: true });
  }
}

module.exports = { AgentMemoryRecorder, DEFAULT_MIN_INTERVAL_MS, FORCE_AT_TOOL_STEPS };
