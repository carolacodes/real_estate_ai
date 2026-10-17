import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildPropertyImagePlan, buildPropertyImagePrompts } from '../utils/property-image-prompts.js';

const defaultDataDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../data');
const columns = 'slug,project_name,featured,property_type,bedrooms,bathrooms,area_sqft,address,city,country,furnishing,completion_status';

export function parseArguments(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { mode: 'help' };
  if (args.length === 0 || (args.length === 1 && args[0] === '--plan-only')) return { mode: 'plan-only' };
  if (args.length === 2 && args[0] === '--slug' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args[1])) return { mode: 'slug', slug: args[1] };
  if (args.length === 1 && ['--featured-only', '--all'].includes(args[0])) return { mode: args[0].slice(2) };
  throw new Error('Use exactly one mode: --plan-only, --slug <slug>, --featured-only or --all.');
}

async function readProperties(client) {
  const rows = [];
  const pageSize = 1000;
  try {
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await client.from('properties').select(columns).order('slug').range(offset, offset + pageSize - 1);
      if (error || !Array.isArray(data)) throw new Error();
      rows.push(...data);
      if (data.length < pageSize) return rows;
    }
  } catch {
    throw new Error('Could not read properties from Supabase. No generation, uploads or updates attempted.');
  }
}

/** Only SELECT remotely; output files are local plans, never image files. */
export async function preparePropertyImages({ client, mode = 'plan-only', slug, dataDirectory = defaultDataDirectory, log = console.log }) {
  if (!['plan-only', 'slug', 'featured-only', 'all'].includes(mode)) throw new Error('Invalid preparation mode.');
  const plan = buildPropertyImagePlan(await readProperties(client));
  const selected = mode === 'plan-only' ? [] : plan.properties.filter(entry => mode === 'all' || (mode === 'featured-only' ? entry.featured : entry.slug === slug));
  if (mode === 'slug' && selected.length !== 1) throw new Error('Unknown property slug. No local files prepared.');
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(join(dataDirectory, 'property-image-plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  log(`Plan: ${JSON.stringify(plan.summary)}`);
  log(`Featured slugs: ${plan.properties.filter(entry => entry.featured).map(entry => entry.slug).join(', ')}`);
  for (const entry of selected) {
    await mkdir(join(dataDirectory, 'property-images', entry.slug), { recursive: true });
    await mkdir(join(dataDirectory, 'property-image-prompts'), { recursive: true });
    const images = buildPropertyImagePrompts(entry);
    const promptSet = { ...entry, status: 'awaiting-human-review; no images generated', images };
    await writeFile(join(dataDirectory, 'property-image-prompts', `${entry.slug}.json`), `${JSON.stringify(promptSet, null, 2)}\n`);
    log(`\n${entry.slug}: ${entry.imageCount} images planned, 0 generated.`);
    for (const image of images) log(`\n--- ${image.filename}: ${image.imageType} ---\nReferences: ${image.referencePaths.join(', ')}\n${image.prompt}`);
  }
  log(`Prepared ${selected.length} properties locally. No Storage access, generation or database updates.`);
  return { plan, selectedSlugs: selected.map(entry => entry.slug) };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.mode === 'help') {
    console.log('node scripts/preparePropertyImages.js [--plan-only | --slug <slug> | --featured-only | --all]\nPlanning only: no generation, uploads or database updates.');
    return;
  }
  await import('dotenv/config');
  const { supabase } = await import('../libs/supabase.js');
  await preparePropertyImages({ client: supabase, ...options });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
