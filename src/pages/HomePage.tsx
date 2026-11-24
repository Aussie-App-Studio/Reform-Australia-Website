import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  History,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import churchesRaw from '../data/churches.json';
import identity from '../data/identity.json';
import ministriesData from '../data/ministries.json';
import type { ChurchRecord } from '../components/AustraliaChurchMap';
import { loadAuLocations } from '../data/locationHubs';
import { MinistryIcon } from '../components/MinistryIcon';
import { handleTabListKeyDown } from '../utils/tablistKeyboard';

type MinistryTab = 'next-gen-families' | 'global' | 'training-support';

const STATE_QUICK_LINKS: { code: ChurchRecord['state']; name: string }[] = [
  { code: 'NSW', name: 'New South Wales' },
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' },
];

const allChurches = churchesRaw as ChurchRecord[];

const churchCountByState = STATE_QUICK_LINKS.map((item) => ({
  ...item,
  count: allChurches.filter((c) => c.state === item.code).length,
}));

const ministryTabs: { id: MinistryTab; label: string; caption: string }[] = [
  {
    id: 'next-gen-families',
    label: 'Next Gen & Families',
    caption:
      'Welcoming clubs for boys and girls, national youth gatherings, and a strong commitment to safe churches',
  },
  {
    id: 'global',
    label: 'Global Mission',
    caption:
      'Cross-cultural gospel partnerships, community development, and sister-church fellowship worldwide',
  },
  {
    id: 'training-support',
    label: 'Training & Church Support',
    caption:
      'Theological education, church planting, pastoral coaching, and outreach training equipping local congregations',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [churchQuery, setChurchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MinistryTab>('next-gen-families');

  function handleChurchSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = churchQuery.trim();
    navigate(trimmed ? `/find-a-church?q=${encodeURIComponent(trimmed)}` : '/find-a-church');
  }

  const visibleMinistries = ministriesData.filter((m) => m.homepageTab === activeTab);

  return (
    <>
      {/* 1. Uncluttered Welcome Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <img
          src={siteConfig.images.heroCommunity}
          alt="Multi-generational CRCA congregation chatting warmly outside a sunlit church foyer"
          width={1376}
          height={768}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/85 to-navy-900/45"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {siteConfig.tagline}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-navy-100 sm:text-lg">
              Welcome! We are a family of more than 50 Reformed, Bible-teaching churches across
              Australia—gathering to worship Jesus, grow together in Scripture, and share the good
              news of his grace with our neighbours.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5">
              <Link
                to="/who-we-are/beliefs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 sm:px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500"
              >
                <BookOpen className="h-4 w-4" />
                <span>What We Believe</span>
                <ArrowRight className="hidden h-4 w-4 sm:block" />
              </Link>
              <Link
                to="/find-a-church"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 sm:px-5 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                <MapPin className="h-4 w-4 text-teal-400" />
                <span>Find a Church</span>
              </Link>
              <Link
                to="/who-we-are/vision-values"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 px-2 py-2 sm:justify-start text-sm font-semibold text-teal-100 transition-colors hover:text-white"
              >
                <span>Our Vision &amp; Values</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick-Stat Heritage Strip */}
      <section aria-label="CRCA at a glance" className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {siteConfig.quickStats.map((stat) => (
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

      {/* 2. "Who We Are" Snapshot Bento Grid */}
      <section className="bg-stone-50 py-16 sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                <span>Who We Are</span>
              </div>
              <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
                Confessional roots, gospel urgency
              </h2>
              <p className="mt-2 text-base text-stone-700">
                A family of Reformed churches advancing Christ’s kingdom across Australia and the
                world.
              </p>
            </div>
            <Link
              to="/who-we-are/vision-values"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
            >
              <span>Explore Vision & Values</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 4-Card Bento Grid */}
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Bento Card 1: Mission & Vision */}
            <div className="md:col-span-7 flex flex-col justify-between rounded-2xl bg-navy-900 p-7 text-white shadow-sm">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Mission & Vision</span>
                </span>
                <h3 className="mt-4 font-serif text-2xl font-bold text-white sm:text-3xl">
                  “{identity.missionAndVision.mission}”
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-100 sm:text-base">
                  <strong className="text-teal-100">Our Vision:</strong>{' '}
                  {identity.missionAndVision.vision}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-white/15">
                <Link
                  to="/who-we-are/vision-values"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
                >
                  <span>Our Vision &amp; Values</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: What We Believe */}
            <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-7 shadow-xs">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <BookOpen className="h-4 w-4" />
                  <span>What We Believe</span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-bold text-navy-900">
                  Anchored in Scripture & the Reformed Confessions
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-stone-700">
                  Summarised in the Apostles’, Nicene, and Athanasian Creeds alongside the Belgic
                  Confession, Heidelberg Catechism, and Canons of Dort.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100">
                <Link
                  to="/who-we-are/beliefs"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                >
                  <span>Read our beliefs & confessions</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Bento Card 3: Core Values */}
            <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-7 shadow-xs">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gold-600">
                  Six Core Values
                </div>
                <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                  Culture shaped by the Bible
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {identity.coreValues.items.map((val) => (
                    <span
                      key={val.id}
                      className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-navy-900"
                    >
                      {val.title}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-stone-100">
                <Link
                  to="/who-we-are/vision-values#core-values"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                >
                  <span>Explore Scripture foundations</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Bento Card 4: Our History */}
            <div className="md:col-span-7 relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
              <div className="grid h-full grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-7 flex flex-col justify-between p-7">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                      <History className="h-4 w-4" />
                      <span>Our History • Since 1951</span>
                    </div>
                    <h3 className="mt-2 font-serif text-xl font-bold text-navy-900">
                      Over seven decades of planting churches across Australia
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-stone-700">
                      {identity.history.lead}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-stone-100">
                    <Link
                      to="/who-we-are/history"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <span>Read our story since 1951</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="sm:col-span-5 min-h-[180px] bg-stone-100">
                  <img
                    src={siteConfig.images.heritageSanctuary}
                    alt="Sunlit Australian Christian Reformed church sanctuary with timber beams and open Bible"
                    width={1200}
                    height={896}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Ministries Showcase */}
      <section className="bg-white py-16 sm:py-22 border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                Ministries & Partnerships
              </div>
              <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
                Serving rising generations, local churches &amp; global mission
              </h2>
              <p className="mt-2 text-base text-stone-700">
                Explore how CRCA ministries welcome young people and families, care for vulnerable
                members, and support churches across Australia and overseas.
              </p>
            </div>

            <Link
              to="/ministries"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-stone-100 self-start lg:self-auto"
            >
              <span>Explore all ministries</span>
              <ArrowRight className="h-4 w-4 text-teal-600" />
            </Link>
          </div>

          {/* Tab Controls */}
          <div
            role="tablist"
            aria-label="Ministry Categories"
            className="mt-8 flex flex-wrap gap-2 border-b border-stone-200 pb-4"
          >
            {ministryTabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`home-ministry-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="home-ministry-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) =>
                    handleTabListKeyDown(
                      e,
                      ministryTabs.map((t) => t.id),
                      activeTab,
                      setActiveTab,
                      'home-ministry'
                    )
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    selected
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-stone-100 text-navy-800 hover:bg-stone-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            id="home-ministry-panel"
            role="tabpanel"
            aria-labelledby={`home-ministry-tab-${activeTab}`}
          >
            <p className="mt-4 text-sm text-stone-600">
              {ministryTabs.find((t) => t.id === activeTab)?.caption}
            </p>

            {/* Tabbed Ministry Card Grid */}
            <div
              className={`mt-6 grid grid-cols-1 gap-5 ${
                visibleMinistries.length === 4
                  ? 'md:grid-cols-2 lg:grid-cols-4'
                  : 'md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
            {visibleMinistries.map((ministry) => (
              <article
                key={ministry.id}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-6 transition-all hover:border-teal-500/40 hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                    <MinistryIcon name={ministry.iconName} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-bold text-navy-900">
                    {ministry.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {ministry.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200/80">
                  {ministry.isExternal ? (
                    <a
                      href={ministry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <span>{ministry.ctaLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <Link
                      to={ministry.url}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <span>{ministry.ctaLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Closing Call to Action: Plan a Visit & Find a Church Near You */}
      <section
        id="find-a-church"
        className="bg-stone-50 py-16 sm:py-20 border-t border-stone-200 scroll-mt-[calc(var(--site-header-height,72px)+1rem)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Navy Search Callout */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-7 text-white shadow-xl sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl"
            />
            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
                <span className="inline-block h-px w-6 bg-gold-400" />
                <span>Plan a Visit</span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">
                We&apos;d love to welcome you this Sunday
              </h2>
              <p className="mt-3 text-base leading-relaxed text-navy-100">
                Search by city, suburb, postcode, or state to find a local CRCA congregation—complete
                with service times, directions, and livestream links.
              </p>

              <form
                onSubmit={handleChurchSearch}
                className="mt-7 rounded-2xl border border-white/15 bg-white/95 p-2 shadow-xl backdrop-blur-md"
                role="search"
                aria-label="Find a CRCA church near you"
              >
                <label htmlFor="home-church-search" className="sr-only">
                  Find a CRCA church near you — Enter city, suburb, postcode, or state
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-600" />
                    <input
                      id="home-church-search"
                      type="text"
                      value={churchQuery}
                      onFocus={() => {
                        void loadAuLocations();
                      }}
                      onChange={(e) => setChurchQuery(e.target.value)}
                      placeholder="Enter city, suburb, postcode, or state (e.g. Melbourne, 6155, TAS)"
                      className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm font-medium text-navy-900 placeholder:text-stone-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                  >
                    <Search className="h-4 w-4" />
                    <span>Find a Church</span>
                  </button>
                </div>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <Link
                  to="/find-a-church"
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-100 transition-colors hover:text-white"
                >
                  <span>Open Map &amp; Directory</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 font-medium text-navy-100 transition-colors hover:text-white"
                >
                  <span>Have a question before visiting? Contact Us</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* State Quick-Links Grid */}
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900">
              Or browse churches by state &amp; territory
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {churchCountByState.map((st) => (
                <Link
                  key={st.code}
                  to={`/find-a-church?state=${st.code}`}
                  className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 transition-all hover:border-teal-500 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold tracking-wider text-white group-hover:bg-teal-700 transition-colors">
                      {st.code}
                    </span>
                    <ArrowRight className="h-4 w-4 text-stone-600 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700" />
                  </div>
                  <div className="mt-4">
                    <div className="font-serif text-base font-bold text-navy-900 group-hover:text-teal-700">
                      {st.name}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-stone-600">
                      {st.count} {st.count === 1 ? 'church' : 'churches'}
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                to="/find-a-church"
                className="group flex flex-col justify-between rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-900 to-navy-800 p-4 sm:p-5 text-white shadow-xs transition-all hover:from-teal-700 hover:to-navy-900 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-lg bg-white/15 px-2.5 py-1 text-xs font-bold tracking-wider text-gold-400">
                    ALL STATES
                  </span>
                  <MapPin className="h-4 w-4 text-teal-400" />
                </div>
                <div className="mt-4">
                  <div className="font-serif text-base font-bold text-white">
                    All {allChurches.length} Churches
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-100">
                    <span>Open Church Map</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
