/**
 * Config en teksten voor de bevestigingspagina's onder /e/.
 *
 * Het event in Amsterdam is twee keer verschoven: van 6 oktober naar
 * 12 november, en daarna naar dinsdag 17 november 2026. De mensen die zich al
 * hadden ingeschreven weten dat nog niet. Zij krijgen een mail met een
 * persoonlijke link naar /e/:token, waar ze met één klik laten weten of de
 * nieuwe datum ze schikt.
 *
 * Alles wat een bezoeker leest staat hier en niet in de pagina's zelf, net als
 * in sessionInvite.ts. Geen em dashes, daar staat een test op.
 *
 * De datum staat hier als tekst en wordt niet uit EventAmsterdam2026.tsx
 * gelezen: die pagina heeft zijn eigen zinnen en een gedeelde bron zou daar
 * een verbouwing betekenen. Verschuift de datum nog eens, pas hem dan op
 * beide plekken aan. De test hieronder houdt in de gaten dat hier geen oude
 * datum blijft staan.
 */

/** Route waar een onbekend of verlopen token op uitkomt. */
export const EVENT_CONFIRM_INVALID_PATH = "/e/invalid";

/**
 * Of dit pad bij de bevestigingspagina's hoort.
 *
 * Gebruikt in App.tsx om de cookiebanner en de LinkedIn Insight Tag weg te
 * houden, precies zoals isSessionInvitePath dat voor /s/ doet. Google
 * Analytics zit in client/index.html en draait voordat deze bundle bestaat,
 * dus daar staat dezelfde voorwaarde nog een keer met de hand geschreven.
 * Wijzig je hier de vorm van het pad, wijzig het daar ook.
 */
export function isEventConfirmPath(pathname: string): boolean {
  return pathname === "/e" || pathname.startsWith("/e/");
}

export const EVENT_CONFIRM_COPY = {
  /** Nietszeggend, zodat een schouderblik in de trein niets prijsgeeft. */
  documentTitle: "Eclectik",

  greeting: (firstName: string) => `Hi ${firstName},`,

  loading: "One moment.",
  sending: "Sending",
  sendFailed:
    "That did not go through. Please try again, or reply to the email and we will sort it out.",

  footerNote: "We only use your answer to plan the afternoon.",
  footerLinkLabel: "Privacy policy",

  ask: {
    title: "Our Amsterdam afternoon has a new date",
    /**
     * De tussenliggende datum staat er bewust in. Wie 12 november in zijn
     * agenda heeft gezet moet kunnen zien dat deze mail daarover gaat, anders
     * leest het als een mail die hij al gehad heeft.
     */
    intro:
      "We had to move the date twice, first from 6 October to 12 November, and now once more. This one is final.",
    dateLine: "Tuesday 17 November 2026",
    timeLine: "12:15 to 16:30 CET, at the Zoom office in Amsterdam",
    question: "Does that date work for you?",
    yes: "Yes, that date suits me",
    no: "No, sorry, I cannot make it",
    note: "Your seat stays yours either way until you tell us otherwise.",
  },

  thanksYes: {
    title: "Good, we have you down for 17 November",
    body: "You will get the practical details by email closer to the date. If anything changes on your side, just reply to the invitation.",
  },

  thanksNo: {
    title: "Thank you for letting us know",
    body: "That is a shame, but it helps us to know now. We will keep you in mind for what we do next.",
  },

  invalid: {
    title: "This link is not valid",
    body: "It may have expired, or it was not meant for this browser. Reply to the email and we will sort it out.",
  },
} as const;
