import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CHECK_EXTERNAL_LINKS = process.argv.includes('--links');

const errors = [];
const warnings = [];

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function readJson(relPath) {
  const full = path.join(ROOT, relPath);
  const raw = fs.readFileSync(full, 'utf8');
  return JSON.parse(raw);
}

function validateMagicBytes(fullPath) {
  const buf = fs.readFileSync(fullPath);
  if (buf.length === 0) {
    errors.push(`Empty asset file: ${path.relative(ROOT, fullPath)}`);
    return;
  }
  const lower = fullPath.toLowerCase();
  if (lower.endsWith('.pdf') && !buf.subarray(0, 5).toString('utf8').startsWith('%PDF-')) {
    errors.push(`Invalid PDF magic bytes: ${path.relative(ROOT, fullPath)}`);
  } else if (lower.endsWith('.docx') && !(buf[0] === 0x50 && buf[1] === 0x4b)) {
    errors.push(`Invalid DOCX magic bytes: ${path.relative(ROOT, fullPath)}`);
  } else if ((lower.endsWith('.jpg') || lower.endsWith('.jpeg')) && !(buf[0] === 0xff && buf[1] === 0xd8)) {
    errors.push(`Invalid JPEG magic bytes: ${path.relative(ROOT, fullPath)}`);
  } else if (lower.endsWith('.png') && !(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) {
    errors.push(`Invalid PNG magic bytes: ${path.relative(ROOT, fullPath)}`);
  } else if (
    lower.endsWith('.webp') &&
    !(
      buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buf.subarray(8, 12).toString('ascii') === 'WEBP'
    )
  ) {
    errors.push(`Invalid WEBP magic bytes: ${path.relative(ROOT, fullPath)}`);
  }
}

// 1. Validate JSON files in src/data/ and public/documents/
for (const file of fs.readdirSync(path.join(SRC_DIR, 'data'))) {
  if (!file.endsWith('.json')) continue;
  try {
    readJson(path.join('src/data', file));
  } catch (err) {
    errors.push(`Invalid JSON in src/data/${file}: ${err.message}`);
  }
}

for (const docJson of [
  'public/documents/index.json',
  'public/documents/search-index.json',
  'public/documents/sync-meta.json',
  'public/documents/Church Order/crca-book-of-order-2022.json',
]) {
  try {
    readJson(docJson);
  } catch (err) {
    errors.push(`Invalid JSON in ${docJson}: ${err.message}`);
  }
}

// 2. Load core indexes & validate document references
const docsIndex = readJson('public/documents/index.json');
const docMap = new Map();
for (const cat of docsIndex.categories || []) {
  for (const grp of cat.groups || []) {
    for (const item of grp.items || []) {
      docMap.set(item.id, item);
      const mdPath = path.join(PUBLIC_DIR, 'documents', item.path);
      if (!fs.existsSync(mdPath)) {
        errors.push(`Missing document markdown in public/documents/: ${item.path}`);
      } else {
        validateMagicBytes(mdPath);
      }
      if (item.pdfPath) {
        const pdfPath = path.join(PUBLIC_DIR, 'documents', item.pdfPath);
        if (!fs.existsSync(pdfPath)) {
          errors.push(`Missing document PDF in public/documents/: ${item.pdfPath}`);
        } else {
          validateMagicBytes(pdfPath);
        }
      }
    }
  }
}

const srcFiles = walkFiles(SRC_DIR);

/** File text to scan for links. In JSON data, ignore reviewer-only notes ("source", "sources", "needsChecking"). */
function scannableText(file) {
  const txt = fs.readFileSync(file, "utf8");
  if (!file.endsWith(".json")) return txt;
  return JSON.stringify(JSON.parse(txt), (key, value) => (["source", "sources", "needsChecking"].includes(key) ? undefined : value));
}

// Check DOC_IDS in src/lib/crcaDocs/client.ts
const clientText = fs.readFileSync(path.join(SRC_DIR, 'lib/crcaDocs/client.ts'), 'utf8');
const docIdsBlock = clientText.match(/export const DOC_IDS = \{([\s\S]*?)\} as const;/);
if (!docIdsBlock) {
  errors.push('Could not locate DOC_IDS block in src/lib/crcaDocs/client.ts');
} else {
  for (const m of docIdsBlock[1].matchAll(/:\s*'([^']+)'/g)) {
    if (!docMap.has(m[1])) {
      errors.push(`DOC_IDS entry not found in public/documents/index.json: ${m[1]}`);
    }
  }
}

// Check hardcoded /for-churches/forms-and-documents/<id> links
const docLinkRe = /\/for-churches\/forms-and-documents\/([a-z0-9-]+)(?:#([a-z0-9-]+))?/gi;
for (const file of srcFiles) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(docLinkRe)) {
    const [, id, hash] = m;
    const doc = docMap.get(id);
    if (!doc) {
      errors.push(`Unknown doc ID "${id}" referenced in ${path.relative(ROOT, file)}`);
    } else if (hash && !(doc.headings || []).some((h) => h.slug === hash)) {
      errors.push(`Unknown doc heading slug "#${hash}" for "${id}" in ${path.relative(ROOT, file)}`);
    }
  }
}

// Check beliefs.json readerDocIds
const beliefs = readJson('src/data/beliefs.json');
for (const entry of [...(beliefs.ecumenicalCreeds || []), ...(beliefs.reformedConfessions || [])]) {
  if (!docMap.has(entry.readerDocId)) {
    errors.push(`Broken beliefs.json readerDocId "${entry.readerDocId}" (${entry.id})`);
  }
}

// 3. Validate contact topic links
const contactTopics = readJson('src/data/contactTopics.json');
const topicIds = new Set(contactTopics.map((t) => t.id));
for (const file of srcFiles) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(/\/contact\?topic=([a-z0-9-]+)/gi)) {
    if (!topicIds.has(m[1])) {
      errors.push(`Unknown contact topic "${m[1]}" in ${path.relative(ROOT, file)}`);
    }
  }
}

// 4. Ministry pages (src/data/ministry-pages/*.json) + "one platform" rule
const ministries = readJson('src/data/ministries.json');
const MINISTRY_DIR = path.join(SRC_DIR, 'data', 'ministry-pages');
let ministryPageCount = 0;
for (const file of fs.readdirSync(MINISTRY_DIR).filter((x) => x.endsWith('.json'))) {
  const rel = `src/data/ministry-pages/${file}`;
  const page = readJson(rel);
  ministryPageCount++;
  for (const key of ['slug', 'name', 'group', 'summary', 'body']) {
    if (!page[key]) errors.push(`${rel}: missing "${key}"`);
  }
  if (page.slug && `${page.slug}.json` !== file) errors.push(`${rel}: slug "${page.slug}" does not match file name`);
  const images = [
    page.hero?.src,
    ...(page.body || []).map((x) => x.image?.src),
    ...(page.gallery || []).map((g) => g.src),
    ...(page.team || []).map((t) => t.photo),
    ...(page.news || []).map((n) => n.image),
  ].filter(Boolean);
  for (const src of images) {
    if (!fs.existsSync(path.join(PUBLIC_DIR, decodeURIComponent(src)))) errors.push(`${rel}: missing image ${src}`);
  }
  const ids = new Set();
  for (const n of page.news || []) {
    if (ids.has(n.id)) errors.push(`${rel}: duplicate news id ${n.id}`);
    ids.add(n.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.date || '')) errors.push(`${rel}: news "${n.id}" has invalid date "${n.date}"`);
  }
}

// One platform: no links to other CRCA websites (their content now lives here).
// Congregations' own websites (churches.json) and email addresses are fine.
const CRCA_SITE_RE = /https?:\/\/(?:[a-z0-9-]+\.)*(?:crca\.org\.au|crcaconvention\.au|safechurchcrca\.org\.au|ministryformation\.com\.au|gospel\.net\.au)\b[^"'\s)]*/gi;
for (const file of srcFiles) {
  const relPath = path.relative(ROOT, file);
  if (/churches\.json$/.test(relPath)) continue;
  const txt = scannableText(file);
  for (const m of txt.matchAll(CRCA_SITE_RE)) {
    errors.push(`Link to another CRCA website (${m[0]}) in ${relPath}: bring that content into this site instead`);
  }
}

const iconText = fs.readFileSync(path.join(SRC_DIR, 'components/MinistryIcon.tsx'), 'utf8');
const iconMapMatch = iconText.match(/const iconMap = \{([\s\S]*?)\} as const;/);
if (!iconMapMatch) {
  errors.push('Could not parse iconMap in src/components/MinistryIcon.tsx');
} else {
  const validIcons = new Set(
    iconMapMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  for (const m of ministries) {
    if (!validIcons.has(m.iconName)) errors.push(`Missing MinistryIcon "${m.iconName}" for ministry ${m.id}`);
  }
  for (const t of contactTopics) {
    if (!validIcons.has(t.iconName)) errors.push(`Missing MinistryIcon "${t.iconName}" for contact topic ${t.id}`);
  }
}

// 5. Validate all local assets referenced in src/ and index.html
const localAssetRe = /["'`](\/(?:images|documents|ministry-resources)\/[^"'`]+)["'`]/g;
const checkFilesForAssets = [...srcFiles, path.join(ROOT, 'index.html')];
for (const file of checkFilesForAssets) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const m of txt.matchAll(localAssetRe)) {
    let decoded = m[1];
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // keep raw path
    }
    const target = path.join(PUBLIC_DIR, decoded);
    if (!fs.existsSync(target)) {
      errors.push(`Missing local asset "${m[1]}" referenced in ${path.relative(ROOT, file)}`);
    } else {
      validateMagicBytes(target);
    }
  }
}

// 6. Hygiene assertions: no legacy wp-content URLs, no http:// church websites, no "Canons of Dordt"
const churches = readJson('src/data/churches.json');
for (const c of churches) {
  if (typeof c.website === 'string' && c.website.startsWith('http://')) {
    errors.push(`Non-HTTPS website URL in churches.json for ${c.id}: ${c.website}`);
  }
}

// 6b. Validate Australian postcode & suburb coordinate index (src/data/auLocations.json)
try {
  const auLocations = readJson('src/data/auLocations.json');
  const expectedStates = ['NSW', 'ACT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'NT'];
  if (
    !Array.isArray(auLocations.s) ||
    expectedStates.some((st, i) => auLocations.s[i] !== st)
  ) {
    errors.push('src/data/auLocations.json: invalid or mismatched state table "s"');
  }

  const postcodeEntries = Object.entries(auLocations.p || {});
  const localityCount = Object.keys(auLocations.l || {}).length;
  if (postcodeEntries.length < 3000) {
    errors.push(`src/data/auLocations.json: expected >= 3000 postcodes, found ${postcodeEntries.length}`);
  }
  if (localityCount < 15000) {
    errors.push(`src/data/auLocations.json: expected >= 15000 localities, found ${localityCount}`);
  }

  for (const [pc, entry] of postcodeEntries) {
    if (
      !Array.isArray(entry) ||
      entry.length !== 3 ||
      !Number.isFinite(entry[0]) ||
      !Number.isFinite(entry[1]) ||
      entry[0] === 0 ||
      entry[1] === 0 ||
      typeof entry[2] !== 'number' ||
      entry[2] < 0 ||
      entry[2] >= (auLocations.s?.length ?? 0)
    ) {
      errors.push(`src/data/auLocations.json: invalid coordinate entry for postcode ${pc}`);
      break;
    }
  }

  for (const c of churches) {
    if (!auLocations.p?.[c.postcode]) {
      errors.push(`Church postcode missing from auLocations.json: ${c.postcode} (${c.id})`);
    }
  }

  const criticalPostcodes = [
    '2750', '2560', '3806', '3977', '4509', '4305', '7310', '7320',
    '6230', '4700', '0800', '2000', '3000', '4000', '5000', '6000',
    '7000', '2600',
  ];
  for (const pc of criticalPostcodes) {
    if (!auLocations.p?.[pc]) {
      errors.push(`Critical postcode missing from auLocations.json: ${pc}`);
    }
  }

  const criticalLocalities = [
    'rockhampton', 'penrith', 'berwick', 'north lakes', 'devonport',
    'burnie', 'bunbury', 'sydney', 'melbourne', 'brisbane', 'perth',
    'adelaide', 'hobart', 'canberra', 'darwin',
  ];
  for (const loc of criticalLocalities) {
    if (!auLocations.l?.[loc]) {
      errors.push(`Critical locality missing from auLocations.json: ${loc}`);
    }
  }
} catch (err) {
  errors.push(`Failed to validate src/data/auLocations.json: ${err.message}`);
}

const validHomepageTabs = new Set(['next-gen-families', 'global', 'training-support']);
for (const m of ministries) {
  if (!validHomepageTabs.has(m.homepageTab)) {
    errors.push(`Invalid homepageTab "${m.homepageTab}" for ministry ${m.id}`);
  }
}

for (const file of srcFiles) {
  const txt = scannableText(file);
  if (txt.includes('crca.org.au/wp-content/uploads/')) {
    errors.push(`Legacy WordPress upload URL found in ${path.relative(ROOT, file)}`);
  }
  if (/Canons of Dordt/i.test(txt)) {
    errors.push(`Non-standard spelling "Canons of Dordt" found in ${path.relative(ROOT, file)}`);
  }
  if (txt.includes('#positions-vacant')) {
    errors.push(`Stale anchor "#positions-vacant" found in ${path.relative(ROOT, file)}`);
  }
}

const siteConfigText = fs.readFileSync(path.join(SRC_DIR, 'data/siteConfig.ts'), 'utf8');

// 6c. Safe Church content (public/data/safe-church/, synced by scripts/sync-safe-church.mjs)
let safeChurchPageCount = 0;
let safeChurchPaths = new Set();
try {
  const sc = readJson('public/data/safe-church/content.json');
  safeChurchPaths = new Set(Object.keys(sc.pages));
  safeChurchPageCount = safeChurchPaths.size;
  for (const s of sc.sections) {
    if (!sc.pages[s.path]) errors.push(`Safe Church section page missing: ${s.path}`);
  }
  for (const page of Object.values(sc.pages)) {
    for (const m of page.html.matchAll(/href="\{\{BASE\}\}(data\/)?safe-church\/([^"#]*)/g)) {
      const target = decodeURIComponent(m[2]);
      if (m[1] && !target.startsWith('files/')) errors.push(`Safe Church page "${page.path}" has a bad data link ${target}`);
      if (m[1]) {
        const full = path.join(PUBLIC_DIR, 'data', 'safe-church', target);
        if (!fs.existsSync(full)) errors.push(`Safe Church page "${page.path}" links to missing file ${target}`);
      } else if (target && !sc.pages[target]) {
        errors.push(`Safe Church page "${page.path}" links to unknown page "${target}"`);
      }
    }
    if (page.html.includes('safechurch.crca.org.au/wp-content')) {
      warnings.push(`Safe Church page "${page.path}" still links to a legacy upload on safechurch.crca.org.au`);
    }
  }
  const sitePaths = [
    siteConfigText.match(/childReportPath: '([^']+)'/)?.[1],
    siteConfigText.match(/adultReportPath: '([^']+)'/)?.[1],
  ].filter(Boolean);
  for (const p of sitePaths) {
    if (!sc.pages[p.replace(/^\/safe-church\//, '')]) errors.push(`siteConfig Safe Church path not found: ${p}`);
  }
} catch (err) {
  errors.push(`Failed to validate public/data/safe-church/content.json: ${err.message}`);
}

// 6d. Word of Salvation sermons (public/data/sermons/, synced by scripts/sync-sermons.mjs)
let sermonCount = 0;
try {
  const idx = readJson('public/data/sermons/index.json');
  sermonCount = idx.sermons.length;
  const files = new Set(fs.readdirSync(path.join(PUBLIC_DIR, 'data', 'sermons', 's')).map((f) => f.replace(/\.json$/, '')));
  const ids = new Set();
  for (const s of idx.sermons) {
    if (ids.has(s.id)) errors.push(`Duplicate sermon id ${s.id}`);
    ids.add(s.id);
    if (!files.has(s.id)) errors.push(`Sermon index entry without file: ${s.id}`);
    if (s.p && !idx.preachers[s.p]) errors.push(`Sermon ${s.id} has unknown preacher key ${s.p}`);
  }
  for (const f of files) if (!ids.has(f)) warnings.push(`Orphan sermon file not in index: ${f}.json`);
  if (sermonCount < 1000) errors.push(`Expected 1000+ sermons, found ${sermonCount}`);
} catch (err) {
  errors.push(`Failed to validate public/data/sermons/: ${err.message}`);
}

// 6d2. Top-level public/ folders must not share a name with a page route,
// otherwise static hosts serve the folder instead of the app.
{
  const appText = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf8');
  const topRoutes = new Set([...appText.matchAll(/path="\/([^"/*:]+)/g)].map((m) => m[1]));
  for (const entry of fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })) {
    // public/documents/ is allowed: /documents is redirected by _redirects and .htaccess.
    if (entry.isDirectory() && topRoutes.has(entry.name) && entry.name !== "documents") {
      errors.push(`public/${entry.name}/ clashes with the /${entry.name} page route`);
    }
  }
}

// 6e. Every internal route referenced from data/navigation must resolve to a real page.
{
  const appText = fs.readFileSync(path.join(SRC_DIR, 'App.tsx'), 'utf8');
  const exact = new Set([...appText.matchAll(/path="([^"*:]+)"/g)].map((m) => m[1]));
  const contentPaths = new Set(fs.readdirSync(path.join(SRC_DIR, 'data', 'pages')).filter((x) => x.endsWith('.json')).map((x) => readJson(`src/data/pages/${x}`).path));
  for (const target of Object.values(readJson('src/data/legacyRedirects.json'))) {
    const t = String(target).split('#')[0];
    if (!exact.has(t) && !contentPaths.has(t) && !t.startsWith('/for-churches/forms-and-documents/') && !t.startsWith('/ministries/')) errors.push(`legacyRedirects.json: target ${target} is not a known page`);
  }
  const isKnownRoute = (p) => {
    const clean = p.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (exact.has(clean)) return true;
    if (clean.startsWith('/for-churches/forms-and-documents/')) return true; // validated above by doc ID
    if (clean === '/safe-church') return true;
    if (contentPaths.has(clean)) return true;
    if (clean.startsWith('/safe-church/')) return safeChurchPaths.has(clean.slice('/safe-church/'.length));
    if (clean.startsWith('/sermons/')) return fs.existsSync(path.join(PUBLIC_DIR, 'data', 'sermons', 's', `${clean.slice(9)}.json`));
    return false;
  };
  const routeRefRe = /(?:\bto|"url"|"externalUrl"|\burl|Path)\s*[:=]\s*["'](\/(?!images\/|documents\/|ministry-resources\/|data\/)[^"']*)["']/g;
  for (const file of srcFiles) {
    const rel = path.relative(ROOT, file);
    if (!/src[\\/](data|components|pages)[\\/]/.test(rel)) continue;
    const txt = fs.readFileSync(file, 'utf8');
    for (const m of txt.matchAll(routeRefRe)) {
      if (m[1].includes('${')) continue;
      if (!isKnownRoute(m[1])) errors.push(`Internal link to unknown route "${m[1]}" in ${rel}`);
    }
  }
}

// 7. Optional external link check (--links)
async function checkExternalLinks() {
  const urls = new Map();
  for (const file of walkFiles(path.join(SRC_DIR, 'data'))) {
    if (!file.endsWith('.json')) continue;
    const txt = fs.readFileSync(file, 'utf8');
    for (const m of txt.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
      const u = m[0].replace(/[.,;]+$/, '');
      if (u.includes('facebook.com')) continue;
      if (!urls.has(u)) urls.set(u, []);
      urls.get(u).push(path.relative(ROOT, file));
    }
  }

  console.log(`Checking ${urls.size} non-Facebook external URLs...`);
  const queue = [...urls.entries()];
  const concurrency = 10;

  async function worker() {
    while (queue.length > 0) {
      const [url, sources] = queue.shift();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 9000);
        let res = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          },
        });
        let status = res.status;
        await res.body?.cancel();
        if (status === 405 || status === 403 || status === 400 || status === 501) {
          res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            },
          });
          status = res.status;
          await res.body?.cancel();
        }
        clearTimeout(timer);

        if (status === 404 || status === 410) {
          errors.push(`External URL returned HTTP ${status}: ${url} (${sources.join(', ')})`);
        } else if (status >= 400) {
          warnings.push(`External URL returned HTTP ${status}: ${url} (${sources.join(', ')})`);
        }
      } catch (err) {
        const code = err?.cause?.code || err.name;
        if (code === 'ENOTFOUND') {
          errors.push(`External URL DNS not found (${code}): ${url} (${sources.join(', ')})`);
        } else {
          warnings.push(`External URL check error (${code}): ${url} (${sources.join(', ')})`);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

if (CHECK_EXTERNAL_LINKS) {
  await checkExternalLinks();
}

for (const w of warnings) {
  console.warn(`WARN: ${w}`);
}

if (errors.length > 0) {
  for (const e of errors) {
    console.error(`ERROR: ${e}`);
  }
  console.error(`\nVerification failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(
  `Verification passed: ${docMap.size} documents, ${churches.length} churches, ${ministryPageCount} ministry pages, ${safeChurchPageCount} Safe Church pages, ${sermonCount} sermons, 0 errors` +
    (warnings.length > 0 ? `, ${warnings.length} warning(s).` : '.')
);
process.exit(0);
