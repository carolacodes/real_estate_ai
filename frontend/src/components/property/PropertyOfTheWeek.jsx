import useTranslation from "../../i18n/useTranslation.js";
import { Link } from 'react-router-dom';
import PropertyImage from './PropertyImage.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { getPrimaryPropertyImage } from '../../utils/property.js';
export default function PropertyOfTheWeek({
  property,
  loading,
  error,
  retry
}) {
  const {
    propertyLabel,
    t,
    propertyLocation,
    formatPrice,
    formatArea,
    formatBedrooms
  } = useTranslation();
  return <section className="w-full py-24 bg-surface relative overflow-hidden">
    <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
      {loading ? <div role="status" aria-label={t("Loading property of the week")} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"><Skeleton className="lg:col-span-5 h-96" /><Skeleton className="lg:col-span-7 aspect-[4/3]" /></div> : error ? <EmptyState error title={t("Property of the week is temporarily unavailable")} message={t("Please try loading the portfolio again.")} onRetry={retry} /> : !property ? <EmptyState title={t("The next architectural spotlight is coming soon")} /> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-text-main font-label-sm text-label-sm tracking-wider uppercase font-semibold">{t("Architectural Spotlight \xB7 Property of the Week")}</div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-text-main font-semibold leading-tight">{property.project_name || t("Private Residence")}</h2>
            <p className="font-body-md text-body-md text-text-muted leading-relaxed">{property.description || [propertyLabel(property.property_type), propertyLocation(property), propertyLabel(property.completion_status)].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="p-6 rounded-lg bg-surface-subtle space-y-3">
            <p className="font-headline-sm text-body-lg text-text-main">{propertyLocation(property)}</p>
            <p className="font-label-sm text-label-sm tracking-wider uppercase text-text-muted">{[propertyLabel(property.property_type), propertyLabel(property.furnishing), property.handover].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {[[formatPrice(property.price), 'Target Valuation'], [formatArea(property.area_sqft), 'Interior'], [formatBedrooms(property.bedrooms), 'Bedrooms']].map(([value, label]) => <div key={label}><p className="font-headline-sm text-headline-sm font-semibold text-text-main break-words">{value}</p><p className="font-label-sm text-label-sm text-text-subtle uppercase">{t(label)}</p></div>)}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to={`/properties/${encodeURIComponent(property.slug)}`} className="px-6 py-3.5 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface transition-all shadow-sm">{t("Request Private Dossier")}</Link>
            <Link to="/contact" className="px-6 py-3.5 rounded-DEFAULT bg-surface-container-high text-text-main font-label-md text-label-md hover:bg-surface-dim transition-all">{t("Schedule Discreet Showing")}</Link>
          </div>
        </div>
        <div className="lg:col-span-7 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
            <PropertyImage src={getPrimaryPropertyImage(property)} alt={property.project_name || t("Property of the week")} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 right-6 left-6 sm:left-auto px-4 py-3 rounded-xl bg-surface/90 backdrop-blur-md shadow-md flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-hover text-[22px]" aria-hidden="true">landscape</span>
              <div><p className="font-label-md text-label-md font-semibold text-text-main">{property.city || property.country || t("Private Residence")}</p><p className="font-label-sm text-label-sm text-text-muted">{property.address || propertyLabel(property.property_type)}</p></div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  </section>;
}
