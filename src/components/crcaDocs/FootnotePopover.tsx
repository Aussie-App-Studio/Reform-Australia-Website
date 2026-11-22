import { useMemo, useRef } from 'react';
import { ArrowDown, X } from 'lucide-react';
import { linkifyScriptureHtml } from '../../lib/crcaDocs/features';
import type { ParsedFootnote } from '../../lib/crcaDocs/types';
import { useFocusTrap } from '../../utils/useFocusTrap';

interface FootnotePopoverProps {
  footnote: ParsedFootnote;
  bibleVersion: string;
  onClose: () => void;
  onJumpToBottom: (footnoteId: string) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function FootnotePopover({
  footnote,
  bibleVersion,
  onClose,
  onJumpToBottom,
}: FootnotePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  useFocusTrap(popoverRef, true, { restoreFocus: false });

  const linkifiedHtml = useMemo(
    () => linkifyScriptureHtml(escapeHtml(footnote.text), bibleVersion),
    [footnote.text, bibleVersion]
  );

  return (
    <div
      ref={popoverRef}
      tabIndex={-1}
      role="dialog"
      aria-label={`Footnote ${footnote.listLabel}`}
      className="no-print fixed bottom-4 right-4 z-50 w-[min(92vw,26rem)] rounded-2xl border border-stone-300 bg-white p-4 shadow-2xl ring-1 ring-navy-900/10 focus:outline-none"
    >
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Footnote {footnote.listLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close footnote"
          className="rounded-md p-1 text-stone-600 hover:bg-stone-100 hover:text-navy-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="fn-popover-body mt-3 text-sm leading-relaxed text-navy-900"
        dangerouslySetInnerHTML={{ __html: linkifiedHtml }}
      />

      <div className="mt-3 flex justify-end border-t border-stone-100 pt-2.5">
        <button
          type="button"
          onClick={() => onJumpToBottom(footnote.id)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-teal-50 hover:text-teal-700"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          <span>Jump to footnote list</span>
        </button>
      </div>
    </div>
  );
}
