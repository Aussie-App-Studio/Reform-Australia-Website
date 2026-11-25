import { useEffect, useId, useRef, useState } from 'react';

/** A small "i" in the corner of a photo. Click, tap or press Enter to show who took it. Put inside a `relative` box. */
export function PhotoCredit({ credit, url }: { credit: string; url?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={box} className="absolute bottom-0 right-0 flex max-w-full flex-col items-end">
      {open && (
        <p id={id} className="mx-2 max-w-72 rounded-md bg-white px-3 py-2 text-sm leading-snug text-navy-900 shadow-lg">
          Photo:{' '}
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              {credit}
            </a>
          ) : (
            credit
          )}
        </p>
      )}
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label="Photo credit"
        className="group flex h-11 w-11 items-center justify-center"
      >
        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-950/70 font-serif text-sm italic text-white group-hover:bg-navy-950">
          i
        </span>
      </button>
    </div>
  );
}
