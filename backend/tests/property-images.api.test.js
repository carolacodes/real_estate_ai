import 'dotenv/config';
import { test, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.SUPABASE_URL ||= 'http://127.0.0.1:9';
process.env.SUPABASE_SECRET_KEY ||= 'test-only-key';
const { default: app } = await import('../app.js');
const { supabase } = await import('../libs/supabase.js');
let server;
let baseUrl;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}/api/properties`;
});
after(async () => { await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); });

// These values are local fixtures, never uploaded or written to Supabase.
for (const count of [0, 1, 4]) {
  test(`all property endpoints preserve image_urls with ${count} images`, async () => {
    const images = Array.from({ length: count }, (_, index) => `https://example.test/image-${index + 1}.jpg`);
    const row = { id: 'fixture', slug: 'image-fixture', available: true, featured: true, image_urls: images };
    const replacement = mock.method(supabase, 'from', () => ({
      select() { return this; }, eq() { return this; }, order() { return this; },
      range() { return Promise.resolve({ data: [row], count: 1, error: null }); },
      limit() { return Promise.resolve({ data: [row], error: null }); },
      maybeSingle() { return Promise.resolve({ data: row, error: null }); },
    }));
    try {
      for (const path of ['', '/search', '/featured', '/image-fixture']) {
        const response = await fetch(baseUrl + path);
        assert.equal(response.status, 200);
        const body = await response.json();
        const property = Array.isArray(body.data) ? body.data[0] : body.data;
        assert.deepEqual(property.image_urls, images);
        assert.equal(Object.hasOwn(property, 'image_url'), false);
        assert.equal(property.slug, row.slug);
      }
    } finally { replacement.mock.restore(); }
  });
}
