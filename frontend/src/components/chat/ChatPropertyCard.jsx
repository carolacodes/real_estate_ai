import useTranslation from "../../i18n/useTranslation.js";
import { Link } from 'react-router-dom';
import PropertyImage from '../property/PropertyImage.jsx';
import { getPrimaryPropertyImage } from '../../utils/property.js';
import ChatIcon from './ChatIcon.jsx';
export default function ChatPropertyCard({
  property,
  onNavigate
}) {
  const {
    propertyLabel,
    formatPrice,
    propertyLocation,
    formatBedrooms,
    t,
    formatArea,
    formatBathrooms
  } = useTranslation();
  const destination = `/properties/${encodeURIComponent(property.slug)}`;
  const title = property.project_name || propertyLabel(property.property_type) || t("Property");
  const furnished = property.furnishing === 'Furnished';
  const badge = property.furnishing || property.property_type;
  return <article className="group bg-surface rounded-lg border border-border hover:border-accent-hover transition-colors overflow-hidden shadow-sm">
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container">
      <PropertyImage src={getPrimaryPropertyImage(property)} alt={title} className="w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-300" />
      {badge && <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-primary-foreground font-label-sm text-[10px] uppercase tracking-wider ${furnished ? 'bg-accent-hover' : 'bg-primary'}`}>{propertyLabel(badge)}</span>}
      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-surface/90 backdrop-blur-md border border-white/40 font-label-sm text-[12px] font-semibold">{formatPrice(property.price)}</div>
    </div>
    <div className="p-3.5">
      <h3 className="font-headline-sm text-label-md font-semibold leading-snug">{title}</h3>
      <p className="text-[11px] text-text-muted mt-0.5">{propertyLocation(property)}{property.property_type ? ` • ${propertyLabel(property.property_type)}` : ""}</p>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 pt-2 border-t border-border-subtle font-label-sm text-[11px] text-text-subtle">
        <span>{formatBedrooms(property.bedrooms)}</span><span aria-hidden="true">•</span><span>{formatBathrooms(property.bathrooms)}</span><span aria-hidden="true">•</span><span>{formatArea(property.area_sqft)}</span><span className="ml-auto text-emerald-600 font-medium">{propertyLabel(property.completion_status)}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Link onClick={onNavigate} to={destination} className="flex-1 py-1.5 px-3 rounded-DEFAULT bg-primary text-primary-foreground font-label-sm text-[11px] hover:bg-inverse-surface transition-colors flex items-center justify-center gap-1.5">{t("View Property")}<ChatIcon name="arrow_forward" className="text-[13px]" /></Link>
        <Link onClick={onNavigate} to={`${destination}#inquiry-card`} aria-label={t("Schedule Viewing: {value0}", {
          value0: title
        })} title={t("Schedule Viewing")} className="py-1.5 px-2.5 rounded-DEFAULT bg-surface-subtle hover:bg-surface border border-border"><ChatIcon name="event" className="text-[15px]" /></Link>
      </div>
    </div>
  </article>;
}
