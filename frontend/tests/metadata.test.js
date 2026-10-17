import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { readFile } from 'node:fs/promises';
import { pageMetadata, propertyMetadata } from '../src/utils/metadata.js';

test('each public page has its own title and description; 404 is noindex', () => {
  const titles = Object.values(pageMetadata).map(page => page.title);
  assert.equal(new Set(titles).size, titles.length);
  for (const page of Object.values(pageMetadata)) {
    assert.ok(page.description.length > 30);
    assert.ok(page.title.includes('AURA'));
  }
  assert.equal(pageMetadata.notFound.noindex, true);
});

test('property metadata describes only supplied facts, formats Studio and AED', () => {
  const metadata = propertyMetadata({ project_name: 'Actual Project', property_type: 'Apartment', address: 'Dubai Marina', bedrooms: 0, price: 1250000 });
  assert.equal(metadata.title, 'Actual Project | AURA Prime Real Estate');
  assert.equal(metadata.description, `Apartment · Dubai Marina · Studio · AED\u00a01,250,000`);
  assert.equal(metadata.noindex, undefined);
  const sparse = propertyMetadata({ project_name: 'Actual Project' });
  assert.ok(!sparse.description.includes('Dubai'));
  assert.ok(!sparse.description.includes('AED'));
  assert.ok(!sparse.description.includes('Studio'));
});

test('loading/missing property pages cannot retain metadata from a previous property', () => {
  assert.equal(propertyMetadata(null).noindex, true);
  assert.equal(propertyMetadata(null, { error: true }).noindex, true);
  assert.equal(propertyMetadata(null, { notFound: true }).title, 'Property Not Found | AURA Prime Real Estate');
});

let vite;
before(async () => { vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' }); });
after(async () => { await vite?.close(); });
test('404 renders navigation and two real recovery links, with one h1', async () => {
  const { default: NotFound } = await vite.ssrLoadModule('/src/pages/NotFound.jsx');
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(NotFound)));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Page not found\./);
  assert.match(html, /href="\/"[^>]*>Back Home/);
  assert.match(html, /href="\/properties"[^>]*>Explore Properties/);
  assert.match(html, /<header/); assert.match(html, /<footer/);
});

test('document defaults include branding/metadata without fabricated domain or company facts', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const token of ['charset="UTF-8"', 'name="viewport"', 'name="theme-color"', 'name="description"', 'name="robots"', 'property="og:title"', 'property="og:description"', 'href="/favicon.svg"']) assert.ok(html.includes(token), token);
  assert.ok(!html.includes('vite.svg'));
  assert.ok(!html.includes('rel="canonical"'));
  const icon = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
  assert.ok(icon.length < 1000);
  assert.match(icon, /viewBox="0 0 32 32"/);
});
