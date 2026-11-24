import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** A small "back to top" button that appears once the reader is well down a long page. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 2.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="no-print fixed bottom-4 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 bg-white/95 text-navy-900 shadow-lg backdrop-blur hover:border-navy-900 sm:bottom-6 sm:right-6"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
