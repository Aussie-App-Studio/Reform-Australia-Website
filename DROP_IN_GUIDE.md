# CRCA Website Redesign — Drop-In & Deployment Guide

This prototype is built with **React + Vite + Tailwind CSS v4 + TypeScript** and structured so content updates, static hosting, or future WordPress/CMS integration can be done cleanly without touching UI components.

---

## 1. Easy Content Editing (`src/data/`)

All website copy, links, sermons, and leader documents live in plain JSON/TS files:

| File | What It Controls |
| :--- | :--- |
| `src/data/siteConfig.ts` | Tagline, Mission/Vision summary, admin email, Safe Church URL, image paths, optional PNG logo overrides, and quick-stats strip |
| `src/data/navigation.ts` | Top utility bar, `Who We Are` dropdown, `Ministries` 3-column mega-menu, and footer columns |
| `src/data/identity.json` | Mission & Vision, 5 Core Values + Scriptures, Four-Fold Task (`Pray`, `Grow`, `Train`, `Align`), 9 Strategies, and History timeline since 1951 |
| `src/data/beliefs.json` | 5-point plain-English gospel summary, full Ecumenical Creeds text, and Three Forms of Unity readable summaries + PDF links |
| `src/data/ministries.json` | All 13 ministries, plain-English descriptions, audience tabs, internal/external links, and committee contacts |
| `src/data/nextGenClubs.json` | Full content and local PDF links for **CRCA Cadets** and **CRCA GEMS Girls' Clubs** (`/ministries/cadets`, `/ministries/gems`) |
| `src/data/convention.json` | **CRCA Youth Convention** event details, waitlist/registration banner, keynote speaker, theme, videos, and local PDFs (`/ministries/youth-convention`) |
| `src/data/swim.json` | **Solomon Islands SWIM** overview, biblical values, Honiara base details, mission opportunities, newsletters, and policies (`/ministries/swim`) |
| `src/data/internalMinistries.json` | Content for **Candidacy Committee**, **Shift Coaching**, **Local Church Outreach Training**, **Missional Explorations**, **Church Planting Taskforce**, and **Ecumenical Relations** (`/ministries/<slug>`) |
| `src/data/leaderResources.json` | **For Churches** resources (including Word of Salvation reading sermons for elders/vacant congregations), Regional Counsellors duties, Church Health Check video/survey, and searchable 2022 Church Order index |
| `src/data/contactTopics.json` | Smart Contact Routing cards (`General Admin`, `Safe Church Unit`, `Candidacy`, `Church Planting`, `Outreach`, `Next Gen`, `SWIM`) |
| `src/data/churches.json` | Public directory dataset for all **54 active CRCA congregations** (name, suburb, state, postcode, classis, address, coordinates, service times, website, Facebook, YouTube/livestream, and podcast — strictly excluding membership numbers, ACNC details, and pastor names) |

Self-hosted ministry and governance resources (Shift Brochure, Missional Explorations Application, Cadets/GEMS resources, Youth Convention guides, SWIM newsletters/policies, and Synod governance PDFs) live separately from `public/documents/` under `public/ministry-resources/`.

---

## 1b. Synced CRCA Forms & Documents (`public/documents/`)

The `/for-churches/forms-and-documents` library renders self-hosted Markdown, JSON, and PDF files stored in `public/documents/` (synced from [`Aussie-App-Studio/crca-forms-and-documents`](https://github.com/Aussie-App-Studio/crca-forms-and-documents)):

- **Manual refresh:** Run `npm run sync-docs` (or `node scripts/sync-crca-docs.mjs --force` to bypass commit SHA short-circuiting) to pull updated liturgical forms, creeds, confessions, worship readings, and the 2022 Church Order into `public/documents/`.
- **Build with sync:** Run `npm run build:with-sync` to refresh documents immediately before building `dist/`.
- **Periodic automatic sync:** the workflow template [`scripts/github-workflows/sync-crca-docs.yml`](scripts/github-workflows/sync-crca-docs.yml) runs on a weekly GitHub Actions schedule (and supports manual `workflow_dispatch` triggers), verifies `npm run build`, and commits updated files in `public/documents/` so static hosts automatically redeploy.

> **Enabling the GitHub Actions workflows:** the templates live in `scripts/github-workflows/` (`.github/workflows/` is git-ignored because pushing workflow files needs a token with the `workflow` scope). To turn them on, run `gh auth refresh -s workflow`, copy the files into `.github/workflows/`, remove that line from `.gitignore`, and push.

---

## 1c. Safe Church & Word of Salvation (formerly separate websites)

Both legacy WordPress sites are now part of this site and served as static JSON:

| Section | Route | Data | Refresh |
| :--- | :--- | :--- | :--- |
| Safe Church Unit (72 pages, 88 documents) | `/safe-church` | `public/data/safe-church/` | `npm run sync-safe-church` |
| Word of Salvation reading sermons (2,186) | `/sermons` | `public/data/sermons/` | `npm run sync-sermons` |

- The sync scripts read the public WordPress REST API, strip page-builder markup, rewrite links to the new routes, and self-host linked PDFs/Word documents. `npm run sync-all` refreshes forms, Safe Church and sermons together.
- The weekly workflow template `scripts/github-workflows/sync-legacy-sites.yml` keeps both current once enabled (see note above).
- Urgent Safe Church phone numbers shown on every Safe Church page are set in `src/data/siteConfig.ts` (`safeChurch.urgent`).
- Once the old sites are retired, point `safechurch.crca.org.au` and `wordofsalvation.crca.org.au` at this site — old sermon URLs (`/word-of-salvation/<slug>/`) already redirect to `/sermons/<slug>`.

---

## 2. Swapping Photos & Official Logos

- **Photography (`public/images/`):** Use real photos of CRCA churches and ministries only (no AI-generated images). Ministry photos live in `public/images/ministries/<slug>/` and are set in each ministry page's JSON.
- **Official CRCA Logos (`public/images/logos/`):** All three official logo variants are installed and configured via `src/data/siteConfig.ts` (`logos.landscapeWhite`, `logos.iconTeal`, and `logos.stackedColor`) and rendered cleanly by `src/components/CrcaLogo.tsx` across the navbar, deep navy footer, and favicon.

---

## 3. Building & Deploying Static Files ("Drop-In" Hosting)

```bash
npm install
npm run build
```

This outputs pure static files into `dist/`, ready to upload to:
- **Netlify / Cloudflare Pages / Vercel:** `public/_redirects` is automatically copied into `dist/_redirects` so deep routes (`/who-we-are/beliefs`, `/for-churches`, etc.) work on refresh.
- **Apache / cPanel Shared Hosting:** `public/.htaccess` is copied into `dist/.htaccess` to handle SPA clean URL routing automatically. Just upload the contents of `dist/` into `public_html/`.

---

## 4. Connecting WordPress Later (Optional Headless CMS)

If `crca.org.au` stays on WordPress as a backend CMS:
1. Install WPGraphQL or expose custom REST endpoints (e.g., `/wp-json/wp/v2/churches`).
2. Replace the static JSON import in `FindAChurchPage.tsx` with a tiny `fetch()` hook falling back to the local JSON file.
3. Contact form delivery: paste a Formspree / Web3Forms (or similar) POST URL into `siteConfig.contactForm.endpoint`. The form then sends JSON (`topic, to, cc, name, email, church, message`) and falls back to the email-app flow if sending fails.

---

## 5. Interactive "Find a Church" Directory (`src/data/churches.json`)

The interactive Leaflet map and split-view directory (`src/components/ChurchDirectory.tsx` and `src/components/AustraliaChurchMap.tsx`) live on `/find-a-church`, while the Homepage (`#find-a-church`) provides a closing church search bar and clickable state quick-links.
- To add, update, or remove a congregation, edit `src/data/churches.json` (`lat`, `lng`, `state`, `postcode`, `address`, `serviceTimes`, `website`, `facebook`, `youtube`, `videoUrl`, `livestreamOnFacebook`, and `podcast`).
- Keep `src/data/churches.json` limited strictly to public congregation information (never add private membership figures or ACNC identifiers).
