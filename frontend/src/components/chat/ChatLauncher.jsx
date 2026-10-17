import { useId, useRef } from 'react';
import useTranslation from '../../i18n/useTranslation.js';
import useLauncherEngagement from '../../hooks/useLauncherEngagement.js';
import ChatIcon from './ChatIcon.jsx';
import ChatNudge from './ChatNudge.jsx';

export default function ChatLauncher({ open, onToggle, launcherRef }) {
  const { t } = useTranslation();
  const localRef = useRef(null);
  const buttonRef = launcherRef || localRef;
  const nudgeId = useId();
  const launcherId = useId();
  const { messageIndex, bouncing, pause } = useLauncherEngagement(open, launcherId);
  const showNudge = !open && messageIndex !== null;

  return <div className="relative shrink-0">
    {showNudge && <ChatNudge id={nudgeId} messageIndex={messageIndex} />}
    <div className={!open && bouncing ? 'chat-launcher-bounce' : undefined}>
      <button id={launcherId} ref={buttonRef} type="button"
        aria-label={open ? t('Minimize AI Property Advisor') : t('Open AI Property Advisor')}
        aria-expanded={open} aria-controls="aura-ai-concierge-window" aria-describedby={showNudge ? nudgeId : undefined}
        onClick={() => { pause(); onToggle(); }}
        className="chat-launcher group relative flex shrink-0 items-center gap-3.5 h-14 pl-4 pr-5 rounded-full bg-primary text-primary-foreground shadow-[0_16px_36px_-8px_rgba(18,19,22,0.35)] hover:bg-inverse-surface border border-white/10 transition-colors">
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-tertiary-fixed-dim">
          <ChatIcon name="auto_awesome" className="text-[19px]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-hover border-2 border-primary" />
        </span>
        <span className="flex flex-col text-left">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold tracking-wide">
            {t('AI ADVISOR')}<span aria-hidden="true" className="chat-launcher-online w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-label-sm text-[10px] text-text-subtle uppercase tracking-wider">{t('ONLINE')}</span>
        </span>
      </button>
    </div>
  </div>;
}
