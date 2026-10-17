import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

let vite;
let PropertyCard;
let PropertyGallery;
let getPrimaryPropertyImage;
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  ({ default: PropertyCard } = await vite.ssrLoadModule('/src/components/property/PropertyCard.jsx'));
  ({ default: PropertyGallery } = await vite.ssrLoadModule('/src/components/property/PropertyGallery.jsx'));
  ({ getPrimaryPropertyImage } = await vite.ssrLoadModule('/src/utils/property.js'));
});
after(async () => { await vite?.close(); });

for (const count of [0, 1, 4]) {
  test(`card and gallery render correctly with ${count} images`, () => {
    const images = Array.from({ length: count }, (_, index) => `https://example.test/image-${index + 1}.jpg`);
    const property = { slug: 'fixture', project_name: 'Fixture Residence', image_urls: images, bedrooms: 0 };
    assert.equal(getPrimaryPropertyImage(property), images[0] || null);
    const card = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PropertyCard, { property })));
    if (count) {
      assert.ok(card.includes(`src="${images[0]}"`));
      for (const image of images.slice(1)) assert.ok(!card.includes(`src="${image}"`));
    } else {
      assert.ok(card.includes('property-placeholder'));
      assert.equal((card.match(/<img\b/g) || []).length, 0);
    }
    assert.ok(card.includes('href="/properties/fixture"'));
    assert.ok(card.includes('Studio'));
    const gallery = renderToStaticMarkup(createElement(PropertyGallery, { images, title: property.project_name }));
    assert.equal((gallery.match(/<img\b/g) || []).length, count);
    assert.equal((gallery.match(/role="img"/g) || []).length, 4 - count);
    const renderedSources = [...gallery.matchAll(/<img[^>]*src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(renderedSources, images);
  });
}
test('missing image_urls preserves the primary placeholder', () => {
  assert.equal(getPrimaryPropertyImage({}), null);
  assert.equal(getPrimaryPropertyImage(null), null);
});
test('gallery displays no more than four images', () => {
  const images = Array.from({ length: 5 }, (_, index) => `https://example.test/image-${index + 1}.jpg`);
  const gallery = renderToStaticMarkup(createElement(PropertyGallery, { images }));
  assert.equal((gallery.match(/<img\b/g) || []).length, 4);
  assert.ok(!gallery.includes(`src="${images[4]}"`));
});
