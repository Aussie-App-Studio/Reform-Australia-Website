import { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { responsive } from '../utils/responsiveImage';

/**
 * Shows text written in the /admin editor (Markdown), safely: no HTML is ever used.
 *   paragraphs, "## " and "### " headings, "- " and "1. " lists, "> " quotes, photos,
 *   **bold**, *italic*, [link text](address); web and email addresses become links.
 */
export function SimpleText({ text, className = '' }: { text?: string; className?: string }) {
  if (!text?.trim()) return null;
  return (
    <div className={`space-y-4 text-[1.06rem] leading-relaxed text-stone-700 ${className}`}>
      {blocks(text).map((b, i) => {
        if (b.kind === 'photo') return <Photo key={i} alt={b.lines[0]} src={b.lines[1]} />;
        if (b.kind === 'h2')
          return (
            <h3 key={i} className="pt-3 font-serif text-xl font-semibold text-navy-900">
              {inline(b.lines[0])}
            </h3>
          );
        if (b.kind === 'h3')
          return (
            <h4 key={i} className="pt-2 font-serif text-lg font-semibold text-navy-900">
              {inline(b.lines[0])}
            </h4>
          );
        if (b.kind === 'ul')
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-teal-600">
              {b.lines.map((l, j) => (
                <li key={j}>{inline(l)}</li>
              ))}
            </ul>
          );
        if (b.kind === 'ol')
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-navy-900">
              {b.lines.map((l, j) => (
                <li key={j}>{inline(l)}</li>
              ))}
            </ol>
          );
        if (b.kind === 'quote')
          return (
            <blockquote key={i} className="border-l-4 border-teal-500 pl-5 text-navy-900">
              {withBreaks(b.lines)}
            </blockquote>
          );
        return <p key={i}>{withBreaks(b.lines)}</p>;
      })}
    </div>
  );
}

type Kind = 'p' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'photo';
interface Block {
  kind: Kind;
  lines: string[];
}

const PHOTO = /^!\[([^\]]*)\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)$/;

function blocks(text: string): Block[] {
  const out: Block[] = [];
  let open = false; // can the next line join the last block?
  const add = (kind: Kind, line: string) => {
    const last = out[out.length - 1];
    if (last?.kind === kind && (open || kind === 'ul' || kind === 'ol')) last.lines.push(line);
    else out.push({ kind, lines: [line] });
    open = true;
  };
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if (!line) open = false;
    else if ((m = line.match(PHOTO))) {
      out.push({ kind: 'photo', lines: [m[1], m[2]] });
      open = false;
    } else if ((m = line.match(/^(#{1,6})\s+(.+)$/))) {
      out.push({ kind: m[1].length <= 2 ? 'h2' : 'h3', lines: [m[2]] });
      open = false;
    } else if ((m = line.match(/^[-*+•]\s+(.+)$/))) add('ul', m[1]);
    else if ((m = line.match(/^\d{1,3}[.)]\s+(.+)$/))) add('ol', m[1]);
    else if ((m = line.match(/^>\s?(.*)$/))) add('quote', m[1]);
    else add('p', line.replace(/\\$/, ''));
  }
  return out;
}

/** Addresses on this site work wherever the site is published. */
const onSite = (url: string) => (url.startsWith('/') && !url.startsWith('//') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url);

function Photo({ src, alt }: { src: string; alt: string }) {
  const url = onSite(src);
  return <img src={url} {...responsive(url, '(min-width: 1024px) 720px, 100vw')} alt={alt} loading="lazy" decoding="async" className="w-full rounded-md bg-stone-200" />;
}

const withBreaks = (lines: string[]) => lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>);

const TOKEN =
  /\\([\\`*_{}[\]()#+\-.!>~|])|\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*([^*\s](?:[^*]*[^*\s])?)\*|(?<![\w])_([^_\s](?:[^_]*[^_\s])?)_(?![\w])|\[([^\]]+)\]\(<?(https?:\/\/[^)\s>]+|mailto:[^)\s>]+|tel:[^)\s>]+|\/[^)\s>]*)>?(?:\s+"[^"]*")?\)|<?(https?:\/\/[^\s<>]+[^\s<>.,;:!?)])>?|<?([\w.+-]+@[\w-]+(?:\.[\w-]+)+)>?/g;

const LINK = 'font-semibold text-teal-700 underline underline-offset-2 hover:text-navy-900';

function TextLink({ url, children }: { url: string; children: ReactNode }) {
  if (/^\/(?!\/)/.test(url) && !/\.\w{2,5}$/.test(url)) return <Link to={url} className={LINK}>{children}</Link>;
  const newTab = /^https?:/.test(url) || url.startsWith('/');
  return (
    <a href={onSite(url)} className={LINK} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    const k = m.index;
    if (k > last) out.push(s.slice(last, k));
    if (m[1]) out.push(m[1]);
    else if (m[2]) out.push(<strong key={k} className="font-semibold text-navy-900"><em>{inline(m[2])}</em></strong>);
    else if (m[3]) out.push(<strong key={k} className="font-semibold text-navy-900">{inline(m[3])}</strong>);
    else if (m[4] || m[5]) out.push(<em key={k}>{inline(m[4] ?? m[5])}</em>);
    else if (m[6]) out.push(<TextLink key={k} url={m[7]}>{inline(m[6])}</TextLink>);
    else if (m[8]) out.push(<TextLink key={k} url={m[8]}>{m[8].replace(/^https?:\/\/(www\.)?/, '')}</TextLink>);
    else if (m[9]) out.push(<TextLink key={k} url={`mailto:${m[9]}`}>{m[9]}</TextLink>);
    last = k + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
