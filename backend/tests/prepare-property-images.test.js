import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildPropertyImagePlan, buildPropertyImagePrompts, IMAGE_TYPES } from '../utils/property-image-prompts.js';
import { parseArguments, preparePropertyImages } from '../scripts/preparePropertyImages.js';

const property = { slug: 'pilot-apartment', project_name: 'Pilot', featured: true, property_type: 'Apartment', bedrooms: 2, bathrooms: 2, area_sqft: 1000, address: 'Dubai Marina', city: 'Dubai', country: 'UAE', furnishing: 'Furnished', completion_status: 'Ready' };
const standard = { ...property, slug: 'standard-villa', featured: false, property_type: 'Villa' };
const promptsFor = overrides => buildPropertyImagePrompts(buildPropertyImagePlan([{ ...property, ...overrides }]).properties[0]);
function readOnlyClient(rows) {
  return {
    from(table) {
      assert.equal(table, 'properties');
      return {
        select(columns) { assert.ok(!columns.includes('image_urls')); return this; },
        order(column) { assert.equal(column, 'slug'); return this; },
        async range(start, end) { return { data: rows.slice(start, end + 1), error: null }; },
        update() { assert.fail('No remote updates allowed'); },
      };
    },
    get storage() { assert.fail('No Storage access allowed'); },
  };
}
async function directory(t) {
  const path = await mkdtemp(join(tmpdir(), 'property-preparation-'));
  t.after(() => rm(path, { recursive: true, force: true }));
  return path;
}

test('6 featured and 54 standard yield 78 planned images without hardcoded counts', () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({ ...property, slug: `property-${i}`, featured: i < 6 }));
  const plan = buildPropertyImagePlan(rows);
  assert.deepEqual(plan.summary, { totalProperties: 60, featured: 6, standard: 54, totalImages: 78 });
  assert.deepEqual(plan.properties.find(p => p.featured).imageTypes, IMAGE_TYPES);
  assert.deepEqual(plan.properties.find(p => !p.featured).imageTypes, ['exterior']);
  assert.equal(buildPropertyImagePlan([standard]).summary.totalImages, 1);
});
test('filenames, roles, reference priority and output paths stay in order', () => {
  const prompts = promptsFor({});
  assert.deepEqual(prompts.map(p => p.filename), ['01.webp', '02.webp', '03.webp', '04.webp']);
  assert.deepEqual(prompts.map(p => p.imageType), IMAGE_TYPES);
  assert.equal(prompts[3].referencePaths[0], 'data/property-image-references/kitchen.png');
  assert.ok(prompts.every(p => p.outputPath.startsWith('data/property-images/pilot-apartment/')));
});
for (const type of ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Residential Building', 'Villa Compound']) {
  test(`exterior adapts to ${type}`, () => {
    const prompt = promptsFor({ property_type: type })[0].prompt;
    assert.ok(prompt.includes(`"property_type":"${type}"`));
    assert.match(prompt, /Scene: A contemporary/);
  });
}
test('Studio uses a shared sleeping zone and a compact kitchenette', () => {
  const prompts = promptsFor({ bedrooms: 0, area_sqft: 400 });
  assert.match(prompts[1].prompt, /do not depict a separate bedroom/);
  assert.match(prompts[2].prompt, /sleeping zone of the same open-plan studio/);
  assert.match(prompts[3].prompt, /compact kitchenette/);
  assert.ok(prompts.every(p => p.prompt.includes('"bedrooms":0')));
});
test('Unfurnished and Off-Plan remain explicit and do not assert completed real photos', () => {
  const prompts = promptsFor({ furnishing: 'Unfurnished', completion_status: 'Off-Plan' });
  assert.ok(prompts.every(p => p.prompt.includes('no loose furniture, beds, sofas')));
  assert.ok(prompts.every(p => p.prompt.includes('not documentary evidence')));
  assert.ok(prompts.every(p => p.prompt.includes('No identifiable landmarks')));
  assert.ok(prompts.every(p => p.prompt.includes('not an authentic photograph')));
});
test('missing facts are marked unknown instead of inferred', () => {
  const prompt = promptsFor({ bathrooms: undefined, furnishing: null, completion_status: null })[0].prompt;
  assert.match(prompt, /"bathrooms":null/);
  assert.match(prompt, /Furnishing is unverified/);
  assert.ok(!prompt.includes('undefined'));
});
test('rejects unsafe slugs, duplicates and ambiguous featured values', () => {
  assert.throws(() => buildPropertyImagePlan([{ ...property, slug: '../escape' }]), /Invalid property slug/);
  assert.throws(() => buildPropertyImagePlan([property, property]), /Duplicate slug/);
  assert.throws(() => buildPropertyImagePlan([{ ...property, featured: 'false' }]), /Invalid featured/);
});
test('CLI defaults to plan-only and rejects combined/unknown modes', () => {
  assert.deepEqual(parseArguments([]), { mode: 'plan-only' });
  assert.deepEqual(parseArguments(['--slug', property.slug]), { mode: 'slug', slug: property.slug });
  assert.deepEqual(parseArguments(['--featured-only']), { mode: 'featured-only' });
  assert.deepEqual(parseArguments(['--all']), { mode: 'all' });
  for (const args of [['--all', '--featured-only'], ['--slug'], ['--slug', '../escape'], ['--upload']]) assert.throws(() => parseArguments(args));
});
for (const [mode, expected] of [['plan-only', []], ['slug', [property.slug]], ['featured-only', [property.slug]], ['all', [property.slug, standard.slug]]]) {
  test(`${mode}: only selected folders prepared; no generated images or remote writes`, async t => {
    const dataDirectory = await directory(t);
    const logs = [];
    const result = await preparePropertyImages({ client: readOnlyClient([property, standard]), mode, slug: property.slug, dataDirectory, log: value => logs.push(value) });
    assert.deepEqual(result.selectedSlugs, expected);
    const manifest = JSON.parse(await readFile(join(dataDirectory, 'property-image-plan.json'), 'utf8'));
    assert.equal(manifest.summary.totalProperties, 2);
    for (const slug of expected) {
      assert.deepEqual(await readdir(join(dataDirectory, 'property-images', slug)), []);
      const set = JSON.parse(await readFile(join(dataDirectory, 'property-image-prompts', `${slug}.json`), 'utf8'));
      assert.equal(set.images.length, slug === property.slug ? 4 : 1);
      assert.ok(set.images.length <= 4);
      assert.ok(set.images.every(image => logs.some(line => line.includes(image.prompt))));
    }
    if (!expected.length) await assert.rejects(readdir(join(dataDirectory, 'property-images')), { code: 'ENOENT' });
  });
}
test('unknown slug aborts before writing a manifest or creating folders', async t => {
  const dataDirectory = await directory(t);
  await assert.rejects(preparePropertyImages({ client: readOnlyClient([property]), mode: 'slug', slug: 'missing', dataDirectory, log: () => {} }), /Unknown property slug/);
  assert.deepEqual(await readdir(dataDirectory), []);
});
test('repeated preparation preserves existing local image bytes', async t => {
  const dataDirectory = await directory(t);
  await mkdir(join(dataDirectory, 'property-images', property.slug), { recursive: true });
  const path = join(dataDirectory, 'property-images', property.slug, '01.webp');
  await writeFile(path, 'existing fixture bytes');
  for (let i = 0; i < 2; i++) await preparePropertyImages({ client: readOnlyClient([property]), mode: 'slug', slug: property.slug, dataDirectory, log: () => {} });
  assert.equal(await readFile(path, 'utf8'), 'existing fixture bytes');
  assert.deepEqual(await readdir(join(dataDirectory, 'property-images', property.slug)), ['01.webp']);
});
test('read failure is sanitized and produces no local files', async t => {
  const dataDirectory = await directory(t);
  const client = { from() { throw new Error('private transport detail'); } };
  await assert.rejects(preparePropertyImages({ client, dataDirectory }), error => !error.message.includes('private transport detail') && error.message.includes('Could not read'));
  assert.deepEqual(await readdir(dataDirectory), []);
});
