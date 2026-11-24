#!/usr/bin/env node
// Serves dist/ the way Cloudflare Pages will: pre-rendered pages, _redirects and 404.html.
//   npm run serve            -> http://localhost:4174
//   npm run serve -- 5000
import path from 'node:path';
import { ROOT } from './lib/routes.mjs';
import { createStaticServer } from './lib/static-server.mjs';

const port = Number(process.argv[2] || 4174);
const base = (process.env.VITE_BASE_PATH || '/').replace(/\/?$/, '/');
createStaticServer({ dist: path.join(ROOT, 'dist'), base }).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}${base}`));
