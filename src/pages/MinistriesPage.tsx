import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ministryMegaMenuColumns } from '../data/navigation';
import { GROUP_LABELS, getMinistryPage, type MinistryGroup } from '../lib/ministryPages';

/** Overview of every ministry, grouped the same way as the Ministries menu. */
export function MinistriesPage() {
  return (
    <>
      <PageHeader
        title="Ministries"
        description="The work CRCA churches do together: with children and young people, in training and church planting, and in mission at home and overseas."
        breadcrumbs={[{ label: 'Ministries' }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {ministryMegaMenuColumns.map((col) => (
          <section key={col.id} aria-labelledby={`grp-${col.id}`} className="grid gap-6 border-t border-stone-200 py-10 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-16">
            <h2 id={`grp-${col.id}`} className="font-serif text-2xl font-semibold text-navy-900 lg:col-span-4">
              {GROUP_LABELS[col.id as MinistryGroup]}
            </h2>
            <ul className="divide-y divide-stone-200 border-b border-stone-200 lg:col-span-8">
              {col.items.map((item) => {
                const slug = item.to.split('/').pop() ?? '';
                const mp = getMinistryPage(slug);
                const summary = mp?.summary ?? item.description;
                const inner = (
                  <span className="flex gap-5">
                    {mp?.hero ? (
                      <img src={mp.hero.src} alt="" loading="lazy" className="hidden h-24 w-36 shrink-0 rounded-md object-cover sm:block" />
                    ) : (
                      <span className="hidden h-24 w-36 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white px-2 text-center font-serif text-sm text-navy-900 sm:flex" aria-hidden="true">{item.isExternal ? new URL(item.to).hostname.replace(/^www./, '') : item.label}</span>
                    )}
                    <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-4">
                      <span className="font-serif text-xl font-semibold text-navy-900 group-hover:text-teal-700">{item.label}</span>
                      {item.isExternal ? (
                        <ExternalLink className="h-4 w-4 shrink-0 text-stone-400" aria-label="(external website)" />
                      ) : (
                        <ArrowRight className="h-4 w-4 shrink-0 text-teal-600 transition group-hover:translate-x-0.5" aria-hidden="true" />
                      )}
                    </span>
                    {summary && <span className="mt-1 block max-w-2xl leading-relaxed text-stone-600">{summary}</span>}
                    </span>
                  </span>
                );
                return (
                  <li key={item.to}>
                    {item.isExternal ? (
                      <a href={item.to} target="_blank" rel="noopener noreferrer" className="group block py-5">
                        {inner}
                      </a>
                    ) : (
                      <Link to={item.to} className="group block py-5">
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="mt-6 grid gap-6 border-t border-stone-200 pt-10 lg:grid-cols-12 lg:gap-16">
          <h2 className="font-serif text-2xl font-semibold text-navy-900 lg:col-span-4">Serving the churches</h2>
          <ul className="divide-y divide-stone-200 border-b border-stone-200 lg:col-span-8">
            {[
              { label: 'Safe Church Unit', to: '/safe-church', text: 'Helps churches understand and prevent abuse, and respond with compassion and justice where abuse has occurred.' },
              { label: 'Reading sermons', to: '/sermons', text: 'The Word of Salvation archive of sermons by CRCA ministers, for reading services and study.' },
            ].map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="group block py-5">
                  <span className="flex items-center justify-between gap-4">
                    <span className="font-serif text-xl font-semibold text-navy-900 group-hover:text-teal-700">{i.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  </span>
                  <span className="mt-1 block max-w-2xl leading-relaxed text-stone-600">{i.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
