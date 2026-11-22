import { BookOpen } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';

export function VisionValuesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Who We Are"
        title="Vision & Values"
        description={identity.missionAndVision.intro}
        breadcrumbs={[{ label: 'Who We Are' }, { label: 'Vision & Values' }]}
      />

      {/* Mission & Vision */}
      <section
        id="mission-vision"
        className="scroll-mt-[calc(var(--site-header-height,72px)+1rem)] bg-stone-50 py-14 sm:py-18"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-navy-900 p-8 text-white shadow-sm">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-gold-400">
                {identity.missionAndVision.missionLabel}
              </div>
              <h2 className="mt-3 font-serif text-3xl font-bold leading-snug text-white">
                “{identity.missionAndVision.mission}”
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-100">
                We want to be a family of churches and individual believers who are constantly
                being transformed by the Word of God so that we might more effectively serve him.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
                {identity.missionAndVision.visionLabel}
              </div>
              <h2 className="mt-3 font-serif text-2xl font-bold leading-snug text-navy-900 sm:text-3xl">
                {identity.missionAndVision.vision}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-700">
                This vision is lived out through local elder-led churches that worship faithfully,
                disciple believers of every age, and plant new gospel communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section
        id="core-values"
        className="scroll-mt-[calc(var(--site-header-height,72px)+1rem)] bg-white py-14 sm:py-18 border-t border-stone-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
              Our Core Values
            </div>
            <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900">
              Six biblical convictions shaping our culture
            </h2>
            <p className="mt-2 text-base text-stone-700">{identity.coreValues.intro}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {identity.coreValues.items.map((value, idx) => (
              <article
                key={value.id}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold text-gold-600">
                      0{idx + 1}
                    </span>
                    <BookOpen className="h-4 w-4 text-teal-600" />
                  </div>
                  <h3 className="mt-3 font-serif text-xl font-bold text-navy-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-teal-700">{value.summary}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{value.detail}</p>
                </div>
                <div className="mt-5 border-t border-stone-200 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Scripture Foundation
                  </span>
                  <p className="mt-1 text-xs font-medium text-navy-800">{value.scriptures}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
