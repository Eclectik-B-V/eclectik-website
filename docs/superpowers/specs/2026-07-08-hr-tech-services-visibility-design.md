# HR Tech Services visibility — design spec

**Date:** 2026-07-08
**Status:** Approved
**Scope:** H2 2026 redesign branch (`h2-2026-redesign`), addendum to the Foundation phase

## Problem

The Foundation rebuild replaced the header nav and footer, which removed all
links to the HR Tech Services consultancy pages. The pages themselves survived —
`/hrtechservices` and its six sub-pages are still routed and render — but
nothing on the site points to them. Eclectik still wants to serve customers
looking for HR Tech consultancy, so the section must be findable again.

## Decision (Olivier, 2026-07-08)

Restore visibility via **nav + footer only**. The new homepage stays focused on
the AI-assurance story; no homepage sections are restored.

## Changes

All changes are in `client/src/components/Layout.tsx`. No routing, page, or
copy changes.

### 1. Header nav

Insert into `navLinks` between Insights and About, so the nav reads
*Benchmark · Insights · HR Tech Services · About · Contact*:

```ts
{
  name: "HR Tech Services",
  href: "/hrtechservices",
  dropdown: [
    { name: "Customer Success", href: "/services/customer-success" },
    { name: "People Science", href: "/services/people-science" },
    { name: "Change Management", href: "/services/change-management" },
    { name: "People Success Academy", href: "/training/people-success-academy" },
    { name: "Training & Enablement", href: "/training/enablement" },
    { name: "Executive Coaching", href: "/training/executive-coaching" },
  ],
}
```

Same label, href, and dropdown items as the live site. The new Layout already
renders dropdowns in both desktop (hover) and mobile (expanded list) nav —
this is a data-only change.

### 2. Footer

Add an **HR Tech Services** column between Company and Trust, mirroring the old
footer's column content plus a link to the hub page:

- HR Tech Services → `/hrtechservices`
- Customer Success → `/services/customer-success`
- People Science → `/services/people-science`
- Change Management → `/services/change-management`

The footer grid goes from `lg:grid-cols-4` to `lg:grid-cols-5`; the existing
`md:grid-cols-2` wrapping handles tablet/mobile.

## Out of scope

- Homepage sections (ServicePillars / ServicesOverview stay unused on Home)
- Any copy or content changes to the HR Tech pages
- The live site (`main` branch) — unchanged

## Verification

- Desktop nav shows the item with a working hover dropdown; all 7 links navigate
- Mobile menu shows the group with its 6 sub-links
- Footer column renders and links work
- No console errors; `pnpm build` (tsc) passes
