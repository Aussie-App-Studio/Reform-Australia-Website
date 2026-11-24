import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, Download, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import beliefsData from '../data/beliefs.json';
import { DOC_IDS } from '../lib/crcaDocs/client';
import { handleTabListKeyDown } from '../utils/tablistKeyboard';

type ConfessionTab =
  | 'creeds'
  | 'belgic-confession'
  | 'heidelberg-catechism'
  | 'canons-of-dort';

const tabs: { id: ConfessionTab; label: string }[] = [
  { id: 'creeds', label: 'Three Ecumenical Creeds' },
  { id: 'belgic-confession', label: 'Belgic Confession' },
  { id: 'heidelberg-catechism', label: 'Heidelberg Catechism' },
  { id: 'canons-of-dort', label: 'Canons of Dort' },
];

export function BeliefsPage() {
  const [activeTab, setActiveTab] = useState<ConfessionTab>('creeds');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'apostles-creed': true,
    'Articles 1–7: God & the Authority of Holy Scripture': true,
    "Lord's Day 1 (Q&A 1–2): Our Only Comfort in Life and in Death": true,
    'First Main Point: Divine Election and Reprobation': true,
  });
  const [filterQuery, setFilterQuery] = useState('');

  const normalizedQuery = filterQuery.trim().toLowerCase();

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeConfession = useMemo(() => {
    return beliefsData.reformedConfessions.find((c) => c.id === activeTab) ?? null;
  }, [activeTab]);

  const filteredCreeds = useMemo(() => {
    if (!normalizedQuery) return beliefsData.ecumenicalCreeds;
    return beliefsData.ecumenicalCreeds.filter(
      (c) =>
        c.title.toLowerCase().includes(normalizedQuery) ||
        c.subtitle.toLowerCase().includes(normalizedQuery) ||
        c.paragraphs.some((p) => p.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery]);

  const filteredSections = useMemo(() => {
    if (!activeConfession) return [];
    if (!normalizedQuery) return activeConfession.sections;
    return activeConfession.sections.filter(
      (sec) =>
        sec.heading.toLowerCase().includes(normalizedQuery) ||
        sec.content.toLowerCase().includes(normalizedQuery)
    );
  }, [activeConfession, normalizedQuery]);

  return (
    <>
      <PageHeader
        title="What we believe"
        description={beliefsData.overview}
        breadcrumbs={[{ label: 'Who We Are' }, { label: 'What We Believe' }]}
      />

      {/* 5-Point Plain-English Gospel Summary */}
      <section className="bg-stone-50 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
              In Plain English
            </div>
            <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900">
              Five core gospel truths we share
            </h2>
            <p className="mt-2 text-base text-stone-700">
              Whether you are exploring Christianity for the first time or looking for a Reformed
              church home, this is the heart of what our congregations teach and live.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {beliefsData.gospelSummary.map((point) => (
              <div
                key={point.number}
                className="flex flex-col rounded-lg border border-stone-200 bg-white p-6"
              >
                <span className="font-serif text-2xl font-bold text-teal-600">{point.number}</span>
                <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{point.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Readable Creeds & Three Forms of Unity Reader */}
      <section className="bg-white py-14 sm:py-18 border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
                <BookOpen className="h-4 w-4" />
                <span>Confessional Standards</span>
              </div>
              <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900">
                Ecumenical Creeds & Three Forms of Unity
              </h2>
              <p className="mt-1.5 text-sm text-stone-700">
                Explore the historic creeds and confessions of the CRCA, or open any document to read in full.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-600" />
              <input
                type="search"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search creeds & confessions..."
                aria-label="Filter creeds or confession articles"
                className="w-full rounded-md border border-stone-300 bg-stone-50 py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-stone-600 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Document Tabs */}
          <div
            role="tablist"
            aria-label="Creeds and Confessions"
            className="mt-8 flex flex-wrap gap-2 border-b border-stone-200 pb-4"
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`beliefs-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="beliefs-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) =>
                    handleTabListKeyDown(
                      e,
                      tabs.map((t) => t.id),
                      activeTab,
                      setActiveTab,
                      'beliefs'
                    )
                  }
                  className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-navy-900 text-white'
                      : 'bg-stone-100 text-navy-800 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel Content */}
          <div
            id="beliefs-tabpanel"
            role="tabpanel"
            aria-labelledby={`beliefs-tab-${activeTab}`}
            className="mt-6 space-y-4"
          >
            {activeTab === 'creeds' ? (
              filteredCreeds.length === 0 ? (
                <p className="rounded-md border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
                  No creed text matched “{filterQuery}”.
                </p>
              ) : (
                filteredCreeds.map((creed) => {
                  const isOpen = Boolean(openItems[creed.id] || normalizedQuery);
                  return (
                    <div
                      key={creed.id}
                      className="rounded-lg border border-stone-200 bg-stone-50/70 overflow-hidden"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleItem(creed.id)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-stone-100/70 transition-colors"
                      >
                        <div>
                          <h3 className="font-serif text-xl font-bold text-navy-900">
                            {creed.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-stone-600">{creed.subtitle}</p>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-teal-700 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="space-y-4 border-t border-stone-200 bg-white px-6 py-6 text-base leading-relaxed text-navy-900">
                          {creed.paragraphs.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                          <div className="pt-2 border-t border-stone-100">
                            <Link
                              to={`/for-churches/forms-and-documents/${creed.readerDocId}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                            >
                              <span>Read full text</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              activeConfession && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-stone-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-navy-900">
                        {activeConfession.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-stone-600">
                        Authored / Adopted: {activeConfession.author}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">
                        {activeConfession.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <Link
                        to={`/for-churches/forms-and-documents/${activeConfession.readerDocId}`}
                        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Read Full Text</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <a
                        href={activeConfession.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800"
                      >
                        <Download className="h-4 w-4 text-teal-400" />
                        <span>Download Official PDF</span>
                      </a>
                    </div>
                  </div>

                  {filteredSections.length === 0 ? (
                    <p className="rounded-md border border-stone-200 bg-stone-50 p-6 text-sm text-stone-600">
                      No confession summary section matched “{filterQuery}”.
                    </p>
                  ) : (
                    filteredSections.map((sec) => {
                      const isOpen = Boolean(openItems[sec.heading] || normalizedQuery);
                      return (
                        <div
                          key={sec.heading}
                          className="rounded-lg border border-stone-200 bg-stone-50/70 overflow-hidden"
                        >
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => toggleItem(sec.heading)}
                            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-stone-100/70 transition-colors"
                          >
                            <span className="font-serif text-lg font-bold text-navy-900">
                              {sec.heading}
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-teal-700 transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="border-t border-stone-200 bg-white px-6 py-5 text-sm leading-relaxed text-stone-700 sm:text-base">
                              {sec.content}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )
            )}
          </div>

          <div className="mt-8 rounded-lg border border-gold-400/40 bg-gold-50 p-5 text-sm leading-relaxed text-navy-900">
            <div>
              <strong>Additional Reformed Standards:</strong> {beliefsData.additionalNote}
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <Link
                to={`/for-churches/forms-and-documents/${DOC_IDS.westminsterConfession}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold-400/60 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
              >
                <span>Read Westminster Confession of Faith</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to={`/for-churches/forms-and-documents/${DOC_IDS.contemporaryTestimony}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold-400/60 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
              >
                <span>Read Contemporary Testimony</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to={`/for-churches/forms-and-documents/${DOC_IDS.formOfSubscription}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold-400/60 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
              >
                <span>Read CRCA Form of Subscription</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
