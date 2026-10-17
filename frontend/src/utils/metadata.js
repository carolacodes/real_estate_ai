import { translate, propertyLabel } from '../i18n/core.js';
import { formatPrice, formatBedrooms } from './property.js';

export const pageMetadata = {
  home: { title: 'AURA Prime Real Estate | AI Property Discovery in Dubai', description: 'Explore curated Dubai properties with AI-powered search and real-time property recommendations.' },
  properties: { title: 'Properties in Dubai | AURA Prime Real Estate', description: 'Browse available apartments, villas, townhouses and premium properties across Dubai.' },
  about: { title: 'About AURA | AI-Powered Real Estate Discovery', description: 'Learn how AURA combines curated property listings with AI-assisted discovery for Dubai real estate.' },
  contact: { title: 'Contact | AURA Prime Real Estate', description: "Explore AURA's contact experience and AI Property Advisor demo." },
  notFound: { title: 'Page Not Found | AURA Prime Real Estate', description: "The page you're looking for doesn't exist or may have moved. Explore properties across Dubai with AURA.", noindex: true },
};

export function propertyMetadata(property, { notFound = false, error = false, language = 'en' } = {}) {
  if (notFound) return { ...pageMetadata.notFound, title: translate(language, 'Property Not Found | AURA Prime Real Estate'), description: translate(language, pageMetadata.notFound.description), localized: true };
  if (!property) return { title: translate(language, 'Property Details | AURA Prime Real Estate'), description: translate(language, 'Explore property details with AURA Prime Real Estate.'), noindex: true, localized: true };
  const details = [propertyLabel(property.property_type, language), property.address, property.city, property.country];
  if (property.bedrooms !== null && property.bedrooms !== undefined && property.bedrooms !== '') details.push(formatBedrooms(property.bedrooms, language));
  if (property.price !== null && property.price !== undefined && property.price !== '' && Number.isFinite(Number(property.price))) details.push(formatPrice(property.price, language));
  return {
    title: `${property.project_name || propertyLabel(property.property_type, language) || translate(language, 'Property Details')} | AURA Prime Real Estate`,
    description: details.filter(Boolean).join(' · ') || translate(language, 'Explore property details with AURA Prime Real Estate.'),
    localized: true,
    noindex: error || undefined,
  };
}
