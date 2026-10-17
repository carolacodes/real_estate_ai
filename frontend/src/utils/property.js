import { translate } from '../i18n/core.js';
const priceFormatters = {
  en: new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }),
  es: new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'AED', currencyDisplay: 'code', maximumFractionDigits: 0 }),
};
const numberFormatters = { en: new Intl.NumberFormat('en-AE'), es: new Intl.NumberFormat('es-ES') };
export function formatPrice(value, language = 'en') {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? (priceFormatters[language] || priceFormatters.en).format(Number(value)) : translate(language, 'Price on request');
}
export function formatArea(value, language = 'en') {
  return value !== null && value !== undefined && Number.isFinite(Number(value)) ? `${(numberFormatters[language] || numberFormatters.en).format(Number(value))} ${language === 'es' ? 'pies²' : 'sqft'}` : '—';
}
export function formatBedrooms(value, language = 'en') {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value) === 0 ? translate(language, 'Studio') : translate(language, Number(value) === 1 ? '{count} Bed' : '{count} Beds', { count: value });
}
export function formatBathrooms(value, language = 'en') {
  return value == null || value === '' ? '—' : translate(language, Number(value) === 1 ? '{count} Bath' : '{count} Baths', { count: value });
}
export function propertyLocation(property, language = 'en') {
  return [property.address, property.city, property.country].filter(Boolean).join(', ') || translate(language, 'Location on request');
}
export function getPrimaryPropertyImage(property) { return property?.image_urls?.[0] || null; }
