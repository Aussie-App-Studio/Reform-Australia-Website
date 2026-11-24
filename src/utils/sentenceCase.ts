// House style is sentence case for headings and labels. Synced content (documents library,
// Safe Church, sermons) arrives in Title Case, so it is tidied when shown.

/** Names that keep their capitals. Longer names first. */
const PROPER = [
  'Three Forms of Unity', 'Heidelberg Catechism', 'Belgic Confession', 'Canons of Dort', 'Westminster',
  'Our World Belongs to God', 'Church Order', 'Acts of Synod', 'Synod', 'Safe Church Unit', 'Safe Church',
  'Kids Church', 'Working with Children Check', 'National Child Safe Standards', 'National Apology',
  "Lord's Supper", 'Lord’s Supper', "Lord's Day", 'Lord’s Day', 'Lord', 'God', 'Jesus', 'Christ', 'Holy Spirit', 'Spirit',
  'Scripture', 'Bible', 'Apostles', 'Nicene', 'Athanasian', 'Reformed', 'Australia', 'Australian', 'CRCA', 'Christian',
  'Old Testament', 'New Testament', 'Form of Subscription', 'Contemporary Testimony',
];
const PROPER_RE = new RegExp(`\\b(${PROPER.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
const PROPER_BY_LOWER = new Map(PROPER.map((p) => [p.toLowerCase(), p]));

/** "Children & Young People" -> "Children and young people"; keeps names and acronyms. */
export function sentenceCase(title: string): string {
  if (!title) return title;
  const words = title.replace(/\s&\s/g, ' and ').split(' ');
  const out = words
    .map((w, i) => {
      if (i === 0) return w;
      if (/^[A-Z0-9]{2,}s?$/.test(w.replace(/[^A-Za-z0-9]/g, ''))) return w; // acronyms: CRCA, SCU
      return w.toLowerCase();
    })
    .join(' ');
  return out.replace(PROPER_RE, (m) => PROPER_BY_LOWER.get(m.toLowerCase()) ?? m);
}

const MINOR = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into', 'of', 'on', 'or', 'the', 'to', 'with']);

/** For titles that are mostly names (sermon titles): "Elijah And Obadiah" -> "Elijah and Obadiah". */
export function lowerMinorWords(title: string): string {
  return title
    .split(' ')
    .map((w, i) => (i > 0 && MINOR.has(w.toLowerCase()) && /^[A-Z][a-z]*$/.test(w) ? w.toLowerCase() : w))
    .join(' ');
}
