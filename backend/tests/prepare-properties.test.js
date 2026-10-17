import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import csv from 'csv-parser';
import { fileURLToPath } from 'node:url';

test('dataset preparation exports PostgreSQL empty arrays without changing property data', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'property-images-'));
  const input = join(dir, 'input.csv');
  const output = join(dir, 'output.csv');
  try {
    await writeFile(input, 'project_name,price,bedrooms,bathrooms,area_sqft,country,city,address,property_type,purpose,furnishing,completion_status,handover\nTest Residence,1000000,0,1,624,UAE,Dubai,Dubai Marina,Apartment,Sale,Furnished,Ready,Q2 2027\n');
    await promisify(execFile)(process.execPath, [fileURLToPath(new URL('../scripts/prepareSupabaseProperties.js', import.meta.url)), input, output]);
    const rows = [];
    await new Promise((resolve, reject) => {
      createReadStream(output).pipe(csv()).on('data', row => rows.push(row)).on('error', reject).on('end', resolve);
    });
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0], {
      slug: 'test-residence-apartment-1', price: '1000000', bedrooms: '0', bathrooms: '1', area_sqft: '624',
      country: 'UAE', city: 'Dubai', address: 'Dubai Marina', property_type: 'Apartment', purpose: 'Sale',
      furnishing: 'Furnished', completion_status: 'Ready', handover: 'Q2 2027', project_name: 'Test Residence',
      image_urls: '{}', available: 'true', featured: 'true',
    });
  } finally { await rm(dir, { recursive: true, force: true }); }
});
