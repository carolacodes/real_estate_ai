import useTranslation from "../../i18n/useTranslation.js";
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useChatAssistant from '../../hooks/useChatAssistant.js';
import ChatLauncher from './ChatLauncher.jsx';
import ChatPanel from './ChatPanel.jsx';
import './chat.css';
export default function AIPropertyAssistant() {
  const {
    t
  } = useTranslation();
  const {
    pathname,
    hash
  } = useLocation();
  const [open, setOpen] = useState(false);
  const launcherRef = useRef(null);
  const {
    messages,
    state,
    error,
    resetKey,
    sendMessage,
    reset,
    retry
  } = useChatAssistant();
  useEffect(() => {
    if (hash !== '#inquiry-card') return;
    // Detail data loads asynchronously; wait for the existing anchor without changing the page.
    let frame;
    const scroll = () => {
      const anchor = document.getElementById('inquiry-card');
      if (!anchor) return;
      observer.disconnect();
      frame = requestAnimationFrame(() => anchor.scrollIntoView({
        block: 'start'
      }));
    };
    const observer = new MutationObserver(scroll);
    observer.observe(document.getElementById('root'), {
      childList: true,
      subtree: true
    });
    scroll();
    const timeout = window.setTimeout(() => observer.disconnect(), 30000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);
  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }
  // Closing hides the panel; the mounted hook retains history and any active stream.
  return <aside aria-label={t("AI Property Advisor")} className="chat-dock fixed z-[60] flex flex-col items-end gap-3 pointer-events-none text-text-main">
    {open && <ChatPanel onClose={close} onReset={reset} onSend={sendMessage} onRetry={retry} state={state} error={error} messages={messages} resetKey={resetKey} />}
    <ChatLauncher launcherRef={launcherRef} open={open} onToggle={() => open ? close() : setOpen(true)} />
  </aside>;
}
