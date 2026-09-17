// @vitest-environment jsdom
// trackContactFormSubmission pushes to window.dataLayer / window.gtag, so this
// suite needs a DOM. The repo runs vitest on the node environment by default,
// hence the per-file override above.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackContactFormSubmission, trackEventRegistration, trackGlintPage } from "./tracking";

const FORBIDDEN_KEYS = ["name", "email", "company", "firstName", "lastName", "phone"];

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

    const gtagPayload = (window.gtag as ReturnType<typeof vi.fn>).mock.calls[0][2];
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
});
