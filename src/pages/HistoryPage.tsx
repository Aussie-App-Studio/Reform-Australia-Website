import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';

const img = (name: string) => `${import.meta.env.BASE_URL}images/history/${name}.webp`;
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/';

function Photo({ src, alt, caption, credit, creditUrl, className = '' }: { src: string; alt: string; caption: string; credit: string; creditUrl?: string; className?: string }) {
  return (
    <figure className={className}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full rounded-md bg-stone-100 object-cover" />
      <figcaption className="mt-2 text-sm leading-snug text-stone-600">
        {caption}{' '}
        <span className="text-stone-500">
          Photo: {creditUrl ? <a href={creditUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{credit}</a> : credit}
        </span>
      </figcaption>
    </figure>
  );
}

export function HistoryPage() {
  const { history } = identity;

  return (
    <>
      <PageHeader
        title={history.heading}
        description={history.lead}
        breadcrumbs={[{ label: 'Who we are' }, { label: 'Our history' }]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">How the CRCA began</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            The CRCA was formed in 1951, after the post-war migration of Dutch people to Australia. The founders
            wanted a church that:
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-stone-700 marker:font-semibold marker:text-navy-900">
            {history.foundingCommitments.map((goal) => (
              <li key={goal} className="pl-1">
                {goal.charAt(0).toLowerCase() + goal.slice(1)}
              </li>
            ))}
          </ol>

          <Photo
            className="mt-10"
            src={img('1956-emigrant-ship')}
            alt="The passenger ship Johan van Oldenbarnevelt leaving Amsterdam harbour, with people watching from a jetty"
            caption="The Johan van Oldenbarnevelt leaves Amsterdam with 1,100 emigrants, 1 November 1956."
            credit="Wim van Rossem / Anefo, Nationaal Archief (public domain)"
            creditUrl="https://commons.wikimedia.org/wiki/File:Vertrek_Ms._Johan_van_OLdenbarneveldt_met_1100_emigranten,_Bestanddeelnr_908-1177.jpg"
          />
          <Photo
            className="mt-8"
            src={img('1951-sibajak-emigrants')}
            alt="A Dutch family seated at a dining table on board ship, in black and white"
            caption="Emigrants bound for Australia at dinner on board the Sibajak, January 1951."
            credit="Carel L. de Vogel / Anefo, Nationaal Archief (public domain)"
            creditUrl="https://commons.wikimedia.org/wiki/File:M.S._Sibajak_met_emigranten_naar_Australi%C3%AB,_Bestanddeelnr_904-4177.jpg"
          />

          <h2 className="mt-14 font-serif text-3xl font-semibold text-navy-900">The Reformed tradition</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">{history.reformedEmphasesIntro}</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg leading-relaxed text-stone-700 marker:text-stone-400">
            {history.reformedEmphases.map((item) => (
              <li key={item} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            Read more in{' '}
            <Link to="/who-we-are/beliefs" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              What we believe
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">Since 1951</h2>
          <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
            {history.milestones.map((milestone) => (
              <div key={milestone.era} className="grid gap-1 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="font-serif text-lg font-semibold text-teal-700">{milestone.era}</dt>
                <dd>
                  <p className="font-semibold text-navy-900">{milestone.title}</p>
                  <p className="mt-1 leading-relaxed text-stone-700">{milestone.description}</p>
                  {'link' in milestone && milestone.link && (
                    <Link
                      to={milestone.link as string}
                      className="mt-2 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                    >
                      Read about Trowel and Sword <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <Photo
              src={img('geelong-reformed-church')}
              alt="A bluestone Gothic-style church building with a rose window behind a low fence"
              caption="Geelong Reformed Church, Newtown, Victoria."
              credit="Mattinbgn, CC BY-SA 3.0"
              creditUrl={CC_BY_SA_3}
            />
            <Photo
              src={img('st-marys-crc-colyton')}
              alt="A brick church with a white tower bearing a cross and the words O magnify the Lord, and a sign reading St Marys Christian Reformed Church"
              caption="St Marys Christian Reformed Church, Colyton, New South Wales."
              credit="Sardaka, CC BY-SA 3.0"
              creditUrl={CC_BY_SA_3}
            />
          </div>
        </div>
      </section>
    </>
  );
}
