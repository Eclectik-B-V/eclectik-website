# Google Analytics en Tag Manager

Deze handleiding beschrijft hoe de tracking op de Eclectik website in elkaar zit
en wat er in Google Analytics, Google Tag Manager en LinkedIn nog met de hand
ingesteld moet worden.

## Wat er in de code staat

Drie tags staan in `client/index.html`:

| Tag | ID | Plek |
| --- | --- | --- |
| Google Tag Manager | `GTM-KZKSN8CT` | script in de `head`, `noscript` iframe in de `body` |
| Google Analytics 4 | `G-LD7EPKT1W2` | gtag.js in de `head`, met een `config` call |
| LinkedIn Insight Tag | partner `9108033` | script in de `head`, `noscript` pixel in de `body` |

De events komen uit `client/src/lib/tracking.ts`. Elke helper daar doet twee
dingen: `gtag('event', ...)` richting GA4, en een push naar `window.dataLayer`
zodat GTM hetzelfde event ziet. Je hebt dus geen GA4-tag in GTM nodig om deze
events in Analytics terug te vinden. Zet er ook geen tweede GA4 configuratietag
in, want dan telt alles dubbel.

## Paginaweergaves

De site is een single-page app: na de eerste paginaload wisselt wouter de route
in de browser zonder dat er een nieuw document geladen wordt. De
`gtag('config', ...)` in `index.html` meldt daarom alleen de pagina waarop
iemand binnenkomt.

`PageViewTracker` (`client/src/components/PageViewTracker.tsx`) vangt de rest op.
Die component hangt in `App.tsx` en stuurt bij elke routewissel een `page_view`
met `page_location`, `page_path`, `page_title` en `src`. De eerste route slaat
hij over, anders zou de landingspagina dubbel geteld worden.

Zonder die component belandt al het verkeer op de pagina waar het bezoek begon,
en zie je in GA4 nul bezoeken op /contact, /scorecard en de case studies.

## Events die de site verstuurt

| Event | Wanneer | Waar in de code |
| --- | --- | --- |
| `page_view` | bij elke routewissel | `components/PageViewTracker.tsx` |
| `cta_click` | klik op een CTA-knop | header, Home, Consulting, HRTechServices, GlintSupport, WorkvivoSeer |
| `door_selected` | keuze tussen de twee deuren | `pages/Home.tsx`, `pages/Scorecard.tsx` |
| `contact_form_submit` | contactformulier succesvol verstuurd | `pages/Contact.tsx` |
| `wl_q_started`, `wl_q_answered`, `wl_q_completed`, `waitlist_joined` | benchmark wachtlijst | `components/WaitlistForm.tsx` |
| `sc_start`, `sc_q_answered`, `sc_completed`, `sc_email_submitted`, `sc_cta_clicked` | scorecard funnel | `pages/Scorecard.tsx`, `components/scorecard/ResultView.tsx` |
| `glint_page_viewed`, `glint_cta_clicked` | landingspagina /glint | `pages/GlintValue.tsx` |
| `ms_page_viewed`, `ms_cta_clicked` | landingspagina /microsoft | `pages/MicrosoftSellers.tsx` |

Bij `contact_form_submit`, `waitlist_joined`, `sc_email_submitted`,
`glint_cta_clicked` en `ms_cta_clicked` gaat er ook een LinkedIn conversie mee
via `lintrk`.

### Campagnebron

Komt een bezoeker binnen via een link met `?src=`, dan wordt die waarde een
sessie lang bewaard en als parameter `src` meegestuurd met de paginaweergaves en
de meeste funnel-events. Zo is in GA4 terug te zien welke campagne een aanmelding
opleverde. Er komt geen cookie aan te pas, alleen `sessionStorage`.

### Helpers zonder aanroep

In `tracking.ts` staan ook `trackCaseStudyView`, `trackResourceDownload`,
`trackNewsletterSignup`, `trackConsultationRequest` en `trackServiceView`. Die
worden nergens aangeroepen, dus die events komen niet in GA4 binnen. De case
studies en de service-pagina's tellen wel gewoon mee als paginaweergave. Wil je
ze apart meten, dan moet de bijbehorende helper nog in de pagina of de knop
gezet worden.

### Geen persoonsgegevens in GA4

De events sturen bewust geen naam, e-mailadres of bedrijfsnaam mee. Google
verbiedt persoonsgegevens in een Analytics-property en kan de data daarop
verwijderen. De ingevulde gegevens komen binnen via `POST /api/contact`; GA4 telt
alleen de conversie en de bron.

## Instellen in Google Analytics 4

1. Open [analytics.google.com](https://analytics.google.com) en kies de property
   bij `G-LD7EPKT1W2`.
2. Ga naar Reports, Realtime. Open de site in een ander tabblad en klik door een
   paar pagina's. Je moet per klik een nieuwe `page_view` zien binnenkomen.
3. Ga naar Admin, Data display, Events. Markeer als key event wat je als
   conversie wilt tellen: `contact_form_submit`, `waitlist_joined`,
   `sc_email_submitted`, `glint_cta_clicked`, `ms_cta_clicked`.
4. Ga naar Admin, Data display, Custom definitions en maak een custom dimension
   op event-scope voor `src`. Zonder die stap laat GA4 de parameter wel binnen,
   maar kun je er niet op rapporteren.
5. Doe hetzelfde voor `cta` en `door` als je die uitsplitsing wilt in rapporten.

Nieuwe custom dimensions vullen zich pas vanaf het moment dat je ze aanmaakt. Ze
werken niet met terugwerkende kracht.

## Instellen in Google Tag Manager

GTM is nodig zodra je iets wilt afvuren dat niet in de code staat, bijvoorbeeld
een LinkedIn conversie-ID of een advertentiepixel.

1. Open [tagmanager.google.com](https://tagmanager.google.com), container
   `GTM-KZKSN8CT`.
2. Maak per event dat je wilt gebruiken een trigger van het type Custom Event,
   met de eventnaam uit de tabel hierboven.
3. Wil je een eventparameter gebruiken in een tag, maak dan een variabele van het
   type Data Layer Variable met de naam van die parameter, bijvoorbeeld `src` of
   `cta`.
4. Test met Preview op `https://www.eclectik.co` voordat je publiceert.

Een LinkedIn conversie via GTM ziet er zo uit, als Custom HTML tag op de trigger
die je wilt tellen:

```html
<script>
  window.lintrk('track', { conversion_id: JOUW_CONVERSION_ID });
</script>
```

## Instellen in LinkedIn

1. Ga in [Campaign Manager](https://www.linkedin.com/campaignmanager) naar
   Account Assets, Insight Tag en controleer of partner ID `9108033` data
   ontvangt.
2. Maak onder Account Assets, Conversions de conversies aan die je wilt meten en
   koppel ze aan je campagnes.
3. Verifieer met de LinkedIn Insight Tag Helper extensie in Chrome.

## Testen voor je live gaat

- Klik door vijf pagina's en tel of er vijf `page_view` events binnenkomen in
  Realtime.
- Verstuur het contactformulier en controleer `contact_form_submit`.
- Open een campagnelink met `?src=test` en kijk of `src` meekomt op de events.
- Loop de scorecard helemaal door en controleer de vijf `sc_`-events.
- Draai GTM Preview en controleer dat de triggers afgaan die je hebt gemaakt.

In de browserconsole kun je met `window.dataLayer` de hele lijst events
teruglezen. Dat werkt ook als GA4 zelf geblokkeerd wordt.

## Als er niets binnenkomt

Adblockers en tracking protection blokkeren `googletagmanager.com` standaard.
Test in een venster zonder blokkers, anders lijkt alles kapot terwijl de code
klopt. `window.dataLayer` vult zich wel gewoon, want die push doet de site zelf.

Komt er alleen een paginaweergave van de landingspagina binnen en verder niets,
kijk dan of `PageViewTracker` nog in `App.tsx` staat.

Ziet GA4 helemaal geen verkeer, controleer dan of de measurement ID in
`client/index.html` nog `G-LD7EPKT1W2` is en of er JavaScript-fouten in de
console staan.

## Verder lezen

- [Google Tag Manager documentatie](https://support.google.com/tagmanager)
- [GA4 setup](https://support.google.com/analytics/answer/9304153)
- [LinkedIn Insight Tag](https://business.linkedin.com/marketing-solutions/insight-tag)
