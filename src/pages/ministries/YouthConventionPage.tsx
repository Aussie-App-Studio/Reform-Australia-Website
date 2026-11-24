import {
  AlertCircle,
  Bus,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Mail,
  MapPin,
  Ticket,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import { YouTubeEmbedCard } from '../../components/YouTubeEmbedCard';
import convention from '../../data/convention.json';

export function YouthConventionPage() {
  const { statusBanner, pricing, speaker, theme, promoVideo, previousRecordings, resources, contact } =
    convention;

  return (
    <>
      <PageHeader
        eyebrow={`Next Gen • Biennial National Gathering`}
        title={convention.title}
        description={convention.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: 'CRCA Youth Convention' },
        ]}
        actions={
          <a
            href={statusBanner.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-500"
          >
            <span>{statusBanner.ctaLabel}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        }
      />

      {/* Status Alert Banner (Waitlist / Registration State) */}
      <section className="border-b border-gold-400/50 bg-gold-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-stone-600" />
            <div>
              <span className="inline-flex rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-navy-900">
                {statusBanner.badge}
              </span>
              <p className="mt-1 text-sm font-bold text-navy-900">{statusBanner.headline}</p>
              <p className="text-xs text-stone-700">{statusBanner.message}</p>
            </div>
          </div>

          <a
            href={statusBanner.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800 sm:self-auto"
          >
            <span>{statusBanner.ctaLabel}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 4-Card Event Snapshot Strip */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Calendar className="h-4 w-4" />
                <span>Dates</span>
              </div>
              <div className="mt-2 font-serif text-xl font-bold text-navy-900">
                {convention.dates}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                {convention.datesDetail}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
              <div className="mt-2 font-serif text-xl font-bold text-navy-900">
                {convention.location}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-700">{convention.venue}</p>
              <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-stone-50 p-2.5 text-[11px] text-stone-700 border border-stone-200">
                <Bus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-600" />
                <span>{convention.transportNote}</span>
              </div>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Users className="h-4 w-4" />
                <span>Ages</span>
              </div>
              <div className="mt-2 font-serif text-xl font-bold text-navy-900">
                Ages {convention.ages}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                {convention.agePolicyNote}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <Ticket className="h-4 w-4" />
                <span>Cost & Inclusions</span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-serif text-xl font-bold text-navy-900">
                  {pricing.earlyBird}
                </span>
                <span className="text-xs text-stone-600">{pricing.earlyBirdNote}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-serif text-base font-bold text-navy-800">
                  {pricing.fullPrice}
                </span>
                <span className="text-xs text-stone-600">{pricing.fullPriceNote}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-700">{pricing.includes}</p>
            </div>
          </div>

          {/* 2027 Theme + Keynote Speaker */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-lg bg-navy-900 p-7 text-white sm:p-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-100">
                <Flame className="h-4 w-4" />
                <span>Convention {convention.year} Theme • {theme.scripture}</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                {theme.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-navy-100 sm:text-base">
                {theme.paragraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-7 sm:p-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Keynote Speaker
                </span>
                <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900">{speaker.name}</h2>
                <a
                  href={speaker.roleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                >
                  <span>{speaker.role}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">{speaker.bio}</p>
              </div>
            </div>
          </div>

          {/* What is Convention + Promo Video */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 rounded-lg border border-stone-200 bg-white p-7 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                About the Week
              </span>
              <h2 className="mt-1.5 font-serif text-2xl font-bold text-navy-900">
                What is CRCA Convention?
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {convention.about.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <YouTubeEmbedCard
                youtubeId={promoVideo.youtubeId}
                title={promoVideo.title}
                subtitle="Official CRCA Youth Convention 2027 announcement video"
              />
            </div>
          </div>

          {/* Resources & Contact */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                    Downloads & Forms
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">
                    Convention Resources
                  </h2>
                </div>
                <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700">
                  {convention.leadersGuideStatus}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {resources.map((doc) => (
                  <article
                    key={doc.url}
                    className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <FileText className="h-5 w-5 text-teal-700" />
                        <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-navy-800 border border-stone-200">
                          {doc.format}
                        </span>
                      </div>
                      <h3 className="mt-3 font-serif text-base font-bold text-navy-900">
                        {doc.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                        {doc.description}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-stone-100 pt-3">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Committee & Updates
                </span>
                <h2 className="mt-1 font-serif text-xl font-bold text-navy-900">
                  Connect with Convention
                </h2>
                <p className="mt-2 text-sm text-stone-700">
                  Questions about registrations, age policy, airport transport, or youth-group
                  promo? Reach the planning committee directly.
                </p>

                <div className="mt-4 space-y-2.5 text-sm">
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-teal-700"
                  >
                    <Mail className="h-4 w-4 text-teal-600" />
                    <span>{contact.email}</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-stone-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-stone-100"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-stone-100"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
                <a
                  href={contact.standaloneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-teal-700"
                >
                  <span>Standalone event site (crcaconvention.au)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Previous Convention Recordings */}
          <div>
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-stone-600">
                Watch Past Sessions
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                Previous Convention Recordings
              </h2>
              <p className="mt-1.5 text-sm text-stone-700">
                Get a feel for the teaching and fellowship at CRCA Youth Convention by watching
                recordings from a previous gathering.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {previousRecordings.map((rec) => (
                <YouTubeEmbedCard
                  key={rec.youtubeId}
                  youtubeId={rec.youtubeId}
                  title={rec.title}
                  subtitle={rec.subtitle}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <RelatedMinistriesBar
        currentSlug="youth-convention"
        slugs={['cadets', 'gems', 'reformed-theological-college']}
      />
    </>
  );
}
