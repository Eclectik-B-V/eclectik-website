/**
 * Tracking utilities for Google Analytics 4 and conversion events
 * This file provides helper functions to track user interactions and conversions
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    // `q` is de wachtrij die de Insight Tag zelf leegt zodra hij geladen is.
    lintrk?: ((...args: any[]) => void) & { q?: any[][] };
    dataLayer?: any[];
    _linkedin_data_partner_ids?: string[];
  }
}

/**
 * Track a custom event in GA4
 * @param eventName - Name of the event
 * @param eventParams - Additional parameters for the event
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, eventParams);
    }

    // Ook naar de dataLayer. GTM is weg, maar gtag zelf leest hier ook uit,
    // en een eventuele toekomstige tagmanager pikt het zo op.
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...eventParams });
    }
  } catch (error) {
    // Meten mag falen, de gebruikersflow niet. Deze functie wordt aangeroepen
    // vlak nadat een formulier is geslaagd en de bevestiging al in beeld staat.
    // Zou hij gooien, dan zag de bezoeker tegelijk een succes- en een foutmelding.
    console.warn("[tracking] kon event niet versturen", eventName, error);
  }
}

/**
 * Track LinkedIn conversion
 * @param conversionId - LinkedIn conversion ID
 */
export function trackLinkedInConversion(conversionId?: number) {
  if (typeof window !== 'undefined' && window.lintrk) {
    if (conversionId) {
      window.lintrk('track', { conversion_id: conversionId });
    } else {
      window.lintrk('track', {});
    }
  }
}

/**
 * Track a contact form submission.
 *
 * Deliberately takes no arguments. Naam, e-mailadres en bedrijfsnaam horen niet
 * in Google Analytics: dat verbieden Google's eigen voorwaarden en het is een
 * AVG-overtreding. We meten dat iemand het formulier invulde, niet wie.
 */
export function trackContactFormSubmission() {
  trackEvent("contact_form_submit", {
    event_category: "conversion",
    src: getAttribution(),
  });
  trackLinkedInConversion();
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(ctaName: string, ctaLocation: string) {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaName,
    cta_location: ctaLocation
  });
}

/**
 * Attribution: capture ?src= from the URL on page load, persist for the
 * session, include in form submissions and funnel events. No cookies.
 */
const ATTRIBUTION_KEY = "eclectik_src";

export function initAttribution() {
  if (typeof window === "undefined") return;
  try {
    const src = new URLSearchParams(window.location.search).get("src");
    if (src) {
      sessionStorage.setItem(ATTRIBUTION_KEY, src.slice(0, 100));
    }
  } catch {
    // sessionStorage unavailable (private mode edge cases) — attribution is best-effort
  }
}

/**
 * Leest de handmatig getagde bron uit `?src=` van de eerste pagina in de sessie.
 *
 * Let op wat dit NIET is: dit is geen kanaalattributie. Er wordt niet gekeken
 * naar `utm_source` of naar de referrer, dus voor bezoekers die binnenkomen via
 * een ongetagde link blijft dit leeg. Dat is geen gebrek: GA4 registreert bron
 * en medium zelf al per event. Gebruik dit veld alleen om specifieke, met de
 * hand getagde links uit elkaar te houden.
 */
export function getAttribution(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) return stored;
  } catch {
    // sessionStorage unavailable, so fall through to the URL below
  }
  // Fall back to the URL itself. initAttribution() runs in an effect on App,
  // and React runs child effects before parent ones, so a page that reports an
  // event on mount asks for the attribution before App has stored it. Every
  // caller that reads it on submit is long past mount, which hid this; the
  // page-view event on a landing page is the first that is not.
  try {
    return new URLSearchParams(window.location.search).get("src")?.slice(0, 100) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Track a visitor choosing one of the two doors on Home
 */
export function trackDoorSelected(door: "value" | "change") {
  trackEvent("door_selected", {
    event_category: "engagement",
    door,
    src: getAttribution(),
  });
}

/**
 * Track a successful benchmark waiting-list signup
 */
export function trackWaitlistJoined() {
  trackEvent("waitlist_joined", {
    event_category: "conversion",
    src: getAttribution(),
  });
  trackLinkedInConversion();
}

/**
 * Track a completed event registration.
 *
 * Carries an `event_label` because `event_registration` is one event name
 * shared by every event we run; the label is what tells one registration
 * apart from another in a report. `contact_form_submit` has no such label
 * because there is only ever one contact form.
 */
export function trackEventRegistration(eventName: string) {
  trackEvent("event_registration", {
    event_category: "conversion",
    event_label: eventName,
    src: getAttribution(),
  });
  trackLinkedInConversion();
}

/**
 * Waitlist qualification funnel events: wl_q_started, wl_q_answered (id),
 * wl_q_completed. waitlist_joined stays on the form submit itself.
 */
export function trackWaitlistQualification(
  event: "wl_q_started" | "wl_q_answered" | "wl_q_completed",
  params?: Record<string, any>,
) {
  trackEvent(event, params);
}

/**
 * Scorecard funnel events (spec §10): sc_start, sc_q_answered, sc_completed,
 * sc_email_submitted, sc_cta_clicked.
 */
export function trackScorecard(
  event: "sc_start" | "sc_q_answered" | "sc_completed" | "sc_email_submitted" | "sc_cta_clicked",
  params?: Record<string, any>,
) {
  trackEvent(event, { event_category: "scorecard", src: getAttribution(), ...params });
  if (event === "sc_email_submitted") trackLinkedInConversion();
}

/**
 * Glint pages: glint_page_viewed on arrival, glint_cta_clicked with a `cta`
 * label on each button. `page` distinguishes the mailed landing page (/glint)
 * from the public proposition page (/glint-support) so the two are
 * comparable in a report rather than indistinguishable.
 *
 * The page is reached through the link we mail and through LinkedIn campaigns,
 * so `src` is what ties a visit back to a campaign, per briefing paragraph 6.
 *
 * The briefing also asks for both CTAs to land in marketing_lead_activity in
 * the CRM. They do not, and cannot as the page stands: POST /api/website-signal
 * validates an email address before it will write a row, and both CTAs here
 * hand off to a mail client or to Bookings without the page ever seeing one.
 * The events below carry the campaign source; the identity arrives when the
 * mail or the booking does. Writing the CRM row from the page would need either
 * a form on the page or a website-signal that accepts an anonymous token.
 */
type GlintPage = "glint" | "glint-support";

export function trackGlintPage(
  event: "glint_page_viewed" | "glint_cta_clicked",
  page: GlintPage,
  params?: Record<string, any>,
) {
  trackEvent(event, {
    event_category: "glint_landing",
    page,
    src: getAttribution(),
    ...params
  });
  if (event === "glint_cta_clicked") trackLinkedInConversion();
}

/**
 * Microsoft sellers landing page (/microsoft): ms_page_viewed on arrival,
 * ms_cta_clicked with a `cta` label on each button.
 *
 * The page is reached through the link we mail and through the LinkedIn
 * campaign, so `src` is what ties a visit back to one of them
 * (`li-cfo`, `li-dormant`, `li-independent` for the three ad variants).
 * Per-recipient attribution is not read here: the mail platform already logs
 * clicks per recipient, and connecting a CTA press to a named seller needs the
 * CRM to accept a recipient token instead of an email address, which
 * api/website-signal does not do today.
 */

/**
 * Conversion id for the Microsoft sellers campaign, created in Campaign
 * Manager under Analyze > Conversion Tracking, as an event-specific
 * conversion rather than a page load: both CTAs leave the site, so there is no
 * thank-you URL to match on. While this is undefined lintrk still
 * fires, but without an id Campaign Manager records a generic event it cannot
 * attribute to a campaign, so the ads report clicks and nothing that happened
 * after the click.
 *
 * What this can never count: LinkedInInsightTag only injects the tag once a
 * visitor accepts marketing cookies, and consent here is opt-in. Campaign
 * Manager therefore sees a subset of the CTA presses the page actually had.
 * The shortfall is the consent rate, not a fault in the measurement.
 */
const LINKEDIN_MS_CONVERSION_ID: number | undefined = undefined;

/**
 * Which CTA presses count as a LinkedIn conversion.
 *
 * "See what we deliver" is deliberately absent: it only scrolls to a section
 * further down the same page. Counting it would inflate the conversion number,
 * and it would teach LinkedIn to optimise delivery towards people who scroll
 * rather than people who get in touch.
 *
 * `hero_email` is in the set because the hero button falls back to the mailto
 * when BOOKINGS_URL is emptied.
 */
const MS_CONVERSION_CTAS = new Set([
  "hero_bookings",
  "hero_email",
  "cta_bookings",
  "cta_email",
]);

export function trackMicrosoftPage(
  event: "ms_page_viewed" | "ms_cta_clicked",
  params?: Record<string, any>,
) {
  trackEvent(event, { event_category: "microsoft_sellers", src: getAttribution(), ...params });
  if (event === "ms_cta_clicked" && MS_CONVERSION_CTAS.has(String(params?.cta))) {
    trackLinkedInConversion(LINKEDIN_MS_CONVERSION_ID);
  }
}
