import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { trackPageView } from "./tracking";

// The app runs these helpers in a browser; the suite runs in node, so the two
// globals they read are stubbed here.
const original = {
  window: (globalThis as any).window,
  document: (globalThis as any).document,
};

let gtagCalls: any[][];
let dataLayer: any[];

function setLocation(url: string) {
  const parsed = new URL(url);
  (globalThis as any).window.location = {
    href: parsed.href,
    pathname: parsed.pathname,
    search: parsed.search,
  };
}

beforeEach(() => {
  gtagCalls = [];
  dataLayer = [];
  (globalThis as any).window = {
    gtag: (...args: any[]) => gtagCalls.push(args),
    dataLayer,
  };
  (globalThis as any).document = { title: "Contact | Eclectik" };
  setLocation("https://www.eclectik-insights.co/contact");
});

afterEach(() => {
  (globalThis as any).window = original.window;
  (globalThis as any).document = original.document;
});

describe("trackPageView", () => {
  it("reports the current URL and title to GA4", () => {
    trackPageView();

    expect(gtagCalls).toHaveLength(1);
    const [command, name, params] = gtagCalls[0];
    expect(command).toBe("event");
    expect(name).toBe("page_view");
    expect(params.page_location).toBe(
      "https://www.eclectik-insights.co/contact"
    );
    expect(params.page_path).toBe("/contact");
    expect(params.page_title).toBe("Contact | Eclectik");
  });

  it("pushes the same page view to the GTM dataLayer", () => {
    trackPageView();

    expect(dataLayer).toHaveLength(1);
    expect(dataLayer[0].event).toBe("page_view");
    expect(dataLayer[0].page_path).toBe("/contact");
  });

  it("keeps the query string on the path so campaign links stay apart", () => {
    setLocation("https://www.eclectik-insights.co/glint?src=linkedin-oct");

    trackPageView();

    expect(gtagCalls[0][2].page_path).toBe("/glint?src=linkedin-oct");
    expect(gtagCalls[0][2].src).toBe("linkedin-oct");
  });

  it("lets a caller override path and title", () => {
    trackPageView("/scorecard/step-2", "Scorecard step 2");

    expect(gtagCalls[0][2].page_path).toBe("/scorecard/step-2");
    expect(gtagCalls[0][2].page_title).toBe("Scorecard step 2");
  });
});
