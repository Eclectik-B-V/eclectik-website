# Scorecard fase 1 — design spec (website + CRM)

**Datum:** 2026-07-09
**Status:** goedgekeurd door Olivier (besluiten 1–3 + generieke responses-tabel)
**Bron:** [Marco's build-spec v1.0](2026-07-07-scorecard-build-spec-marco-v1.md) — vragenbank,
scoring, routing, kwadrantteksten en privacyregels staan dáár en worden hier
niet gedupliceerd. Deze spec legt de technische invulling en de afwijkingen vast.

## Besluiten (Olivier, 9 juli)

1. **Marketing leads, geen sales leads.** §7.3 van Marco's spec ("create row in
   `leads`") vervalt: scorecard-invullers worden marketing leads met een
   `scorecard_completed`-activiteit. Promoveren blijft handmatig. (Afwijking
   t.o.v. Marco's spec — Marco informeren bij review.)
2. **PDF-rapport en follow-upmails → fase 2** (wachten op Marco's mailteksten
   en definitieve gap-regels).
3. **Huisstijl van de site blijft ongewijzigd** — het paletje in §11 van
   Marco's spec wordt niet overgenomen.
4. **Generieke `form_responses`-tabel** i.p.v. scorecard-specifiek: latere
   formulieren zijn een nieuwe `form_type`, geen nieuwe tabel.
5. **Teaser eerst, werkmail voor het volledige resultaat** (herzien 9 juli;
   verving het eerdere besluit "e-mail verplicht om íets te zien"). Na de
   laatste vraag verschijnt direct een licht teaser-resultaat: de Evidence
   Readiness Index + het kwadrant. De volledige uitslag (drie deelscores,
   gap-bullets, geroute CTA) vereist een wérkmailadres — gratis providers
   (gmail, hotmail e.d.) worden geweigerd. Dit schuift terug richting Marco's
   §9, met twee verschillen: e-mail blijft verplicht voor het volledige
   resultaat, en het moet een werkmail zijn. Let op voor Marco's review: niet
   elke complete levert meer een lead op; het funneltarget ≥50%
   e-mailconversie op completes (§10) is meetbaar als `sc_email_submitted` /
   `sc_completed`. Afhakers na de teaser laten alleen analytics-events na —
   er is geen anonieme opslag (bewuste keuze, houdt het CRM-intake ongewijzigd;
   de weekstats bevatten dus alleen completes mét e-mail).

## Architectuur

```
Browser (SPA)                    Website (Vercel fn)          CRM (Vercel fn + Supabase)
┌──────────────────┐  POST      ┌──────────────────┐  POST   ┌──────────────────────────┐
│ /scorecard flow   │──────────▶│ api/scorecard.ts  │────────▶│ api/scorecard-intake.js   │
│ scoring client-   │  (geen     │ valideert, proxy't│ secret  │ herberekent scores        │
│ side (instant     │  secret in │ met x-webhook-    │         │ → form_responses (ruw)    │
│ resultaat)        │  browser)  │ secret            │         │ → marketing lead +        │
└──────────────────┘            └──────────────────┘         │   activiteit (samenvatting)│
                                                              │ → notificatiemail Marco    │
                                                              └──────────────────────────┘
```

- **Scores worden twee keer berekend**: client-side voor het directe resultaat,
  en server-side in de intake vanuit de ruwe antwoorden. De server-waarden zijn
  leidend voor opslag en statistiek (manipulatie/bugs in de browser kunnen de
  cijfers niet vervuilen). Zelfde pure functie, gedeeld in `shared/`.
- **Privacyregel technisch afgedwongen**: ruwe antwoorden bestaan alleen in
  `form_responses` (RLS zonder policies → alleen de service key kan erbij, dus
  onzichtbaar in de CRM-UI). De marketing-lead-activiteit krijgt uitsluitend
  scores, band, kwadrant en route.

## Website (repo eclectik-website, branch h2-2026-redesign)

### Vragenbank + scoring: `shared/scorecard.ts`
- De JSON uit Marco's spec §2 als typed constante (blocks, 20 vragen, anchors,
  scores, profielvragen P1–P3).
- Pure functies met vitest-tests tegen §3. Het website-repo heeft nog geen
  testrunner: voeg vitest toe als devDependency + `"test": "vitest run"`
  script (zelfde patroon als het CRM-repo; co-located `.test.ts`):
  - `scoreAnswers(answers)` → `{value, change, readiness, index}` (0–100, afgerond)
  - `band(x)` → blind_spot / partial_view / evidence_led
  - `quadrant(value, change)` → de vier kwadranten (drempel 60)
  - `route(profile, scores, answers)` → assessment / insight_review / benchmark /
    workshop volgens §4 (top-down, eerste match wint) + `readinessOverlay` boolean
  - `gapBullets(answers)` → 2–3 laagst scorende vragen met placeholder-regel
    ("what good looks like" = anchor-tekst van score 4), conform §5

### Flow: `/scorecard` (vervangt de placeholderpagina)
- Zonder `?door=`: deurkeuzescherm (twee kaarten, zelfde stijl als de
  homepage-deuren). Met `?door=value|change`: direct de flow in;
  de homepage-deuren en CTA's linken met de juiste parameter.
  `trackDoorSelected` blijft werken.
- Vraagvolgorde per deur conform §11; één vraag per scherm, progressbar,
  terugknop, radio's met uitgeschreven anchors, "don't know" altijd eerste optie.
- Voortgang in sessionStorage (reload-bestendig binnen de sessie); geen login.
- P1–P3 als laatste, daarna direct de resultaatpagina (teaser + inline
  e-mailgate). Herladen met 23 complete antwoorden → terug op de teaser,
  niet op de laatste vraag.

### Resultaatpagina: teaser + inline e-mailgate (besluit 5, herzien)
- **Teaser (direct zichtbaar, geen e-mail nodig):** Evidence Readiness
  Index-dial (kleur per band) + kwadrantkaart met de EN-teksten uit §5
  (verbatim). Een echt, licht resultaat — geen vervaagde preview van de rest.
- **Formulierkaart direct onder de teaser:** "Fill out your work email for
  the full report" — werkmailveld, consent-checkbox standaard uit ("Send me
  the monthly insights letter", los van de rapportlevering), doel +
  bewaartermijn in één regel, plus de regel dat de volledige uitslag direct
  op het scherm verschijnt (het PDF-rapport zelf is fase 2 — geen belofte
  van een directe bijlage).
- **Werkmail-validatie:** geëxporteerde functie in `shared/` (blokkadelijst
  van gratis providers: gmail, googlemail, hotmail, outlook, live, yahoo,
  icloud, proton, gmx, en de gangbare NL-consumentendomeinen) met
  vitest-tests; toegepast client-side (foutmelding "Please use your work
  email") én server-side in de zod-validatie van `api/scorecard.ts`
  (relatieve import — het `@shared`-alias werkt niet in Vercel functions).
- **Na geldige e-mail:** één POST (payload ongewijzigd, dus het CRM-intake
  blijft onaangeraakt), daarna verschijnt de volledige weergave: drie
  deelscore-dials (Value/Change/Readiness), 2–3 gap-bullets, geroute CTA
  volgens §4 (benchmark-route → `/benchmark#waitlist`),
  readiness-overlayregel indien readiness < 40. CRM onbereikbaar → volledige
  resultaat tóch tonen (zelfde degradatie als de waitlist).
- Bestaande site-tokens en componenten (glassmorphism cards,
  primary/secondary accenten per deur binnen het bestaande palet).

### API: `api/scorecard.ts`
- Valideert (zod, zoals api/waitlist.ts), berekent niets zelf behalve
  doorgeven; POST naar `${CRM_BASE_URL}/api/scorecard-intake` met
  `x-webhook-secret: CRM_WEBHOOK_SECRET` (bestaande env vars). Zelfde
  degradatiegedrag als de waitlist: CRM onbereikbaar → logt, bezoeker merkt
  niets (resultaat is toch al client-side getoond); response 200.
- Attributie: `src` uit sessionStorage (bestaand mechanisme) mee in de payload.

### Analytics
- Events `sc_start` (met deur), `sc_q_answered` (id), `sc_completed`,
  `sc_email_submitted`, `sc_cta_clicked` (route) via het bestaande
  tracking-patroon in `client/src/lib/tracking.ts`.

## CRM (repo eclektik-crm, Supabase jdzaypckluncdwsoxurs)

### Tabel `form_responses` (generiek, afgeschermd)
```sql
create table public.form_responses (
  id           uuid primary key default gen_random_uuid(),
  form_type    text not null,            -- 'scorecard' (later: andere formulieren)
  email        text,                     -- scorecard vult dit altijd (besluit 5);
                                         -- kolom blijft nullable voor toekomstige form_types
  consent      boolean not null default false,
  entry_meta   jsonb,                    -- deur, utm/src, user-agent-klasse
  answers      jsonb not null,           -- ruwe antwoorden {"V1":3, ...} + P1..P3
  computed     jsonb,                    -- server-side: scores, banden, kwadrant, route
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- RLS: enabled, GEEN policies → alleen service key (bewust onzichtbaar in de CRM-UI)
create index idx_form_responses_type_created on public.form_responses(form_type, created_at desc);
```

### Endpoint `api/scorecard-intake.js`
- Guard: `requireWebhookSecret(req, res, 'WEBSITE_WEBHOOK_SECRET')` (bestaand).
- Eén modus (e-mail zit altijd in de payload, besluit 5): valideer e-mail +
  antwoorden tegen de vragenbank-ids, herbereken scores server-side (zelfde
  regels als §3, geport naar een klein `api/_lib/scorecard-lib.js` met
  vitest-tests), sla op in `form_responses`, maak de marketing lead aan via de
  bestaande logica (vind-of-maak op e-mail, activiteit `scorecard_completed`
  met payload = scores + banden + kwadrant + route + deur — géén ruwe
  antwoorden) en verstuur de notificatie. Retourneer `{ok:true}`.
- Notificatie (fase 1, simpel): mail naar Marco via Resend wanneer route =
  `assessment` of index ≥ 70. Weekly digest en List-C/contact-matching → fase 2.

### Statistiek: view `scorecard_weekly_stats`
- Weekaggregatie over `form_responses` met `form_type='scorecard'`: n,
  gemiddelde scores, % blind_spot per dimensie, kwadrantverdeling, split per
  rol/organisatiegrootte (uit answers/computed jsonb). Alleen via SQL/service
  te raadplegen; publicatieregel n ≥ 30 geldt voor extern gebruik (§9).

### Huisregels
- Versiebump + changelog-entry + tag (v1.53.0), migratie-SQL in `sql/`,
  commits per stap, nooit pushen zonder akkoord.

## Fase 2 (niet nu)
PDF-rapport (server-side render), 3 follow-upmails per track (kopij Marco),
weekly digest-notificatie, contact/List-C-matching met ownernotificatie,
definitieve gap-regels (Marco/Manish), NL-versie, publicatie van aggregaten.

## Definition of done (fase 1)
- Test op beide deuren → juiste vraagvolgorde, scores kloppen met §3
  (unit-tests + handmatige steekproef)
- Na afronden is de teaser (index + kwadrant) direct zichtbaar; deelscores,
  gaps en CTA zijn niet bereikbaar zonder geldig werkmailadres (gratis
  providers geweigerd, client- én server-side); invullen mét werkmail → rij
  in `form_responses` + marketing lead met `scorecard_completed`-activiteit
  zichtbaar in Marketing → Leads (alleen samenvatting, geen ruwe antwoorden)
- Route assessment of index ≥ 70 → notificatiemail bij Marco
- `scorecard_weekly_stats` geeft data terug
- Verkeerde secret → 401; live site (main) onaangetast
