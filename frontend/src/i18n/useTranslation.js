import { useContext, useMemo } from 'react';
import { LanguageContext } from './language-context.js';
import { translate, propertyLabel } from './core.js';
import * as format from '../utils/property.js';

export default function useTranslation() {
  const context = useContext(LanguageContext);
  const language = context.language || 'en';
  return useMemo(() => ({
    language,
    setLanguage: context.setLanguage || (() => {}),
    t: (key, parameters) => translate(language, key, parameters),
    propertyLabel: value => propertyLabel(value, language),
    formatPrice: value => format.formatPrice(value, language),
    formatArea: value => format.formatArea(value, language),
    formatBedrooms: value => format.formatBedrooms(value, language),
    formatBathrooms: value => format.formatBathrooms(value, language),
    propertyLocation: property => format.propertyLocation(property, language),
  }), [language, context.setLanguage]);
}
