import { Link } from 'react-router-dom';
import { Download, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SimpleText } from '../components/SimpleText';
import type { ContentPageData } from '../lib/contentPages';
import { formatClosing, openVacancies } from '../lib/vacancies';

/** Positions vacant: the page's introduction, then every open vacancy (src/data/vacancies/). */
export function PositionsVacantPage({ page }: { page: ContentPageData }) {
  const vacancies = openVacancies();
  const intro = page.body.flatMap((b) => b.text?.split(/\n\s*\n/) ?? []);
  return (
    <>
      <PageHeader
        title={page.title}
        description={page.summary}
        breadcrumbs={[{ label: 'For churches', to: '/for-churches' }, { label: page.title }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-[70ch]">
          {intro.map((p) => (
            <p key={p} className="text-lg leading-relaxed text-stone-700">
              {p}
            </p>
          ))}

          {vacancies.length === 0 ? (
            <p className="mt-10 border-y border-stone-200 py-6 text-lg text-stone-700">There are no vacancies listed at the moment.</p>
          ) : (
            <>
              <h2 className="mt-10 font-serif text-2xl font-semibold text-navy-900">Current vacancies</h2>
              <ul className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                {vacancies.map((v) => (
                  <li key={v.id} className="py-3">
                    <a href={`#${v.id}`} className="font-semibold text-navy-900 underline-offset-4 hover:text-teal-700 hover:underline">
                      {v.title}, {v.organisation}
                    </a>
                    <span className="block text-stone-600">Applications close {formatClosing(v)}</span>
                  </li>
                ))}
              </ul>

              {vacancies.map((v) => (
                <article key={v.id} id={v.id} className="mt-14 scroll-mt-28 border-t-2 border-navy-900 pt-6">
                  <h2 className="font-serif text-3xl font-semibold text-navy-900">{v.title}</h2>
                  <p className="mt-1 text-lg font-semibold text-teal-700">{v.organisation}</p>
                  <dl className="mt-4 grid gap-x-8 gap-y-1 text-stone-700 sm:grid-cols-[auto_1fr]">
                    {v.location && (
                      <>
                        <dt className="font-semibold text-navy-900">Location</dt>
                        <dd>{v.location}</dd>
                      </>
                    )}
                    {v.hours && (
                      <>
                        <dt className="font-semibold text-navy-900">Hours</dt>
                        <dd>{v.hours}</dd>
                      </>
                    )}
                    <dt className="font-semibold text-navy-900">Applications close</dt>
                    <dd>{formatClosing(v)}</dd>
                  </dl>
                  <p className="mt-6 text-lg leading-relaxed text-stone-800">{v.summary}</p>
                  <SimpleText text={v.details} className="mt-4" />
                  {v.howToApply && (
                    <>
                      <h3 className="mt-8 font-serif text-xl font-semibold text-navy-900">How to apply</h3>
                      <SimpleText text={v.howToApply} className="mt-3" />
                    </>
                  )}
                  {(v.contact?.name || v.contact?.email || v.contact?.phone) && (
                    <p className="mt-6 text-stone-700">
                      <span className="font-semibold text-navy-900">Contact: </span>
                      {[v.contact.name, v.contact.phone].filter(Boolean).join(', ')}
                      {v.contact.email && (
                        <>
                          {v.contact.name || v.contact.phone ? ', ' : ''}
                          <a href={`mailto:${v.contact.email}`} className="font-semibold text-teal-700 underline underline-offset-2">
                            {v.contact.email}
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {v.attachment?.file && (
                      <a
                        href={v.attachment.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-navy-900 px-4 font-semibold text-white hover:bg-navy-800"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {v.attachment.label || 'Full advertisement'}
                      </a>
                    )}
                    {v.website && (
                      <a
                        href={v.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-300 bg-white px-4 font-semibold text-navy-900 hover:border-navy-900"
                      >
                        Church website <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </>
          )}

          <p className="mt-14 text-stone-600">
            To list a vacancy in a CRCA church,{' '}
            <Link to="/contact" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              contact the national office
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
