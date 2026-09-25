# Glint user session, landingspagina's achter de Ja/Nee-knoppen

Bron: `build-brief-landingpagina-customer-session.md` (Olivier, 25 sep 2026), plus de
vier antwoorden op de openstaande vragen. Dit document is het contract waar beide
repo's zich aan houden.

## Beslissingen die afwijken van de brief

**Geen Next.js.** De brief beschrijft App Router. Deze site is Vite + React + wouter
met losse serverless functies in `api/`. `vercel.json` stuurt alles wat niet met
`/api/` begint naar `index.html`, dus de klikroute moet onder `/api/` leven.

**De data landt in de BD-applicatie, niet in een eigen tabel van de site.** De site
houdt geen databasesleutels. Alle reads en writes lopen via één endpoint in de
BD-repo, achter hetzelfde gedeelde geheim als `api/website-signal`.

**Provisioneel antwoord in een eigen kolom.** De brief laat de klik direct `answer`
schrijven en alleen als `confirmed = false`. Dat botst met de eis dat iemand zijn
antwoord mag wijzigen: na de eerste bevestiging is de rij bevroren, en haal je die
voorwaarde weg, dan kan een linkscanner die later de andere link ophaalt een
bevestigd antwoord omgooien. Daarom schrijft de klik naar `pending_answer` en vult
alleen de confirm `answer`, met het antwoord dat de pagina meestuurt. Een scanner
kan `answer` dan per definitie niet raken, en de regel "negeer een Ja en een Nee die
allebei onbevestigd binnenkomen" volgt vanzelf.

**Engels only.** De `lang`-kolom en alle NL-teksten uit paragraaf 6 vervallen.

**`noindex` op `/s/*`.** Staat niet in de brief. Tokenpagina's horen niet in Google,
net zomin als `/glint` en `/microsoft`.

**Google Fonts blijft voorlopig.** De brief wil nul third party requests. Analytics
en de LinkedIn-tag gaan uit op `/s/*`, de fonts blijven tot ze site-breed
self-hosted zijn. Dat is een aparte klus en expliciet later.

## Datamodel (BD-repo)

```sql
create table user_session_invites (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  contact_id uuid references contacts(id),
  email text not null,
  first_name text,
  company text,

  -- Provisioneel: geschreven door de GET, dus ook door linkscanners.
  pending_answer text check (pending_answer in ('yes','no')),
  pending_at timestamptz,
  click_count int not null default 0,

  -- Pas gevuld door de confirm vanuit een echte browser.
  answer text check (answer in ('yes','no')),
  answer_at timestamptz,
  confirmed boolean not null default false,
  confirmed_at timestamptz,
  bot_suspected boolean not null default false,

  slots text[] not null default '{}',
  note text,
  submitted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on user_session_invites (token);
create index on user_session_invites (answer, confirmed);
```

RLS aan, geen enkele policy voor `anon`. Alle toegang via de service role in de
BD-repo. Tokens minimaal 22 tekens, url-safe, willekeurig. Geen IP-adressen, geen
user agents opslaan: de user agent bepaalt alleen in het geheugen `bot_suspected`.

## HTTP-contract

De site roept één endpoint aan:

```
POST {CRM_BASE_URL}/api/session-invite
header  x-webhook-secret: {CRM_WEBHOOK_SECRET}
```

Aan de BD-kant is dat `WEBSITE_WEBHOOK_SECRET`, net als bij de bestaande endpoints.

| action | body | antwoord |
|---|---|---|
| `click` | `{action, token, answer: "yes"\|"no", botSuspected: boolean}` | `{ok: true}` of `{ok: false, reason: "unknown_token"\|"closed"}` |
| `confirm` | `{action, token, answer: "yes"\|"no"}` | `{ok: true, firstName: string\|null}` of `{ok: false, reason}` |
| `submit` | `{action, token, slots: string[], note: string\|null}` | `{ok: true}` of `{ok: false, reason}` |

`closed` betekent: de deadline is voorbij. De deadline staat in de site-config en
wordt door de BD-kant nogmaals gecontroleerd, zodat hij niet omzeild kan worden door
de pagina over te slaan.

Een onbekend token geeft altijd hetzelfde generieke antwoord. Nergens mag uit een
statuscode of foutmelding blijken of het token bestond.

## Routes op de site

| Route | Type | Gedrag |
|---|---|---|
| `GET /api/s/click?t=&a=` | functie | `click` naar BD, daarna 302 naar `/s/{token}/slots` of `/s/{token}/thanks`. Bij `unknown_token` naar `/s/invalid`, bij `closed` naar `/s/closed` |
| `POST /api/s/confirm` | functie | `{token, answer}` door naar BD |
| `POST /api/s/submit` | functie | `{token, slots, note}` door naar BD |
| `/s/invalid` | pagina | Generieke melding |
| `/s/closed` | pagina | De uitvraag is gesloten |
| `/s/:token/slots` | pagina | Drie momenten, open vraag. Confirm bij mount |
| `/s/:token/thanks` | pagina | Eén open vraag. Confirm bij mount |
| `/s/:token/done` | pagina | Bevestiging |

`/s/invalid` en `/s/closed` staan in de router vóór `/s/:token/...`, anders vangt de
tokenroute ze af.

De link in de mail, door de BD-applicatie samen te stellen:

```
https://www.eclectik.co/api/s/click?t=<token>&a=yes
https://www.eclectik.co/api/s/click?t=<token>&a=no
```

## De drie momenten

Vaste strings, niet dynamisch omgerekend: de VS gaat op 1 november over op
wintertijd en Europa op 25 oktober, dus tussen de momenten verschuift het verschil.

| slot id | Datum | CET | GMT | PT |
|---|---|---|---|---|
| `slot-2026-10-29` | Thursday 29 October 2026 | 16:00 | 15:00 | 08:00 PDT |
| `slot-2026-11-04` | Wednesday 4 November 2026 | 17:00 | 16:00 | 08:00 PST |
| `slot-2026-11-05` | Thursday 5 November 2026 | 17:00 | 16:00 | 08:00 PST |

Meerdere aanvinken mag en is gewenst. Nul vinkjes versturen mag ook: dat is
bruikbare informatie.

Deadline: 22 oktober 2026 23:59 CEST, dus `2026-10-22T21:59:59Z`.

## Teksten (Engels)

**Slots-pagina**
- Titel: Good, we have noted your interest
- Intro: Which of these work for you? Tick everything that could work, the more the better.
- Onder de checkboxes: Is there a topic you would like to see covered? (optional)
- Knop: Send
- Onder de knop: The session runs for one hour, online.

**Thanks-pagina**
- Titel: Understood, thank you
- Intro: We will leave you out of this one.
- Vraag: If it is the format rather than the subject, what would work better? (optional, one line is enough)
- Knop: Send

**Done-pagina**: Thanks, that is all we needed. We will confirm the date by email
once we have everyone's preferences.

**Invalid-pagina**: This link is not valid. It may have expired, or it was not meant
for this browser. Reply to the email and we will sort it out.

**Closed-pagina**: This invitation has closed. Reply to the email if you still want
to join and we will see what we can do.

Aanspreken met `first_name` als die er is, anders zonder aanhef. Nooit het
mailadres of de bedrijfsnaam tonen: een doorgestuurde mail zou dan gegevens van een
collega laten zien.

Onderaan elke pagina: "We only use your answer to schedule this session." met een
link naar `/privacy-policy`.

## Vormgeving

Huisstijl van eclectik.co, één kolom, gecentreerd, maximaal 560px. Mobiel is de
belangrijkste weergave: veel mensen klikken vanuit Outlook op hun telefoon. Kaal:
geen navigatie, geen footer met links, geen cookiebanner. Eén logo bovenaan.

Checkboxes minstens 44px hoog met het hele label klikbaar.

Geen em dashes, in geen enkele tekst.

## Klaar wanneer

- [ ] Klikken vanuit een echte browser levert `answer='yes'` en `confirmed=true`
- [ ] `curl` op dezelfde URL levert `confirmed=false` en `answer` blijft leeg
- [ ] Eerst Nee, dan Ja klikken eindigt op `answer='yes'`
- [ ] Submitten met nul vinkjes werkt en zet `submitted_at`
- [ ] Een verzonnen token komt op `/s/invalid` zonder iets prijs te geven
- [ ] De anon key kan de tabel niet lezen
- [ ] Bruikbaar op een telefoon, ook in de browser van Outlook
- [ ] Na de deadline tonen de pagina's de gesloten-melding
- [ ] Geen analytics- of LinkedIn-requests op `/s/*`
