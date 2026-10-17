import useTranslation from "../../i18n/useTranslation.js";
import ChatIcon from './ChatIcon.jsx';
export default function ChatHeader({
  onClose,
  onReset
}) {
  const {
    t
  } = useTranslation();
  return <div className="p-4 px-5 bg-surface border-b border-border-subtle flex items-center justify-between gap-2 shrink-0">
    <div className="flex items-center gap-3 min-w-0"><div className="relative w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-inner"><ChatIcon name="auto_awesome" className="text-[20px] text-tertiary-fixed-dim" /><span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 id="chat-title" className="font-headline-sm text-label-md font-semibold leading-tight">{t("AI Property Advisor")}</h2><span className="px-2 py-0.5 rounded-full bg-surface-subtle border border-border-subtle text-[10px] font-label-sm tracking-wider text-accent-hover">{t("ONLINE")}</span></div><p className="font-body-sm text-[11px] text-text-muted mt-0.5">{t("Find the right property faster")}</p></div></div>
    <div className="flex items-center gap-1 text-text-subtle shrink-0">{[['restart_alt', 'Reset conversation', onReset], ['remove', 'Minimize chat', onClose], ['close', 'Close chat', onClose]].map(([icon, label, action]) => <button key={icon} type="button" aria-label={t(label)} title={t(label)} onClick={action} className="w-7 h-8 rounded-full hover:bg-surface-subtle hover:text-text-main flex items-center justify-center transition-colors"><ChatIcon name={icon} className="text-[17px]" /></button>)}</div>
  </div>;
}
