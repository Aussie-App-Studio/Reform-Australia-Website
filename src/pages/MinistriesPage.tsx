import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Mail, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { MinistryIcon } from '../components/MinistryIcon';
import ministriesData from '../data/ministries.json';
import { siteConfig } from '../data/siteConfig';
import { handleTabListKeyDown } from '../utils/tablistKeyboard';

type MegaGroup = 'all' | 'next-gen' | 'training-planting' | 'global-mission';

interface MinistryItem {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  megaMenuGroup: 'next-gen' | 'training-planting' | 'global-mission';
  homepageTab: string;
  iconName: string;
  url: string;
  isExternal: boolean;
  ctaLabel: string;
  contact?: string;
  highlights?: string[];
  secondaryLinks?: { label: string; url: string }[];
}

const groupTabs: { id: MegaGroup; label: string }[] = [
  { id: 'all', label: 'All Ministries' },
  { id: 'next-gen', label: 'Next Gen' },
  { id: 'training-planting', label: 'Training & Planting' },
  { id: 'global-mission', label: 'Global Mission' },
];

const groupLabels: Record<MinistryItem['megaMenuGroup'], string> = {
  'next-gen': 'Next Gen',
  'training-planting': 'Training & Planting',
  'global-mission': 'Global Mission',
};

export function MinistriesPage() {
  const [selectedGroup, setSelectedGroup] = useState<MegaGroup>('all');
  const ministries = ministriesData as MinistryItem[];

  const filtered =
    selectedGroup === 'all'
      ? ministries
      : ministries.filter((m) => m.megaMenuGroup === selectedGroup);

  return (
    <>
      <PageHeader
        eyebrow="Ministries & Partnerships"
        title="Equipping churches across Australia & the world"
        description="CRCA ministries and partner agencies support local congregations across Australia and overseas—serving rising generations, equipping leaders, planting churches, and advancing global mission."
        breadcrumbs={[{ label: 'Ministries' }]}
      />

      {/* Editorial Fellowship Banner */}
      <section className="bg-stone-50 pt-12 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-stone-200 bg-white lg:grid-cols-12">
            <div className="lg:col-span-5 min-h-[220px]">
              <img
                src={siteConfig.images.ministryFellowship}
                alt="CRCA church small group discussing Scripture together around a wooden table"
                width={1264}
                height={848}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="lg:col-span-7 flex flex-col justify-center p-7 sm:p-9">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-600">
                <Sparkles className="h-4 w-4" />
                <span>Local Church Empowering</span>
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900">
                National support designed to strengthen local congregations
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-700 sm:text-base">
                Every CRCA workgroup and partner agency—from Cadets and GEMS to Shift Coaching,
                Reformed Theological College, and World Transform—exists to come alongside local
                elders, pastors, and members in gospel ministry.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/contact?topic=outreach"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-800"
                >
                  <span>Connect with a Ministry Coordinator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/for-churches"
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-stone-100"
                >
                  <span>Elder & Pastor Resources</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Pills + Full Grid */}
      <section className="bg-stone-50 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div role="tablist" aria-label="Filter ministries by audience" className="flex flex-wrap gap-2">
              {groupTabs.map((tab) => {
                const active = selectedGroup === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`ministries-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="ministries-tabpanel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setSelectedGroup(tab.id)}
                    onKeyDown={(e) =>
                      handleTabListKeyDown(
                        e,
                        groupTabs.map((t) => t.id),
                        selectedGroup,
                        setSelectedGroup,
                        'ministries'
                      )
                    }
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-navy-900 text-white'
                        : 'bg-white border border-stone-200 text-navy-800 hover:bg-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span role="status" aria-live="polite" className="text-xs font-semibold text-stone-600">
              Showing {filtered.length} ministries & partnerships
            </span>
          </div>

          <div
            id="ministries-tabpanel"
            role="tabpanel"
            aria-labelledby={`ministries-tab-${selectedGroup}`}
            className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((ministry) => (
              <article
                key={ministry.id}
                id={ministry.id}
                className="scroll-mt-32 flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-6 transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                      <MinistryIcon name={ministry.iconName} className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-navy-800">
                      {groupLabels[ministry.megaMenuGroup]}
                    </span>
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-bold text-navy-900">
                    {ministry.isExternal ? (
                      ministry.name
                    ) : (
                      <Link to={ministry.url} className="transition-colors hover:text-teal-700">
                        {ministry.name}
                      </Link>
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {ministry.fullDescription}
                  </p>

                  {ministry.highlights && ministry.highlights.length > 0 && (
                    <ul className="mt-4 space-y-1.5 rounded-md bg-stone-50 p-3.5 border border-stone-200 text-xs text-navy-900">
                      {ministry.highlights.map((note) => (
                        <li key={note} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {ministry.contact && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-stone-700">
                      <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
                      <span>{ministry.contact}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-2 border-t border-stone-100 pt-4">
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

                  {ministry.secondaryLinks &&
                    ministry.secondaryLinks.map((sec) => {
                      const isLocalPdf =
                        sec.url.includes('/ministry-resources/') || sec.url.endsWith('.pdf');
                      const isInternalRoute = sec.url.startsWith('/') && !isLocalPdf;

                      return (
                        <div key={sec.url}>
                          {isInternalRoute ? (
                            <Link
                              to={sec.url}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800 hover:text-teal-700"
                            >
                              <span>{sec.label}</span>
                              <ArrowRight className="h-3 w-3 opacity-60" />
                            </Link>
                          ) : isLocalPdf ? (
                            <a
                              href={sec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800 hover:text-teal-700"
                            >
                              <Download className="h-3 w-3 text-teal-600" />
                              <span>{sec.label}</span>
                            </a>
                          ) : (
                            <a
                              href={sec.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-800 hover:text-teal-700"
                            >
                              <span>{sec.label}</span>
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
