import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail } from 'lucide-react';
import { CrcaLogo } from '../components/CrcaLogo';

export function NotFoundPage() {
  return (
    <section className="bg-stone-50 py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <div className="mb-6 flex justify-center">
          <CrcaLogo variant="stacked" className="h-20" />
        </div>
        <span className="inline-block rounded-full bg-gold-50 border border-gold-400/50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-600">
          404 — Page Not Found
        </span>
        <h1 className="mt-4 font-serif text-4xl font-bold text-navy-900">
          We couldn’t find that page
        </h1>
        <p className="mt-3 text-base text-stone-700">
          The page you&apos;re looking for may have moved or no longer exists. Try heading back home,
          finding a local congregation, or contacting our national office.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/find-a-church"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <MapPin className="h-4 w-4" />
            <span>Find a Church</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-stone-100"
          >
            <Mail className="h-4 w-4 text-teal-600" />
            <span>Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
