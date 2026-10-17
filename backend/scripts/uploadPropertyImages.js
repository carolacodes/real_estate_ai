import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PROPERTY_IMAGES_BUCKET = 'property-images';
const filenames = ['01.webp', '02.webp', '03.webp', '04.webp'];
const defaultDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../data/property-images');

async function getProperties(client) {
  const properties = [];
  const pageSize = 1000;
  try {
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await client.from('properties').select('slug,image_urls').order('slug').range(offset, offset + pageSize - 1);
      if (error || !Array.isArray(data)) throw new Error();
      properties.push(...data);
      if (data.length < pageSize) return properties;
    }
  } catch {
    throw new Error('Could not read properties from Supabase. No uploads started.');
  }
}

async function planUploads(directory, properties) {
  const knownSlugs = new Set(properties.map(property => property.slug));
  const plans = new Map();
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if (error.code === 'ENOENT') return plans;
    throw new Error('Could not read the local property-images directory.');
  }
  for (const entry of entries) {
    if (entry.name === '.gitkeep' && entry.isFile()) continue;
    if (!entry.isDirectory()) throw new Error(`Unexpected entry in property-images: ${entry.name}. No uploads started.`);
    const slug = entry.name;
    if (!knownSlugs.has(slug)) throw new Error(`Unknown property slug: ${slug}. No uploads started.`);
    const folder = join(directory, slug);
    const files = await readdir(folder, { withFileTypes: true });
    if (files.length > 4) throw new Error(`More than 4 files in ${slug}. No uploads started.`);
    for (const file of files) {
      if (!file.isFile() || !filenames.includes(file.name)) throw new Error(`Invalid file in ${slug}: ${file.name}. Only 01.webp through 04.webp are allowed. No uploads started.`);
    }
    const images = [];
    for (const filename of filenames) {
      if (!files.some(file => file.name === filename)) continue;
      const bytes = await readFile(join(folder, filename));
      if (bytes.length < 12 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`Invalid WebP content in ${slug}/${filename}. No uploads started.`);
      images.push({ filename, path: join(folder, filename) });
    }
    plans.set(slug, images);
  }
  return plans;
}

/** Preflight all folders before writes. Inject the existing server-side client in CLI/tests. */
export async function uploadPropertyImages({ client, directory = defaultDirectory, dryRun = false, slugs, log = console.log }) {
  const properties = await getProperties(client);
  if (slugs !== undefined && (!Array.isArray(slugs) || !slugs.length || slugs.some(slug => !properties.some(property => property.slug === slug)))) {
    throw new Error('Every selected slug must exist. No uploads started.');
  }
  const plans = await planUploads(directory, properties);
  if (slugs) for (const slug of plans.keys()) if (!slugs.includes(slug)) plans.delete(slug);
  const summary = { dryRun, totalProperties: properties.length, counts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }, uploaded: 0, updated: 0, planned: 0, skipped: 0, errors: [] };
  for (const property of properties) summary.counts[plans.get(property.slug)?.length || 0]++;
  if (![...plans.values()].some(images => images.length > 0)) {
    summary.skipped = properties.length;
    log('No local images found. No uploads or property updates.');
    log(JSON.stringify(summary));
    return summary;
  }
  let bucket;
  try {
    const result = await client.storage.getBucket(PROPERTY_IMAGES_BUCKET);
    if (result.error || result.data?.public !== true) throw new Error();
    bucket = client.storage.from(PROPERTY_IMAGES_BUCKET);
  } catch {
    throw new Error('The property-images bucket must exist and be public. No uploads started.');
  }
  for (const property of properties) {
    const images = plans.get(property.slug) || [];
    if (images.length === 0) { summary.skipped++; continue; }
    // Construct final URLs without writing anything. File names are already sorted.
    const urls = images.map(({ filename }) => {
      const result = bucket.getPublicUrl(`${property.slug}/${filename}`);
      if (!result.data?.publicUrl) throw new Error('Could not construct a public image URL.');
      return result.data.publicUrl;
    });
    if (new Set(urls).size !== urls.length) throw new Error('Duplicate public image URLs; upload stopped.');
    if (dryRun) {
      summary.planned++;
      for (const image of images) log(`Would upsert ${PROPERTY_IMAGES_BUCKET}/${property.slug}/${image.filename}`);
      log(`Would update only properties.image_urls for ${property.slug}: ${JSON.stringify(urls)}`);
      continue;
    }
    try {
      for (const { filename, path } of images) {
        const bytes = await readFile(path);
        const { error } = await bucket.upload(`${property.slug}/${filename}`, bytes, { contentType: 'image/webp', upsert: true });
        if (error) throw new Error(`Upload failed for ${property.slug}/${filename}.`);
        summary.uploaded++;
      }
      // A single row update happens only after ALL uploads for this property succeed.
      const { data, error } = await client.from('properties').update({ image_urls: urls }).eq('slug', property.slug).select('slug');
      if (error || data?.length !== 1) throw new Error(`Could not update image_urls for ${property.slug}.`);
      summary.updated++;
      log(`Updated ${property.slug}: ${urls.length} images.`);
    } catch {
      // Successful uploads/upserts may remain in Storage. Never delete them automatically.
      const message = `Failed processing ${property.slug}; no partial image_urls update was submitted. Uploaded objects were not deleted. Retry after checking Storage and database access.`;
      summary.errors.push(message);
      log(message);
    }
  }
  log(JSON.stringify(summary));
  return summary;
}

async function main() {
  const args = process.argv.slice(2);
  const slugs = [];
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--slug' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args[i + 1] ?? '')) slugs.push(args[++i]);
    else throw new Error('Usage: node scripts/uploadPropertyImages.js [--dry-run] [--slug <slug> ...]');
  }
  await import('dotenv/config');
  const key = process.env.SUPABASE_SECRET_KEY;
  let serviceRole = key?.startsWith('sb_secret_');
  if (!serviceRole && key) {
    try { serviceRole = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'service_role'; } catch { /* Reject unrecognized credentials. */ }
  }
  if (!serviceRole) throw new Error('SUPABASE_SECRET_KEY must be a server-side service-role credential.');
  // Use the project's existing server-only Supabase configuration. Never print keys.
  const { supabase } = await import('../libs/supabase.js');
  const result = await uploadPropertyImages({ client: supabase, dryRun, slugs: slugs.length ? slugs : undefined });
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
