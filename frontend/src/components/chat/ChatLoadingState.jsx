import useTranslation from "../../i18n/useTranslation.js";
export default function ChatLoadingState() {
  const {
    t
  } = useTranslation();
  return <div role="status" className="p-3 rounded-lg bg-surface-subtle border border-border-subtle flex items-center gap-2.5 text-text-muted"><span aria-hidden="true" className="relative flex h-2 w-2 shrink-0"><span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-hover opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-accent-hover" /></span><span className="font-label-sm text-[11px] tracking-wide text-text-main">{t("Searching available listings...")}</span></div>;
}
