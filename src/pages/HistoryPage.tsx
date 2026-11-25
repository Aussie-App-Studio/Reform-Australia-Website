import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';
import churchHistory from '../data/churchHistory.json';
import churchesRaw from '../data/churches.json';
import { PhotoCredit } from '../components/PhotoCredit';
import { responsive } from '../utils/responsiveImage';

const churchById = new Map((churchesRaw as { id: string; name: string; suburb: string; state: string }[]).map((c) => [c.id, c]));

/** Congregations grouped by the decade they began. */
const DECADES = (() => {
  const groups = new Map<string, typeof churchHistory.congregations>();
  for (const c of [...churchHistory.congregations].sort((a, b) => a.sort - b.sort)) {
    const decade = `${Math.floor(c.sort / 10) * 10}s`;
    groups.set(decade, [...(groups.get(decade) ?? []), c]);
  }
  return [...groups.entries()];
})();

const img = (name: string) => `${import.meta.env.BASE_URL}images/history/${name}.webp`;
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/';

function Photo({ src, alt, caption, credit, creditUrl, className = '' }: { src: string; alt: string; caption: string; credit: string; creditUrl?: string; className?: string }) {
  return (
    <figure className={className}>
      <div className="relative">
        <img src={src} {...responsive(src, '(min-width: 800px) 768px, 100vw')} alt={alt} loading="lazy" decoding="async" className="w-full rounded-md bg-stone-100 object-cover" />
        <PhotoCredit credit={credit} url={creditUrl} />
      </div>
      <figcaption className="mt-2 text-sm leading-snug text-stone-600">
        {caption}
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
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 [&>*]:max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">How the CRCA began</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            The CRCA was formed in 1951, after the post-war migration of Dutch people to Australia. From the start, the new
            denomination:
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-stone-700 marker:font-semibold marker:text-navy-900">
            {history.foundingCommitments.map((goal) => (
              <li key={goal} className="pl-1">
                {goal}
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
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <Photo
              src={img('1958-zevenbergen-family')}
              alt="A man and a woman look at a large map on a table with a smiling man in glasses, in black and white"
              caption="Mr and Mrs Zevenbergen, Australia’s 100,000th Dutch emigrants, look at a map with the Australian ambassador, 17 September 1958."
              credit="Harry Pot / Anefo, Nationaal Archief (public domain)"
              creditUrl="https://commons.wikimedia.org/wiki/File:100.000ste_Nederlandse_emigrant_naar_Australie_fam._Zevenbergen_met_ambassadeur_,_Bestanddeelnr_909-8559.jpg"
            />
            <Photo
              src={img('1960-emigrants-by-plane')}
              alt="Dutch families with children and travel bags standing in front of a KLM aeroplane, in black and white"
              caption="Emigrant families about to fly from the Netherlands to Australia, 28 December 1960."
              credit="Joop van Bilsen / Anefo, Nationaal Archief (public domain)"
              creditUrl="https://commons.wikimedia.org/wiki/File:Vertrek_van_emigranten_naar_Australie,_groep_voor_het_vliegtuig,_Bestanddeelnr_911-9175.jpg"
            />
          </div>

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
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 [&>*]:max-w-3xl">
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
              alt="A stone Gothic-style church building with a rose window behind a low fence"
              caption="Geelong Christian Reformed Church, Pakington Street, Geelong West, Victoria."
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
            <Photo
              src={img('penguin-crc')}
              alt="A red-brick church with a tall pointed bell tower, on a grassy rise under a blue sky"
              caption="The Christian Reformed Church of Penguin, Tasmania. Penguin was one of the first two congregations, instituted in October 1951."
              credit="Duncan Grant, Churches of Tasmania (used with permission)"
            />
            <Photo
              src={img('kingston-reformed-church-1956')}
              alt="A low brick church with a long row of windows, in black and white"
              caption="The first Reformed church building in Kingston, Tasmania, opened in 1956."
              credit="Dutch Australian Cultural Centre (used with permission)"
            />
            <Photo
              className="sm:col-span-2"
              src={img('rtc-geelong-grammar-building')}
              alt="A two-storey Gothic Revival stone building with steep gables, behind a large rounded shrub"
              caption="The Reformed Theological College, founded by the Synod in 1954, was based for almost 40 years in this wing of the former Geelong Grammar School (built 1857)."
              credit="Reformed Theological College (used with permission)"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 [&>*]:max-w-3xl">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">Our congregations</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">{churchHistory.intro}</p>
          {DECADES.map(([decade, list]) => (
            <div key={decade} className="mt-10">
              <h3 className="font-serif text-2xl font-semibold text-teal-700">{decade}</h3>
              <ul className="mt-3 divide-y divide-stone-200 border-y border-stone-200">
                {list.map((c) => {
                  const church = churchById.get(c.id);
                  if (!church) return null;
                  return (
                    <li key={c.id} className="grid gap-1 py-3 sm:grid-cols-[4.5rem_1fr] sm:gap-4">
                      <span className="font-semibold tabular-nums text-navy-900">{c.year}</span>
                      <span>
                        <Link
                          to={`/find-a-church?q=${encodeURIComponent(church.name)}`}
                          className="font-semibold text-navy-900 underline-offset-4 hover:text-teal-700 hover:underline"
                        >
                          {church.name}
                        </Link>
                        <span className="text-stone-600">
                          , {church.suburb} {church.state}
                        </span>
                        {'note' in c && c.note && <span className="mt-0.5 block text-[0.95rem] leading-snug text-stone-600">{c.note}.</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="mt-10 leading-relaxed text-stone-600">
            Dates come from congregations’ own websites, the Dutch Australian Cultural Centre and other published sources, and a few
            are still being confirmed. If you can correct or add to this list, please{' '}
            <Link to="/contact" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              let the office know
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
