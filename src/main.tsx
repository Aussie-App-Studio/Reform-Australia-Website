import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App, preloadRoute } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const app = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const path = (window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : window.location.pathname).replace(/\/$/, '') || '/';
const staticRoot = document.getElementById('root')!;
// scripts/prerender.mjs saves every page as finished HTML and marks it with the page it shows.
const prerenderedFor = staticRoot.getAttribute('data-prerendered');

/** True once the live page has finished loading its content. */
function isReady(el: HTMLElement) {
  return !!el.querySelector('#main-content > *') && !el.querySelector('[data-loading]');
}

if (prerenderedFor === null || (prerenderedFor !== '*' && prerenderedFor !== path)) {
  // Not pre-rendered (local dev), or a different page's HTML (GitHub Pages' 404 fallback).
  staticRoot.replaceChildren();
  staticRoot.removeAttribute('data-prerendered');
  createRoot(staticRoot).render(app);
} else {
  // Keep the pre-rendered page on screen while the live app builds an identical copy out of
  // sight, then swap them in one step, so nothing flashes or jumps.
  const live = document.createElement('div');
  live.setAttribute('aria-hidden', 'true');
  live.style.cssText = 'position:absolute;top:0;left:0;width:100%;visibility:hidden;pointer-events:none;';
  document.body.appendChild(live);
  let swapped = false;
  const swap = () => {
    if (swapped) return;
    swapped = true;
    observer.disconnect();
    const y = window.scrollY;
    const focusedId = document.activeElement instanceof HTMLElement ? document.activeElement.id : '';
    staticRoot.remove();
    live.removeAttribute('style');
    live.removeAttribute('aria-hidden');
    live.id = 'root';
    window.scrollTo(0, y);
    if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
  };
  const observer = new MutationObserver(() => {
    if (isReady(live)) requestAnimationFrame(swap);
  });
  observer.observe(live, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-loading'] });
  // Never leave the visitor on the static copy for long, even if something is slow.
  setTimeout(swap, 6000);
  preloadRoute(path)
    .catch(() => undefined)
    .then(() => {
      createRoot(live).render(app);
    });
}
