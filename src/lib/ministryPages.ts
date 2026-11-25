// One JSON file per ministry in src/data/ministry-pages/, all rendered by the
// same template (src/pages/ministries/MinistryPage.tsx). This is the
// "standardised template" pattern Synod 2024 asked for (Acts Art. 10).

export type MinistryGroup = 'next-gen' | 'training-planting' | 'global-mission';

export interface MinistryImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export interface MinistryNewsItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary?: string;
  image?: string;
  paragraphs?: string[];
}

export interface MinistryPageData {
  slug: string;
  name: string;
  group: MinistryGroup;
  summary: string;
  hero?: MinistryImage;
  /** The ministry's own logo, shown in the page header and the Ministries list. */
  logo?: { src: string; alt: string };
  body: { id?: string; heading?: string; paragraphs?: string[]; list?: string[]; image?: MinistryImage }[];
  team?: { name: string; role?: string; text?: string; photo?: string }[];
  gallery?: MinistryImage[];
  news?: MinistryNewsItem[];
  steps?: { heading: string; items: { title: string; text: string }[] };
  facts?: { label: string; value: string }[];
  contact?: { name?: string; role?: string; email?: string; phone?: string; topic?: string };
  actions?: { label: string; url: string; kind: 'primary' | 'secondary' }[];
  resources?: { label: string; url: string; type: 'pdf' | 'link' | 'video'; note?: string }[];
  video?: { youtubeId: string; title: string };
  sources?: string[];
  needsChecking?: string[];
}

export const GROUP_LABELS: Record<MinistryGroup, string> = {
  'next-gen': 'Next generation',
  'training-planting': 'Training and church planting',
  'global-mission': 'Mission and partnerships',
};

const modules = import.meta.glob<MinistryPageData>('../data/ministry-pages/*.json', { eager: true, import: 'default' });

export const ministryPages: MinistryPageData[] = Object.values(modules).sort((a, b) => a.name.localeCompare(b.name));

export function getMinistryPage(slug: string): MinistryPageData | undefined {
  return ministryPages.find((m) => m.slug === slug);
}
