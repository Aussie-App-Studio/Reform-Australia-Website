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

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), rewritePublicAssetBasePath(basePath)],
})
