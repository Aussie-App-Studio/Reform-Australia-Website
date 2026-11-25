import { ComponentType, lazy, ReactNode, Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import legacyRedirects from './data/legacyRedirects.json';

type Loader = () => Promise<Record<string, unknown>>;
const loaders = new Map<string, Loader>();

/**
 * A page loaded on demand. Once its code has arrived it renders straight away
 * (no "Loading page" flash), which lets main.tsx load the current page's code
 * before swapping in the live app over the pre-rendered HTML.
 */
function page<P extends object>(load: Loader, name: string) {
  let Loaded: ComponentType<P> | null = null;
  const loadPage = () =>
    load().then((m) => {
      Loaded = m[name] as ComponentType<P>;
      return { default: Loaded };
    });
  const Lazy = lazy(loadPage);
  loaders.set(name, loadPage);
  return function Page(props: P) {
    // Fixed for the life of this element, so it never remounts when the code arrives.
    const [Component] = useState<ComponentType<P>>(() => Loaded ?? (Lazy as unknown as ComponentType<P>));
    return <Component {...props} />;
  };
}

const FindAChurchPage = page(() => import('./pages/FindAChurchPage'), 'FindAChurchPage');
const VisionValuesPage = page(() => import('./pages/VisionValuesPage'), 'VisionValuesPage');
const BeliefsPage = page(() => import('./pages/BeliefsPage'), 'BeliefsPage');
const HistoryPage = page(() => import('./pages/HistoryPage'), 'HistoryPage');
const MinistriesPage = page(() => import('./pages/MinistriesPage'), 'MinistriesPage');
const MinistryPage = page<{ slug: string }>(() => import('./pages/ministries/MinistryPage'), 'MinistryPage');
const MinistryNewsPage = page(() => import('./pages/ministries/MinistryPage'), 'MinistryNewsPage');
const ForChurchesPage = page(() => import('./pages/ForChurchesPage'), 'ForChurchesPage');
const FormsDocumentsPage = page(() => import('./pages/FormsDocumentsPage'), 'FormsDocumentsPage');
const ContactPage = page(() => import('./pages/ContactPage'), 'ContactPage');
const SafeChurchPage = page(() => import('./pages/SafeChurchPage'), 'SafeChurchPage');
const SermonsPage = page(() => import('./pages/SermonsPage'), 'SermonsPage');
const SermonPage = page(() => import('./pages/SermonPage'), 'SermonPage');
const ContentPage = page(() => import('./pages/ContentPage'), 'ContentPage');
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage');

/** Which page component each address uses (kept in step with <Routes> below). */
const ROUTE_PAGES: [RegExp, string][] = [
  [/^\/find-a-church$/, 'FindAChurchPage'],
  [/^\/who-we-are\/vision-values$/, 'VisionValuesPage'],
  [/^\/who-we-are\/beliefs$/, 'BeliefsPage'],
  [/^\/who-we-are\/history$/, 'HistoryPage'],
  [/^\/who-we-are\/[^/]+$/, 'ContentPage'],
  [/^\/ministries$/, 'MinistriesPage'],
  [/^\/ministries\/[^/]+\/news\/[^/]+$/, 'MinistryNewsPage'],
  [/^\/ministries\/[^/]+$/, 'MinistryPage'],
  [/^\/for-churches$/, 'ForChurchesPage'],
  [/^\/for-churches\/forms-and-documents(\/.*)?$/, 'FormsDocumentsPage'],
  [/^\/for-churches\/[^/]+$/, 'ContentPage'],
  [/^\/contact$/, 'ContactPage'],
  [/^\/safe-church(\/.*)?$/, 'SafeChurchPage'],
  [/^\/sermons$/, 'SermonsPage'],
  [/^\/sermons\/[^/]+$/, 'SermonPage'],
];

/** Loads the code for the page at this address (path without the deploy base). */
export function preloadRoute(path: string): Promise<unknown> {
  const p = path.replace(/\/$/, '') || '/';
  if (p === '/') return Promise.resolve();
  const name = ROUTE_PAGES.find(([re]) => re.test(p))?.[1] ?? 'NotFoundPage';
  return loaders.get(name)?.() ?? Promise.resolve();
}

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-loading
      className="flex min-h-screen items-start justify-center bg-stone-50 px-4 py-24"
    >
      <div className="flex items-center gap-3 text-sm font-medium text-stone-600">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-teal-600"
        />
        <span>Loading page…</span>
      </div>
    </div>
  );
}

/** Old Word of Salvation URLs were /word-of-salvation/<slug>/ — same slug here. */
function LegacySermonRedirect() {
  const { sermonId } = useParams();
  return <Navigate to={`/sermons/${sermonId ?? ''}`} replace />;
}

/**
 * Old crca.org.au addresses (e.g. /our-history/) redirect to their new pages
 * (map in src/data/legacyRedirects.json); anything else is a genuine 404.
 */
function LegacyRedirectOrNotFound() {
  const { pathname, hash } = useLocation();
  const key = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const target = (legacyRedirects as Record<string, string>)[key] ?? (legacyRedirects as Record<string, string>)[pathname];
  if (target) return <Navigate to={`${target}${hash}`} replace />;
  return <NotFoundPage />;
}

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/find-a-church" element={<FindAChurchPage />} />

              {/* Who We Are */}
              <Route path="/who-we-are/vision-values" element={<VisionValuesPage />} />
              <Route path="/who-we-are/beliefs" element={<BeliefsPage />} />
              <Route path="/who-we-are/history" element={<HistoryPage />} />

              {/* Core Sections */}
              <Route path="/ministries" element={<MinistriesPage />} />
              {/* Every ministry page uses one template, driven by src/data/ministry-pages/<slug>.json */}
              <Route path="/ministries/cadets" element={<MinistryPage slug="cadets" />} />
              <Route path="/ministries/gems" element={<MinistryPage slug="gems" />} />
              <Route path="/ministries/youth-convention" element={<MinistryPage slug="youth-convention" />} />
              <Route path="/ministries/swim" element={<MinistryPage slug="swim" />} />
              <Route path="/ministries/candidacy" element={<MinistryPage slug="candidacy" />} />
              <Route path="/ministries/shift-coaching" element={<MinistryPage slug="shift-coaching" />} />
              <Route path="/ministries/local-church-outreach-training" element={<MinistryPage slug="local-church-outreach-training" />} />
              <Route path="/ministries/missional-explorations" element={<MinistryPage slug="missional-explorations" />} />
              <Route path="/ministries/church-planting-taskforce" element={<MinistryPage slug="church-planting-taskforce" />} />
              <Route path="/ministries/ecumenical-relations" element={<MinistryPage slug="ecumenical-relations" />} />
              <Route path="/ministries/world-transform" element={<MinistryPage slug="world-transform" />} />
              <Route path="/ministries/partner-ministries" element={<MinistryPage slug="partner-ministries" />} />
              <Route path="/ministries/:slug/news/:newsId" element={<MinistryNewsPage />} />
              <Route path="/for-churches" element={<ForChurchesPage />} />
              <Route
                path="/for-churches/forms-and-documents"
                element={<FormsDocumentsPage />}
              />
              <Route
                path="/for-churches/forms-and-documents/:docId"
                element={<FormsDocumentsPage />}
              />
              <Route path="/contact" element={<ContactPage />} />

              {/* Safe Church Unit (migrated from safechurch.crca.org.au) */}
              <Route path="/safe-church/*" element={<SafeChurchPage />} />
              <Route path="/safechurch" element={<Navigate to="/safe-church" replace />} />
              <Route path="/for-churches/safe-church" element={<Navigate to="/safe-church" replace />} />

              {/* Word of Salvation sermon archive (migrated from wordofsalvation.crca.org.au) */}
              <Route path="/sermons" element={<SermonsPage />} />
              <Route path="/sermons/:sermonId" element={<SermonPage />} />
              <Route path="/word-of-salvation" element={<Navigate to="/sermons" replace />} />
              <Route path="/word-of-salvation/:sermonId" element={<LegacySermonRedirect />} />
              <Route path="/for-churches/sermons" element={<Navigate to="/sermons" replace />} />

              {/* Clean Convenience Redirects from Legacy Paths */}
              <Route path="/about" element={<Navigate to="/who-we-are/vision-values" replace />} />
              <Route path="/resources" element={<Navigate to="/for-churches" replace />} />
              <Route path="/positions-vacant" element={<Navigate to="/for-churches/positions-vacant" replace />} />
              <Route
                path="/forms"
                element={<Navigate to="/for-churches/forms-and-documents" replace />}
              />
              <Route
                path="/documents"
                element={<Navigate to="/for-churches/forms-and-documents" replace />}
              />
              <Route path="/our-beliefs" element={<Navigate to="/who-we-are/beliefs" replace />} />
              <Route path="/our-history" element={<Navigate to="/who-we-are/history" replace />} />
              <Route path="/cadets" element={<Navigate to="/ministries/cadets" replace />} />
              <Route path="/gems" element={<Navigate to="/ministries/gems" replace />} />
              <Route path="/convention" element={<Navigate to="/ministries/youth-convention" replace />} />
              <Route
                path="/youth-convention"
                element={<Navigate to="/ministries/youth-convention" replace />}
              />
              <Route path="/swim" element={<Navigate to="/ministries/swim" replace />} />
              <Route path="/candidacy" element={<Navigate to="/ministries/candidacy" replace />} />
              <Route
                path="/shift-coaching"
                element={<Navigate to="/ministries/shift-coaching" replace />}
              />
              <Route
                path="/local-church-outreach-training"
                element={<Navigate to="/ministries/local-church-outreach-training" replace />}
              />
              <Route
                path="/missional-explorations"
                element={<Navigate to="/ministries/missional-explorations" replace />}
              />
              <Route
                path="/church-planting-taskforce"
                element={<Navigate to="/ministries/church-planting-taskforce" replace />}
              />
              <Route
                path="/ecumenical-relations"
                element={<Navigate to="/ministries/ecumenical-relations" replace />}
              />

              {/* General content pages (src/data/pages/*.json) */}
              <Route path="/who-we-are/:pageSlug" element={<ContentPage />} />
              <Route path="/for-churches/:pageSlug" element={<ContentPage />} />

              <Route path="*" element={<LegacyRedirectOrNotFound />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
