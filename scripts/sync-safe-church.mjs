#!/usr/bin/env node
// Pulls every page of the legacy Safe Church Unit site (safechurch.crca.org.au)
// into public/data/safe-church/ so it can be served as part of the main CRCA site.
//
//   npm run sync-safe-church            -> refresh pages, download new files
//   npm run sync-safe-church -- --force -> also re-download every file
//
// Output:
//   public/data/safe-church/content.json  sections, page tree, cleaned HTML
//   public/data/safe-church/files/*       self-hosted PDFs / Word documents
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanHtml, decodeEntities, downloadFile, fetchAllWp, htmlToText } from './lib/wp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'safe-church');
const FILES_DIR = path.join(OUT_DIR, 'files');
const HOST = 'safechurch.crca.org.au';
const FORCE = process.argv.includes('--force');

// Legacy URL segments -> friendlier paths on the new site.
const SEGMENT_MAP = {
  'safe-church-overview': 'about',
  'child-related-safe-church-matters': 'children',
  'adult-conduct-overview': 'adults',
  'volunteer-overview': 'volunteers',
  'resource-overview': 'resources',
  'resource-overview-cloned': 'guidelines',
  'forms-and-posters-cloned': 'forms-and-posters',
  'reports-documents-forms': 'policies-and-documents',
};

// Pages that exist on the old site but should not be migrated.
const SKIP_PATHS = new Set([
  'resource-overview/forms-and-posters', // titled "Forms and Posters – do not use"
]);

// Links to the even older safechurchcrca.org.au domain, mapped to content we host ourselves.
const LEGACY_LINKS = {
  'https://safechurchcrca.org.au/images/CRCA_Sexual_Abuse_Apology_-_Members_July_2022.pdf':
    'https://safechurch.crca.org.au/wp-content/uploads/CRCA-Sexual-Abuse-Apology-Members-July-2022.pdf',
  'https://safechurchcrca.org.au/safe-church-documents/safe-church-related': 'https://safechurch.crca.org.au/resource-overview/reports-documents-forms/',
};

// Section order and short blurbs for the hub page.
const SECTIONS = [
  { legacy: 'safe-church-overview', title: 'About Safe Church', icon: 'ShieldCheck', blurb: 'Who the Safe Church Unit is, our policy commitments, training and the role of Safe Church Representatives.' },
  { legacy: 'child-related-safe-church-matters', title: 'Children & Young People', icon: 'Baby', blurb: 'Child protection obligations, recognising abuse and grooming, listening to children and how to report.' },
  { legacy: 'adult-conduct-overview', title: 'Adult Conduct', icon: 'Users', blurb: 'Reportable conduct, bullying, family and domestic violence, elder abuse and the adult disclosure process.' },
  { legacy: 'volunteer-overview', title: 'Volunteers', icon: 'HandHeart', blurb: 'The volunteer approval process, referee questions and transferring between CRCA churches.' },
  { legacy: 'resource-overview', title: 'Resources & Forms', icon: 'FolderOpen', blurb: 'Policies, forms, posters, ministry guidelines, definitions and where to seek help.' },
];

const legacyPathOf = (link) => new URL(link).pathname.replace(/^\/|\/$/g, '');
const mapPath = (legacy) => legacy.split('/').filter(Boolean).map((s) => SEGMENT_MAP[s] ?? s).join('/');

async function main() {
  console.log(`Syncing Safe Church content from ${HOST}`);
  const pages = (await fetchAllWp(HOST, 'pages')).filter((p) => p.status === 'publish');

  const files = new Map(); // remote url -> local file name
  const usedNames = new Set();
  const knownLegacy = new Set(pages.map((p) => legacyPathOf(p.link)));

  function rewriteHref(href) {
    href = LEGACY_LINKS[href] ?? href;
    let url;
    try {
      url = new URL(href, `https://${HOST}/`);
    } catch {
      return href;
    }
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') return href;
    const isOurHost = url.hostname === HOST || url.hostname === `www.${HOST}`;
    if (isOurHost && url.pathname.startsWith('/wp-content/uploads/')) {
      const remote = `https://${HOST}${url.pathname}`;
      if (!files.has(remote)) {
        let name = decodeURIComponent(path.basename(url.pathname)).replace(/[^\w.\-()]+/g, '-');
        while (usedNames.has(name.toLowerCase())) name = name.replace(/(\.\w+)$/, '-2$1');
        usedNames.add(name.toLowerCase());
        files.set(remote, name);
      }
      return `{{BASE}}data/safe-church/files/${files.get(remote)}`;
    }
    if (isOurHost) {
      const legacy = url.pathname.replace(/^\/|\/$/g, '');
      if (legacy === '') return '{{BASE}}safe-church';
      if (knownLegacy.has(legacy) && !SKIP_PATHS.has(legacy)) {
        return `{{BASE}}safe-church/${mapPath(legacy)}${url.hash}`;
      }
    }
    return href;
  }

  const out = {};
  for (const p of pages) {
    const legacy = legacyPathOf(p.link);
    if (legacy === '' || SKIP_PATHS.has(legacy)) continue;
    const slugPath = mapPath(legacy);
    let html = cleanHtml(p.content.rendered, { rewriteHref });
    const title = decodeEntities(p.title.rendered).trim();
    // Drop a leading heading that just repeats the page title.
    html = html.replace(/^<h2>([\s\S]*?)<\/h2>/, (m, inner) =>
      htmlToText(inner).toLowerCase().trim() === title.toLowerCase() ? '' : m
    ).trim();
    const text = htmlToText(html);
    out[slugPath] = {
      path: slugPath,
      legacyUrl: p.link,
      title,
      parent: legacy.includes('/') ? mapPath(legacy.split('/').slice(0, -1).join('/')) : null,
      menuOrder: p.menu_order ?? 0,
      summary: text.split('\n').find((l) => l.length > 60)?.slice(0, 220) ?? '',
      html,
      words: text.split(/\s+/).length,
      modified: p.modified,
    };
  }

  // Children lists (alphabetical within WP menu order).
  for (const page of Object.values(out)) {
    page.children = Object.values(out)
      .filter((c) => c.parent === page.path)
      .sort((a, b) => a.menuOrder - b.menuOrder || a.title.localeCompare(b.title))
      .map((c) => c.path);
  }

  const homeText = htmlToText(cleanHtml(pages.find((p) => legacyPathOf(p.link) === '')?.content.rendered ?? ''));
  const sections = SECTIONS.map((s) => {
    const p = SEGMENT_MAP[s.legacy];
    if (!out[p]) throw new Error(`Missing section page ${s.legacy}`);
    return { path: p, title: s.title, icon: s.icon, blurb: s.blurb };
  });

  // Download linked documents.
  await mkdir(FILES_DIR, { recursive: true });
  const failures = [];
  let done = 0;
  const queue = [...files.entries()];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const [remote, name] = queue.shift();
        const r = await downloadFile(remote, path.join(FILES_DIR, name), { force: FORCE }).catch((e) => e.message);
        if (r !== 'cached' && r !== 'downloaded') failures.push(`${remote} (${r})`);
        process.stdout.write(`\r  files: ${++done}/${files.size}`);
      }
    })
  );
  process.stdout.write('\n');

  // Replace links to files that could not be downloaded with the original URL.
  if (failures.length) {
    const failedNames = new Map(
      [...files.entries()].filter(([u]) => failures.some((f) => f.startsWith(u))).map(([u, n]) => [n, u])
    );
    for (const page of Object.values(out)) {
      page.html = page.html.replace(/\{\{BASE\}\}data\/safe-church\/files\/([^"]+)/g, (m, n) => failedNames.get(n) ?? m);
    }
  }

  const content = {
    source: `https://${HOST}/`,
    syncedAt: new Date().toISOString(),
    intro: homeText.split('\n')[1] ?? '',
    sections,
    pages: out,
  };
  await writeFile(path.join(OUT_DIR, 'content.json'), JSON.stringify(content));
  console.log(`Wrote ${Object.keys(out).length} pages and ${files.size - failures.length} files to public/data/safe-church/`);
  if (failures.length) console.warn(`Could not download ${failures.length} file(s); linked to the original instead:\n  ${failures.join('\n  ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
