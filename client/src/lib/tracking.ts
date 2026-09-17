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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
  
  // Also push to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventParams
    });
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
 * Track contact form submission
 */
export function trackContactFormSubmission(formData?: {
  name?: string;
  email?: string;
  company?: string;
}) {
  trackEvent('contact_form_submit', {
    event_category: 'engagement',
    event_label: 'Contact Form',
    ...formData
  });
  
  // Track LinkedIn conversion
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
 * Track case study views
 */
export function trackCaseStudyView(caseStudyName: string) {
  trackEvent('case_study_view', {
    event_category: 'content',
    event_label: caseStudyName
  });
}

/**
 * Track resource downloads
 */
export function trackResourceDownload(resourceName: string, resourceType: string) {
  trackEvent('resource_download', {
    event_category: 'conversion',
    event_label: resourceName,
    resource_type: resourceType
  });
  
  // Track LinkedIn conversion for downloads
  trackLinkedInConversion();
}

/**
 * Track page views (called automatically by GA4, but can be used for custom tracking)
 */
export function trackPageView(pagePath: string, pageTitle: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(email?: string) {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
    event_label: 'Newsletter Subscription'
  });
  
  // Track LinkedIn conversion
  trackLinkedInConversion();
}

/**
 * Track consultation request
 */
export function trackConsultationRequest() {
  trackEvent('consultation_request', {
    event_category: 'conversion',
    event_label: 'Consultation Request',
    value: 1
  });
  
  // Track LinkedIn conversion
  trackLinkedInConversion();
}

/**
 * Track service page views
 */
export function trackServiceView(serviceName: string) {
  trackEvent('service_view', {
    event_category: 'content',
    event_label: serviceName
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
 * Glint value landing page (/glint): glint_page_viewed on arrival,
 * glint_cta_clicked with a `cta` label on each button.
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
export function trackGlintPage(
  event: "glint_page_viewed" | "glint_cta_clicked",
  params?: Record<string, any>,
) {
  trackEvent(event, { event_category: "glint_landing", src: getAttribution(), ...params });
  if (event === "glint_cta_clicked") trackLinkedInConversion();
}

/**
 * Microsoft sellers landing page (/microsoft): ms_page_viewed on arrival,
 * ms_cta_clicked with a `cta` label on each button.
 *
 * The page is reached only through the link we mail, so `src` is what ties a
 * visit back to a campaign. Per-recipient attribution is not read here: the
 * mail platform already logs clicks per recipient, and connecting a CTA press
 * to a named seller needs the CRM to accept a recipient token instead of an
 * email address, which api/website-signal does not do today.
 */
export function trackMicrosoftPage(
  event: "ms_page_viewed" | "ms_cta_clicked",
  params?: Record<string, any>,
) {
  trackEvent(event, { event_category: "microsoft_sellers", src: getAttribution(), ...params });
  if (event === "ms_cta_clicked") trackLinkedInConversion();
}
