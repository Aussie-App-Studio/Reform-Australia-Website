import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface UseFocusTrapOptions {
  restoreFocus?: boolean;
  returnFocusTo?: RefObject<HTMLElement | null>;
  lockBodyScroll?: boolean;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
}

/**
 * Traps keyboard focus inside `containerRef` while `active` is true, and
 * optionally locks body scrolling and restores focus on deactivation.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  options: UseFocusTrapOptions = {}
): void {
  const { restoreFocus = true, returnFocusTo, lockBodyScroll = false } = options;

  useEffect(() => {
    if (!active) return;

    const previouslyFocused =
      returnFocusTo?.current ?? (document.activeElement as HTMLElement | null);

    let previousOverflow = '';
    if (lockBodyScroll) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const rafId = window.requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusables = getFocusableElements(container);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!activeEl || !container.contains(activeEl) || activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!activeEl || !container.contains(activeEl) || activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', handleKeyDown);

      if (lockBodyScroll) {
        document.body.style.overflow = previousOverflow;
      }

      if (restoreFocus) {
        const restoreTarget = returnFocusTo?.current ?? previouslyFocused;
        if (restoreTarget && typeof restoreTarget.focus === 'function') {
          window.requestAnimationFrame(() => {
            if (restoreTarget.isConnected) {
              restoreTarget.focus();
            }
          });
        }
      }
    };
  }, [active, containerRef, lockBodyScroll, restoreFocus, returnFocusTo]);
}
