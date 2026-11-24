import { Link } from 'react-router-dom';
import {
  Anchor,
  ArrowRight,
  Building2,
  Compass,
  Download,
  ExternalLink,
  FileText,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import { YouTubeEmbedCard } from '../../components/YouTubeEmbedCard';
import swim from '../../data/swim.json';

const jumpLinks = [
  { label: 'Overview & Values', href: '#swim-overview' },
  { label: 'The Honiara Base', href: '#swim-base' },
  { label: 'Mission Opportunities', href: '#swim-opportunities' },
  { label: 'Newsletters & Policies', href: '#swim-resources' },
];

export function SwimPage() {
  return (
    <>
      <PageHeader
        eyebrow={swim.eyebrow}
        title={`${swim.name} (${swim.acronymMeaning})`}
        description={swim.tagline}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'Solomon Islands SWIM' },
        ]}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact?topic=swim"
              className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500"
            >
              <span>Enquire About SWIM</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      {/* Section Jump Bar */}
      <nav
        aria-label="SWIM sections"
        className="border-b border-stone-200 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3.5 sm:px-6 lg:px-8">
          <span className="mr-2 text-xs font-bold uppercase tracking-wider text-stone-600">
            Jump to:
          </span>
          {jumpLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* 1. Overview & Biblical Values */}
          <section id="swim-overview" className="scroll-mt-32 space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-6 rounded-lg bg-navy-900 p-7 text-white sm:p-8">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-100">
                  <Anchor className="h-4 w-4" />
                  <span>About SWIM</span>
                </div>
                <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                  Supporting Work in Ministry
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-navy-100 sm:text-base">
                  {swim.whatIsSwim}
                </p>

                <div className="mt-6 space-y-4 border-t border-white/15 pt-5">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                      Our Mission
                    </span>
                    <p className="mt-1 text-sm font-medium text-white">{swim.mission}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                      Our Vision
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-navy-100">{swim.vision}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <YouTubeEmbedCard
                  youtubeId={swim.featuredVideo.youtubeId}
                  title={swim.featuredVideo.title}
                  subtitle={swim.featuredVideo.caption}
                />
              </div>
            </div>

            {/* Key Ministry Areas */}
            <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                Scope of Ministry
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                11 Key Ministry Areas
              </h2>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {swim.keyMinistryAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-md border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-navy-900 sm:text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* 8 Core Biblical Values */}
            <div>
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-teal-700">
                  Foundations
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                  Eight Core Biblical Values
                </h2>
                <p className="mt-1.5 text-sm text-stone-700">
                  Every ministry at SWIM is anchored in Scripture to honour God and serve
                  communities in the Solomon Islands with humility and integrity.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                {swim.coreValues.map((val, idx) => (
                  <article
                    key={val.title}
                    className="rounded-lg border border-stone-200 bg-white p-6"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-navy-900">
                        {idx + 1}. {val.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-teal-700">
                        {val.references}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">
                      {val.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* 2. The Honiara Base */}
          <section
            id="swim-base"
            className="scroll-mt-32 rounded-lg border border-stone-200 bg-white p-7 sm:p-8"
          >
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <Building2 className="h-4 w-4" />
                  <span>Base Facilities</span>
                </div>
                <h2 className="mt-1.5 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                  {swim.theBase.headline}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">
                  {swim.theBase.summary}
                </p>
              </div>
              <Link
                to="/contact?topic=swim"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800 lg:self-auto"
              >
                <span>Enquire About Base Bookings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {swim.theBase.highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-stone-200 bg-stone-50/70 p-5"
                >
                  <h3 className="font-serif text-base font-bold text-navy-900">{item.label}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{item.detail}</p>
                </div>
              ))}
            </div>

            <p className="mt-5 rounded-md border border-teal-500/25 bg-teal-50/60 p-4 text-xs leading-relaxed text-navy-900 sm:text-sm">
              {swim.theBase.bookingNote}
            </p>
          </section>

          {/* 3. Mission Opportunities */}
          <section id="swim-opportunities" className="scroll-mt-32 space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                Serving Together
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Mission Opportunities & Community Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {swim.opportunities.map((opp) => (
                <article
                  key={opp.id}
                  className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-6"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-teal-100 bg-teal-50 text-teal-700">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-navy-900">{opp.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">{opp.summary}</p>
                  </div>

                  {opp.externalUrl && (
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <a
                        href={opp.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                      >
                        <span>{opp.externalLabel}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <Compass className="mt-1 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-900">
                    Serving Humbly in the Solomon Islands
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                    {swim.servingReflection}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Newsletters & Policies */}
          <section id="swim-resources" className="scroll-mt-32 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-lg border border-stone-200 bg-white p-6 sm:p-7">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                Updates & Field Reports
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                SWIM Newsletters
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {swim.newsletters.map((nl) => (
                  <a
                    key={nl.url}
                    href={nl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm font-semibold text-navy-900 transition-colors hover:border-teal-500 hover:bg-white"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-teal-700" />
                      <span>{nl.title}</span>
                    </span>
                    <Download className="h-4 w-4 shrink-0 text-teal-600" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-6 sm:p-7">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Policies & Governance</span>
                </div>
                <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                  Short-Term Mission Documents
                </h2>

                <div className="mt-4 space-y-3">
                  {swim.policies.map((pol) => (
                    <a
                      key={pol.url}
                      href={pol.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-md border border-stone-200 bg-stone-50/70 p-4 transition-colors hover:border-teal-500 hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-2 text-sm font-bold text-navy-900">
                        <span>{pol.title}</span>
                        <Download className="h-4 w-4 shrink-0 text-teal-600" />
                      </div>
                      <p className="mt-1 text-xs text-stone-700">{pol.description}</p>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 text-xs">
                <Link
                  to="/for-churches?q=missions"
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                >
                  <span>CRCA Short-Term Missions Code of Best Practice</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={swim.social.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-navy-800 hover:text-teal-700"
                >
                  <span>SWIM on Facebook</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <RelatedMinistriesBar
        currentSlug="swim-solomon-islands"
        slugs={['world-transform', 'ecumenical-relations', 'missional-explorations']}
      />
    </>
  );
}
