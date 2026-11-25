#!/usr/bin/env node
// Publishes this branch to a SUB-FOLDER of the gh-pages branch, leaving whatever
// is already published (e.g. the original preview at the site root) untouched.
//
//   npm run deploy:preview            -> https://<owner>.github.io/<repo>/v2/
//   npm run deploy:preview -- beta    -> https://<owner>.github.io/<repo>/beta/
//
// GitHub Pages only honours a single /404.html (at the site root), which is what
// makes deep links work in a single-page app. This script prepends a tiny router
// to that root 404.html: requests under /<subdir>/ are bounced to the sub-site's
// index with the original path in ?__p=, and everything else keeps loading the
// root app exactly as before. index.html restores the real URL before React starts.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const REPO_BASE = process.env.PAGES_REPO_BASE || '/Reform-Australia-Website/';
const SUBDIR = (process.argv[2] || 'v2').replace(/^\/+|\/+$/g, '');
if (!/^[a-z0-9][a-z0-9-]*$/i.test(SUBDIR)) throw new Error(`Invalid sub-folder name: ${SUBDIR}`);
const BASE_PATH = `${REPO_BASE}${SUBDIR}/`;

const run = (cmd, cwd = ROOT, env = process.env) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
};
const out = (cmd, cwd = ROOT) => execSync(cmd, { cwd, encoding: 'utf8' }).trim();

// 1. Build with the sub-folder base path.
run('npm run build', ROOT, { ...process.env, VITE_BASE_PATH: BASE_PATH });
writeFileSync(path.join(DIST, '.nojekyll'), '');

// 2. Check out the current gh-pages branch in a temporary worktree.
const branch = out('git rev-parse --abbrev-ref HEAD');
const commit = out('git rev-parse --short HEAD');
// The preview lives on Jesse's repository (remote "jesse" since the code moved to crca-web).
const REMOTE = process.env.PAGES_REMOTE || (out('git remote').split(/\s+/).includes('jesse') ? 'jesse' : 'origin');
run(`git fetch ${REMOTE} gh-pages`);
const tmp = mkdtempSync(path.join(os.tmpdir(), 'gh-pages-'));
run(`git worktree add --detach "${tmp}" ${REMOTE}/gh-pages`);

try {
  // 3. Replace only the sub-folder.
  const target = path.join(tmp, SUBDIR);
  rmSync(target, { recursive: true, force: true });
  cpSync(DIST, target, { recursive: true });
  rmSync(path.join(target, '404.html'), { force: true });

  // 4. Teach the root 404.html about this sub-site (idempotent).
  const root404 = path.join(tmp, '404.html');
  const rootIndex = path.join(tmp, 'index.html');
  let html = existsSync(root404) ? readFileSync(root404, 'utf8') : existsSync(rootIndex) ? readFileSync(rootIndex, 'utf8') : '<!doctype html><html><head></head><body></body></html>';
  const marker = `<!-- subsite-router:${SUBDIR} -->`;
  html = html.replace(new RegExp(`${marker}[\\s\\S]*?<!-- /subsite-router:${SUBDIR} -->\\n?`), '');
  const router = `${marker}<script>(function(){var b=${JSON.stringify(BASE_PATH)};var l=window.location;if(l.pathname.indexOf(b)===0&&l.pathname!==b){l.replace(b+'?__p='+encodeURIComponent(l.pathname.slice(b.length)+l.search+l.hash));}})();</script><!-- /subsite-router:${SUBDIR} -->\n`;
  html = html.replace(/<head>/i, `<head>\n${router}`);
  writeFileSync(root404, html);
  if (!existsSync(path.join(tmp, '.nojekyll'))) writeFileSync(path.join(tmp, '.nojekyll'), '');

  // 5. Commit and push (fast-forward; never force).
  run('git add -A', tmp);
  const changed = out('git status --porcelain', tmp);
  if (!changed) {
    console.log('Nothing changed on gh-pages.');
  } else {
    run(`git commit -q -m "Deploy ${branch}@${commit} preview to /${SUBDIR}/"`, tmp);
    run(`git push ${REMOTE} HEAD:gh-pages`, tmp);
  }
  const [owner, repo] = out(`git remote get-url ${REMOTE}`).replace(/\.git$/, '').split(/[/:]/).slice(-2);
  console.log(`\nPreview published: https://${owner.toLowerCase()}.github.io/${repo}/${SUBDIR}/`);
} finally {
  run(`git worktree remove --force "${tmp}"`);
}
