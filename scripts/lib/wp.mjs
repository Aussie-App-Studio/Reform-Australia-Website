// Shared helpers for syncing content out of the legacy CRCA WordPress sites
// (safechurch.crca.org.au, wordofsalvation.crca.org.au) into static JSON.
import sanitizeHtml from 'sanitize-html';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const UA = { 'User-Agent': 'crca-website-sync (+https://github.com/Aussie-App-Studio/Reform-Australia-Website)' };

/** Fetch every item of a WP REST collection, following pagination. */
export async function fetchAllWp(host, collection, { fields } = {}) {
  // Optional dev cache: WP_CACHE_DIR=/tmp/wp npm run sync-sermons
  const cacheDir = process.env.WP_CACHE_DIR;
  const cacheFile = cacheDir && path.join(cacheDir, `${host}-${collection}.json`);
  if (cacheFile) {
    try {
      const { readFile } = await import('node:fs/promises');
      return JSON.parse(await readFile(cacheFile, 'utf8'));
    } catch {
      /* fall through to network */
    }
  }
  const items = await fetchAllWpUncached(host, collection, { fields });
  if (cacheFile) {
    const { writeFile } = await import('node:fs/promises');
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cacheFile, JSON.stringify(items));
  }
  return items;
}

async function fetchAllWpUncached(host, collection, { fields } = {}) {
  const items = [];
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ per_page: '100', page: String(page) });
    if (fields) params.set('_fields', fields);
    const url = `https://${host}/wp-json/wp/v2/${collection}?${params}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      if (page === 1) throw new Error(`${url} -> HTTP ${res.status}`);
      break;
    }
    items.push(...(await res.json()));
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    process.stdout.write(`\r  ${host} ${collection}: ${items.length}`);
    if (page >= totalPages) break;
  }
  process.stdout.write('\n');
  return items;
}

export async function fetchWithRetry(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, redirect: 'follow' });
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

/** Download a file unless it already exists (pass force to re-download). */
export async function downloadFile(url, dest, { force = false } = {}) {
  if (!force) {
    try {
      const s = await stat(dest);
      if (s.size > 0) return 'cached';
    } catch {
      /* not there yet */
    }
  }
  const res = await fetchWithRetry(url);
  if (!res.ok || !res.body) return `HTTP ${res.status}`;
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return 'downloaded';
}

const ENTITIES = {
  '&amp;': '&', '&nbsp;': ' ', '&#8211;': '–', '&#8212;': '—', '&#8216;': '‘', '&#8217;': '’',
  '&#8220;': '“', '&#8221;': '”', '&#8230;': '…', '&#038;': '&', '&quot;': '"', '&#039;': "'",
  '&lt;': '<', '&gt;': '>', '&#8242;': '′', '&#215;': '×',
};

export function decodeEntities(s) {
  return s
    .replace(/&[#a-z0-9]+;/gi, (e) => ENTITIES[e] ?? (/^&#\d+;$/.test(e) ? String.fromCodePoint(Number(e.slice(2, -1))) : e))
    .replace(/ /g, ' ');
}

export function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<(br|\/p|\/h\d|\/li|\/div|\/tr)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[[^\]]{1,80}\]/g, ' ') // stray shortcodes
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Reduce page-builder (Avada / Fusion) HTML down to clean semantic markup.
 * `rewriteHref` lets callers map legacy URLs onto the new site.
 */
export function cleanHtml(html, { rewriteHref = (h) => h, demoteH1 = true } = {}) {
  let out = sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'b', 'i', 'u', 'br',
      'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sup', 'sub', 'iframe',
    ],
    allowedAttributes: { a: ['href'], iframe: ['src', 'title'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      b: 'strong',
      i: 'em',
      h5: 'h4',
      a: (tagName, attribs) => {
        const href = attribs.href ? rewriteHref(decodeEntities(attribs.href.trim())) : undefined;
        return { tagName, attribs: href ? { href } : {} };
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'a' && !frame.attribs.href && !frame.text.trim(),
  });

  out = decodeEntities(out)
    .replace(/\[\/?[a-z_]+[^\]]{0,200}\]/gi, '') // leftover shortcodes
    .replace(/<strong>\s*<\/strong>|<em>\s*<\/em>/g, '')
    .replace(/<h1>\s*<h1>/g, '<h1>')
    .replace(/<\/h1>\s*<\/h1>/g, '</h1>');
  if (demoteH1) out = out.replace(/<(\/?)h1>/g, '<$1h2>');
  out = out
    .replace(/<p>(\s|<br \/>|<br>)*<\/p>/g, '')
    .replace(/<(h[234])>\s*<strong>([\s\S]*?)<\/strong>\s*<\/\1>/g, '<$1>$2</$1>')
    .replace(/\n{2,}/g, '\n')
    .trim();
  // Escape any bare ampersands decodeEntities reintroduced inside text nodes.
  out = out.replace(/&(?![a-z]+;|#\d+;)/gi, '&amp;');
  return out;
}
