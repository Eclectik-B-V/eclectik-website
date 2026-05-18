# Eclectik Website — Onboarding & Context

This file is the single source of truth for the Eclectik marketing website.
It captures what the site is, how it works, every decision made during the
Manus → Vercel migration, and what's still open. Read it fully before changing
anything. Communicate with Olivier in Dutch; explain trade-offs in plain
language (he is hands-on but not deeply technical).

---

## 1. What this is

The Eclectik public marketing website (https://www.eclectik.co). A boutique
AI-transformation consultancy site: services, case studies, white papers,
contact + newsletter forms, AI Industry Insights news feed, ISO/Brand
Compliance proof.

Originally built in **Manus AI**. Fully migrated to **Vercel + Resend** with
no remaining dependency on Manus.

- **Repo**: `github.com/olivier-arnolds/eclectik-website` (branch `main`)
- **Local**: `~/Desktop/eclectik-website`
- **Live**: https://www.eclectik.co (apex `eclectik.co` 308-redirects to `www`)
- **Hosting**: Vercel (auto-deploys from `origin/main`)
- **Old Manus repo** (do not touch): `github.com/olivier-arnolds/rewire-inspired-site`
  — kept as a backup remote named `manus-backup` in the local clone.

## 2. Working conventions

- Communicate in **Dutch**.
- **Commit each logical step separately** with a descriptive message.
- **Always ask before `git push`.** Never push unprompted.
- **Verify in the browser before moving on** (`pnpm dev` → localhost:5173).
- Code/git/deploy work happens in **Claude Code**. Strategy, content and
  planning can happen in the Claude web app (Team).
- Git identity is set locally in this repo (Olivier Arnolds /
  olivier@eclectik.co). Auth uses a PAT embedded in the `origin` remote URL.

## 3. Tech stack

- **Frontend**: Vite 7 + React 19 + TypeScript + Tailwind CSS 4 + Radix UI
- **Router**: Wouter (client-side SPA routing)
- **Animation**: Framer Motion
- **PDF**: react-pdf (used for the ISO certificate modal)
- **Backend**: Vercel serverless functions in `/api` (no server, no database)
- **Email**: Resend (contact email + newsletter audience)
- **Package manager**: pnpm 10.4.1 (via corepack)
- **Node**: project built/tested on Node 20/24 — if `pnpm dev` fails with a
  rollup native module error after a Node version switch, run
  `rm -rf node_modules && pnpm install`.

## 4. Architecture

```
client/                 ← Vite root
  index.html             (GTM, GA4, LinkedIn Insight, SEO meta, JSON-LD)
  src/
    main.tsx              (HelmetProvider + App, no tRPC/query client)
    App.tsx               (Wouter routes — all public pages)
    pages/                (Home, Contact, Consulting, Training, case studies…)
    components/           (Layout = nav+footer, AINews, NewsModal, …)
    data/news.json        ← AI Industry Insights content (manually curated)
    lib/tracking.ts       (GA4 / GTM event helpers)
api/                     ← Vercel serverless functions
  contact.ts              (POST → Resend email to CONTACT_TO_EMAIL)
  subscribe.ts            (POST → Resend Audience contact create)
vercel.json              ← build config + SPA rewrite + security headers
```

- SPA: `vercel.json` rewrites everything except `/api/*` to `/index.html`.
- Build output: `dist/public` (set in both `vite.config.ts` and `vercel.json`).

## 5. Key decisions & rationale

| Decision | Why |
|---|---|
| Dropped Express/tRPC/Drizzle/MySQL backend | Marketing site needs no DB or auth. Simpler, cheaper, more secure. |
| Forms → Vercel serverless + Resend | Only dynamic needs are contact email + newsletter signup. |
| News feed = `client/src/data/news.json` (Option A) | No DB/CMS. Manual/AI curation = higher quality than RSS. Edit file → commit → auto-deploy. Easy to upgrade later. |
| Removed Webinar, AI Chat, Admin, ComponentShowcase | Not used on the live site. Webinar can be rebuilt when needed. |
| ISO badge replaced by Brand Compliance logo | ISO trademark/merkenrecht: the official ISO seal may NOT be displayed. The auditor's (Brand Compliance) logo is fine. Linking to your own ISO 27001 certificate PDF is fine; textual "ISO 27001 certified" is fine. |
| ISO cert bundled as static PDF | Old `/api/iso-certificate` was an Express route; deleted. PDF now at `client/public/documents/iso-27001-certificate.pdf` (downloaded from the live Manus site before cutover). |
| Logos copied locally from Manus CloudFront | Site must not depend on Manus infra. 9 images + 4 logo SVGs are now in `client/public/images/`. |
| New repo (not the Manus repo) | Keeps Manus's `rewire-inspired-site` repo untouched; clean history. |
| Domain `eclectik.co` (not `eclectik-insights.co`) | The `-insights` domain in old SEO/JSON-LD was wrong; corrected everywhere. |

## 6. How things work

### Contact form (`/contact`)
`client/src/pages/Contact.tsx` → `fetch POST /api/contact` →
`api/contact.ts` validates with zod, sends email via Resend
(`replyTo` = visitor email) to `CONTACT_TO_EMAIL`.

### Newsletter signup (Home hero, Home footer widget, Layout footer)
→ `fetch POST /api/subscribe` → `api/subscribe.ts` adds the email as a
contact in the Resend Audience (`RESEND_AUDIENCE_ID`).

### Required Vercel environment variables
| Var | Value / source |
|---|---|
| `RESEND_API_KEY` | Resend dashboard → API Keys |
| `RESEND_AUDIENCE_ID` | Resend dashboard → Audiences → "Eclectik Newsletter" |
| `CONTACT_FROM_EMAIL` | `noreply@eclectik.co` (domain is verified in Resend) |
| `CONTACT_TO_EMAIL` | `olivier@eclectik.co` |

### News feed
Edit `client/src/data/news.json` (array of
`{title, source, date, summary, fullContent, category, url}`), commit, push →
auto-deploys. `AINews.tsx` renders the first items; `NewsModal.tsx` shows
`fullContent`. Future option: a scheduled Claude agent that opens a weekly PR
with fresh curated items (parked).

### Logos (`client/public/images/`)
- `eclectik-logo-white.svg` — plain vector, no photo (17 KB)
- `eclectik-logo-dark.svg` — plain vector, dark (for light backgrounds / JSON-LD)
- `eclectik-logo-white-photo.svg` — used in **header (h-16) and footer (h-14)**.
  Stroke-width was bumped 2.29 → 6.875 so the icon outlines stay visible on
  the dark nav. (271 KB — photo is an embedded bitmap; fine for web.)
- `eclectik-logo-dark-photo.svg` — dark photo variant (marketing use)
- `brand-compliance-logo-final.png` — replaces ISO badge in 3 spots
  (Home rotating stamp h-10, Home certifications column h-12, Contact
  certifications h-12). Clicking it opens the ISO 27001 cert modal.

### Deploy flow
1. Commit per step (ask before push).
2. `git push origin main` → Vercel auto-deploys (~1–2 min).
3. Hard refresh (Cmd+Shift+R) and verify.

## 7. DNS (Cloudflare)

`eclectik.co` nameservers are on **Cloudflare** (`*.ns.cloudflare.com`), not
mijndomein.nl directly. DNS changes must be made in the **Cloudflare**
dashboard. Production records:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `eclectik.co` | `76.76.21.21` | **DNS only (grey cloud)** |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only (grey cloud)** |

Cloudflare proxy (orange cloud) **must be OFF** for the Vercel records or SSL
breaks. Vercel auto-issues a Let's Encrypt cert. Vercel's "DNS Change
Recommended" notice is non-blocking (optimization suggestion only).

**Do not touch** the email DNS records: `k2/k3._domainkey` (Mailchimp DKIM),
`selector1/2._domainkey` (Microsoft 365 DKIM), `resend._domainkey`, MX records,
`_dmarc` / SPF TXT records.

## 8. Gotchas

- DNS is on **Cloudflare**, not mijndomein.nl. Editing records in mijndomein.nl
  has no effect.
- Cloudflare proxy on (orange cloud) → Vercel SSL fails. Keep it grey.
- `pnpm dev` rollup error after a Node version change → reinstall node_modules.
- The `with-photo` logo SVGs embed a bitmap (271 KB) → don't "optimize" them
  expecting tiny files; that's normal.
- White logo SVG has thin strokes by design; we patched stroke-width to 6.875.
  If the logo file is ever re-exported from the designer, re-apply that bump.
- All routes return 200 from the SPA (Vite serves index.html for any path) —
  that's expected, React Router handles the actual routing.
- SSL Labs may transiently fail right after a DNS cutover; retry after a few
  minutes. The cert/headers themselves are correct (HSTS 2y, CSP set).

## 9. Open / parked work

- [ ] Decommission the Manus account (after a few days of stable Vercel).
- [ ] Confirm SSL Labs grade (expect A / A+; HSTS + CSP already set).
- [ ] Email migration Mailchimp → Resend — separate track, no rush. Don't
      remove Mailchimp DKIM records until that's fully done.
- [ ] Optional: weekly scheduled Claude agent that PRs fresh news.json items.
- [ ] Optional: SVG optimization (SVGO) and image compression pass.
- [ ] Optional: switch to Vercel's recommended unique DNS hostname.

## 10. Quick start for a new session

```bash
cd ~/Desktop/eclectik-website
pnpm install          # if node_modules missing/stale
pnpm dev              # http://localhost:5173
pnpm build            # production build sanity check
```

Repo + `git log` is the authoritative history. Commit messages document the
why behind every migration step.

<!-- deploy-pipeline-test: 20260518-142800 -->
