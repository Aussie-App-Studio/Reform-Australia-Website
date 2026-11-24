import { lazy, ReactNode, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

const FindAChurchPage = lazy(() =>
  import('./pages/FindAChurchPage').then((m) => ({ default: m.FindAChurchPage }))
);
const VisionValuesPage = lazy(() =>
  import('./pages/VisionValuesPage').then((m) => ({ default: m.VisionValuesPage }))
);
const BeliefsPage = lazy(() =>
  import('./pages/BeliefsPage').then((m) => ({ default: m.BeliefsPage }))
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const MinistriesPage = lazy(() =>
  import('./pages/MinistriesPage').then((m) => ({ default: m.MinistriesPage }))
);
const MinistryPage = lazy(() =>
  import('./pages/ministries/MinistryPage').then((m) => ({ default: m.MinistryPage }))
);
const MinistryNewsPage = lazy(() =>
  import('./pages/ministries/MinistryPage').then((m) => ({ default: m.MinistryNewsPage }))
);
const ForChurchesPage = lazy(() =>
  import('./pages/ForChurchesPage').then((m) => ({ default: m.ForChurchesPage }))
);
const FormsDocumentsPage = lazy(() =>
  import('./pages/FormsDocumentsPage').then((m) => ({ default: m.FormsDocumentsPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);
const SafeChurchPage = lazy(() =>
  import('./pages/SafeChurchPage').then((m) => ({ default: m.SafeChurchPage }))
);
const SermonsPage = lazy(() =>
  import('./pages/SermonsPage').then((m) => ({ default: m.SermonsPage }))
);
const SermonPage = lazy(() =>
  import('./pages/SermonPage').then((m) => ({ default: m.SermonPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center bg-stone-50 px-4 py-16"
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
              <Route
                path="/positions-vacant"
                element={<Navigate to="/for-churches" replace />}
              />
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

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </RouteErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
