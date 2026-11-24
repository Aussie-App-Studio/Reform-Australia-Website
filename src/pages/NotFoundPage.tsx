import { Link } from 'react-router-dom';
import { usePageMeta } from '../utils/usePageTitle';

const LINKS = [
  { to: '/', label: 'Home page' },
  { to: '/find-a-church', label: 'Find a church' },
  { to: '/for-churches/forms-and-documents', label: 'Forms and documents' },
  { to: '/sermons', label: 'Reading sermons' },
  { to: '/safe-church', label: 'Safe Church' },
  { to: '/contact', label: 'Contact the office' },
];

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <section className="bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <h1 className="font-serif text-4xl font-semibold text-navy-900">We couldn’t find that page</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          It may have moved when the CRCA websites were brought together, or the address may be mistyped. These pages
          may help:
        </p>
        <ul className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block py-3.5 text-lg font-semibold text-navy-900 underline-offset-4 hover:text-teal-700 hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
