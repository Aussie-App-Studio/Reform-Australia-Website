import { lowerMinorWords } from '../utils/sentenceCase';
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
  indexPromise ??= getJson<SermonIndex>(`${BASE}/index.json`).then((index) => {
    for (const s of index.sermons) s.t = lowerMinorWords(s.t);
    return index;
  }).catch((e) => {
    indexPromise = null;
    throw e;
  });
  return indexPromise;
}

export function fetchSermon(id: string): Promise<Sermon> {
  let p = sermonCache.get(id);
  if (!p) {
    p = getJson<Sermon>(`${BASE}/s/${encodeURIComponent(id)}.json`).then((s) => ({ ...s, title: lowerMinorWords(s.title) })).catch((e) => {
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

/** "Romans 8", "rom 8:28", "1 cor 13", "Psalm 23" -> book, chapter and verse. */
export function parsePassage(query: string, books: string[]): { book: string; chapter: number; verse: number | null } | null {
  const m = query.trim().match(/^([123])?\s*([a-z][a-z .']*?)\.?\s+(\d{1,3})(?:\s*[:.]\s*(\d{1,3}))?$/i);
  if (!m) return null;
  const num = m[1] ?? '';
  const word = normalise(m[2]).trim();
  const aliased = BOOK_ALIASES[word] ?? word;
  const want = (num ? num + ' ' : '') + aliased;
  const lower = books.map((b) => b.toLowerCase());
  let i = lower.indexOf(want);
  if (i < 0) i = lower.findIndex((b) => b.startsWith(want) && /^\d/.test(b) === !!num);
  if (i < 0) return null;
  return { book: books[i], chapter: Number(m[3]), verse: m[4] ? Number(m[4]) : null };
}

/** How well a sermon's reference ("Psalm 22:1-21", "Romans 8:28-9:5") fits a chapter and verse. 0 = not at all. */
function passageScore(ref: string, book: string, chapter: number, verse: number | null): number {
  let best = 0;
  const bookStem = book.toLowerCase().replace(/^\d\s*/, '').slice(0, 3);
  for (const part of ref.split(/[;&+]\s*/)) {
    // Skip parts of the reference that name a different book.
    const named = part.match(/^\s*[123]?\s*([A-Za-z]+)/)?.[1];
    if (named && !named.toLowerCase().startsWith(bookStem)) continue;
    // Book name off the front ("1John 3:1" -> "3:1"); "8.34" is written for "8:34" in some references.
    const m = part
      .replace(/^\s*[123]?\s*[A-Za-z][A-Za-z ]*?\s*(?=\d)/, '')
      .match(/^(\d+)(?:\s*[:.]\s*(\d+))?(?:\s*[-–]\s*(\d+)(?:[:.](\d+))?)?/);
    if (!m) continue;
    const c1 = Number(m[1]);
    // "8:28-9:5" spans chapters 8 to 9; "22:1-21" stays in chapter 22.
    const c2 = m[4] ? Number(m[3]) : c1;
    if (chapter < c1 || chapter > c2) continue;
    let score = 2;
    if (verse !== null && m[2]) {
      const v1 = chapter === c1 ? Number(m[2]) : 1;
      const v2 = m[4] ? (chapter === c2 ? Number(m[4]) : 999) : m[3] ? Number(m[3]) : v1;
      score = verse >= v1 && verse <= v2 ? 3 : 1;
    }
    best = Math.max(best, score);
  }
  return best;
}

export function filterSermons(index: SermonIndex, f: SermonFilters): SermonIndexItem[] {
  // A Bible passage ("Romans 8", "Psalm 23:4") finds sermons on that chapter, closest verses first.
  const passage = f.query.trim() ? parsePassage(f.query, index.books.map((b) => b.name)) : null;
  if (passage) {
    const hits: { item: SermonIndexItem; score: number }[] = [];
    for (const item of index.sermons) {
      const books = item.bs ?? (item.b ? [item.b] : []);
      if (!books.includes(passage.book) || (f.book && !books.includes(f.book))) continue;
      if (f.preacher && item.p !== f.preacher) continue;
      if (f.decade && Math.floor(item.y / 10) * 10 !== f.decade) continue;
      const score = passageScore(item.r ?? '', passage.book, passage.chapter, passage.verse);
      if (score) hits.push({ item, score });
    }
    if (hits.length) return hits.sort((a, b) => b.score - a.score).map((h) => h.item);
  }
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
