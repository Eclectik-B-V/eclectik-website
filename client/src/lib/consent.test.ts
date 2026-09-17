// @vitest-environment jsdom
// Deze suite gebruikt document.cookie en window, dus hij heeft een DOM nodig.
// De repo draait vitest standaard op de node-omgeving voor de api/- en
// shared/-tests, daarom zetten we het hier per bestand om.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCEPT_ALL,
  CONSENT_VERSION,
  COOKIE_NAME,
  DENY_ALL,
  applyConsent,
  hasValidConsent,
  readConsent,
  toSignals,
  writeConsent,
  type ConsentCategories,
} from "./consent";

function clearConsentCookie() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function setRawConsentCookie(raw: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/`;
}

function interceptCookieWrites(onWrite?: (value: string) => void) {
  const writes: string[] = [];
  const proto = Object.getPrototypeOf(document) as object;
  const original = Object.getOwnPropertyDescriptor(proto, "cookie")!;

  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => original.get!.call(document),
    set: (value: string) => {
      writes.push(value);
      onWrite?.(value);
      original.set!.call(document, value);
    },
  });

  return {
    writes,
    restore: () => {
      delete (document as unknown as Record<string, unknown>).cookie;
    },
  };
}

beforeEach(() => {
  clearConsentCookie();
  window.gtag = undefined;
  window.dataLayer = undefined;
});

describe("readConsent", () => {
  it("geeft null zonder cookie", () => {
    expect(readConsent()).toBeNull();
  });

  it("geeft null bij een onleesbare cookiewaarde", () => {
    setRawConsentCookie("dit-is-geen-json");
    expect(readConsent()).toBeNull();
  });

  it("geeft null bij een oudere consent-versie", () => {
    setRawConsentCookie(
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        timestamp: "2026-01-01T00:00:00.000Z",
        categories: ACCEPT_ALL,
      }),
    );
    expect(readConsent()).toBeNull();
  });

  it("geeft null als categories ontbreekt", () => {
    setRawConsentCookie(
      JSON.stringify({ version: CONSENT_VERSION, timestamp: "2026-01-01T00:00:00.000Z" }),
    );
    expect(readConsent()).toBeNull();
  });

  it("geeft null als een categorie geen boolean is", () => {
    setRawConsentCookie(
      JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: "2026-01-01T00:00:00.000Z",
        categories: { analytics: "ja", marketing: false, functional: false },
      }),
    );
    expect(readConsent()).toBeNull();
  });
});

describe("writeConsent en readConsent samen", () => {
  const combinations: ConsentCategories[] = [
    ACCEPT_ALL,
    DENY_ALL,
    { analytics: true, marketing: false, functional: false },
    { analytics: false, marketing: true, functional: false },
    { analytics: false, marketing: false, functional: true },
  ];

  it.each(combinations)("schrijft en leest %o terug", (categories) => {
    writeConsent(categories);
    expect(readConsent()?.categories).toEqual(categories);
  });

  it("zet de huidige versie en een ISO-timestamp", () => {
    const stored = writeConsent(ACCEPT_ALL);
    expect(stored.version).toBe(CONSENT_VERSION);
    expect(() => new Date(stored.timestamp).toISOString()).not.toThrow();
    expect(readConsent()?.version).toBe(CONSENT_VERSION);
  });
});

describe("writeConsent cookie-attributen", () => {
  it("zet Max-Age op twaalf maanden, Path=/ en SameSite=Lax", () => {
    const { writes, restore } = interceptCookieWrites();
    try {
      writeConsent(ACCEPT_ALL);
      expect(writes[0]).toContain("Max-Age=31536000");
      expect(writes[0]).toContain("Path=/");
      expect(writes[0]).toContain("SameSite=Lax");
    } finally {
      restore();
    }
  });

  it("voegt Secure niet toe op http", () => {
    const { writes, restore } = interceptCookieWrites();
    try {
      writeConsent(ACCEPT_ALL);
      expect(writes[0]).not.toContain("Secure");
    } finally {
      restore();
    }
  });

  it("voegt Secure toe op https", () => {
    const { writes, restore } = interceptCookieWrites();
    vi.stubGlobal("location", { ...window.location, protocol: "https:" });
    try {
      writeConsent(ACCEPT_ALL);
      expect(writes[0]).toContain("Secure");
    } finally {
      vi.unstubAllGlobals();
      restore();
    }
  });

  it("gooit geen fout als de cookie-setter faalt en geeft toch de opgeslagen keuze terug", () => {
    const { restore } = interceptCookieWrites(() => {
      throw new Error("cookies geblokkeerd");
    });
    try {
      let stored: ReturnType<typeof writeConsent> | undefined;
      expect(() => {
        stored = writeConsent(DENY_ALL);
      }).not.toThrow();
      expect(stored?.categories).toEqual(DENY_ALL);
    } finally {
      restore();
    }
  });
});

describe("hasValidConsent", () => {
  it("is false zonder opgeslagen keuze", () => {
    expect(hasValidConsent()).toBe(false);
  });

  it("is true na een opgeslagen keuze", () => {
    writeConsent(DENY_ALL);
    expect(hasValidConsent()).toBe(true);
  });
});

describe("toSignals", () => {
  it("vertaalt marketing naar alle drie de advertentiesignalen", () => {
    expect(toSignals({ analytics: false, marketing: true, functional: false })).toEqual({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  });

  it("vertaalt analytics en functional los van elkaar", () => {
    expect(toSignals({ analytics: true, marketing: false, functional: true })).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "granted",
      security_storage: "granted",
    });
  });

  it("houdt security_storage altijd granted", () => {
    expect(toSignals(DENY_ALL).security_storage).toBe("granted");
  });
});

describe("applyConsent", () => {
  it("stuurt een consent update naar gtag", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    applyConsent(ACCEPT_ALL);

    expect(gtag).toHaveBeenCalledWith("consent", "update", toSignals(ACCEPT_ALL));
  });

  it("pusht een consent_update event naar de dataLayer", () => {
    window.dataLayer = [];

    applyConsent(DENY_ALL);

    expect(window.dataLayer?.[0]).toEqual({
      event: "consent_update",
      ...toSignals(DENY_ALL),
    });
  });

  it("gooit geen fout als gtag en dataLayer ontbreken", () => {
    expect(() => applyConsent(ACCEPT_ALL)).not.toThrow();
  });
});
