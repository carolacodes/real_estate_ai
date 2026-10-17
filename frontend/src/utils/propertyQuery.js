export const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Residential Building', 'Villa Compound'];
export const furnishingOptions = ['Furnished', 'Unfurnished'];
export const completionOptions = ['Ready', 'Off-Plan'];
export const sortOptions = [['newest', 'Newest'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low']];
const numericFilters = ['minPrice', 'maxPrice', 'bedrooms', 'minBedrooms', 'maxBedrooms', 'bathrooms'];
function positiveInteger(value, fallback, maximum = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 && number <= maximum ? number : fallback;
}
export function readPropertyQuery(params) {
  const filters = {};
  for (const name of numericFilters) {
    const raw = params.get(name);
    if (raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw)) && Number(raw) >= 0 && (name.includes('Price') || Number.isSafeInteger(Number(raw)))) filters[name] = Number(raw);
  }
  const location = params.get('location');
  if (location?.trim()) filters.location = location;
  for (const [name, allowed] of [['propertyType', propertyTypes], ['furnishing', furnishingOptions], ['completionStatus', completionOptions]]) {
    if (allowed.includes(params.get(name))) filters[name] = params.get(name);
  }
  const page = positiveInteger(params.get('page'), 1);
  const limit = positiveInteger(params.get('limit'), 12, 50);
  return { filters, page: Number.isSafeInteger(page * limit) ? page : 1, limit, sort: sortOptions.some(([value]) => value === params.get('sort')) ? params.get('sort') : 'newest' };
}
