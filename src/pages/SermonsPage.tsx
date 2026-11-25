import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, MessagesSquare, ScrollText, Search, UserRound, X, type LucideIcon } from 'lucide-react';
import {
  fetchSermonIndex,
  fetchSermonTopics,
  filterSermons,
  GROUP_LABELS,
  issueLabel,
  parsePassage,
  readAloudMinutes,
  searchSermonText,
  type SermonGroup,
  type SermonIndex,
  type SermonIndexItem,
  type SermonTopics,
} from '../lib/sermons';
import { usePageTitle } from '../utils/usePageTitle';

const PAGE_SIZE = 30;

/** The ways in. Each has its own colour, so people can remember "the gold one". */
const WAYS: { id: string; label: string; detail: string; Icon: LucideIcon; idle: string; active: string }[] = [
  { id: 'book', label: 'Bible book', detail: 'Genesis to Revelation', Icon: BookOpen, idle: 'border-t-teal-600 text-teal-700', active: 'border-teal-700 bg-teal-700' },
  { id: 'topic', label: 'Topic', detail: 'Prayer, grief, marriage…', Icon: MessagesSquare, idle: 'border-t-gold-500 text-gold-600', active: 'border-[#76571b] bg-[#76571b]' },
  { id: 'year', label: 'Church year', detail: 'Christmas, Easter, baptism…', Icon: CalendarDays, idle: 'border-t-[#a3402f] text-[#a3402f]', active: 'border-[#8f3526] bg-[#8f3526]' },
  { id: 'lords-day', label: 'Catechism', detail: 'Lord’s Days and confessions', Icon: ScrollText, idle: 'border-t-navy-700 text-navy-700', active: 'border-navy-800 bg-navy-800' },
  { id: 'preacher', label: 'Preacher', detail: 'Listed by surname', Icon: UserRound, idle: 'border-t-[#3c6b4a] text-[#3c6b4a]', active: 'border-[#315a3e] bg-[#315a3e]' },
];

const chip = 'inline-flex min-h-12 items-center justify-between gap-3 rounded-md border border-stone-300 bg-white px-4 py-2 text-left text-lg text-navy-900 hover:border-teal-700 hover:bg-teal-50';

function SermonCard({ s, index }: { s: SermonIndexItem; index: SermonIndex }) {
  const preacher = s.p ? index.preachers[s.p] : null;
  const ref = [s.r, s.ld && !/lord/i.test(s.r ?? '') ? `Lord’s Day ${s.ld}` : null].filter(Boolean).join(' · ');
  return (
    <li className="border-b border-stone-200">
      <Link to={`/sermons/${s.id}`} className="group block py-5">
        <span className="block font-serif text-xl font-semibold leading-snug text-navy-900 underline decoration-stone-300 underline-offset-4 group-hover:text-teal-700 group-hover:decoration-teal-600">{s.t}</span>
        {ref && <span className="mt-1.5 block text-lg text-teal-800">{ref}</span>}
        <span className="mt-0.5 block text-base text-stone-700">
          {[preacher, issueLabel(s.y, s.m), `about ${readAloudMinutes(s.w)} minutes`].filter(Boolean).join(' · ')}
        </span>
        {s.s && <span className="mt-0.5 block text-base text-stone-600">Series: {s.s}</span>}
      </Link>
    </li>
  );
}

const surname = (name: string) => name.trim().split(/\s+/).pop() ?? name;

export function SermonsPage() {
  usePageTitle(
    'Reading sermons',
    'Over 2,000 reading sermons from the CRCA’s Word of Salvation archive, for reading aloud in church when no minister is available. Browse by Bible book, topic, church year, Lord’s Day or preacher.'
  );
  const [index, setIndex] = useState<SermonIndex | null>(null);
  const [topics, setTopics] = useState<SermonTopics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  // How many results are showing is remembered per search, so Back from a sermon returns to the same list.
  const shownKey = `sermons-shown:${params.toString()}`;
  const readShown = (k: string) => {
    try {
      return Number(sessionStorage.getItem(k)) || PAGE_SIZE;
    } catch {
      return PAGE_SIZE;
    }
  };
  const [shown, setShown] = useState(() => readShown(shownKey));
  const [draft, setDraft] = useState(params.get('q') ?? '');

  useEffect(() => {
    fetchSermonIndex().then(setIndex, (e: Error) => setError(e.message));
    fetchSermonTopics().then(setTopics, () => setTopics(null));
  }, []);

  const filters = {
    query: params.get('q') ?? '',
    group: (params.get('g') as SermonGroup | null) ?? 'all',
    book: params.get('book'),
    preacher: params.get('preacher'),
    decade: params.get('decade') ? Number(params.get('decade')) : null,
    lordsDay: params.get('ld') ? Number(params.get('ld')) : null,
  } as const;
  const topicId = params.get('topic');
  const hasFilters = Boolean(filters.query || filters.group !== 'all' || filters.book || filters.preacher || filters.decade || filters.lordsDay || topicId);
  const way = params.get('by') ?? 'book';

  // Keep the box in step with Back, Forward and "Start again".
  const urlQuery = params.get('q') ?? '';
  useEffect(() => setDraft(urlQuery), [urlQuery]);
  useEffect(() => setShown(readShown(shownKey)), [shownKey]);
  useEffect(() => {
    try {
      sessionStorage.setItem(shownKey, String(shown));
    } catch {
      /* private mode */
    }
  }, [shownKey, shown]);

  function update(patch: Record<string, string | null>, replace = false) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace });
  }
  /** One choice at a time from the lists, so results are never a surprise. */
  function choose(patch: Record<string, string>) {
    setParams(new URLSearchParams({ ...(params.get('by') ? { by: way } : {}), ...patch }));
    // Take people straight to the results, below the header.
    window.setTimeout(() => {
      const el = document.getElementById('sermon-results');
      el?.scrollIntoView({ block: 'start' });
      el?.focus({ preventScroll: true });
    }, 60);
  }
  function search(e: FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    if (q) choose({ q });
  }

  // Words inside the sermons, looked up as well as titles and passages.
  const isPassage = Boolean(index && filters.query && parsePassage(filters.query, index.books.map((b) => b.name)));
  const [textHits, setTextHits] = useState<{ q: string; hits: number[] }>({ q: '', hits: [] });
  useEffect(() => {
    if (!filters.query || isPassage) return;
    let live = true;
    searchSermonText(filters.query).then((hits) => live && setTextHits({ q: filters.query, hits }));
    return () => {
      live = false;
    };
  }, [filters.query, isPassage]);

  const topic = topics?.groups.flatMap((g) => g.topics).find((t) => t.id === topicId) ?? null;

  const { results, inText } = useMemo(() => {
    if (!index) return { results: [], inText: [] };
    if (topicId && !topic) return { results: [], inText: [] };
    let list = filterSermons(index, filters);
    if (topic) {
      const allowed = new Set(list);
      list = topic.sermons.map((i) => index.sermons[i]).filter((s) => s && allowed.has(s));
    }
    if (!filters.query || isPassage || textHits.q !== filters.query) return { results: list, inText: [] };
    const already = new Set(list);
    const allowed = new Set(filterSermons(index, { ...filters, query: '' }));
    const extra = textHits.hits.map((i) => index.sermons[i]).filter((s) => s && allowed.has(s) && !already.has(s));
    return { results: list, inText: extra };
  }, [index, topic, topicId, params, textHits, isPassage]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = [...results, ...inText];

  const preachers = useMemo(() => {
    if (!index) return [];
    const counts = new Map<string, number>();
    for (const s of index.sermons) if (s.p) counts.set(s.p, (counts.get(s.p) ?? 0) + 1);
    return [...counts.entries()]
      .map(([key, n]) => ({ key, name: index.preachers[key], n }))
      .sort((a, b) => surname(a.name).localeCompare(surname(b.name)) || a.name.localeCompare(b.name));
  }, [index]);
  const decades = useMemo(() => (index ? [...new Set(index.sermons.map((s) => Math.floor(s.y / 10) * 10))].sort((a, b) => b - a) : []), [index]);
  const recent = useMemo(() => (index ? [...index.sermons].sort((a, b) => b.a.localeCompare(a.a)).slice(0, 6) : []), [index]);
  const total = index?.sermons.length ?? 0;

  const heading = [
    topic?.label,
    filters.book,
    filters.lordsDay ? `Lord’s Day ${filters.lordsDay}` : null,
    filters.preacher && index ? index.preachers[filters.preacher] : null,
    filters.query ? `“${filters.query}”` : null,
    !filters.book && filters.group !== 'all' ? GROUP_LABELS[filters.group] : null,
    filters.decade ? `${filters.decade}s` : null,
  ]
    .filter(Boolean)
    .join(', ');

  const topicList = (groupIds: (id: string) => boolean) =>
    topics?.groups
      .filter((g) => groupIds(g.id))
      .map((g) => (
        <section key={g.id} className="mt-8 first:mt-0">
          <h3 className="font-serif text-xl font-semibold text-navy-900">{g.label}</h3>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {g.topics.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => choose({ topic: t.id })} className={`${chip} w-full`}>
                  {t.label} <span className="tabular-nums text-stone-600">{t.sermons.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ));

  return (
    <>
      <header className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-base text-navy-100">
            <Link to="/" className="hover:text-white hover:underline">Home</Link> <span aria-hidden="true">/</span>{' '}
            <Link to="/for-churches" className="hover:text-white hover:underline">For churches</Link> <span aria-hidden="true">/</span>{' '}
            <span aria-current="page" className="text-white">Reading sermons</span>
          </nav>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Reading sermons</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-navy-100 sm:text-xl">
            {total ? total.toLocaleString() : 'Over 2,000'} sermons by CRCA ministers from Word of Salvation, to read aloud in church or at home.
          </p>
          <form role="search" onSubmit={search} className="mt-7 max-w-3xl">
            <label htmlFor="sermon-search" className="text-lg font-semibold">
              Search all sermons
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="sermon-search"
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-14 min-w-0 flex-1 rounded-md bg-white px-4 text-lg text-navy-900 focus:outline-none focus:ring-4 focus:ring-teal-400"
              />
              <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-teal-500 px-7 text-lg font-semibold text-navy-950 hover:bg-teal-400">
                <Search className="h-5 w-5" aria-hidden="true" /> Search
              </button>
            </div>
            <p className="mt-2 text-base text-navy-100">For example: Romans 8, forgiveness, Westendorp, or Lord’s Day 12</p>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {error && <p className="rounded-md bg-rose-50 p-4 text-lg text-rose-900">Sorry, the sermon archive could not be loaded ({error}).</p>}
        {!index && !error && (
          <p role="status" data-loading className="text-center text-lg text-stone-700">
            Loading sermons…
          </p>
        )}

        {index && !hasFilters && (
          <>
            <h2 className="font-serif text-2xl font-semibold text-navy-900 sm:text-3xl">Choose how to look</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
              {WAYS.map(({ id, label, detail, Icon, idle, active }) => {
                const on = way === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update({ by: id === 'book' ? null : id }, true)}
                    className={`flex min-h-32 flex-col items-start rounded-md border border-t-4 p-4 text-left ${on ? `${active} text-white` : `border-stone-300 bg-white hover:bg-stone-100 ${idle}`}`}
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className={`mt-3 text-xl font-semibold ${on ? '' : 'text-navy-900'}`}>{label}</span>
                    <span className={`text-base leading-snug ${on ? 'text-white' : 'text-stone-700'}`}>{detail}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-md bg-stone-100 p-5 sm:p-8">
              {way === 'book' &&
                (['ot', 'nt'] as SermonGroup[]).map((g) => (
                  <section key={g} className="mt-8 first:mt-0">
                    <h3 className="font-serif text-xl font-semibold text-navy-900">{GROUP_LABELS[g]}</h3>
                    <ul className="mt-3 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                      {index.books.filter((b) => b.group === g).map((b) => (
                        <li key={b.name}>
                          <button type="button" onClick={() => choose({ book: b.name })} className={`${chip} w-full`}>
                            {b.name} <span className="tabular-nums text-stone-600">{b.count}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              {way === 'topic' && (topics ? topicList((id) => id !== 'year') : <p className="text-lg text-stone-700">Topics could not be loaded. Please use the search above.</p>)}
              {way === 'year' && (topics ? topicList((id) => id === 'year') : <p className="text-lg text-stone-700">This list could not be loaded. Please use the search above.</p>)}
              {way === 'lords-day' && (
                <>
                  <h3 className="font-serif text-xl font-semibold text-navy-900">Heidelberg Catechism: choose a Lord’s Day</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: 52 }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`Lord’s Day ${n}`}
                        onClick={() => choose({ book: 'Heidelberg Catechism', ld: String(n) })}
                        className="h-12 w-13 rounded-md border border-stone-300 bg-white text-lg font-semibold tabular-nums text-navy-900 hover:border-teal-700 hover:bg-teal-50"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <h3 className="mt-8 font-serif text-xl font-semibold text-navy-900">All sermons on a confession</h3>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {index.books.filter((b) => b.group === 'conf').map((b) => (
                      <li key={b.name}>
                        <button type="button" onClick={() => choose({ book: b.name })} className={`${chip} w-full`}>
                          {b.name} <span className="tabular-nums text-stone-600">{b.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {way === 'preacher' && (
                <>
                  <h3 className="font-serif text-xl font-semibold text-navy-900">Preachers, by surname</h3>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {preachers.map((p) => (
                      <li key={p.key}>
                        <button type="button" onClick={() => choose({ preacher: p.key })} className={`${chip} w-full`}>
                          {p.name} <span className="tabular-nums text-stone-600">{p.n}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <section className="mt-12">
              <h2 className="font-serif text-2xl font-semibold text-navy-900 sm:text-3xl">Recently added</h2>
              <ul className="mt-4 grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
                {recent.map((s) => (
                  <SermonCard key={s.id} s={s} index={index} />
                ))}
              </ul>
            </section>
          </>
        )}

        {index && hasFilters && (
          <section id="sermon-results" tabIndex={-1} aria-label="Results" className="scroll-mt-28 focus:outline-none">
            <button
              type="button"
              onClick={() => setParams(params.get('by') ? { by: way } : {})}
              className="inline-flex min-h-12 items-center gap-2 rounded-md border-2 border-navy-900 px-4 text-lg font-semibold text-navy-900 hover:bg-navy-50"
            >
              <X className="h-5 w-5" aria-hidden="true" /> Start again
            </button>
            <h2 className="mt-6 font-serif text-3xl font-semibold text-navy-900">{heading}</h2>
            <p role="status" className="mt-1 text-lg text-stone-700">
              {all.length.toLocaleString()} sermon{all.length === 1 ? '' : 's'}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="text-base font-semibold text-navy-900">
                Preacher
                <select value={filters.preacher ?? ''} onChange={(e) => update({ preacher: e.target.value || null })} className="mt-1 block min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-lg font-normal sm:w-72">
                  <option value="">Any preacher</option>
                  {preachers.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-base font-semibold text-navy-900">
                Decade
                <select value={filters.decade ?? ''} onChange={(e) => update({ decade: e.target.value || null })} className="mt-1 block min-h-12 w-full rounded-md border border-stone-300 bg-white px-3 text-lg font-normal sm:w-44">
                  <option value="">Any decade</option>
                  {decades.map((d) => (
                    <option key={d} value={d}>
                      {d}s
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {all.length === 0 ? (
              <p className="mt-8 border-t border-stone-200 py-8 text-lg text-stone-700">No sermons found. Try a different word, or start again.</p>
            ) : (
              <>
                {results.length > 0 && (
                  <ul className="mt-6 grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
                    {results.slice(0, shown).map((s) => (
                      <SermonCard key={s.id} s={s} index={index} />
                    ))}
                  </ul>
                )}
                {inText.length > 0 && shown > results.length && (
                  <>
                    <h3 className="mt-10 font-serif text-2xl font-semibold text-navy-900">Found in the sermon text</h3>
                    <ul className="mt-4 grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
                      {inText.slice(0, shown - results.length).map((s) => (
                        <SermonCard key={s.id} s={s} index={index} />
                      ))}
                    </ul>
                  </>
                )}
                {shown < all.length && (
                  <div className="mt-8 text-center">
                    <button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} className="inline-flex min-h-14 items-center gap-2 rounded-md bg-navy-900 px-6 text-lg font-semibold text-white hover:bg-navy-800">
                      Show more ({(all.length - shown).toLocaleString()} left) <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {index && (
          <p className="mt-12 text-base text-stone-600">
            Sermons by CRCA ministers, for reading services, personal devotion and further study. Last updated{' '}
            {new Date(index.syncedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        )}
      </div>
    </>
  );
}
