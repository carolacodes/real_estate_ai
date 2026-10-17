import useTranslation from "../../i18n/useTranslation.js";
export default function PropertyDetails({
  property
}) {
  const {
    propertyLabel,
    formatArea,
    t,
    propertyLocation
  } = useTranslation();
  const overview = [propertyLabel(property.property_type), property.address && `${t("in")} ${property.address}`].filter(Boolean).join(' ');
  const dimensions = [property.bedrooms != null && (Number(property.bedrooms) === 0 ? t("Studio") : t(Number(property.bedrooms) === 1 ? "{count} bedroom" : "{count} bedrooms", { count: property.bedrooms })), property.bathrooms != null && t(Number(property.bathrooms) === 1 ? "{count} bathroom" : "{count} bathrooms", { count: property.bathrooms }), property.area_sqft != null && formatArea(property.area_sqft)].filter(Boolean).join(' · ');
  const details = [['Furnishing', property.furnishing, 'chair'], ['Completion Status', property.completion_status, 'task_alt'], ['Handover', property.handover, 'event'], ['Property Type', property.property_type, 'apartment'], ['Purpose', property.purpose, 'real_estate_agent'], ['City', property.city, 'location_city']];
  return <div className="space-y-12">
    <div className="space-y-6">
      <div className="space-y-2"><p className="font-label-sm text-label-sm text-text-muted tracking-widest uppercase font-semibold">{t("Property Details")}</p><h2 className="font-headline-md text-headline-md text-text-main tracking-tight">{t("Overview")}</h2></div>
      <div className="max-w-none text-text-muted font-body-lg text-body-lg space-y-4">
        {overview && <p>{overview}.</p>}
        {dimensions && <p>{dimensions}.</p>}
        {(property.furnishing || property.completion_status) && <p>{[property.furnishing, property.completion_status].map(propertyLabel).filter(Boolean).join(' · ')}.</p>}
        {!overview && !dimensions && !property.furnishing && !property.completion_status && <p>—</p>}
      </div>
    </div>
    <div className="space-y-6">
      <h2 className="font-headline-sm text-headline-sm text-text-main font-semibold">{t("Key Information")}</h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map(([label, value, icon]) => <div key={label} className="p-5 rounded-lg bg-surface shadow-sm space-y-2 min-w-0"><dt className="flex items-center gap-2.5 text-text-main"><span className="material-symbols-outlined text-[20px] text-on-tertiary-container" aria-hidden="true">{icon}</span><span className="font-label-md text-label-md font-semibold">{t(label)}</span></dt><dd className="font-body-sm text-body-sm text-text-muted break-words">{(["Furnishing", "Completion Status", "Property Type", "Purpose"].includes(label) ? propertyLabel(value) : value) || "\u2014"}</dd></div>)}
      </dl>
    </div>
    <div className="p-6 rounded-xl bg-surface shadow-sm space-y-4">
      <h2 className="font-headline-sm text-headline-sm text-text-main font-semibold">{t("Location")}</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-text-main font-body-sm text-body-sm">{[['Address', property.address], ['City', property.city], ['Country', property.country]].map(([label, value]) => <div key={label} className="space-y-1 min-w-0"><dt className="text-text-subtle font-label-sm text-label-sm uppercase">{t(label)}</dt><dd className="font-medium break-words">{value || "\u2014"}</dd></div>)}</dl>
    </div>
    <div className="space-y-4">
      <h2 className="font-headline-sm text-headline-sm text-text-main font-semibold">{t("Property Location")}</h2>
      <div className="w-full h-80 rounded-xl property-placeholder shadow-sm relative overflow-hidden flex items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-accent-hover" aria-hidden="true">location_on</span>
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto p-4 rounded-lg bg-surface/90 backdrop-blur-md shadow-md text-text-main sm:max-w-xs"><p className="font-label-md text-label-md font-semibold break-words">{propertyLocation(property)}</p></div>
      </div>
    </div>
  </div>;
}
