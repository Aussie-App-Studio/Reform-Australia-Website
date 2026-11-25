#!/usr/bin/env node
// Serves dist/ the way Cloudflare Pages will: pre-rendered pages, _redirects and 404.html.
//   npm run serve            -> http://localhost:4174
//   npm run serve -- 5000
//   npm run serve -- 4174 --spa   (after npm run build:spa: every path gets the app shell)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/routes.mjs';
import { createStaticServer } from './lib/static-server.mjs';

const port = Number(process.argv.find((a) => /^[0-9]+$/.test(a)) || 4174);
const spa = process.argv.includes('--spa');
const base = (process.env.VITE_BASE_PATH || '/').replace(/\/?$/, '/');
createStaticServer({ dist: path.join(ROOT, 'dist'), base, mode: spa ? 'shell' : 'cloudflare', shell: spa ? readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8') : undefined }).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}${base}`));
