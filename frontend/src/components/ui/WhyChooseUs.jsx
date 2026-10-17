import useTranslation from "../../i18n/useTranslation.js";
export default function WhyChooseUs() {
  const {
    t
  } = useTranslation();
  return <section className="w-full py-24 bg-surface-subtle">
<div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
<div className="max-w-2xl mb-16">
<span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-text-muted block mb-2">{t("The Standard of Discretion")}</span>
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main font-semibold">{t("Curated Exclusivity. Augmented by Intelligence.")}</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<div className="p-8 rounded-xl bg-surface-card shadow-sm hover:shadow-md transition-shadow group">
<div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-text-main mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
<span className="material-symbols-outlined text-[24px]">visibility_off</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Curated Discretion")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Over 62% of our inventory represents off-market, confidential representations inaccessible through conventional MLS channels or public portals.")}</p>
</div>

<div className="p-8 rounded-xl bg-surface-card shadow-sm hover:shadow-md transition-shadow group">
<div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-text-main mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
<span className="material-symbols-outlined text-[24px]">psychology</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Autonomous Intelligence")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Proprietary spatial AI models continuously index tax treaty modifications, capital yield projections, and municipal preservation zoning.")}</p>
</div>

<div className="p-8 rounded-xl bg-surface-card shadow-sm hover:shadow-md transition-shadow group">
<div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-text-main mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
<span className="material-symbols-outlined text-[24px]">architecture</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Architectural Pedigree")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Every residence must fulfill exacting aesthetic and structural criteria vetted by licensed architectural scholars and structural engineers.")}</p>
</div>

<div className="p-8 rounded-xl bg-surface-card shadow-sm hover:shadow-md transition-shadow group">
<div className="w-12 h-12 rounded-lg bg-surface-subtle flex items-center justify-center text-text-main mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
<span className="material-symbols-outlined text-[24px]">balance</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Frictionless Settlement")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Dedicated cross-border legal counsel, multi-currency escrow facilities, and discrete trust establishment tailored to ultra-high-net-worth requirements.")}</p>
</div>
</div>
</div>
</section>;
}
