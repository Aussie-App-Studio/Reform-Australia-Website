import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, Download, ExternalLink, Mail, Phone, PlayCircle } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { YouTubeEmbedCard } from '../../components/YouTubeEmbedCard';
import { ministryMegaMenuColumns } from '../../data/navigation';
import { getMinistryPage, type MinistryImage, type MinistryPageData } from '../../lib/ministryPages';
import { usePageTitle } from '../../utils/usePageTitle';
import { NotFoundPage } from '../NotFoundPage';
import { responsive } from '../../utils/responsiveImage';

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
          {isInternal(a.url) ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : /.(pdf|docx?)$/i.test(a.url) ? <Download className="h-4 w-4" aria-hidden="true" /> : <ExternalLink className="h-4 w-4" aria-hidden="true" />}
        </SmartLink>
      ))}
    </div>
  );
}

type RelatedLink = { label: string; to: string; isExternal?: boolean };

function Sidebar({ page, related, relatedTitle }: { page: MinistryPageData; related?: RelatedLink[]; relatedTitle: string }) {
  return (
    <div className="space-y-10">
      <div className="hidden lg:block">
        <OnThisPage page={page} />
      </div>
      {page.facts && page.facts.length > 0 && (
        <section aria-labelledby="facts">
          <h2 id="facts" className="font-sans text-base font-semibold text-navy-900">
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
          <h2 id="contact" className="font-sans text-base font-semibold text-navy-900">
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
          <h2 id="related" className="font-sans text-base font-semibold text-navy-900">
            {relatedTitle}
          </h2>
          <ul className="mt-2 divide-y divide-stone-200 border-y border-stone-200">
            {related.map((r) => (
              <li key={r.to}>
                <SmartLink url={r.to} className="flex min-h-11 items-center justify-between gap-2 py-2.5 text-navy-900 hover:text-teal-700">
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

const formatDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

function Figure({ img, className = '' }: { img: MinistryImage; className?: string }) {
  return (
    <figure className={className}>
      <img src={img.src} {...responsive(img.src, '(min-width: 1024px) 720px, 100vw')} alt={img.alt} loading="lazy" decoding="async" className="w-full rounded-md bg-stone-200 object-cover" />
      {(img.caption || img.credit) && (
        <figcaption className="mt-2 text-sm text-stone-600">
          {img.caption}
          {img.credit && <span className="text-stone-500"> {img.caption ? '· ' : ''}Photo: {img.credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function contentsOf(page: MinistryPageData) {
  return [
    ...page.body.filter((b) => b.id && b.heading).map((b) => ({ id: b.id!, label: b.heading! })),
    ...(page.steps ? [{ id: 'steps', label: page.steps.heading }] : []),
    ...(page.team?.length ? [{ id: 'team', label: 'Our team' }] : []),
    ...(page.news?.length ? [{ id: 'news', label: 'News' }] : []),
    ...(page.gallery?.length ? [{ id: 'gallery', label: 'Photos' }] : []),
    ...(page.resources?.length ? [{ id: 'resources', label: 'Resources' }] : []),
  ];
}

/** Phones and tablets: a collapsed "On this page" menu above the article (the desktop list sits in the sidebar). */
function MobileContents({ page }: { page: MinistryPageData }) {
  const items = contentsOf(page);
  if (items.length < 4) return null;
  return (
    <details className="group mb-10 rounded-md border border-stone-300 bg-white lg:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown className="h-5 w-5 text-stone-500 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="border-t border-stone-200 py-1">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              onClick={(e) => (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open')}
              className="flex min-h-11 items-center px-4 text-navy-800 hover:bg-stone-50 hover:text-teal-700"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function OnThisPage({ page }: { page: MinistryPageData }) {
  const items = contentsOf(page);
  if (items.length < 4) return null;
  return (
    <nav aria-labelledby="on-this-page">
      <h2 id="on-this-page" className="font-sans text-base font-semibold text-navy-900">
        On this page
      </h2>
      <ul className="mt-2 space-y-1.5 border-l-2 border-stone-200 pl-3">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className="block py-0.5 text-[0.95rem] text-navy-800 hover:text-teal-700">
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Full text of one news post: /ministries/:slug/news/:newsId */
export function MinistryNewsPage() {
  const { slug = '', newsId = '' } = useParams();
  const page = getMinistryPage(slug);
  const item = page?.news?.find((n) => n.id === newsId);
  usePageTitle(item ? `${item.title} · ${page?.name}` : 'News', item?.summary ?? item?.paragraphs?.[0], item?.image);
  if (!page || !item) return <NotFoundPage />;
  return (
    <>
      <PageHeader
        eyebrow={`${page.name} news · ${formatDate(item.date)}`}
        title={item.title}
        breadcrumbs={[
          { label: 'Ministries', to: '/ministries' },
          { label: page.name, to: `/ministries/${page.slug}` },
          { label: 'News' },
        ]}
      />
      <article className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-[70ch]">
          {item.image && <img src={item.image} {...responsive(item.image, '(min-width: 800px) 768px, 100vw')} alt="" className="mb-8 w-full rounded-md object-cover" />}
          {(item.paragraphs ?? [item.summary ?? '']).map((p, i) => (
            <p key={i} className="mt-4 text-[1.06rem] leading-relaxed text-stone-700 first:mt-0">
              {p}
            </p>
          ))}
          <Link to={`/ministries/${page.slug}#news`} className="mt-10 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900">
            More {page.name} news <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </>
  );
}

export function MinistryPage({ slug }: { slug: string }) {
  const page = getMinistryPage(slug);
  usePageTitle(page?.name ?? 'Ministry', page?.summary, page?.hero?.src);
  if (!page) return <NotFoundPage />;
  const related = ministryMegaMenuColumns.find((c) => c.id === page.group)?.items.filter((i) => !i.to.endsWith(`/${page.slug}`));
  return (
    <StandardPage
      page={page}
      breadcrumbs={[{ label: 'Ministries', to: '/ministries' }, { label: page.name }]}
      related={related}
      relatedTitle="Related ministries"
    />
  );
}

/**
 * The shared page template: header, optional hero photo, article sections (with images, steps,
 * team, news, gallery, video, resources) and a sidebar (contents, facts, contact, related links).
 * Used by ministry pages and by general content pages (src/data/pages/*.json).
 */
export function StandardPage({
  page,
  eyebrow,
  breadcrumbs,
  related,
  relatedTitle = 'Related pages',
}: {
  page: MinistryPageData;
  eyebrow?: string;
  breadcrumbs: { label: string; to?: string }[];
  related?: RelatedLink[];
  relatedTitle?: string;
}) {
  const resources = page.resources ?? [];
  const [allNews, setAllNews] = useState(false);
  const NEWS_LIMIT = 6;
  const news = page.news ?? [];
  const shownNews = allNews ? news : news.slice(0, NEWS_LIMIT);

  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={page.name}
        description={page.summary}
        breadcrumbs={breadcrumbs}
        actions={<Actions page={page} />}
        logo={page.logo}
      />

      {page.hero && (
        <div className="bg-stone-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <img
              src={page.hero.src}
              {...responsive(page.hero.src, '100vw')}
              alt={page.hero.alt}
              fetchPriority="high"
              className="aspect-[21/9] max-h-[30rem] w-full rounded-md object-cover"
            />
            {page.hero.credit && <p className="mt-2 text-right text-xs text-stone-500">Photo: {page.hero.credit}</p>}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-20 lg:px-8 lg:py-16">
        <article className="min-w-0 max-w-[70ch]">
          <MobileContents page={page} />
          {page.body.map((sec, i) => (
            <section key={i} id={sec.id} className={`scroll-mt-28 ${i ? 'mt-12' : ''}`}>
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
              {sec.image && <Figure img={sec.image} className="mt-6" />}
            </section>
          ))}

          {page.steps && (
            <section id="steps" className="mt-12 scroll-mt-28">
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

          {page.team && page.team.length > 0 && (
            <section id="team" className="mt-14 scroll-mt-28">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">Our team</h2>
              <ul className="mt-5 grid gap-6 sm:grid-cols-2">
                {page.team.map((t) => (
                  <li key={t.name} className="flex gap-4">
                    {t.photo && <img src={t.photo} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover" />}
                    <div>
                      <p className="font-semibold text-navy-900">{t.name}</p>
                      {t.role && <p className="text-sm text-teal-700">{t.role}</p>}
                      {t.text && <p className="mt-1 text-[0.95rem] leading-relaxed text-stone-700">{t.text}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {page.news && page.news.length > 0 && (
            <section id="news" className="mt-14 scroll-mt-28">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">News</h2>
              <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                {shownNews.map((n) => (
                  <li key={n.id}>
                    <Link to={`/ministries/${page.slug}/news/${n.id}`} className="group flex gap-4 py-4">
                      {n.image && <img src={n.image} {...responsive(n.image, '112px')} alt="" loading="lazy" className="hidden h-20 w-28 shrink-0 rounded object-cover sm:block" />}
                      <span>
                        <span className="block text-sm text-stone-500">{formatDate(n.date)}</span>
                        <span className="block font-serif text-lg font-semibold text-navy-900 group-hover:text-teal-700">{n.title}</span>
                        {n.summary && <span className="mt-0.5 block text-[0.95rem] leading-snug text-stone-600">{n.summary}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {news.length > NEWS_LIMIT && !allNews && (
                <button
                  type="button"
                  onClick={() => setAllNews(true)}
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 font-semibold text-navy-900 hover:border-navy-900"
                >
                  Show all {news.length} news posts <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </section>
          )}

          {page.gallery && page.gallery.length > 0 && (
            <section id="gallery" className="mt-14 scroll-mt-28">
              <h2 className="font-serif text-2xl font-semibold text-navy-900">Photos</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {page.gallery.map((g) => (
                  <li key={g.src}>
                    <a href={g.src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md">
                      <img src={g.src} {...responsive(g.src, '(min-width: 1024px) 300px, 50vw')} alt={g.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-300 hover:scale-[1.03]" />
                    </a>
                    {g.caption && <p className="mt-1 text-xs text-stone-600">{g.caption}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {page.video && (
            <section className="mt-12">
              <YouTubeEmbedCard youtubeId={page.video.youtubeId} title={page.video.title} />
            </section>
          )}

          {resources.length > 0 && (
            <section id="resources" className="mt-12 scroll-mt-28">
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
          <Sidebar page={page} related={related} relatedTitle={relatedTitle} />
        </aside>
      </div>
    </>
  );
}
