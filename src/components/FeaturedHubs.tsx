import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Phone, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

/**
 * Two large entry cards for the sections that were previously separate websites:
 * the Word of Salvation sermon archive and the Safe Church Unit.
 */
export function FeaturedHubs({ className = '' }: { className?: string }) {
  const urgent = siteConfig.safeChurch.urgent;
  return (
    <div className={`grid gap-5 lg:grid-cols-2 ${className}`}>
      <Link
        to="/sermons"
        className="group relative flex flex-col overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-sm transition hover:shadow-lg sm:p-8"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">Word of Salvation</p>
        <h3 className="relative mt-1 font-serif text-2xl font-bold sm:text-3xl">Reading Sermon Archive</h3>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-navy-100 sm:text-base">
          Over 2,000 sermons by CRCA ministers. Search by book, passage, preacher or Heidelberg Lord’s Day, then print a clean
          copy for a reading service.
        </p>
        <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 group-hover:text-white">
          Browse the archive <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-col rounded-2xl border border-teal-500/30 bg-teal-50 p-6 shadow-sm sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700 ring-1 ring-teal-500/20">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Safe Church Unit</p>
        <h3 className="mt-1 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">Safeguarding &amp; Reporting</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-700 sm:text-base">
          Policies, child and adult safeguarding guidance, volunteer approval, training calendars, and 80+ forms, posters and
          guidelines.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/safe-church"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Open Safe Church <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={`tel:${urgent.primaryPhone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 hover:border-rose-400"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Report a concern: {urgent.primaryPhone}
          </a>
        </div>
      </div>
    </div>
  );
}
