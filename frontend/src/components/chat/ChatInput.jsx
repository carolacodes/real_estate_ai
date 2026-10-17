import useTranslation from "../../i18n/useTranslation.js";
import { useEffect, useState } from 'react';
import ChatIcon from './ChatIcon.jsx';
export default function ChatInput({
  onSend,
  disabled,
  inputRef
}) {
  const {
    t
  } = useTranslation();
  const [draft, setDraft] = useState('');
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  function submit(event) {
    event.preventDefault();
    if (!draft.trim() || disabled) return;
    onSend(draft.trim());
    setDraft('');
  }
  return <div className="p-3.5 px-5 bg-surface border-t border-border-subtle shrink-0"><form className="flex items-center gap-2" onSubmit={submit}><div className="flex-1 min-w-0 relative flex items-center"><input ref={inputRef} aria-label={t("Describe the property you are looking for")} maxLength={2000} className="w-full min-w-0 pl-3.5 pr-16 py-2.5 rounded-DEFAULT bg-surface-subtle text-text-main font-body-sm text-body-sm border border-border focus:border-text-main placeholder:text-text-subtle transition-colors" placeholder={t("Describe the property you're looking for...")} value={draft} onChange={event => setDraft(event.target.value)} /><div className="absolute right-2 flex items-center gap-1 text-text-subtle">{[['attachment', 'Attach document — coming soon'], ['mic', 'Voice query — coming soon']].map(([icon, label]) => <button key={icon} type="button" disabled aria-label={t(label)} title={t(label)} className="p-1 opacity-60"><ChatIcon name={icon} className="text-[18px]" /></button>)}</div></div><button type="submit" aria-label={t("Send query")} disabled={disabled || !draft.trim()} className="h-10 w-10 rounded-DEFAULT bg-primary text-primary-foreground hover:bg-inverse-surface flex items-center justify-center transition-colors shrink-0 shadow-sm disabled:opacity-40"><ChatIcon name="arrow_upward" className="text-[18px]" /></button></form><div className="flex flex-wrap items-center justify-between gap-1 mt-2 pt-1 border-t border-border-subtle/60 text-[10px] font-label-sm text-text-subtle"><span className="flex items-center gap-1"><ChatIcon name="auto_awesome" className="text-[12px] text-accent-hover" />{t("AI-powered property search")}</span><span className="uppercase tracking-wider">{t("Explore properties faster \u2022 Refine your search anytime")}</span></div></div>;
}
