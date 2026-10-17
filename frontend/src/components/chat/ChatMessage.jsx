import useTranslation from "../../i18n/useTranslation.js";
import ChatIcon from './ChatIcon.jsx';
export default function ChatMessage({
  role = 'assistant',
  text,
  time,
  children
}) {
  const {
    t
  } = useTranslation();
  if (role === 'user') return <div className="flex justify-end"><div className="max-w-[84%] p-3.5 rounded-xl rounded-tr-sm bg-primary text-primary-foreground shadow-sm break-words"><span className="sr-only">{t("You:")}</span><p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">{text}</p><div className="flex justify-end items-center gap-1.5 mt-1 text-[10px] text-text-subtle"><span className="font-label-sm">{time}</span><ChatIcon name="done_all" className="text-[13px] text-accent-hover" /></div></div></div>;
  return <div className={`flex gap-3 items-start ${children ? '' : 'max-w-[90%]'}`}><span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5"><ChatIcon name="auto_awesome" className="text-[14px] text-tertiary-fixed-dim" /></span><div className="min-w-0 flex-1 space-y-3"><div className="p-3.5 rounded-xl rounded-tl-sm bg-surface border border-border-subtle shadow-sm leading-relaxed break-words"><span className="sr-only">{t("Advisor:")}</span><p className="text-[13.5px] whitespace-pre-wrap">{text}</p>{time && <span className="block text-right font-label-sm text-[10px] text-text-subtle mt-1.5">{time}</span>}</div>{children}</div></div>;
}
