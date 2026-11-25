import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { responsive } from '../utils/responsiveImage';
import { PhotoCredit } from './PhotoCredit';

/** The roofline and cross from the CRCA logo, drawn large. Decoration only. */
export function Roofline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" className={`pointer-events-none print:hidden ${className}`}>
      <path d="M10 260V130L105 35l95 95v130M120 50l65-40 145 115v135" />
      <path d="M200 260v-75a62 62 0 0 1 124 0v75M262 95v130M222 140h80" />
      <path d="M330 150l60 60v50" />
    </svg>
  );
}

/** One colour for each part of the site. The same colours are used on the home page blocks. */
const THEMES = {
  teal: { band: 'bg-teal-700 text-white', line: 'text-white/15' },
  gold: { band: 'bg-gold-400 text-navy-950', line: 'text-navy-950/15' },
  brick: { band: 'bg-brick-700 text-white', line: 'text-white/15' },
  forest: { band: 'bg-forest-700 text-white', line: 'text-white/15' },
  navy: { band: 'bg-navy-900 text-white', line: 'text-teal-500/30' },
} as const;

const SECTIONS: [RegExp, keyof typeof THEMES][] = [
  [/^\/who-we-are\/(beliefs|vision-values)/, 'teal'],
  [/^\/who-we-are/, 'brick'],
  [/^\/ministries/, 'forest'],
  [/^\/find-a-church/, 'gold'],
];

export function sectionTheme(pathname: string) {
  return THEMES[SECTIONS.find(([re]) => re.test(pathname))?.[1] ?? 'navy'];
}

/** A photo in the shape of the arched door in the logo. */
export function ArchPhoto({ src, alt, credit, className = '' }: { src: string; alt: string; credit?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <img src={src} {...responsive(src, '(min-width: 1024px) 480px, 100vw')} alt={alt} loading="lazy" className="aspect-[4/5] w-full rounded-t-full object-cover" />
      {credit && <PhotoCredit credit={credit} />}
    </div>
  );
}

/** A large coloured block that leads to one part of the site. */
export function ColourBlock({ Icon, title, detail, to, colour }: { Icon: LucideIcon; title: string; detail: string; to: string; colour: string }) {
  return (
    <Link to={to} className={`group flex h-full items-center gap-5 p-6 sm:min-h-48 sm:flex-col sm:items-start sm:justify-between lg:p-9 ${colour}`}>
      <Icon className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" strokeWidth={1.5} aria-hidden="true" />
      <span>
        <span className="flex items-center gap-2 font-serif text-2xl font-semibold">
          {title} <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
        <span className="mt-1 block text-lg leading-snug">{detail}</span>
      </span>
    </Link>
  );
}
