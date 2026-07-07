# H2 2026 Redesign — Foundation Phase (Spec 1 of 2)

**Date:** 2026-07-07
**Status:** Approved by Olivier
**Source documents:**
- `~/Desktop/eclectik-website-H22026/CLAUDE-CODE-INSTRUCTIONS-website-redesign.md` (full redesign instructions)
- `~/Desktop/eclectik-website-H22026/eclectik-redesign-mockup.html` (homepage visual reference)
- `~/Desktop/eclectik-website-H22026/eclectik-funnel-plan.pptx` (funnel strategy & timeline)

## 1. Context & goal

The site is being restructured around the H2 2026 positioning ("Independent AI
transformation assurance"): new information architecture and content, same
visual identity, tech stack and infrastructure. This is a restructure, not a
reskin.

This spec covers the **Foundation phase** — build-order steps 1–4 of the
instructions doc, matching the funnel plan's **July milestone**:

1. Nav + routing skeleton (with redirects from old service URLs)
2. Home rebuild
3. Waiting-list form + `api/waitlist.ts`
4. Benchmark page

A second spec (**Qualification phase**, August) will cover: Scorecard +
`api/scorecard.ts`, door pages (`/proof-of-value`, `/proof-of-change`),
Insights listing + content migration, partner lanes, and the full SEO pass.
That spec is blocked on two external inputs: the scorecard question copy
(from Manish) and the sales-ready threshold formula.

**Out of scope everywhere in this repo:** the CRM side (`website-signal`
endpoint, Supabase upsert, lifecycle field) — that lives in the separate
`eclektik-crm` repo. This site only calls the webhook and degrades gracefully
when it is absent.

## 2. Repo & deployment strategy

- **Branch:** `h2-2026-redesign` off `main`, in this repo
  (`github.com/Eclectik-B-V/eclectik-website`).
- **Worktree:** the branch is checked out as a git worktree at
  `~/Desktop/eclectik-website-H22026` so the live site (`main`, this folder)
  and the redesign can be open side by side.
- **Vercel:** a **new, separate Vercel project** tracks `h2-2026-redesign` as
  its production branch and gets its own stable review URL for stakeholders.
  The existing Vercel project keeps auto-deploying `main`; the live site at
  eclectik.co is untouched throughout the build.
- **Domain cutover** (repointing `eclectik.co`/`www` from the old Vercel
  project to the new one, in Vercel + Cloudflare) is a deliberate, separate
  future action — explicitly **not** part of this spec.
- **Env vars for the new Vercel project:** `RESEND_API_KEY`,
  `RESEND_AUDIENCE_ID`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` (copied from
  the existing project), plus new `CRM_BASE_URL` and `CRM_WEBHOOK_SECRET`
  (optional — see §5).

## 3. What must not change (from the instructions doc §1)

- Tech stack: React 19 + Vite + TypeScript, Tailwind 4, wouter,
  framer-motion, shadcn/ui (Radix), react-helmet-async, sonner, pnpm.
- Design tokens in `client/src/index.css` (dark theme, `--primary: #65C1D6`,
  `--secondary: #E02406`, `--accent: #53ACA2`, glassmorphism cards; Outfit
  headings, Plus Jakarta Sans body).
- Visual language: hero with `hero-abstract-ai.png` + dual gradient overlays,
  left-aligned hero, eyebrow pattern, gradient text accents, sticky
  backdrop-blur header, `bg-black` footer.
- Logo: `/images/eclectik-logo-white-photo.svg` in header/footer.
- Infrastructure: `vercel.json` (SPA rewrite + security headers + CSP),
  `api/` serverless pattern, Resend integration, GTM/GA via
  `client/src/lib/tracking.ts`, ISO 27001 certificate modal.
- Component library: `client/src/components/ui/*` untouched; `Layout.tsx`
  stays the shell (nav contents only are edited).

## 4. Information architecture & routing

### New top nav (replaces the services mega-menu)

| Nav item | Route | Status in this phase |
|---|---|---|
| Benchmark | `/benchmark` | Built fully (§7) |
| Insights | `/insights` | **Placeholder page** ("coming August") |
| About | `/about` | Existing AboutUs page, route kept; content rework is Spec 2 |
| Contact | `/contact` | Existing page, unchanged |
| CTA button "Take the scorecard" | `/scorecard` | **Placeholder page** ("coming August") |

Placeholders are acceptable because this deploys to a review-only URL, not
the live domain. They let stakeholders review the full nav structure now and
are swapped for real pages in Spec 2. Placeholder pages use the standard
Layout, an eyebrow + H1 + one-line description, and a link back home.

### Old service pages

Consulting, ChangeManagement, ExecutiveCoaching, HRTechServices,
TrainingEnablement, PeopleScience, PeopleSuccessAcademy, CustomerSuccess and
the case-study pages are **not deleted**. They leave the top nav but their
routes keep resolving. Any old URL listed in `sitemap.xml` must not 404:
where a page is kept, the route stays; where the IA moves it, a wouter
`<Redirect>` maps old → new. (Full sitemap regeneration is Spec 2; the
redirects themselves land now because the nav changes now.)

Concrete mapping: the current About page is `/about-us`; the new nav uses
`/about` — the AboutUs page gets the `/about` route and `/about-us` redirects
to it. All other sitemap URLs keep their existing routes in this phase.
`Careers.tsx` exists, so the new footer's Careers link resolves.

### Eyebrow/tagline constant

The positioning string "Independent AI transformation assurance" goes into
`shared/const.ts` as a single constant, imported everywhere it appears, so
the pending naming decision (15 Jul landing-page test) is a one-line swap.

## 5. Waiting-list form + `api/waitlist.ts`

New serverless function `api/waitlist.ts`, following the existing
`api/contact.ts` pattern:

1. **Validate** input server-side with zod. Fields: `name`, `email` (work
   email), `company`, `role` (select), `sector` (select), `consent`
   (required boolean, unticked by default), `src` (optional attribution).
2. **CRM signal:** if `CRM_BASE_URL` and `CRM_WEBHOOK_SECRET` are set, POST
   to `${CRM_BASE_URL}/api/website-signal` with header
   `x-webhook-secret: ${CRM_WEBHOOK_SECRET}` and payload
   `{ source: 'website', event: 'waitlist_joined', email, name, company,
   role, sector, src? }`. If the env vars are absent or the call fails,
   **log and continue** — the user still gets a success response (email is
   the fallback record). Never expose CRM URL or secret client-side.
3. **Resend confirmation email** to the subscriber (and the existing
   behaviour of `subscribe.ts` stays as is for the newsletter).

Consent text on the form: benchmark updates only, unsubscribe anytime.

### Attribution

On first page load, read `?src=` from the URL and persist it in
`sessionStorage`. New `getAttribution()` helper in
`client/src/lib/tracking.ts`; every form submission includes it. No cookies.

### Tracking events

Extend `lib/tracking.ts` with `waitlist_joined` and `door_selected`
(value|change) events, each carrying `src`. (`scorecard_started` /
`scorecard_completed` are Spec 2.) No CSP change needed — the CRM call is
server-to-server.

## 6. Home rebuild (`client/src/pages/Home.tsx`)

Full rebuild per instructions §3.1, visual reference
`eclectik-redesign-mockup.html`. Section order:

1. **Hero.** Eyebrow: the `shared/const.ts` positioning constant. H1:
   "Is your AI transformation actually working?" with gradient-text on
   "actually working?". Sub: "We prove it — in the P&L and in your people."
   CTAs: secondary/red button → `/benchmark#waitlist` ("Join the benchmark
   waiting list"), outline button → `/scorecard` ("Take the 10-question
   scorecard"). Keep existing hero background image, overlays and
   framer-motion stagger.
2. **Two doors.** Header "One question, two proofs". Two glass cards:
   *Proof of value — CFO & CIO* (primary/blue) → `/proof-of-value`;
   *Proof of change — Transformation leaders* (accent/teal) →
   `/proof-of-change`. Door pages themselves are Spec 2 — in this phase the
   links go to placeholder pages (same pattern as §4). Card copy per the
   mockup.
3. **Proof band.** Four stats on `bg-white/5`, ONLY these, with attribution:
   `3×` (McKinsey), `57%` (KPMG/Melbourne, n=48k), `12%` (PwC), `42%`
   (S&P Global). Closing line: "The measurement gap is real. Only
   independent evidence resolves it." **Never the MIT 95% figure.**
4. **Benchmark prospectus band.** Kicker "The benchmark — opens September";
   capacity statement (~12 audits/year, Q3 full, waiting list hears first);
   the waiting-list form (§5) on the right.
5. **Insights teaser.** Three static insight cards (category + title +
   one-line summary), copy from the mockup. Wired to real Insights data in
   Spec 2.
6. **Footer** (in `Layout.tsx`). Slimmed: About / Insights / Careers /
   Contact + Trust column (ISO 27001, Privacy, Terms). Keep newsletter
   signup with consent checkbox.

**Removed from Home:** the "what if?" carousel, the five-service grid, the
sectors list, the AINews component (component file may stay until Spec 2
deletes the feed; it just isn't rendered).

## 7. Benchmark page (`/benchmark`) — new

The prospectus page: what the benchmark is (standardised KPIs, process-level
measurement, peer comparison), who it is for, the capacity statement, a
data-governance paragraph as **placeholder text marked
`<!-- LEGAL REVIEW PENDING -->`** (must be legal-reviewed before launch), and
the waiting-list form anchored at `#waitlist`. Smaller hero, no background
image — solid bg with eyebrow + H1.

## 8. Copy rules (hard constraints, instructions §5)

- Every claim must survive "is this true today?" Future things get dates.
- Never name unsigned partnerships; no fake scale; clients by shape only.
- Only the four verified stats, each with attribution.
- "Independent AI transformation assurance" — never "the AI audit".
- Evidence-first tone; no "leverage/unlock/seamless" filler; **British
  English** throughout new copy.
- JSON-LD email-domain fix: `info@eclectik.com` → the correct `.co` domain
  (one-line correctness fix, done now; the rest of the SEO pass is Spec 2).

## 9. Testing & verification

- `pnpm check` (tsc) and `pnpm build` pass clean.
- Manual browser verification of: every nav route renders; every URL from
  the current `sitemap.xml` resolves (no 404s); waiting-list form validates,
  submits, shows success, and sends the Resend email; form degrades
  gracefully with CRM env vars absent; `?src=` attribution survives
  navigation and lands in the submission payload.
- Screenshot-compare Home against `eclectik-redesign-mockup.html`.
- Visual identity check: tokens (colours, fonts, hero treatment)
  indistinguishable from the current site.

## 10. Definition of done (this phase)

- Foundation slice (nav skeleton, Home, Benchmark, waiting-list e2e) live on
  the new Vercel project's review URL.
- No route from the old `sitemap.xml` 404s.
- Waiting-list form writes a CRM signal when env vars are present and
  degrades gracefully when absent.
- No unverified statistic, no unsigned partner name, no "audit" in
  customer-facing copy.
- Visual identity unchanged at the token level.
