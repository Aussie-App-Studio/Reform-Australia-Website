import { BookOpen, CheckCircle2, ExternalLink, Quote } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';
import { siteConfig } from '../data/siteConfig';

export function HistoryPage() {
  const { history } = identity;

  return (
    <>
      <PageHeader
        title={history.heading}
        description={history.lead}
        breadcrumbs={[{ label: 'Who We Are' }, { label: 'Our History' }]}
      />

      {/* Narrative + Sanctuary Photo */}
      <section className="bg-stone-50 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="overflow-hidden rounded-lg border border-stone-200">
                <img
                  src={siteConfig.images.heritageSanctuary}
                  alt="Warm sunlit timber sanctuary inside an Australian Christian Reformed church"
                  width={1200}
                  height={896}
                  loading="lazy"
                  decoding="async"
                  className="h-72 w-full object-cover sm:h-88"
                />
              </div>
              <blockquote className="rounded-lg bg-navy-900 p-6 text-white">
                <Quote className="h-6 w-6 text-teal-100" />
                <p className="mt-3 font-serif text-xl italic leading-relaxed text-white">
                  “{history.scriptureQuote}”
                </p>
                <footer className="mt-2 text-xs font-bold uppercase tracking-wider text-teal-100">
                  — {history.scriptureRef}
                </footer>
              </blockquote>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                  The Reformed stream of the Christian Church
                </h2>
                <p className="mt-2 text-base text-stone-700">{history.reformedEmphasesIntro}</p>
                <ul className="mt-4 space-y-2.5">
                  {history.reformedEmphases.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-900">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <h3 className="font-serif text-lg font-bold text-navy-900">
                  Founding commitments from 1951
                </h3>
                <p className="mt-1 text-xs text-stone-600">
                  Formed during post-WWII Dutch migration to Australia with three enduring goals:
                </p>
                <ul className="mt-4 space-y-3">
                  {history.foundingCommitments.map((goal) => (
                    <li key={goal} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Since 1951 */}
      <section className="bg-white py-14 sm:py-18 border-t border-stone-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
              Timeline
            </div>
            <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900">
              Growing across Australia since 1951
            </h2>
          </div>

          <div className="mt-10 space-y-6">
            {history.milestones.map((milestone) => (
              <div
                key={milestone.era}
                className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-stone-50/70 p-6 sm:flex-row sm:items-start sm:gap-6"
              >
                <div className="shrink-0">
                  <span className="inline-flex rounded-md bg-navy-900 px-4 py-1.5 font-serif text-sm font-bold text-teal-100">
                    {milestone.era}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-navy-900">{milestone.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Archive: Trowel and Sword (1954–2010) */}
          <div className="mt-12 rounded-lg border border-stone-200 bg-navy-900 p-7 text-white sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-teal-100">
                  <BookOpen className="h-4 w-4" />
                  <span>Historical Archive (1954–2010)</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                  Trowel and Sword Revisited
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-100">
                  Published by and for the Reformed Churches of Australia and New Zealand from
                  October 1954 to December 2010, <em>Trowel and Sword</em> chronicled decades of
                  church planting, theological reflection, and denominational life. An unofficial
                  member-run archive continues to digitise these historical articles online.
                </p>
              </div>
              <a
                href="https://tsrevisited.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500 self-start sm:self-center"
              >
                <span>Browse Archive (tsrevisited.com)</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
