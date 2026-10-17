import useTranslation from "../../i18n/useTranslation.js";
import PropertyImage from '../property/PropertyImage.jsx';
import PropertySearchBar from '../property/PropertySearchBar.jsx';
export default function Hero({
  featuredCount,
  loading,
  error
}) {
  const {
    t
  } = useTranslation();
  return <section className="relative w-full -mt-20 pt-28 pb-20 md:pb-32 overflow-hidden bg-background">

<div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-tertiary-fixed/30 blur-[130px] pointer-events-none -z-0"></div>
<div className="absolute top-1/3 -left-32 w-[480px] h-[480px] rounded-full bg-secondary-fixed/50 blur-[110px] pointer-events-none -z-0"></div>
<div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin relative z-10">

<div className="flex items-center gap-2 mb-6">
<div className="inline-flex flex-wrap items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-card shadow-sm">
<span className="w-2 h-2 rounded-full bg-accent-hover animate-pulse"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-main font-semibold">{t("Q2 Curated Collection")}</span>
<span className="text-text-subtle text-xs">•</span>
<span className="font-label-sm text-label-sm text-text-muted">{loading ? t("Curating Featured Listings\u2026") : error ? t("Private Portfolio") : t("{value0} Featured Listings Available", {
              value0: featuredCount
            })}</span>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
<div className="lg:col-span-8 space-y-4">
<h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-text-main leading-tight tracking-tight">{t("Architectural Distinctions.")}<br />
<span className="italic font-normal text-secondary">{t("Curated Residences")}</span>{" "}{t("for Visionaries.")}</h1>
</div>
<div className="lg:col-span-4 space-y-6">
<p className="font-body-lg text-body-lg text-text-muted leading-relaxed">{t("A boutique portfolio of prime residential architecture, penthouses, and private estates across premier global enclaves. Discretion matched with computational precision.")}</p>
<div className="flex flex-wrap items-center gap-3">
<a className="inline-flex items-center gap-3 px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface shadow-md transition-all duration-200 group" href="#properties-archive">
<span>{t("Explore Catalog")}</span>
<span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
<button className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-DEFAULT bg-surface-subtle text-text-main font-label-md text-label-md hover:bg-secondary-fixed transition-all duration-200" disabled title={t("AI Concierge \u2014 coming soon")} type="button">
<span className="material-symbols-outlined text-[18px] text-accent-hover">auto_awesome</span>
<span>{t("Consult AI Concierge")}</span>
</button>
</div>
</div>
</div>

<div className="relative w-full rounded-xl overflow-hidden shadow-xl aspect-[4/3] min-h-[360px] sm:min-h-0 sm:aspect-[16/9] max-h-[640px] group">
<PropertyImage eager alt={t("Bel-Air Glass Villa")} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHnj5EUBZwYPv8dU5CWxPZFsXvy5QGKSmID2qWjaqZn5TVLYgHhyT49sbHgaayGI02kBnvrg6nAFvKJ_nVAcPwzwpCXWtEd6Z-Gh6nyfkWldIinpvcJ93IfZnn5hqLhf6IxLdY90uBQaZ3bPm_PhwPwKOqy_FXOGsKWv0z82WvTsNVA_8lMBnisU_-Cb9_a37k2pU_Xxopt7b4aOrHJI7k8AWkjq9YChB_Cyfi-cU" />

<div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>

<div className="absolute top-6 left-4 right-4 sm:left-6 sm:right-auto flex flex-col sm:flex-row gap-3">
<div className="px-4 py-2.5 rounded-full bg-surface/90 backdrop-blur-md shadow-sm flex items-center gap-2.5">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{t("Average Transaction:")}</span>
<span className="font-headline-sm text-body-md text-text-main font-semibold">{t("AED 15.4M")}</span>
</div>
<div className="px-4 py-2.5 rounded-full bg-surface/90 backdrop-blur-md shadow-sm flex items-center gap-2.5">
<span className="material-symbols-outlined text-[16px] text-accent-hover">verified</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{t("Private Client Trust:")}</span>
<span className="font-headline-sm text-body-md text-text-main font-semibold">99.4%</span>
</div>
</div>

<div className="absolute bottom-28 left-6 right-6 md:left-10 text-on-primary">
<p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary-fixed-dim">{t("Featured Acquisition \xB7 Bel Air Horizon")}</p>
<p className="font-headline-md text-headline-sm md:text-headline-md text-on-primary font-semibold">{t("The Glass Pavilion & Sanctuary")}</p>
</div>
</div>
<PropertySearchBar />
</div>
</section>;
}
