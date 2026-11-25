// Sign-in for the content editor at /admin (Sveltia CMS, GitHub backend).
//
// Editors never need GitHub accounts. Cloudflare Access protects /admin and this address,
// so only people on the editors list (signed in with an email code or Google) get here.
// This function checks the Access sign-in, then hands the editor page a GitHub token that can
// only change the crca-web/crca-website repository. Every save becomes a commit to `main`,
// which republishes the site.
//
// Cloudflare Pages project settings (Settings > Variables and secrets):
//   GITHUB_TOKEN        fine-grained token: crca-web/crca-website, Contents read and write (secret)
//   ACCESS_TEAM_DOMAIN  e.g. crca.cloudflareaccess.com
//   ACCESS_AUD          the Access application's "Application Audience (AUD) tag"
// Until all three are set, sign-in is refused.

const page = (body, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><title>Signing in…</title><body style="font:16px system-ui;padding:2rem">${body}</body>`, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
  });

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));

/** Checks the Cloudflare Access token: signature, audience and expiry. Returns the email or null. */
async function accessEmail(request, env) {
  const jwt = request.headers.get('cf-access-jwt-assertion');
  if (!jwt) return null;
  const [h, p, s] = jwt.split('.');
  if (!h || !p || !s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const { keys } = await (await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600 } })).json();
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk || header.alg !== 'RS256') return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(s), new TextEncoder().encode(`${h}.${p}`));
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!ok || !aud.includes(env.ACCESS_AUD) || payload.exp * 1000 < Date.now()) return null;
  if (payload.iss && payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
  return payload.email ?? null;
}

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_TOKEN || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return page('The editor isn’t switched on yet. Please contact the website administrator.', 503);
  }
  let email = null;
  try {
    email = await accessEmail(request, env);
  } catch {
    email = null;
  }
  if (!email) return page('Please sign in through the CRCA editor login first.', 403);

  // /admin asks for this as JSON straight after the Access sign-in, so editors go straight
  // into the editor without a second "Sign in with GitHub" step.
  if (new URL(request.url).searchParams.get('format') === 'json') {
    return new Response(JSON.stringify({ token: env.GITHUB_TOKEN, email }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  }

  const provider = new URL(request.url).searchParams.get('provider') || 'github';
  const result = JSON.stringify({ token: env.GITHUB_TOKEN, provider });
  // Standard Decap/Sveltia popup handshake: say we're ready, wait for the editor page to answer
  // from the same site, then pass it the token (only ever to this site's own origin).
  const origin = new URL(request.url).origin;
  return page(`Signed in as ${email.replace(/[<>&"]/g, '')}. You can close this window.
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var provider = ${JSON.stringify(provider)};
  window.addEventListener('message', function (e) {
    if (e.origin !== origin || e.data !== 'authorizing:' + provider) return;
    window.opener.postMessage('authorization:' + provider + ':success:' + ${JSON.stringify(result)}, origin);
  });
  if (window.opener) window.opener.postMessage('authorizing:' + provider, origin);
})();
</script>`);
}
