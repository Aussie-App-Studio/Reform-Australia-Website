import { useLocation } from 'react-router-dom';
import { contentPages, getContentPageByPath, SECTION_LABELS } from '../lib/contentPages';
import { usePageTitle } from '../utils/usePageTitle';
import { NotFoundPage } from './NotFoundPage';
import { StandardPage } from './ministries/MinistryPage';

/** Renders a general content page from src/data/pages/*.json, matched by its `path`. */
export function ContentPage() {
  const { pathname } = useLocation();
  const page = getContentPageByPath(pathname);
  usePageTitle(page?.title ?? 'Page');
  if (!page) return <NotFoundPage />;
  const section = SECTION_LABELS[page.section];
  const related = contentPages
    .filter((p) => p.section === page.section && p.path !== page.path)
    .map((p) => ({ label: p.title, to: p.path }));
  return (
    <StandardPage
      page={{ ...page, name: page.title, group: 'training-planting' }}
      breadcrumbs={[{ label: section.label, to: section.to }, { label: page.title }]}
      related={related}
      relatedTitle={page.section === 'for-churches' ? 'More for churches' : 'More about us'}
    />
  );
}
