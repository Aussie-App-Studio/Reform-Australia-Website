import { useEffect } from 'react';

export const SITE_TITLE_SUFFIX = 'Christian Reformed Churches of Australia';

export function formatPageTitle(title: string | null | undefined): string {
  return title ? `${title} | ${SITE_TITLE_SUFFIX}` : `${SITE_TITLE_SUFFIX} | Reforming to Reach the Lost for Christ`;
}

/** Sets document.title for the current page. */
export function usePageTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = formatPageTitle(title);
  }, [title]);
}

/** Titles for fixed routes (pages that don't set their own). */
export const ROUTE_TITLES: Record<string, string | null> = {
  '/': null,
  '/find-a-church': 'Find a Church',
  '/who-we-are/vision-values': 'Vision & Values',
  '/who-we-are/beliefs': 'What We Believe',
  '/who-we-are/history': 'Our History',
  '/ministries': 'Ministries',
  '/ministries/cadets': 'Cadets',
  '/ministries/gems': 'GEMS Girls’ Clubs',
  '/ministries/youth-convention': 'Youth Convention',
  '/ministries/swim': 'Solomon Islands SWIM',
  '/ministries/candidacy': 'Candidacy',
  '/ministries/shift-coaching': 'Shift Coaching',
  '/ministries/local-church-outreach-training': 'Local Church Outreach Training',
  '/ministries/missional-explorations': 'Missional Explorations',
  '/ministries/church-planting-taskforce': 'Church Planting Taskforce',
  '/ministries/ecumenical-relations': 'Ecumenical Relations',
  '/for-churches': 'For Churches',
  '/for-churches/forms-and-documents': 'Forms & Documents',
  '/contact': 'Contact Us',
};
