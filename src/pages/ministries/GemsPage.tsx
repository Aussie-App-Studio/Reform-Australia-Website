import { Link } from 'react-router-dom';
import { BookHeart, CheckCircle2, MapPin, Sparkles, Sun } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import { NextGenClubResources } from './NextGenClubResources';
import nextGenData from '../../data/nextGenClubs.json';

export function GemsPage() {
  const { gems } = nextGenData;

  return (
    <>
      <PageHeader
        eyebrow={gems.eyebrow}
        title={gems.title}
        description={gems.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'CRCA GEMS' },
        ]}
        actions={
          <Link
            to="/find-a-church"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
          >
            <MapPin className="h-4 w-4" />
            <span>Find a Local Church</span>
          </Link>
        }
      />

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Mission, Vision & Micah 6:8 Motto */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Sun className="h-4 w-4" />
                <span>About G.E.M.S.</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Girls Everywhere Meeting the Saviour
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {gems.overview.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-stone-200 pt-6">
                <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                    Our Mission
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-navy-900">{gems.mission}</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Our Vision
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-navy-900">{gems.vision}</p>
                </div>
              </div>
            </div>

            {/* Micah 6:8 Motto Callout */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-teal-500/30 bg-gradient-to-br from-navy-900 to-navy-800 p-7 text-white shadow-sm sm:p-8">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
                  <BookHeart className="h-4 w-4" />
                  <span>G.E.M.S. Motto • {gems.motto.reference}</span>
                </div>
                <div className="mt-4 space-y-3 rounded-xl border border-white/15 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">
                    Leaders ask:
                  </p>
                  <p className="font-serif text-lg font-bold text-white">{gems.motto.prompt}</p>
                  <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
                    Girls respond:
                  </p>
                  <p className="font-serif text-lg font-bold text-gold-100">
                    {gems.motto.response}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-navy-100">
                  {gems.motto.context}
                </p>
              </div>
            </div>
          </div>

          {/* Three Age Levels */}
          <div>
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                Age Groups
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Three Progressive Program Levels
              </h2>
              <p className="mt-1.5 text-sm text-stone-700">
                Each level meets the spiritual, social, physical, and emotional needs of girls as
                they learn to apply Scripture to everyday life.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {gems.levels.map((level) => (
                <div
                  key={level.name}
                  className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs"
                >
                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-100">
                    {level.ages}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-bold text-navy-900">{level.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {level.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
              <Sparkles className="h-4 w-4" />
              <span>Club Life & Activities</span>
            </div>
            <h2 className="mt-1.5 font-serif text-2xl font-bold text-navy-900">
              What girls participate in at G.E.M.S.
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gems.activities.map((activity) => (
                <div
                  key={activity}
                  className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-sm text-navy-900"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NextGenClubResources clubName="CRCA GEMS" enquiryLabel="Enquire About GEMS" />

      <RelatedMinistriesBar
        currentSlug="gems"
        slugs={['cadets', 'youth-convention', 'safe-church-unit']}
      />
    </>
  );
}
