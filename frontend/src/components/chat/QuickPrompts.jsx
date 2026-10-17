import useTranslation from "../../i18n/useTranslation.js";
export default function QuickPrompts({
  prompts,
  onSelect,
  disabled
}) {
  const {
    t
  } = useTranslation();
  return <div aria-label={t("Suggested property searches")} className="chat-prompts px-5 py-2.5 bg-surface-subtle/80 border-b border-border-subtle flex items-center gap-2 overflow-x-auto shrink-0"><span className="font-label-sm text-[10px] uppercase tracking-wider text-text-subtle shrink-0">{t("Direct Prompts:")}</span>{prompts.map(prompt => <button key={prompt} type="button" disabled={disabled} onClick={() => onSelect(prompt)} className="px-3 py-1 rounded-full bg-surface border border-border text-text-main hover:border-accent-hover hover:text-accent-hover font-label-sm text-label-sm whitespace-nowrap transition-colors shrink-0 disabled:opacity-50">{prompt}</button>)}</div>;
}
