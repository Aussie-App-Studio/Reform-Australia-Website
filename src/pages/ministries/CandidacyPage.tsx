import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FileDown,
  GraduationCap,
  Mail,
  Phone,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import internalData from '../../data/internalMinistries.json';
import { DOC_IDS, encodeDocUrl } from '../../lib/crcaDocs/client';

export function CandidacyPage() {
  const { candidacy } = internalData;

  return (
    <>
      <PageHeader
        eyebrow={candidacy.eyebrow}
        title={candidacy.title}
        description={candidacy.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'Candidacy Committee' },
        ]}
        actions={
          <Link
            to="/contact?topic=candidacy"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
          >
            <span>Enquire About Candidacy</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Overview + Chair Contact & RTC Card */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <GraduationCap className="h-4 w-4" />
                <span>Ordained Ministry Pathway</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Becoming a Candidate for Ordained Ministry
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {candidacy.intro.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl bg-navy-900 p-6 text-white shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  National Committee Contact
                </span>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-white">
                  {candidacy.contact.name}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-100">
                  State Representatives are also appointed in every Classis (reachable through your
                  Classis Clerk) and work alongside the Geelong Executive.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5 text-sm">
                  <a
                    href={`tel:${candidacy.contact.phone.replace(/\s+/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    <Phone className="h-4 w-4 text-gold-400" />
                    <span>{candidacy.contact.phone}</span>
                  </a>
                  <a
                    href={`mailto:${candidacy.contact.email}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 font-semibold text-white hover:bg-white/20"
                  >
                    <Mail className="h-4 w-4 text-teal-400" />
                    <span>{candidacy.contact.email}</span>
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Primary Theological Partner
                </span>
                <h3 className="mt-1 font-serif text-lg font-bold text-navy-900">
                  Reformed Theological College (RTC)
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                  Approved Ministry Candidates studying through RTC are eligible for denominational
                  student subsidies and candidate support.
                </p>
                <a
                  href={candidacy.rtcPartnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                >
                  <span>Visit rtc.edu.au</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Polity &amp; Governance</span>
                </div>
                <h3 className="mt-1 font-serif text-lg font-bold text-navy-900">
                  Official Examination &amp; Polity Standards
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-700">
                  Review the official CRCA examination rules, Church Order articles, and confessional
                  subscription form.
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 border border-stone-200">
                    <Link
                      to={`/for-churches/forms-and-documents/${DOC_IDS.rulesFinalExamination2024}`}
                      className="font-semibold text-teal-700 hover:text-navy-900"
                    >
                      Rules for the Final Examination (2024) →
                    </Link>
                    <a
                      href={encodeDocUrl('CRCA Rules for the Final Examination 2024.pdf')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-navy-800 hover:text-teal-700"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                  <Link
                    to={`/for-churches/forms-and-documents/${DOC_IDS.churchOrder2022}#article-10-admission-ordination-and-installation`}
                    className="block rounded-lg bg-stone-50 px-3 py-2 border border-stone-200 font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
                  >
                    CRCA Church Order (2022) — Art. 10 →
                  </Link>
                  <Link
                    to={`/for-churches/forms-and-documents/${DOC_IDS.formOfSubscription}`}
                    className="block rounded-lg bg-stone-50 px-3 py-2 border border-stone-200 font-semibold text-navy-900 hover:border-teal-500 hover:text-teal-700"
                  >
                    CRCA Form of Subscription →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Ordination Tracks */}
          <div>
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                Training Options
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Four Recognised Ordination Tracks
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {candidacy.tracks.map((track) => (
                <article
                  key={track.number}
                  className={`rounded-2xl border p-6 shadow-xs ${
                    track.number === 1
                      ? 'border-teal-500/50 bg-teal-50/50'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      Track {track.number}
                    </span>
                    <span className="rounded-full bg-white px-3 py-0.5 text-[11px] font-semibold text-navy-900 border border-stone-200">
                      {track.badge}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-bold text-navy-900">
                    {track.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
                    {track.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* 11-Step Pathway */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-9">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
                Step-by-Step Approval
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                The 11-Step Candidacy Journey
              </h2>
              <p className="mt-1.5 text-sm text-stone-700">
                Begin the conversation with your local pastor and the Candidacy Committee before
                enrolling in formal theological study.
              </p>
            </div>

            <ol className="mt-8 space-y-4">
              {candidacy.steps.map((item) => (
                <li
                  key={item.step}
                  className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-5 sm:flex-row sm:items-start sm:gap-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900 font-serif text-sm font-bold text-gold-400">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-700">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
              <p className="text-sm text-stone-700">
                Interested in exploring pastoral ministry in the CRCA?
              </p>
              <Link
                to="/contact?topic=candidacy"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <span>Message the Candidacy Committee</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RelatedMinistriesBar
        currentSlug="candidacy"
        slugs={['reformed-theological-college', 'shift-coaching', 'church-planting-taskforce']}
      />
    </>
  );
}
