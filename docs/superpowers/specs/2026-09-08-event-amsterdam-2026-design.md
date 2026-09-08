# Event Amsterdam 6 oktober 2026: landingspagina en inschrijvingen

Ontwerp van 8 september 2026. Bron: een aangeleverde HTML-mockup, "AI
Transformation: Measure It. Steer It. Prove It.", een co-branded middag van
Workvivo by Zoom en Eclectik in het Zoom-kantoor Amsterdam.

## Doel

Drie dingen, in de woorden van de opdrachtgever: de pagina op de site zetten,
inschrijvingen in een net overzicht bijhouden, en bij elke nieuwe inschrijving
een mail krijgen.

## Besluiten

| Vraag | Keuze |
|---|---|
| Vormgeving | Het donkere Workvivo-ontwerp blijft, met de gewone header en footer van de site eromheen |
| Opslag | Via het bestaande `/api/website-signal` van het CRM, zoals de waitlist |
| Mail | Alleen de nieuwe inschrijving, plus een link naar een overzichtspagina |
| Beveiliging overzicht | Wachtwoord, geen geheime link |

De opslagkeuze is halverwege herzien. Het eerste voorstel was een eigen
`event_registrations`-tabel. Inspectie van het CRM liet zien dat
`marketing_leads`, `marketing_lead_activity` en `form_responses` precies hiervoor
bestaan en dat de waitlist er al in landt. Een eigen tabel zou dat dubbelop doen
en de inschrijvers buiten Marketing → Leads houden.

## Waarom de CRM-schrijfkant niet hoeft te wijzigen

Nagekeken in `api/_lib/website-signal-lib.js` van eclektik-crm:

- `validateSignal` eist alleen een geldig e-mailadres en een niet-leeg `event`.
  Geen whitelist, dus `event_registered` werkt zonder aanpassing.
- `activityPayload` kopieert elk veld dat niet `email`, `event`, `source` of
  `src` heet naar de vrije JSON-payload. Functie, land, telefoon, toestemming en
  de event-slug landen daar dus vanzelf. Dat is exact waar dat veld voor bedoeld
  is, blijkens de tabelcomment.
- `sector` is nullable. Een eerdere lezing van een schemadump zei NOT NULL; dat
  was een parseerfout, met SQL geverifieerd (`is_nullable = YES`).

De functietitel gaat naar `role`. Land, telefoon en de Workvivo-toestemming
leven in de payload.

## Onderdelen

### 1. De pagina

`client/src/pages/EventAmsterdam2026.tsx`, route `/events/amsterdam-2026`.

- Inhoud en opmaak volgen de mockup. Alle CSS wordt gescoped onder één
  wrapper-klasse (`.evt`) zodat niets naar de rest van de site lekt.
- Binnen `<Layout>`, dus met de gewone header en footer.
- De countdown wordt een React-timer, niet het losse script uit de mockup.
- De drie sprekersfoto's staan als bestand onder
  `client/public/images/events/amsterdam-2026/`. In de mockup zaten ze acht keer
  als base64, samen 270 KB, maar het zijn er drie uniek (101 KB).
- Titel, description en canonical zoals de rest van de site. In de sitemap.
- Na 6 oktober 2026 hoort hier een redirect te komen. Buiten scope, wel
  vastleggen.

### 2. Het formulier

Velden uit de mockup: voornaam, achternaam, zakelijk e-mailadres, bedrijf,
functie, land, telefoon (optioneel), en een verplichte toestemming voor het
delen met Workvivo by Zoom.

- Op het e-mailadres draait `isWorkEmail` uit `shared/work-email.ts`. De pagina
  vraagt er expliciet om.
- Toestemming is hier een echte verzendvoorwaarde, dus `z.literal(true)`, net
  als bij de waitlist en anders dan bij de scorecard.
- Foutmeldingen via `sonner`, zoals de andere formulieren.
- De "Privacy Policy"-link uit de mockup wijst naar `https://www.eclectik.co` en
  gaat naar `/privacy-policy`.

### 3. `api/event-registration.ts`

Volgt het patroon van de bestaande handlers: zod-validatie, `sanitizeSubject`,
`escapeHtml`, `AbortController` met `CRM_TIMEOUT_MS`.

Volgorde en foutgedrag:

1. POST naar `${CRM_BASE_URL}/api/website-signal` met header `x-webhook-secret`.
   Faalt dit, dan krijgt de bezoeker een foutmelding: zonder record is er geen
   inschrijving.
2. Mail naar de organisator: de nieuwe inschrijving plus een link naar het
   overzicht. Best-effort, mag de request niet laten falen.
3. Ontvangstbevestiging naar de inschrijver, met de mededeling dat de plek na
   een check op rol wordt bevestigd. Dat is wat de pagina belooft. Best-effort.

Payload naar het CRM:

```json
{
  "source": "website",
  "event": "event_registered",
  "email": "...",
  "name": "<voornaam> <achternaam>",
  "company": "...",
  "role": "<functietitel>",
  "eventSlug": "amsterdam-2026",
  "eventName": "AI Transformation: Measure It. Steer It. Prove It.",
  "eventDate": "2026-10-06",
  "country": "...",
  "phone": "...",
  "consentWorkvivo": true,
  "src": "<attributie>"
}
```

`sector` wordt bewust niet meegestuurd. Alles buiten `email`, `event`, `source`
en `src` belandt in `marketing_lead_activity.payload`.

### 4. Leesendpoint in het CRM

Nieuw: `GET /api/event-registrations?event=amsterdam-2026` in eclektik-crm,
achter dezelfde `requireWebhookSecret(req, res, 'WEBSITE_WEBHOOK_SECRET')` als
het schrijfendpoint.

Geeft terug, gesorteerd op tijdstip oplopend:

```json
{ "ok": true, "event": "amsterdam-2026", "count": 12, "registrations": [
  { "occurred_at": "...", "email": "...", "full_name": "...", "company": "...",
    "role": "...", "country": "...", "phone": "...", "consent_workvivo": true }
] }
```

Bron: `marketing_lead_activity` waar `event = 'event_registered'` en
`payload->>'eventSlug'` gelijk is aan de gevraagde slug, gejoind met
`marketing_leads` voor naam, bedrijf en functie. Eén rij per inschrijving.
Dubbele inschrijvingen van hetzelfde adres leveren meerdere activity-rijen op;
het endpoint ontdubbelt op e-mailadres en houdt de eerste.

### 5. `api/event-registrations.ts` op de site

Proxy zodat de site geen databasetoegang nodig heeft.

- POST met `{ password, event }`.
- Vergelijkt met `EVENT_ADMIN_PASSWORD` in constante tijd. Mist die env var, dan
  500 met een duidelijke log.
- Bij een juist wachtwoord: haalt het CRM-endpoint op en geeft het resultaat
  door. Bij een fout wachtwoord 401, zonder onderscheid te maken tussen "geen
  wachtwoord ingesteld" en "verkeerd wachtwoord".

### 6. De overzichtspagina

`client/src/pages/EventAmsterdam2026Registrations.tsx`, route
`/events/amsterdam-2026/registrations`. Noindex, niet in de sitemap.

- Wachtwoordveld, daarna de lijst. Het wachtwoord blijft in `sessionStorage`
  zodat een herlaadbeurt niet opnieuw vraagt.
- Teller, tabel met datum, naam, bedrijf, functie, e-mailadres, land en
  telefoon, en een CSV-knop die client-side uit de geladen data wordt gebouwd.
- In Eclectik-stijl, niet in het donkere eventontwerp. Dit is een intern
  hulpmiddel.

## Beveiliging

Een wachtwoord, geen token in de url. Op de lijst staan namen, zakelijke
e-mailadressen, werkgevers en functies van gasten: persoonsgegevens. Een token in
een url lekt via doorsturen, browsergeschiedenis en referrers, en die link staat
straks in elke notificatiemail.

## Omgevingsvariabelen

Website, nieuw: `EVENT_ADMIN_PASSWORD`. Verder niets: `CRM_BASE_URL`,
`CRM_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` en
`CONTACT_TO_EMAIL` staan er al.

CRM: niets nieuws. `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` en
`WEBSITE_WEBHOOK_SECRET` zijn aanwezig.

## Testen

- Unit: `api/event-registration.test.ts` in de stijl van de vier bestaande
  testbestanden, met gemockte Resend en CRM. Dekt de methodguard, validatie, de
  werkmailcheck, de verplichte toestemming, de payloadvorm richting het CRM, en
  het gedrag als de mail faalt maar het CRM slaagt.
- Unit in het CRM voor het leesendpoint, met de bestaande vitest-opzet daar.
- Browser: de pagina doorlopen op de dev-server, formulier invullen met een
  gestubde fetch, en het overzicht met een gestubd antwoord.
- Na deploy: één echte inschrijving als rooktest, daarna die rij opruimen.

## Buiten scope

- Redirect na 6 oktober 2026.
- Een goedkeuringsknop voor de rolcheck. `marketing_leads.status` bestaat al;
  goedkeuren blijft voorlopig handwerk in het CRM.
- Spambescherming op het formulier. Geldt voor alle formulieren op de site en
  staat als los punt open.

## Openstaand punt voor de opdrachtgever

De toestemmingstekst deelt persoonsgegevens met Workvivo by Zoom, een doorgifte
aan een derde partij. Beschrijft `/privacy-policy` die doorgifte? Zo niet, dan
belooft het formulier iets wat de verklaring niet dekt.
