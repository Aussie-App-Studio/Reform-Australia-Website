// The sermon catalogue as published: preacher corrections applied, hidden preachers left out.
// Hidden preachers are chosen in /admin (src/data/sermonSettings.json). The files in
// public/data/sermons/ always keep every sermon, so un-hiding brings them straight back.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

// Named in the sermon's own text, but missed by the sync.
export const PREACHER_FIXES = { 'luke-02-the-boy-jesus-at-home-2': 'a-degraaf' };

export function publishedSermons() {
  const index = json('public/data/sermons/index.json');
  for (const s of index.sermons) s.p = PREACHER_FIXES[s.id] ?? s.p;
  const settings = json('src/data/sermonSettings.json');
  const hidden = new Set((settings.preachers ?? []).filter((p) => p.hidden).map((p) => p.preacher));
  for (const p of hidden) if (!index.preachers[p]) throw new Error(`sermonSettings.json: unknown preacher "${p}"`);
  const keep = index.sermons.map((s) => !hidden.has(s.p));
  return { index, hidden, keep, sermons: index.sermons.filter((_, i) => keep[i]) };
}
