import { lazy, ReactNode, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
const CadetsPage = lazy(() =>
  import('./pages/ministries/CadetsPage').then((m) => ({ default: m.CadetsPage }))
);
const GemsPage = lazy(() =>
  import('./pages/ministries/GemsPage').then((m) => ({ default: m.GemsPage }))
);
const YouthConventionPage = lazy(() =>
  import('./pages/ministries/YouthConventionPage').then((m) => ({
    default: m.YouthConventionPage,
  }))
);
const SwimPage = lazy(() =>
  import('./pages/ministries/SwimPage').then((m) => ({ default: m.SwimPage }))
);
const CandidacyPage = lazy(() =>
  import('./pages/ministries/CandidacyPage').then((m) => ({ default: m.CandidacyPage }))
);
const ShiftCoachingPage = lazy(() =>
  import('./pages/ministries/ShiftCoachingPage').then((m) => ({
    default: m.ShiftCoachingPage,
  }))
);
const MinistryDetailPage = lazy(() =>
  import('./pages/ministries/MinistryDetailPage').then((m) => ({
    default: m.MinistryDetailPage,
  }))
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

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>;
}

export function App() {
  return (
    <BrowserRouter>
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
              <Route path="/ministries/cadets" element={<CadetsPage />} />
              <Route path="/ministries/gems" element={<GemsPage />} />
              <Route path="/ministries/youth-convention" element={<YouthConventionPage />} />
              <Route path="/ministries/swim" element={<SwimPage />} />
              <Route path="/ministries/candidacy" element={<CandidacyPage />} />
              <Route path="/ministries/shift-coaching" element={<ShiftCoachingPage />} />
              <Route
                path="/ministries/local-church-outreach-training"
                element={<MinistryDetailPage slug="local-church-outreach-training" />}
              />
              <Route
                path="/ministries/missional-explorations"
                element={<MinistryDetailPage slug="missional-explorations" />}
              />
              <Route
                path="/ministries/church-planting-taskforce"
                element={<MinistryDetailPage slug="church-planting-taskforce" />}
              />
              <Route
                path="/ministries/ecumenical-relations"
                element={<MinistryDetailPage slug="ecumenical-relations" />}
              />
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
