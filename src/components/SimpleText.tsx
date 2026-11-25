import { Fragment, ReactNode } from 'react';

/**
 * Shows text typed in /admin with simple formatting, safely (no HTML):
 *   a blank line starts a new paragraph; "## " a heading; "- " a bullet;
 *   **bold**; [link text](https://…); web and email addresses become links.
 */
export function SimpleText({ text, className = '' }: { text?: string; className?: string }) {
  if (!text?.trim()) return null;
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
  return (
    <div className={`space-y-4 text-[1.06rem] leading-relaxed text-stone-700 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (!lines.length) return null;
        if (/^#{2,3}\s/.test(lines[0]) && lines.length === 1) {
          return (
            <h3 key={i} className="pt-2 font-serif text-xl font-semibold text-navy-900">
              {inline(lines[0].replace(/^#{2,3}\s+/, ''))}
            </h3>
          );
        }
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6 marker:text-stone-400">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </div>
  );
}

const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)|(https?:\/\/[^\s<]+[^\s<.,;:!?)])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last) out.push(s.slice(last, m.index));
    const link = 'font-semibold text-teal-700 underline underline-offset-2 hover:text-navy-900';
    if (m[1]) out.push(<strong key={m.index} className="font-semibold text-navy-900">{m[1]}</strong>);
    else if (m[2]) out.push(<a key={m.index} href={m[3]} className={link} {...(/^https?:/.test(m[3]) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[2]}</a>);
    else if (m[4]) out.push(<a key={m.index} href={m[4]} className={link} target="_blank" rel="noopener noreferrer">{m[4].replace(/^https?:\/\/(www\.)?/, '')}</a>);
    else if (m[5]) out.push(<a key={m.index} href={`mailto:${m[5]}`} className={link}>{m[5]}</a>);
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
