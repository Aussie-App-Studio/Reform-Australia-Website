import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'src', 'data', 'auLocations.json');

const SOURCE_URLS = [
  'https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.json',
  'https://www.matthewproctor.com/Content/postcodes/australian_postcodes.json',
];

const STATES = ['NSW', 'ACT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'NT'];
const STATE_INDEX = Object.fromEntries(STATES.map((code, idx) => [code, idx]));

function normalizeLocalityKey(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[,./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function roundCoord(value) {
  return Math.round(value * 1000) / 1000;
}

async function fetchDataset() {
  let lastError = null;
  for (const url of SOURCE_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      if (!Array.isArray(json) || json.length === 0) {
        throw new Error('Unexpected payload shape (expected non-empty array)');
      }
      console.log(`Fetched ${json.length} rows from ${url}`);
      return json;
    } catch (err) {
      lastError = err;
      console.warn(`Failed to fetch ${url}: ${err.message}`);
    }
  }
  throw new Error(`Unable to fetch Australian postcodes dataset: ${lastError?.message}`);
}

async function main() {
  const rows = await fetchDataset();

  const byPostcode = new Map();
  for (const row of rows) {
    const pc = String(row.postcode ?? '').trim().padStart(4, '0');
    const st = String(row.state ?? '').trim().toUpperCase();
    if (!/^\d{4}$/.test(pc) || !(st in STATE_INDEX)) continue;

    const latPrecise = Number(row.Lat_precise);
    const lngPrecise = Number(row.Long_precise);
    const latFallback = Number(row.lat);
    const lngFallback = Number(row.long);

    const hasPrecise =
      Number.isFinite(latPrecise) &&
      Number.isFinite(lngPrecise) &&
      latPrecise !== 0 &&
      lngPrecise !== 0;
    const hasFallback =
      Number.isFinite(latFallback) &&
      Number.isFinite(lngFallback) &&
      latFallback !== 0 &&
      lngFallback !== 0;

    if (!hasPrecise && !hasFallback) continue;

    const lat = hasPrecise ? latPrecise : latFallback;
    const lng = hasPrecise ? lngPrecise : lngFallback;
    const locality = normalizeLocalityKey(row.locality);
    const type = String(row.type ?? '').trim();

    if (!byPostcode.has(pc)) byPostcode.set(pc, []);
    byPostcode.get(pc).push({ locality, state: st, lat, lng, type });
  }

  const postcodesOut = {};
  for (const [pc, entries] of [...byPostcode.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const deliveryEntries = entries.filter((e) => e.type === 'Delivery Area');
    const used = deliveryEntries.length > 0 ? deliveryEntries : entries;

    const lat = roundCoord(median(used.map((e) => e.lat)));
    const lng = roundCoord(median(used.map((e) => e.lng)));

    const stateCounts = new Map();
    for (const entry of used) {
      stateCounts.set(entry.state, (stateCounts.get(entry.state) ?? 0) + 1);
    }
    const primaryState = [...stateCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

    postcodesOut[pc] = [lat, lng, STATE_INDEX[primaryState]];
  }

  const byLocality = new Map();
  for (const [pc, entries] of byPostcode.entries()) {
    for (const entry of entries) {
      if (!entry.locality) continue;
      if (!byLocality.has(entry.locality)) byLocality.set(entry.locality, new Map());
      const stateMap = byLocality.get(entry.locality);
      const prev = stateMap.get(entry.state);
      const isDelivery = entry.type === 'Delivery Area';

      if (
        !prev ||
        (isDelivery && !prev.isDelivery) ||
        (isDelivery === prev.isDelivery && pc < prev.pc)
      ) {
        stateMap.set(entry.state, { pc, isDelivery });
      }
    }
  }

  const localitiesOut = {};
  for (const [locality, stateMap] of [...byLocality.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const pcs = [...stateMap.values()].map((v) => v.pc).sort();
    localitiesOut[locality] = pcs.length === 1 ? pcs[0] : pcs;
  }

  const payload = JSON.stringify({ s: STATES, p: postcodesOut, l: localitiesOut });
  await writeFile(OUTPUT_PATH, payload, 'utf8');

  const gzipped = gzipSync(payload);
  console.log(
    `Wrote ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}: ` +
      `${Object.keys(postcodesOut).length} postcodes, ` +
      `${Object.keys(localitiesOut).length} localities ` +
      `(${(payload.length / 1024).toFixed(1)} KB raw / ${(gzipped.length / 1024).toFixed(1)} KB gzipped).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
