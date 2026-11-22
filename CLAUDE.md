# CLAUDE.md — Project Guide for Claude Code

This file provides context for Claude Code (and other AI coding assistants) when working on the **Christian Reformed Churches of Australia (CRCA) / Reform Australia Website** project.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite 6
- **Routing:** `react-router-dom` v7 (SPA routing with clean URLs)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Maps:** MapLibre GL JS + Leaflet (`src/components/AustraliaChurchMap.tsx`, `src/components/ChurchDirectory.tsx`)
- **Icons:** `lucide-react`

## Quick Commands
- **Install dependencies:** `npm install`
- **Start local dev server (open in browser):** `npm run dev`
- **Verify all data, assets & links:** `npm run verify`
- **Type-check and build production static files (`dist/`):** `npm run build`
- **Preview production build locally:** `npm run preview`
- **Sync liturgical forms & documents from upstream GitHub repo:** `npm run sync-docs`

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
   - `src/data/swim.json` — Solomon Islands Work & Instruction in Mission (`/ministries/swim`).
   - `src/data/internalMinistries.json` — Candidacy Committee, Shift Coaching, Local Church Outreach Training, Missional Explorations, Church Planting Taskforce, Ecumenical Relations (`/ministries/<slug>`).
   - `src/data/leaderResources.json` — `For Churches` resources (Word of Salvation reading sermons, Regional Counsellors, Church Health Check, searchable 2022 Church Order index).
   - `src/data/contactTopics.json` — Smart Contact Routing topics.

2. **Self-Hosted Static Assets (`public/`):**
   - `public/documents/` — Synced liturgical forms, creeds, confessions, worship readings, and 2022 Church Order (`manifest.json` + Markdown/PDF files). Managed via `scripts/sync-crca-docs.mjs`.
   - `public/ministry-resources/` — Self-hosted ministry and Synod governance PDFs (kept separate from `public/documents/` so doc syncs never overwrite them).
   - `public/images/` — Site photography and official CRCA logos (`public/images/logos/`).

3. **Pages & Components (`src/pages/`, `src/components/`):**
   - Before finishing any change, run `npm run verify` and `npm run build` to ensure TypeScript types, internal routes, and asset references remain 100% valid.
   - See `DROP_IN_GUIDE.md` for full deployment and content editing documentation.
