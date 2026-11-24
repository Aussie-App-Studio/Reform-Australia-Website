// Loader for the Safe Church content synced by scripts/sync-safe-church.mjs.

export interface SafeChurchPage {
  path: string;
  legacyUrl: string;
  title: string;
  parent: string | null;
  children: string[];
  summary: string;
  html: string;
  words: number;
  modified: string;
}

export interface SafeChurchSection {
  path: string;
  title: string;
  icon: string;
  blurb: string;
}

export interface SafeChurchContent {
  source: string;
  syncedAt: string;
  intro: string;
  sections: SafeChurchSection[];
  pages: Record<string, SafeChurchPage>;
}

const URL_ = `${import.meta.env.BASE_URL}safe-church/content.json`;
let promise: Promise<SafeChurchContent> | null = null;

export function fetchSafeChurch(): Promise<SafeChurchContent> {
  promise ??= fetch(URL_)
    .then((r) => {
      if (!r.ok) throw new Error(`Unable to load Safe Church content (HTTP ${r.status})`);
      return r.json() as Promise<SafeChurchContent>;
    })
    .catch((err) => {
      promise = null;
      throw err;
    });
  return promise;
}

/** Ancestors from the section root down to (but excluding) the page. */
export function ancestorsOf(content: SafeChurchContent, path: string): SafeChurchPage[] {
  const out: SafeChurchPage[] = [];
  let p = content.pages[path]?.parent;
  while (p && content.pages[p]) {
    out.unshift(content.pages[p]);
    p = content.pages[p].parent;
  }
  return out;
}

/** Short, friendly title for a page (section roots get their hub names). */
export function displayTitle(content: SafeChurchContent, path: string): string {
  return content.sections.find((s) => s.path === path)?.title ?? content.pages[path]?.title ?? path;
}

/** Simple full-text search across titles and body text. */
export function searchSafeChurch(content: SafeChurchContent, query: string, limit = 12) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  const results: { page: SafeChurchPage; score: number; snippet: string }[] = [];
  for (const page of Object.values(content.pages)) {
    const title = page.title.toLowerCase();
    const text = page.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const lower = text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      const hits = lower.split(t).length - 1;
      if (!hits) {
        score = 0;
        break;
      }
      score += Math.min(hits, 8);
    }
    if (score > 0) {
      const at = Math.max(0, lower.indexOf(terms[0]) - 60);
      results.push({ page, score, snippet: (at > 0 ? '…' : '') + text.slice(at, at + 180).trim() + '…' });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
