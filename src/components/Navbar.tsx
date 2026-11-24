import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, ExternalLink, MapPin, Menu, X } from 'lucide-react';
import { CrcaLogo } from './CrcaLogo';
import { navMenus, type NavLinkItem, type NavMenu } from '../data/navigation';

type MenuId = NavMenu['id'] | null;

function MenuLink({ item, className, onNavigate }: { item: NavLinkItem; className: string; onNavigate?: () => void }) {
  if (item.isExternal) {
    return (
      <a href={item.to} target="_blank" rel="noopener noreferrer" className={className}>
        <span>{item.label}</span>
        <ExternalLink className="ml-1.5 inline h-3.5 w-3.5 text-stone-400" aria-label="(opens in a new tab)" />
      </a>
    );
  }
  return (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();

  const clearTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Close everything on navigation.
  useEffect(() => {
    clearTimer();
    setOpenMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  // Keep --site-header-height in sync for sticky elements further down the page.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--site-header-height', `${Math.round(el.getBoundingClientRect().height)}px`);
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  // Outside click / Escape closes menus.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimer();
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const isActive = (m: NavMenu) => m.activePrefixes.some((p) => location.pathname.startsWith(p));
  const current = navMenus.find((m) => m.id === openMenu) ?? null;

  const scheduleClose = () => {
    clearTimer();
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 150);
  };

  const topLink = (active: boolean, open = false) =>
    `relative inline-flex items-center gap-1 px-3 py-2 text-[0.95rem] font-semibold transition-colors after:absolute after:inset-x-3 after:-bottom-[1.05rem] after:h-[3px] after:rounded-full ${
      active ? 'text-navy-900 after:bg-teal-500' : open ? 'text-navy-900 after:bg-stone-300' : 'text-navy-800 hover:text-teal-700 after:bg-transparent'
    }`;

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white print:hidden" onMouseLeave={scheduleClose} onMouseEnter={clearTimer}>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="min-w-0 py-0.5" aria-label="Christian Reformed Churches of Australia, home">
            <CrcaLogo variant="dark" />
          </Link>

          {/* Desktop */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {navMenus.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-expanded={openMenu === m.id}
                aria-controls="site-menu-panel"
                onMouseEnter={() => {
                  clearTimer();
                  setOpenMenu(m.id);
                }}
                onClick={() => setOpenMenu((prev) => (prev === m.id ? null : m.id))}
                className={topLink(isActive(m), openMenu === m.id)}
              >
                {m.label}
                <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${openMenu === m.id ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            ))}
            <NavLink to="/contact" onMouseEnter={() => setOpenMenu(null)} className={({ isActive: a }) => topLink(a)}>
              Contact
            </NavLink>
            <Link
              to="/find-a-church"
              onMouseEnter={() => setOpenMenu(null)}
              className="ml-3 inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-navy-800"
            >
              <MapPin className="h-4 w-4 text-teal-400" aria-hidden="true" />
              Find a church
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Link to="/find-a-church" className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-3 py-2 text-sm font-semibold text-white">
              <MapPin className="h-4 w-4 text-teal-400" aria-hidden="true" />
              Find a church
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="inline-flex items-center justify-center rounded-md border border-stone-300 p-2 text-navy-900"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop dropdown panel (same layout for every menu) */}
      {current && (
        <div id="site-menu-panel" className="absolute inset-x-0 top-full hidden border-b border-stone-200 bg-white shadow-[0_12px_24px_-12px_rgba(0,34,76,0.18)] lg:block">
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-10 px-8 py-9">
            <div className="col-span-3 border-r border-stone-200 pr-8">
              <p className="font-serif text-2xl font-semibold text-navy-900">{current.label}</p>
              <p className="mt-2 leading-relaxed text-stone-600">{current.overview.blurb}</p>
              <Link to={current.overview.to} className="mt-4 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
                {current.overview.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className={`col-span-9 grid gap-10 ${current.columns.length === 3 ? 'grid-cols-3' : 'grid-cols-3'}`}>
              {current.columns.map((col) => (
                <div key={col.heading}>
                  <p className="border-b border-stone-200 pb-2 text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">{col.heading}</p>
                  <ul className="mt-2">
                    {col.items.map((item) => (
                      <li key={item.to}>
                        <MenuLink item={item} className="block py-1.5 text-[1.02rem] text-navy-900 hover:text-teal-700 hover:underline underline-offset-4" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <nav aria-label="Main" className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto border-b border-stone-200 bg-white lg:hidden">
          <div className="space-y-7 px-4 py-6 sm:px-6">
            {navMenus.map((m) => (
              <div key={m.id}>
                <Link to={m.overview.to} className="font-serif text-xl font-semibold text-navy-900">
                  {m.label}
                </Link>
                {m.columns.map((col) => (
                  <ul key={col.heading} className="mt-2 border-t border-stone-200">
                    {col.items.map((item) => (
                      <li key={item.to} className="border-b border-stone-100">
                        <MenuLink item={item} className="block py-2.5 text-navy-800" />
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            ))}
            <Link to="/contact" className="block font-serif text-xl font-semibold text-navy-900">
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
