import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import identity from '../data/identity.json';

export function HistoryPage() {
  const { history } = identity;

  return (
    <>
      <PageHeader
        title={history.heading}
        description={history.lead}
        breadcrumbs={[{ label: 'Who we are' }, { label: 'Our history' }]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">How the CRCA began</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            The CRCA was formed in 1951, after the post-war migration of Dutch people to Australia. The founders
            wanted a church that:
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-stone-700 marker:font-semibold marker:text-navy-900">
            {history.foundingCommitments.map((goal) => (
              <li key={goal} className="pl-1">
                {goal.charAt(0).toLowerCase() + goal.slice(1)}
              </li>
            ))}
          </ol>

          <h2 className="mt-14 font-serif text-3xl font-semibold text-navy-900">The Reformed tradition</h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">{history.reformedEmphasesIntro}</p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg leading-relaxed text-stone-700 marker:text-stone-400">
            {history.reformedEmphases.map((item) => (
              <li key={item} className="pl-1">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            Read more in{' '}
            <Link to="/who-we-are/beliefs" className="font-semibold text-teal-700 underline-offset-4 hover:underline">
              What we believe
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-serif text-3xl font-semibold text-navy-900">Since 1951</h2>
          <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
            {history.milestones.map((milestone) => (
              <div key={milestone.era} className="grid gap-1 py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="font-serif text-lg font-semibold text-teal-700">{milestone.era}</dt>
                <dd>
                  <p className="font-semibold text-navy-900">{milestone.title}</p>
                  <p className="mt-1 leading-relaxed text-stone-700">{milestone.description}</p>
                  {'link' in milestone && milestone.link && (
                    <Link
                      to={milestone.link as string}
                      className="mt-2 inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-navy-900"
                    >
                      Read about Trowel and Sword <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
