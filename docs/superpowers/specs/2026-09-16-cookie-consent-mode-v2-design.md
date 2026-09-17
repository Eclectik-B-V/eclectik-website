# Design: cookie consent en Google Consent Mode v2

Datum: 2026-09-16
Status: goedgekeurd door gebruiker, klaar voor implementatieplan

## Aanleiding

Google Analytics 4 draait al op eclectik.co. Drie tags staan hardcoded in `client/index.html` en zijn live geverifieerd op `https://www.eclectik.co/`:

| Tag | ID |
|---|---|
| Google Tag Manager | `GTM-KZKSN8CT` |
| Google Analytics 4 | `G-LD7EPKT1W2` |
| LinkedIn Insight Tag | `9108033` |

Alle drie vuren onvoorwaardelijk bij pageload. Er is geen cookiebanner, geen Consent Mode, en geen opslag van toestemming. De pagina `/cookie-settings` suggereert dat de bezoeker voorkeuren kan instellen, maar `handleSave` in `client/src/pages/CookieSettings.tsx` schrijft alleen een `console.log`. De pagina belooft dus iets wat hij niet doet, wat op zichzelf een groter risico is dan het ontbreken van de banner.

Dit ontwerp beschrijft alleen de consent-laag. Drie andere bekende problemen blijven expliciet buiten scope en krijgen een eigen traject:

1. Mogelijke dubbele tagging: zowel de GTM-container als een directe `gtag('config', ...)` staan in de head. Of dit tot dubbele pageviews leidt, hangt af van de inhoud van de GTM-container en is niet uit de code af te leiden.
2. De event-tracking is grotendeels niet aangesloten. `client/src/lib/tracking.ts` bevat negen functies, maar alleen `trackCTAClick` en `trackNewsletterSignup` worden aangeroepen, beide in `client/src/pages/Home.tsx`. Het contactformulier importeert `tracking` niet, dus `contact_form_submit` wordt nooit verzonden, ondanks dat `ANALYTICS.md` het als werkend beschrijft.
3. De tag-IDs staan hardcoded in de HTML in plaats van in een omgevingsvariabele, en `ANALYTICS.md` verwijst nog naar het oude domein `eclectik-insights.co`.

## Genomen besluiten

| Besluit | Keuze | Overweging |
|---|---|---|
| Consentmodel | Google Consent Mode v2, advanced | Behoudt geconsenteerde conversiemodellering en beperkt dataverlies. Bewust geaccepteerd nadeel: er gaat een cookieloos request naar Google voordat toestemming is gegeven, en de Autoriteit Persoonsgegevens is daar kritisch over. De gebruiker is hierop gewezen en kiest hier bewust voor. |
| Implementatie | Zelfbouw in React, geen externe CMP | De cookievoorkeurenpagina bestaat al en moet hoe dan ook gerepareerd worden. Zelfbouw levert een samenhangend systeem, eigen huisstijl, geen abonnement en geen extra blocking script. Een externe CMP wordt pas aantrekkelijk zodra auditbewijs van toestemmingen nodig is, bijvoorbeeld voor een vendor assessment van een enterprise-klant. |
| Tests | Vitest toevoegen | Het project heeft nu geen testframework en nul testbestanden. Consent-logica gaat stil kapot en dat merk je pas maanden later aan een datagat, dus deze laag verdient unit tests. |
| LinkedIn | Harde gating, geen Consent Mode | De LinkedIn Insight Tag ondersteunt Google Consent Mode niet en zet zijn cookies ongeacht het `ad_storage`-signaal. Hij moet dus fysiek niet geladen worden tot marketing-consent er is. |

## Architectuur

Vier lagen, elk met een eigen verantwoordelijkheid.

### Laag 1: consent bootstrap (inline in `client/index.html`)

Een inline, synchroon script als allereerste element in de `<head>`, boven de GTM-snippet. Het moet inline zijn omdat de defaults gezet moeten zijn voordat GTM laadt. Verantwoordelijkheden:

1. `window.dataLayer` en de `gtag`-shim initialiseren.
2. De cookie `eclectik_consent` synchroon lezen.
3. `gtag('consent', 'default', {...})` met alle signalen op `denied`, behalve `security_storage` op `granted`, en `wait_for_update: 500`.
4. `gtag('set', 'ads_data_redaction', true)` en `gtag('set', 'url_passthrough', true)`.
5. Als er een geldige opgeslagen keuze is: direct `gtag('consent', 'update', {...})` met de opgeslagen waarden, nog steeds voor GTM laadt.

### Laag 2: consent-store (`client/src/lib/consent.ts`, nieuw)

De enige plek die weet hoe toestemming wordt opgeslagen en hoe categorieen zich verhouden tot Google-signalen.

Publieke interface:

- `type ConsentCategories = { analytics: boolean; marketing: boolean; functional: boolean }`
- `type StoredConsent = { version: number; timestamp: string; categories: ConsentCategories }`
- `readConsent(): StoredConsent | null`
- `writeConsent(categories: ConsentCategories): void`
- `hasValidConsent(): boolean`
- `applyConsent(categories: ConsentCategories): void`
- `CONSENT_VERSION: number`

Opslag: first-party cookie `eclectik_consent`, `max-age` twaalf maanden, `SameSite=Lax`, `Secure`, `path=/`. Cookie boven localStorage omdat de vervaltermijn dan door de browser wordt afgedwongen in plaats van door eigen code.

Mapping van categorie naar Google Consent Mode v2 signaal, op exact een plek gedefinieerd:

| Categorie | Signalen |
|---|---|
| essential | `security_storage`, altijd `granted` |
| analytics | `analytics_storage` |
| marketing | `ad_storage`, `ad_user_data`, `ad_personalization` |
| functional | `functionality_storage`, `personalization_storage` |

`applyConsent` doet twee dingen: een `gtag('consent', 'update', ...)` en een `consent_update` push naar de dataLayer, zodat GTM-triggers erop kunnen reageren.

`CONSENT_VERSION` bepaalt of oude toestemming nog geldt. Verhoog je het nummer, dan vervalt opgeslagen toestemming en verschijnt de banner opnieuw. Dit is nodig zodra er een tracker bijkomt.

### Laag 3: React-laag

- `ConsentProvider` (nieuw, gemonteerd in `client/src/App.tsx`): houdt de consent-state, biedt `consent`, `setConsent` en `openPreferences` aan via context.
- `CookieBanner` (nieuw): verschijnt alleen als `hasValidConsent()` false is. Drie knoppen met gelijk visueel gewicht: alles accepteren, alleen noodzakelijk, voorkeuren aanpassen. Weigeren moet even makkelijk zijn als accepteren, anders is de toestemming niet vrij gegeven en juridisch ongeldig.
- `CookieSettings` (bestaand, herschrijven): initialiseert uit `readConsent()` in plaats van uit een hardcoded object, en `handleSave` roept `writeConsent` en `applyConsent` aan in plaats van `console.log`. Toont een bevestiging via de bestaande sonner-toaster.
- De footerlink naar `/cookie-settings` in `client/src/components/Layout.tsx` blijft ongewijzigd en is de route om toestemming later in te trekken.

### Laag 4: LinkedIn-gating (`client/src/components/LinkedInInsightTag.tsx`, nieuw)

De Insight Tag-scripts en de noscript-pixel verdwijnen uit `client/index.html`. De component injecteert het script pas wanneer `marketing === true`, en precies een keer. Bij intrekken van marketing-consent kan het al geladen script niet worden teruggedraaid, dus volgt een herlaadactie van de pagina. Dat is eerlijker dan doen alsof de tag verdwenen is.

## Dataflow

**Eerste bezoek.** Bootstrap zet alle signalen op denied. GTM en GA4 laden en sturen een cookieloze ping. De banner verschijnt. De bezoeker kiest. `writeConsent` schrijft de cookie, `applyConsent` stuurt de update naar Google. GA4 schakelt over op volledige meting en de LinkedIn-component injecteert de tag als marketing geaccepteerd is.

**Herhaalbezoek.** De bootstrap leest de cookie en stuurt de `consent update` voordat GTM laadt. Geen banner, geen flikkering, geen verloren pageview.

**Intrekken.** Via `/cookie-settings`. De cookie wordt herschreven en de consent update gaat direct weg. Voor LinkedIn volgt een herlaadactie.

## Foutafhandeling

| Situatie | Gedrag |
|---|---|
| Cookies geblokkeerd | Behandelen als geen toestemming. Banner tonen. Schrijfactie faalt stil. |
| Corrupte of onleesbare cookiewaarde | Behandelen als geen toestemming. Banner tonen. Nooit crashen. |
| `window.gtag` afwezig, bijvoorbeeld door een adblocker | Alle consent-calls zijn stille no-ops. De banner blijft functioneren. |
| Opgeslagen `version` lager dan `CONSENT_VERSION` | Oude toestemming vervalt, banner verschijnt opnieuw. |
| Opgeslagen toestemming ouder dan twaalf maanden | Cookie is al verlopen via `max-age`, dus dit gedraagt zich als een eerste bezoek. |

Elke lees- en schrijfactie zit in een `try`/`catch`.

## Bewuste duplicatie

Het bootstrap-script in `index.html` dupliceert de cookienaam en de signaalmapping uit `consent.ts`. Dit is onvermijdelijk: het script draait voordat de bundle bestaat. De duplicatie wordt zo klein mogelijk gehouden en krijgt een comment die naar `consent.ts` verwijst, zodat duidelijk is dat een wijziging op twee plekken moet landen.

## Verificatie

**Unit tests** (vitest, nieuw toe te voegen) voor `consent.ts`:

- schrijven en teruglezen van elke categoriecombinatie
- corrupte cookiewaarde levert `null` op in plaats van een exception
- ontbrekende cookie levert `null` op
- opgeslagen versie lager dan `CONSENT_VERSION` telt als ongeldig
- de categorie-naar-signaal mapping produceert de juiste Google-payload

**Browserverificatie**, uit te voeren door de implementatie en als bewijs op te leveren:

- de dataLayer bevat een `consent default` call voor de GTM-snippet
- het request naar Google bevat `gcs=G100` voordat toestemming is gegeven en `gcs=G111` erna
- er vertrekt geen enkel request naar `snap.licdn.com` voordat marketing is geaccepteerd
- na een herhaalbezoek verschijnt de banner niet en is de `consent update` alsnog verzonden
- `/cookie-settings` toont de eerder gemaakte keuze correct terug

## Raakvlakken

| Bestand | Wijziging |
|---|---|
| `client/index.html` | Bootstrap-script toevoegen bovenin de head. LinkedIn-scripts en noscript-pixel verwijderen. |
| `client/src/lib/consent.ts` | Nieuw. |
| `client/src/components/CookieBanner.tsx` | Nieuw. |
| `client/src/components/LinkedInInsightTag.tsx` | Nieuw. |
| `client/src/contexts/ConsentContext.tsx` | Nieuw. |
| `client/src/App.tsx` | `ConsentProvider`, `CookieBanner` en `LinkedInInsightTag` monteren. |
| `client/src/pages/CookieSettings.tsx` | Herschrijven zodat hij de store leest en schrijft. |
| `package.json` | Vitest en een `test`-script toevoegen. |
