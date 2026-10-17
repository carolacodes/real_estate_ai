import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { readPropertyQuery } from '../src/utils/propertyQuery.js';

let vite, SelectDropdown, Search, Filters, Provider;
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ default: SelectDropdown } = await vite.ssrLoadModule('/src/components/ui/SelectDropdown.jsx'));
  ({ default: Search } = await vite.ssrLoadModule('/src/components/property/PropertySearchBar.jsx'));
  ({ default: Filters } = await vite.ssrLoadModule('/src/components/property/PropertyFilters.jsx'));
  ({ default: Provider } = await vite.ssrLoadModule('/src/i18n/LanguageContext.jsx'));
});
after(async () => { await vite?.close(); });
function render(Component, props = {}, language = 'en') {
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Provider, { initialLanguage: language }, createElement(Component, props))));
}

test('dropdown has a labelled button, listbox semantics, selected text and no native select', () => {
  const html = render(SelectDropdown, { id: 'area', label: 'Area', value: 'marina', options: [{ value: 'marina', label: 'Dubai Marina' }] });
  assert.match(html, /<label id="area-label" for="area"/);
  assert.match(html, /aria-haspopup="listbox" aria-expanded="false"/);
  assert.match(html, /aria-labelledby="area-label area-value"/);
  assert.match(html, />Dubai Marina<\/span>/);
  assert.doesNotMatch(html, /<select|<option/);
});
test('dropdown uses supplied translations, supports empty placeholder and disabled form values', () => {
  const html = render(SelectDropdown, { name: 'propertyType', label: 'Tipo de propiedad', placeholder: 'Cualquiera', disabled: true, options: [] });
  assert.match(html, />Tipo de propiedad<\/label>/);
  assert.match(html, />Cualquiera<\/span>/);
  assert.match(html, /<button[^>]*disabled=""/);
  assert.match(html, /<input type="hidden"[^>]*disabled=""[^>]*name="propertyType"/);
});
test('Home preserves the four original FormData names and empty defaults in English and Spanish', () => {
  for (const language of ['en', 'es']) {
    const html = render(Search, {}, language);
    for (const name of ['location', 'propertyType', 'maxPrice', 'bedrooms']) {
      assert.ok(html.includes(`name="${name}" value=""`), name);
    }
    assert.equal((html.match(/aria-haspopup="listbox"/g) || []).length, 4);
    assert.match(html, /type="submit"/);
    assert.doesNotMatch(html, /<select/);
    assert.ok(html.includes(language === 'es' ? 'Todas las zonas' : 'All Enclaves'));
  }
});
test('Properties preserves URL filter values, sort and pagination while translating their presentation', () => {
  const params = new URLSearchParams('location=Dubai+Marina&propertyType=Apartment&minPrice=500000&bedrooms=0&bathrooms=2&furnishing=Furnished&completionStatus=Off-Plan&sort=price_asc&page=3&limit=24');
  const before = params.toString();
  const query = readPropertyQuery(params);
  const html = render(Filters, { ...query, count: 0 }, 'es');
  assert.equal(params.toString(), before);
  assert.equal(query.page, 3);
  assert.equal(query.limit, 24);
  assert.equal(query.filters.bedrooms, 0);
  assert.equal(query.filters.furnishing, 'Furnished');
  assert.match(html, /id="filter-bathrooms-value"[^>]*>2</);
  assert.match(html, /id="filter-furnishing-value"[^>]*>Amueblado</);
  assert.match(html, /id="filter-completionStatus-value"[^>]*>Sobre plano</);
  assert.match(html, /id="sort-selector-value"[^>]*>Precio: menor a mayor</);
  assert.equal((html.match(/aria-haspopup="listbox"/g) || []).length, 4);
  assert.doesNotMatch(html, /<select/);
});
test('Properties keeps numeric values outside the preset bathroom options visible', () => {
  const html = render(Filters, { filters: { bathrooms: 9 }, sort: 'newest', count: 0 });
  assert.match(html, /id="filter-bathrooms-value"[^>]*>9</);
});
