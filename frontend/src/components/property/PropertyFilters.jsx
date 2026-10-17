import SelectDropdown from '../ui/SelectDropdown.jsx';
import useTranslation from "../../i18n/useTranslation.js";
import { propertyTypes, furnishingOptions, completionOptions, sortOptions } from '../../utils/propertyQuery.js';
const locations = ['', 'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Palm Jumeirah'];
const pill = 'px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all shadow-sm';
const input = 'w-full min-w-0 px-3 py-2 rounded-DEFAULT bg-surface border border-border font-body-sm text-body-sm text-text-main';
function SelectFilter({
  name,
  label,
  options,
  value,
  onChange
}) {
  const {
    t
  } = useTranslation();
  const values = value !== undefined && !options.includes(String(value)) ? [...options, String(value)] : options;
  return <SelectDropdown id={`filter-${name}`} label={t(label)} value={value ?? ''}
    options={[{ value: '', label: t('Any') }, ...values.map(option => ({ value: option, label: t(option) }))]}
    onChange={value => onChange({ [name]: value })} />;
}
export default function PropertyFilters({
  filters,
  sort,
  onChange,
  onClear,
  loading,
  pagination,
  count,
  error
}) {
  const {
    t
  } = useTranslation();
  function bedrooms(value) {
    onChange({
      bedrooms: value,
      minBedrooms: '',
      maxBedrooms: ''
    });
  }
  return <section aria-label={t("Property filters")} className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin mb-12 relative z-10">
    <div className="rounded-xl bg-surface shadow-sm p-space-md md:p-space-lg flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t("Location shortcuts")}>{locations.map(location => <button type="button" key={location} aria-pressed={(filters.location || '') === location} onClick={() => onChange({
            location
          })} className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${(filters.location || '') === location ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-subtle text-text-muted hover:text-text-main hover:bg-surface-container-high'}`}>{location || t("All Areas")}</button>)}</div>
        <div className="flex flex-wrap items-center gap-3">
          <SelectDropdown id="sort-selector" value={sort} ariaLabel={t('Sort')}
            options={sortOptions.map(([value, label]) => ({ value, label: t(label) }))}
            onChange={value => onChange({ sort: value })}
            className="w-full sm:w-auto sm:min-w-[230px]"
            triggerClassName="!bg-surface-subtle !font-label-md !text-label-md"
            prefix={<span className="material-symbols-outlined text-text-muted text-[18px]" aria-hidden="true">swap_vert</span>}
          />
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-DEFAULT text-text-muted hover:text-error hover:bg-surface-container-high font-label-sm text-label-sm transition-colors"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">restart_alt</span>{t("Clear Filters")}</button>
        </div>
      </div>
        <div className="space-y-2 max-w-xl"><label htmlFor="filter-location" className="block font-label-sm text-label-sm uppercase tracking-wider text-text-subtle">{t("Location")}</label><input id="filter-location" type="search" maxLength={200} value={filters.location ?? ''} onChange={event => onChange({
          location: event.target.value
        })} placeholder={t("Search an area or community")} className={input} /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 bg-surface-subtle/50 p-4 rounded-lg">

        <fieldset className="space-y-2 min-w-0"><legend className="font-label-sm text-label-sm uppercase tracking-wider text-text-subtle font-semibold">{t("Property Type")}</legend><div className="flex flex-wrap gap-1.5">{['', ...propertyTypes].map(type => <button key={type} type="button" aria-pressed={(filters.propertyType || '') === type} onClick={() => onChange({
              propertyType: type
            })} className={`${pill} ${(filters.propertyType || '') === type ? 'bg-primary text-on-primary' : 'bg-surface text-text-muted hover:text-text-main hover:bg-surface-container'}`}>{type ? t(type) : t("All")}</button>)}</div></fieldset>
        <fieldset className="space-y-2 min-w-0"><legend className="font-label-sm text-label-sm uppercase tracking-wider text-text-subtle font-semibold">{t("Price Range \xB7 AED")}</legend><div className="grid grid-cols-2 gap-3">{[['minPrice', 'Min Price'], ['maxPrice', 'Max Price']].map(([name, label]) => <div key={name}><label className="block font-label-sm text-label-sm text-text-muted mb-1" htmlFor={`filter-${name}`}>{t(label)}</label><input id={`filter-${name}`} type="number" min="0" step="any" inputMode="decimal" value={filters[name] ?? ''} onChange={event => onChange({
                [name]: event.target.value
              })} placeholder={t("Any")} className={input} /></div>)}</div></fieldset>
        <fieldset className="space-y-2 min-w-0"><legend className="font-label-sm text-label-sm uppercase tracking-wider text-text-subtle font-semibold">{t("Bedrooms")}</legend><div className="flex flex-wrap gap-1.5">{[['', 'Any'], ['0', 'Studio'], ...[1, 2, 3, 4, 5, 6].map(number => [String(number), t("{count} Bedrooms", { count: number })])].map(([value, label]) => <button key={value} type="button" aria-pressed={String(filters.bedrooms ?? '') === value && (value !== '' || filters.minBedrooms === undefined && filters.maxBedrooms === undefined)} onClick={() => bedrooms(value)} className={`${pill} ${String(filters.bedrooms ?? '') === value && (value !== '' || filters.minBedrooms === undefined && filters.maxBedrooms === undefined) ? 'bg-primary text-on-primary' : 'bg-surface text-text-muted hover:text-text-main'}`}>{t(label)}</button>)}</div>{['minBedrooms', 'maxBedrooms'].map(name => filters[name] !== undefined && <button type="button" key={name} onClick={() => onChange({
            [name]: ''
          })} className={`${pill} bg-secondary-fixed text-text-main`} aria-label={t("Remove {value0} filter", { value0: t(name === "minBedrooms" ? "Min Bedrooms" : "Max Bedrooms") })}>{t(name === "minBedrooms" ? "Min Bedrooms" : "Max Bedrooms")}: {filters[name]} ×</button>)}</fieldset>
        <SelectFilter name="bathrooms" label={t("Bathrooms")} options={['0', '1', '2', '3', '4', '5', '6']} value={filters.bathrooms} onChange={onChange} />
        <SelectFilter name="furnishing" label={t("Furnishing")} options={furnishingOptions} value={filters.furnishing} onChange={onChange} />
        <SelectFilter name="completionStatus" label={t("Completion Status")} options={completionOptions} value={filters.completionStatus} onChange={onChange} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2"><span className="font-label-sm text-label-sm font-semibold text-text-main">{loading ? t("Loading properties\u2026") : error ? t("Listings temporarily unavailable") : t("{value0} properties \xB7 Showing {value1} properties", {
              value0: pagination?.total ?? 0,
              value1: count
            })}</span><span className="w-1.5 h-1.5 rounded-full bg-secondary" aria-hidden="true" /><span className="font-label-sm text-label-sm text-text-muted">{t("Available Listings")}</span></div>
        <div className="flex items-center gap-2 text-text-subtle font-label-sm text-label-sm"><span className="material-symbols-outlined text-[16px]" aria-hidden="true">verified</span>{t("Verified Properties")}</div>
      </div>
    </div>
  </section>;
}
