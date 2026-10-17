import useTranslation from '../../i18n/useTranslation.js';
import { launcherNudges } from './launcherEngagement.js';

export default function ChatNudge({ messageIndex, id }) {
  const { t } = useTranslation();
  if (messageIndex === null || messageIndex === undefined) return null;
  return <div id={id} key={messageIndex} className="chat-nudge absolute bottom-[calc(100%+12px)] right-0 w-[260px] max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-surface px-4 py-3 shadow-sm pointer-events-none font-body-sm text-body-sm text-text-main">
    {t(launcherNudges[messageIndex])}
    <span aria-hidden="true" className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 border-b border-r border-border bg-surface" />
  </div>;
}
