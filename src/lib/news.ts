// Ministry news: one file per item in src/data/news/<ministry>-<id>.json (added in /admin).
// Shown on the ministry's page, on its own page (/ministries/<ministry>/news/<id>), and, only
// when an editor turns on "Show on the home page", on the home page for a year.
import type { MinistryNewsItem } from './ministryPages';

interface NewsFile {
  title: string;
  ministry: string; // ministry page slug, e.g. "swim"
  date: string; // YYYY-MM-DD
  summary?: string;
  image?: string;
  onHomePage?: boolean; // ticked by an editor
  body?: string; // blank line between paragraphs
}

export interface NewsItem extends MinistryNewsItem {
  ministry: string;
  onHomePage?: boolean;
}

const modules = import.meta.glob<NewsFile>('../data/news/*.json', { eager: true, import: 'default' });

export const allNews: NewsItem[] = Object.entries(modules)
  .map(([file, n]) => {
    const name = file.split('/').pop()!.replace(/\.json$/, '');
    const id = name.startsWith(`${n.ministry}-`) ? name.slice(n.ministry.length + 1) : name;
    return {
      id,
      ministry: n.ministry,
      title: n.title,
      date: n.date,
      summary: n.summary,
      image: n.image,
      onHomePage: n.onHomePage,
      paragraphs: n.body ? n.body.replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : undefined,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function newsFor(ministry: string): NewsItem[] {
  return allNews.filter((n) => n.ministry === ministry);
}

/** News from the past year that an editor chose to show on the home page. */
export function recentNews(limit = 3): NewsItem[] {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const since = cutoff.toISOString().slice(0, 10);
  return allNews.filter((n) => n.onHomePage && n.date >= since).slice(0, limit);
}
