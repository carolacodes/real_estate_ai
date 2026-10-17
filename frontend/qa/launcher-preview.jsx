// Development-only browser harness, excluded from the production entry/build.
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import LanguageProvider from '../src/i18n/LanguageContext.jsx';
import LanguageSelector from '../src/i18n/LanguageSelector.jsx';
import AIPropertyAssistant from '../src/components/chat/AIPropertyAssistant.jsx';
import { nudgeStorageKey } from '../src/components/chat/launcherEngagement.js';
import launcherCss from '../src/components/chat/chat.css?raw';
import '../src/index.css';

const nativeMatchMedia = window.matchMedia.bind(window);
export default function Preview() {
  const [revision, setRevision] = useState(0);
  const [reduced, setReduced] = useState(false);
  function restart() {
    sessionStorage.removeItem(nudgeStorageKey);
    setRevision(value => value + 1);
  }
  function emulateReducedMotion(event) {
    const enabled = event.target.checked;
    window.matchMedia = query => query.includes('prefers-reduced-motion') && enabled
      ? { media: query, matches: query.includes(': reduce)'), addEventListener() {}, removeEventListener() {} }
      : nativeMatchMedia(query);
    setReduced(enabled);
    restart();
  }
  // Only the media conditions are replaced; the real launcher CSS declarations are used.
  const emulatedCss = reduced ? launcherCss.replaceAll('(prefers-reduced-motion: no-preference)', '(max-width: 0px)')
    .replaceAll('(prefers-reduced-motion: reduce)', '(min-width: 0px)') : '';
  return <LanguageProvider><BrowserRouter>
    <style>{emulatedCss}</style>
    <main className="max-w-xl p-6 space-y-6">
      <h1 className="font-headline-sm text-headline-sm">Launcher QA</h1>
      <p>Development preview. Reset the test session to repeat the real 6-second nudge delay. No chat message is sent.</p>
      <button type="button" className="rounded-lg border border-border px-4 py-2 bg-surface" onClick={restart}>Reset nudge session</button>
      <label className="flex gap-2"><input type="checkbox" checked={reduced} onChange={emulateReducedMotion} />Emulate reduced motion</label>
      <LanguageSelector />
      <p role="status">{reduced ? 'Reduced motion emulation on' : 'System motion preference'}</p>
      <input aria-label="Typing suppression test" placeholder="Focus to suppress nudges" className="w-full border border-border p-2" />
    </main>
    <AIPropertyAssistant key={revision} />
  </BrowserRouter></LanguageProvider>;
}
