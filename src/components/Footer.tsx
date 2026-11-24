import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { CrcaLogo } from './CrcaLogo';
import { footerColumns } from '../data/navigation';
import { siteConfig } from '../data/siteConfig';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="print:hidden border-t border-navy-800 bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Brand & Quick Actions Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block">
              <CrcaLogo variant="light" />
            </Link>
            <p className="max-w-sm leading-relaxed text-navy-100">
              A family of Reformed churches across Australia since {siteConfig.establishedYear}.
            </p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link to="/find-a-church" className="inline-flex items-center gap-2 text-white hover:underline underline-offset-4">
                  <MapPin className="h-4 w-4 text-teal-400" aria-hidden="true" /> Find a church
                </Link>
              </li>
              <li>
                <a href={`mailto:${siteConfig.adminEmail}`} className="inline-flex items-center gap-2 text-white hover:underline underline-offset-4">
                  <Mail className="h-4 w-4 text-teal-400" aria-hidden="true" /> {siteConfig.adminEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Balanced 3-Column Navigation Sitemap */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-teal-100">
                  {col.title}
                </h3>
                <ul className="mt-3 lg:mt-4 lg:space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isExternal ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 py-2 text-sm text-navy-100/85 transition-colors hover:text-white lg:py-0"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="inline-block py-2 text-sm text-navy-100/85 transition-colors hover:text-white lg:py-0"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legal & Safeguarding Bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-navy-100/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {siteConfig.brandName}. Established {siteConfig.establishedYear}.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={siteConfig.safeChurch.url}
              className="inline-flex items-center gap-1.5 font-medium text-teal-100 transition-colors hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Safe Church</span>
            </Link>
            <span className="text-white/25">•</span>
            <Link to="/contact" className="transition-colors hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
