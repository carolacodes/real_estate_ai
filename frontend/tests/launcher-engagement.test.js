import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { createLauncherEngagement, launcherTiming, nudgeStorageKey } from '../src/components/chat/launcherEngagement.js';

function clock() {
  let now = 0, sequence = 0;
  const pending = new Map();
  return {
    schedule(callback, delay) { const id = ++sequence; pending.set(id, { at: now + delay, callback }); return id; },
    cancel: id => pending.delete(id),
    advance(duration) {
      const end = now + duration;
      for (;;) {
        const next = [...pending].sort((a, b) => a[1].at - b[1].at || a[0] - b[0]).find(([, job]) => job.at <= end);
        if (!next) break;
        const [id, job] = next;
        now = job.at; pending.delete(id); job.callback();
      }
      now = end;
    },
    get pending() { return pending.size; },
  };
}
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function harness(options = {}) {
  const time = clock();
  const session = options.storage || storage();
  const store = createLauncherEngagement({ storage: session, schedule: time.schedule, cancel: time.cancel, ...options });
  return { time, session, store };
}

test('closed launcher shows its first nudge after 6s, hides after 5s and rotates after an 18s gap', () => {
  const { time, store } = harness();
  store.setOpen(false);
  time.advance(5999);
  assert.equal(store.getSnapshot().messageIndex, null);
  time.advance(1);
  assert.equal(store.getSnapshot().messageIndex, 0);
  time.advance(5000);
  assert.equal(store.getSnapshot().messageIndex, null);
  time.advance(17999);
  assert.equal(store.getSnapshot().messageIndex, null);
  time.advance(1);
  assert.equal(store.getSnapshot().messageIndex, 1);
});
test('open chat has no nudges or bounce and leaves no timers running', () => {
  const { time, store } = harness();
  store.setOpen(true);
  time.advance(120000);
  assert.deepEqual(store.getSnapshot(), { messageIndex: null, bouncing: false });
  assert.equal(time.pending, 0);
});
test('clicking/opening hides the active nudge immediately; closing resumes after 16s', () => {
  const { time, store } = harness();
  store.setOpen(false);
  time.advance(6000);
  assert.equal(store.getSnapshot().messageIndex, 0);
  store.pause();
  assert.equal(store.getSnapshot().messageIndex, null);
  assert.equal(time.pending, 0);
  store.setOpen(true);
  time.advance(30000);
  store.setOpen(false);
  time.advance(15999);
  assert.equal(store.getSnapshot().messageIndex, null);
  time.advance(1);
  assert.equal(store.getSnapshot().messageIndex, 1);
});
test('four nudges exhaust the session limit, including across component remounts', () => {
  const { time, session, store } = harness();
  const displayed = [];
  let previous = null;
  store.subscribe(() => {
    const current = store.getSnapshot().messageIndex;
    if (current !== null && current !== previous) displayed.push(current);
    previous = current;
  });
  store.setOpen(false);
  time.advance(180000);
  assert.deepEqual(displayed, [0, 1, 2, 3]);
  assert.equal(session.getItem(nudgeStorageKey), String(launcherTiming.maximum));
  assert.equal(time.pending, 0);
  const remounted = harness({ storage: session });
  remounted.store.setOpen(false);
  remounted.time.advance(60000);
  assert.deepEqual(remounted.store.getSnapshot(), { messageIndex: null, bouncing: false });
  assert.equal(remounted.time.pending, 0);
});
test('blocked storage retains an in-memory cap; malformed storage does not break scheduling', () => {
  for (const session of [{ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } }, { getItem: () => 'invalid', setItem() {} }]) {
    const { time, store } = harness({ storage: session });
    let shown = 0, previous = null;
    store.subscribe(() => {
      const current = store.getSnapshot().messageIndex;
      if (current !== null && current !== previous) shown++;
      previous = current;
    });
    store.setOpen(false);
    time.advance(180000);
    assert.equal(shown, 4);
    assert.equal(time.pending, 0);
  }
});
test('lack of mobile space/hidden page skips nudges without consuming the session quota', () => {
  let allowed = false;
  const { time, store, session } = harness({ canNudge: () => allowed, canBounce: () => allowed });
  store.setOpen(false);
  time.advance(6000);
  assert.equal(store.getSnapshot().messageIndex, null);
  assert.equal(session.getItem(nudgeStorageKey), null);
  allowed = true;
  time.advance(18000);
  assert.equal(store.getSnapshot().messageIndex, 0);
  allowed = false;
  store.refresh();
  assert.equal(store.getSnapshot().messageIndex, null);
});
test('bounce runs once for 650ms every 16s, and stops immediately when chat opens', () => {
  const { time, store } = harness();
  store.setOpen(false);
  time.advance(16000);
  assert.equal(store.getSnapshot().bouncing, true);
  time.advance(650);
  assert.equal(store.getSnapshot().bouncing, false);
  time.advance(15350);
  assert.equal(store.getSnapshot().bouncing, true);
  store.setOpen(true);
  assert.equal(store.getSnapshot().bouncing, false);
  assert.equal(time.pending, 0);
});
test('reduced motion disables bounce while preserving timed nudges; runtime changes stop animation', () => {
  let reduced = true;
  const { time, store } = harness({ reducedMotion: () => reduced });
  store.setOpen(false);
  time.advance(6000);
  assert.equal(store.getSnapshot().messageIndex, 0);
  time.advance(10000);
  assert.equal(store.getSnapshot().bouncing, false);
  reduced = false;
  time.advance(16000);
  assert.equal(store.getSnapshot().bouncing, true);
  reduced = true;
  store.refresh();
  assert.equal(store.getSnapshot().bouncing, false);
});
test('unmount cleanup clears nudge and bounce timers', () => {
  const { time, store } = harness();
  store.setOpen(false);
  time.advance(6000);
  store.stop();
  time.advance(60000);
  assert.deepEqual(store.getSnapshot(), { messageIndex: null, bouncing: false });
  assert.equal(time.pending, 0);
});

let vite, ChatNudge, ChatLauncher, Provider;
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ default: ChatNudge } = await vite.ssrLoadModule('/src/components/chat/ChatNudge.jsx'));
  ({ default: ChatLauncher } = await vite.ssrLoadModule('/src/components/chat/ChatLauncher.jsx'));
  ({ default: Provider } = await vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'));
});
after(async () => { await vite?.close(); });
const render = (Component, props, language) => renderToStaticMarkup(createElement(Provider, { initialLanguage: language }, createElement(Component, props)));
test('nudge renders the current UI language and null renders nothing', () => {
  assert.match(render(ChatNudge, { messageIndex: 0 }, 'en'), /Looking for something in Dubai/);
  assert.match(render(ChatNudge, { messageIndex: 0 }, 'es'), /¿Buscás algo en Dubái/);
  assert.match(render(ChatNudge, { messageIndex: 1 }, 'es'), /Decime tu presupuesto y te muestro opciones/);
  assert.equal(render(ChatNudge, { messageIndex: null }, 'es'), '');
});
test('open launcher preserves its accessible controls and has no nudge or bounce', () => {
  const html = render(ChatLauncher, { open: true }, 'en');
  assert.match(html, /aria-label="Minimize AI Property Advisor"/);
  assert.match(html, /aria-expanded="true" aria-controls="aura-ai-concierge-window"/);
  assert.doesNotMatch(html, /chat-nudge|chat-launcher-bounce/);
});
test('bounce/pulse CSS is motion-gated, single bounce has no loop and reduced mode only allows fade', async () => {
  const css = await readFile(new URL('../src/components/chat/chat.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.chat-launcher-bounce/);
  assert.match(css, /aura-launcher-bounce 650ms [^;]+ 1;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.chat-nudge \{ animation: aura-nudge-fade/);
});
