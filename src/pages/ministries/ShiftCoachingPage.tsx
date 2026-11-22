import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Download, FileText, Mail } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import internalData from '../../data/internalMinistries.json';
import { handleTabListKeyDown } from '../../utils/tablistKeyboard';

export function ShiftCoachingPage() {
  const { shiftCoaching } = internalData;
  const [activeRhythmId, setActiveRhythmId] = useState(shiftCoaching.rhythms[0].id);
  const [showAll, setShowAll] = useState(false);

  const visibleRhythms = showAll
    ? shiftCoaching.rhythms
    : shiftCoaching.rhythms.filter((r) => r.id === activeRhythmId);

  return (
    <>
      <PageHeader
        eyebrow={shiftCoaching.eyebrow}
        title={shiftCoaching.title}
        description={shiftCoaching.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'Shift Coaching' },
        ]}
        actions={
          <div className="flex flex-wrap gap-3">
            <a
              href={shiftCoaching.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <Download className="h-4 w-4" />
              <span>Download Shift Brochure (PDF)</span>
            </a>
            <Link
              to="/contact?topic=outreach"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
            >
              <span>Connect with Ministry Development</span>
            </Link>
          </div>
        }
      />

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Framing & Intro */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Compass className="h-4 w-4" />
                <span>Why Shift Coaching</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Movement toward healthy pastoral & church rhythms
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {shiftCoaching.intro.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-navy-900 p-7 text-white shadow-sm sm:p-8">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Scripture Foundation
                </span>
                <blockquote className="rounded-xl border border-white/15 bg-white/5 p-4 font-serif text-base font-semibold text-white">
                  {shiftCoaching.openingVerse}
                </blockquote>
                <blockquote className="rounded-xl border border-white/15 bg-white/5 p-4 font-serif text-base font-semibold text-teal-100">
                  {shiftCoaching.proverbVerse}
                </blockquote>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-navy-100">
                All reflection questions below are scored on a simple 1–10 scale (where 10 is best),
                asking what one practical step helps move you or your congregation closer to 10.
              </p>
            </div>
          </div>

          {/* Interactive 5 Coaching Rhythms */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                  Coaching Framework (Scale of 1–10)
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                  The Five Shift Coaching Rhythms
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="self-start rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-navy-900 hover:bg-stone-100 sm:self-auto"
              >
                {showAll ? 'View One Rhythm at a Time' : 'View All 5 Rhythms'}
              </button>
            </div>

            {!showAll && (
              <div
                role="tablist"
                aria-label="Shift Coaching Rhythms"
                className="mt-5 flex flex-wrap gap-2"
              >
                {shiftCoaching.rhythms.map((rhythm) => {
                  const active = rhythm.id === activeRhythmId;
                  return (
                    <button
                      key={rhythm.id}
                      id={`shift-rhythm-tab-${rhythm.id}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="shift-rhythm-panel"
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveRhythmId(rhythm.id)}
                      onKeyDown={(e) =>
                        handleTabListKeyDown(
                          e,
                          shiftCoaching.rhythms.map((r) => r.id),
                          activeRhythmId,
                          setActiveRhythmId,
                          'shift-rhythm'
                        )
                      }
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                        active
                          ? 'bg-navy-900 text-white'
                          : 'border border-stone-200 bg-stone-50 text-navy-800 hover:bg-stone-100'
                      }`}
                    >
                      {rhythm.shortTitle}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              id="shift-rhythm-panel"
              role={showAll ? undefined : 'tabpanel'}
              aria-labelledby={showAll ? undefined : `shift-rhythm-tab-${activeRhythmId}`}
              className="mt-6 space-y-6"
            >
              {visibleRhythms.map((rhythm) => (
                <article
                  key={rhythm.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50/70 p-6 sm:p-7"
                >
                  <h3 className="font-serif text-xl font-bold text-navy-900 sm:text-2xl">
                    {rhythm.title}
                  </h3>
                  {rhythm.contextNote && (
                    <p className="mt-1.5 text-xs font-medium text-teal-700">
                      {rhythm.contextNote}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-gold-600">
                        Coaching Questions (1–10)
                      </div>
                      {rhythm.questions.map((q, idx) => (
                        <div
                          key={q}
                          className="rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-navy-900"
                        >
                          <span className="mr-2 font-bold text-teal-700">Q{idx + 1}.</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>

                    <div className="lg:col-span-5 rounded-xl border border-stone-200 bg-white p-5">
                      <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                        <BookOpen className="h-4 w-4" />
                        <span>Suggested Resources</span>
                      </div>
                      <ul className="mt-3 space-y-2.5 text-sm">
                        {rhythm.resources.map((book) => (
                          <li key={book.title} className="border-b border-stone-100 pb-2 last:border-b-0 last:pb-0">
                            <div className="font-semibold text-navy-900">{book.title}</div>
                            <div className="text-xs text-stone-600">{book.author}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Bottom Brochure & Support Band */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <FileText className="h-4 w-4" />
                  <span>Brochure & PDP Guide</span>
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900">
                  Shift Coaching Downloads
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {shiftCoaching.pdpNote}
                </p>
              </div>
              <div className="mt-5">
                <a
                  href={shiftCoaching.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800"
                >
                  <Download className="h-4 w-4 text-teal-400" />
                  <span>Download Shift Brochure (PDF)</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                  Ministry Support
                </span>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900">
                  {shiftCoaching.contact.coordinator}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  Available to encourage, train, and equip pastors and Sessions establishing
                  effective coaching relationships across Australia.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/contact?topic=outreach"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <span>Message Ministry Development</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={`mailto:${shiftCoaching.contact.email}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-teal-700"
                >
                  <Mail className="h-4 w-4 text-teal-600" />
                  <span>{shiftCoaching.contact.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RelatedMinistriesBar
        currentSlug="shift-coaching"
        slugs={['local-church-outreach-training', 'candidacy', 'church-planting-taskforce']}
      />
    </>
  );
}
