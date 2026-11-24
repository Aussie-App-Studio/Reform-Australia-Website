#!/usr/bin/env node
// Pulls the full Word of Salvation reading-sermon archive
// (wordofsalvation.crca.org.au) into public/sermons/ as static JSON.
//
//   npm run sync-sermons
//
// Output:
//   public/sermons/index.json      compact catalogue used for browse + search
//   public/sermons/s/<slug>.json   one file per sermon (loaded on demand)
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanHtml, decodeEntities, fetchAllWp, htmlToText } from './lib/wp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'sermons');
const ITEM_DIR = path.join(OUT_DIR, 's');
const HOST = 'wordofsalvation.crca.org.au';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

// Canonical Bible order so the browse view lists books the way a Bible does.
const BIBLE_ORDER = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
  'Heidelberg Catechism', 'Belgic Confession', 'Canons of Dort', 'Westminster Confession of Faith',
];

const RE = {
  issue: /^word of salvation\s*[–—-]\s*(.+)$/i,
  sermonBy: /\b(?:a\s+)?(?:sermon|message)\s+by\s*:?\s*(.+?)(?:\s+on\s+(.+))?$/i,
  byLine: /^(?:by\s+)?(rev(?:erend)?\.?\s+.{3,60}|pastor\s+.{3,50}|dr\.?\s+.{3,50})$/i,
  passage: /^(?:passage|text|sermon text|scripture text)\s*:?\s*(.+)$/i,
  on: /^on\s+(.+)$/i,
  readings: /^(?:scripture\s+|bible\s+)?readings?\s*:?\s*(.*)$/i,
  series: /^(?:series|sermon series)\s*:\s*(.+)$/i,
  seriesInline: /\(?(?:sermon\s+\d+\s+in\s+a\s+series\s+on|first in a sermon series:|in a sermon series:)\s*(.+?)\)?$/i,
  meta: /^(title|theme|purpose|suggested hymns|singing|psalter hymnal|hymns?|songs?|sermon|message)\s*:/i,
};

// Known misspellings in the source data -> correct surname.
const SURNAME_FIXES = { ziodema: 'Zuidema', voowinde: 'Voorwinde', 'ni jhuis': 'Nijhuis' };
const DEGREE = /\b(b\.?\s?d|b\.?\s?a|b\.?\s?re|m\.?\s?a|m\.?\s?th|m\.?\s?sc|th\.?\s?grad|th\.?\s?m|m\.?\s?div|ph\.?\s?d|v\.?\s?d\.?\s?m)\b\.?/gi;

/** Returns { name, rest } where rest is anything after the name (often a passage). */
function cleanPreacher(raw) {
  let s = raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(the|by)\s+/i, '')
    .replace(/^rev(?:erend|['’]?d)?\.?\s*(?:by\s+)?/i, 'Rev. ');
  let rest = '';
  const on = s.match(/^(.*?)(?:\s+on:?\s+|on\s+(?=lord.s day))(.*)$/i);
  if (on) {
    s = on[1];
    rest = on[2];
  }
  s = s.split(/\s*[,(–—]\s*|\s+-\s+/)[0]; // locations, degrees in brackets, "– 5 of 5"
  const scripture = s.match(/^(.*?)\s+((?:\d\s?)?[A-Z][a-z]+\.?\s?\d.*|lord.s day.*)$/i);
  if (scripture && /\d/.test(scripture[2])) {
    s = scripture[1];
    rest ||= scripture[2];
  }
  s = s.replace(DEGREE, '').replace(/\s+on$/i, '').replace(/[.,;:)\s]+$/, '').replace(/\s+/g, ' ').trim();
  for (const [bad, good] of Object.entries(SURNAME_FIXES)) s = s.replace(new RegExp(bad, 'i'), good);
  s = s.replace(/^(rev(?:erend)?)\.?\s*/i, 'Rev. ').replace(/([A-Z])\.([A-Z])/g, '$1. $2').trim();
  if (/^(rev\.)?$/i.test(s)) s = '';
  return { name: s, rest: rest.trim() };
}

/** Grouping key so "Rev. J. Zuidema" and "Rev John Zuidema" filter together. */
function preacherKey(name) {
  const parts = name
    .replace(/^((rev|pastor|dr|prof)\.?\s+)+/i, '')
    .replace(/\./g, '. ')
    .split(/\s+/)
    .filter(Boolean);
  const firstInitial = parts[0]?.[0]?.toLowerCase() ?? '';
  let i = parts.length - 1;
  while (i > 1 && /^(van|de|der|den|ten|ter|vander|von)$/i.test(parts[i - 1])) i--;
  const surname = parts.slice(i).join('').toLowerCase();
  return parts.length > 1 ? `${firstInitial}-${surname}` : surname;
}

function parseHeader(lines, wpTitle) {
  const meta = {};
  for (let i = 0; i < Math.min(lines.length, 14); i++) {
    const l = lines[i];
    let m;
    if (!meta.issue && (m = l.match(RE.issue))) meta.issue = m[1].trim();
    else if (!meta.preacher && (m = l.match(RE.sermonBy))) {
      const c = cleanPreacher(m[2] ? `${m[1]} on ${m[2]}` : m[1]);
      if (c.name) meta.preacher = c.name;
      if (c.rest) meta.passage ??= c.rest;
    } else if (!meta.preacher && l.length < 70 && (m = l.match(RE.byLine))) {
      const c = cleanPreacher(m[1]);
      if (c.name) meta.preacher = c.name;
      if (c.rest) meta.passage ??= c.rest;
    }
    else if ((m = l.match(RE.passage))) meta.passage ??= m[1].trim();
    else if ((m = l.match(RE.on)) && l.length < 80) meta.passage ??= m[1].trim();
    else if ((m = l.match(RE.series))) meta.series ??= m[1].trim();
    else if ((m = l.match(RE.seriesInline))) meta.series ??= m[1].trim();
    else if ((m = l.match(RE.readings))) {
      let r = m[1].trim();
      if (!r && lines[i + 1] && lines[i + 1].length < 120) r = lines[i + 1];
      meta.readings ??= r.replace(/\s*\(with .*$/i, '').replace(/;\s*$/, '');
      const ld = l.match(/(?:HCLD|LD|lord.s day)\s*(\d+)/i);
      if (ld) meta.lordsDay ??= Number(ld[1]);
    }
  }
  const ld = wpTitle.match(/lord.s day\s*(\d+)/i);
  if (ld) meta.lordsDay = Number(ld[1]);
  if (meta.passage) meta.passage = meta.passage.replace(/[|.;]+$/, '').replace(/^\(|\)$/g, '').trim();
  if (meta.preacher && meta.preacher.length > 60) delete meta.preacher;
  return meta;
}

function parseIssue(issue) {
  if (!issue) return {};
  const y = issue.match(/\b(19[5-9]\d|20[0-3]\d)\b/);
  const mIdx = MONTHS.findIndex((m) => issue.toLowerCase().includes(m));
  return { year: y ? Number(y[1]) : undefined, month: mIdx >= 0 ? mIdx + 1 : undefined };
}

/** Remove the leading header paragraphs that are now shown in the page header. */
function stripHeaderBlocks(html, title) {
  const blocks = html.match(/<(p|h[1-4])>[\s\S]*?<\/\1>|<(ul|ol|blockquote|table)>[\s\S]*?<\/\3>/g) ?? [];
  let cut = 0;
  let consumed = 0;
  for (const b of blocks.slice(0, 12)) {
    const t = htmlToText(b).replace(/\s+/g, ' ').trim();
    const isHeader =
      !t ||
      RE.issue.test(t) ||
      RE.sermonBy.test(t) ||
      (t.length < 70 && RE.byLine.test(t)) ||
      RE.passage.test(t) ||
      (RE.on.test(t) && t.length < 80) ||
      RE.series.test(t) ||
      RE.seriesInline.test(t) ||
      (RE.readings.test(t) && t.length < 160) ||
      t.toLowerCase().replace(/[“”"]/g, '').replace(/^(title|sermon|message)\s*:\s*/, '') === title.toLowerCase();
    if (!isHeader) break;
    const at = html.indexOf(b, consumed);
    if (at < 0) break;
    consumed = at + b.length;
    cut = consumed;
  }
  return html.slice(cut).trim();
}

function splitTitle(wpTitle) {
  const t = decodeEntities(wpTitle).trim();
  const m = t.match(/^(.{1,40}?)\s+[–—-]\s+(.+)$/);
  return m ? { ref: m[1].trim(), title: m[2].trim() } : { ref: '', title: t };
}

async function main() {
  console.log(`Syncing Word of Salvation sermons from ${HOST}`);
  const categories = await fetchAllWp(HOST, 'categories', { fields: 'id,name,parent,count' });
  const posts = await fetchAllWp(HOST, 'posts', { fields: 'id,slug,date,modified,title,content,categories,link,status' });

  const catById = new Map(categories.map((c) => [c.id, { ...c, name: decodeEntities(c.name) }]));
  const groupOf = (cat) => {
    const p = catById.get(cat.parent);
    if (!p) return null;
    if (/old testament/i.test(p.name)) return 'ot';
    if (/new testament/i.test(p.name)) return 'nt';
    if (/confession/i.test(p.name)) return 'conf';
    return null;
  };

  await rm(ITEM_DIR, { recursive: true, force: true });
  await mkdir(ITEM_DIR, { recursive: true });

  const index = [];
  const preacherNames = new Map(); // key -> {name -> count}
  let n = 0;
  for (const p of posts.filter((x) => x.status === 'publish')) {
    const { ref, title } = splitTitle(p.title.rendered);
    const rawHtml = cleanHtml(p.content.rendered);
    const lines = htmlToText(rawHtml).split('\n');
    const meta = parseHeader(lines, decodeEntities(p.title.rendered));
    const { year, month } = parseIssue(meta.issue);
    // A sermon can sit in several categories (e.g. a Bible book and a confession).
    const bookCats = p.categories.map((id) => catById.get(id)).filter((c) => c && groupOf(c));
    const bookCat =
      (meta.lordsDay && bookCats.find((c) => /heidelberg/i.test(c.name))) ||
      bookCats.find((c) => groupOf(c) !== 'conf') ||
      bookCats[0];
    const book = bookCat?.name ?? null;
    const group = bookCat ? groupOf(bookCat) : null;
    const allBooks = [...new Set(bookCats.map((c) => c.name))];
    const html = stripHeaderBlocks(rawHtml, title);
    const bodyText = htmlToText(html);
    const words = bodyText.split(/\s+/).length;

    if (meta.preacher) {
      const k = preacherKey(meta.preacher);
      const names = preacherNames.get(k) ?? new Map();
      names.set(meta.preacher, (names.get(meta.preacher) ?? 0) + 1);
      preacherNames.set(k, names);
    }

    const id = p.slug.replace(/[^a-z0-9-]/gi, '').slice(0, 120) || String(p.id);
    const record = {
      id,
      title,
      ref,
      book,
      group,
      preacher: meta.preacher ?? null,
      passage: meta.passage ?? null,
      readings: meta.readings ?? null,
      series: meta.series ?? null,
      lordsDay: meta.lordsDay ?? null,
      issue: meta.issue ?? null,
      year: year ?? Number(p.date.slice(0, 4)),
      month: month ?? null,
      words,
      sourceUrl: p.link,
      html,
    };
    await writeFile(path.join(ITEM_DIR, `${id}.json`), JSON.stringify(record));

    index.push({
      id,
      t: title,
      b: book,
      g: group,
      // every book / confession this sermon is filed under (b first)
      bs: allBooks.length > 1 ? [book, ...allBooks.filter((x) => x !== book)] : undefined,
      p: meta.preacher ? preacherKey(meta.preacher) : null,
      r: meta.passage ?? ref ?? null,
      s: meta.series ?? null,
      ld: meta.lordsDay ?? null,
      y: record.year,
      m: record.month,
      w: words,
      x: bodyText.replace(/\s+/g, ' ').slice(0, 150),
      // added for ordering: when it was added to the online archive
      a: p.date.slice(0, 10),
    });
    if (++n % 200 === 0) process.stdout.write(`\r  processed ${n}`);
  }
  process.stdout.write(`\r  processed ${n}\n`);

  // Pick the most common spelling as the display name for each preacher.
  const preachers = {};
  for (const [k, names] of preacherNames) {
    const best = [...names.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0][0];
    preachers[k] = best;
  }

  const books = BIBLE_ORDER.map((name) => {
    const items = index.filter((s) => (s.bs ?? [s.b]).includes(name));
    const group = groupOf(categories.find((c) => decodeEntities(c.name) === name) ?? {});
    return items.length ? { name, group, count: items.length } : null;
  }).filter(Boolean);
  const unknownBooks = [...new Set(index.map((s) => s.b).filter((b) => b && !BIBLE_ORDER.includes(b)))];
  if (unknownBooks.length) console.warn('Books missing from BIBLE_ORDER:', unknownBooks);

  index.sort((a, b) => b.y - a.y || (b.m ?? 0) - (a.m ?? 0) || b.a.localeCompare(a.a));

  await writeFile(
    path.join(OUT_DIR, 'index.json'),
    JSON.stringify({ source: `https://${HOST}/`, syncedAt: new Date().toISOString(), books, preachers, sermons: index })
  );

  const withPreacher = index.filter((s) => s.p).length;
  const withPassage = index.filter((s) => s.r).length;
  console.log(`Wrote ${index.length} sermons (${withPreacher} with preacher, ${withPassage} with passage, ${Object.keys(preachers).length} preachers).`);
  const files = await readdir(ITEM_DIR);
  if (files.length !== index.length) console.warn(`Duplicate slugs: ${index.length - files.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
