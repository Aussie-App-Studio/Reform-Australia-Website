import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // After a new deployment, a tab that was already open still references the old,
    // now-deleted page bundles. Reload once to pick up the new version instead of
    // showing an error. The timestamp guard prevents a reload loop.
    const isStaleChunk = /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|error loading dynamically/i.test(
      `${error?.name ?? ''} ${error?.message ?? ''}`
    );
    if (isStaleChunk) {
      try {
        const last = Number(sessionStorage.getItem('crca-chunk-reload') ?? 0);
        if (Date.now() - last > 30_000) {
          sessionStorage.setItem('crca-chunk-reload', String(Date.now()));
          window.location.reload();
          return;
        }
      } catch {
        /* storage unavailable: fall through to the error screen */
      }
    }
    console.error('CRCA Website rendering error:', error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKey !== prevProps.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="bg-stone-50 py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-xl rounded-lg border border-stone-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-gold-400/50 bg-gold-50 text-stone-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
              Something went wrong displaying this page
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              An unexpected error occurred while rendering this section. Reload the page or return
              to the CRCA homepage to continue browsing.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
              >
                <RotateCw className="h-4 w-4" />
                <span>Reload Page</span>
              </button>
              <a
                href={import.meta.env.BASE_URL}
                className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-stone-50"
              >
                <ArrowLeft className="h-4 w-4 text-teal-600" />
                <span>Back to Home</span>
              </a>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
