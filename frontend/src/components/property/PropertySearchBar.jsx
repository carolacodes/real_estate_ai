import { useState } from 'react';
import SelectDropdown from '../ui/SelectDropdown.jsx';
import useTranslation from "../../i18n/useTranslation.js";
import { useNavigate } from 'react-router-dom';
const fields = [['location', 'Enclave', [['', 'All Enclaves'], ['Dubai Marina', 'Dubai Marina'], ['Downtown Dubai', 'Downtown Dubai'], ['Business Bay', 'Business Bay'], ['Palm Jumeirah', 'Palm Jumeirah'], ['Jumeirah Village Circle', 'Jumeirah Village Circle']]], ['propertyType', 'Silhouette', [['', 'All Typologies'], ['Apartment', 'Apartment'], ['Villa', 'Architectural Villa'], ['Penthouse', 'Sky Residence'], ['Townhouse', 'Townhouse']]], ['maxPrice', 'Capital Range', [['', 'Unrestricted'], ['1000000', 'Up to AED 1M'], ['2000000', 'Up to AED 2M'], ['5000000', 'Up to AED 5M'], ['12000000', 'Up to AED 12M']]], ['bedrooms', 'Bedrooms', [['', 'Any Configuration'], ['0', 'Studio'], ['1', '1 Bedroom'], ['2', '2 Bedrooms'], ['3', '3 Bedrooms'], ['4', '4 Bedrooms'], ['5', '5 Bedrooms']]]];
export default function PropertySearchBar() {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [values, setValues] = useState({});
  function search(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) if (value) params.set(name, value);
    navigate(`/properties${params.size ? `?${params}` : ''}`);
  }
  return <div className="-mt-16 relative z-20 mx-auto max-w-5xl">
    <form onSubmit={search} aria-label={t("Search residences")} className="p-3 md:p-4 rounded-xl bg-surface/95 backdrop-blur-xl shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {fields.map(([name, label, options]) => <SelectDropdown key={name}
          id={`search-${name}`} name={name} label={t(label)} value={values[name] ?? ''}
          options={options.map(([value, text]) => ({ value, label: t(text) }))}
          onChange={value => setValues(current => ({ ...current, [name]: value }))}
          className="px-4 py-2.5 rounded-lg bg-surface-subtle hover:bg-surface-container-high transition-colors"
          labelClassName="!mb-0.5"
          triggerClassName="!px-0 !py-0 !border-transparent !bg-transparent !font-headline-sm !text-label-md font-semibold"
        />)}
        <button type="submit" className="w-full h-full min-h-[56px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-label-md text-label-md hover:bg-inverse-surface transition-all shadow-md"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span>{t("Discover Assets")}</button>
      </div>
    </form>
  </div>;
}
