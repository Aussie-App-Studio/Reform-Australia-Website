#!/usr/bin/env node
// After `vite build`: takes hidden preachers' sermons (src/data/sermonSettings.json) out of dist/,
// including the topics, full-text search and the sermon files themselves.
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/routes.mjs';
import { PREACHER_FIXES, publishedSermons } from './lib/sermons.mjs';

const DIR = path.join(ROOT, 'dist/data/sermons');
const read = (f) => JSON.parse(readFileSync(path.join(DIR, f), 'utf8'));
const write = (f, v) => writeFileSync(path.join(DIR, f), JSON.stringify(v));
const { index, hidden, keep, sermons } = publishedSermons();

// Topics and words point at positions in the list, so the positions are worked out again.
let n = 0;
const position = keep.map((k) => (k ? n++ : -1));
const remap = (list) => list.map((i) => position[i]).filter((i) => i >= 0);

const topics = read('topics.json');
for (const g of topics.groups) {
  for (const t of g.topics) t.sermons = remap(t.sermons);
  g.topics = g.topics.filter((t) => t.sermons.length);
}
write('topics.json', topics);

for (const f of readdirSync(path.join(DIR, 'words'))) {
  const file = read(`words/${f}`);
  for (const [w, list] of Object.entries(file.words)) {
    const left = remap(list);
    if (left.length) file.words[w] = left;
    else delete file.words[w];
  }
  write(`words/${f}`, file);
}

index.sermons.forEach((s, i) => {
  const f = `s/${s.id}.json`;
  if (!keep[i]) rmSync(path.join(DIR, f), { force: true });
  else if (PREACHER_FIXES[s.id]) write(f, { ...read(f), preacher: index.preachers[s.p] });
});
for (const k of hidden) delete index.preachers[k];
index.sermons = sermons;
index.books = index.books
  .map((b) => ({ ...b, count: sermons.filter((s) => (s.bs ?? [s.b]).includes(b.name)).length }))
  .filter((b) => b.count);
write('index.json', index);
console.log(`sermons: ${sermons.length} published, ${keep.length - sermons.length} hidden`);
