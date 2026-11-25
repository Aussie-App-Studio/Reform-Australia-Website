import { MouseEvent, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.BASE_URL; // always ends with "/"
const FILE_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|png|jpe?g)(?:$|[?#])/i;

interface RichHtmlProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML produced by our own sync scripts (sanitised at sync time).
 * - `{{BASE}}` placeholders become the deployed base path.
 * - Clicks on in-site page links are handled by the router (no full reload).
 * - External links and documents open in a new tab, with a file-type badge.
 */
export function RichHtml({ html, className = '' }: RichHtmlProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const resolved = useMemo(() => html.replaceAll('{{BASE}}', BASE), [html]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    for (const a of Array.from(root.querySelectorAll('a[href]'))) {
      const href = a.getAttribute('href') ?? '';
      const fileMatch = href.match(FILE_RE);
      const isInternalPage = href.startsWith(BASE) && !fileMatch;
      if (fileMatch) a.setAttribute('data-file-type', fileMatch[1].replace('jpeg', 'jpg'));
      if (!isInternalPage && /^(https?:|\/)/.test(href)) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }, [resolved]);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href');
    if (!a || !href || a.getAttribute('target') === '_blank') return;
    if (href.startsWith(BASE) && !FILE_RE.test(href)) {
      e.preventDefault();
      navigate('/' + href.slice(BASE.length));
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`crca-reader-article crca-content ${className}`}
      dangerouslySetInnerHTML={{ __html: resolved }}
    />
  );
}
