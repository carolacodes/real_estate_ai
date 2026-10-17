import { translations } from './translations.js';

export const languageStorageKey = 'aura-language';
export const supportedLanguages = ['en', 'es'];
export function translate(language, key, parameters = {}) {
  if (key === undefined || key === null) return '';
  const source = String(key);
  const catalog = supportedLanguages.includes(language) ? translations[language] : translations.en;
  const value = Object.hasOwn(catalog, source) ? catalog[source]
    : Object.hasOwn(translations.en, source) ? translations.en[source] : source;
  return value.replace(/\{(\w+)\}/g, (match, name) => parameters[name] ?? match);
}
export function readLanguage(storage) {
  try { const saved = storage?.getItem(languageStorageKey); return supportedLanguages.includes(saved) ? saved : 'en'; }
  catch { return 'en'; }
}
export function applyLanguage(language, storage, document) {
  if (document) document.documentElement.lang = language;
  try { storage?.setItem(languageStorageKey, language); } catch { /* In-memory selection still works when storage is blocked. */ }
}
export function propertyLabel(value, language = 'en') {
  const values = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Residential Building', 'Villa Compound', 'Furnished', 'Unfurnished', 'Ready', 'Off-Plan', 'Sale', 'Studio'];
  const match = values.find(option => option.toLowerCase() === String(value).toLowerCase());
  return match ? translate(language, match) : value;
}
