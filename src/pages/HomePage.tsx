import { FormEvent, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import churchesRaw from '../data/churches.json';
import identity from '../data/identity.json';
import beliefs from '../data/beliefs.json';
import { ministryMegaMenuColumns } from '../data/navigation';
import type { ChurchRecord } from '../components/AustraliaChurchMap';
import { loadAuLocations } from '../data/locationHubs';

const allChurches = churchesRaw as ChurchRecord[];

const STATES: { code: ChurchRecord['state']; name: string }[] = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
  { code: 'ACT', name: 'Canberra' },
];

const DOCS = '/for-churches/forms-and-documents';

const STANDARDS = [
  { label: 'The Apostles’ Creed', to: `${DOCS}/creeds-and-confessions-01-ecumenical-creeds-01-the-apostles-creed` },
  { label: 'The Nicene Creed', to: `${DOCS}/creeds-and-confessions-01-ecumenical-creeds-02-the-nicene-creed` },
  { label: 'The Athanasian Creed', to: `${DOCS}/creeds-and-confessions-01-ecumenical-creeds-03-the-athanasian-creed` },
  { label: 'The Belgic Confession', to: `${DOCS}/creeds-and-confessions-02-reformed-confessions-01-the-belgic-confession` },
  { label: 'The Heidelberg Catechism', to: `${DOCS}/creeds-and-confessions-02-reformed-confessions-02-the-heidelberg-catechism` },
  { label: 'The Canons of Dort', to: `${DOCS}/creeds-and-confessions-02-reformed-confessions-03-the-canons-of-dort` },
];

const LEADER_LINKS = [
  { label: 'Forms & documents', detail: 'Liturgical forms, creeds and worship readings', to: DOCS },
  { label: 'Church Order (2022)', detail: 'Searchable, with cross-references', to: `${DOCS}/church-order-01-crca-church-order-2022` },
  { label: 'Acts of Synod 2024', detail: 'Decisions and committee mandates', to: `${DOCS}/acts-of-synod-01-acts-of-synod-2024` },
  { label: 'Reading sermons', detail: 'Word of Salvation archive', to: '/sermons' },
  { label: 'Safe Church', detail: 'Policies, training and reporting', to: '/safe-church' },
  { label: 'Contact the office', detail: 'Find the right person', to: '/contact' },
];

const linkUnderline =
  'text-navy-900 underline decoration-teal-500 decoration-2 underline-offset-[6px] hover:decoration-navy-900';

function TwoColumn({ id, title, children, tone = 'white' }: { id: string; title: string; children: ReactNode; tone?: 'white' | 'paper' }) {
  return (
    <section aria-labelledby={id} className={tone === 'paper' ? 'border-y border-stone-200 bg-stone-50' : 'bg-white'}>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
        <h2 id={id} className="font-serif text-3xl font-semibold text-navy-900 lg:col-span-4">
          {title}
        </h2>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [churchQuery, setChurchQuery] = useState('');

  function handleChurchSearch(e: FormEvent) {
    e.preventDefault();
    const q = churchQuery.trim();
    navigate(q ? `/find-a-church?q=${encodeURIComponent(q)}` : '/find-a-church');
  }

  return (
    <>
      {/* Welcome + find a church */}
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-teal-700">Christian Reformed Churches of Australia</p>
            <h1 className="mt-3 font-serif text-[2.6rem] font-semibold leading-[1.05] text-navy-900 sm:text-6xl">
              Reforming to reach the lost for Christ
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-700 sm:text-xl">
              We are a family of {allChurches.length} congregations across Australia, together since 1951. We believe the Bible is
              God’s Word, and we hold to the historic Reformed confessions.
            </p>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold">
              <Link to="/who-we-are/beliefs" className={linkUnderline}>
                What we believe
              </Link>
              <Link to="/who-we-are/history" className={linkUnderline}>
                Our history
              </Link>
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="border-t-4 border-teal-500 bg-white p-6 ring-1 ring-stone-200 sm:p-8">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">Find a church near you</h2>
              <p className="mt-2 text-stone-700">Service times, addresses and livestreams for every CRCA congregation.</p>
              <form onSubmit={handleChurchSearch} role="search" className="mt-5 flex gap-2">
                <label htmlFor="home-church-search" className="sr-only">
                  Suburb, city or postcode
                </label>
                <input
                  id="home-church-search"
                  type="text"
                  value={churchQuery}
                  onFocus={() => void loadAuLocations()}
                  onChange={(e) => setChurchQuery(e.target.value)}
                  placeholder="Suburb, city or postcode"
                  className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3.5 py-3 text-base text-navy-900 placeholder:text-stone-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/25"
                />
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-3 font-semibold text-white hover:bg-navy-800">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Search</span>
                </button>
              </form>
              <ul className="mt-6 grid grid-cols-1 gap-x-6 border-t min-[440px]:grid-cols-2 border-stone-200 pt-2 text-[0.95rem]">
                {STATES.map((s) => (
                  <li key={s.code}>
                    <Link
                      to={`/find-a-church?state=${s.code}`}
                      className="flex items-baseline justify-between gap-2 border-b border-stone-100 py-2 text-navy-900 hover:text-teal-700"
                    >
                      <span>{s.name}</span>
                      <span className="tabular-nums text-sm text-stone-500">{allChurches.filter((c) => c.state === s.code).length}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/find-a-church" className="flex items-center justify-between gap-2 py-2 font-semibold text-teal-700 hover:text-navy-900">
                    <span>Map of all churches</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <TwoColumn id="believe" title="What we believe">
        <p className="font-serif text-xl leading-relaxed text-navy-900 sm:text-2xl sm:leading-relaxed">
          {beliefs.overview.split('. ').slice(0, 2).join('. ')}.
        </p>
        <p className="mt-5 max-w-2xl leading-relaxed text-stone-700">{beliefs.additionalNote}</p>
        <ul className="mt-8 grid gap-x-10 border-t border-stone-200 sm:grid-cols-2">
          {STANDARDS.map((s) => (
            <li key={s.to} className="border-b border-stone-200">
              <Link to={s.to} className="group flex items-center justify-between py-3 text-navy-900 hover:text-teal-700">
                {s.label}
                <ArrowRight className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/who-we-are/beliefs" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
          More about our beliefs <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </TwoColumn>

      <TwoColumn id="vision" title="Our vision" tone="paper">
        <blockquote className="border-l-4 border-teal-500 pl-6 font-serif text-2xl leading-snug text-navy-900 sm:text-3xl">
          {identity.missionAndVision.vision}
        </blockquote>
        <h3 className="mt-12 font-serif text-xl font-semibold text-navy-900">Our values</h3>
        <dl className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
          {identity.coreValues.items.map((v) => (
            <div key={v.id} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
              <dt className="font-semibold text-navy-900">{v.title}</dt>
              <dd className="leading-relaxed text-stone-700">{v.summary}</dd>
            </div>
          ))}
        </dl>
        <Link to="/who-we-are/vision-values" className="mt-6 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
          Mission, vision and strategy <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </TwoColumn>

      {/* Ministries */}
      <section aria-labelledby="ministries" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="ministries" className="font-serif text-3xl font-semibold text-navy-900">
              Ministries
            </h2>
            <Link to="/ministries" className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
              All ministries <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid gap-12 md:grid-cols-3 md:gap-10">
            {ministryMegaMenuColumns.map((col) => (
              <div key={col.id}>
                <h3 className="border-b-2 border-navy-900 pb-2 text-sm font-semibold uppercase tracking-[0.08em] text-navy-900">{col.heading}</h3>
                <ul className="divide-y divide-stone-200">
                  {col.items.map((item) => {
                    const body = (
                      <>
                        <span className="inline-flex items-center gap-1.5 font-serif text-lg font-semibold text-navy-900 group-hover:text-teal-700">
                          {item.label}
                          {item.isExternal && <ExternalLink className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />}
                        </span>
                        <span className="mt-0.5 block text-[0.95rem] leading-snug text-stone-600">{item.description}</span>
                      </>
                    );
                    return (
                      <li key={item.to}>
                        {item.isExternal ? (
                          <a href={item.to} target="_blank" rel="noopener noreferrer" className="group block py-4">
                            {body}
                          </a>
                        ) : (
                          <Link to={item.to} className="group block py-4">
                            {body}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For church leaders */}
      <section aria-labelledby="leaders" className="border-t border-stone-200 bg-stone-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-20">
          <div className="lg:col-span-4">
            <h2 id="leaders" className="font-serif text-3xl font-semibold text-navy-900">
              For church leaders
            </h2>
            <p className="mt-3 max-w-sm leading-relaxed text-stone-700">Resources for ministers, elders, deacons and church administrators.</p>
          </div>
          <ul className="grid gap-x-10 border-t border-stone-300 sm:grid-cols-2 lg:col-span-8">
            {LEADER_LINKS.map((l) => (
              <li key={l.to} className="border-b border-stone-300">
                <Link to={l.to} className="group flex items-center justify-between gap-4 py-4">
                  <span>
                    <span className="block font-semibold text-navy-900 group-hover:text-teal-700">{l.label}</span>
                    <span className="block text-sm text-stone-600">{l.detail}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-teal-600 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
