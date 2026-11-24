import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Search, SlidersHorizontal, User, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import {
  fetchSermonIndex,
  filterSermons,
  GROUP_LABELS,
  issueLabel,
  readAloudMinutes,
  type SermonGroup,
  type SermonIndex,
  type SermonIndexItem,
} from '../lib/sermons';
import { usePageTitle } from '../utils/usePageTitle';

const PAGE_SIZE = 30;
const GROUPS: (SermonGroup | 'all')[] = ['all', 'ot', 'nt', 'conf'];

function SermonCard({ s, index }: { s: SermonIndexItem; index: SermonIndex }) {
  const preacher = s.p ? index.preachers[s.p] : null;
  return (
    <li>
      <Link
        to={`/sermons/${s.id}`}
        className="group flex h-full flex-col rounded-lg border border-stone-200 bg-white p-5 transition hover:border-teal-300"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          {s.r && <span className="rounded-md bg-teal-50 px-2 py-0.5 text-teal-800">{s.r}</span>}
          {s.ld && !/lord/i.test(s.r ?? '') && <span className="rounded-md bg-gold-50 px-2 py-0.5 text-stone-600">Lord’s Day {s.ld}</span>}
        </div>
        <h3 className="mt-2.5 font-serif text-lg font-bold leading-snug text-navy-900 group-hover:text-teal-700">{s.t}</h3>
        {s.s && <p className="mt-1 text-xs font-medium text-stone-500">Series: {s.s}</p>}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{s.x}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-xs text-stone-600">
          {preacher && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> {preacher}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> ~{readAloudMinutes(s.w)} min read aloud
          </span>
          <span className="text-stone-500">{issueLabel(s.y, s.m)}</span>
        </div>
      </Link>
    </li>
  );
}

export function SermonsPage() {
  usePageTitle('Word of Salvation Sermons');
  const [index, setIndex] = useState<SermonIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const [shown, setShown] = useState(PAGE_SIZE);
  const [draft, setDraft] = useState(params.get('q') ?? '');

  useEffect(() => {
    fetchSermonIndex().then(setIndex, (e: Error) => setError(e.message));
  }, []);

  const filters = {
    query: params.get('q') ?? '',
    group: (params.get('g') as SermonGroup | null) ?? 'all',
    book: params.get('book'),
    preacher: params.get('preacher'),
    decade: params.get('decade') ? Number(params.get('decade')) : null,
    lordsDay: params.get('ld') ? Number(params.get('ld')) : null,
  } as const;
  const hasFilters = Boolean(filters.query || filters.group !== 'all' || filters.book || filters.preacher || filters.decade || filters.lordsDay);

  // Debounce typing into the URL.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if ((params.get('q') ?? '') !== draft) update({ q: draft || null });
    }, 220);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => setShown(PAGE_SIZE), [params]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  }

  const results = useMemo(() => (index ? filterSermons(index, filters) : []), [index, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const preacherOptions = useMemo(() => {
    if (!index) return [];
    const counts = new Map<string, number>();
    for (const s of index.sermons) if (s.p) counts.set(s.p, (counts.get(s.p) ?? 0) + 1);
    return [...counts.entries()]
      .map(([k, n]) => ({ key: k, name: index.preachers[k], n }))
      .sort((a, b) => a.name.replace(/^(Rev\.|Dr\.|Prof\.)\s*/g, '').localeCompare(b.name.replace(/^(Rev\.|Dr\.|Prof\.)\s*/g, '')));
  }, [index]);

  const decades = useMemo(() => {
    if (!index) return [];
    return [...new Set(index.sermons.map((s) => Math.floor(s.y / 10) * 10))].sort((a, b) => b - a);
  }, [index]);

  const total = index?.sermons.length ?? 0;
  const recent = useMemo(() => (index ? [...index.sermons].sort((a, b) => b.a.localeCompare(a.a)).slice(0, 6) : []), [index]);

  return (
    <>
      <PageHeader
        eyebrow="Word of Salvation"
        title="Reading sermons"
        description={`${total ? total.toLocaleString() : 'Over 2,000'} sermons by CRCA ministers, for reading services, personal devotion and further study. Search by book, passage, preacher or Lord’s Day.`}
        breadcrumbs={[{ label: 'For Churches', to: '/for-churches' }, { label: 'Word of Salvation' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Search + filters */}
        <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" aria-hidden="true" />
            <label htmlFor="sermon-search" className="sr-only">
              Search sermons
            </label>
            <input
              id="sermon-search"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder='Search title, passage, preacher or topic — e.g. "Romans 8", "grace", "LD 12"'
              className="w-full rounded-md border border-stone-300 bg-stone-50 py-3.5 pl-12 pr-4 text-base text-navy-900 placeholder:text-stone-500 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div role="tablist" aria-label="Testament" className="flex flex-wrap gap-1.5">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={filters.group === g}
                  onClick={() => update({ g: g === 'all' ? null : g, book: null, ld: null })}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    filters.group === g ? 'bg-navy-900 text-white' : 'bg-stone-100 text-navy-800 hover:bg-stone-200'
                  }`}
                >
                  {g === 'all' ? 'All' : GROUP_LABELS[g]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:ml-auto lg:flex lg:items-center">
              <SlidersHorizontal className="hidden h-4 w-4 text-stone-400 lg:block" aria-hidden="true" />
              <select
                aria-label="Book or confession"
                value={filters.book ?? ''}
                onChange={(e) => update({ book: e.target.value || null, ld: null })}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-navy-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <option value="">All books & confessions</option>
                {index?.books
                  .filter((b) => filters.group === 'all' || b.group === filters.group)
                  .map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} ({b.count})
                    </option>
                  ))}
              </select>
              <select
                aria-label="Preacher"
                value={filters.preacher ?? ''}
                onChange={(e) => update({ preacher: e.target.value || null })}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-navy-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 lg:max-w-56"
              >
                <option value="">All preachers</option>
                {preacherOptions.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name} ({p.n})
                  </option>
                ))}
              </select>
              <select
                aria-label="Decade"
                value={filters.decade ?? ''}
                onChange={(e) => update({ decade: e.target.value || null })}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-navy-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                <option value="">Any decade</option>
                {decades.map((d) => (
                  <option key={d} value={d}>
                    {d}s
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filters.book === 'Heidelberg Catechism' && (
            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Jump to a Lord’s Day</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from({ length: 52 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => update({ ld: filters.lordsDay === n ? null : String(n) })}
                    aria-pressed={filters.lordsDay === n}
                    className={`h-8 w-9 rounded-md text-xs font-semibold tabular-nums transition ${
                      filters.lordsDay === n ? 'bg-teal-600 text-white' : 'bg-stone-100 text-navy-800 hover:bg-teal-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-8 rounded-md bg-rose-50 p-4 text-sm text-rose-900">
            Sorry — the sermon archive could not be loaded ({error}).
          </p>
        )}
        {!index && !error && (
          <p role="status" className="mt-10 text-center text-sm text-stone-600">
            Loading sermon archive…
          </p>
        )}

        {index && !hasFilters && (
          <>
            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-serif text-2xl font-bold text-navy-900">Recently added</h2>
              </div>
              <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recent.map((s) => (
                  <SermonCard key={s.id} s={s} index={index} />
                ))}
              </ul>
            </section>

            {(['ot', 'nt', 'conf'] as SermonGroup[]).map((g) => (
              <section key={g} className="mt-12">
                <h2 className="font-serif text-2xl font-bold text-navy-900">{GROUP_LABELS[g]}</h2>
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {index.books
                    .filter((b) => b.group === g)
                    .map((b) => (
                      <li key={b.name}>
                        <button
                          onClick={() => update({ book: b.name, g })}
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-stone-200 bg-white px-3.5 py-2.5 text-left text-sm font-semibold text-navy-900 transition hover:border-teal-300 hover:text-teal-700"
                        >
                          <span className="leading-snug">{b.name}</span>
                          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium tabular-nums text-stone-600">{b.count}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </>
        )}

        {index && hasFilters && (
          <section className="mt-8" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-600">
                <span className="font-semibold text-navy-900">{results.length.toLocaleString()}</span> sermon{results.length === 1 ? '' : 's'}
                {filters.book && <> in {filters.book}</>}
                {filters.lordsDay && <> on Lord’s Day {filters.lordsDay}</>}
                {filters.preacher && <> by {index.preachers[filters.preacher]}</>}
                {filters.decade && <> from the {filters.decade}s</>}
              </p>
              <button
                onClick={() => {
                  setDraft('');
                  setParams(new URLSearchParams(), { replace: true });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-800 hover:border-navy-800"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Clear filters
              </button>
            </div>
            {results.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
                <p className="mt-3 font-semibold text-navy-900">No sermons match those filters.</p>
                <p className="mt-1 text-sm text-stone-600">Try a broader search, or clear a filter.</p>
              </div>
            ) : (
              <>
                <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.slice(0, shown).map((s) => (
                    <SermonCard key={s.id} s={s} index={index} />
                  ))}
                </ul>
                {shown < results.length && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setShown((n) => n + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800"
                    >
                      Show more ({(results.length - shown).toLocaleString()} remaining) <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {index && (
          <p className="mt-12 text-xs text-stone-500">
            Sermons submitted by CRCA ministers for use as reading services, personal devotion and further study. Last updated {new Date(index.syncedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>
    </>
  );
}
