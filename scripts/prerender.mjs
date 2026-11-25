#!/usr/bin/env node
// Saves every page of the built site as finished HTML, so search engines, link previews
// and slow phones get real content straight away instead of an empty page.
//
// Runs after `vite build` (it is part of `npm run build`):
//   1. serves dist/ locally and opens each page in headless Chromium;
//   2. saves the rendered page as dist/<path>.html (the home page as dist/index.html,
//      "page not found" as dist/404.html). src/main.tsx then swaps in the live app;
//   3. writes sitemap.xml, robots.txt, _headers and _redirects for Cloudflare Pages.
//
// Environment:
//   VITE_BASE_PATH   deploy sub-folder (e.g. /Reform-Australia-Website/v2/), as for vite build
//   VITE_SITE_URL    final address, for the sitemap (default https://crca.org.au)
//   SITE_INDEXING=on allow search engines (default: the whole site is kept out of search results)
//   PRERENDER=off    skip this step (plain single-page app)
//   PRERENDER_LIMIT  only render the first N pages (quick local checks)
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, appRedirects, legacyRedirects, pageRoutes } from './lib/routes.mjs';
import { createStaticServer } from './lib/static-server.mjs';

if (process.env.PRERENDER === 'off') {
  console.log('prerender: skipped (PRERENDER=off)');
  process.exit(0);
}

const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.VITE_BASE_PATH || '/').replace(/\/?$/, '/');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://crca.org.au').replace(/\/$/, '');
const INDEXING = process.env.SITE_INDEXING === 'on';
const WORKERS = Number(process.env.PRERENDER_WORKERS || 8);
// The app shell from vite build. A copy is kept so the step can be re-run on the same dist/.
const SHELL_COPY = path.join(DIST, '.app-shell.html');
const built = readFileSync(path.join(DIST, 'index.html'), 'utf8');
const shell = built.includes('data-prerendered') && existsSync(SHELL_COPY) ? readFileSync(SHELL_COPY, 'utf8') : built;
writeFileSync(SHELL_COPY, shell);

// ---------- 1. Serve dist/ locally (unknown paths get the app shell) ----------
const server = createStaticServer({ dist: DIST, base: BASE, mode: 'shell', shell });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// ---------- 2. Render every page ----------
let routes = pageRoutes();
if (process.env.PRERENDER_LIMIT) routes = routes.slice(0, Number(process.env.PRERENDER_LIMIT));
const jobs = [...routes.map((r) => ({ route: r, out: r === '/' ? 'index.html' : `${r.slice(1)}.html` })), { route: '/__page-not-found__', out: '404.html', any: true }];
const failures = [];
let done = 0;

const browser = await chromium.launch();
async function render(page, job) {
  await page.goto(`${ORIGIN}${BASE}${job.route.slice(1)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector('#main-content > *') && !document.querySelector('[data-loading]') && document.querySelector('h1'),
    null,
    { timeout: 30000 }
  );
  await page.waitForTimeout(80); // let effects (titles, descriptions) settle
  const html = await page.evaluate(({ marker }) => {
    const root = document.getElementById('root');
    root.setAttribute('data-prerendered', marker);
    document.documentElement.removeAttribute('style'); // header height is measured again on load
    // Map internals are rebuilt by the live app; the static copy keeps an empty box.
    for (const m of root.querySelectorAll('.maplibregl-map, .leaflet-container')) m.replaceChildren();
    for (const el of document.querySelectorAll('[data-prerender-remove]')) el.remove();
    // The map's code and styles load later, only when the map comes into view.
    for (const el of document.head.querySelectorAll('link[href*="AustraliaChurchMap"]')) el.remove();
    return '<!doctype html>\n' + document.documentElement.outerHTML;
  }, { marker: job.any ? '*' : job.route });
  const file = path.join(DIST, job.out);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const queue = [...jobs];
const contexts = await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Each page starts with no saved bookmarks, recent documents or settings.
    await ctx.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    // Map tiles and other outside requests aren't needed for the saved HTML.
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    return ctx;
  })
);
const errorsByJob = new Map();
await Promise.all(
  contexts.map(async (ctx) => {
    const page = await ctx.newPage();
    let current = null;
    page.on('pageerror', (e) => current && errorsByJob.set(current.route, e.message));
    while (queue.length) {
      const job = queue.shift();
      current = job;
      try {
        await render(page, job);
      } catch (e) {
        failures.push(`${job.route}: ${e.message.split('\n')[0]}`);
      }
      if (++done % 100 === 0 || done === jobs.length) process.stdout.write(`\r  prerender: ${done}/${jobs.length} pages`);
    }
  })
);
process.stdout.write('\n');
await Promise.all(contexts.map((c) => c.close()));
await browser.close();
server.close();
for (const [route, msg] of errorsByJob) console.warn(`  warning: ${route}: script error while rendering: ${msg}`);

// ---------- 3. Sitemap, robots.txt, headers and redirects ----------
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `  <url><loc>${xmlEscape(SITE_URL + (r === '/' ? '/' : r))}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync(
  path.join(DIST, 'robots.txt'),
  INDEXING
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : `# Not launched yet: keep the whole site out of search engines.\n# Build with SITE_INDEXING=on at launch.\nUser-agent: *\nDisallow: /\n`
);
writeFileSync(
  path.join(DIST, '_headers'),
  [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    ...(INDEXING ? [] : ['  X-Robots-Tag: noindex, nofollow']),
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/fonts/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n')
);
const redirects = new Map();
const add = (from, to) => {
  for (const f of new Set([from, from.replace(/\/$/, ''), from.replace(/\/?$/, '/')])) if (f && f !== to && f !== '/') redirects.set(f, to);
};
for (const [from, to] of Object.entries(appRedirects())) add(from, to);
for (const [from, to] of Object.entries(legacyRedirects())) add(from, to);
writeFileSync(
  path.join(DIST, '_redirects'),
  [
    '# Generated by scripts/prerender.mjs from App.tsx and src/data/legacyRedirects.json',
    ...[...redirects].map(([f, t]) => `${f} ${t} 301`),
    '/word-of-salvation/:slug /sermons/:slug 301',
    '/word-of-salvation/:slug/ /sermons/:slug 301',
    '',
  ].join('\n')
);

console.log(
  `prerender: ${jobs.length - failures.length} pages saved, sitemap with ${routes.length} addresses, ${redirects.size + 2} redirects, indexing ${INDEXING ? 'ON' : 'off (noindex)'}`
);
if (failures.length) {
  console.error(`\n${failures.length} page(s) could not be pre-rendered:\n  ` + failures.slice(0, 30).join('\n  '));
  process.exit(1);
}
