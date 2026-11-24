#!/usr/bin/env node
// Builds the site and uploads it to Cloudflare Pages.
//
//   npx wrangler login                 (once: opens the browser to sign in to Cloudflare)
//   npm run deploy:cloudflare          -> https://<project>.pages.dev
//
// Environment:
//   CF_PAGES_PROJECT   Cloudflare Pages project name (default: crca-website; created on first deploy)
//   CF_PAGES_BRANCH    "main" (default) publishes to the project's main address;
//                      any other name publishes a preview at https://<branch>.<project>.pages.dev
//   SITE_INDEXING=on   only at launch: lets search engines index the site. Until then every
//                      page is sent with "noindex" and robots.txt blocks crawlers.
//   VITE_SITE_URL      the final address (default https://crca.org.au), for canonical links and the sitemap
//   SKIP_BUILD=1       upload the existing dist/ without rebuilding
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/routes.mjs';

// Optional: a Cloudflare API token in .env.local (never committed), e.g.
//   CLOUDFLARE_API_TOKEN=...   (token with "Cloudflare Pages: Edit" on the CRCA account)
// With a token, deploys work whatever account `wrangler login` is signed in to.
const envFile = path.join(ROOT, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*(CLOUDFLARE_[A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}
// The CRCA site lives on Nathanael's Gmail Cloudflare account; always deploy there.
process.env.CLOUDFLARE_ACCOUNT_ID ||= '66cef5009038be80506ecc3dc23cbb7d';

const project = process.env.CF_PAGES_PROJECT || 'crca-website';
const branch = process.env.CF_PAGES_BRANCH || 'main';
const run = (cmd, env = process.env) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env });
};

if (!process.env.SKIP_BUILD) {
  // Cloudflare serves the site from the root, so no sub-folder base path.
  const env = { ...process.env, VITE_BASE_PATH: '/' };
  run('npm run build', env);
}

// Safety check: until launch, the build must be marked noindex.
const robots = readFileSync(path.join(ROOT, 'dist/robots.txt'), 'utf8');
const indexing = !/Disallow: \//.test(robots);
console.log(indexing ? 'Search engines: ALLOWED (SITE_INDEXING=on)' : 'Search engines: blocked (noindex) until launch');
if (indexing && process.env.SITE_INDEXING !== 'on') {
  console.error('dist/ allows indexing but SITE_INDEXING is not "on". Rebuild before deploying.');
  process.exit(1);
}

run(`npx -y wrangler@4 pages deploy dist --project-name=${project} --branch=${branch} --commit-dirty=true`);
