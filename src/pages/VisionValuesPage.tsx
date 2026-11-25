import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';
import { responsive } from '../utils/responsiveImage';

function Section({ id, title, intro, tone = 'white', children }: { id: string; title: string; intro?: string; tone?: 'white' | 'paper'; children: React.ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-28 border-t border-stone-200 ${tone === 'paper' ? 'bg-stone-50' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">{title}</h2>
          {intro && <p className="mt-3 text-lg leading-relaxed text-stone-700">{intro}</p>}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function VisionValuesPage() {
  const { missionAndVision, coreValues } = identity;
  return (
    <>
      <PageHeader
        title="Vision and values"
        description={missionAndVision.intro}
        breadcrumbs={[{ label: 'Who we are' }, { label: 'Vision and values' }]}
      />

      <figure className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <img
          src={`${import.meta.env.BASE_URL}images/crca/synod-2022.webp`}
          {...responsive(`${import.meta.env.BASE_URL}images/crca/synod-2022.webp`, '100vw')}
          alt="Synod delegates seated at tables facing the front of a hall, with a large screen and the chair's table"
          className="aspect-[4/1] w-full rounded-md object-cover max-sm:aspect-[2/1]"
        />
        <figcaption className="mt-2 text-sm text-stone-600">Delegates at a CRCA Synod.</figcaption>
      </figure>

      {/* Mission and vision */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <h2 className="font-serif text-xl font-semibold text-teal-100">{missionAndVision.missionLabel}</h2>
            <p className="mt-3 font-serif text-3xl leading-snug sm:text-4xl">{missionAndVision.mission}</p>
          </div>
          <div className="lg:border-l lg:border-white/15 lg:pl-16">
            <h2 className="font-serif text-xl font-semibold text-teal-100">{missionAndVision.visionLabel}</h2>
            <p className="mt-3 font-serif text-2xl leading-snug sm:text-3xl">{missionAndVision.vision}</p>
          </div>
        </div>
      </section>

      <Section id="core-values" title="Our core values" intro={coreValues.intro}>
        <dl className="grid gap-x-12 border-t border-stone-200 md:grid-cols-2">
          {coreValues.items.map((v) => (
            <div key={v.id} className="border-b border-stone-200 py-6">
              <dt className="font-serif text-xl font-semibold text-navy-900">{v.title}</dt>
              <dd className="mt-1.5 leading-relaxed text-stone-700">{v.summary}</dd>
              <dd className="mt-2 text-sm text-stone-500">{v.scriptures}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="strategies" title="How we go about it" tone="paper">
        <div id="four-fold-task" className="max-w-3xl scroll-mt-28 space-y-4 text-lg leading-relaxed text-stone-700">
          <p>
            Four tasks shape our work together: to <strong className="text-navy-900">pray</strong> for the Holy Spirit’s work
            among us, to <strong className="text-navy-900">grow</strong> healthy churches and plant new ones, to{' '}
            <strong className="text-navy-900">train</strong> disciples and leaders, and to{' '}
            <strong className="text-navy-900">align</strong> our life together with this mission.
          </p>
          <p>
            In practice that means mentoring pastors, training people for evangelism and leadership, helping churches grow in
            health, planting new churches, and taking part in mission here and overseas.
          </p>
        </div>
        <p className="mt-8 text-lg text-stone-700">
          These grow out of{' '}
          <Link to="/who-we-are/beliefs" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
            what we believe
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
