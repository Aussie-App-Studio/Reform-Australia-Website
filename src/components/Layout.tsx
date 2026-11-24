import { ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BackToTop } from './BackToTop';
import { applyPageMeta, ROUTE_META } from '../utils/usePageTitle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);

  // Fixed routes get their title and description here; dynamic pages call usePageTitle themselves.
  useEffect(() => {
    const key = pathname.replace(/\/$/, '') || '/';
    if (key in ROUTE_META) applyPageMeta(ROUTE_META[key]);
  }, [pathname]);
  const firstRender = useRef(true);

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    const isFirst = firstRender.current;
    firstRender.current = false;
    // After moving to a new page, put keyboard and screen-reader focus at the start of the content.
    if (!isFirst && prevPathname !== pathname) {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    }

    if (pathname.startsWith('/for-churches/forms-and-documents/') && hash) {
      if (prevPathname === pathname) {
        return;
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (hash) {
      let decodedId = hash.slice(1);
      try {
        decodedId = decodeURIComponent(decodedId);
      } catch {
        // Keep raw fragment if malformed
      }
      const target = document.getElementById(decodedId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    // On first load the browser is already at the right place (the visitor may have
    // scrolled while the pre-rendered page was showing).
    if (!isFirst) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-navy-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 scroll-mt-[var(--site-header-height,72px)] focus:outline-none"
      >
        {children}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
