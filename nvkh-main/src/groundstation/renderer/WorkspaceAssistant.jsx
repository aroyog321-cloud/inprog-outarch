import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ModelSwitcher, useAssistantStatus, useConversation } from "./aiCatalog.jsx";
import { AssistantComposer, AssistantThread } from "./AssistantChat.jsx";
import AssistantKeys from "./AssistantKeys.jsx";

/* The Workspace assistant.

   A tile on the terminal canvas, not a dialog over it: it takes a cell the way
   a terminal does, resizes and packs with the terminals in every layout and in
   focus mode, and wears the pane's frame and header height so the canvas still
   reads as one surface.

   It is deliberately not Mission AI in a smaller box. It keeps its own
   conversation per project, answers in a few lines, and knows which terminal
   has focus — "restart it" means that one. Mission AI is where a long
   conversation about the whole project belongs, and the pane links there. */

// Conversation ids are bounded to a safe character set, and a project's key is
// a filesystem path, so the path is folded into a short stable hash.
function conversationFor(workspaceKey) {
  const text = String(workspaceKey || "default");
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = ((hash * 33) ^ text.charCodeAt(index)) >>> 0;
  return `workspace:${hash.toString(36)}`;
}

function PaneIcon({ name }) {
  const paths = {
    more: <><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
    close: <path d="M7 7l10 10M17 7 7 17"/>
  };
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function WorkspaceAssistant({ workspaceKey, focusedSession, active = false, style, freeStyle = null, onFocus, onClose, onOpenMissionAI, onConfirm }) {
  const conversationId = conversationFor(workspaceKey);
  const { status, refresh, setStatus } = useAssistantStatus();
  const conversation = useConversation(conversationId, "workspace");
  const [keysOpen, setKeysOpen] = React.useState(false);
  const hasModel = Boolean(status?.selections?.workspace);
  const focusedName = focusedSession?.name || null;

  // §6.3 — the assistant follows the focused terminal, but it must never be
  // locked there: the source chip is a clear button, and clearing it hands the
  // conversation back to the whole workspace ("restart it" then means the
  // terminal the user focuses next, because a change of focus re-arms the chip).
  const [sourceCleared, setSourceCleared] = React.useState(false);
  React.useEffect(() => { setSourceCleared(false); }, [focusedSession?.id]);
  const sourceSession = sourceCleared ? null : focusedSession;
  const sourceName = sourceSession?.name || null;

  const suggestions = sourceName
    ? [`What is ${sourceName} doing?`, `Explain the last error in ${sourceName}`, `Restart ${sourceName}`]
    : ["What's running?", "Explain the latest error", "Which ports are in use?"];

  return <section
    className={`ai-pane ${active ? "is-active" : ""}`}
    style={freeStyle || style}
    aria-label="Workspace assistant"
    onMouseDown={onFocus}
  >
    <header className="ai-pane__head">
      <span className={`ai-pane__state ${conversation.busy ? "is-busy" : hasModel ? "is-ready" : ""}`} aria-hidden="true"/>
      <strong className="ai-pane__name">Assistant</strong>
      <ModelSwitcher status={status} surface="workspace" compact disabled={conversation.busy} onManageKeys={() => setKeysOpen(true)} onChanged={setStatus}/>
      {sourceName && <button type="button" className="ai-pane__context" aria-label={`Clear source terminal. "This terminal" means ${sourceName}`} title={`"This terminal" means ${sourceName} — click to ask about the whole workspace again`} onMouseDown={event => event.stopPropagation()} onClick={() => setSourceCleared(true)}>{sourceName}<i aria-hidden="true">×</i></button>}
      <div className="ai-pane__actions">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="ai-pane__icon" aria-label="Assistant options" onMouseDown={event => event.stopPropagation()}><PaneIcon name="more"/></button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="terminal-action-menu" align="end" sideOffset={7} collisionPadding={12}>
              <DropdownMenu.Item className="terminal-action-item is-compact" disabled={!conversation.messages.length || conversation.busy} onSelect={() => void conversation.clear()}><span>New chat</span></DropdownMenu.Item>
              <DropdownMenu.CheckboxItem className="terminal-action-item" checked={conversation.autoApprove} onCheckedChange={checked => void conversation.setAutoApprove(checked === true)}>
                <span>Act without asking</span>
                <small>{conversation.autoApprove ? "On — actions in this chat run at once" : "Off — actions wait for your OK"}</small>
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.Separator className="terminal-action-separator"/>
              <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={() => setKeysOpen(true)}><span>Keys &amp; models</span></DropdownMenu.Item>
              {onOpenMissionAI && <DropdownMenu.Item className="terminal-action-item is-compact" onSelect={onOpenMissionAI}><span>Open Mission AI</span></DropdownMenu.Item>}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <button type="button" className="ai-pane__icon" aria-label="Close the assistant" title="Close · Alt C" onClick={onClose}><PaneIcon name="close"/></button>
      </div>
    </header>

    <AssistantThread
      conversation={conversation}
      compact
      emptyState={<div className="ai-pane__welcome">
        <p>{hasModel ? (sourceName ? <>Ask about <b>{sourceName}</b> or anything else in this workspace.</> : "Ask about any terminal in this workspace.") : "Add a key to use the assistant."}</p>
        {hasModel
          ? <div className="ai-pane__suggestions">{suggestions.map(text => <button key={text} type="button" onClick={() => void conversation.send(text, sourceSession?.id || null)}>{text}</button>)}</div>
          : <button type="button" className="ai-pane__setup" onClick={() => setKeysOpen(true)}>Keys &amp; models</button>}
      </div>}
    />
    <AssistantComposer
      conversation={conversation}
      compact
      disabled={!hasModel}
      placeholder={sourceName ? `Ask about ${sourceName}…` : "Ask the assistant…"}
      focusWorkerId={sourceSession?.id || null}
    />
    <AssistantKeys open={keysOpen} onOpenChange={value => { setKeysOpen(value); if (!value) void refresh(); }} status={status} onStatus={next => next && setStatus(next)} onConfirm={onConfirm}/>
  </section>;
}
