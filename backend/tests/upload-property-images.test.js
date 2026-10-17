import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { uploadPropertyImages } from '../scripts/uploadPropertyImages.js';

// Minimal format markers for validation tests only; every Storage call is mocked.
const webpFixture = Buffer.from('RIFF\u0004\u0000\u0000\u0000WEBP', 'ascii');
function mockSupabase(rows, { failUpload, failUpdate = false, publicBucket = true } = {}) {
  const calls = { uploads: [], updates: [], events: [], buckets: 0 };
  const client = {
    from(table) {
      assert.equal(table, 'properties');
      return {
        select(columns) { assert.equal(columns, 'slug,image_urls'); return this; },
        order(column) { assert.equal(column, 'slug'); return this; },
        async range(start, end) { return { data: rows.slice(start, end + 1), error: null }; },
        update(payload) {
          assert.deepEqual(Object.keys(payload), ['image_urls']);
          assert.ok(payload.image_urls.length <= 4);
          calls.updates.push(payload);
          return { eq(column, slug) {
            assert.equal(column, 'slug');
            calls.events.push(`update:${slug}`);
            return { async select(column) {
              assert.equal(column, 'slug');
              return { data: failUpdate ? null : rows.filter(row => row.slug === slug), error: failUpdate ? { message: 'test database failure' } : null };
            } };
          } };
        },
      };
    },
    storage: {
      async getBucket(name) { assert.equal(name, 'property-images'); calls.buckets++; return { data: { public: publicBucket }, error: null }; },
      from(name) {
        assert.equal(name, 'property-images');
        return {
          getPublicUrl(path) { return { data: { publicUrl: `https://example.test/storage/v1/object/public/property-images/${path}` } }; },
          async upload(path, bytes, options) {
            calls.events.push(`upload:${path}`);
            calls.uploads.push({ path, bytes, options });
            return { error: path === failUpload ? { message: 'test upload failure' } : null };
          },
        };
      },
    },
  };
  return { client, calls };
}
async function localFolder(t, names = [], slug = 'fixture-one') {
  const directory = await mkdtemp(join(tmpdir(), 'property-upload-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, slug));
  for (const name of names) await writeFile(join(directory, slug, name), webpFixture);
  return directory;
}
const rows = [{ slug: 'fixture-one', image_urls: [] }];
const invoke = (directory, mock, dryRun = false) => uploadPropertyImages({ directory, client: mock.client, dryRun, log: () => {} });

for (const count of [0, 1, 2, 3, 4]) {
  test(`upload plan supports ${count} local images`, async t => {
    const names = Array.from({ length: count }, (_, index) => `0${index + 1}.webp`).reverse();
    const directory = await localFolder(t, names);
    const mock = mockSupabase(rows);
    const result = await invoke(directory, mock);
    assert.equal(result.counts[count], 1);
    assert.equal(mock.calls.uploads.length, count);
    assert.equal(mock.calls.updates.length, count ? 1 : 0);
    assert.equal(result.updated, count ? 1 : 0);
    if (count) {
      const expectedPaths = names.toSorted().map(name => `fixture-one/${name}`);
      assert.deepEqual(mock.calls.uploads.map(upload => upload.path), expectedPaths);
      assert.deepEqual(mock.calls.updates[0].image_urls, expectedPaths.map(path => `https://example.test/storage/v1/object/public/property-images/${path}`));
      assert.deepEqual(mock.calls.events, [...expectedPaths.map(path => `upload:${path}`), 'update:fixture-one']);
      assert.ok(mock.calls.uploads.every(upload => upload.options.upsert === true && upload.options.contentType === 'image/webp'));
      assert.equal(new Set(mock.calls.updates[0].image_urls).size, count);
    }
  });
}
for (const [name, names, pattern] of [
  ['more than 4', ['01.webp', '02.webp', '03.webp', '04.webp', '05.webp'], /More than 4/],
  ['invalid extension', ['01.jpg'], /Invalid file/],
  ['unrecognized filename', ['05.webp'], /Invalid file/],
]) {
  test(`preflight rejects ${name} without any writes`, async t => {
    const directory = await localFolder(t, names);
    const mock = mockSupabase(rows);
    await assert.rejects(invoke(directory, mock), pattern);
    assert.equal(mock.calls.uploads.length, 0);
    assert.equal(mock.calls.updates.length, 0);
  });
}
test('unknown property folders are reported before any upload', async t => {
  const directory = await localFolder(t, ['01.webp']);
  await mkdir(join(directory, 'unknown-property'));
  const mock = mockSupabase(rows);
  await assert.rejects(invoke(directory, mock), /Unknown property slug: unknown-property/);
  assert.equal(mock.calls.uploads.length, 0);
  assert.equal(mock.calls.updates.length, 0);
});
test('dry-run displays planned uploads/URLs but never uploads or updates', async t => {
  const directory = await localFolder(t, ['04.webp', '02.webp', '01.webp', '03.webp']);
  const mock = mockSupabase(rows);
  const messages = [];
  const result = await uploadPropertyImages({ directory, client: mock.client, dryRun: true, log: message => messages.push(message) });
  assert.equal(result.planned, 1);
  assert.equal(result.updated, 0);
  assert.equal(result.uploaded, 0);
  assert.equal(mock.calls.uploads.length, 0);
  assert.equal(mock.calls.updates.length, 0);
  assert.equal(messages.filter(message => message.startsWith('Would upsert')).length, 4);
  assert.ok(messages.some(message => message.startsWith('Would update only properties.image_urls for fixture-one:')));
});
test('upload failure leaves image_urls untouched and continues safely', async t => {
  const directory = await localFolder(t, ['01.webp', '02.webp', '03.webp', '04.webp']);
  await mkdir(join(directory, 'fixture-two'));
  await writeFile(join(directory, 'fixture-two', '01.webp'), webpFixture);
  const mock = mockSupabase([...rows, { slug: 'fixture-two', image_urls: [] }], { failUpload: 'fixture-one/02.webp' });
  const result = await invoke(directory, mock);
  assert.equal(result.errors.length, 1);
  assert.equal(result.updated, 1);
  assert.equal(mock.calls.updates.length, 1);
  assert.deepEqual(mock.calls.events.filter(event => event.startsWith('update:')), ['update:fixture-two']);
});
test('empty property folder never clears existing image_urls', async t => {
  const directory = await localFolder(t);
  const mock = mockSupabase([{ slug: 'fixture-one', image_urls: ['https://example.test/existing.webp'] }]);
  await invoke(directory, mock);
  assert.equal(mock.calls.updates.length, 0);
});
test('re-running uses upsert and reconstructs ordered URLs without duplicates', async t => {
  const directory = await localFolder(t, ['04.webp', '01.webp']);
  const mock = mockSupabase(rows);
  await invoke(directory, mock);
  await invoke(directory, mock);
  assert.deepEqual(mock.calls.updates[0], mock.calls.updates[1]);
  assert.equal(mock.calls.updates[1].image_urls.length, 2);
  assert.ok(mock.calls.uploads.every(upload => upload.options.upsert === true));
});
test('invalid WebP content is rejected before writes', async t => {
  const directory = await localFolder(t, ['01.webp']);
  await writeFile(join(directory, 'fixture-one', '01.webp'), 'not an image');
  const mock = mockSupabase(rows);
  await assert.rejects(invoke(directory, mock), /Invalid WebP content/);
  assert.equal(mock.calls.uploads.length, 0);
});
test('database update failure is reported after complete uploads', async t => {
  const directory = await localFolder(t, ['01.webp', '02.webp']);
  const mock = mockSupabase(rows, { failUpdate: true });
  const result = await invoke(directory, mock);
  assert.equal(result.errors.length, 1);
  assert.equal(result.updated, 0);
  assert.equal(mock.calls.uploads.length, 2);
  assert.equal(mock.calls.updates[0].image_urls.length, 2);
});
test('private bucket cannot receive uploads from the script', async t => {
  const directory = await localFolder(t, ['01.webp']);
  const mock = mockSupabase(rows, { publicBucket: false });
  await assert.rejects(invoke(directory, mock), /must exist and be public/);
  assert.equal(mock.calls.uploads.length, 0);
});

test('selected slugs exclude an existing pilot from dry-run and real writes', async t => {
  const directory = await localFolder(t, ['01.webp'], 'pilot');
  await mkdir(join(directory, 'pending'));
  await writeFile(join(directory, 'pending', '01.webp'), webpFixture);
  const properties = [{ slug: 'pilot', image_urls: ['existing'] }, { slug: 'pending', image_urls: [] }];
  const dry = mockSupabase(properties);
  const logs = [];
  const plan = await uploadPropertyImages({ directory, client: dry.client, slugs: ['pending'], dryRun: true, log: text => logs.push(text) });
  assert.equal(plan.planned, 1);
  assert.equal(plan.skipped, 1);
  assert.ok(!logs.join('\n').includes('pilot'));
  assert.equal(dry.calls.uploads.length, 0);
  const real = mockSupabase(properties);
  await uploadPropertyImages({ directory, client: real.client, slugs: ['pending'], log: () => {} });
  assert.deepEqual(real.calls.uploads.map(call => call.path), ['pending/01.webp']);
  assert.deepEqual(real.calls.events, ['upload:pending/01.webp', 'update:pending']);
});
test('unknown or empty slug selection aborts before writes', async t => {
  const directory = await localFolder(t, ['01.webp']);
  for (const slugs of [['missing'], []]) {
    const mock = mockSupabase(rows);
    await assert.rejects(uploadPropertyImages({ directory, client: mock.client, slugs, log: () => {} }), /Every selected slug must exist/);
    assert.equal(mock.calls.uploads.length, 0);
    assert.equal(mock.calls.updates.length, 0);
  }
});
