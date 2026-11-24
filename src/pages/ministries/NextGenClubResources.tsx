import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import nextGenData from '../../data/nextGenClubs.json';
import { siteConfig } from '../../data/siteConfig';

interface NextGenClubResourcesProps {
  clubName: string;
  enquiryLabel: string;
}

/**
 * Shared curriculum theme, downloadable leader resources, and Safe Church
 * safeguarding callout used by both Cadets and GEMS pages.
 */
export function NextGenClubResources({ clubName, enquiryLabel }: NextGenClubResourcesProps) {
  const { themeHighlight, sharedResources } = nextGenData;

  return (
    <>
      {/* Annual Theme Highlight */}
      <section className="bg-white py-12 sm:py-14 border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-navy-900 p-7 text-white shadow-sm sm:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{themeHighlight.yearLabel}</span>
                </div>
                <h2 className="mt-3 font-serif text-2xl font-bold text-white sm:text-3xl">
                  {themeHighlight.title}
                </h2>
                <p className="mt-2 text-sm font-medium italic text-teal-100 sm:text-base">
                  {themeHighlight.verse}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-navy-100">
                  {themeHighlight.intro}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy-100">
                  {themeHighlight.closing}
                </p>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-white/15 bg-white/5 p-6">
                <h3 className="font-serif text-lg font-bold text-gold-400">
                  Three Key Reminders for Clubs
                </h3>
                <ul className="mt-4 space-y-3">
                  {themeHighlight.reminders.map((item, idx) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Downloadable Club Resources & Safeguarding */}
      <section className="bg-stone-50 py-12 sm:py-16 border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                  Club Leader Downloads
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                  Curriculum & Planning Resources
                </h2>
              </div>
              <p className="text-xs text-stone-600">
                Self-hosted CRCA club materials for {clubName} leaders and counsellors — contact
                CRCA Administration for the latest annual theme pack.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {sharedResources.map((doc) => (
                <article
                  key={doc.url}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="rounded bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-navy-800 border border-stone-200">
                        {doc.format}
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-navy-900">
                      {doc.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                      {doc.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-stone-100 pt-4">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Resource ({doc.format})</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Safe Church + Connect Strip */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-teal-500/30 bg-teal-50/70 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Safe Church Compliance
                  </span>
                  <h3 className="mt-1 font-serif text-xl font-bold text-navy-900">
                    Safeguarding & Leader Screening for {clubName}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    Every local CRCA children’s and youth club operates under CRCA Safe Church
                    standards, Working With Children Check verification, and volunteer training.
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to={siteConfig.safeChurch.url}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800"
                >
                  <span>Open Safe Church</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                  Start or Find a Club
                </span>
                <h3 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Connect with {clubName}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  Looking for a local congregation running {clubName} or wanting help launching a
                  new club in your church?
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/contact?topic=next-gen"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  <span>{enquiryLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/find-a-church"
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs font-semibold text-navy-900 hover:bg-stone-100"
                >
                  <span>Find a Local Church</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
