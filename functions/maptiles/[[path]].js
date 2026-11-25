// The background map for Find a church, fetched from OpenFreeMap through our own address.
// Some ad-blocker lists block tiles.openfreemap.org/planet by name, which left those visitors with an empty map.
// It also means the map service never sees our visitors' addresses.
const UPSTREAM = 'https://tiles.openfreemap.org';
// Only the map's own files: styles, tile index, tiles, shading, icons and lettering.
const ALLOWED = [
  /^styles\/liberty$/,
  /^planet$/,
  /^planet\/[0-9a-z_]+\/\d{1,2}\/\d+\/\d+\.pbf$/i,
  /^natural_earth\/[0-9a-z]+\/\d{1,2}\/\d+\/\d+\.png$/i,
  /^sprites\/[0-9a-z_/]+(@2x)?\.(json|png)$/i,
  /^fonts\/[0-9a-z%, -]+\/\d+-\d+\.pbf$/i,
];

export async function onRequestGet({ params, request, waitUntil }) {
  const path = (params.path ?? []).join('/');
  if (!ALLOWED.some((re) => re.test(path))) return new Response('Not found', { status: 404 });

  const cache = caches.default;
  const key = new Request(new URL(`/maptiles/${path}`, request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  // Nothing about the visitor is passed on.
  const upstream = await fetch(`${UPSTREAM}/${path}`, { signal: AbortSignal.timeout(10000) }).catch(() => null);
  if (!upstream) return new Response('Map unavailable', { status: 502 });
  if (!upstream.ok) return new Response(null, { status: upstream.status === 404 ? 404 : 502 });

  // Tile addresses are dated and never change; the index and style are refreshed daily.
  const fixed = /\.(pbf|png)$/.test(path);
  const headers = new Headers({
    'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
    'Cache-Control': fixed ? 'public, max-age=604800' : 'public, max-age=86400',
    'X-Robots-Tag': 'noindex',
  });
  const res = new Response(upstream.body, { status: upstream.status, headers });
  if (upstream.status === 200) waitUntil(cache.put(key, res.clone()));
  return res;
}
