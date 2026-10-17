import useTranslation from "../../i18n/useTranslation.js";
export default function ChatErrorState({
  onRetry,
  message
}) {
  const {
    t
  } = useTranslation();
  return <div role="alert" className="p-3.5 rounded-xl bg-surface border border-border-subtle shadow-sm"><p className="text-[13.5px] leading-relaxed">{message ? t(message) : t("We couldn\u2019t complete your search. Please try again.")}</p><button type="button" onClick={onRetry} className="mt-2.5 px-3 py-1.5 rounded-DEFAULT bg-surface-subtle border border-border hover:border-accent-hover font-label-sm text-[11px]">{t("Try again")}</button></div>;
}
