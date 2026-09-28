// @vitest-environment jsdom
// trackContactFormSubmission pushes to window.dataLayer / window.gtag, so this
// suite needs a DOM. The repo runs vitest on the node environment by default,
// hence the per-file override above.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackContactFormSubmission,
  trackEventRegistration,
  trackGlintPage,
  trackMicrosoftPage,
} from "./tracking";

const FORBIDDEN_KEYS = [
  "name",
  "email",
  "company",
  "firstName",
  "lastName",
  "phone",
];

beforeEach(() => {
  window.gtag = vi.fn();
  window.dataLayer = [];
});

describe("trackContactFormSubmission", () => {
  it("accepts no arguments that could smuggle in personal data", () => {
    expect(trackContactFormSubmission.length).toBe(0);
  });

  it("fires a contact_form_submit event categorised as a conversion", () => {
    trackContactFormSubmission();

    const call = (window.gtag as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toBe("event");
    expect(call[1]).toBe("contact_form_submit");
    expect(call[2]).toMatchObject({ event_category: "conversion" });
  });

  it("never includes personal data in the event payload", () => {
    trackContactFormSubmission();

    const gtagPayload = (window.gtag as ReturnType<typeof vi.fn>).mock
      .calls[0][2];
    const dataLayerPayload = window.dataLayer?.[0];

    for (const key of FORBIDDEN_KEYS) {
      expect(gtagPayload).not.toHaveProperty(key);
      expect(dataLayerPayload).not.toHaveProperty(key);
    }
  });
});

describe("trackEventRegistration", () => {
  it("fires event_registration with a conversion category and the event name as label", () => {
    trackEventRegistration("amsterdam-2026");

    const call = (window.gtag as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toBe("event_registration");
    expect(call[2]).toMatchObject({
      event_category: "conversion",
      event_label: "amsterdam-2026",
    });
  });
});

describe("trackGlintPage", () => {
  it("tags a glint-support CTA click with page: glint-support", () => {
    trackGlintPage("glint_cta_clicked", "glint-support", { cta: "Talk to us" });

    const call = (window.gtag as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toBe("glint_cta_clicked");
    expect(call[2]).toMatchObject({ page: "glint-support", cta: "Talk to us" });
  });

  it("tags a glint page view with page: glint", () => {
    trackGlintPage("glint_page_viewed", "glint");

    const call = (window.gtag as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[1]).toBe("glint_page_viewed");
    expect(call[2]).toMatchObject({ page: "glint" });
  });

  /**
   * The Glint pages run on email outreach, not on a LinkedIn campaign, so they
   * report no LinkedIn conversion at all. Without a campaign behind it a press
   * would be filed as a generic event against nothing. Should a campaign start,
   * this expectation is what has to change first.
   */
  it("reports no LinkedIn conversion, on any CTA", () => {
    window.lintrk = vi.fn();

    for (const [page, cta] of [
      ["glint", "hero_bookings"],
      ["glint", "cta_contact"],
      ["glint", "case_request_full_story"],
      ["glint", "hero_see_how_we_support"],
      ["glint-support", "Talk to us"],
    ] as const) {
      trackGlintPage("glint_cta_clicked", page, { cta });
    }
    trackGlintPage("glint_page_viewed", "glint");

    expect(window.lintrk).not.toHaveBeenCalled();
  });
});

describe("trackMicrosoftPage", () => {
  /**
   * The conversion allowlist lives in the module and is not exported, so these
   * go through lintrk. Renaming a CTA label without adding it to that set stops
   * the button counting as a LinkedIn conversion, which is silent: the event
   * still reaches GA and only Campaign Manager goes quiet. That happened once,
   * when cta_email became cta_contact.
   */
  beforeEach(() => {
    window.lintrk = vi.fn();
  });

  it("counts the primary CTA as a LinkedIn conversion", () => {
    trackMicrosoftPage("ms_cta_clicked", { cta: "cta_contact" });

    expect(window.lintrk).toHaveBeenCalledWith("track", {
      conversion_id: 31055969,
    });
  });

  it("counts the booking CTAs as LinkedIn conversions", () => {
    for (const cta of ["hero_bookings", "hero_email", "cta_bookings"]) {
      (window.lintrk as ReturnType<typeof vi.fn>).mockClear();
      trackMicrosoftPage("ms_cta_clicked", { cta });

      expect(window.lintrk, cta).toHaveBeenCalledTimes(1);
    }
  });

  it("does not count a CTA that only scrolls further down the page", () => {
    trackMicrosoftPage("ms_cta_clicked", { cta: "hero_see_what_we_deliver" });

    expect(window.lintrk).not.toHaveBeenCalled();
  });

  it("does not count a page view", () => {
    trackMicrosoftPage("ms_page_viewed");

    expect(window.lintrk).not.toHaveBeenCalled();
  });
});
