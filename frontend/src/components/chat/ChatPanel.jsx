import useTranslation from "../../i18n/useTranslation.js";
import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader.jsx';
import QuickPrompts from './QuickPrompts.jsx';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';
import ChatLoadingState from './ChatLoadingState.jsx';
import ChatPropertyCard from './ChatPropertyCard.jsx';
import ChatErrorState from './ChatErrorState.jsx';
import { welcomeMessage, quickPrompts } from './chatContent.js';
export default function ChatPanel({
  onClose,
  onReset,
  onSend,
  onRetry,
  state,
  messages,
  error,
  resetKey
}) {
  const {
    t
  } = useTranslation();
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const stickToBottom = useRef(true);
  const lastResult = useRef(null);
  const busy = state === 'searching' || state === 'streaming';
  useEffect(() => {
    const stream = streamRef.current;
    if (state === 'searching' || state === 'welcome') stickToBottom.current = true;
    if (!stickToBottom.current) return;
    const frame = requestAnimationFrame(() => {
      const lastMessage = messages.at(-1);
      const latest = lastMessage?.properties?.length ? stream.querySelector(`[data-results="${lastMessage.id}"]`) : null;
      if (state === 'success' && latest && lastResult.current !== latest.dataset.results) {
        stream.scrollTop += latest.getBoundingClientRect().top - stream.getBoundingClientRect().top - 12;
        lastResult.current = latest.dataset.results;
      } else {
        stream.scrollTop = stream.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [state, messages]);
  return <section id="aura-ai-concierge-window" role="dialog" aria-labelledby="chat-title" onKeyDown={event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }} className="chat-panel rounded-xl bg-surface/95 backdrop-blur-2xl border border-border shadow-[0_24px_60px_-12px_rgba(18,19,22,0.18)] flex flex-col overflow-hidden">
    <ChatHeader onClose={onClose} onReset={onReset} />
    <QuickPrompts prompts={quickPrompts.map(prompt => t(prompt))} onSelect={onSend} disabled={busy} />
    <div ref={streamRef} onScroll={event => {
      const stream = event.currentTarget;
      stickToBottom.current = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 80;
    }} role="log" aria-label={t("Conversation")} aria-live="polite" aria-relevant="additions text" aria-busy={busy} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 font-body-sm text-body-sm">
      <div className="flex justify-center my-1"><span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-[10px] font-label-sm uppercase tracking-wider text-text-subtle">{t("AI-powered property search \u2022 Active")}</span></div>
      <ChatMessage text={t(welcomeMessage)} />
      {messages.map(message => (message.content || message.properties?.length > 0) && <ChatMessage key={message.id} role={message.role} text={message.content} time={message.time}>
        {message.properties?.length > 0 ? <div data-results={message.id} className="space-y-3">{message.properties.map(property => <ChatPropertyCard key={property.slug} property={property} onNavigate={onClose} />)}</div> : null}
      </ChatMessage>)}
      {state === 'searching' && <ChatLoadingState />}
      {state === 'streaming' && <span role="status" className="sr-only">{t("Advisor is responding...")}</span>}
      {state === 'error' && <ChatErrorState message={error} onRetry={onRetry} />}
    </div>
    <ChatInput key={resetKey} inputRef={inputRef} onSend={onSend} disabled={busy} />
  </section>;
}
