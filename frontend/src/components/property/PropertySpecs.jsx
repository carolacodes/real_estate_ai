import useTranslation from "../../i18n/useTranslation.js";
import Skeleton from '../ui/Skeleton.jsx';
export default function PropertySpecs({
  property,
  loading = false
}) {
  const {
    propertyLabel,
    formatBedrooms,
    formatArea,
    t
  } = useTranslation();
  const specs = loading ? [] : [['Bedrooms', formatBedrooms(property.bedrooms)], ['Bathrooms', property.bathrooms ?? '—'], ['Interior Area', formatArea(property.area_sqft)], ['Property Type', property.property_type || '—'], ['Completion Status', property.completion_status || '—'], ['Handover', property.handover || '—']];
  return <section aria-label={t("Property specifications")} className="w-full bg-background py-6">
    <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
      <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-6 rounded-xl bg-surface-card shadow-sm">
        {loading ? Array.from({
          length: 6
        }, (_, index) => <div key={index} className="space-y-3"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-7" /></div>) : specs.map(([label, value]) => <div key={label} className="flex flex-col space-y-1 min-w-0"><dt className="font-label-sm text-label-sm uppercase tracking-wider text-text-subtle">{t(label)}</dt><dd className="font-headline-sm text-headline-sm text-text-main font-semibold break-words">{["Property Type", "Completion Status"].includes(label) ? propertyLabel(value) : value}</dd></div>)}
      </dl>
    </div>
  </section>;
}
