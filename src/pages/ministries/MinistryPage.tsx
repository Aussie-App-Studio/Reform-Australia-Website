import { Link } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink, Mail, Phone, PlayCircle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { YouTubeEmbedCard } from '../../components/YouTubeEmbedCard';
import { ministryMegaMenuColumns } from '../../data/navigation';
import { GROUP_LABELS, getMinistryPage, type MinistryPageData } from '../../lib/ministryPages';
import { usePageTitle } from '../../utils/usePageTitle';
import { NotFoundPage } from '../NotFoundPage';

const isInternal = (url: string) => url.startsWith('/') && !/\.(pdf|docx?)$/i.test(url) && !url.startsWith('/ministry-resources/');

function SmartLink({ url, className, children }: { url: string; className: string; children: React.ReactNode }) {
  if (isInternal(url)) {
    return (
      <Link to={url} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function Actions({ page }: { page: MinistryPageData }) {
  if (!page.actions?.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {page.actions.map((a) => (
        <SmartLink
          key={a.url}
          url={a.url}
          className={
            a.kind === 'primary'
              ? 'inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 font-semibold text-white hover:bg-navy-800'
              : 'inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 font-semibold text-navy-900 hover:border-navy-900'
          }
        >
          {a.label}
          {isInternal(a.url) ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
        </SmartLink>
      ))}
    </div>
  );
}

function Sidebar({ page }: { page: MinistryPageData }) {
  const related = ministryMegaMenuColumns
    .find((c) => c.id === page.group)
    ?.items.filter((i) => !i.to.endsWith(`/${page.slug}`));
  return (
    <div className="space-y-10">
      {page.facts && page.facts.length > 0 && (
        <section aria-labelledby="facts">
          <h2 id="facts" className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">
            At a glance
          </h2>
          <dl className="mt-2 divide-y divide-stone-200 border-y border-stone-200">
            {page.facts.map((f) => (
              <div key={f.label} className="py-3">
                <dt className="text-sm text-stone-500">{f.label}</dt>
                <dd className="mt-0.5 text-navy-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {page.contact && (
        <section aria-labelledby="contact">
          <h2 id="contact" className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">
            Contact
          </h2>
          <div className="mt-3 space-y-2 border-t border-stone-200 pt-3">
            {page.contact.name && <p className="font-semibold text-navy-900">{page.contact.name}</p>}
            {page.contact.role && <p className="text-sm text-stone-600">{page.contact.role}</p>}
            {page.contact.email && (
              <a href={`mailto:${page.contact.email}`} className="flex items-center gap-2 text-teal-700 underline-offset-4 hover:underline">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> <span className="break-all">{page.contact.email}</span>
              </a>
            )}
            {page.contact.phone && (
              <a href={`tel:${page.contact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-teal-700 underline-offset-4 hover:underline">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {page.contact.phone}
              </a>
            )}
            {page.contact.topic && (
              <Link to={`/contact?topic=${page.contact.topic}`} className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-navy-900 hover:text-teal-700">
                Send a message <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="text-sm font-semibold uppercase tracking-[0.08em] text-stone-500">
            Related ministries
          </h2>
          <ul className="mt-2 divide-y divide-stone-200 border-y border-stone-200">
            {related.map((r) => (
              <li key={r.to}>
                <SmartLink url={r.to} className="flex items-center justify-between gap-2 py-2.5 text-navy-900 hover:text-teal-700">
                  {r.label}
                  {r.isExternal ? <ExternalLink className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 text-stone-400" aria-hidden="true" />}
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function MinistryPage({ slug }: { slug: string }) {
  const page = getMinistryPage(slug);
  usePageTitle(page?.name ?? 'Ministry');
  if (!page) return <NotFoundPage />;

  const resources = page.resources ?? [];

  return (
    <>
      <PageHeader
        eyebrow={GROUP_LABELS[page.group]}
        title={page.name}
        description={page.summary}
        breadcrumbs={[{ label: 'Ministries', to: '/ministries' }, { label: page.name }]}
        actions={<Actions page={page} />}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20 lg:px-8 lg:py-16">
        <article className="min-w-0 max-w-[70ch]">
          {page.body.map((sec, i) => (
            <section key={i} className={i ? 'mt-10' : ''}>
              {sec.heading && <h2 className="font-serif text-2xl font-semibold text-navy-900">{sec.heading}</h2>}
              {sec.paragraphs?.map((p, j) => (
                <p key={j} className="mt-3 text-[1.06rem] leading-relaxed text-stone-700">
                  {p}
                </p>
              ))}
              {sec.list && (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[1.06rem] leading-relaxed text-stone-700 marker:text-teal-600">
                  {sec.list.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {page.steps && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">{page.steps.heading}</h2>
              <ol className="mt-5 border-t border-stone-200">
                {page.steps.items.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-stone-200 py-4">
                    <span className="font-serif text-xl font-semibold tabular-nums text-teal-700">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-navy-900">{s.title}</p>
                      <p className="mt-1 leading-relaxed text-stone-700">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {page.video && (
            <section className="mt-12">
              <YouTubeEmbedCard youtubeId={page.video.youtubeId} title={page.video.title} />
            </section>
          )}

          {resources.length > 0 && (
            <section className="mt-12">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">Resources</h2>
              <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                {resources.map((r) => (
                  <li key={r.url}>
                    <SmartLink url={r.url} className="group flex items-start gap-3 py-3">
                      {r.type === 'pdf' ? (
                        <Download className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      ) : r.type === 'video' ? (
                        <PlayCircle className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      ) : (
                        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      )}
                      <span>
                        <span className="text-navy-900 group-hover:text-teal-700 group-hover:underline underline-offset-4">{r.label}</span>
                        {r.note && <span className="block text-sm text-stone-600">{r.note}</span>}
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-[calc(var(--site-header-height,72px)+2rem)] lg:self-start">
          <Sidebar page={page} />
        </aside>
      </div>
    </>
  );
}
