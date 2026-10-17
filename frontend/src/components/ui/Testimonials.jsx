import useTranslation from "../../i18n/useTranslation.js";
export default function Testimonials() {
  const {
    t
  } = useTranslation();
  return <section className="w-full py-24 bg-background">
<div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-text-muted block mb-2">{t("Discreet Endorsements")}</span>
<h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main font-semibold">{t("Perspectives from Family Principals")}</h2>
</div>
<div className="text-text-muted font-body-sm text-body-sm">{t("Strict anonymity maintained in accordance with Client Protocol Article 4.")}</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div className="p-10 rounded-2xl bg-surface shadow-md space-y-6">
<div className="flex items-center gap-1 text-accent-hover">
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
</div>
<p className="font-headline-sm text-body-lg text-text-main leading-relaxed">{t("\u201CAcquiring our waterfront sanctuary in Cap d\u2019Antibes was handled with uncompromised discretion. AURA\u2019s architectural dossier pinpointed historical structural variances that ordinary brokerages consistently overlooked.\u201D")}</p>
<div className="pt-4 flex items-center justify-between">
<div>
<p className="font-headline-sm text-label-md font-semibold text-text-main">{t("Managing Director")}</p>
<p className="font-body-sm text-body-sm text-text-muted">{t("Zurich Multi-Family Office")}</p>
</div>
<div className="px-3 py-1 rounded bg-surface-subtle font-label-sm text-label-sm text-text-subtle">{t("Verified 2024 Acquisition")}</div>
</div>
</div>

<div className="p-10 rounded-2xl bg-surface shadow-md space-y-6">
<div className="flex items-center gap-1 text-accent-hover">
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
<span className="material-symbols-outlined text-[20px]">star</span>
</div>
<p className="font-headline-sm text-body-lg text-text-main leading-relaxed">{t("\u201CTheir AI advisor matched my aesthetic profile with a secluded Tribeca penthouse that was completely unlisted. Within four business days, contracts were drafted under multi-party escrow without a single press rumor.\u201D")}</p>
<div className="pt-4 flex items-center justify-between">
<div>
<p className="font-headline-sm text-label-md font-semibold text-text-main">{t("Tech Principal & Modernist Collector")}</p>
<p className="font-body-sm text-body-sm text-text-muted">{t("Silicon Valley / Manhattan")}</p>
</div>
<div className="px-3 py-1 rounded bg-surface-subtle font-label-sm text-label-sm text-text-subtle">{t("Verified 2025 Acquisition")}</div>
</div>
</div>
</div>
</div>
</section>;
}
