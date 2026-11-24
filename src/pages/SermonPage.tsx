import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Clock, ExternalLink, Link2, Minus, Plus, Printer } from 'lucide-react';
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

  usePageTitle(sermon ? `${sermon.title} · Word of Salvation` : 'Word of Salvation');

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

  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50 text-navy-900">
        <div aria-hidden="true" className="hidden" />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
          <nav aria-label="Breadcrumb" className="mb-5 print:hidden">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-600">
              <li>
                <Link to="/sermons" className="hover:text-navy-900 hover:underline underline-offset-4">
                  Word of Salvation
                </Link>
              </li>
              {sermon?.book && (
                <li className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  <Link to={`/sermons?book=${encodeURIComponent(sermon.book)}${sermon.group ? `&g=${sermon.group}` : ''}`} className="hover:text-navy-900 hover:underline underline-offset-4">
                    {sermon.book}
                  </Link>
                </li>
              )}
            </ol>
          </nav>
          <p className="text-sm font-semibold text-teal-700">
            {sermon?.group ? GROUP_LABELS[sermon.group] : 'Reading sermon'}
            {sermon?.lordsDay ? ` · Lord’s Day ${sermon.lordsDay}` : ''}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.1] sm:text-5xl">
            {sermon?.title ?? <span className="inline-block h-10 w-2/3 animate-pulse rounded bg-stone-200" />}
          </h1>
          {sermon && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:gap-x-8">
              {sermon.passage && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Text</dt>
                  <dd className="mt-0.5 font-semibold">{sermon.passage}</dd>
                </div>
              )}
              {sermon.readings && sermon.readings !== sermon.passage && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Readings</dt>
                  <dd className="mt-0.5 font-semibold">{sermon.readings}</dd>
                </div>
              )}
              {sermon.preacher && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Preacher</dt>
                  <dd className="mt-0.5 font-semibold">
                    {preacherKey ? (
                      <Link to={`/sermons?preacher=${encodeURIComponent(preacherKey)}`} className="underline decoration-teal-500 underline-offset-4 hover:decoration-navy-900 print:no-underline">
                        {sermon.preacher}
                      </Link>
                    ) : (
                      sermon.preacher
                    )}
                  </dd>
                </div>
              )}
              {sermon.series && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Series</dt>
                  <dd className="mt-0.5 font-semibold">{sermon.series}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Published</dt>
                <dd className="mt-0.5 font-semibold">Word of Salvation · {sermon.issue ?? issueLabel(sermon.year, sermon.month)}</dd>
              </div>
              <div className="print:hidden">
                <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">Length</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-semibold">
                  <Clock className="h-4 w-4 text-teal-600" aria-hidden="true" /> ~{readAloudMinutes(sermon.words)} minutes read aloud
                </dd>
              </div>
            </dl>
          )}
        </div>
        <div aria-hidden="true" className="hidden" />
      </section>

      {/* Reading toolbar */}
      <div className="no-print sticky top-[var(--site-header-height,72px)] z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <Link to="/sermons" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-navy-800 hover:bg-stone-100">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">All sermons</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="sr-only">Text size</span>
            <button
              onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
              disabled={fontIdx === 0}
              aria-label="Smaller text"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-800 hover:bg-stone-100 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center font-serif text-sm font-bold text-navy-900" aria-hidden="true">
              Aa
            </span>
            <button
              onClick={() => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
              disabled={fontIdx === FONT_SIZES.length - 1}
              aria-label="Larger text"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-800 hover:bg-stone-100 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="mx-1 h-6 w-px bg-stone-200" aria-hidden="true" />
            <button onClick={copyLink} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-navy-800 hover:bg-stone-100">
              {copied ? <Check className="h-4 w-4 text-teal-600" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy link'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3 text-sm font-semibold text-white hover:bg-navy-800"
            >
              <Printer className="h-4 w-4" aria-hidden="true" /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        {status === 'loading' && (
          <div role="status" className="space-y-3" aria-label="Loading sermon">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-stone-200" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
            ))}
          </div>
        )}
        {sermon && (
          <article style={{ ['--reader-font-size' as string]: `${FONT_SIZES[fontIdx]}px` }}>
            <RichHtml html={sermon.html} className="crca-sermon" />
            <p className="mt-10 border-t border-stone-200 pt-4 text-center font-serif text-lg text-stone-500 print:hidden" aria-hidden="true">
              ✦
            </p>
          </article>
        )}

        {sermon && (
          <div className="no-print mt-8 space-y-6">
            {(prev || next) && (
              <nav aria-label={`More sermons on ${sermon.book}`}>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
                  More on {sermon.book} · {bookCount} sermons
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {prev ? (
                    <Link to={`/sermons/${prev.id}`} className="group rounded-md border border-stone-200 bg-white p-4 hover:border-teal-300">
                      <span className="flex items-center gap-1 text-xs font-semibold text-stone-500">
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {prev.r}
                      </span>
                      <span className="mt-1 block font-serif font-semibold text-navy-900 group-hover:text-teal-700">{prev.t}</span>
                    </Link>
                  ) : (
                    <span className="hidden sm:block" />
                  )}
                  {next && (
                    <Link to={`/sermons/${next.id}`} className="group rounded-md border border-stone-200 bg-white p-4 text-right hover:border-teal-300">
                      <span className="flex items-center justify-end gap-1 text-xs font-semibold text-stone-500">
                        {next.r} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="mt-1 block font-serif font-semibold text-navy-900 group-hover:text-teal-700">{next.t}</span>
                    </Link>
                  )}
                </div>
              </nav>
            )}
            <div className="flex flex-col gap-3 rounded-lg bg-teal-50 p-5 text-sm text-teal-900 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Leading a reading service? Use <strong className="mx-1">Print</strong> for a clean copy without the website around it.
              </p>
              <a
                href={sermon.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-teal-800 underline underline-offset-2"
              >
                Original page <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
