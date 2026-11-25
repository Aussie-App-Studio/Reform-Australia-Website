// Positions vacant: one file per vacancy in src/data/vacancies/ (added and edited in /admin).
// A vacancy shows on the site until the end of its closing date, then disappears by itself.

export interface Vacancy {
  id: string; // from the file name
  title: string;
  organisation: string;
  location?: string;
  hours?: string;
  closes: string; // YYYY-MM-DD
  closingTime?: string; // e.g. "5:00pm AEDT"
  summary: string;
  details?: string; // simple formatting: ## headings, - lists, **bold**, links
  howToApply?: string;
  contact?: { name?: string; email?: string; phone?: string };
  attachment?: { label?: string; file?: string };
  website?: string;
  needsChecking?: string[]; // for reviewers; not shown
}

const modules = import.meta.glob<Omit<Vacancy, 'id'>>('../data/vacancies/*.json', { eager: true, import: 'default' });

export const allVacancies: Vacancy[] = Object.entries(modules)
  .map(([file, v]) => ({ ...v, id: file.split('/').pop()!.replace(/\.json$/, '') }))
  .sort((a, b) => a.closes.localeCompare(b.closes));

/** Today's date in Sydney, as YYYY-MM-DD. */
function todayInAustralia(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/** Vacancies still open (closing today or later), soonest closing first. */
export function openVacancies(): Vacancy[] {
  const today = todayInAustralia();
  return allVacancies.filter((v) => !v.closes || v.closes >= today);
}

/** "Friday 29 January 2027" */
export function formatClosing(v: Vacancy): string {
  const [y, m, d] = v.closes.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return v.closingTime ? `${v.closingTime} ${date}` : date;
}
