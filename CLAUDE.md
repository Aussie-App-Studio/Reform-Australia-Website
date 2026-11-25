# CLAUDE.md — Project Guide for Claude Code

This file provides context for Claude Code (and other AI coding assistants) when working on the **Christian Reformed Churches of Australia (CRCA) / Reform Australia Website** project.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite 6
- **Routing:** `react-router-dom` v7 (SPA routing with clean URLs)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Maps:** MapLibre GL JS + Leaflet (`src/components/AustraliaChurchMap.tsx`, `src/components/ChurchDirectory.tsx`)
- **Icons:** `lucide-react`

## Where things live
- **Code:** https://github.com/crca-web/crca-website (private; `main` publishes automatically). The original prototype is Jesse's repository, remote `jesse` (Aussie-App-Studio/Reform-Australia-Website); its `v2` branch and the GitHub Pages /v2/ preview are kept in step for review.
- **Live (not indexed until launch):** https://crca-website.pages.dev (Cloudflare Pages project `crca-website`). `.github/workflows/deploy.yml` builds, pre-renders and publishes on every push to `main`.

## Quick Commands
- **Install dependencies:** `npm install`
- **Start local dev server (open in browser):** `npm run dev`
- **Verify all data, assets & links:** `npm run verify`
- **Full browser QA (every page, desktop + phone; fails on error screens, console errors, broken images/files, overflow):** `npm run build && npm run serve` then `npm run qa -- http://localhost:4174` (or pass the deployed preview URL). First time: `npx playwright install chromium`.
- **Type-check, build and pre-render (`dist/`):** `npm run build` (about 3 minutes: `scripts/prerender.mjs` saves all ~2,350 pages as HTML with Chromium, then writes `sitemap.xml`, `robots.txt`, `_headers`, `_redirects`). `PRERENDER_LIMIT=40` for a quick check, `npm run build:spa` to skip pre-rendering.
- **Serve `dist/` like Cloudflare Pages (pre-rendered pages, redirects, 404s, gzip):** `npm run serve` → http://localhost:4174
- **Publish to Cloudflare Pages:** `npx wrangler login` once, then `npm run deploy:cloudflare` (project `crca-website`). **The site is built noindex until launch**; build with `SITE_INDEXING=on` only when it goes live.
- **Phone-sized photo copies, favicons, share image:** `npm run images` after adding photos (writes `<name>-800w.webp` and `src/data/imageVariants.json`; use `responsive(src, sizes)` from `src/utils/responsiveImage.ts` on new <img> tags).
- **Preview production build locally:** `npm run preview`
- **Publish live preview to GitHub Pages (`gh-pages` branch):** `npm run deploy:pages`
- **Sync liturgical forms & documents from upstream GitHub repo:** `npm run sync-docs`
- **Sync Safe Church pages/files from safechurch.crca.org.au:** `npm run sync-safe-church`
- **Sync Word of Salvation sermons from wordofsalvation.crca.org.au:** `npm run sync-sermons` (set `WP_CACHE_DIR` to cache the raw WordPress responses while iterating)
- **Publish a branch preview to a gh-pages sub-folder (keeps the root preview):** `npm run deploy:preview` → `/Reform-Australia-Website/v2/` (or `npm run deploy:preview -- <name>`)

## Project Architecture
1. **Data-Driven Content (`src/data/`):**
   Almost all website copy, links, ministry details, reading sermons, and the 54-congregation directory live in structured JSON/TS files in `src/data/` so content can be updated cleanly without rewriting UI components:
   - `src/data/siteConfig.ts` — Site tagline, mission/vision summary, contact emails, Safe Church URL, logo & image paths, quick stats.
   - `src/data/navigation.ts` — Top utility bar, `Who We Are` dropdown, `Ministries` 3-column mega-menu, footer columns.
   - `src/data/churches.json` — All 54 active CRCA congregations (coordinates, service times, addresses, websites, social/livestream links). **Important:** Keep strictly limited to public congregation info (never add private membership counts, ACNC numbers, or pastor personal details).
   - `src/data/identity.json` — Mission & Vision, 5 Core Values, Four-Fold Task (`Pray`, `Grow`, `Train`, `Align`), 9 Strategies, History timeline since 1951.
   - `src/data/beliefs.json` — 5-point gospel summary, Ecumenical Creeds, Three Forms of Unity summaries & PDF links.
   - `src/data/ministries.json` — All 13 denominational ministries, descriptions, audience filters, and committee contacts.
   - `src/data/nextGenClubs.json` — CRCA Cadets & GEMS Girls' Clubs (`/ministries/cadets`, `/ministries/gems`).
   - `src/data/convention.json` — CRCA Youth Convention (`/ministries/youth-convention`).
   - `src/data/swim.json` — Supporting Work in Mission, Solomon Islands (`/ministries/swim`).
   - `src/data/internalMinistries.json` — Candidacy Committee, Shift Coaching, Local Church Outreach Training, Missional Explorations, Church Planting Taskforce, Ecumenical Relations (`/ministries/<slug>`).
   - `src/data/leaderResources.json` — `For Churches` resources (Word of Salvation reading sermons, Regional Counsellors, Church Health Check, searchable 2022 Church Order index).
   - `src/data/contactTopics.json` — Smart Contact Routing topics.

2. **Self-Hosted Static Assets (`public/`):**
   - `public/documents/` — Synced liturgical forms, creeds, confessions, worship readings, and 2022 Church Order (`manifest.json` + Markdown/PDF files). Managed via `scripts/sync-crca-docs.mjs`.
   - `public/ministry-resources/` — Self-hosted ministry and Synod governance PDFs (kept separate from `public/documents/` so doc syncs never overwrite them).
   - `public/data/safe-church/` — `content.json` (72 cleaned pages, section tree) + `files/` (self-hosted PDFs/Word docs). Generated by `scripts/sync-safe-church.mjs`; don't hand-edit — change the sync script (e.g. `SEGMENT_MAP`, `SECTIONS`) and re-run.
   - `public/data/sermons/` — `index.json` (compact catalogue: short keys documented in `src/lib/sermons.ts`) + `s/<slug>.json` (one file per sermon, loaded on demand). Generated by `scripts/sync-sermons.mjs`.
   - **Never create a top-level `public/` folder with the same name as a page route** (e.g. `public/sermons/`) — static hosts serve the folder instead of the app. `npm run verify` checks this.
   - `public/images/` — Site photography and official CRCA logos (`public/images/logos/`).

3. **Pages & Components (`src/pages/`, `src/components/`):**
   - **Ministry pages:** every `/ministries/<slug>` page is rendered by `src/pages/ministries/MinistryPage.tsx` from `src/data/ministry-pages/<slug>.json` (one shared template, as Synod 2024 asked for). Write content in plain Australian English, only from sources; record each file`s `sources` and any unverified claim in `needsChecking`.
   - **One platform rule:** never link to other CRCA websites (swim/cadets/gems/wt/safechurch/wordofsalvation .crca.org.au, crcaconvention.au, ministryformation.com.au). Migrate their content, photos and PDFs here instead; `npm run verify` fails on such links (reviewer notes in `source`/`sources`/`needsChecking` are exempt).
   - Forms library grouping is adjusted at display time in `regroupIndex()` (`src/lib/crcaDocs/client.ts`): Three Forms of Unity vs “Other Reformed Statements”, Form of Subscription under Church Order. Liturgies get speaker labels / rubric styling from `src/lib/crcaDocs/liturgy.ts`. Synced files in `public/documents/` are never edited by hand.
   - Navigation menus (desktop panels + mobile) come from `navMenus` in `src/data/navigation.ts`.
   - `/safe-church/*` → `SafeChurchPage.tsx` (hub + every migrated page; urgent contact numbers live in `siteConfig.safeChurch.urgent`).
   - `/sermons` and `/sermons/:sermonId` → `SermonsPage.tsx` / `SermonPage.tsx`. Old `/word-of-salvation/<slug>` URLs redirect.
   - Migrated HTML is rendered with `components/RichHtml.tsx` (resolves `{{BASE}}` placeholders, routes in-site links through React Router).
   - Fixed routes get their title and description from `ROUTE_META` in `src/utils/usePageTitle.ts`; dynamic pages call `usePageTitle(title, description)` (sets canonical and share tags too).
   - Pre-rendering: `src/main.tsx` keeps the saved HTML on screen and swaps in the live app once it is ready. Loading placeholders must carry `data-loading` so the pre-renderer and the swap wait for real content. New page components go in `ROUTE_PAGES` in `App.tsx`.
   - Synced titles (documents library groups, Safe Church) are shown in sentence case by `src/utils/sentenceCase.ts`; add names that keep capitals to `PROPER` there.
   - Contact form: set `siteConfig.contactForm.endpoint` (e.g. a Formspree URL) to send directly; empty = prepare an email in the visitor's mail app.
   - General content pages (Regional counsellors, Positions vacant, Trowel and Sword, etc.) are `src/data/pages/<slug>.json`, rendered by `src/pages/ContentPage.tsx` via the shared `StandardPage` template; old crca.org.au URLs redirect via `src/data/legacyRedirects.json`. The home page vacancies band reads the first list on the Positions vacant page.
   - **House style:** plain and editorial. Real photos only (no AI-generated images); no icon badges, eyebrow labels, check-mark lists or quote cards; write facts from sources, not marketing summaries. Liturgies: `liturgy.ts` also sets verse (one-line-per-paragraph Scripture and creeds), dash lists, cue labels (EITHER / OR / Prayer) and rejoins sentences the source split; ALL-CAPS section headings are title-cased in `markdown.js`.
   - Before finishing any change, run `npm run verify`, `npm run build` and `npm run qa` to ensure TypeScript types, internal routes, and asset references remain 100% valid.
   - See `DROP_IN_GUIDE.md` for full deployment and content editing documentation.
