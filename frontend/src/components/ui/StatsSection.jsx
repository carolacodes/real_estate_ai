import useTranslation from "../../i18n/useTranslation.js";
export default function StatsSection() {
  const {
    t
  } = useTranslation();
  return <section className="w-full py-16 bg-surface-card shadow-sm">
<div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0">
<div className="pt-4 md:pt-0">
<p className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-text-main">{t("AED 6.79B+")}</p>
<p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted mt-1">{t("Total Curated Volume")}</p>
</div>
<div className="pt-4 md:pt-0">
<p className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-text-main">{t("14 Enclaves")}</p>
<p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted mt-1">{t("Global Prime Jurisdictions")}</p>
</div>
<div className="pt-4 md:pt-0">
<p className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-text-main">98.8%</p>
<p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted mt-1">{t("Private Re-engagement Rate")}</p>
</div>
<div className="pt-4 md:pt-0">
<p className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-text-main">{t("4.2 Min")}</p>
<p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted mt-1">{t("AI Concierge Match Response")}</p>
</div>
</div>
</div>
</section>;
}
