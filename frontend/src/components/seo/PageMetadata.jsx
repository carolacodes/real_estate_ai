import useTranslation from '../../i18n/useTranslation.js';
import { useEffect } from 'react';

export default function PageMetadata({ title, description, noindex = false, localized = false }) {
  const { t } = useTranslation();
  const localizedTitle = localized ? title : t(title);
  const localizedDescription = localized ? description : t(description);
  useEffect(() => {
    document.title = localizedTitle;
    const setMeta = (attribute, name, content) => {
      let meta = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.append(meta);
      }
      meta.content = content;
    };
    setMeta('name', 'description', localizedDescription);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('property', 'og:title', localizedTitle);
    setMeta('property', 'og:description', localizedDescription);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'AURA Prime Real Estate');
  }, [localizedTitle, localizedDescription, noindex]);
  return null;
}
