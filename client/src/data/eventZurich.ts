/**
 * Config en teksten voor de roundtable in Zürich, 1 december 2026.
 *
 * Een besloten sessie van Eclectik, PwC en Microsoft. De pagina is niet
 * openbaar: geen link vanaf de site, geen sitemap, noindex via vercel.json.
 *
 * De teksten komen uit de mailwisseling tussen Rebecca Laun (PwC), Ralf
 * Buechsenschuss (Microsoft) en Manish Goel (Eclectik) van 28 en 29 oktober
 * 2026. De openingsalinea's zijn vrijwel letterlijk overgenomen: ze zijn door
 * drie partijen goedgekeurd en eraan schaven levert alleen discussie op.
 *
 * Geen em dashes, daar staat een test op.
 */

export const ZURICH_EVENT_SLUG = "zurich-2026";

/** 1 december 2026 14:00 CET, in UTC genoteerd voor de countdown. */
export const ZURICH_START_ISO = "2026-12-01T13:00:00Z";

/**
 * Wie een genodigde heeft uitgenodigd. Gesloten verzameling, want de drie
 * organisatoren moeten hun eigen genodigden kunnen terugvinden. Houd in sync
 * met het enum in api/event-registration-zurich.ts.
 */
export const INVITED_BY = ["Eclectik", "PwC", "Microsoft", "Other"] as const;

export interface AgendaItem {
  time: string;
  title: string;
  /** Leeg voor de praktische blokken, die hebben geen toelichting nodig. */
  body?: string;
  by?: string;
}

/**
 * Overgenomen uit de uitnodiging van de vorige editie van deze reeks, op
 * 25 november 2025 op dezelfde locatie: registratie om 14:00, drie blokken van
 * een half uur met een pauze van een half uur ertussen, dan het rondetafel-
 * gesprek en om 17:00 de borrel.
 *
 * Een eerdere versie hier was mijn eigen verdeling, met een opening van een
 * kwartier en een kortere pauze. Die is vervangen: het format van de reeks
 * weegt zwaarder dan mijn gok, en deelnemers die er eerder bij waren
 * herkennen het.
 */
export const AGENDA: AgendaItem[] = [
  { time: "14:00", title: "Registration", body: "At Microsoft, The Circle, Zürich." },
  {
    time: "14:30",
    title: "What's next?",
    body: "How organisations are preparing for the era of agentic work, drawing on Microsoft's New Future of Work research.",
    by: "Microsoft",
  },
  {
    time: "15:00",
    title: "What's real?",
    body: "Evidence beyond AI usage. How data and analytics reveal the real impact of AI transformation, and where change is needed most.",
    by: "Eclectik",
  },
  { time: "15:30", title: "Break" },
  {
    time: "16:00",
    title: "How do people feel?",
    body: "What PwC's global Hopes and Fears survey says about how employees are experiencing AI and the changing world of work.",
    by: "PwC",
  },
  {
    time: "16:30",
    title: "Roundtable discussion",
    body: "The part that is not on anyone's slides. What you are running into, and what you have stopped doing.",
  },
  { time: "17:00", title: "Apéro" },
];

export interface Speaker {
  name: string;
  /** Leeg als we de functietitel nog niet bevestigd hebben. */
  role?: string;
  org: string;
  /** Chair of Speaker. Zelfde idee als de tags op de Amsterdam-pagina. */
  tag: string;
  photo: string;
}

/**
 * Rebecca Laun zit de middag voor, Ralf en Manish spreken. De spreker namens
 * PwC is op 29 oktober nog niet bekend; zolang dat zo is staat er onder de
 * kaarten een regel dat er nog een naam bij komt.
 *
 * Ralfs functietitel komt van zijn LinkedIn-kop, niet uit een formele bron.
 * Manish schreef zijn eigen titel in zijn handtekening met een typefout in
 * "Insights"; die staat hier goed gespeld.
 */
export const SPEAKERS: Speaker[] = [
  {
    name: "Rebecca Laun",
    org: "PwC Switzerland",
    tag: "Chair",
    photo: "/images/events/zurich-2026/rebecca-laun.jpg",
  },
  {
    name: "Ralf Buechsenschuss",
    role: "Org. Design, AI Transformation & People Analytics",
    org: "Microsoft",
    tag: "Speaker",
    photo: "/images/events/zurich-2026/ralf-buechsenschuss.jpg",
  },
  {
    name: "Manish Goel",
    role: "Senior Advisor, AI Insights & Impact",
    org: "Eclectik",
    tag: "Speaker",
    photo: "/images/events/zurich-2026/manish-goel.jpg",
  },
];

export const TAKEAWAYS = [
  "How Microsoft sees organisations preparing for agentic work, from research rather than from a product roadmap.",
  "A way to tell real impact from reported usage, and to find the groups where AI lands as a burden rather than a help.",
  "What employees across markets say about AI, from PwC's global Hopes and Fears survey.",
  "What your peers are actually running into. Nothing leaves the room, so the examples are the real ones.",
  "A small group of people in the same position who you can call afterwards.",
];

/**
 * De onderzoekslinks uit de uitnodiging, met de echte bestemmingen.
 *
 * In de mail stonden ze omgeschreven door mailbeveiliging, via
 * linkprotect.cudasvc.com en urldefense.com. Die urls verlopen en zien er
 * onbetrouwbaar uit, dus ze mogen hier niet staan.
 */
export const READING = [
  {
    publisher: "Microsoft",
    title: "The New Future of Work Reader",
    href: "https://microsoft.github.io/nfw-reader/",
  },
  {
    publisher: "PwC",
    title: "Global Workforce Hopes and Fears Survey 2026",
    href: "https://www.pwc.ch/en/insights/transformation/global-workforce-hopes-and-fears-survey-2026-switzerland.html",
  },
  {
    publisher: "Wharton",
    title: "2026 AI Adoption Report",
    href: "https://knowledge.wharton.upenn.edu/special-report/2026-ai-adoption-report/",
  },
];

export const ZURICH_COPY = {
  title: "AI and agents are reshaping the workplace",
  deck: "What's next, what's real, and how do people actually feel?",

  dateLine: "Tuesday, 1 December 2026",
  timeLine: "14:00 arrival, programme 14:30 to 17:00, apéro afterwards",
  organisers: "An invitation-only roundtable by Eclectik, PwC and Microsoft",
  venue: "Microsoft Office, The Circle 02, 8058 Zürich",
  rooms: "Rooms Eiger and Dufourspitze",
  seats: "Free to attend, in person, limited to around 15 seats.",

  intro: [
    "The question is no longer whether AI and agents will reshape your organisation. It's how fast, and who will lead the way.",
    "Beneath the headlines, many organisations are still asking: is AI creating real value? How is work actually changing? And are our people keeping pace?",
    "AI transformation is as much about people as it is about technology, which puts HR leaders in a unique position to shape what comes next.",
  ],

  closedTitle: "A space for honest conversation",
  closed: [
    "This is a closed session. Nothing is published and nothing is attributed, so we can talk openly about what is working, what is not, and the questions HR leaders are still trying to answer.",
    "You will be in a small group of senior peers who are facing the same decisions. After the programme the conversation continues over an informal apéro.",
  ],

  agendaTitle: "The afternoon",
  takeawaysTitle: "What you'll leave with",
  venueImageAlt:
    "The Circle at Zurich airport seen from above, with planted roof terraces between the glass wings",
  venueCaption: "The Circle, Zürich Flughafen",
  speakersTitle: "Speakers",
  speakersPending: "One more speaker from PwC will be announced.",
  readingTitle: "Something to read while you wait",
  readingBody:
    "The research the afternoon draws on. Worth a look before you come.",

  formTitle: "Confirm your place",
  formBody:
    "We check role before we confirm a seat, so you will hear from us by email.",
  submit: "Confirm your place",
  sending: "Sending",
  done: "Thank you, we have your registration. You will hear from us by email once your seat is confirmed.",
} as const;
