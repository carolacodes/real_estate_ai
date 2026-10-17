import { useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './language-context.js';
import { readLanguage, applyLanguage, supportedLanguages } from './core.js';

export default function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(() => {
    if (supportedLanguages.includes(initialLanguage)) return initialLanguage;
    try { return readLanguage(globalThis.localStorage); } catch { return 'en'; }
  });
  useEffect(() => {
    let storage;
    try { storage = globalThis.localStorage; } catch { /* Browser storage may be unavailable. */ }
    applyLanguage(language, storage, globalThis.document);
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage: next => {
    if (supportedLanguages.includes(next)) setLanguageState(next);
  } }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
