import useTranslation from "../../i18n/useTranslation.js";
import { useState } from 'react';
import SectionHeader from '../ui/SectionHeader.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import PropertyCard from './PropertyCard.jsx';
const categories = [['All Enclaves', null], ['Architectural Villas', 'Villa'], ['Sky Residences', 'Penthouse'], ['Apartments', 'Apartment']];
export default function FeaturedProperties({
  properties,
  loading,
  error,
  retry
}) {
  const {
    t
  } = useTranslation();
  const [category, setCategory] = useState(null);
  const visible = category ? properties.filter(property => property.property_type?.toLowerCase() === category.toLowerCase()) : properties;
  return <section className="w-full py-24 bg-surface-subtle" id="properties-archive">
    <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin">
      <SectionHeader eyebrow={t("Current Registry")} title={t("Curated Prime Portfolio")}>
        <div className="flex flex-wrap gap-2" aria-label={t("Portfolio categories")}>{categories.map(([label, value]) => <button type="button" key={label} onClick={() => setCategory(value)} aria-pressed={category === value} className={`px-4 py-2 rounded-full font-label-sm text-label-sm tracking-wide transition-all shadow-sm ${category === value ? 'bg-primary text-on-primary' : 'bg-surface text-text-muted hover:text-text-main'}`}>{t(label)}</button>)}</div>
      </SectionHeader>
      {loading ? <div role="status" aria-label={t("Loading featured residences")}><span className="sr-only">{t("Loading featured residences\u2026")}</span><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[0, 1, 2].map(key => <div key={key} className="rounded-xl overflow-hidden bg-surface shadow-md"><Skeleton className="aspect-[16/10]" /><div className="p-6 space-y-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-8" /><Skeleton className="h-20" /><Skeleton className="h-10" /></div></div>)}</div></div> : error ? <EmptyState error title={t("The portfolio is temporarily unavailable")} message={t("We couldn\u2019t load the featured residences. Please try again.")} onRetry={retry} /> : visible.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{visible.map(property => <PropertyCard key={property.id || property.slug} property={property} />)}</div> : <EmptyState message={category ? t("No featured residences match this category. Explore all enclaves.") : undefined} />}
    </div>
  </section>;
}
