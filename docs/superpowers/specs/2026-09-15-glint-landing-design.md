# Glint-landingspagina: /glint

Ontwerp van 15 september 2026. Bronnen: de briefing "Briefing Olivier:
landingspagina voor Glint-klanten en -prospects" van Marco, zijn HTML-mockup,
de bronteksten, en de door Warburtons goedgekeurde customer case
("warburtons-case_final", 14 september 2026).

Tweede pagina in dezelfde reeks als de Microsoft-sellerpagina (`/microsoft`).
Zelfde opbouw, zelfde visuele grammatica, andere lezer: iemand die Viva Glint
al heeft en merkt dat het minder oplevert dan gehoopt.

## Besluiten

| Vraag | Keuze |
|---|---|
| Route | `/glint`, los van de publieke propositiepagina `/glint-support` |
| Zichtbaarheid | Voorlopig alleen via link: noindex als header en als meta, niet in nav, niet in sitemap |
| Shell | Zonder `Layout`, dus geen SiteHeader en geen SiteFooter, zoals `/microsoft` |
| Kleur | De tokens van eclectik.co, niet de hex-waarden uit de mockup |
| Warburtons-blok | Herschreven op de goedgekeurde case, niet op de mockup |
| Meting | GA-events met `src`, geen CRM-regel (zie hieronder) |

## Het Warburtons-blok

Dit is de enige plek waar de pagina bewust van de mockup afwijkt, en het is de
reden dat deze opdracht er lag. Briefing 7.4 zegt: de goedgekeurde casetekst
wint waar hij afwijkt. Hij wijkt op bijna elk feit af.

| Mockup (uit Marco's callnotitie, 23 juni) | Pagina (uit de goedgekeurde case) |
|---|---|
| "The money that we pay you is worth every single penny" | Eruit. Vervangen door twee goedgekeurde citaten |
| +10 punten op begrip van de bedrijfsstrategie | Eruit. Vervangen door drie geverifieerde cijfers: 3 jaar geen dalende vraag van de 29, +3 tot 4 punten op prioriteitsgebieden, 83% deelname |
| Leadership trust was het zwakste punt | Het probleem was nooit de data, maar het terugbrengen van een rijke uitslag naar een paar prioriteiten |
| Internal Communications and Engagement Manager | Stephen Friel, Internal Communications Professional & Engagement Specialist |
| 70 digitale schermen | 72 |
| Recipe for Success-boek, print magazines | Alleen wat de case noemt: magazine twee keer per jaar, intranet, pilots op sms en WhatsApp |

Het citaat en het cijfer uit de mockup waren allebei blockers in briefing 7.1 en
7.3. Ze staan er niet op, en er hoeft dus ook niets meer voor geregeld te worden
voordat de mailing uit kan.

Wat wel uit de mockup blijft: de vorm van het blok, de drie pijlers als labels,
en de slotalinea die een openstaand probleem laat staan in plaats van een
resultaat. De briefing vraagt met zoveel woorden die alinea niet weg te halen.

Wat erbij komt uit de case: de drie regels van data naar actie naar effect. Dat
is het bewijs van precies wat blok 2 en blok 3 beweren, namelijk dat de waarde
in de stappen ná de survey zit.

De tweede CTA uit de mockup ("Read the Warburtons story") wijst nu niet naar een
losse casepagina maar vraagt de volledige case op per mail. De case staat als
document klaar, niet als publiceerbare pagina; dat is de openstaande keuze uit
"Lees mij eerst".

## Meting

Briefing 6 vraagt om beide CTA's in `marketing_lead_activity` in het CRM. Dat
kan niet zoals de pagina nu staat: `POST /api/website-signal` valideert eerst
een mailadres, en beide CTA's dragen over aan een mailprogramma of aan Bookings
zonder dat de pagina ooit een adres ziet. De GA-events dragen wel de
campagnebron (`?src=`). De identiteit komt binnen met de mail of de boeking.
Een CRM-regel vanaf de pagina vraagt óf een formulier op de pagina, óf een
`website-signal` die een anoniem token accepteert.

## Toegankelijkheid en contrast

Alle kleuren zijn getoetst op de twee achtergronden van de pagina.

- `ec-teal` haalt 2,55:1 op het lichte papier en `ec-teal-ink` 3,94:1, allebei te
  weinig voor de labels en links die de accentkleur dragen. De pagina gebruikt
  dezelfde donkere teal als `/microsoft`, 5,57:1.
- Het gedempte oranje uit de mockup (#B0562F) haalt 4,44:1, net te weinig voor
  tekst. Tekst gebruikt een donkerdere variant op 5,54:1, de grafische markering
  houdt het origineel, dat ruim boven de 3:1 voor niet-tekst zit.
- Donker thema volgt de systeeminstelling van de lezer, want de site zelf staat
  vast op licht. Accent wordt `ec-sky` (7,26:1 op navy), oranje wordt opgelicht
  naar 5,70:1.

Getest op 1280 en op 400 pixels breed, in beide thema's, zonder horizontale
overloop.

## Wat nog geregeld moet worden

1. Kirsty één keer over de omschrijving van CSM en PSC laten lezen. Zij levert
   het, en die omschrijving is een reconstructie uit de CRM-rollen.
2. De keuze publiek en vindbaar. De pagina staat sinds 16 september live op
   `/glint`, bereikbaar via de link maar op noindex. Vindbaar maken is: de
   `/glint`-regel uit `vercel.json` halen, het noindex-effect uit de pagina
   halen, en de route in `sitemap.xml` zetten.

Afgehandeld, allebei bevestigd door Olivier op 16 september 2026: het
Warburtons-woordmerk, dat Warburtons zelf heeft aangeleverd en goedgekeurd, en
de casetekst, die naast de goedkeuring van Warburtons ook die van Kirsty draagt.

Punt 1 hierboven blijft daarmee staan: haar akkoord op de case zegt niets over
de omschrijving van CSM en PSC, want dat is een ander blok.
