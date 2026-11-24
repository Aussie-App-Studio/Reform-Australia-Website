import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Compass, MapPin, Trees } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import { NextGenClubResources } from './NextGenClubResources';
import nextGenData from '../../data/nextGenClubs.json';

export function CadetsPage() {
  const { cadets } = nextGenData;

  return (
    <>
      <PageHeader
        eyebrow={cadets.eyebrow}
        title={cadets.title}
        description={cadets.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'CRCA Cadets' },
        ]}
        actions={
          <Link
            to="/find-a-church"
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500"
          >
            <MapPin className="h-4 w-4" />
            <span>Find a Local Church</span>
          </Link>
        }
      />

      {/* Quick Facts Strip */}
      <section aria-label="CRCA Cadets at a glance" className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {cadets.quickStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-start gap-3 border-l-2 border-gold-500 pl-3.5"
              >
                <div>
                  <dt className="text-sm font-bold text-navy-900">{stat.label}</dt>
                  <dd className="mt-0.5 text-xs text-stone-600">{stat.detail}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* About & Confessional Basis */}
      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-lg border border-stone-200 bg-white p-7 sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Trees className="h-4 w-4" />
                <span>Who We Are</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Mentoring boys in Christlike character
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {cadets.whoWeAre.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
                  <Compass className="h-4 w-4" />
                  <span>What Happens at Cadets</span>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-navy-900">
                  {cadets.activities.map((activity) => (
                    <li key={activity} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <BookOpen className="h-4 w-4" />
                  <span>What We Believe</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-700">
                  {cadets.whatWeBelieve}
                </p>
                <div className="mt-4">
                  <Link
                    to="/who-we-are/beliefs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                  >
                    <span>Read CRCA Creeds & Confessions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Luke 2:52 Four Growth Pillars */}
          <div className="rounded-lg border border-stone-200 bg-white p-7 sm:p-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                Our Goal
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                {cadets.goalVerse}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-700 sm:text-base">
                {cadets.goalSummary}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cadets.growthPillars.map((pillar, idx) => (
                <div
                  key={pillar.title}
                  className="rounded-md border border-stone-200 bg-stone-50/80 p-5"
                >
                  <span className="text-xs font-bold text-teal-700">0{idx + 1}</span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-navy-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NextGenClubResources clubName="CRCA Cadets" enquiryLabel="Enquire About Cadets" />

      <RelatedMinistriesBar
        currentSlug="cadets"
        slugs={['gems', 'youth-convention', 'safe-church-unit']}
      />
    </>
  );
}
