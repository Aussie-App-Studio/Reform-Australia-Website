// Loader + search for the Word of Salvation archive synced by scripts/sync-sermons.mjs.

export type SermonGroup = 'ot' | 'nt' | 'conf';

/** Compact catalogue entry (keys kept short to keep index.json small). */
export interface SermonIndexItem {
  id: string;
  t: string; // title
  b: string | null; // primary book / confession
  bs?: string[]; // all books / confessions it is filed under (when more than one)
  g: SermonGroup | null;
  p: string | null; // preacher key (see preachers map)
  r: string | null; // passage / reference
  s: string | null; // series
  ld: number | null; // Heidelberg Lord's Day
  y: number; // year of the Word of Salvation issue
  m: number | null; // month of issue
  w: number; // words
  x: string; // opening words
  a: string; // date added online
}

export interface SermonIndex {
  source: string;
  syncedAt: string;
  books: { name: string; group: SermonGroup; count: number }[];
  preachers: Record<string, string>;
  sermons: SermonIndexItem[];
}

export interface Sermon {
  id: string;
  title: string;
  ref: string;
  book: string | null;
  group: SermonGroup | null;
  preacher: string | null;
  passage: string | null;
  readings: string | null;
  series: string | null;
  lordsDay: number | null;
  issue: string | null;
  year: number;
  month: number | null;
  words: number;
  sourceUrl: string;
  html: string;
}

export const GROUP_LABELS: Record<SermonGroup, string> = {
  ot: 'Old Testament',
  nt: 'New Testament',
  conf: 'Confessions',
};

const BASE = `${import.meta.env.BASE_URL}data/sermons`;
let indexPromise: Promise<SermonIndex> | null = null;
const sermonCache = new Map<string, Promise<Sermon>>();

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Unable to load ${url} (HTTP ${r.status})`);
  return (await r.json()) as T;
}

export function fetchSermonIndex(): Promise<SermonIndex> {
  indexPromise ??= getJson<SermonIndex>(`${BASE}/index.json`).catch((e) => {
    indexPromise = null;
    throw e;
  });
  return indexPromise;
}

export function fetchSermon(id: string): Promise<Sermon> {
  let p = sermonCache.get(id);
  if (!p) {
    p = getJson<Sermon>(`${BASE}/s/${encodeURIComponent(id)}.json`).catch((e) => {
      sermonCache.delete(id);
      throw e;
    });
    sermonCache.set(id, p);
  }
  return p;
}

/** Reading time for a sermon read aloud (~130 words per minute). */
export function readAloudMinutes(words: number): number {
  return Math.max(1, Math.round(words / 130));
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function issueLabel(y: number, m: number | null): string {
  return m ? `${MONTH_NAMES[m - 1]} ${y}` : String(y);
}

const BOOK_ALIASES: Record<string, string> = {
  hc: 'heidelberg catechism', heidelberg: 'heidelberg catechism', catechism: 'heidelberg catechism',
  bc: 'belgic confession', belgic: 'belgic confession', dort: 'canons of dort', wcf: 'westminster confession of faith',
  gen: 'genesis', ex: 'exodus', exod: 'exodus', lev: 'leviticus', num: 'numbers', deut: 'deuteronomy',
  ps: 'psalms', psalm: 'psalms', prov: 'proverbs', eccl: 'ecclesiastes', isa: 'isaiah', jer: 'jeremiah',
  ezek: 'ezekiel', dan: 'daniel', matt: 'matthew', mt: 'matthew', mk: 'mark', lk: 'luke', jn: 'john',
  rom: 'romans', gal: 'galatians', eph: 'ephesians', phil: 'philippians', col: 'colossians', heb: 'hebrews',
  rev: 'revelation', jas: 'james',
};

export interface SermonFilters {
  query: string;
  group: SermonGroup | 'all';
  book: string | null;
  preacher: string | null;
  decade: number | null;
  lordsDay: number | null;
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ');
}

/** Builds the per-sermon haystack once; cached by object identity. */
const hayCache = new WeakMap<SermonIndexItem, string>();
function haystack(item: SermonIndexItem, preachers: Record<string, string>): string {
  let h = hayCache.get(item);
  if (!h) {
    h = normalise(
      [item.t, item.b, item.r, item.s, item.p ? preachers[item.p] : '', item.ld ? `lord's day ${item.ld} ld ${item.ld}` : '', item.x]
        .filter(Boolean)
        .join(' | ')
    );
    hayCache.set(item, h);
  }
  return h;
}

export function filterSermons(index: SermonIndex, f: SermonFilters): SermonIndexItem[] {
  const terms = normalise(f.query)
    .split(' ')
    .filter(Boolean)
    .map((t) => BOOK_ALIASES[t.replace(/\.$/, '')] ?? t);
  // "LD 12" / "Lord's Day 12" shortcut
  const ldMatch = f.query.match(/^\s*(?:ld|lord'?s day|hc)\s*(\d{1,2})\s*$/i);
  const lordsDay = f.lordsDay ?? (ldMatch ? Number(ldMatch[1]) : null);

  const results: { item: SermonIndexItem; score: number }[] = [];
  for (const item of index.sermons) {
    const books = item.bs ?? (item.b ? [item.b] : []);
    if (f.book && !books.includes(f.book)) continue;
    if (!f.book && f.group !== 'all' && item.g !== f.group) continue;
    if (f.preacher && item.p !== f.preacher) continue;
    if (f.decade && Math.floor(item.y / 10) * 10 !== f.decade) continue;
    if (lordsDay) {
      if (item.ld !== lordsDay) continue;
      results.push({ item, score: 1 });
      continue;
    }
    if (!terms.length) {
      results.push({ item, score: 0 });
      continue;
    }
    const h = haystack(item, index.preachers);
    let score = 0;
    for (const t of terms) {
      const at = h.indexOf(t);
      if (at < 0) {
        score = -1;
        break;
      }
      score += item.t.toLowerCase().includes(t) ? 3 : 1;
    }
    if (score > 0) results.push({ item, score });
  }
  if (terms.length && !lordsDay) results.sort((a, b) => b.score - a.score);
  return results.map((r) => r.item);
}
