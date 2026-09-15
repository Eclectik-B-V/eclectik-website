# Landingspagina voor Microsoft-sellers, /microsoft

Ontwerpbesluiten bij de briefing van Marco, "Briefing Olivier: landingspagina
voor Microsoft-collega's", 15 september 2026. De briefing beschrijft wat er op
de pagina moet staan. Dit document beschrijft hoe het in deze codebase zit en
waarom op drie punten van de briefing is afgeweken.

## 1. Route en bereikbaarheid

`/microsoft`, geregistreerd in `client/src/App.tsx`. De pagina staat niet in
`NAV_LINKS` van `SiteHeader`, niet in `client/public/sitemap.xml` en niet in
`llms.txt`. Er wijst nergens op de site een link naartoe.

Campagnemeting loopt via de bestaande `?src=` parameter, dus één route kan
meerdere mailings bedienen zonder nieuwe deploy.

## 2. Noindex, en waarom niet via robots.txt

De briefing vraagt om `noindex, nofollow` plus een vermelding in robots.txt.
Het eerste zit erin, het tweede bewust niet.

De site is een client-rendered SPA. De meta-tag die de pagina zet staat pas in
de DOM nadat de JavaScript heeft gedraaid, dus een crawler die geen JS uitvoert
ziet hem nooit. Daarom staat de afdwingbare versie in `vercel.json` als header
op `/microsoft`:

```json
{
  "source": "/microsoft",
  "headers": [
    { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" }
  ]
}
```

Die geldt ongeacht rendering. De meta-tag blijft erin staan als tweede slot.

Alleen die meta-tag is op zichzelf niet genoeg, en dat is geen detail.
`client/index.html` zet sitebreed `robots: index, follow` én
`googlebot: index, follow`, en React vervangt die niet maar zet er een tag
naast. Googlebot geeft een `googlebot`-tag voorrang boven een `robots`-tag, dus
een crawler die de JS wél uitvoert zou op deze pagina een expliciete opdracht
vinden om hem te indexeren. Een effect in de component zet daarom beide
site-tags op `noindex, nofollow` zolang de pagina gemonteerd is, en zet ze bij
unmount terug, want ze zijn gedeeld met elke andere route in de SPA.

Een `Disallow: /microsoft` in robots.txt zou twee dingen fout doen. Het zet de
URL in een bestand dat iedereen kan opvragen, dus het maakt het pad juist
vindbaar. En het verbiedt crawlers de pagina op te halen, waardoor ze de
noindex nooit lezen en de URL alsnog in de index kan belanden op basis van
externe links. Niets in robots.txt is hier de betere keuze.

Dit alles maakt de pagina onvindbaar, niet afgeschermd. Iedereen met de URL kan
hem openen. Dat is ook de bedoeling: de PS van de uitgaande mail vraagt sellers
om hem door te sturen. Het betekent wel dat de vier punten uit paragraaf 7 van
de briefing echte blockers zijn, want zodra de pagina live staat is de inhoud
publiek bereikbaar voor wie de link heeft.

Linkpreviews in Teams en LinkedIn tonen de og-tags uit `client/index.html`, de
algemene Eclectik-kaart. React-tags worden door die scrapers niet gelezen. Dat
is hier gunstig, want de Microsoft-specifieke kop verschijnt dan niet in een
preview die verder gedeeld wordt.

## 3. Geen Layout

`MicrosoftSellers.tsx` rendert zonder `Layout`, dus zonder `SiteHeader` en
`SiteFooter`. De briefing vraagt geen navigatie en geen uitgangspad naast de
CTA. Het logo in de masthead is om dezelfde reden geen link.

## 4. Vormgeving

De aangeleverde mockup had een eigen palet en drie Google-fonts. De briefing
zegt dat de huisstijltokens voorgaan als die vastliggen. Dat is zo, dus de
structuur en het ritme van de mockup zijn overgenomen en de kleuren zijn op
`--color-ec-*` gemapt. Alle regels hangen onder `.msl`, volgens hetzelfde
patroon als `EventAmsterdam2026.css`.

Twee kleuren zijn afgeleid in plaats van overgenomen, allebei om contrastredenen:

| Rol       | Licht                  | Donker           | Reden                                                                                                                                                                                                                       |
| --------- | ---------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accent    | `#256b64`              | `--color-ec-sky` | ec-teal haalt 2,55:1 op ec-surface en teal-ink 3,94:1. Beide te laag voor de mono-labels die de accentkleur dragen. `#256b64` is ec-teal verdiept tot 5,57:1 en is meteen het donkere pijnboomgroen dat de briefing vraagt. |
| Markering | `--color-ec-red-hover` | `#f2795a`        | ec-red haalt 4,42:1 op licht, net te laag voor tekst. Op navy haalt hij 3,03:1. De grafische markeringen in het diagram houden ec-red, die de 3:1 voor niet-tekst wel haalt.                                                |

Verder is er één zichtbare concessie aan de briefing. Marco beschrijft een
drie-deling van grotesk, serif en mono, en noemt die het hele visuele idee. De
serif is eruit. De site serveert Aptos met Figtree als fallback en heeft geen
serif in de stack, en een vierde webfont laden botst met "snelle laadtijd boven
alles". Koppen en lopende tekst staan nu allebei in de merkletter, labels en
cijfers in een systeem-mono. De rapportuitstraling komt van de hairlines, de
mono-labels en de regellengte. Wil Marco de serif alsnog, dan is dat één
`font-family` op `.msl` plus een font-import.

Donker thema volgt `prefers-color-scheme` binnen `.msl`. De site zelf is
light-only (`ThemeProvider defaultTheme="light"`, niet switchable) en dat blijft
zo; de media query raakt niets buiten deze pagina.

De briefing wil hairlines tussen secties en een vlak voor alleen de CTA. In
donker thema is de pagina zelf ec-navy, dus daar zou een navy CTA wegvallen
tegen de achtergrond. Het CTA-vlak gebruikt in donker `--color-ec-navy-line-2`,
1,65:1 ten opzichte van de pagina, met de tekst erop nog op 5,19:1 of hoger.

## 5. Het diagram

Twee lijnen vanuit hetzelfde nulpunt, seats deployed stijgend en measured value
vlak tot het interventiepunt. Inline SVG, geen library.

De labels staan als legenda linksboven in plaats van aan de lijneinden zoals in
de mockup. Aan de lijneinden liepen "seats deployed" en "intervention" over
elkaar heen. De `font-family` staat in de CSS en niet als presentation attribute
op elk `<text>`, omdat browsers `var()` in presentation attributes niet
betrouwbaar invullen.

Het onderschrift "Illustrative..." is verplicht volgens de briefing en staat
vast in de component. De `aria-label` op de SVG beschrijft het verloop van beide
lijnen.

## 6. Meting

GA4 en GTM via de bestaande `trackEvent`, met twee events in
`client/src/lib/tracking.ts`:

- `ms_page_viewed` bij binnenkomst
- `ms_cta_clicked` met een `cta`-label per knop (`hero_email`,
  `hero_see_what_we_deliver`, `cta_email`, `cta_bookings`)

Beide dragen `event_category: "microsoft_sellers"` en de `src` uit de URL.
`ms_cta_clicked` vuurt daarnaast de LinkedIn-conversie, zoals
`sc_email_submitted` dat doet.

### Wat hier nog niet zit

De briefing vraagt om logging per seller in `marketing_lead_activity`. Dat kan
nog niet zonder wijziging aan het CRM. `POST /api/website-signal` valideert op
e-mailadres, en een seller die op een link klikt levert er geen. Per-seller
loggen vraagt dus een token in de mail-link (`?r=<token>`) plus een CRM dat dat
token naar een lead kan herleiden.

De mailcampagne registreert kliks per ontvanger al, dus wie de pagina opende is
bekend. Wat nu ontbreekt is de koppeling tussen een persoon en welke CTA hij op
de pagina indrukte. Dat is de scope van de vervolgstap:

1. Campagne mint per ontvanger een `r`-token en zet dat in de link.
2. `api/microsoft-signal.ts` op de site neemt `{ event, cta, r, src }` aan en
   stuurt door naar het CRM, net als `api/waitlist.ts` dat doet.
3. `POST /api/website-signal` in eclektik-crm accepteert `recipientToken` als
   alternatief voor `email` en schrijft de activity-rij.

Het e-mailadres in de URL zetten werkt vandaag zonder CRM-wijziging en is
afgevallen: dat zet persoonsgegevens in URL's, referrers en Google Analytics.

### Neveneffect in tracking.ts

`getAttribution()` leest nu terug op de URL als sessionStorage nog leeg is.
`initAttribution()` draait in een effect op `App`, en React draait effecten van
kinderen vóór die van de ouder. Een pagina die bij mount een event meldt vraagt
de attributie dus op voordat `App` hem heeft weggeschreven. Alle bestaande
aanroepers lazen hem pas bij submit, lang na mount, waardoor dit nooit opviel.
`ms_page_viewed` is de eerste die dat niet doet.

## 7. Blockers vóór livegang

Paragraaf 7 van de briefing, in Marco's woorden belangrijker dan de vormgeving.
Ze staan ook als comment bovenaan `MicrosoftSellers.tsx`.

1. **Akkoord op het citaat.** Geregeld. Olivier bevestigde het akkoord op
   15 september 2026, `QUOTE_APPROVED` staat op `true` en het bewijsblok draagt
   het citaat met attributie. De schakelaar blijft staan: op `false` komt de
   terugvaloptie uit de briefing terug, de drie kenmerken zonder
   aanhalingstekens en zonder attributie. De regel "Switzerland, large US
   insurance account, June 2026" is voor een insider herleidbaar tot één persoon
   en één klant, dus een wijziging aan die attributie vraagt hetzelfde akkoord
   opnieuw.
2. **Geen klantnamen.** Staan er niet op, ook niet omschreven.
3. **Geen cijfers.** Geen resultaatpercentage en geen bedrag. De tabel bevat
   alleen seat-aantallen als accountindicatie.
4. **ECIF en MCI.** Het financieringsblok herhaalt onze eigen uitgaande mail.
   Microsoft-programmaregels wijzigen per fiscaal jaar en zijn niet geverifieerd.
   Laten bevestigen voordat de pagina publiek staat. Hier zit geen schakelaar
   omhéén, want de briefing geeft geen alternatieve formulering.

Uit de Microsoft-slide "Frontier Accelerate for Copilot" is alleen de opbouw van
de tabel overgenomen. Geen bedragen, geen tiernamen, geen opmaak.

## 8. De tweede CTA

"Pick a slot" wijst naar Marco's Microsoft Bookings-pagina, met
`target="_blank"` en `rel="noopener noreferrer"`. De klik logt als
`ms_cta_clicked` met `cta: "cta_bookings"`, dus in GA4 is te zien welke van de
twee routes sellers kiezen.

`BOOKINGS_URL` leegmaken haalt de knop weg in plaats van een dode link achter
te laten. Dat blijft zo, voor het geval de Bookings-pagina ooit verdwijnt.
