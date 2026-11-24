import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const basePath = process.env.VITE_BASE_PATH || '/'

function rewritePublicAssetBasePath(base: string): Plugin {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return {
    name: 'rewrite-public-asset-base-path',
    enforce: 'post',
    transform(code, id) {
      if (normalizedBase === '/' || !/[/\\]src[/\\]data[/\\]/.test(id)) return null
      return code.replace(
        /(["'])\/(images|documents|ministry-resources)\//g,
        `$1${normalizedBase}$2/`
      )
    },
  }
}

/**
 * Until launch the whole site stays out of search results. Build with SITE_INDEXING=on
 * to allow indexing (scripts/prerender.mjs also writes robots.txt and _headers to match).
 */
function siteIndexing(): Plugin {
  const on = process.env.SITE_INDEXING === 'on'
  return {
    name: 'site-indexing',
    transformIndexHtml(html) {
      return on ? html : html.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow" data-site />')
    },
  }
}

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), rewritePublicAssetBasePath(basePath), siteIndexing()],
})
