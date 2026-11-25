# Launch checklist

Working version: https://crca-website.pages.dev (Cloudflare Pages project `crca-website`, kept out of search engines).
Tick items off as they are done. "Who" is a suggestion.

## 1. Decisions and approvals
- [ ] Synod / CRCA office approve the new site and the launch date. *(Nathanael, Jesse)*
- [ ] Decide who the editors are and add them to /admin (Cloudflare Access policy "CRCA editors"). *(Nathanael; Claude adds them)*
- [ ] Contact form: choose the sending service, how long enquiries are kept (e.g. 12 months), privacy note wording, and confirm Safe Church messages go only to the Safe Church Unit. *(Nathanael)*

## 2. Content sign-off
- [ ] Office checks every page once (especially Positions vacant, Contacts, Churches and service times).
- [ ] Remaining "still to check" items: congregation dates on the History page (Dandenong, Cobden, South Gippsland, Tivoli, Open House, Westside, Redlands, Tanilba), ministry details (World Transform bank details, SWIM, Cadets, Youth Convention), One Hope application address. Reviewer notes are in the `needsChecking` fields of the data files.
- [ ] Forms proofreading corrections (`docs/forms-proofreading-2026-11.md`) applied in the forms repository.
- [ ] Original Cadets and GEMS logo artwork, if better versions exist.
- [ ] Photo permissions recorded (RTC, Dutch Australian Cultural Centre, Churches of Tasmania) in case anyone asks.

## 3. Old websites
The site already includes the content of these, and old crca.org.au addresses redirect to the new pages:
crca.org.au, safechurch.crca.org.au, wordofsalvation.crca.org.au, swim / cadets / gems / wt .crca.org.au, crcaconvention.au, ministryformation.com.au.
- [ ] Decide what happens to each old site at launch: redirect to the matching page here (preferred) or close.
- [ ] Safe Church, sermons and the forms library are still *copied in* from the old sites by sync scripts. At launch, stop syncing and edit them here instead (or keep the forms repository as the source for the forms).
- [ ] Ask whoever manages the old sites' hosting for the redirect setup (or move their domains to Cloudflare).

## 4. Web address (domain)
- [ ] Find who controls crca.org.au's domain settings (DNS) and get access or a contact.
- [ ] Optional first step: a test address such as `new.crca.org.au` pointing to the Cloudflare project (still noindex).
- [ ] At launch: point crca.org.au (and www) to Cloudflare Pages (Custom domains in the project), and add the new domain to the Access application so /admin stays protected.
- [ ] Check email is unaffected (MX records stay as they are; only the website records change).

## 5. Switch on search engines (launch day)
- [ ] In GitHub (crca-web/crca-website > Settings > Variables), set `SITE_INDEXING` = `on`, then run the publish. This removes "noindex" and publishes robots.txt with the sitemap.
- [ ] Check https://crca.org.au/robots.txt allows crawling and lists the sitemap.
- [ ] Add the site to Google Search Console (and Bing Webmaster Tools), verify ownership, submit `https://crca.org.au/sitemap.xml`.
- [ ] Spot-check old addresses (e.g. /our-history/, /word-of-salvation/<sermon>/) redirect correctly on the real domain.
- [ ] Check link previews (share a page in Messages / Facebook).

## 6. After launch
- [ ] Visitor stats: Cloudflare Web Analytics is on (Pages project > Metrics). No cookie banner needed.
- [ ] Watch Search Console for errors in the first two weeks.
- [ ] Renew the editor's GitHub key before 26 November 2027 (Claude can do this).
- [ ] Keep the editors' list current.

## Already done
Pre-rendered pages (fast, readable by search engines), page titles, descriptions and share images, sitemap, structured data for the CRCA and all 54 churches, redirects from old addresses, accessibility checks, automatic publishing from GitHub, nightly rebuild, the editor at /admin with email-code sign-in, visitor stats.
