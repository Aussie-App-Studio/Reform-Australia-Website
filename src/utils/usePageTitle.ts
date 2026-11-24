import { useEffect } from 'react';

export const SITE_TITLE_SUFFIX = 'Christian Reformed Churches of Australia';
export const DEFAULT_DESCRIPTION =
  'Over 50 Reformed, Bible-based congregations across Australia since 1951. Find a church, read what we believe, and find forms, sermons and Safe Church resources.';

/** The address the site will live at. Used for canonical links, share tags and the sitemap. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://crca.org.au').replace(/\/$/, '');
const DEFAULT_IMAGE = '/images/og/crca-default.jpg';

export function formatPageTitle(title: string | null | undefined): string {
  // Short suffix: Google shows about 60 characters of a title.
  return title ? `${title} | CRCA` : `${SITE_TITLE_SUFFIX} | Reforming to Reach the Lost for Christ`;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Path of the current page without the deploy base (e.g. /v2/) or a trailing slash. */
function sitePath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = window.location.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length);
  return p.replace(/\/$/, '') || '/';
}

export interface PageMeta {
  title: string | null | undefined;
  description?: string | null;
  /** A path under public/ (e.g. /images/...) or a full URL. */
  image?: string | null;
  /** Keep this page out of search results (e.g. "page not found"). */
  noindex?: boolean;
}

/** Sets the tab title, description, canonical link and social share tags. */
export function applyPageMeta({ title, description, image, noindex }: PageMeta) {
  const fullTitle = formatPageTitle(title);
  const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 300);
  const url = `${SITE_URL}${sitePath() === '/' ? '/' : sitePath()}`;
  const img = image || DEFAULT_IMAGE;
  const imgUrl = /^https?:/.test(img) ? img : `${SITE_URL}${img.replace(/^\/?/, '/').replace(import.meta.env.BASE_URL, '/')}`;
  document.title = fullTitle;
  setMeta('name', 'description', desc);
  setLink('canonical', url);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', SITE_TITLE_SUFFIX);
  setMeta('property', 'og:title', title || SITE_TITLE_SUFFIX);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', imgUrl);
  setMeta('property', 'og:locale', 'en_AU');
  setMeta('name', 'twitter:card', 'summary_large_image');
  // The whole site is kept out of search results until launch (see scripts/prerender.mjs);
  // a page-level noindex is only ever added, never removed.
  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"][data-site]');
  if (!robots) {
    const pageRobots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) setMeta('name', 'robots', 'noindex');
    else pageRobots?.remove();
  }
}

/** Sets the page's title and description (see applyPageMeta). */
export function usePageTitle(title: string | null | undefined, description?: string | null, image?: string | null) {
  useEffect(() => {
    applyPageMeta({ title, description, image });
  }, [title, description, image]);
}

export function usePageMeta(meta: PageMeta) {
  const { title, description, image, noindex } = meta;
  useEffect(() => {
    applyPageMeta({ title, description, image, noindex });
  }, [title, description, image, noindex]);
}

/** Titles and descriptions for fixed routes (pages that don't set their own). */
export const ROUTE_META: Record<string, { title: string | null; description?: string }> = {
  '/': { title: null },
  '/find-a-church': {
    title: 'Find a church',
    description: 'Find a Christian Reformed church near you. Search 54 CRCA congregations across Australia by suburb, postcode or name, with service times and addresses.',
  },
  '/who-we-are/vision-values': {
    title: 'Vision and values',
    description: 'The mission, vision, core values, fourfold task and strategies of the Christian Reformed Churches of Australia.',
  },
  '/who-we-are/beliefs': {
    title: 'What we believe',
    description: 'The CRCA holds to the Bible as God’s Word and confesses the ecumenical creeds and the Three Forms of Unity: the Belgic Confession, Heidelberg Catechism and Canons of Dort.',
  },
  '/who-we-are/history': {
    title: 'Our history',
    description: 'How the Christian Reformed Churches of Australia began in 1951 with Dutch migrants, and when each of our congregations started.',
  },
  '/ministries': {
    title: 'Ministries',
    description: 'CRCA ministries: Cadets, GEMS, Youth Convention, World Transform, SWIM, candidacy, church planting, coaching and outreach training.',
  },
  '/for-churches': {
    title: 'For churches',
    description: 'Resources for CRCA churches and office bearers: forms and documents, the Church Order, reading sermons, Safe Church, regional counsellors and positions vacant.',
  },
  '/for-churches/forms-and-documents': {
    title: 'Forms and documents',
    description: 'Liturgical forms, creeds and confessions, worship readings and the 2022 Church Order of the Christian Reformed Churches of Australia.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Contact the national office of the Christian Reformed Churches of Australia.',
  },
};
