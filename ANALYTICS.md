# Analytics Guide
## Eclectik AI Transformation Website

Deze handleiding beschrijft hoe bezoekersanalyse op de site werkt: wat er meet, hoe toestemming werkt, en wat je moet weten voor je iets verandert.

---

## ✅ Wat is al geïnstalleerd

De volgende tracking is toegevoegd aan de website:

1. **Google Analytics 4** (G-LD7EPKT1W2), rechtstreeks geladen in `client/index.html`
2. **LinkedIn Insight Tag** (Partner ID: 9108033), pas geladen nadat een bezoeker marketing-cookies accepteert
3. **Conversion Tracking Events** via custom JavaScript in `client/src/lib/tracking.ts`

---

## 🚫 Google Tag Manager is verwijderd

Op 17 september 2026 is gecontroleerd wat er in GTM-container `GTM-KZKSN8CT` zat. Antwoord: niets. Nul tags, nul triggers, nul predicates, alleen de vijf ingebouwde variabelen die elke nieuwe container standaard meekrijgt. Het GA4-measurement-ID stond nergens in de container. Ondertussen laadde het GTM-script wel op elke paginaweergave, goed voor zo'n 330 KB aan extra runtime, voor niets.

De eigenaar wil eenvoudige bezoekersanalyse en niet meer dan dat. Daarom zijn het GTM-script en de bijbehorende `<noscript>`-iframe uit `client/index.html` gehaald. GA4 en de LinkedIn Insight Tag draaien ongewijzigd door, rechtstreeks.

Dit betekent ook meteen het antwoord op een oude open vraag: er was geen dubbele tagging. Gemeten op de live site vlak voor het verwijderen kwam er precies een `page_view` binnen per paginaweergave, op een enkel measurement-ID. De tweede `collect`-request die je in het netwerkoverzicht zag, was GA4's eigen enhanced-measurement `scroll`-event, geen tweede pageview.

**Wil je GTM ooit terug?** Zet de container-snippet dan onder het consent-bootstrapscript in `client/index.html`, nooit erboven. Het bootstrapscript zet de Consent Mode-standaarden op `denied` voordat er iets anders laadt. Komt de GTM-snippet eerder, dan vuurt GA4 met volledige opslag voordat er ooit toestemming is gevraagd, en is de hele consentlaag zinloos.

---

## 🍪 Consent en Google Consent Mode v2

Sinds september 2026 draait de site op Google Consent Mode v2 in advanced mode.

**Hoe het werkt**

1. Een inline script bovenin `client/index.html` zet alle consent-signalen op `denied` voordat GA4 laadt. GA4 laadt dus wel, maar stuurt cookieloze pings tot de bezoeker kiest.
2. De bezoeker kiest via de banner of via `/cookie-settings`.
3. De keuze wordt opgeslagen in de first-party cookie `eclectik_consent`, twaalf maanden geldig, en direct als `consent update` naar Google gestuurd.
4. Bij een herhaalbezoek stuurt het bootstrap-script de update opnieuw, nog voordat GA4 laadt.

**Categorieen en signalen**

| Categorie | Google Consent Mode v2 signalen |
|---|---|
| essential | `security_storage`, altijd granted |
| analytics | `analytics_storage` |
| marketing | `ad_storage`, `ad_user_data`, `ad_personalization` |
| functional | `functionality_storage`, `personalization_storage` |

**LinkedIn valt hierbuiten.** De LinkedIn Insight Tag ondersteunt Consent Mode niet en zet zijn cookies ongeacht het `ad_storage`-signaal. Hij wordt daarom pas door `client/src/components/LinkedInInsightTag.tsx` in de pagina geïnjecteerd nadat marketing is geaccepteerd. Trekt iemand die toestemming in, dan herlaadt de pagina, want een eenmaal geladen Insight Tag laat zich niet ontladen.

**Als je een tracker toevoegt:** verhoog `CONSENT_VERSION` in `client/src/lib/consent.ts` en in het bootstrap-script in `client/index.html`. Bestaande toestemming vervalt dan en de banner verschijnt opnieuw.

**Events controleren:** gebruik in GA4 de DebugView onder Configure, of open in de browser de Netwerk-tab en zoek naar requests naar `google-analytics.com/g/collect`. Zonder GTM is er geen aparte preview-modus meer nodig.

**Nog te doen, buiten de scope van deze wijziging:**
- De events uit `client/src/lib/tracking.ts` die hieronder staan beschreven, alsnog aansluiten waar dat nog niet gebeurt. `trackCTAClick` wordt al aangeroepen op veel plekken: de header, het mobiele menu, Home, Consulting, WorkvivoSeer, HRTechServices en GlintSupport. `trackNewsletterSignup` wordt nergens aangeroepen. Het contactformulier in `client/src/pages/Contact.tsx` stuurt geen `contact_form_submit`, ondanks wat hieronder beschreven staat.
- Er lopen al events die niet in de lijst hieronder staan: `door_selected`, `waitlist_joined`, `waitlist_qualification`, de scorecard-events, de Glint-paginaevents en de Microsoft-sellerspagina-events. Wil je die apart rapporteren, maak er dan Explore-rapporten voor in GA4 op basis van wat al binnenkomt.

---

## 📊 Tracking Events

> **Let op:** van de events hieronder is er op dit moment een daadwerkelijk aangesloten,
> `cta_click`. Die vuurt op veel plekken door de site heen, niet alleen op de homepage.
> De andere vijf staan wel als functie in `client/src/lib/tracking.ts`, maar worden nergens
> aangeroepen, ook `newsletter_signup` niet. Lees dit hoofdstuk dus als de bedoelde opzet,
> niet als de huidige situatie.

De volgende events horen naar GA4 te gaan.

### 1. CTA Clicks
- **Event naam**: `cta_click`
- **Wanneer**: gebruiker klikt op een call-to-action knop, verspreid over de site. Onder meer in de header, op de homepage en op de servicepagina's.
- **Voorbeelden van labels**: "Register for 6th Oct event" (header en homepage), "Take the scorecard" (header), "Book an execution gap assessment" (Workvivo Seer-pagina)
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: naam van de CTA
  - `cta_location`: locatie op de pagina

### 2. Contact Form Submissions
- **Event naam**: `contact_form_submit`
- **Wanneer**: gebruiker verstuurt contactformulier
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: Contact Form
  - `name`, `email`, `company` (indien beschikbaar)

### 3. Case Study Views
- **Event naam**: `case_study_view`
- **Wanneer**: gebruiker bekijkt een case study
- **Parameters**:
  - `event_category`: content
  - `event_label`: naam van de case study

### 4. Resource Downloads
- **Event naam**: `resource_download`
- **Wanneer**: gebruiker download een resource
- **Parameters**:
  - `event_category`: conversion
  - `event_label`: naam van de resource
  - `resource_type`: type resource

### 5. Newsletter Signups
- **Event naam**: `newsletter_signup`
- **Wanneer**: gebruiker schrijft zich in voor de nieuwsbrief
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: Newsletter Subscription

### 6. Consultation Requests
- **Event naam**: `consultation_request`
- **Wanneer**: gebruiker vraagt een consultatie aan
- **Parameters**:
  - `event_category`: conversion
  - `event_label`: Consultation Request
  - `value`: 1

---

## 📈 Google Analytics 4 Configuratie

### Stap 1: Verifieer GA4 Tracking

1. Ga naar [analytics.google.com](https://analytics.google.com)
2. Selecteer je property (G-LD7EPKT1W2)
3. Ga naar **Reports** → **Realtime**
4. Open je website in een nieuw tabblad
5. Controleer of je real-time bezoek ziet

### Stap 2: Configureer Conversies

1. Ga naar **Configure** → **Events**
2. Markeer de volgende events als conversies zodra ze aangesloten zijn:
   - `contact_form_submit`
   - `consultation_request`
   - `resource_download`
   - `newsletter_signup`

### Stap 3: Maak Custom Reports

1. Ga naar **Explore** → **Blank**
2. Maak rapporten voor:
   - CTA Click Performance
   - Contact Form Conversion Rate
   - Case Study Engagement
   - Resource Download Tracking

---

## 🔗 LinkedIn Campaign Manager Configuratie

### Stap 1: Verifieer Insight Tag

1. Ga naar [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager)
2. Klik op **Account Assets** → **Insight Tag**
3. Controleer of Partner ID **9108033** actief is
4. Gebruik de Tag Helper Chrome extensie om te verifiëren

### Stap 2: Maak Conversion Tracking

1. Ga naar **Account Assets** → **Conversions**
2. Maak nieuwe conversies aan:
   - **Contact Form Submission** (Auto-conversion via Insight Tag)
   - **Consultation Request** (Auto-conversion via Insight Tag)
   - **Resource Download** (Auto-conversion via Insight Tag)

### Stap 3: Koppel aan Campagnes

1. Ga naar je LinkedIn Ads campagnes
2. Selecteer de conversies die je wilt tracken
3. Stel conversion attribution window in (bijv. 30 dagen)

---

## 🧪 Testing Checklist

Voordat je live gaat, test de volgende scenario's:

- [ ] **Page View Tracking**: open homepage en controleer in GA4 Realtime
- [ ] **CTA Click**: klik op een CTA, bijvoorbeeld "Take the scorecard" in de header, en controleer het event in GA4
- [ ] **Contact Form**: vul formulier in en controleer of dit al conversion oplevert. Op dit moment gebeurt dat nog niet, zie de opmerking hierboven
- [ ] **LinkedIn Tag**: gebruik LinkedIn Tag Helper om te verifiëren

---

## 📞 Troubleshooting

### GA4 Events verschijnen niet
- Controleer of GA4 Measurement ID correct is (G-LD7EPKT1W2)
- Check browser console voor JavaScript errors
- Verifieer dat ad-blockers zijn uitgeschakeld tijdens testen

### LinkedIn Tag werkt niet
- Controleer of Partner ID correct is (9108033)
- Gebruik LinkedIn Insight Tag Helper Chrome extensie
- Verifieer dat third-party cookies zijn ingeschakeld
- Controleer of de bezoeker marketing-cookies heeft geaccepteerd. Zonder die toestemming wordt de tag helemaal niet geladen

---

## 🎯 Aanbevolen Dashboards

### GA4 Dashboard
- **Traffic Sources**: waar komen bezoekers vandaan?
- **User Engagement**: welke pagina's presteren het best?
- **Conversions**: hoeveel contact form submissions?
- **Event Tracking**: welke CTA's worden het meest geklikt?

### LinkedIn Campaign Manager
- **Conversion Tracking**: hoeveel leads via LinkedIn?
- **Website Demographics**: wie bezoekt je website?
- **Retargeting Audiences**: bouw audiences voor retargeting

---

## 📚 Nuttige Resources

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [LinkedIn Insight Tag Guide](https://business.linkedin.com/marketing-solutions/insight-tag)

---

**Vragen?** Neem contact op met je marketing team of web developer voor verdere ondersteuning.
