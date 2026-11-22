import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import ministriesData from '../data/ministries.json';
import { MinistryIcon } from './MinistryIcon';

interface MinistryEntry {
  id: string;
  name: string;
  shortDescription: string;
  iconName: string;
  url: string;
  isExternal: boolean;
  ctaLabel: string;
}

interface RelatedMinistriesBarProps {
  currentSlug: string;
  slugs: string[];
  heading?: string;
}

/**
 * Displays sibling ministry cards at the bottom of ministry detail pages so
 * visitors can keep exploring within the CRCA site.
 */
export function RelatedMinistriesBar({
  currentSlug,
  slugs,
  heading = 'Explore Related CRCA Ministries',
}: RelatedMinistriesBarProps) {
  const allMinistries = ministriesData as MinistryEntry[];
  const related = slugs
    .filter((id) => id !== currentSlug)
    .map((id) => allMinistries.find((m) => m.id === id))
    .filter((m): m is MinistryEntry => Boolean(m));

  if (related.length === 0) return null;

  return (
    <section
      aria-label="Related CRCA Ministries"
      className="border-t border-stone-200 bg-white py-12 sm:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-600">
              Continue Exploring
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900">{heading}</h2>
          </div>
          <Link
            to="/ministries"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-navy-900"
          >
            <span>View All Ministries</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {related.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50/80 p-5 transition-all hover:border-teal-500/40 hover:bg-white hover:shadow-sm"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                  <MinistryIcon name={item.iconName} className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-serif text-lg font-bold text-navy-900">{item.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                  {item.shortDescription}
                </p>
              </div>
              <div className="mt-4 border-t border-stone-200/80 pt-3">
                {item.isExternal ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                  >
                    <span>{item.ctaLabel}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    to={item.url}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-navy-900"
                  >
                    <span>{item.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
