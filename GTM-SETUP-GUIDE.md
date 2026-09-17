# Google Tag Manager Setup Guide
## Eclectik AI Transformation Website

Deze handleiding helpt je om de tracking volledig te configureren in Google Tag Manager.

---

## ✅ Wat is al geïnstalleerd

De volgende tracking codes zijn al toegevoegd aan je website:

1. **Google Tag Manager** (GTM-KZKSN8CT)
2. **Google Analytics 4** (G-LD7EPKT1W2)
3. **LinkedIn Insight Tag** (Partner ID: 9108033)
4. **Conversion Tracking Events** (via custom JavaScript)

---

## 🍪 Consent en Google Consent Mode v2

Sinds september 2026 draait de site op Google Consent Mode v2 in advanced mode.

**Hoe het werkt**

1. Een inline script bovenin `client/index.html` zet alle consent-signalen op `denied` voordat GTM laadt. GA4 laadt dus wel, maar stuurt cookieloze pings tot de bezoeker kiest.
2. De bezoeker kiest via de banner of via `/cookie-settings`.
3. De keuze wordt opgeslagen in de first-party cookie `eclectik_consent`, twaalf maanden geldig, en direct als `consent update` naar Google gestuurd.
4. Bij een herhaalbezoek stuurt het bootstrap-script de update opnieuw, nog voordat GTM laadt.

**Categorieen en signalen**

| Categorie | Google Consent Mode v2 signalen |
|---|---|
| essential | `security_storage`, altijd granted |
| analytics | `analytics_storage` |
| marketing | `ad_storage`, `ad_user_data`, `ad_personalization` |
| functional | `functionality_storage`, `personalization_storage` |

**LinkedIn valt hierbuiten.** De LinkedIn Insight Tag ondersteunt Consent Mode niet en zet zijn cookies ongeacht het `ad_storage`-signaal. Hij wordt daarom pas door `client/src/components/LinkedInInsightTag.tsx` in de pagina geïnjecteerd nadat marketing is geaccepteerd. Trekt iemand die toestemming in, dan herlaadt de pagina, want een eenmaal geladen Insight Tag laat zich niet ontladen.

**Als je een tracker toevoegt:** verhoog `CONSENT_VERSION` in `client/src/lib/consent.ts` en in het bootstrap-script in `client/index.html`. Bestaande toestemming vervalt dan en de banner verschijnt opnieuw.

**Tags testen in GTM:** gebruik in de GTM-preview het tabblad Consent om per tag te zien welke signalen hij vereist en of hij daadwerkelijk gevuurd heeft.

**Nog te doen, buiten de scope van deze wijziging:**
- Controleren of de GTM-container een eigen GA4-configuratietag bevat. Als dat zo is, vuurt elke pageview dubbel naast de directe `gtag('config', ...)` in `client/index.html`.
- De events uit `client/src/lib/tracking.ts` die hieronder staan beschreven, alsnog aansluiten. Alleen `trackCTAClick` wordt nu aangeroepen, en dat op veel meer plekken dan een homepage-knop: onder andere de header, het mobiele menu, Consulting, WorkvivoSeer, HRTechServices en GlintSupport. `trackNewsletterSignup` wordt nergens aangeroepen. Het contactformulier in `client/src/pages/Contact.tsx` stuurt geen `contact_form_submit`, ondanks wat hieronder beschreven staat.
- Een aparte laag events op GTM aansluiten als je die wilt rapporteren: `door_selected`, `waitlist_joined`, `waitlist_qualification`, de scorecard-events, de Glint-paginaevents en de Microsoft-sellerspagina-events. Die worden al aangeroepen, alleen niet beschreven in de lijst hieronder.

---

## 📊 Tracking Events

> **Let op:** van de events hieronder is er op dit moment een daadwerkelijk aangesloten,
> `cta_click`. Die vuurt op veel plekken door de site heen, niet alleen op de homepage.
> De andere vijf staan wel als functie in `client/src/lib/tracking.ts`, maar worden nergens
> aangeroepen, ook `newsletter_signup` niet. Lees dit hoofdstuk dus als de bedoelde opzet,
> niet als de huidige situatie.

De volgende events horen naar GA4 en GTM te gaan:

### 1. CTA Clicks
- **Event naam**: `cta_click`
- **Wanneer**: Gebruiker klikt op "Explore Solutions" button
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: Naam van de CTA
  - `cta_location`: Locatie op de pagina

### 2. Contact Form Submissions
- **Event naam**: `contact_form_submit`
- **Wanneer**: Gebruiker verstuurt contactformulier
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: Contact Form
  - `name`, `email`, `company` (indien beschikbaar)

### 3. Case Study Views
- **Event naam**: `case_study_view`
- **Wanneer**: Gebruiker bekijkt een case study
- **Parameters**:
  - `event_category`: content
  - `event_label`: Naam van de case study

### 4. Resource Downloads
- **Event naam**: `resource_download`
- **Wanneer**: Gebruiker download een resource
- **Parameters**:
  - `event_category`: conversion
  - `event_label`: Naam van de resource
  - `resource_type`: Type resource

### 5. Newsletter Signups
- **Event naam**: `newsletter_signup`
- **Wanneer**: Gebruiker schrijft zich in voor nieuwsbrief
- **Parameters**:
  - `event_category`: engagement
  - `event_label`: Newsletter Subscription

### 6. Consultation Requests
- **Event naam**: `consultation_request`
- **Wanneer**: Gebruiker vraagt consultatie aan
- **Parameters**:
  - `event_category`: conversion
  - `event_label`: Consultation Request
  - `value`: 1

---

## 🔧 Google Tag Manager Configuratie

### Stap 1: Verifieer GTM Installatie

1. Ga naar [tagmanager.google.com](https://tagmanager.google.com)
2. Selecteer container **GTM-KZKSN8CT**
3. Klik op "Preview" rechtsboven
4. Voer je website URL in: `https://www.eclectik.co`
5. Controleer of GTM correct laadt

### Stap 2: Configureer Triggers

Maak de volgende triggers aan in GTM:

#### Trigger 1: Contact Form Submit
- **Type**: Custom Event
- **Event name**: `contact_form_submit`
- **This trigger fires on**: All Custom Events

#### Trigger 2: CTA Click
- **Type**: Custom Event
- **Event name**: `cta_click`
- **This trigger fires on**: All Custom Events

#### Trigger 3: Consultation Request
- **Type**: Custom Event
- **Event name**: `consultation_request`
- **This trigger fires on**: All Custom Events

### Stap 3: Configureer Tags (optioneel)

Als je extra tracking wilt toevoegen via GTM (naast de directe GA4 en LinkedIn tracking):

#### Tag 1: GA4 Event - Contact Form
- **Tag Type**: Google Analytics: GA4 Event
- **Measurement ID**: G-LD7EPKT1W2
- **Event Name**: contact_form_submit
- **Trigger**: Contact Form Submit

#### Tag 2: LinkedIn Conversion
- **Tag Type**: Custom HTML
- **HTML**:
```html
<script>
  window.lintrk('track', { conversion_id: YOUR_CONVERSION_ID });
</script>
```
- **Trigger**: Consultation Request

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
2. Markeer de volgende events als conversies:
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

- [ ] **Page View Tracking**: Open homepage en controleer in GA4 Realtime
- [ ] **CTA Click**: Klik op "Explore Solutions" en controleer event in GA4
- [ ] **Contact Form**: Vul formulier in en controleer conversion
- [ ] **Case Study View**: Open case study en controleer event
- [ ] **LinkedIn Tag**: Gebruik LinkedIn Tag Helper om te verifiëren
- [ ] **GTM Preview**: Test alle triggers in GTM Preview mode

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

### GTM laadt niet
- Controleer of GTM container ID correct is (GTM-KZKSN8CT)
- Verifieer dat GTM script in `<head>` staat
- Check of noscript in `<body>` staat

---

## 🎯 Aanbevolen Dashboards

### GA4 Dashboard
- **Traffic Sources**: Waar komen bezoekers vandaan?
- **User Engagement**: Welke pagina's presteren het best?
- **Conversions**: Hoeveel contact form submissions?
- **Event Tracking**: Welke CTA's worden het meest geklikt?

### LinkedIn Campaign Manager
- **Conversion Tracking**: Hoeveel leads via LinkedIn?
- **Website Demographics**: Wie bezoekt je website?
- **Retargeting Audiences**: Bouw audiences voor retargeting

---

## 📚 Nuttige Resources

- [Google Tag Manager Documentation](https://support.google.com/tagmanager)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [LinkedIn Insight Tag Guide](https://business.linkedin.com/marketing-solutions/insight-tag)
- [GTM Preview Mode](https://support.google.com/tagmanager/answer/6107056)

---

**Vragen?** Neem contact op met je marketing team of web developer voor verdere ondersteuning.
