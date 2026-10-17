import useTranslation from "../../i18n/useTranslation.js";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyImage from './PropertyImage.jsx';
import { getPrimaryPropertyImage } from '../../utils/property.js';
export default function PropertyCard({
  property,
  variant = 'featured'
}) {
  const {
    propertyLabel,
    t,
    formatPrice,
    propertyLocation,
    formatBedrooms,
    formatArea,
    formatBathrooms
  } = useTranslation();
  const catalog = variant === 'catalog';
  const [saved, setSaved] = useState(false);
  const title = property.project_name || t("Private Residence");
  const destination = `/properties/${encodeURIComponent(property.slug)}`;
  return <article className={`group rounded-xl overflow-hidden bg-surface-card ${catalog ? 'shadow-sm' : 'shadow-md'} hover:shadow-xl transition-all duration-300 flex flex-col`}>
    <div className="relative aspect-[16/10] overflow-hidden">
      <Link to={destination} aria-label={t("Explore {value0}", {
        value0: title
      })}><PropertyImage src={getPrimaryPropertyImage(property)} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" /></Link>
      {catalog && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md shadow-sm"><span className="font-label-sm text-label-sm font-semibold tracking-wider text-text-main uppercase">{propertyLabel(property.property_type) || t("Featured Residence")}</span></div>
      <button type="button" aria-label={t(saved ? "Unsave {name}" : "Save {name}", { name: title })} aria-pressed={saved} onClick={() => setSaved(!saved)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-text-main hover:bg-surface transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]" style={{
          fontVariationSettings: `'FILL' ${saved ? 1 : 0}`
        }} aria-hidden="true">bookmark</span></button>
      <div className={`absolute bottom-4 left-4 max-w-[calc(100%-2rem)] font-headline-sm text-headline-sm font-semibold ${catalog ? 'text-on-primary drop-shadow-md' : 'px-3.5 py-1.5 rounded-DEFAULT bg-primary text-primary-foreground'}`}>{formatPrice(property.price)}</div>
    </div>
    <div className="p-6 flex-1 flex flex-col justify-between">
      <div className="space-y-2 mb-4">
        <p className="font-label-sm text-label-sm text-text-muted flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" aria-hidden="true">location_on</span>{propertyLocation(property)}</p>
        <h3 className="font-headline-sm text-headline-sm text-text-main font-semibold group-hover:text-accent-hover transition-colors"><Link to={destination}>{title}</Link></h3>
        <p className="font-body-sm text-body-sm text-text-muted line-clamp-2">{property.description || [property.property_type, property.furnishing, property.completion_status].map(propertyLabel).filter(Boolean).join(' · ')}</p>
      </div>
      <div className="pt-4 mt-auto">
        <div className="grid grid-cols-3 gap-2 py-3 mb-4 rounded-lg bg-surface-subtle text-center">
          {[['Beds', formatBedrooms(property.bedrooms)], ['Baths', formatBathrooms(property.bathrooms)], ['Interior', formatArea(property.area_sqft)]].map(([label, value]) => <div key={label}><p className="font-label-sm text-label-sm text-text-subtle uppercase">{t(label)}</p><p className="font-label-md text-label-md font-semibold text-text-main">{value}</p></div>)}
        </div>
        <Link to={destination} className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-DEFAULT font-label-md text-label-md transition-colors group/btn ${catalog ? 'bg-primary text-primary-foreground hover:bg-inverse-surface shadow-sm' : 'bg-surface hover:bg-surface-subtle text-text-main'}`}><span>{catalog ? t("View Residence Dossier") : t("Explore Residence")}</span><span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span></Link>
      </div>
    </div>
  </article>;
}
