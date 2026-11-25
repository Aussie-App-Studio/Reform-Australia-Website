import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookMarked, BookOpenText, Briefcase, Download, FileText, GraduationCap, Handshake, Landmark, Mail, MessagesSquare, Search, ShieldCheck, X } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import leaderData from '../data/leaderResources.json';
import {
  DOC_IDS,
  fetchDocsIndex,
  fetchSearchIndex,
  flattenDocs,
  searchDocuments,
} from '../lib/crcaDocs/client';
import type { FlattenedDocItem, SearchIndex } from '../lib/crcaDocs/types';


const MAIN_ENTRIES = [
  { Icon: FileText, title: 'Forms & documents', detail: 'Liturgical forms, creeds and confessions, and worship readings, with a service-preparation tool.', to: '/for-churches/forms-and-documents' },
  { Icon: BookMarked, title: 'Church Order', detail: 'The 2022 Book of Church Order, searchable and cross-referenced.', to: `/for-churches/forms-and-documents/${DOC_IDS.churchOrder2022}` },
  { Icon: Landmark, title: 'Acts of Synod', detail: 'Decisions of Synod 2024, committee mandates and resolutions.', to: `/for-churches/forms-and-documents/${DOC_IDS.actsOfSynod2024}` },
  { Icon: BookOpenText, title: 'Reading sermons', detail: 'The Word of Salvation archive: over 2,000 sermons for reading services.', to: '/sermons' },
  { Icon: ShieldCheck, title: 'Safe Church', detail: 'Safeguarding policy, volunteer approval, training, forms and how to report a concern.', to: '/safe-church' },
  { Icon: GraduationCap, title: 'Candidacy', detail: 'The pathway to ordained ministry in the CRCA.', to: '/ministries/candidacy' },
  { Icon: MessagesSquare, title: 'Shift coaching', detail: 'Coaching for pastors and church councils.', to: '/ministries/shift-coaching' },
  { Icon: Briefcase, title: 'Positions vacant', detail: 'Current vacancies in the CRCA and its churches.', to: '/for-churches/positions-vacant' },
  { Icon: Handshake, title: 'Regional counsellors', detail: 'Confidential support for pastors, their families and church councils.', to: '/for-churches/regional-counsellors' },
  { Icon: Mail, title: 'Contact the office', detail: 'Find the right committee or person for your question.', to: '/contact' },
];

export function ForChurchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [allLibraryDocs, setAllLibraryDocs] = useState<FlattenedDocItem[]>([]);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [totalDocsCount, setTotalDocsCount] = useState(43);

  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    const nextQ = searchParams.get('q') ?? '';
    setQuery((prev) => (prev.trim() === nextQ.trim() ? prev : nextQ));
  }, [searchParams]);

  useEffect(() => {
    if (!normalized || searchIndex) return;
    let cancelled = false;
    fetchSearchIndex()
      .then((si) => {
        if (!cancelled) setSearchIndex(si);
      })
      .catch(() => {
        // Metadata search still works without search-index.json
      });
    return () => {
      cancelled = true;
    };
  }, [normalized, searchIndex]);

  useEffect(() => {
    let cancelled = false;
    fetchDocsIndex()
      .then((idx) => {
        if (cancelled) return;
        const docs = flattenDocs(idx);
        setAllLibraryDocs(docs);
        setTotalDocsCount(idx.documentCount || docs.length || 43);
      })
      .catch(() => {
        // Library search index still resolves if docs index fails
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateQuery(next: string) {
    setQuery(next);
    if (next.trim()) {
      setSearchParams({ q: next.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  const filteredResources = useMemo(() => {
    if (!normalized) return leaderData.resources;
    return leaderData.resources.filter((res) => {
      const haystack = [
        res.title,
        res.category,
        res.description,
        ...res.tags,
        ...(res.keyDuties ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [normalized]);

  const matchingLibraryDocs = useMemo(() => {
    if (!normalized || allLibraryDocs.length === 0) return [];
    return searchDocuments(query, allLibraryDocs, searchIndex);
  }, [normalized, query, allLibraryDocs, searchIndex]);

  const displayedLibraryDocs = matchingLibraryDocs.slice(0, 8);
  const showResourcesSection = !normalized || filteredResources.length > 0;

  return (
    <>
      <PageHeader
        title="For churches"
        description="Resources for ministers, elders, deacons and church administrators across the CRCA."
        breadcrumbs={[{ label: 'For churches' }]}
      />

      <section aria-label="Main resources" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <ul className="grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
            {MAIN_ENTRIES.map((e) => (
              <li key={e.to} className="border-b border-stone-200">
                <Link to={e.to} className="group flex items-start gap-5 py-6">
                  <e.Icon className="mt-0.5 h-8 w-8 shrink-0 text-teal-700" strokeWidth={1.5} aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block font-serif text-2xl font-semibold text-navy-900 group-hover:text-teal-700">{e.title}</span>
                    <span className="mt-1 block max-w-md leading-relaxed text-stone-600">{e.detail}</span>
                  </span>
                  <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-teal-600 transition group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <label htmlFor="leader-search" className="block font-serif text-2xl font-semibold text-navy-900">
              Search the documents
            </label>
            <p className="mt-2 text-stone-700">
              Searches all {totalDocsCount} forms, creeds, confessions and readings, the Church Order and the Acts of Synod.
              Shorthand works too, such as “LD 1” or “CO 52”.
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" aria-hidden="true" />
              <input
                id="leader-search"
                type="search"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                placeholder="For example: baptism, visitation, CO 52"
                className="w-full rounded-md border border-stone-300 bg-white py-3 pl-10 pr-10 text-navy-900 placeholder:text-stone-500 focus:border-teal-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-stone-600 hover:bg-stone-100 hover:text-navy-900"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {normalized && (
              <p role="status" aria-live="polite" className="mt-3 text-sm text-stone-600">
                {matchingLibraryDocs.length + filteredResources.length === 0
                  ? `Nothing found for “${query.trim()}”.`
                  : `${matchingLibraryDocs.length + filteredResources.length} result${
                      matchingLibraryDocs.length + filteredResources.length === 1 ? '' : 's'
                    } for “${query.trim()}”.`}
              </p>
            )}
          </div>

          {normalized && displayedLibraryDocs.length > 0 && (
            <div className="mt-8 max-w-3xl">
              <ul className="divide-y divide-stone-200 border-y border-stone-200">
                {displayedLibraryDocs.map((res, idx) => {
                  const anchor = res.qaAnchor || res.headingSlug;
                  const targetUrl = `/for-churches/forms-and-documents/${res.doc.id}${anchor ? `#${anchor}` : ''}`;
                  return (
                    <li key={`${res.doc.id}-${anchor || 'root'}-${idx}`}>
                      <Link to={targetUrl} className="group block py-4">
                        <span className="block font-semibold text-navy-900 group-hover:text-teal-700">
                          {res.doc.title}
                          {(res.badge || res.headingText) && (
                            <span className="font-normal text-stone-600"> · {res.badge || res.headingText}</span>
                          )}
                        </span>
                        <span
                          className="crca-search-snippet mt-1 block text-sm leading-relaxed text-stone-600 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: res.snippetHtml }}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {matchingLibraryDocs.length > displayedLibraryDocs.length && (
                <Link
                  to={`/for-churches/forms-and-documents?q=${encodeURIComponent(query.trim())}`}
                  className="mt-4 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                >
                  All {matchingLibraryDocs.length} results in the library <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {showResourcesSection && (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2 className="font-serif text-2xl font-semibold text-navy-900">{normalized ? 'Matching pages' : 'More resources'}</h2>
            <ul className="mt-6 grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
              {filteredResources
                // Sermons and Safe Church are already listed at the top of the page.
                .filter((res) => normalized || !['word-of-salvation', 'safe-church-unit', 'regional-counsellors'].includes(res.id))
                .map((res) => {
                  const body = (
                    <>
                      <span className="flex-1">
                        <span className="block font-semibold text-navy-900 group-hover:text-teal-700">{res.title}</span>
                        <span className="mt-1 block leading-relaxed text-stone-600">{res.description}</span>
                      </span>
                      {res.isExternal ? (
                        <Download className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      ) : (
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-teal-600 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      )}
                    </>
                  );
                  return (
                    <li key={res.id} id={res.id} className="border-b border-stone-200">
                      {res.isExternal ? (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 py-5">
                          {body}
                        </a>
                      ) : (
                        <Link to={res.url} className="group flex items-start gap-4 py-5">
                          {body}
                        </Link>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
