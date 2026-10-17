import useTranslation from "../i18n/useTranslation.js";
import PageMetadata from '../components/seo/PageMetadata.jsx';
import { propertyMetadata } from '../utils/metadata.js';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import PropertyGallery from '../components/property/PropertyGallery.jsx';
import PropertySpecs from '../components/property/PropertySpecs.jsx';
import PropertyDetails from '../components/property/PropertyDetails.jsx';
import PropertyInquiry from '../components/property/PropertyInquiry.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import useProperty from '../hooks/useProperty.js';
function DetailLoading() {
  const {
    t
  } = useTranslation();
  return <div role="status" aria-label={t("Loading property details")} aria-busy="true">
    <span className="sr-only">{t("Loading property details\u2026")}</span>
    <section className="w-full bg-surface-subtle pb-12 pt-8"><div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin space-y-6"><Skeleton className="h-4 w-48" /><div className="flex flex-col lg:flex-row justify-between gap-8"><div className="space-y-4 lg:w-2/3"><Skeleton className="h-6 w-48" /><Skeleton className="h-12" /><Skeleton className="h-5 w-2/3" /></div><Skeleton className="h-20 lg:w-1/4" /></div></div></section>
    <PropertyGallery loading />
    <PropertySpecs loading />
    <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-10"><div className="grid grid-cols-1 lg:grid-cols-12 gap-12"><div className="lg:col-span-7 space-y-6"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div><Skeleton className="lg:col-span-5 h-96" /></div></section>
  </div>;
}
export default function PropertyDetail() {
  const {
    language,
    propertyLabel,
    t,
    propertyLocation,
    formatPrice
  } = useTranslation();
  const {
    slug
  } = useParams();
  const {
    property,
    loading,
    error,
    notFound,
    retry
  } = useProperty(slug);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [slug]);
  const title = property?.project_name || t("Property Details");
  return <>
    <PageMetadata {...propertyMetadata(property, {
      notFound,
      error,
      language
    })} />
    <Navbar />
    <main className="w-full pt-20 min-h-screen bg-background">
      {loading ? <DetailLoading /> : error || notFound ? <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin py-20 space-y-6">
        <h1 className="sr-only">{notFound ? t("Property not found") : t("We couldn\u2019t load this property.")}</h1>
        <EmptyState error title={notFound ? t("Property not found") : t("We couldn\u2019t load this property.")} message={notFound ? t("This listing is unavailable. Explore other properties in Dubai.") : t("Please try again in a moment.")} onRetry={notFound ? undefined : retry} />
        <div className="text-center"><Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>{t("Back to Properties")}</Link></div>
      </section> : <>
        <section className="w-full bg-surface-subtle pb-12 pt-8">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
            <nav aria-label={t("Breadcrumb")} className="flex flex-wrap items-center gap-2 mb-6 text-text-subtle font-label-sm text-label-sm tracking-wider uppercase"><Link to="/properties" className="hover:text-text-main transition-colors">{t("Properties")}</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-text-main break-words">{title}</span></nav>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8">
              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">{[property.available === true ? 'Available Property' : property.available === false ? 'Unavailable' : null, property.property_type, property.featured === true ? 'Featured' : null].filter(Boolean).map(label => <span key={label} className="px-3 py-1 rounded-full bg-surface text-text-main font-label-sm text-label-sm tracking-wider uppercase shadow-sm">{t(propertyLabel(label))}</span>)}</div>
                <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main tracking-tight break-words">{title}</h1>
                <div className="flex items-start gap-2 text-text-muted font-body-md text-body-md"><span className="material-symbols-outlined text-text-subtle text-[20px] shrink-0" aria-hidden="true">pin_drop</span><span className="break-words min-w-0">{propertyLocation(property)}</span></div>
              </div>
              <div className="flex flex-col lg:items-end space-y-4 min-w-0 lg:shrink-0">
                <p className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main leading-none font-semibold tracking-tight break-words">{formatPrice(property.price)}</p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button type="button" disabled title={t("Property sharing is coming soon")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-DEFAULT bg-surface text-text-main font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">share</span>{t("Share Property")}</button>
                  <button type="button" disabled title={t("Property brochures are coming soon")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-DEFAULT bg-surface text-text-main font-label-md text-label-md shadow-sm"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">description</span>{t("Brochure")}</button>
                  <a href="#inquiry-card" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface transition-colors shadow-md"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">calendar_month</span>{t("Schedule a Viewing")}</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <PropertyGallery images={property.image_urls ?? []} title={title} />
        <PropertySpecs property={property} />
        <section className="w-full bg-background py-10"><div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin"><div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"><div className="lg:col-span-7 min-w-0"><PropertyDetails property={property} /></div><PropertyInquiry /></div></div></section>
        <section className="w-full bg-surface-subtle py-20 mt-12"><div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin"><Link to="/properties" className="inline-flex items-center gap-2 font-label-md text-label-md text-text-main hover:text-accent-hover transition-colors"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_back</span>{t("Back to Properties")}</Link></div></section>
      </>}
    </main>
    <Footer />
  </>;
}
