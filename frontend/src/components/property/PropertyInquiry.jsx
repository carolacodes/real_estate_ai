import useTranslation from "../../i18n/useTranslation.js";
export default function PropertyInquiry() {
  const {
    t
  } = useTranslation();
  return <aside aria-label={t("Property inquiry")} className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 min-w-0 scroll-mt-28" id="inquiry-card">
    <div className="rounded-xl bg-surface-card p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex items-center gap-4 bg-surface-subtle -mx-6 -mt-6 p-6 sm:-mx-8 sm:-mt-8 sm:p-8 rounded-t-xl">
        <div className="w-16 h-16 rounded-full shadow-sm bg-surface-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-3xl text-text-muted" aria-hidden="true">support_agent</span></div>
        <div className="min-w-0 flex-1"><p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{t("AURA Real Estate")}</p><h2 className="font-headline-sm text-headline-sm font-semibold text-text-main">{t("Interested in this property?")}</h2><p className="font-body-sm text-body-sm text-text-muted">{t("Talk to a property advisor")}</p></div>
      </div>
      <p id="inquiry-notice" className="font-body-sm text-body-sm text-text-muted">{t("Online enquiries and viewing requests are coming soon.")}</p>
      <fieldset disabled aria-describedby="inquiry-notice" className="space-y-4 min-w-0">
        <legend className="sr-only">{t("Contact an advisor (coming soon)")}</legend>
        {[['name', 'Full Name', 'text', 'Your full name'], ['email', 'Email', 'email', 'you@example.com']].map(([name, label, type, placeholder]) => <div key={name} className="space-y-1.5"><label htmlFor={`inquiry-${name}`} className="block font-label-sm text-label-sm text-text-main font-semibold uppercase tracking-wider">{t(label)}</label><input id={`inquiry-${name}`} type={type} placeholder={t(placeholder)} className="w-full min-w-0 px-4 py-3 rounded-DEFAULT bg-surface text-text-main font-body-md text-body-md shadow-sm placeholder:text-text-subtle" /></div>)}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><label htmlFor="inquiry-phone" className="block font-label-sm text-label-sm text-text-main font-semibold uppercase tracking-wider">{t("Phone")}</label><input id="inquiry-phone" type="tel" placeholder={t("Your phone number")} className="w-full min-w-0 px-4 py-3 rounded-DEFAULT bg-surface text-text-main font-body-md text-body-md shadow-sm placeholder:text-text-subtle" /></div>
          <div className="space-y-1.5"><label htmlFor="inquiry-date" className="block font-label-sm text-label-sm text-text-main font-semibold uppercase tracking-wider">{t("Preferred Date")}</label><input id="inquiry-date" type="date" className="w-full min-w-0 px-4 py-3 rounded-DEFAULT bg-surface text-text-muted font-body-md text-body-md shadow-sm" /></div>
        </div>
        <button type="button" disabled className="w-full py-3.5 px-6 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md font-semibold tracking-wider uppercase shadow-md mt-2 flex items-center justify-center gap-2"><span>{t("Request a Viewing")}</span><span className="material-symbols-outlined text-[18px]" aria-hidden="true">calendar_month</span></button>
      </fieldset>
    </div>
  </aside>;
}
