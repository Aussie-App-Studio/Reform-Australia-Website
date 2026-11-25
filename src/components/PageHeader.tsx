import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArchPhoto, Roofline, sectionTheme } from './brand';

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
  /** Optional photo, shown on larger screens in an arch instead of the roofline drawing. */
  photo?: { src: string; alt: string; credit?: string };
}

/**
 * Page header in the colour of its part of the site (see brand.tsx), with the logo's
 * roofline drawn large, a breadcrumb trail, a serif title and a short standfirst.
 */
export function PageHeader({ eyebrow, title, description, breadcrumbs, actions, logo, photo }: PageHeaderProps) {
  const theme = sectionTheme(useLocation().pathname);
  return (
    <header className={`relative overflow-hidden print:bg-white print:text-black ${theme.band}`}>
      {!photo && <Roofline className={`absolute -bottom-2 -right-24 hidden w-[26rem] md:block 2xl:right-12 ${theme.line}`} />}
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-x-2 text-sm">
              <li>
                <Link to="/" className="inline-block py-1.5 hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="opacity-60">
                    /
                  </span>
                  {crumb.to ? (
                    <Link to={crumb.to} className="inline-block py-1.5 hover:underline underline-offset-4">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-semibold">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={`flex flex-col gap-6 lg:flex-row lg:justify-between ${photo ? 'lg:items-center' : 'lg:items-end'}`}>
          <div className="max-w-3xl">
            {logo && (
              <img src={logo.src} alt={logo.alt} className="mb-5 h-20 w-auto max-w-[14rem] rounded-md bg-white object-contain p-2.5 sm:h-24" />
            )}
            {eyebrow && <p className="text-sm font-semibold">{eyebrow}</p>}
            <h1 className="mt-1 font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">{title}</h1>
            {description && <p className="mt-5 text-lg leading-relaxed sm:text-xl">{description}</p>}
          </div>

          {photo && <ArchPhoto {...photo} className="-mb-14 hidden w-72 shrink-0 lg:block xl:w-80" />}
          {actions && <div className="page-header-actions shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
