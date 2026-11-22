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
            <p className="text-sm leading-relaxed text-navy-100/90 max-w-sm">
              {siteConfig.tagline}. Over 50 Reformed, Bible-based congregations serving
              communities across Australia since {siteConfig.establishedYear}.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/find-a-church"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
              >
                <MapPin className="h-3.5 w-3.5 text-gold-400" />
                <span>Find a Church</span>
              </Link>
              <a
                href={`mailto:${siteConfig.adminEmail}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-navy-100 transition-colors hover:border-white/30 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 text-teal-400" />
                <span>{siteConfig.adminEmail}</span>
              </a>
            </div>
          </div>

          {/* Balanced 3-Column Navigation Sitemap */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-gold-400">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.isExternal ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-navy-100/85 transition-colors hover:text-white"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-sm text-navy-100/85 transition-colors hover:text-white"
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
            <a
              href={siteConfig.safeChurch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-teal-100 transition-colors hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Safe Church &amp; Safeguarding</span>
            </a>
            <span className="text-white/25">•</span>
            <Link to="/contact" className="transition-colors hover:text-white">
              National Enquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
