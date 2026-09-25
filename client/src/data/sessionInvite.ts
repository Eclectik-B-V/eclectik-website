/**
 * Config en teksten voor de tokenpagina's onder /s/.
 *
 * Alles wat een bezoeker leest staat hier en niet in de pagina's zelf. De
 * brief vroeg die scheiding expliciet: de zinnen en de momenten veranderen nog
 * tot vlak voor de mailing uitgaat, de opbouw van de pagina's niet.
 *
 * Geen em dashes, in geen enkele zin. Er staat een test op in
 * sessionInvite.test.ts, zodat het niet aan de oplettendheid van een reviewer
 * hangt.
 */

/** Eén van de drie momenten uit de uitnodiging. */
export interface SessionSlot {
  /** Gaat als string mee naar de BD-applicatie, zie het contract in de spec. */
  id: string;
  /** De datumregel, voluit, precies zoals hij in de mail staat. */
  date: string;
  /**
   * De tijden als vaste string, bewust niet uit een tijdstempel gerekend.
   * Europa gaat op 25 oktober over op wintertijd en de VS pas op 1 november,
   * dus tussen het eerste en het tweede moment verschuift het verschil met een
   * uur. Eén omrekening voor alle drie zou dat stil fout doen.
   */
  times: string;
}

export const SESSION_SLOTS: readonly SessionSlot[] = [
  {
    id: "slot-2026-10-29",
    date: "Thursday 29 October 2026",
    times: "16:00 CET, 15:00 GMT, 08:00 PDT",
  },
  {
    id: "slot-2026-11-04",
    date: "Wednesday 4 November 2026",
    times: "17:00 CET, 16:00 GMT, 08:00 PST",
  },
  {
    id: "slot-2026-11-05",
    date: "Thursday 5 November 2026",
    times: "17:00 CET, 16:00 GMT, 08:00 PST",
  },
];

/**
 * 22 oktober 2026 23:59 CEST, genoteerd in UTC omdat de browser van de
 * bezoeker in elke tijdzone kan staan.
 */
export const SESSION_DEADLINE_ISO = "2026-10-22T21:59:59Z";

/**
 * Of de uitvraag dicht is.
 *
 * De BD-applicatie controleert de deadline nog een keer en is daarin
 * doorslaggevend: deze check kan iemand omzeilen door de pagina over te slaan.
 * Hij staat er om de bezoeker meteen de gesloten-melding te geven in plaats
 * van een formulier dat aan de andere kant toch geweigerd wordt.
 *
 * Let op dat hij de klok van het apparaat leest. Staat die dagen verkeerd, dan
 * ziet die bezoeker de gesloten-melding te vroeg of te laat. De server haalt
 * dat in het eerste geval niet terug, in het tweede wel.
 */
export function isSessionInviteClosed(now: Date = new Date()): boolean {
  return now.getTime() > Date.parse(SESSION_DEADLINE_ISO);
}

/**
 * Of dit pad bij de tokenpagina's hoort.
 *
 * Gebruikt in App.tsx om de cookiebanner en de LinkedIn Insight Tag hier weg
 * te houden. Google Analytics zit in client/index.html en draait voordat deze
 * bundle bestaat, dus daar staat dezelfde voorwaarde nog een keer, met de hand
 * geschreven. Wijzig je hier de vorm van het pad, wijzig het daar ook.
 */
export function isSessionInvitePath(pathname: string): boolean {
  return pathname === "/s" || pathname.startsWith("/s/");
}

/** Route waar een onbekend of afgekeurd token op uitkomt. */
export const SESSION_INVALID_PATH = "/s/invalid";

/** Route voor na de deadline. */
export const SESSION_CLOSED_PATH = "/s/closed";

/**
 * Elke zin die op de tokenpagina's te lezen is.
 *
 * De drie slotpagina's staan hier als titel plus body. Samengevoegd zijn dat
 * exact de zinnen uit de spec, maar als één blok tekst lezen ze slechter dan
 * als kop en alinea, en een kop geeft een screenreader iets om op te landen.
 */
export const SESSION_COPY = {
  /**
   * Eén neutrale titel voor alle vijf de pagina's. Bewust nietszeggend: de
   * titel komt in de geschiedenis van de browser terecht en soms in het
   * voorbeeld dat een chat- of mailclient van een gedeelde link maakt.
   */
  documentTitle: "Eclectik",

  /**
   * De aanhef, alleen als de confirm een voornaam teruggeeft. Nooit het
   * mailadres of de bedrijfsnaam: bij een doorgestuurde mail zou de ontvanger
   * dan gegevens van een collega te zien krijgen.
   */
  greeting: (firstName: string) => `Hi ${firstName},`,

  /** Terwijl de confirm loopt. Duurt normaal een paar honderd milliseconden. */
  loading: "One moment.",

  /** Op de knop zolang de submit loopt. */
  sending: "Sending",

  /**
   * Als de submit niet aankomt. Verwijst naar de mail, want dat is het enige
   * kanaal waarvan we zeker weten dat de ontvanger het heeft.
   */
  sendFailed: "That did not go through. Please try again, or reply to the email and we will sort it out.",

  footerNote: "We only use your answer to schedule this session.",
  footerLinkLabel: "Privacy policy",

  slots: {
    title: "Good, we have noted your interest",
    intro: "Which of these work for you? Tick everything that could work, the more the better.",
    noteLabel: "Is there a topic you would like to see covered? (optional)",
    submit: "Send",
    note: "The session runs for one hour, online.",
  },

  thanks: {
    title: "Understood, thank you",
    intro: "We will leave you out of this one.",
    noteLabel: "If it is the format rather than the subject, what would work better? (optional, one line is enough)",
    submit: "Send",
  },

  done: {
    title: "Thanks, that is all we needed.",
    body: "We will confirm the date by email once we have everyone's preferences.",
  },

  invalid: {
    title: "This link is not valid.",
    body: "It may have expired, or it was not meant for this browser. Reply to the email and we will sort it out.",
  },

  closed: {
    title: "This invitation has closed.",
    body: "Reply to the email if you still want to join and we will see what we can do.",
  },
} as const;
