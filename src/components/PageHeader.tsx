import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  /** Small section label shown above the title (e.g. "Who we are"). */
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  /** Optional logo (e.g. a ministry's own logo) shown beside the title. */
  logo?: { src: string; alt: string };
}

/**
 * Quiet, editorial page header: paper background, breadcrumb trail,
 * a large serif title and a short standfirst, closed by a thin rule.
 */
export function PageHeader({ eyebrow, title, description, breadcrumbs, actions, logo }: PageHeaderProps) {
  return (
    <header className="border-b border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600">
              <li>
                <Link to="/" className="hover:text-navy-900 hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-stone-400">
                    /
                  </span>
                  {crumb.to ? (
                    <Link to={crumb.to} className="hover:text-navy-900 hover:underline underline-offset-4">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-navy-900">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {logo && (
              <img src={logo.src} alt={logo.alt} className="mb-5 h-16 w-auto max-w-[12rem] object-contain object-left sm:h-20" />
            )}
            {eyebrow && <p className="text-sm font-semibold text-teal-700">{eyebrow}</p>}
            <h1 className="mt-1 font-serif text-4xl font-semibold leading-[1.1] text-navy-900 sm:text-5xl">{title}</h1>
            {description && <p className="mt-5 text-lg leading-relaxed text-stone-700">{description}</p>}
          </div>

          {actions && <div className="page-header-actions shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
