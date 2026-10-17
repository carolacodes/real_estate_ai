import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { createChatAssistantStore, toApiMessages } from '../src/hooks/chatAssistantStore.js';
import { readChatStream } from '../src/api/chatStream.js';

const property = { slug: 'actual-residence', project_name: 'Inventory Residence', price: 1250000, bedrooms: 0, bathrooms: 1, area_sqft: 650, address: 'Dubai Marina', property_type: 'Apartment', furnishing: 'Furnished', completion_status: 'Ready', image_urls: ['https://example.test/actual.webp', 'https://example.test/second.webp'] };
const answer = { message: 'These properties match your search.', properties: [property] };
function harness() {
  const requests = [];
  const store = createChatAssistantStore((messages, callbacks) => new Promise((resolve, reject) => {
    requests.push({ messages, ...callbacks, resolve, reject });
  }));
  return { store, requests };
}
let vite;
let ChatPanel;
let ChatPropertyCard;
let QuickPrompts;
let streamChatMessage;
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ default: ChatPanel } = await vite.ssrLoadModule('/src/components/chat/ChatPanel.jsx'));
  ({ default: ChatPropertyCard } = await vite.ssrLoadModule('/src/components/chat/ChatPropertyCard.jsx'));
  ({ default: QuickPrompts } = await vite.ssrLoadModule('/src/components/chat/QuickPrompts.jsx'));
  ({ streamChatMessage } = await vite.ssrLoadModule('/src/api/chat.api.js'));
});
after(async () => { await vite?.close(); });
const render = (component, props) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(component, props)));

test('send appends user and empty assistant immediately; chunks update progressively and results render', async () => {
  const { store, requests } = harness();
  const pending = store.sendMessage('Find a Studio');
  assert.equal(store.getSnapshot().state, 'searching');
  assert.equal(store.getSnapshot().messages[0].content, 'Find a Studio');
  assert.equal(store.getSnapshot().messages[1].content, '');
  assert.deepEqual(requests[0].messages, [{ role: 'user', content: 'Find a Studio' }]);
  assert.match(render(ChatPanel, store.getSnapshot()), /Searching available listings/);
  requests[0].onChunk('These ', 'These ');
  assert.equal(store.getSnapshot().state, 'streaming');
  assert.equal(store.getSnapshot().messages[1].content, 'These ');
  assert.match(render(ChatPanel, store.getSnapshot()), /These /);
  requests[0].onChunk('properties', 'These properties');
  assert.equal(store.getSnapshot().messages[1].content, 'These properties');
  requests[0].resolve(answer);
  await pending;
  assert.equal(store.getSnapshot().state, 'success');
  assert.deepEqual(store.getSnapshot().messages[1].properties, [property]);
  const html = render(ChatPanel, store.getSnapshot());
  assert.match(html, /Inventory Residence/);
  assert.match(html, /actual\.webp/);
});

test('quick prompts invoke the exact same send function as the composer', async () => {
  const { store, requests } = harness();
  const props = { prompts: ['Furnished in Dubai Marina'], onSelect: store.sendMessage };
  const html = render(QuickPrompts, props);
  assert.match(html, /Furnished in Dubai Marina/);
  const pending = props.onSelect(props.prompts[0]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].messages[0].content, props.prompts[0]);
  requests[0].resolve(answer);
  await pending;
  // Both visual entry points receive the same hook function from ChatPanel.
  const panel = render(ChatPanel, { ...store.getSnapshot(), onSend: store.sendMessage });
  assert.match(panel, /Send query/);
});

test('next request includes complete prior turns, without visual fields', async () => {
  const { store, requests } = harness();
  const first = store.sendMessage('Two bedrooms'); requests[0].resolve(answer); await first;
  const next = store.sendMessage('Make it furnished');
  assert.deepEqual(requests[1].messages, [
    { role: 'user', content: 'Two bedrooms' },
    { role: 'assistant', content: answer.message },
    { role: 'user', content: 'Make it furnished' },
  ]);
  assert.equal(store.sendMessage('Concurrent duplicate'), undefined);
  assert.equal(requests.length, 2);
  requests[1].resolve({ message: 'What is your budget?', properties: [] }); await next;
  assert.equal(store.getSnapshot().messages.length, 4);
  assert.equal(store.getSnapshot().messages[3].properties.length, 0);
});

test('error renders alert; retry replaces failed attempt and preserves prior context', async () => {
  const { store, requests } = harness();
  const first = store.sendMessage('Studio'); requests[0].resolve(answer); await first;
  const failed = store.sendMessage('In Marina');
  requests[1].onChunk('Partial', 'Partial');
  requests[1].reject(new Error('private provider detail')); await failed;
  assert.equal(store.getSnapshot().state, 'error');
  const html = render(ChatPanel, store.getSnapshot());
  assert.match(html, /role="alert"/); assert.match(html, /Try again/);
  assert.ok(!html.includes('private provider detail'));
  const retry = store.retry();
  assert.deepEqual(requests[2].messages, requests[1].messages);
  assert.equal(store.getSnapshot().messages.length, 4);
  assert.equal(store.getSnapshot().messages.at(-1).content, '');
  requests[2].resolve(answer); await retry;
  assert.equal(store.getSnapshot().state, 'success');
});

test('reset aborts active request, clears history/results and ignores late chunks/completion', async () => {
  const { store, requests } = harness();
  const pending = store.sendMessage('Find a home');
  store.reset();
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(store.getSnapshot().state, 'welcome');
  assert.deepEqual(store.getSnapshot().messages, []);
  requests[0].onChunk('late', 'late'); requests[0].resolve(answer); await pending;
  assert.deepEqual(store.getSnapshot().messages, []);
  assert.equal(store.retry(), undefined);
});

test('unmount cleanup aborts and stale responses cannot overwrite a new request', async () => {
  const { store, requests } = harness();
  const old = store.sendMessage('Old request'); store.abort();
  assert.equal(requests[0].signal.aborted, true);
  store.reset(); const current = store.sendMessage('New request');
  requests[0].resolve(answer); await old;
  assert.equal(store.getSnapshot().state, 'searching');
  requests[1].resolve(answer); await current;
  assert.equal(store.getSnapshot().messages[0].content, 'New request');
});

test('context stays inside backend limits while all visual history remains in memory', () => {
  const messages = Array.from({ length: 25 }, (_, id) => ({ role: id % 2 ? 'assistant' : 'user', content: 'a'.repeat(4100), status: 'complete', id }));
  const api = toApiMessages(messages);
  assert.ok(api.length <= 19);
  assert.ok(api.every(message => message.content.length <= 4000));
  assert.ok(api.reduce((count, message) => count + message.content.length, 0) <= 20000);
  assert.equal(api[0].role, 'user'); assert.equal(api.at(-1).role, 'user');
  assert.equal(messages.length, 25);
});

test('real card formats AED and Studio, uses image_urls[0], and navigates to slug and inquiry anchor', () => {
  const html = render(ChatPropertyCard, { property });
  assert.match(html, /Studio/); assert.match(html, /AED/); assert.match(html, /1,250,000/);
  assert.match(html, /src="https:\/\/example.test\/actual.webp"/);
  assert.ok(!html.includes('second.webp'));
  assert.match(html, /href="\/properties\/actual-residence"/);
  assert.match(html, /href="\/properties\/actual-residence#inquiry-card"/);
  assert.match(html, /View Property/); assert.match(html, /Schedule Viewing/);
  assert.ok(!html.includes('Dossier'));
  const fallback = render(ChatPropertyCard, { property: { ...property, image_urls: [] } });
  assert.match(fallback, /property-placeholder/); assert.ok(!fallback.includes('<img'));
});

const event = (name, data) => `event: ${name}\r\ndata: ${JSON.stringify(data)}\r\n\r\n`;
function sse(text, chunkSize = 1) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (let i = 0; i < bytes.length; i += chunkSize) controller.enqueue(bytes.slice(i, i + chunkSize));
    controller.close();
  } }), { headers: { 'content-type': 'text/event-stream' } });
}

test('SSE parser handles byte-split Unicode, CRLF, multiple frames, and structured properties', async () => {
  const chunks = []; const results = [];
  const response = await readChatStream(sse(event('start', {}) + event('text-delta', { text: '¡Hola 🏡' }) + event('text-delta', { text: ' Marina!' }) + event('properties', { properties: [property] }) + event('done', {})), {
    onChunk: (chunk, full) => chunks.push([chunk, full]), onProperties: properties => results.push(properties),
  });
  assert.deepEqual(chunks, [['¡Hola 🏡', '¡Hola 🏡'], [' Marina!', '¡Hola 🏡 Marina!']]);
  assert.deepEqual(response, { message: '¡Hola 🏡 Marina!', properties: [property] });
  assert.deepEqual(results, [[property]]);
});

for (const [name, response] of [
  ['HTTP failure', new Response('', { status: 500 })],
  ['old text-only server', new Response('hello', { headers: { 'content-type': 'text/plain' } })],
  ['truncated stream', sse(event('text-delta', { text: 'Partial' }))],
  ['server error event', sse(event('error', { message: 'private internal details' }))],
  ['malformed event', sse('event: text-delta\ndata: bad json\n\n')],
]) test(`SSE rejects ${name}`, async () => { await assert.rejects(readChatStream(response)); });

test('API layer sends only role/content, requests SSE and forwards cancellation', async () => {
  const original = globalThis.fetch; let request;
  globalThis.fetch = async (url, options) => {
    request = { url, ...options };
    return sse(event('text-delta', { text: 'Hello' }) + event('properties', { properties: [] }) + event('done', {}), 500);
  };
  try {
    const controller = new AbortController(); const chunks = [];
    const result = await streamChatMessage([{ role: 'user', content: 'Hi', id: 3, time: '12:00', image: 'not-for-api' }], { signal: controller.signal, onChunk: text => chunks.push(text) });
    assert.ok(request.url.endsWith('/api/chat/stream')); assert.equal(request.method, 'POST');
    assert.equal(request.headers.Accept, 'text/event-stream');
    assert.deepEqual(JSON.parse(request.body), { messages: [{ role: 'user', content: 'Hi' }] });
    assert.equal(request.signal, controller.signal); assert.deepEqual(chunks, ['Hello']);
    assert.equal(result.message, 'Hello');
  } finally { globalThis.fetch = original; }
});

test('production chat contains no result mocks or preview actions', async () => {
  await assert.rejects(access(new URL('../src/components/chat/chatMockData.js', import.meta.url)));
  for (const file of ['AIPropertyAssistant.jsx', 'ChatPanel.jsx', 'ChatPropertyCard.jsx', 'ChatInput.jsx']) {
    const source = await readFile(new URL(`../src/components/chat/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /mockProperties|mockResponse|onPreviewAction|Sample results only|Property Dossier|Private Broker Protocol/);
  }
});
