#!/usr/bin/env node
// Full-site QA in a real browser. Visits every page at desktop and phone width and fails on:
//   error screens, "page not found", JS errors, console errors, broken images,
//   internal links / documents that don't resolve, and horizontal overflow.
//
//   npm run build && npx vite preview --port 4173 &   (or use any deployed URL)
//   npm run qa                                    -> http://localhost:4173
//   npm run qa -- https://example.github.io/site/v2   (deployed preview)
//
// Requires Playwright's Chromium once: npx playwright install chromium
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const WIDTHS = [1440, 390];
const WORKERS = 4;
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

// ---------- 1. Build the list of routes ----------
const routes = new Set([
  '/', '/find-a-church', '/who-we-are/vision-values', '/who-we-are/beliefs', '/who-we-are/history',
  '/ministries', '/for-churches', '/for-churches/forms-and-documents', '/contact', '/safe-church', '/sermons',
  '/sermons?book=Heidelberg%20Catechism&g=conf', '/sermons?q=grace',
]);
const appText = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
for (const m of appText.matchAll(/path="([^"*:]+)"/g)) routes.add(m[1]);
for (const f of readdirSync(path.join(ROOT, 'src/data/ministry-pages'))) {
  const p = json(`src/data/ministry-pages/${f}`);
  routes.add(`/ministries/${p.slug}`);
  for (const n of p.news ?? []) routes.add(`/ministries/${p.slug}/news/${n.id}`);
}
try {
  for (const f of readdirSync(path.join(ROOT, 'src/data/pages'))) routes.add(json(`src/data/pages/${f}`).path);
} catch { /* no content pages yet */ }
for (const p of Object.keys(json('public/data/safe-church/content.json').pages)) routes.add(`/safe-church/${p}`);
const docs = json('public/documents/index.json');
for (const c of docs.categories) for (const g of c.groups) for (const i of g.items) routes.add(`/for-churches/forms-and-documents/${i.id}`);
const sermons = json('public/data/sermons/index.json').sermons;
for (let i = 0; i < sermons.length; i += Math.ceil(sermons.length / 40)) routes.add(`/sermons/${sermons[i].id}`);
const legacy = (() => { try { return json('src/data/legacyRedirects.json'); } catch { return {}; } })();
const legacyChecks = Object.entries(legacy);

// ---------- 2. Visit ----------
const problems = [];
const linkTargets = new Set();
const report = (w, route, msg) => problems.push(`[${w}] ${route}: ${msg}`);
const browser = await chromium.launch();
// GitHub Pages serves public/documents/index.json for /documents before the app can redirect;
// real hosts handle it via public/_redirects and public/.htaccess.
if (BASE.includes('github.io')) routes.delete('/documents');
const list = [...routes];
let done = 0;

async function visit(page, w, route) {
  const errors = [];
  const onErr = (e) => errors.push(`JS error: ${e.message}`);
  const onConsole = (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // GitHub Pages answers deep links with its 404.html router (expected), ignore that one response.
    if (/Failed to load resource: the server responded with a status of 404/.test(t) && BASE.includes('github.io')) return;
    errors.push(`console: ${t.slice(0, 200)}`);
  };
  page.on('pageerror', onErr);
  page.on('console', onConsole);
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(250);
    // scroll through so lazy images load
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 900) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({
      errorScreen: !!document.body.innerText.match(/Something went wrong displaying this page/),
      notFound: !!document.body.innerText.match(/We couldn.t find that page/),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.getAttribute('src')),
      links: [...document.querySelectorAll('a[href]')].map((a) => new URL(a.getAttribute('href'), location.href).href).filter((h) => h.startsWith(location.origin)),
      h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    }));
    if (r.errorScreen) report(w, route, 'ERROR SCREEN');
    if (r.notFound) report(w, route, 'page not found');
    if (!r.h1) report(w, route, 'no <h1>');
    if (r.overflow > 1) report(w, route, `horizontal overflow ${r.overflow}px`);
    for (const s of r.brokenImgs) report(w, route, `broken image ${s}`);
    for (const l of r.links) linkTargets.add(l.split('#')[0]);
    for (const e of errors) report(w, route, e);
  } catch (e) {
    report(w, route, `failed to load: ${e.message.split('\n')[0]}`);
  } finally {
    page.off('pageerror', onErr);
    page.off('console', onConsole);
  }
  if (++done % 25 === 0) process.stdout.write(`\r  ${done}/${list.length * WIDTHS.length} page visits`);
}

for (const w of WIDTHS) {
  const ctxs = await Promise.all(Array.from({ length: WORKERS }, () => browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, isMobile: w < 800 })));
  const queue = [...list];
  await Promise.all(ctxs.map(async (ctx) => {
    const page = await ctx.newPage();
    while (queue.length) await visit(page, w, queue.shift());
  }));
  await Promise.all(ctxs.map((c) => c.close()));
}
process.stdout.write('\n');

// ---------- 3. Legacy crca.org.au redirects land on a real page ----------
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const [from, to] of legacyChecks) {
    try {
      await page.goto(BASE + from, { waitUntil: 'networkidle', timeout: 45000 });
      const text = await page.evaluate(() => document.body.innerText);
      if (/We couldn.t find that page|Something went wrong/.test(text)) problems.push(`[redirect] ${from} -> ${to}: lands on an error page`);
    } catch (e) {
      problems.push(`[redirect] ${from}: ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}

// ---------- 4. Every internal file link resolves ----------
{
  const ctx = await browser.newContext();
  const fileLinks = [...linkTargets].filter((u) => /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|webp|zip|mp3)$/i.test(decodeURIComponent(new URL(u).pathname)));
  for (const u of fileLinks) {
    const res = await ctx.request.get(u, { maxRedirects: 2 }).catch((e) => ({ status: () => `ERR ${e.message}` }));
    const st = res.status();
    if (st !== 200) problems.push(`[file] ${u} -> ${st}`);
  }
  console.log(`  checked ${fileLinks.length} linked documents/files`);
  await ctx.close();
}
await browser.close();

console.log(`QA: ${list.length} pages x ${WIDTHS.length} widths, ${legacyChecks.length} legacy redirects.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log('QA passed: no errors, broken images, broken files or overflow.');
