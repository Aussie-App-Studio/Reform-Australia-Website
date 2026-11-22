import { parseSearchShortcut } from './features';
import type {
  ChurchOrderJson,
  DocsIndex,
  FlattenedDocItem,
  SearchIndex,
  SearchResult,
  SyncMeta,
} from './types';

export const DOC_IDS = {
  apostlesCreed: 'creeds-and-confessions-01-ecumenical-creeds-01-the-apostles-creed',
  niceneCreed: 'creeds-and-confessions-01-ecumenical-creeds-02-the-nicene-creed',
  athanasianCreed: 'creeds-and-confessions-01-ecumenical-creeds-03-the-athanasian-creed',
  belgicConfession: 'creeds-and-confessions-02-reformed-confessions-01-the-belgic-confession',
  heidelbergCatechism: 'creeds-and-confessions-02-reformed-confessions-02-the-heidelberg-catechism',
  canonsOfDort: 'creeds-and-confessions-02-reformed-confessions-03-the-canons-of-dort',
  westminsterConfession: 'creeds-and-confessions-02-reformed-confessions-04-the-westminster-confession-of-faith',
  contemporaryTestimony: 'creeds-and-confessions-03-contemporary-testimony-01-our-world-belongs-to-god',
  formOfSubscription: '01-form-of-subscription',
  churchOrder2022: 'church-order-01-crca-church-order-2022',
  rulesFinalExamination2024: 'church-order-02-rules-for-the-final-examination-2024',
  actsOfSynod2024: 'acts-of-synod-01-acts-of-synod-2024',
} as const;

export const EXTENSION_URLS = {
  repo: 'https://github.com/Aussie-App-Studio/crca-forms-and-documents',
  installGuide:
    'https://github.com/Aussie-App-Studio/crca-forms-and-documents#how-to-add-it-to-your-browser',
  downloadZip:
    'https://github.com/Aussie-App-Studio/crca-forms-and-documents/releases/latest/download/CRCA-Forms-Extension.zip',
} as const;

const DOCS_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/documents`;

export function encodeDocUrl(relPath: string): string {
  return (
    `${DOCS_BASE}/` +
    relPath
      .split('/')
      .filter((s) => s.length > 0)
      .map((segment) => encodeURIComponent(segment))
      .join('/')
  );
}

let docsIndexPromise: Promise<DocsIndex> | null = null;
let searchIndexPromise: Promise<SearchIndex> | null = null;
let syncMetaPromise: Promise<SyncMeta | null> | null = null;
let churchOrderPromise: Promise<ChurchOrderJson> | null = null;
const markdownCache = new Map<string, Promise<string>>();

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unable to load ${url} (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchDocsIndex(): Promise<DocsIndex> {
  if (!docsIndexPromise) {
    docsIndexPromise = fetchJson<DocsIndex>(`${DOCS_BASE}/index.json`).catch((err) => {
      docsIndexPromise = null;
      throw err;
    });
  }
  return docsIndexPromise;
}

export function fetchSearchIndex(): Promise<SearchIndex> {
  if (!searchIndexPromise) {
    searchIndexPromise = fetchJson<SearchIndex>(`${DOCS_BASE}/search-index.json`).catch((err) => {
      searchIndexPromise = null;
      throw err;
    });
  }
  return searchIndexPromise;
}

export function fetchSyncMeta(): Promise<SyncMeta | null> {
  if (!syncMetaPromise) {
    syncMetaPromise = fetch(`${DOCS_BASE}/sync-meta.json`)
      .then((res) => (res.ok ? (res.json() as Promise<SyncMeta>) : null))
      .catch(() => null);
  }
  return syncMetaPromise;
}

export function fetchChurchOrderJson(): Promise<ChurchOrderJson> {
  if (!churchOrderPromise) {
    churchOrderPromise = fetchJson<ChurchOrderJson>(
      encodeDocUrl('Church Order/crca-book-of-order-2022.json')
    ).catch((err) => {
      churchOrderPromise = null;
      throw err;
    });
  }
  return churchOrderPromise;
}

export function fetchDocMarkdown(docPath: string): Promise<string> {
  const cached = markdownCache.get(docPath);
  if (cached) return cached;

  const url = encodeDocUrl(docPath);
  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Unable to load document (HTTP ${res.status})`);
      }
      return res.text();
    })
    .catch((err) => {
      markdownCache.delete(docPath);
      throw err;
    });

  markdownCache.set(docPath, promise);
  return promise;
}

export function flattenDocs(index: DocsIndex): FlattenedDocItem[] {
  const items: FlattenedDocItem[] = [];
  for (const cat of index.categories) {
    for (const grp of cat.groups) {
      for (const item of grp.items) {
        items.push({
          ...item,
          categoryId: cat.id,
          categoryTitle: cat.title,
          groupId: grp.id,
          groupTitle: grp.title,
        });
      }
    }
  }
  return items;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildHighlightedSnippet(
  rawText: string,
  terms: string[],
  phrase: string
): string {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const lower = normalized.toLowerCase();
  let matchIdx = lower.indexOf(phrase);
  if (matchIdx < 0) {
    for (const t of terms) {
      const idx = lower.indexOf(t);
      if (idx >= 0) {
        matchIdx = idx;
        break;
      }
    }
  }

  const start = Math.max(0, (matchIdx >= 0 ? matchIdx : 0) - 55);
  const end = Math.min(normalized.length, start + 175);
  const slice = normalized.slice(start, end);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < normalized.length ? '…' : '';

  const highlightTargets = Array.from(
    new Set([phrase, ...terms].filter((t) => t.length >= 2))
  ).sort((a, b) => b.length - a.length);

  if (highlightTargets.length === 0) {
    return `${prefix}${escapeHtml(slice)}${suffix}`;
  }

  const re = new RegExp(`(${highlightTargets.map(escapeRegex).join('|')})`, 'gi');
  let html = '';
  let lastIdx = 0;
  for (const m of slice.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > lastIdx) {
      html += escapeHtml(slice.slice(lastIdx, idx));
    }
    html += `<mark>${escapeHtml(m[0])}</mark>`;
    lastIdx = idx + m[0].length;
  }
  if (lastIdx < slice.length) {
    html += escapeHtml(slice.slice(lastIdx));
  }

  return `${prefix}${html}${suffix}`;
}

export function searchDocuments(
  query: string,
  allDocs: FlattenedDocItem[],
  searchIndex: SearchIndex | null
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const lowerQ = q.toLowerCase();
  const terms = lowerQ.split(/\s+/).filter((t) => t.length > 0);
  const results: SearchResult[] = [];

  const shortcuts = parseSearchShortcut(q, allDocs);
  for (const sc of shortcuts) {
    results.push({
      doc: sc.doc,
      score: sc.score,
      headingSlug: sc.headingSlug,
      headingText: sc.headingText,
      qaAnchor: sc.qaAnchor,
      badge: sc.badge,
      snippetHtml: sc.snippetHtml,
    });
  }

  const searchDocById = new Map<string, string>();
  if (searchIndex?.documents) {
    for (const sdoc of searchIndex.documents) {
      searchDocById.set(sdoc.id, sdoc.text || '');
    }
  }

  const shortcutDocKeys = new Set(
    shortcuts.map((s) => `${s.doc.id}::${s.headingSlug || ''}::${s.qaAnchor || ''}`)
  );

  for (const doc of allDocs) {
    const titleLower = doc.title.toLowerCase();
    const groupLower = `${doc.categoryTitle} ${doc.groupTitle}`.toLowerCase();
    const fullText = searchDocById.get(doc.id) || '';
    const fullTextLower = fullText.toLowerCase();

    let score = 0;

    if (titleLower === lowerQ) {
      score += 240;
    } else if (titleLower.includes(lowerQ)) {
      score += 140;
    }

    let matchedHeading: { text: string; slug: string } | null = null;
    for (const h of doc.headings || []) {
      const hl = h.text.toLowerCase();
      if (hl.includes(lowerQ)) {
        score += 95;
        if (!matchedHeading) matchedHeading = h;
      } else if (terms.length > 1 && terms.every((t) => hl.includes(t))) {
        score += 65;
        if (!matchedHeading) matchedHeading = h;
      }
    }

    if (groupLower.includes(lowerQ)) {
      score += 40;
    }

    let phraseInBody = false;
    if (fullTextLower) {
      if (fullTextLower.includes(lowerQ)) {
        score += 80;
        phraseInBody = true;
      }
    }

    let termMatches = 0;
    for (const t of terms) {
      if (titleLower.includes(t)) {
        score += 32;
        termMatches += 1;
      } else if (groupLower.includes(t)) {
        score += 14;
        termMatches += 1;
      } else if (fullTextLower.includes(t)) {
        score += 18;
        termMatches += 1;
      }
    }

    // Require all query terms to appear somewhere across metadata or body when multi-word
    if (terms.length > 1 && termMatches < terms.length && !phraseInBody) {
      continue;
    }

    if (score === 0) continue;

    // Avoid duplicating an exact doc-level shortcut that already points to the root of the doc
    if (
      !matchedHeading &&
      shortcutDocKeys.has(`${doc.id}::::`)
    ) {
      continue;
    }

    const snippetHtml = fullText
      ? buildHighlightedSnippet(fullText, terms, lowerQ)
      : escapeHtml(`${doc.categoryTitle} — ${doc.groupTitle}`);

    results.push({
      doc,
      score,
      headingSlug: matchedHeading?.slug ?? null,
      headingText: matchedHeading?.text ?? null,
      snippetHtml,
    });
  }

  // Deduplicate keeping highest score per (doc.id + headingSlug + qaAnchor)
  const deduped = new Map<string, SearchResult>();
  for (const r of results) {
    const key = `${r.doc.id}::${r.headingSlug || ''}::${r.qaAnchor || ''}`;
    const existing = deduped.get(key);
    if (!existing || r.score > existing.score) {
      deduped.set(key, r);
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
}

export function findChurchOrderArticleSlug(
  articleNum: string,
  churchOrderDoc: FlattenedDocItem | undefined
): string {
  const num = articleNum.trim();
  if (churchOrderDoc?.headings) {
    const re = new RegExp(`^Article\\s+${escapeRegex(num)}\\b`, 'i');
    const match = churchOrderDoc.headings.find((h) => re.test(h.text));
    if (match) return match.slug;
  }
  return `article-${num}`;
}
