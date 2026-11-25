#!/usr/bin/env node
// Builds the sermon topics and the full-text word index from public/data/sermons/s/*.json.
//   npm run build:sermon-topics   (also run at the end of npm run sync-sermons)
//
// Output (numbers are positions in index.json's `sermons` list):
//   public/data/sermons/topics.json       topics, best matches first
//   public/data/sermons/words/<xx>.json   word -> sermons using it twice or more, by first two letters
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/data/sermons');
const index = JSON.parse(readFileSync(path.join(DIR, 'index.json'), 'utf8'));

// `title`: in the title or series. `text`: words counted through the sermon. `passage`: the sermon's Bible reference.
// `titleOnly` topics (occasions) are never guessed from the text alone.
const GROUPS = [
  {
    id: 'year',
    label: 'Church year and occasions',
    titleOnly: true,
    topics: [
      { id: 'advent-christmas', label: 'Advent and Christmas', title: /christmas|advent|bethlehem|manger|nativity|magi\b|wise men|immanuel|incarnation|virgin birth|birth of (jesus|christ)/, passage: /^(luke 2:(1|[4-9]|1\d|20)\b|matthew 1:(18|2\d)|matthew 2:(1|2|9|10|11)\b|isaiah 9:[1267]\b|micah 5:[1-5]\b|luke 1:(26|3\d|4\d|5\d)\b)/ },
      { id: 'new-year', label: 'Old Year and New Year', title: /new year|old year|year'?s end|end of the year/ },
      { id: 'good-friday', label: 'Good Friday and the suffering of Christ', title: /good friday|calvary|golgotha|crucif|passion of|gethsemane|lenten|\blent\b|on the cross|palm sunday/, passage: /^(matthew 27:|mark 15:|luke 23:(2[6-9]|[34]\d)|john 19:(1[6-9]|[23]\d)|isaiah 53)/ },
      { id: 'easter', label: 'Easter', title: /easter|empty tomb|he is risen|christ is risen|risen (lord|christ|saviour|jesus)|resurrection of (jesus|christ|our lord)/, passage: /^(matthew 28:([1-9]|10)\b|mark 16:|luke 24:([1-9]|[1-4]\d)(?!\d)|john 20:|1 ?corinthians 15:)/ },
      { id: 'ascension', label: 'Ascension', title: /ascension|ascended|ascends|right hand of god/, passage: /^(acts 1:([6-9]|1[01])\b|luke 24:50)/ },
      { id: 'pentecost', label: 'Pentecost', title: /pentecost|outpouring/, passage: /^(acts 2:|joel 2:2[89])/ },
      { id: 'reformation', label: 'Reformation Day', title: /reformation\b|\bluther\b|sola scriptura|reformers?\b/ },
      { id: 'lords-supper', label: 'The Lord’s Supper', title: /lord'?s supper|communion\b|lord'?s table|passover/, passage: /^(1 ?corinthians 11:(17|2\d|3\d))/, ld: [28, 29, 30] },
      { id: 'baptism', label: 'Baptism', title: /bapti[sz]/, ld: [26, 27] },
      { id: 'office-bearers', label: 'Elders, deacons and ministers', title: /elders (and|&) deacons|\bdeacons?\b|office-?bearers?|ordination|overseers?/, passage: /^(1 ?timothy 3:|titus 1:[5-9]|acts 20:28|1 ?peter 5:[1-4](?!\d))/ },
    ],
  },
  {
    id: 'god',
    label: 'God and the gospel',
    topics: [
      { id: 'grace', label: 'Grace', title: /\bgrace\b/, text: /\bgrace\b/g },
      { id: 'cross', label: 'The cross', title: /\bcross\b|atone|redemption|redeemed|ransom/, text: /\b(the cross|atone\w*|ransom)\b/g },
      { id: 'forgiveness', label: 'Forgiveness', title: /forgiv/, text: /\bforgiv\w*/g },
      { id: 'justification', label: 'Being right with God', title: /justif|righteous by faith|right with god/, text: /\bjustif(y|ied|ication|ies)\b/g },
      { id: 'holy-spirit', label: 'The Holy Spirit', title: /holy spirit|spirit of god|fruit of the spirit|\bspirit'?s\b/, text: /\bholy spirit\b/g },
      { id: 'covenant', label: 'God’s covenant', title: /covenant/, text: /\bcovenant\w*/g },
      { id: 'providence', label: 'God’s care and control', title: /providence|sovereign/, text: /\b(providence|providential\w*|sovereign\w*)\b/g },
      { id: 'creation', label: 'Creation', title: /creation\b|creator|in the beginning/, text: /\b(creation|creator)\b/g },
      { id: 'return', label: 'Christ’s return', title: /return of (christ|jesus|the lord)|second coming|last days|judgement day|judgment day|day of the lord/, text: /\b(second coming|return of (christ|jesus|the lord)|judge?ment day|when (christ|jesus) returns)\b/g, few: true },
      { id: 'heaven', label: 'Heaven and the new creation', title: /heaven\b|new creation|new earth|new jerusalem|eternal life/, text: /\b(new creation|new earth|new jerusalem|eternal life)\b/g },
    ],
  },
  {
    id: 'life',
    label: 'The Christian life',
    topics: [
      { id: 'faith', label: 'Faith and trust', title: /\bfaith\b|\btrust(ing)?\b|believing/, text: /\b(trust(s|ed|ing)? in|by faith|saving faith)\b/g },
      { id: 'repentance', label: 'Repentance', title: /repent|conversion|turn back/, text: /\brepent\w*/g },
      { id: 'prayer', label: 'Prayer', title: /\bpray(er|ers|ing)?\b/, text: /\b(pray|prayer|prayers|praying|prayed)\b/g, dense: 2 },
      { id: 'assurance', label: 'Assurance', title: /assur|certainty|perseverance|security of/, text: /\b(assurance|assured)\b/g, few: true },
      { id: 'temptation', label: 'Sin and temptation', title: /tempt|\bsin\b|sinful/, text: /\btempt(ation|ations|ed|er|s)?\b/g },
      { id: 'holiness', label: 'Holy living', title: /holiness|\bholy (living|life)|sanctif|godliness/, text: /\b(holiness|sanctif\w*|godliness)\b/g },
      { id: 'love', label: 'Love for others', title: /\blove (one another|your|for|is)\b|neighbou?r/, text: /\b(love one another|love your neighbou?r|neighbou?rs?)\b/g },
      { id: 'wisdom', label: 'Wisdom', title: /\bwis(dom|e)\b/, text: /\bwisdom\b/g },
      { id: 'thankfulness', label: 'Thankfulness and joy', title: /thankful|gratitude|\bjoy(ful)?\b|rejoic|contentment/, text: /\b(thankful\w*|gratitude|joy|rejoic\w*)\b/g },
      { id: 'spiritual-battle', label: 'Spiritual battle', title: /armou?r of god|satan|\bdevil|spiritual (war|battle|conflict)/, text: /\b(satan|devil|armou?r of god)\b/g, dense: 2 },
    ],
  },
  {
    id: 'hard',
    label: 'Hard times',
    topics: [
      { id: 'suffering', label: 'Suffering', title: /suffer|\btrials?\b|affliction|adversity|\bpain\b/, text: /\b(suffer\w*|affliction\w*|adversity)\b/g },
      { id: 'grief', label: 'Death, grief and comfort', title: /grief|griev|mourn|funeral|comfort|\bdeath\b|dying/, text: /\b(grief|griev\w*|mourn\w*|bereave\w*|funeral)\b/g, few: true },
      { id: 'anxiety', label: 'Worry and fear', title: /anxi|worry|worri|\bfear not\b|afraid|do not fear|\bpeace of god/, text: /\b(anxi\w*|worry|worries|worried|worrying)\b/g, few: true },
      { id: 'discouragement', label: 'Discouragement and doubt', title: /discourag|despair|\bdoubt|depress|downcast|lament/, text: /\b(discourag\w*|despair\w*|doubts?|depress\w*|downcast)\b/g, few: true },
      { id: 'persecution', label: 'Persecution', title: /persecut/, text: /\bpersecut\w*/g },
    ],
  },
  {
    id: 'together',
    label: 'Church, family and world',
    topics: [
      { id: 'church', label: 'The church', title: /\bchurch\b|body of christ|fellowship of|communion of saints/, text: /\b(body of christ|communion of saints|local church)\b/g, few: true },
      { id: 'worship', label: 'Worship', title: /worship/, text: /\bworship\w*/g },
      { id: 'sunday', label: 'The Lord’s Day and rest', title: /sabbath|day of rest|lord's day worship/, text: /\bsabbath\b/g, ld: [38] },
      { id: 'mission', label: 'Mission and evangelism', title: /\bmission(ary|aries)?\b|evangeli|witness|great commission/, text: /\b(missionar\w*|evangeli[sz]\w*|great commission|witness(es|ing)?)\b/g },
      { id: 'marriage', label: 'Marriage', title: /marriage|husband|wives|\bwife\b|wedding|divorce/, text: /\b(marriage|husbands?|wives)\b/g, dense: 2.5 },
      { id: 'family', label: 'Parents and children', title: /parent|children\b|famil(y|ies)\b|father(s|hood)\b|mothers?\b|youth\b/, text: /\b(parents?|parenting|families)\b/g, dense: 2 },
      { id: 'money', label: 'Money and giving', title: /money|\bgiving\b|riches|wealth|generos|steward|tithe|\bgreed/, text: /\b(money|wealth|riches|generous|generosity|stewardship|tith\w*)\b/g, dense: 2 },
      { id: 'work', label: 'Work', title: /(view of|honouring|daily) work|working (for|and)|vocation|workplace/, text: /\b(workplace|vocation|employer|employees?|daily work)\b/g, few: true },
      { id: 'justice', label: 'Justice and mercy', title: /justice|mercy|\bpoor\b|compassion|oppress/, text: /\b(justice|oppress\w*|the poor|compassion)\b/g },
    ],
  },
];

const plain = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&(rsquo|lsquo|#8217|#8216|#39);/g, "'")
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[’‘]/g, "'")
    .toLowerCase();

const sermons = index.sermons.map((s) => ({
  s,
  text: plain(JSON.parse(readFileSync(path.join(DIR, 's', `${s.id}.json`), 'utf8')).html),
  title: plain([s.t, s.s].filter(Boolean).join(' | ')),
  passages: (s.r ?? '').toLowerCase().split(/\s*[;&+]\s*/),
}));

const groups = GROUPS.map((g) => ({
  id: g.id,
  label: g.label,
  topics: g.topics.map((t) => {
    const hits = [];
    sermons.forEach((x, i) => {
      let score = 0;
      if (t.title.test(x.title)) score += 20;
      if (t.ld?.includes(x.s.ld)) score += 15;
      if (t.passage && x.passages.some((p) => t.passage.test(p))) score += 12;
      if (t.text && !g.titleOnly) {
        const n = (x.text.match(t.text) ?? []).length;
        const density = n / Math.max(1, (x.s.w || 2500) / 1000);
        const min = t.few ? 5 : 8;
        // A main subject of the sermon, not a passing mention.
        if (n >= min && density >= (t.few ? 1.5 : t.dense ?? 2) * 1.5) score += Math.min(19, density * 2);
        else if (score) score += Math.min(5, density);
      }
      if (score) hits.push({ i, score });
    });
    hits.sort((a, b) => b.score - a.score || a.i - b.i);
    return { id: t.id, label: t.label, sermons: hits.map((h) => h.i) };
  }),
}));
writeFileSync(path.join(DIR, 'topics.json'), JSON.stringify({ syncedAt: index.syncedAt, groups }));

// ---- Full-text words ----
const words = new Map();
sermons.forEach((x, i) => {
  const counts = new Map();
  for (const w of x.text.match(/[a-z]{3,24}/g) ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
  for (const [w, n] of counts) {
    if (n < 2) continue;
    if (!words.has(w)) words.set(w, []);
    words.get(w).push([i, n]);
  }
});
const shards = new Map();
for (const [w, list] of words) {
  if (list.length > sermons.length * 0.6) continue; // "the", "god": in nearly every sermon
  const k = w.slice(0, 2);
  if (!shards.has(k)) shards.set(k, {});
  shards.get(k)[w] = list.sort((a, b) => b[1] - a[1]).map(([i]) => i);
}
const WORDS = path.join(DIR, 'words');
if (existsSync(WORDS)) rmSync(WORDS, { recursive: true });
mkdirSync(WORDS);
let bytes = 0;
let biggest = 0;
for (const [k, v] of shards) {
  const out = JSON.stringify({ syncedAt: index.syncedAt, words: v });
  bytes += out.length;
  biggest = Math.max(biggest, out.length);
  writeFileSync(path.join(WORDS, `${k}.json`), out);
}
for (const g of groups) console.log(`${g.label}: ${g.topics.map((t) => `${t.label} ${t.sermons.length}`).join(', ')}`);
console.log(`Word index: ${shards.size} files, ${(bytes / 1e6).toFixed(1)} MB, largest ${(biggest / 1e3).toFixed(0)} KB`);
if (process.argv.includes('--sample')) {
  for (const g of groups) for (const t of g.topics) console.log(`\n${t.label}:`, [...t.sermons.slice(0, 3), ...t.sermons.slice(-4)].map((i) => `${index.sermons[i].t} (${index.sermons[i].r})`).join(' | '));
}
