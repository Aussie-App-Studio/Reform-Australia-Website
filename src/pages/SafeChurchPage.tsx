import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { RichHtml } from '../components/RichHtml';
import { siteConfig } from '../data/siteConfig';
import {
  ancestorsOf,
  displayTitle,
  fetchSafeChurch,
  searchSafeChurch,
  type SafeChurchContent,
  type SafeChurchPage as ScPage,
} from '../lib/safeChurch';
import { NotFoundPage } from './NotFoundPage';
import { usePageTitle } from '../utils/usePageTitle';


const urgent = siteConfig.safeChurch.urgent;
const tel = (n: string) => `tel:${n.replace(/\s+/g, '')}`;

/** Always-visible "need help now" panel. */
function UrgentHelpPanel({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      aria-label="Report a concern"
      className={`rounded-lg border border-rose-200 bg-rose-50 text-rose-950 ${compact ? 'p-5' : 'p-6 sm:p-7'}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className={`font-serif font-bold ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>Need to report a concern?</h2>
          <p className="mt-1 text-sm leading-relaxed text-rose-900">
            If anyone is in immediate danger, call{' '}
            <a href={tel(urgent.emergency)} className="font-bold underline underline-offset-2">
              Police {urgent.emergency}
            </a>{' '}
            first.
          </p>
        </div>
      </div>
      <ul className={`mt-4 grid gap-2.5 ${compact ? '' : 'sm:grid-cols-2'}`}>
        <li>
          <a
            href={tel(urgent.primaryPhone)}
            className="flex items-center gap-3 rounded-md bg-white px-4 py-3 ring-1 ring-rose-200 transition hover:ring-rose-400"
          >
            <Phone className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-base font-bold tabular-nums text-navy-900">{urgent.primaryPhone}</span>
              <span className="block text-xs text-stone-600">{urgent.primaryLabel}</span>
            </span>
          </a>
        </li>
        <li>
          <a
            href={tel(urgent.backupPhone)}
            className="flex items-center gap-3 rounded-md bg-white px-4 py-3 ring-1 ring-rose-200 transition hover:ring-rose-400"
          >
            <Phone className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-base font-bold tabular-nums text-navy-900">{urgent.backupPhone}</span>
              <span className="block text-xs text-stone-600">{urgent.backupLabel}</span>
            </span>
          </a>
        </li>
      </ul>
      <div className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold ${compact ? 'flex-col' : ''}`}>
        <Link to={urgent.childReportPath} className="inline-flex items-center gap-1.5 text-rose-800 hover:text-rose-950">
          How to report a concern about a child <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to={urgent.adultReportPath} className="inline-flex items-center gap-1.5 text-rose-800 hover:text-rose-950">
          How to report adult misconduct <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a href={`mailto:${urgent.email}`} className="inline-flex items-center gap-1.5 text-rose-800 hover:text-rose-950">
          <Mail className="h-4 w-4" aria-hidden="true" /> {urgent.email}
        </a>
      </div>
    </aside>
  );
}

function SafeChurchSearch({ content }: { content: SafeChurchContent }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => searchSafeChurch(content, q), [content, q]);
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-6">
      <label htmlFor="sc-search" className="font-serif text-lg font-bold text-navy-900">
        Search Safe Church guidance
      </label>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
        <input
          id="sc-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try "working with children check", "grooming", "volunteer", "first aid"…'
          className="w-full rounded-md border border-stone-300 bg-stone-50 py-3 pl-10 pr-4 text-base text-navy-900 placeholder:text-stone-500 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 sm:text-sm"
        />
      </div>
      {q.trim().length > 1 && (
        <div className="mt-4" aria-live="polite">
          {results.length === 0 ? (
            <p className="text-sm text-stone-600">No pages match “{q}”.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {results.map(({ page, snippet }) => (
                <li key={page.path}>
                  <Link to={`/safe-church/${page.path}`} className="group block py-3">
                    <span className="block font-semibold text-navy-900 group-hover:text-teal-700">
                      {page.title}
                      <span className="font-normal text-stone-500"> · {displayTitle(content, page.path.split('/')[0])}</span>
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-stone-600">{snippet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SafeChurchHub({ content }: { content: SafeChurchContent }) {
  const quickLinks = [
    { path: 'resources/forms-and-posters', label: 'Forms & posters' },
    { path: 'resources/policies-and-documents', label: 'Policies & documents' },
    { path: 'about/training', label: 'Training & calendars' },
    { path: 'about/safe-church-representatives', label: 'Safe Church Representatives' },
    { path: 'children/the-working-with-children-check', label: 'Working With Children Checks' },
    { path: 'volunteers/volunteer-approval-process', label: 'Volunteer approval process' },
    { path: 'resources/seeking-help', label: 'Seeking help & support services' },
    { path: 'contacts', label: 'Contact the Safe Church Unit' },
  ].filter((l) => content.pages[l.path]);

  return (
    <>
      <PageHeader
        title="Safe Church"
        description={content.intro}
        logo={{ src: `${import.meta.env.BASE_URL}images/logos/ministries/safe-church.webp`, alt: 'CRCA Safe Church logo' }}
        breadcrumbs={[{ label: 'For churches', to: '/for-churches' }, { label: 'Safe Church' }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <UrgentHelpPanel />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-semibold text-navy-900 sm:text-3xl">Guidance and policy</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {content.sections.map((s) => {
            const page = content.pages[s.path];
            const kids = page.children.map((c) => content.pages[c]).filter(Boolean);
            return (
              <article key={s.path} className="flex flex-col rounded-lg border border-stone-200 bg-white p-6 transition hover:border-teal-300">
                <h3 className="font-serif text-xl font-semibold text-navy-900">
                  <Link to={`/safe-church/${s.path}`} className="hover:text-teal-700">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.blurb}</p>
                <ul className="mt-4 space-y-1.5 border-t border-stone-100 pt-4 text-sm">
                  {kids.slice(0, 6).map((k) => (
                    <li key={k.path}>
                      <Link to={`/safe-church/${k.path}`} className="inline-flex items-start gap-1.5 text-navy-800 hover:text-teal-700">
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" aria-hidden="true" />
                        {k.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/safe-church/${s.path}`}
                  className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  {kids.length > 6 ? `All ${kids.length} topics` : 'Open section'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
          <article className="flex flex-col rounded-lg border border-navy-800 bg-navy-900 p-6 text-white">
            <h3 className="font-serif text-xl font-bold">Quick links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.path}>
                  <Link to={`/safe-church/${l.path}`} className="inline-flex items-center gap-1.5 text-navy-100 hover:text-white">
                    <ChevronRight className="h-4 w-4 text-teal-100" aria-hidden="true" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-100/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SafeChurchSearch content={content} />
          <SyncNote content={content} />
        </div>
      </section>
    </>
  );
}

function SyncNote({ content }: { content: SafeChurchContent }) {
  return (
    <p className="mt-6 text-xs text-stone-500">
Last updated {new Date(content.syncedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
    </p>
  );
}

/** Left-hand navigation tree for the current section. */
function SectionNav({ content, current }: { content: SafeChurchContent; current: ScPage }) {
  const root = content.pages[current.path.split('/')[0]] ?? current;
  const openPaths = new Set([current.path, ...ancestorsOf(content, current.path).map((p) => p.path)]);

  function renderList(paths: string[], depth: number) {
    return (
      <ul className={depth ? 'mt-1 space-y-0.5 border-l border-stone-200 pl-3' : 'space-y-0.5'}>
        {paths.map((p) => {
          const page = content.pages[p];
          if (!page) return null;
          const active = p === current.path;
          return (
            <li key={p}>
              <Link
                to={`/safe-church/${p}`}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-lg px-2.5 py-1.5 text-sm leading-snug transition ${
                  active ? 'bg-teal-50 font-semibold text-teal-800' : 'text-stone-700 hover:bg-stone-100 hover:text-navy-900'
                }`}
              >
                {page.title}
              </Link>
              {page.children.length > 0 && openPaths.has(p) && renderList(page.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <nav aria-label={`${displayTitle(content, root.path)} pages`}>
      <Link
        to={`/safe-church/${root.path}`}
        className={`mb-2 block rounded-lg px-2.5 py-1.5 font-serif text-base font-bold ${
          root.path === current.path ? 'bg-teal-50 text-teal-800' : 'text-navy-900 hover:text-teal-700'
        }`}
      >
        {displayTitle(content, root.path)}
      </Link>
      {renderList(root.children, 0)}
      <div className="mt-5 border-t border-stone-200 pt-4">
        <p className="px-2.5 text-xs font-bold uppercase tracking-wider text-stone-500">Other sections</p>
        <ul className="mt-2 space-y-0.5">
          {content.sections
            .filter((s) => s.path !== root.path)
            .map((s) => (
              <li key={s.path}>
                <Link to={`/safe-church/${s.path}`} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-stone-700 hover:bg-stone-100 hover:text-navy-900">
                  {s.title}
                </Link>
              </li>
            ))}
          <li>
            <Link to="/safe-church/contacts" className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-stone-700 hover:bg-stone-100 hover:text-navy-900">
              <Phone className="h-4 w-4 text-teal-600" aria-hidden="true" /> Contacts
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function SafeChurchArticle({ content, page }: { content: SafeChurchContent; page: ScPage }) {
  const ancestors = ancestorsOf(content, page.path);
  const children = page.children.map((c) => content.pages[c]).filter(Boolean);
  const siblings = page.parent ? content.pages[page.parent]?.children ?? [] : [];
  const idx = siblings.indexOf(page.path);
  const prev = idx > 0 ? content.pages[siblings[idx - 1]] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? content.pages[siblings[idx + 1]] : null;
  const title = displayTitle(content, page.path);
  const hasBody = page.html.replace(/<[^>]+>/g, '').trim().length > 40;

  return (
    <>
      <PageHeader
        eyebrow={ancestors.length ? displayTitle(content, ancestors[0].path) : 'Safe Church Unit'}
        title={title}
        description={hasBody ? '' : page.summary}
        breadcrumbs={[
          { label: 'Safe Church', to: '/safe-church' },
          ...ancestors.map((a) => ({ label: displayTitle(content, a.path), to: `/safe-church/${a.path}` })),
          { label: title },
        ]}
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-14 xl:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Section navigation: sidebar on desktop, collapsible on mobile */}
        <div className="space-y-6 lg:sticky lg:top-[calc(var(--site-header-height,72px)+1.5rem)] lg:max-h-[calc(100vh-var(--site-header-height,72px)-3rem)] lg:self-start lg:overflow-y-auto lg:pb-2">
          <details className="group rounded-lg border border-stone-200 bg-white p-3 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-1 text-sm font-semibold text-navy-900">
              In this section
              <ChevronRight className="h-4 w-4 transition group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="mt-3">
              <SectionNav content={content} current={page} />
            </div>
          </details>
          <div className="hidden lg:block">
            <SectionNav content={content} current={page} />
          </div>
          <div className="hidden lg:block">
            <UrgentHelpPanel compact />
          </div>
        </div>

        <article className="min-w-0">
          {/* Mobile: slim always-visible reporting strip */}
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950 lg:hidden">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span className="font-semibold">Need to report?</span>
            <a href={tel(urgent.primaryPhone)} className="font-bold tabular-nums underline underline-offset-2">
              {urgent.primaryPhone}
            </a>
            <span className="basis-full pl-7 text-xs text-rose-800">If anyone is in immediate danger, call {urgent.emergency}.</span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8 lg:p-10">
            {hasBody ? (
              <RichHtml html={page.html} className="max-w-[72ch]" />
            ) : (
              <p className="text-stone-600">Choose a topic below.</p>
            )}

            {children.length > 0 && (
              <div className={hasBody ? 'mt-10 border-t border-stone-200 pt-8' : ''}>
                <h2 className="font-serif text-xl font-bold text-navy-900">In this section</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {children.map((c) => (
                    <li key={c.path}>
                      <Link
                        to={`/safe-church/${c.path}`}
                        className="group flex h-full flex-col rounded-md border border-stone-200 bg-stone-50 p-4 transition hover:border-teal-300 hover:bg-white"
                      >
                        <span className="flex items-center justify-between gap-2 font-semibold text-navy-900 group-hover:text-teal-700">
                          {c.title}
                          <ArrowRight className="h-4 w-4 shrink-0 text-teal-600 transition group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                        {c.summary && <span className="mt-1 line-clamp-2 text-sm text-stone-600">{c.summary}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {(prev || next) && (
            <nav aria-label="Previous and next topic" className="mt-6 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link to={`/safe-church/${prev.path}`} className="group rounded-md border border-stone-200 bg-white p-4 hover:border-teal-300">
                  <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous
                  </span>
                  <span className="mt-1 block font-semibold text-navy-900 group-hover:text-teal-700">{prev.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next && (
                <Link to={`/safe-church/${next.path}`} className="group rounded-md border border-stone-200 bg-white p-4 text-right hover:border-teal-300">
                  <span className="flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Next <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block font-semibold text-navy-900 group-hover:text-teal-700">{next.title}</span>
                </Link>
              )}
            </nav>
          )}

        </article>

      </div>
    </>
  );
}

export function SafeChurchPage() {
  const { pathname } = useLocation();
  const subPath = decodeURIComponent(pathname.replace(/^\/safe-church\/?/, '').replace(/\/$/, ''));
  const [content, setContent] = useState<SafeChurchContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSafeChurch().then(setContent, (e: Error) => setError(e.message));
  }, []);

  const page = content && subPath ? content.pages[subPath] : null;
  usePageTitle(content ? (page ? `${displayTitle(content, page.path)} · Safe Church` : subPath ? 'Not found' : 'Safe Church') : 'Safe Church');

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="font-semibold text-navy-900">Sorry — Safe Church content could not be loaded.</p>
        <p className="mt-2 text-sm text-stone-600">{error}</p>
        <p className="mt-4 text-sm text-stone-600">
          For urgent help call the Safe Church Unit on {siteConfig.safeChurch.urgent.primaryPhone}.
        </p>
      </div>
    );
  }
  if (!content) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center text-sm text-stone-600">
        Loading Safe Church…
      </div>
    );
  }
  if (!subPath) return <SafeChurchHub content={content} />;
  if (!page) return <NotFoundPage />;
  return <SafeChurchArticle content={content} page={page} />;
}
