import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Handshake,
  Mail,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { RelatedMinistriesBar } from '../../components/RelatedMinistriesBar';
import { NotFoundPage } from '../NotFoundPage';
import internalData from '../../data/internalMinistries.json';

type DetailSlug = keyof typeof internalData.detailPages;

interface PartnerLink {
  label: string;
  description: string;
  url: string;
}

interface PdfResource {
  label: string;
  description: string;
  url: string;
}

interface InternalLinkItem {
  label: string;
  to: string;
}

interface DetailPageData {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  overviewHeading: string;
  paragraphs: string[];
  calloutTitle: string;
  calloutBody: string;
  highlightsHeading: string;
  highlights: string[];
  partnerLinks: PartnerLink[];
  pdfs: PdfResource[];
  internalLinks?: InternalLinkItem[];
  sisterChurches?: {
    inFellowship: string[];
    inContact: string[];
  };
  contact: {
    name: string;
    email: string;
    secondaryEmail?: string;
    topicParam: string;
    ctaLabel: string;
  };
  relatedSlugs: string[];
}

interface MinistryDetailPageProps {
  slug: DetailSlug;
}

export function MinistryDetailPage({ slug }: MinistryDetailPageProps) {
  const page = (internalData.detailPages as Record<string, DetailPageData>)[slug];
  if (!page) {
    return <NotFoundPage />;
  }

  const primaryPdf = page.pdfs[0];

  return (
    <>
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.subtitle}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: page.title },
        ]}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/contact?topic=${page.contact.topicParam}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <span>{page.contact.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {primaryPdf && (
              <a
                href={primaryPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </a>
            )}
          </div>
        }
      />

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Editorial Overview + Highlight Callout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
                {page.overviewHeading}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                {page.paragraphs.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-navy-900 p-6 text-white shadow-sm sm:p-7">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Ministry Focus
                </span>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-white">
                  {page.calloutTitle}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-navy-100">
                  {page.calloutBody}
                </p>

                {page.internalLinks && page.internalLinks.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-white/15 pt-4">
                    {page.internalLinks.map((lnk) => (
                      <Link
                        key={lnk.to}
                        to={lnk.to}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-100 hover:text-white"
                      >
                        <span>{lnk.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Direct Contact
                </span>
                <h3 className="mt-1 font-serif text-lg font-bold text-navy-900">
                  {page.contact.name}
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  <a
                    href={`mailto:${page.contact.email}`}
                    className="inline-flex items-center gap-2 font-semibold text-navy-900 hover:text-teal-700"
                  >
                    <Mail className="h-4 w-4 text-teal-600" />
                    <span>{page.contact.email}</span>
                  </a>
                  {page.contact.secondaryEmail && (
                    <div>
                      <a
                        href={`mailto:${page.contact.secondaryEmail}`}
                        className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 hover:text-teal-700"
                      >
                        <Mail className="h-3.5 w-3.5 text-stone-600" />
                        <span>{page.contact.secondaryEmail}</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <Link
                    to={`/contact?topic=${page.contact.topicParam}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    <span>{page.contact.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights / Mandate List */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-xs sm:p-8">
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              {page.highlightsHeading}
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {page.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50/70 p-4 text-sm text-navy-900"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecumenical Sister Churches & Contacts (when present) */}
          {page.sisterChurches && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <Handshake className="h-4 w-4" />
                  <span>Formal Fellowship</span>
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900">
                  Churches in Ecclesiastical Fellowship
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-navy-900">
                  {page.sisterChurches.inFellowship.map((church) => (
                    <li
                      key={church}
                      className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                      <span className="font-medium">{church}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600">
                  <Globe2 className="h-4 w-4" />
                  <span>Broader Reformed Contacts</span>
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-bold text-navy-900">
                  Other Reformed Churches in Contact
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-navy-900">
                  {page.sisterChurches.inContact.map((church) => (
                    <li
                      key={church}
                      className="flex items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span className="font-medium">{church}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Local PDF Downloads & External Partner Tools */}
          {(page.pdfs.length > 0 || page.partnerLinks.length > 0) && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {page.pdfs.map((doc) => (
                <article
                  key={doc.url}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <FileText className="h-5 w-5 text-teal-700" />
                      <span className="rounded border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-navy-800">
                        PDF
                      </span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">
                      {doc.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-stone-700">{doc.description}</p>
                  </div>
                  <div className="mt-4 border-t border-stone-100 pt-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Application / Form (PDF)</span>
                    </a>
                  </div>
                </article>
              ))}

              {page.partnerLinks.map((partner) => (
                <article
                  key={partner.url}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs"
                >
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                      External Partner Resource
                    </span>
                    <h3 className="mt-2 font-serif text-lg font-bold text-navy-900">
                      {partner.label}
                    </h3>
                    <p className="mt-1.5 text-sm text-stone-700">{partner.description}</p>
                  </div>
                  <div className="mt-4 border-t border-stone-100 pt-3">
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
                    >
                      <span>{partner.label}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <RelatedMinistriesBar currentSlug={page.slug} slugs={page.relatedSlugs} />
    </>
  );
}
