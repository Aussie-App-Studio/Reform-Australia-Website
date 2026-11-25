// Every page on the site, and every redirect, worked out from the data files.
// Used by the pre-renderer (scripts/prerender.mjs), the sitemap and the QA script.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

/** All page paths (no query strings), home first. */
export function pageRoutes() {
  const routes = new Set([
    '/', '/find-a-church', '/who-we-are/vision-values', '/who-we-are/beliefs', '/who-we-are/history',
    '/ministries', '/for-churches', '/for-churches/forms-and-documents', '/contact', '/safe-church', '/sermons',
  ]);
  const appText = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
  const redirected = new Set(Object.keys(appRedirects()));
  for (const m of appText.matchAll(/path="([^"*:]+)"/g)) if (!redirected.has(m[1])) routes.add(m[1]);
  for (const f of readdirSync(path.join(ROOT, 'src/data/ministry-pages'))) {
    const p = json(`src/data/ministry-pages/${f}`);
    routes.add(`/ministries/${p.slug}`);
    for (const n of p.news ?? []) routes.add(`/ministries/${p.slug}/news/${n.id}`);
  }
  for (const f of readdirSync(path.join(ROOT, 'src/data/pages'))) routes.add(json(`src/data/pages/${f}`).path);
  for (const p of Object.keys(json('public/data/safe-church/content.json').pages)) routes.add(`/safe-church/${p}`);
  const docs = json('public/documents/index.json');
  for (const c of docs.categories) for (const g of c.groups) for (const i of g.items) routes.add(`/for-churches/forms-and-documents/${i.id}`);
  for (const s of json('public/data/sermons/index.json').sermons) routes.add(`/sermons/${s.id}`);
  return [...routes];
}

/** `<Route path="/x" element={<Navigate to="/y" />}` redirects declared in App.tsx. */
export function appRedirects() {
  const appText = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
  const out = {};
  for (const m of appText.matchAll(/path="([^"*:]+)"\s*element=\{\s*<Navigate\s+to="([^"]+)"/g)) out[m[1]] = m[2];
  return out;
}

/** Old crca.org.au addresses -> new pages (src/data/legacyRedirects.json). */
export function legacyRedirects() {
  try {
    return json('src/data/legacyRedirects.json');
  } catch {
    return {};
  }
}
