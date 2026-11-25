import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, ExternalLink, MapPin, Menu, X } from 'lucide-react';
import { CrcaLogo } from './CrcaLogo';
import { navMenus, type NavLinkItem, type NavMenu } from '../data/navigation';
import { useFocusTrap } from '../utils/useFocusTrap';

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
  const [mobileSection, setMobileSection] = useState<MenuId>(null);
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Keyboard focus stays in the phone menu while it is open, and returns to the menu button after.
  useFocusTrap(drawerRef, mobileOpen, { returnFocusTo: menuButtonRef });
  const closeTimer = useRef<number | null>(null);
  /** How the open menu was opened: by hovering (closes when the mouse leaves) or by a click/tap/key. */
  const openedBy = useRef<'hover' | 'click'>('click');
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

  // Stop the page behind the phone menu from scrolling.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
    if (openedBy.current === 'click') return;
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
              <Fragment key={m.id}>
                <button
                  type="button"
                  aria-expanded={openMenu === m.id}
                  aria-controls="site-menu-panel"
                  onPointerEnter={(e) => {
                    // Mouse only: on touch screens the tap (click) opens the menu.
                    if (e.pointerType !== 'mouse') return;
                    clearTimer();
                    if (openMenu !== m.id) {
                      openedBy.current = 'hover';
                      setOpenMenu(m.id);
                    }
                  }}
                  onClick={() => {
                    clearTimer();
                    if (openMenu === m.id && openedBy.current === 'hover') {
                      // Already open from hovering: a click keeps it open (and pinned).
                      openedBy.current = 'click';
                      return;
                    }
                    openedBy.current = 'click';
                    setOpenMenu(openMenu === m.id ? null : m.id);
                  }}
                  className={topLink(isActive(m), openMenu === m.id)}
                >
                  {m.label}
                  <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${openMenu === m.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {/* The panel follows its button, so keyboard users tab straight into it. */}
                {current?.id === m.id && (
                  <div id="site-menu-panel" className="absolute inset-x-0 top-full hidden border-b border-stone-200 bg-white shadow-[0_12px_24px_-12px_rgba(0,34,76,0.18)] lg:block">
                    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-10 px-8 py-9">
                      <div className="col-span-3 pr-8">
                        <p className="font-serif text-2xl font-semibold text-navy-900">{current.label}</p>
                        <p className="mt-2 leading-relaxed text-stone-600">{current.overview.blurb}</p>
                        <Link to={current.overview.to} className="mt-4 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
                          {current.overview.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                      <div className={`col-span-9 grid grid-cols-3 gap-10`}>
                        {current.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="text-sm font-semibold text-stone-600">{col.heading}</p>
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
              </Fragment>
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
            {/* Very narrow phones: just the pin, so the logo keeps its room */}
            <Link
              to="/find-a-church"
              className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-navy-900 px-3 text-sm font-semibold text-white max-[399px]:w-11 max-[399px]:px-0"
            >
              <MapPin className="hidden h-4 w-4 text-teal-400 max-[399px]:block min-[420px]:block" aria-hidden="true" />
              <span className="max-[399px]:sr-only">Find a church</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                // open on the section for the current page
                if (!mobileOpen) setMobileSection(navMenus.find((m) => isActive(m))?.id ?? null);
                setMobileOpen((v) => !v);
              }}
              ref={menuButtonRef}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 text-navy-900"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Phone menu: a panel that slides in from the right over a dimmed page.
          Focus stays inside it, the page behind doesn't scroll, Escape or the backdrop closes it. */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? 'visible' : 'invisible delay-300'} transition-[visibility] duration-0`}
        inert={!mobileOpen}
      >
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-navy-950/50 transition-opacity duration-300 motion-reduce:transition-none ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          ref={drawerRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 right-0 flex w-[min(88vw,26rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
            <span className="font-serif text-xl font-semibold text-navy-900">Menu</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 text-navy-900"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="flex-1 overflow-y-auto overscroll-contain px-5">
            <ul>
              <li className="border-b border-stone-200">
                <NavLink to="/" end className="flex min-h-14 items-center font-serif text-xl font-semibold text-navy-900">
                  Home
                </NavLink>
              </li>
              {navMenus.map((m) => {
                const open = mobileSection === m.id;
                const panelId = `mobile-menu-${m.id}`;
                return (
                  <li key={m.id} className="border-b border-stone-200">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setMobileSection(open ? null : m.id)}
                      className="flex min-h-14 w-full items-center justify-between gap-3 text-left font-serif text-xl font-semibold text-navy-900"
                    >
                      <span className="flex items-center gap-2.5">
                        {isActive(m) && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal-500" />}
                        {m.label}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {open && (
                      <div id={panelId} className="pb-3">
                        <Link to={m.overview.to} className="mb-1 flex min-h-11 items-center gap-1.5 font-semibold text-teal-700">
                          {m.overview.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        {m.columns.map((col) => (
                          <div key={col.heading} className="mt-3">
                            {m.columns.length > 1 && <p className="pb-1 text-sm font-semibold text-stone-600">{col.heading}</p>}
                            <ul className="border-t border-stone-100">
                              {col.items.map((item) => (
                                <li key={item.to} className="border-b border-stone-100 last:border-b-0">
                                  <MenuLink item={item} className="flex min-h-11 items-center text-navy-800" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
              <li className="border-b border-stone-200">
                <NavLink to="/contact" className="flex min-h-14 items-center font-serif text-xl font-semibold text-navy-900">
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="border-t border-stone-200 bg-stone-50 px-5 py-4">
            <Link
              to="/find-a-church"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-4 font-semibold text-white hover:bg-navy-800"
            >
              <MapPin className="h-4 w-4 text-teal-400" aria-hidden="true" />
              Find a church
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
