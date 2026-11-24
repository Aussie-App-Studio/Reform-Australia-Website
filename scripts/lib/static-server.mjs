// A small static server for dist/, used by the pre-renderer and for local previews.
//   mode 'shell':      unknown paths get the app shell (used while pre-rendering)
//   mode 'cloudflare': behaves like Cloudflare Pages: /path serves path.html, _redirects
//                      are applied, and unknown paths get 404.html with a 404 status.
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function createStaticServer({ dist, base = '/', mode = 'cloudflare', shell }) {
  const isFile = (f) => f.startsWith(dist) && existsSync(f) && statSync(f).isFile();
  const redirects = [];
  if (mode === 'cloudflare' && existsSync(path.join(dist, '_redirects'))) {
    for (const line of readFileSync(path.join(dist, '_redirects'), 'utf8').split('\n')) {
      const [from, to, status] = line.trim().split(/\s+/);
      if (from && !from.startsWith('#') && to) redirects.push({ from, to, status: Number(status || 302) });
    }
  }
  // Compress text like a real host does, so speed tests are realistic.
  let gzip = false;
  const send = (res, status, file, extra = {}) => {
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    let body = readFileSync(file);
    const headers = { 'content-type': type, ...extra };
    if (gzip && /text|javascript|json|xml|svg/.test(type)) {
      body = gzipSync(body);
      headers['content-encoding'] = 'gzip';
    }
    res.writeHead(status, headers);
    res.end(body);
  };
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    gzip = mode === 'cloudflare' && /gzip/.test(req.headers['accept-encoding'] || '');
    let p;
    try {
      p = decodeURIComponent(url.pathname);
    } catch {
      p = url.pathname;
    }
    if (!p.startsWith(base)) {
      res.writeHead(302, { location: base });
      return res.end();
    }
    p = '/' + p.slice(base.length);
    for (const r of redirects) {
      const m = r.from.includes(':slug') ? p.match(new RegExp('^' + r.from.replace(':slug', '([^/]+)') + '$')) : p === r.from ? [] : null;
      if (m) {
        res.writeHead(r.status, { location: base.replace(/\/$/, '') + r.to.replace(':slug', m[1] ?? '') });
        return res.end();
      }
    }
    const file = path.join(dist, p);
    if (p !== '/' && isFile(file)) return send(res, 200, file);
    if (mode === 'shell') {
      res.writeHead(200, { 'content-type': TYPES['.html'] });
      return res.end(shell);
    }
    if (p === '/') return send(res, 200, path.join(dist, 'index.html'));
    const html = path.join(dist, `${p.replace(/\/$/, '')}.html`);
    if (isFile(html)) {
      if (p.endsWith('/')) {
        res.writeHead(308, { location: base.replace(/\/$/, '') + p.replace(/\/$/, '') + url.search });
        return res.end();
      }
      return send(res, 200, html);
    }
    if (isFile(path.join(dist, p, 'index.html'))) return send(res, 200, path.join(dist, p, 'index.html'));
    return send(res, 404, path.join(dist, isFile(path.join(dist, '404.html')) ? '404.html' : 'index.html'));
  });
}
