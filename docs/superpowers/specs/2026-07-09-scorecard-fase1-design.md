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
- P1–P3 als laatste, daarna de e-mailstap, daarna het resultaat.

### E-mailstap (gate conform §1/§9, aangepast aan fase 1)
- E-mail optioneel: zonder e-mail → resultaat op het scherm; mét e-mail →
  zelfde resultaat + "je volledige rapport volgt per e-mail" (het rapport zelf
  is fase 2 — geen belofte van een directe bijlage).
- Consent-checkbox, standaard uit: "Send me the monthly insights letter",
  los van de rapportlevering. Doel + bewaartermijn in één regel op deze stap.
- Submissiegedrag: bij afronden van de vragen wordt de response al opgeslagen
  (e-mail leeg). Vult de bezoeker daarna e-mail in, dan volgt een tweede call
  met het `response_id` dat de rij aanvult én pas dan de marketing lead
  aanmaakt. Zonder e-mail dus wél statistiek, geen lead.

### Resultaatpagina
- Drie score-dials (Value/Change/Readiness), kleur per band; kwadrantkaart met
  de EN-teksten uit §5; 2–3 gap-bullets; geroute CTA volgens §4 (waarbij de
  benchmark-route naar `/benchmark#waitlist` linkt); readiness-overlayregel
  indien readiness < 40. Bestaande site-tokens en componenten (glassmorphism
  cards, primary/secondary accenten per deur binnen het bestaande palet).

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
  email        text,                     -- null tot de gate gepasseerd is
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
- Twee modi:
  1. **Nieuwe response** (bij afronden vragen): valideer antwoorden tegen de
     vragenbank-ids, herbereken scores server-side (zelfde regels als §3,
     geport naar een klein `api/_lib/scorecard-lib.js` met vitest-tests),
     sla op in `form_responses`, retourneer `{ok, response_id}`.
  2. **E-mail toevoegen** (`response_id` + email + consent): update de rij; maak
     dán de marketing lead aan via de bestaande logica (vind-of-maak op e-mail,
     activiteit `scorecard_completed` met payload = scores + banden + kwadrant
     + route + deur — géén ruwe antwoorden) en verstuur de notificatie.
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
- Afronden zonder e-mail → rij in `form_responses` (email null), géén lead
- E-mail toevoegen → rij aangevuld + marketing lead met `scorecard_completed`-
  activiteit zichtbaar in Marketing → Leads (alleen samenvatting, geen antwoorden)
- Route assessment of index ≥ 70 → notificatiemail bij Marco
- `scorecard_weekly_stats` geeft data terug
- Verkeerde secret → 401; live site (main) onaangetast
