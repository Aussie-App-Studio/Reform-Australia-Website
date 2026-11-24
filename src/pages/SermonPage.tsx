import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Link2, Minus, Plus, Printer } from 'lucide-react';
import { RichHtml } from '../components/RichHtml';
import { NotFoundPage } from './NotFoundPage';
import {
  fetchSermon,
  fetchSermonIndex,
  GROUP_LABELS,
  issueLabel,
  readAloudMinutes,
  type Sermon,
  type SermonIndex,
} from '../lib/sermons';
import { usePageTitle } from '../utils/usePageTitle';

const FONT_SIZES = [16, 18, 20, 22, 24];
const FONT_KEY = 'crca-sermon-font';

function readFontIndex(): number {
  try {
    const v = Number(localStorage.getItem(FONT_KEY));
    return Number.isInteger(v) && v >= 0 && v < FONT_SIZES.length ? v : 1;
  } catch {
    return 1;
  }
}

/** Natural ordering of references like "Rom.02:1-11" within a book. */
function refKey(ref: string | null, ld: number | null): number[] {
  if (ld) return [ld];
  // Drop a leading book number ("1Pet.5:1" -> chapter 5, verse 1).
  const nums = (ref ?? '').replace(/^\s*[123]\s?(?=[A-Za-z])/, '').match(/\d+/g);
  return nums ? nums.map(Number) : [9999];
}

export function SermonPage() {
  const { sermonId = '' } = useParams();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [index, setIndex] = useState<SermonIndex | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [fontIdx, setFontIdx] = useState(readFontIndex);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStatus('loading');
    setSermon(null);
    fetchSermon(sermonId).then(
      (s) => {
        setSermon(s);
        setStatus('ok');
      },
      () => setStatus('missing')
    );
    fetchSermonIndex().then(setIndex, () => undefined);
  }, [sermonId]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_KEY, String(fontIdx));
    } catch {
      /* private mode */
    }
  }, [fontIdx]);

  usePageTitle(
    sermon ? `${sermon.title} · Word of Salvation` : 'Word of Salvation',
    sermon
      ? `A reading sermon on ${sermon.ref}${sermon.preacher ? ` by ${sermon.preacher}` : ''}, for reading aloud in church when no minister is available. From the CRCA’s Word of Salvation archive.`
      : null
  );

  const { prev, next, bookCount } = useMemo(() => {
    if (!index || !sermon?.book) return { prev: null, next: null, bookCount: 0 };
    const inBook = index.sermons
      .filter((s) => s.b === sermon.book)
      .map((s) => ({ s, k: refKey(s.r, s.ld) }))
      .sort((a, b) => {
        for (let i = 0; i < Math.max(a.k.length, b.k.length); i++) {
          const d = (a.k[i] ?? 0) - (b.k[i] ?? 0);
          if (d) return d;
        }
        return a.s.t.localeCompare(b.s.t);
      })
      .map((x) => x.s);
    const i = inBook.findIndex((s) => s.id === sermon.id);
    return { prev: i > 0 ? inBook[i - 1] : null, next: i >= 0 && i < inBook.length - 1 ? inBook[i + 1] : null, bookCount: inBook.length };
  }, [index, sermon]);

  const preacherKey = useMemo(() => {
    if (!index || !sermon) return null;
    return index.sermons.find((s) => s.id === sermon.id)?.p ?? null;
  }, [index, sermon]);

  if (status === 'missing') return <NotFoundPage />;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const details = sermon && (
    <dl className="divide-y divide-stone-200 border-y border-stone-200 text-[0.95rem]">
      {[
        ['Text', sermon.passage],
        ['Readings', sermon.readings && sermon.readings !== sermon.passage ? sermon.readings : null],
        [
          'Preacher',
          sermon.preacher &&
            (preacherKey ? (
              <Link to={`/sermons?preacher=${encodeURIComponent(preacherKey)}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-navy-900 print:no-underline">
                {sermon.preacher}
              </Link>
            ) : (
              sermon.preacher
            )),
        ],
        ['Series', sermon.series],
        ['Published', `Word of Salvation, ${sermon.issue ?? issueLabel(sermon.year, sermon.month)}`],
        ['Length', `About ${readAloudMinutes(sermon.words)} minutes read aloud`],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k as string} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
            <dt className="text-stone-500">{k}</dt>
            <dd className="text-navy-900">{v}</dd>
          </div>
        ))}
    </dl>
  );

  const tools = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-md border border-stone-300 bg-white" role="group" aria-label="Text size">
        <button
          onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
          disabled={fontIdx === 0}
          aria-label="Smaller text"
          className="flex h-9 w-9 items-center justify-center text-navy-800 hover:bg-stone-100 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="border-x border-stone-200 px-2 font-serif text-sm font-semibold text-navy-900" aria-hidden="true">
          Aa
        </span>
        <button
          onClick={() => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
          disabled={fontIdx === FONT_SIZES.length - 1}
          aria-label="Larger text"
          className="flex h-9 w-9 items-center justify-center text-navy-800 hover:bg-stone-100 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <button onClick={copyLink} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-sm font-medium text-navy-900 hover:border-navy-900">
        {copied ? <Check className="h-4 w-4 text-teal-600" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <button onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-navy-900 px-3.5 text-sm font-semibold text-white hover:bg-navy-800">
        <Printer className="h-4 w-4" aria-hidden="true" /> Print
      </button>
    </div>
  );

  const moreInBook = sermon && (prev || next) && (
    <nav aria-label={`More sermons on ${sermon.book}`}>
      <p className="font-sans text-base font-semibold text-navy-900">
        More on {sermon.book} ({bookCount})
      </p>
      <ul className="mt-2 divide-y divide-stone-200 border-y border-stone-200">
        {prev && (
          <li>
            <Link to={`/sermons/${prev.id}`} className="group flex gap-2 py-3">
              <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-stone-400 group-hover:text-teal-700" aria-hidden="true" />
              <span>
                <span className="block text-sm text-stone-500">{prev.r}</span>
                <span className="block font-serif font-semibold text-navy-900 group-hover:text-teal-700">{prev.t}</span>
              </span>
            </Link>
          </li>
        )}
        {next && (
          <li>
            <Link to={`/sermons/${next.id}`} className="group flex gap-2 py-3">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-stone-400 group-hover:text-teal-700" aria-hidden="true" />
              <span>
                <span className="block text-sm text-stone-500">{next.r}</span>
                <span className="block font-serif font-semibold text-navy-900 group-hover:text-teal-700">{next.t}</span>
              </span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );

  return (
    <>
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
          <nav aria-label="Breadcrumb" className="mb-8 print:hidden">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-600">
              <li>
                <Link to="/" className="hover:text-navy-900 hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="text-stone-400">/</span>
                <Link to="/sermons" className="hover:text-navy-900 hover:underline underline-offset-4">
                  Sermons
                </Link>
              </li>
              {sermon?.book && (
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-stone-400">/</span>
                  <Link
                    to={`/sermons?book=${encodeURIComponent(sermon.book)}${sermon.group ? `&g=${sermon.group}` : ''}`}
                    className="hover:text-navy-900 hover:underline underline-offset-4"
                  >
                    {sermon.book}
                  </Link>
                </li>
              )}
            </ol>
          </nav>
          <p className="text-sm font-semibold text-teal-700">
            {sermon?.passage ?? (sermon?.group ? GROUP_LABELS[sermon.group] : 'Reading sermon')}
            {sermon?.lordsDay && !/lord/i.test(sermon.passage ?? '') ? ` · Lord’s Day ${sermon.lordsDay}` : ''}
          </p>
          <h1 className="mt-1 max-w-4xl font-serif text-4xl font-semibold leading-[1.1] text-navy-900 sm:text-5xl">
            {sermon?.title ?? <span className="inline-block h-12 w-2/3 animate-pulse rounded bg-stone-200" />}
          </h1>
          {sermon?.preacher && <p className="mt-4 text-lg text-stone-700">{sermon.preacher}</p>}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:px-8 lg:py-14">
        {/* Sermon text */}
        <div className="min-w-0">
          {/* Phones/tablets: details and tools above the text */}
          <div className="mb-8 space-y-5 lg:hidden print:hidden">
            {details}
            {tools}
          </div>
          {status === 'loading' && (
            <div role="status" data-loading className="max-w-[68ch] space-y-3" aria-label="Loading sermon">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-stone-200" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
              ))}
            </div>
          )}
          {sermon && (
            <article style={{ ['--reader-font-size' as string]: `${FONT_SIZES[fontIdx]}px` }}>
              <RichHtml html={sermon.html} className="crca-sermon max-w-[68ch]" />
            </article>
          )}
          {sermon && (
            <div className="mt-12 max-w-[68ch] space-y-8 border-t border-stone-200 pt-8 print:hidden">
              <div className="lg:hidden">{moreInBook}</div>
              <p className="text-sm text-stone-600">
                From the Word of Salvation archive of sermons by CRCA ministers.
              </p>
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-[calc(var(--site-header-height,72px)+2rem)] space-y-8">
            {details}
            {tools}
            <p className="text-sm leading-relaxed text-stone-600">
              Leading a reading service? <strong className="font-semibold text-navy-900">Print</strong> gives a clean copy without
              the website around it.
            </p>
            {moreInBook}
          </div>
        </aside>
      </div>
    </>
  );
}
