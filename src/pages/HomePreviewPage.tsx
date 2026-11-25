// Two home page design options for review (November 2026). Delete once one is chosen.
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ChurchIcon, HeartHandshake, History, Search, Users } from 'lucide-react';
import churchesRaw from '../data/churches.json';
import beliefs from '../data/beliefs.json';
import identity from '../data/identity.json';
import type { ChurchRecord } from '../utils/churchRecord';
import { loadAuLocations } from '../data/locationHubs';
import { AustraliaDotMap } from '../components/AustraliaDotMap';
import { PhotoCredit } from '../components/PhotoCredit';
import { responsive } from '../utils/responsiveImage';
import { openVacancies } from '../lib/vacancies';
import { usePageTitle } from '../utils/usePageTitle';

const churches = churchesRaw as ChurchRecord[];
const img = (p: string) => `${import.meta.env.BASE_URL}images/${p}.webp`;
const states = new Set(churches.map((c) => c.state)).size;

const PHOTOS = {
  convention: { src: img('ministries/youth-convention/hero'), alt: 'Hundreds of young adults at the CRCA Youth Convention, gathered on a grassy slope under the trees' },
  rtc: { src: img('ministries/candidacy/rtc-students'), alt: 'Three students talking over open Bibles on a lawn', credit: 'Reformed Theological College (used with permission)' },
  meal: { src: img('ministries/community-meal'), alt: 'Church members preparing a community meal in a kitchen' },
  gems: { src: img('ministries/gems/hero'), alt: 'Girls in bright shirts and red headbands walking arm in arm at a GEMS camp' },
  ship: { src: img('history/1956-emigrant-ship'), alt: 'A ship leaving for Australia in 1956', credit: 'Wim van Rossem / Anefo, Nationaal Archief (public domain)' },
};

function Photo({ p, className, sizes = '(min-width: 1024px) 640px, 100vw', box = '' }: { p: { src: string; alt: string; credit?: string }; className: string; sizes?: string; box?: string }) {
  return (
    <div className={`relative ${box}`}>
      <img src={p.src} {...responsive(p.src, sizes)} alt={p.alt} className={`w-full object-cover ${className}`} />
      {p.credit && <PhotoCredit credit={p.credit} />}
    </div>
  );
}

/** The roofline and cross from the CRCA logo, drawn large. */
function Roofline({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M10 260V130L105 35l95 95v130M120 50l65-40 145 115v135" />
      <path d="M200 260v-75a62 62 0 0 1 124 0v75M262 95v130M222 140h80" />
      <path d="M330 150l60 60v50" />
    </svg>
  );
}

function FindForm({ light = false }: { light?: boolean }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/find-a-church?q=${encodeURIComponent(q.trim())}` : '/find-a-church');
  };
  return (
    <form role="search" onSubmit={submit} className="max-w-xl">
      <label htmlFor="home-find" className="text-lg font-semibold">
        Find a church near you
      </label>
      <div className="mt-2 flex gap-2">
        <input id="home-find" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => void loadAuLocations()} placeholder="Suburb, town or postcode" className={`min-h-13 min-w-0 flex-1 rounded-md bg-white px-4 text-navy-900 placeholder:text-stone-600 ${light ? 'border border-stone-300' : ''}`} />
        <button type="submit" className={`inline-flex min-h-13 items-center gap-2 rounded-md px-5 font-semibold ${light ? 'bg-navy-900 text-white hover:bg-navy-800' : 'bg-teal-500 text-navy-950 hover:bg-teal-400'}`}>
          <Search className="h-5 w-5" aria-hidden="true" /> Search
        </button>
      </div>
    </form>
  );
}

const belief = beliefs.overview.split('. ').slice(0, 2).join('. ') + '.';

function LeadersAndJobs() {
  const jobs = openVacancies();
  return (
    <section aria-label="For church leaders" className="bg-stone-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-navy-900">
          <strong>Serving in a CRCA church?</strong> Forms, Church Order, reading sermons and Safe Church are under{' '}
          <Link to="/for-churches" className="font-semibold text-teal-700 underline underline-offset-4">For churches</Link>.
        </p>
        {jobs.length > 0 && (
          <Link to="/for-churches/positions-vacant" className="font-semibold text-teal-700 underline underline-offset-4">
            Positions vacant ({jobs.length})
          </Link>
        )}
      </div>
    </section>
  );
}

/** A: photographs lead. Warm, full-width pictures of people, short words, strong navy and gold bands. */
function DesignA() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <img src={PHOTOS.convention.src} {...responsive(PHOTOS.convention.src, '100vw')} alt={PHOTOS.convention.alt} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/25" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] sm:text-7xl">Reforming to reach the lost for Christ</h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed">
            We are the Christian Reformed Churches of Australia: {churches.length} congregations who believe the Bible is God’s Word.
          </p>
          <div className="mt-9">
            <FindForm />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <Photo p={PHOTOS.rtc} className="aspect-[4/3] rounded-md" />
          <div>
            <h2 className="font-serif text-4xl font-semibold text-navy-900">What we believe</h2>
            <p className="mt-5 text-xl leading-relaxed text-stone-700">{belief}</p>
            <Link to="/who-we-are/beliefs" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-teal-700 hover:text-navy-900">
              More about our beliefs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-teal-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <h2 className="font-serif text-4xl font-semibold">Churches in every state</h2>
            <p className="mt-4 max-w-lg text-xl leading-relaxed">Each church has its own character. Find one near you, see when it meets, and come along on a Sunday.</p>
            <Link to="/find-a-church" className="mt-7 inline-flex min-h-13 items-center gap-2 rounded-md bg-white px-6 font-semibold text-navy-900 hover:bg-teal-50">
              See the map <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-md bg-navy-900 p-6">
            <AustraliaDotMap churches={churches} className="mx-auto block w-full max-w-lg" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h2 className="font-serif text-4xl font-semibold text-navy-900">Life together</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[
              { p: PHOTOS.gems, t: 'Children and young people', d: 'Cadets, GEMS and the Youth Convention.', to: '/ministries' },
              { p: PHOTOS.meal, t: 'Serving our neighbours', d: 'Churches caring for people around them.', to: '/ministries' },
              { p: PHOTOS.ship, t: 'A story since 1951', d: 'From Dutch migrants to churches around Australia.', to: '/who-we-are/history' },
            ].map((c) => (
              <div key={c.t}>
                <Photo p={c.p} className="aspect-[4/3] rounded-md" sizes="(min-width: 1024px) 420px, 100vw" />
                <Link to={c.to} className="group mt-4 block">
                  <span className="font-serif text-2xl font-semibold text-navy-900 group-hover:text-teal-700">{c.t}</span>
                  <span className="mt-1 block text-lg text-stone-700">{c.d}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <h2 className="text-lg font-semibold text-gold-400">Our vision</h2>
          <p className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">{identity.missionAndVision.vision}</p>
        </div>
      </section>
      <LeadersAndJobs />
    </>
  );
}

const DOORS = [
  { Icon: BookOpen, t: 'What we believe', d: 'The Bible, the gospel and our confessions', to: '/who-we-are/beliefs', c: 'bg-teal-700 text-white hover:bg-[#02566b]' },
  { Icon: ChurchIcon, t: 'Find a church', d: 'Map, addresses and service times', to: '/find-a-church', c: 'bg-gold-400 text-navy-950 hover:bg-gold-500' },
  { Icon: History, t: 'Our story', d: 'Since 1951', to: '/who-we-are/history', c: 'bg-[#8f3526] text-white hover:bg-[#75291c]' },
  { Icon: HeartHandshake, t: 'Our ministries', d: 'Young people, training, mission', to: '/ministries', c: 'bg-[#315a3e] text-white hover:bg-[#264932]' },
];

/** B: colour and the logo's own roofline lead. Icons on four strong colour doors; photos support. */
function DesignB() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <Roofline className="pointer-events-none absolute -bottom-2 -right-40 hidden w-[42rem] text-teal-500/35 lg:block" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] sm:text-7xl">Reforming to reach the lost for Christ</h1>
          <p className="mt-6 max-w-xl text-xl leading-relaxed text-navy-100">
            We are a family of {churches.length} Reformed churches across Australia, together since 1951.
          </p>
          <div className="mt-9">
            <FindForm />
          </div>
        </div>
      </section>

      <nav aria-label="Start here" className="grid sm:grid-cols-2 lg:grid-cols-4">
        {DOORS.map(({ Icon, t, d, to, c }) => (
          <Link key={to} to={to} className={`group flex min-h-48 flex-col justify-between p-7 lg:p-9 ${c}`}>
            <Icon className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
            <span className="mt-8">
              <span className="flex items-center gap-2 font-serif text-2xl font-semibold">
                {t} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-lg">{d}</span>
            </span>
          </Link>
        ))}
      </nav>

      <section className="bg-gold-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <h2 className="font-serif text-4xl font-semibold text-navy-900">We believe</h2>
            <p className="mt-5 font-serif text-2xl leading-relaxed text-navy-900 sm:text-3xl sm:leading-relaxed">{belief}</p>
            <Link to="/who-we-are/beliefs" className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-teal-700 hover:text-navy-900">
              More about our beliefs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <Photo p={PHOTOS.rtc} className="aspect-[4/5] rounded-t-full" box="lg:col-span-5" sizes="(min-width: 1024px) 480px, 100vw" />
        </div>
      </section>

      <section className="bg-teal-700 text-white">
        <dl className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            [String(churches.length), 'congregations'],
            [String(states), 'states and territories'],
            ['1951', 'the year we began'],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="text-xl">{l}</dt>
              <dd className="font-serif text-6xl font-semibold">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <Photo p={PHOTOS.convention} className="h-full min-h-72 rounded-md" box="lg:col-span-7 lg:row-span-2" />
          <Photo p={PHOTOS.gems} className="aspect-[2/1] rounded-md" box="lg:col-span-5" />
          <Photo p={PHOTOS.meal} className="aspect-[2/1] rounded-md" box="lg:col-span-5" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 lg:col-span-12">
            <h2 className="flex items-center gap-3 font-serif text-3xl font-semibold text-navy-900">
              <Users className="h-8 w-8 text-teal-700" strokeWidth={1.5} aria-hidden="true" /> People of every age, following Jesus together
            </h2>
            <Link to="/ministries" className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-700 hover:text-navy-900">
              See our ministries <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <LeadersAndJobs />
    </>
  );
}

export function HomePreviewPage({ design }: { design: 'a' | 'b' }) {
  usePageTitle(`Home page design ${design.toUpperCase()}`);
  return design === 'a' ? <DesignA /> : <DesignB />;
}
