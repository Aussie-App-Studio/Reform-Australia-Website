// General content pages (e.g. Regional counsellors, Positions vacant, Trowel and Sword),
// one JSON file each in src/data/pages/, rendered by the shared StandardPage template.
import type { MinistryPageData } from './ministryPages';

export interface ContentPageData extends Omit<MinistryPageData, 'group' | 'name'> {
  path: string; // route, e.g. "/for-churches/regional-counsellors"
  section: 'who-we-are' | 'for-churches';
  title: string;
  icon?: string; // lucide-react icon name, used in lists
}

const modules = import.meta.glob<ContentPageData>('../data/pages/*.json', { eager: true, import: 'default' });

export const contentPages: ContentPageData[] = Object.values(modules).sort((a, b) => a.title.localeCompare(b.title));

export const SECTION_LABELS: Record<ContentPageData['section'], { label: string; to: string }> = {
  'who-we-are': { label: 'Who we are', to: '/who-we-are/vision-values' },
  'for-churches': { label: 'For churches', to: '/for-churches' },
};

export function getContentPageByPath(path: string): ContentPageData | undefined {
  const clean = path.replace(/\/$/, '');
  return contentPages.find((p) => p.path === clean);
}
