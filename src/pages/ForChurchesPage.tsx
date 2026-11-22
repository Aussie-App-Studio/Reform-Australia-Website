import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  FolderOpen,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import leaderData from '../data/leaderResources.json';
import {
  DOC_IDS,
  EXTENSION_URLS,
  encodeDocUrl,
  fetchDocsIndex,
  fetchSearchIndex,
  flattenDocs,
  searchDocuments,
} from '../lib/crcaDocs/client';
import type { FlattenedDocItem, SearchIndex } from '../lib/crcaDocs/types';

const quickKeywords = [
  'baptism',
  'liturgical forms',
  'church order',
  'final examination',
  'acts of synod',
  'reading sermons',
  'visitation',
  'marriage',
  'candidacy',
  'safe church',
  'health check',
  'missions',
];

const spotlightTiles = [
  {
    eyebrow: '25 Liturgical Forms',
    title: 'Liturgical Forms',
    description:
      "Baptism, Profession of Faith, Lord's Supper, Ordination, Discipline, Marriage & Funerals—with live Service Prep personalisation.",
    to: '/for-churches/forms-and-documents?category=liturgical-forms',
    icon: FolderOpen,
  },
  {
    eyebrow: '86 Articles • Current',
    title: 'CRCA Church Order (2022)',
    description:
      'Complete 2022 Book of Church Order governing offices, assemblies, worship, sacraments, and restorative discipline.',
    to: `/for-churches/forms-and-documents/${DOC_IDS.churchOrder2022}`,
    icon: FileText,
  },
  {
    eyebrow: '9 Confessional Texts',
    title: 'Creeds & Confessions',
    description:
      'Ecumenical Creeds, Belgic Confession, Heidelberg Catechism, Canons of Dort, Westminster Confession, Contemporary Testimony & Form of Subscription.',
    to: '/for-churches/forms-and-documents?category=creeds-and-confessions',
    icon: BookOpen,
  },
  {
    eyebrow: '6 Worship Collections',
    title: 'Worship Readings',
    description:
      'Calls to Worship, Greetings & Benedictions, Law Readings, Assurances of Pardon & Offering Readings—ready for slides.',
    to: '/for-churches/forms-and-documents?category=other-resources',
    icon: Sparkles,
  },
];

export function ForChurchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [showCounsellorGuide, setShowCounsellorGuide] = useState(false);
  const [showHealthVideo, setShowHealthVideo] = useState(false);
  const [allLibraryDocs, setAllLibraryDocs] = useState<FlattenedDocItem[]>([]);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [totalDocsCount, setTotalDocsCount] = useState(43);

  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    const nextQ = searchParams.get('q') ?? '';
    setQuery((prev) => (prev.trim() === nextQ.trim() ? prev : nextQ));
  }, [searchParams]);

  useEffect(() => {
    if (normalized.includes('counsellor')) {
      setShowCounsellorGuide(true);
    }
  }, [normalized]);

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
  const hasNoMatches =
    Boolean(normalized) && matchingLibraryDocs.length === 0 && filteredResources.length === 0;

  return (
    <>
      <PageHeader
        eyebrow="For Churches • Leader & Elder Hub"
        title="Governance, Liturgy, Safeguarding & Pastoral Tools"
        description="Liturgical forms, the 2022 Church Order, Synod records, safeguarding resources, and pastoral coaching for CRCA pastors, elders, deacons, and church administrators."
        breadcrumbs={[{ label: 'For Churches' }]}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/for-churches/forms-and-documents"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <BookOpen className="h-4 w-4" />
              <span>Open Forms &amp; Documents Library</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={`/for-churches/forms-and-documents/${DOC_IDS.churchOrder2022}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              <FileText className="h-4 w-4 text-gold-400" />
              <span>Read 2022 Church Order</span>
            </Link>
          </div>
        }
      />

      {/* Embedded Forms & Documents Spotlight Band */}
      <section className="border-b border-stone-200 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                CRCA Document Library • {totalDocsCount} Documents
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                CRCA Forms, Confessions &amp; 2022 Church Order
              </h2>
            </div>

            <a
              href={EXTENSION_URLS.installGuide}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Also available as an Offline Browser Extension</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {spotlightTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.title}
                  to={tile.to}
                  className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-5 transition-all hover:border-teal-500 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        {tile.eyebrow}
                      </span>
                      <Icon className="h-4 w-4 text-navy-700 group-hover:text-teal-600" />
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold text-navy-900 group-hover:text-teal-700">
                      {tile.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                      {tile.description}
                    </p>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:text-navy-900">
                    <span>Open in Library</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-semibold text-navy-900">
              Latest 2024 Synod &amp; Candidacy Documents:
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <div className="inline-flex flex-wrap items-center gap-2">
                <Link
                  to={`/for-churches/forms-and-documents/${DOC_IDS.rulesFinalExamination2024}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Rules for the Final Examination (2024)</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <a
                  href={encodeDocUrl('CRCA Rules for the Final Examination 2024.pdf')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-navy-800 hover:border-teal-500 hover:text-teal-700"
                >
                  <FileDown className="h-3 w-3" />
                  <span>PDF</span>
                </a>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2">
                <Link
                  to={`/for-churches/forms-and-documents/${DOC_IDS.actsOfSynod2024}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Acts of Synod (2024)</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <a
                  href={encodeDocUrl('CRCA Acts of Synod 2024.pdf')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-stone-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-navy-800 hover:border-teal-500 hover:text-teal-700"
                >
                  <FileDown className="h-3 w-3" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Client-Side Search Filter */}
      <section
        className={`bg-stone-50 py-10 ${showResourcesSection ? 'border-b border-stone-200' : ''}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
            <label
              htmlFor="leader-search"
              className="block font-serif text-lg font-bold text-navy-900"
            >
              Search Forms, Confessions, 2022 Church Order &amp; Leader Resources
            </label>
            <p className="mt-1 text-xs text-stone-600">
              Search all {totalDocsCount} liturgical forms, creeds, confessions, worship readings,
              Acts of Synod, and all 86 articles of the 2022 Church Order—or try shorthand like{' '}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-navy-900">
                LD 1
              </code>{' '}
              or{' '}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[11px] text-navy-900">
                CO 52
              </code>
              .
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-600" />
                <input
                  id="leader-search"
                  type="search"
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  placeholder='Try typing "baptism", "LD 1", "CO 52", "visitation", "marriage", or "safe church"...'
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-10 text-sm text-navy-900 placeholder:text-stone-600 focus:border-teal-500 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => updateQuery('')}
                    aria-label="Clear search filter"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-600 hover:bg-stone-200 hover:text-navy-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">Quick filters:</span>
              {quickKeywords.map((kw) => {
                const active = normalized === kw;
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => updateQuery(active ? '' : kw)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-navy-900 text-white'
                        : 'bg-stone-100 text-navy-800 hover:bg-teal-50 hover:text-teal-700'
                    }`}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>

            {normalized && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p role="status" aria-live="polite" className="text-xs font-semibold text-teal-700">
                  Found {matchingLibraryDocs.length} Forms &amp; Library match
                  {matchingLibraryDocs.length === 1 ? '' : 'es'} and {filteredResources.length}{' '}
                  leader resource{filteredResources.length === 1 ? '' : 's'} for “{query}”
                </p>
              </div>
            )}
          </div>

          {/* Direct Matches in Forms & Documents Library */}
          {normalized && displayedLibraryDocs.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                    Forms &amp; Documents Library
                  </div>
                  <h2 className="mt-0.5 font-serif text-xl font-bold text-navy-900">
                    Direct Matches in Forms &amp; Documents Library ({matchingLibraryDocs.length})
                  </h2>
                </div>
                <Link
                  to={`/for-churches/forms-and-documents?q=${encodeURIComponent(query.trim())}`}
                  className="text-xs font-semibold text-teal-700 hover:text-navy-900"
                >
                  See all matches in full library →
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {displayedLibraryDocs.map((res, idx) => {
                  const anchor = res.qaAnchor || res.headingSlug;
                  const targetUrl = `/for-churches/forms-and-documents/${res.doc.id}${
                    anchor ? `#${anchor}` : ''
                  }`;
                  return (
                    <Link
                      key={`${res.doc.id}-${anchor || 'root'}-${idx}`}
                      to={targetUrl}
                      className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-4 transition-colors hover:border-teal-500 hover:bg-white"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                            {res.doc.groupTitle}
                          </span>
                          {res.badge ? (
                            <span className="rounded-full border border-gold-400/50 bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-600">
                              {res.badge}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-navy-800 group-hover:text-teal-700">
                              Open →
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-serif text-base font-bold text-navy-900 group-hover:text-teal-700">
                          {res.doc.title}
                        </h3>
                        {res.headingText && !res.badge && (
                          <div className="mt-0.5 text-xs font-semibold text-navy-800">
                            {res.headingText}
                          </div>
                        )}
                        <div
                          className="crca-search-snippet mt-1.5 text-xs leading-relaxed text-stone-700 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: res.snippetHtml }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {hasNoMatches && (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xs">
              <p className="text-sm font-semibold text-navy-900">
                No Forms &amp; Documents Library entries or leader resources matched “{query}”.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuery('')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Reset search filter
                </button>
                <Link
                  to="/for-churches/forms-and-documents"
                  className="text-xs font-semibold text-teal-700 hover:text-navy-900"
                >
                  Browse all {totalDocsCount} documents in the full library →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leader Resources & Compliance Grid */}
      {showResourcesSection && (
        <section className="bg-stone-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                    Resources &amp; Compliance
                  </div>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                    Session, Pastoral &amp; Safe Church Resources
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((res) => (
                  <article
                    key={res.id}
                    id={res.id}
                    className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xs ${
                      res.id === 'safe-church-unit'
                        ? 'border-teal-500/40 bg-teal-50/60'
                        : 'border-stone-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
                          {res.id === 'safe-church-unit' && (
                            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                          )}
                          <span>{res.category}</span>
                        </span>
                        <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-navy-800 border border-stone-200">
                          {res.format}
                        </span>
                      </div>

                      <h3 className="mt-3 font-serif text-xl font-bold text-navy-900">
                        {res.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-700">
                        {res.description}
                      </p>

                      {/* Regional Counsellors Expandable 8-Point Duties */}
                      {res.keyDuties && (
                        <div className="mt-4">
                          <button
                            type="button"
                            aria-expanded={showCounsellorGuide}
                            onClick={() => setShowCounsellorGuide((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-teal-700"
                          >
                            <span>
                              {showCounsellorGuide
                                ? 'Hide 8-Point Role Summary'
                                : 'Read 8-Point Role Summary'}
                            </span>
                            <ChevronDown
                              className={`h-3.5 w-3.5 transition-transform ${
                                showCounsellorGuide ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {showCounsellorGuide && (
                            <ul className="mt-3 space-y-1.5 rounded-xl bg-stone-50 p-3.5 border border-stone-200 text-xs text-stone-700">
                              {res.keyDuties.map((duty) => (
                                <li key={duty} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Church Health Check Video Toggle */}
                      {res.videoEmbedUrl && (
                        <div className="mt-4">
                          <button
                            type="button"
                            aria-expanded={showHealthVideo}
                            aria-controls={`${res.id}-video`}
                            onClick={() => setShowHealthVideo((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-teal-700"
                          >
                            <PlayCircle className="h-4 w-4 text-teal-600" />
                            <span>
                              {showHealthVideo
                                ? 'Hide Intro Video'
                                : 'Watch Church Health Check Intro'}
                            </span>
                          </button>
                          {showHealthVideo && (
                            <div
                              id={`${res.id}-video`}
                              className="mt-3 overflow-hidden rounded-xl border border-stone-200 aspect-video bg-navy-950"
                            >
                              <iframe
                                src={res.videoEmbedUrl}
                                title="CRCA Church Health Check Introduction"
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-200/70">
                      {res.isExternal ? (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                        >
                          <span>
                            {res.format === 'PDF' ? 'Open Official PDF' : `Open ${res.format}`}
                          </span>
                          {res.format === 'PDF' && !/^https?:\/\//i.test(res.url) ? (
                            <Download className="h-3.5 w-3.5" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                        </a>
                      ) : res.id === 'regional-counsellors' ? (
                        <Link
                          to="/contact?topic=admin"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                        >
                          <span>Contact Classis / Admin for Regional Counsellors</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to={res.url}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                        >
                          <span>Open {res.format}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
