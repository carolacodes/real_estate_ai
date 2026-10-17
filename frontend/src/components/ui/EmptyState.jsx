import useTranslation from "../../i18n/useTranslation.js";
export default function EmptyState({
  title = 'No residences available',
  message = 'Our curated portfolio will be available here soon.',
  error = false,
  onRetry
}) {
  const {
    t
  } = useTranslation();
  return <div role={error ? 'alert' : 'status'} className="p-10 rounded-xl bg-surface text-center shadow-sm">
    <span className="material-symbols-outlined text-4xl text-accent-hover mb-4" aria-hidden="true">{error ? "cloud_off" : "architecture"}</span>
    <h3 className="font-headline-sm text-headline-sm mb-3">{t(title)}</h3>
    <p className="font-body-sm text-body-sm text-text-muted">{t(message)}</p>
    {onRetry && <button type="button" onClick={onRetry} className="mt-6 px-6 py-3 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md">{t("Try again")}</button>}
  </div>;
}
