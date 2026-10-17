import useTranslation from "../i18n/useTranslation.js";
import PageMetadata from '../components/seo/PageMetadata.jsx';
import { pageMetadata } from '../utils/metadata.js';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import PropertyFilters from '../components/property/PropertyFilters.jsx';
import PropertyGrid from '../components/property/PropertyGrid.jsx';
import Pagination from '../components/property/Pagination.jsx';
import useProperties from '../hooks/useProperties.js';
export default function Properties() {
  const {
    t
  } = useTranslation();
  const catalog = useProperties();
  const listing = useRef(null);
  function changePage(page) {
    catalog.changePage(page);
    listing.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  }
  return <>
    <PageMetadata {...pageMetadata.properties} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background">
      <div className="relative w-full overflow-hidden">
        <div aria-hidden="true" className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-gradient-to-b from-tertiary-fixed-dim/20 via-surface-container-high/40 to-transparent blur-3xl pointer-events-none rounded-full" />
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin pt-10 pb-8 relative z-10">
          <nav aria-label={t("Breadcrumb")} className="flex flex-wrap items-center gap-2 mb-4 font-label-sm text-label-sm">
            <Link className="text-text-muted hover:text-text-main transition-colors" to="/">{t("Home")}</Link><span className="text-text-subtle" aria-hidden="true">/</span><span aria-current="page" className="text-text-main font-semibold">{t("Properties")}</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse" aria-hidden="true" />{t("Available Properties in Dubai")}</div>
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main tracking-tight font-semibold">{t("Explore Properties")}</h1>
              <p className="font-body-lg text-body-lg text-text-muted leading-relaxed">{t("Discover apartments, villas, townhouses and premium residences available across Dubai.")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 rounded-xl bg-surface-subtle shadow-sm shrink-0">
              {[[catalog.pagination?.total, 'Matching Properties'], [catalog.pagination?.limit, 'Per Page'], [catalog.pagination?.page, 'Current Page']].map(([value, label], index) => <div key={label} className={`min-w-0 ${index ? 'border-l border-surface-container-highest pl-4 sm:pl-6' : ''}`}><span className="font-headline-sm text-headline-sm text-text-main font-semibold block leading-tight">{value ?? "\u2014"}</span><span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider text-[11px]">{t(label)}</span></div>)}
            </div>
          </div>
        </section>
        <PropertyFilters filters={catalog.filters} sort={catalog.sort} onChange={catalog.changeFilters} onClear={catalog.clearFilters} loading={catalog.loading} error={catalog.error} pagination={catalog.pagination} count={catalog.properties.length} />
        <section ref={listing} aria-label={t("Property results")} className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin mb-16 scroll-mt-24">
          <PropertyGrid {...catalog} onClear={catalog.clearFilters} onFirstPage={() => changePage(1)} />
          <Pagination pagination={catalog.pagination} onChange={changePage} />
        </section>
      </div>
    </main>
    <Footer />
  </>;
}
