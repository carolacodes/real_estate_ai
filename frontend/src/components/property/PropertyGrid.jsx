import useTranslation from "../../i18n/useTranslation.js";
import PropertyCard from './PropertyCard.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
export default function PropertyGrid({
  properties,
  loading,
  error,
  retry,
  onClear,
  pagination,
  onFirstPage
}) {
  const {
    t
  } = useTranslation();
  if (error) return <EmptyState error title={t("The portfolio is temporarily unavailable")} message={t("We couldn\u2019t load the residences. Please try again.")} onRetry={retry} />;
  if (!loading && properties.length === 0) return <div className="space-y-5"><EmptyState title={pagination?.total ? t("No residences on this page.") : t("No properties match your search.")} message={t("Adjust your criteria to explore more residences.")} /><div className="text-center"><button type="button" onClick={pagination?.total ? onFirstPage : onClear} className="px-6 py-3 rounded-DEFAULT bg-primary text-primary-foreground font-label-md text-label-md">{pagination?.total ? t("Back to first page") : t("Clear Filters")}</button></div></div>;
  return <div aria-busy={loading} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
    {loading ? <><span role="status" className="sr-only">{t("Loading properties\u2026")}</span>{Array.from({
        length: 6
      }, (_, index) => <div key={index} className="rounded-xl overflow-hidden bg-surface shadow-sm"><Skeleton className="aspect-[16/10]" /><div className="p-6 space-y-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-8" /><Skeleton className="h-20" /><Skeleton className="h-10" /></div></div>)}</> : properties.map(property => <PropertyCard key={property.id || property.slug} property={property} variant="catalog" />)}
  </div>;
}
