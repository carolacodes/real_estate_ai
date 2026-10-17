import { useEffect, useId, useRef, useState } from 'react';
import useTranslation from './useTranslation.js';

const languages = [{ code: 'en', label: 'English' }, { code: 'es', label: 'Español' }];
const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-main/15';

export default function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const options = useRef([]);
  const nextFocus = useRef(0);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    options.current[nextFocus.current]?.focus();
    const closeOutside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function closeAndFocus() {
    setOpen(false);
    trigger.current?.focus();
  }

  function openMenu(index = languages.findIndex(item => item.code === language)) {
    nextFocus.current = index;
    setOpen(true);
  }

  function handleKeys(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      closeAndFocus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const current = options.current.indexOf(document.activeElement);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? languages.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + languages.length) % languages.length;
      if (open) options.current[index]?.focus();
      else openMenu(event.key === 'ArrowUp' ? languages.length - 1 : 0);
    }
  }

  return <div ref={root} className="relative shrink-0" onKeyDown={handleKeys}>
    <button ref={trigger} type="button" aria-label={t('Choose language')} aria-haspopup="menu"
      aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => open ? setOpen(false) : openMenu()}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 bg-surface font-label-sm text-label-sm text-text-main transition-colors hover:bg-surface-subtle hover:border-outline-variant ${open ? 'border-outline-variant bg-surface-subtle' : 'border-border'} ${focusStyle}`}>
      <span>{language.toUpperCase()}</span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && <div id={menuId} role="menu" aria-label={t('Choose language')}
      className="absolute right-0 top-full z-10 mt-2 w-36 rounded-lg border border-border bg-surface p-1 shadow-sm">
      {languages.map(({ code, label }, index) => <button key={code} ref={element => { options.current[index] = element; }}
        type="button" role="menuitemradio" aria-checked={language === code} lang={code} tabIndex={-1}
        onClick={() => { setLanguage(code); closeAndFocus(); }}
        className={`flex w-full items-center justify-between rounded-DEFAULT px-3 py-2 text-left font-label-sm text-label-sm text-text-main hover:bg-surface-subtle focus:bg-surface-subtle ${language === code ? 'bg-surface-subtle font-semibold' : ''} ${focusStyle}`}>
        {label}<span aria-hidden="true" className="w-4 text-center">{language === code ? '✓' : ''}</span>
      </button>)}
    </div>}
  </div>;
}
