import useTranslation from "../../i18n/useTranslation.js";
export default function HowItWorks() {
  const {
    t
  } = useTranslation();
  return <section className="w-full py-24 bg-surface">
<div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
<div className="text-center max-w-2xl mx-auto mb-20">
<span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-text-muted block mb-2">{t("The Representation Journey")}</span>
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main font-semibold">{t("Precision from Query to Ownership")}</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

<div className="p-8 rounded-xl bg-surface-subtle relative flex flex-col justify-between">
<div>
<div className="font-headline-lg text-display-hero-mobile font-semibold text-secondary-fixed mb-4">
              01
            </div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Algorithmic Discovery & Synthesis")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Define your architectural silhouette, geographic latitude, and privacy criteria. The AURA advisor correlates off-market archives within seconds.")}</p>
</div>
<div className="pt-6 mt-6">
<span className="font-label-sm text-label-sm text-accent-hover uppercase tracking-wider font-semibold">{t("Step 01 \xB7 Intake & Profiling")}</span>
</div>
</div>

<div className="p-8 rounded-xl bg-surface-subtle relative flex flex-col justify-between">
<div>
<div className="font-headline-lg text-display-hero-mobile font-semibold text-secondary-fixed mb-4">
              02
            </div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Private Architectural Protocol")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Discreet private jet charters or private helicopter viewings orchestrated under full NDA protection alongside our senior managing partner.")}</p>
</div>
<div className="pt-6 mt-6">
<span className="font-label-sm text-label-sm text-accent-hover uppercase tracking-wider font-semibold">{t("Step 02 \xB7 Physical Inspection")}</span>
</div>
</div>

<div className="p-8 rounded-xl bg-surface-subtle relative flex flex-col justify-between">
<div>
<div className="font-headline-lg text-display-hero-mobile font-semibold text-secondary-fixed mb-4">
              03
            </div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-text-main mb-3">{t("Sovereign & Escrow Settlement")}</h3>
<p className="font-body-sm text-body-sm text-text-muted leading-relaxed">{t("Comprehensive multi-jurisdictional closing coordinated with family offices, private wealth trustees, and sovereign title custodians.")}</p>
</div>
<div className="pt-6 mt-6">
<span className="font-label-sm text-label-sm text-accent-hover uppercase tracking-wider font-semibold">{t("Step 03 \xB7 Title Transfer")}</span>
</div>
</div>
</div>
</div>
</section>;
}
