import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ExternalLink,
  MapPin,
  Menu,
  X,
} from 'lucide-react';
import { CrcaLogo } from './CrcaLogo';
import {
  forChurchesNavItems,
  ministryMegaMenuColumns,
  whoWeAreNavItems,
} from '../data/navigation';

type OpenMenu = 'who-we-are' | 'ministries' | 'for-churches' | null;

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [pinnedMenu, setPinnedMenu] = useState<OpenMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<OpenMenu>('who-we-are');
  const headerRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const location = useLocation();

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  // Close menus whenever route changes
  useEffect(() => {
    clearCloseTimer();
    setOpenMenu(null);
    setPinnedMenu(null);
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  // Keep --site-header-height synced with rendered sticky header height
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    function updateHeight() {
      if (!headerRef.current) return;
      const height = Math.round(headerRef.current.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--site-header-height', `${height}px`);
    }

    updateHeight();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateHeight);
      observer.observe(el);
    }
    window.addEventListener('resize', updateHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        clearCloseTimer();
        setOpenMenu(null);
        setPinnedMenu(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        clearCloseTimer();
        setOpenMenu(null);
        setPinnedMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearCloseTimer();
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleDesktopTriggerClick(menu: Exclude<OpenMenu, null>) {
    clearCloseTimer();
    if (pinnedMenu === menu) {
      setPinnedMenu(null);
      setOpenMenu(null);
    } else {
      setPinnedMenu(menu);
      setOpenMenu(menu);
    }
  }

  function handleDesktopMouseEnter(menu: Exclude<OpenMenu, null>) {
    clearCloseTimer();
    if (!pinnedMenu || pinnedMenu === menu) {
      setOpenMenu(menu);
    }
  }

  function handleDesktopMouseLeave(menu: Exclude<OpenMenu, null>) {
    if (pinnedMenu !== menu) {
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        setOpenMenu((prev) => (prev === menu ? null : prev));
        closeTimerRef.current = null;
      }, 120);
    }
  }

  const isWhoWeAreActive = location.pathname.startsWith('/who-we-are');
  const isMinistriesActive = location.pathname.startsWith('/ministries');
  const isForChurchesActive = location.pathname.startsWith('/for-churches');

  return (
    <header ref={headerRef} className="sticky top-0 z-40 print:hidden">
      {/* Main Navigation Bar */}
      <div className="bg-white/95 border-b border-stone-200">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo (Home link — removes redundant "Home" text nav item) */}
          <Link
            to="/"
            className="min-w-0 rounded-lg py-0.5 transition-opacity hover:opacity-90"
            aria-label="Christian Reformed Churches of Australia — Home"
          >
            <CrcaLogo variant="dark" />
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1">
            {/* Who We Are Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDesktopMouseEnter('who-we-are')}
              onMouseLeave={() => handleDesktopMouseLeave('who-we-are')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'who-we-are'}
                onClick={() => handleDesktopTriggerClick('who-we-are')}
                className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isWhoWeAreActive || openMenu === 'who-we-are'
                    ? 'bg-navy-50 text-navy-900'
                    : 'text-navy-800 hover:bg-stone-100 hover:text-navy-900'
                }`}
              >
                <span>Who We Are</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    openMenu === 'who-we-are' ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>

              {openMenu === 'who-we-are' && (
                <div className="absolute left-0 top-full pt-2 w-80">
                  <div className="rounded-md border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-navy-900/5">
                    {whoWeAreNavItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="block rounded-lg px-3.5 py-2.5 transition-colors hover:bg-stone-50 group"
                      >
                        <div className="text-sm font-semibold text-navy-900 group-hover:text-teal-700">
                          {item.label}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                            {item.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ministries Mega-Menu */}
            <div
              className="py-3.5 -my-3.5"
              onMouseEnter={() => handleDesktopMouseEnter('ministries')}
              onMouseLeave={() => handleDesktopMouseLeave('ministries')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'ministries'}
                onClick={() => handleDesktopTriggerClick('ministries')}
                className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isMinistriesActive || openMenu === 'ministries'
                    ? 'bg-navy-50 text-navy-900'
                    : 'text-navy-800 hover:bg-stone-100 hover:text-navy-900'
                }`}
              >
                <span>Ministries</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    openMenu === 'ministries' ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>

              {openMenu === 'ministries' && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 w-[min(94vw,64rem)] pt-2">
                  <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-2xl ring-1 ring-navy-900/5">
                    <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                      <div>
                        <h3 className="font-serif text-base font-bold text-navy-900">
                          CRCA Ministries & Partnerships
                        </h3>
                        <p className="text-xs text-stone-600">
                          Supporting local congregations, rising generations, and global mission
                        </p>
                      </div>
                      <Link
                        to="/ministries"
                        className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      >
                        View All Ministries →
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      {ministryMegaMenuColumns.map((col) => (
                        <div key={col.id} className="space-y-2.5">
                          <div className="border-b border-gold-400/40 pb-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
                              {col.heading}
                            </div>
                            <p className="text-[11px] text-stone-600">{col.subtitle}</p>
                          </div>
                          <ul className="space-y-1">
                            {col.items.map((item) => (
                              <li key={item.label}>
                                {item.isExternal ? (
                                  <a
                                    href={item.to}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block rounded-lg px-2.5 py-1.5 transition-colors hover:bg-stone-50"
                                  >
                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-900 group-hover:text-teal-700">
                                      <span>{item.label}</span>
                                      <ExternalLink className="h-3 w-3 opacity-60" />
                                    </div>
                                    {item.description && (
                                      <p className="text-xs text-stone-600 line-clamp-1">
                                        {item.description}
                                      </p>
                                    )}
                                  </a>
                                ) : (
                                  <Link
                                    to={item.to}
                                    className="group block rounded-lg px-2.5 py-1.5 transition-colors hover:bg-stone-50"
                                  >
                                    <div className="text-sm font-semibold text-navy-900 group-hover:text-teal-700">
                                      {item.label}
                                    </div>
                                    {item.description && (
                                      <p className="text-xs text-stone-600 line-clamp-1">
                                        {item.description}
                                      </p>
                                    )}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* For Churches Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDesktopMouseEnter('for-churches')}
              onMouseLeave={() => handleDesktopMouseLeave('for-churches')}
            >
              <button
                type="button"
                aria-expanded={openMenu === 'for-churches'}
                onClick={() => handleDesktopTriggerClick('for-churches')}
                className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isForChurchesActive || openMenu === 'for-churches'
                    ? 'bg-navy-50 text-navy-900'
                    : 'text-navy-800 hover:bg-stone-100 hover:text-navy-900'
                }`}
              >
                <span>For Churches</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-150 ${
                    openMenu === 'for-churches' ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>

              {openMenu === 'for-churches' && (
                <div className="absolute right-0 top-full z-50 pt-2 w-96">
                  <div className="rounded-md border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-navy-900/5">
                    <Link
                      to="/for-churches"
                      className="mb-1.5 flex items-center justify-between gap-3 rounded-lg border-b border-stone-200 px-3.5 pb-3 pt-2.5 transition-colors hover:bg-stone-50 group"
                    >
                      <div>
                        <div className="text-sm font-bold text-navy-900 group-hover:text-teal-700">
                          Leader &amp; Elder Hub
                        </div>
                        <p className="mt-0.5 text-xs text-stone-600">
                          Governance, liturgical forms, Church Order &amp; pastoral tools
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-900 group-hover:bg-teal-50 group-hover:text-teal-700">
                        Overview →
                      </span>
                    </Link>

                    <div className="space-y-0.5">
                      {forChurchesNavItems.map((item) =>
                        item.isExternal ? (
                          <a
                            key={item.label}
                            href={item.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-3.5 py-2 transition-colors hover:bg-stone-50 group"
                          >
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-navy-900 group-hover:text-teal-700">
                              <span>{item.label}</span>
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </div>
                            {item.description && (
                              <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                                {item.description}
                              </p>
                            )}
                          </a>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="block rounded-lg px-3.5 py-2 transition-colors hover:bg-stone-50 group"
                          >
                            <div className="text-sm font-semibold text-navy-900 group-hover:text-teal-700">
                              {item.label}
                            </div>
                            {item.description && (
                              <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                                {item.description}
                              </p>
                            )}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-navy-50 text-navy-900'
                    : 'text-navy-800 hover:bg-stone-100 hover:text-navy-900'
                }`
              }
            >
              Contact
            </NavLink>

            <div className="pl-3">
              <Link
                to="/find-a-church"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-teal-700 hover:shadow focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <MapPin className="h-4 w-4" />
                <span>Find a Church</span>
              </Link>
            </div>
          </nav>

          {/* Mobile Primary CTA + Menu Button */}
          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            <Link
              to="/find-a-church"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Find a Church</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="inline-flex items-center justify-center rounded-lg border border-stone-200 p-2 text-navy-900 hover:bg-stone-100"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-white shadow-xl max-h-[calc(100vh-var(--site-header-height,72px))] overflow-y-auto">
          <div className="space-y-3 px-4 py-5">
            {/* Who We Are Accordion */}
            <div className="rounded-md border border-stone-200 bg-stone-50/70">
              <button
                type="button"
                aria-expanded={mobileSection === 'who-we-are'}
                onClick={() =>
                  setMobileSection((prev) => (prev === 'who-we-are' ? null : 'who-we-are'))
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-900"
              >
                <span>Who We Are</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileSection === 'who-we-are' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'who-we-are' && (
                <div className="space-y-1 border-t border-stone-200 px-3 py-2">
                  {whoWeAreNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Ministries Accordion */}
            <div className="rounded-md border border-stone-200 bg-stone-50/70">
              <button
                type="button"
                aria-expanded={mobileSection === 'ministries'}
                onClick={() =>
                  setMobileSection((prev) => (prev === 'ministries' ? null : 'ministries'))
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-900"
              >
                <span>Ministries</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileSection === 'ministries' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'ministries' && (
                <div className="space-y-4 border-t border-stone-200 px-4 py-3">
                  <Link
                    to="/ministries"
                    className="block rounded-lg bg-navy-900 px-3 py-2 text-center text-xs font-semibold text-white"
                  >
                    Explore All CRCA Ministries
                  </Link>
                  {ministryMegaMenuColumns.map((col) => (
                    <div key={col.id}>
                      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        {col.heading}
                      </div>
                      <div className="space-y-1">
                        {col.items.map((item) =>
                          item.isExternal ? (
                            <a
                              key={item.label}
                              href={item.to}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium text-navy-800 hover:bg-white"
                            >
                              <span>{item.label}</span>
                              <ExternalLink className="h-3.5 w-3.5 text-stone-600" />
                            </a>
                          ) : (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="block rounded-lg px-2.5 py-1.5 text-sm font-medium text-navy-800 hover:bg-white"
                            >
                              {item.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* For Churches Accordion */}
            <div className="rounded-md border border-stone-200 bg-stone-50/70">
              <button
                type="button"
                aria-expanded={mobileSection === 'for-churches'}
                onClick={() =>
                  setMobileSection((prev) => (prev === 'for-churches' ? null : 'for-churches'))
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-900"
              >
                <span>For Churches</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileSection === 'for-churches' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'for-churches' && (
                <div className="space-y-1.5 border-t border-stone-200 px-3 py-3">
                  <Link
                    to="/for-churches"
                    className="block rounded-lg bg-navy-900 px-3 py-2 text-center text-xs font-semibold text-white"
                  >
                    Leader &amp; Elder Hub Overview
                  </Link>
                  {forChurchesNavItems.map((item) =>
                    item.isExternal ? (
                      <a
                        key={item.label}
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-white"
                      >
                        <span>{item.label}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-stone-600" />
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/contact"
                className="rounded-md border border-stone-200 px-4 py-3 text-sm font-semibold text-navy-900 hover:bg-stone-50"
              >
                Contact &amp; Enquiries
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
