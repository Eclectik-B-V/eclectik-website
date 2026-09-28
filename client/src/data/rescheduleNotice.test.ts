import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasDismissedNotice,
  isWithinNoticeWindow,
  markNoticeDismissed,
  NOTICE_END_ISO,
  NOTICE_STORAGE_KEY,
  shouldShowNotice,
} from "./rescheduleNotice";

/**
 * Twee dingen die stil fout kunnen gaan: het venster dat een dag naast zit
 * doordat iemand de zomertijd vergeet, en localStorage dat gooit in plaats van
 * netjes niets terug te geven. De rest van de module is een paar regels.
 */

const END_MS = Date.parse(NOTICE_END_ISO);

/** Zet een nep-localStorage neer en geeft hem terug. */
function stubStorage(): Map<string, string> {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
  });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isWithinNoticeWindow", () => {
  it("staat open op de laatste seconde", () => {
    expect(isWithinNoticeWindow(END_MS)).toBe(true);
  });

  it("is dicht een seconde later", () => {
    expect(isWithinNoticeWindow(END_MS + 1000)).toBe(false);
  });

  it("valt op 3 oktober 2026 23:59:59 in Amsterdamse tijd", () => {
    const local = new Date(END_MS).toLocaleString("nl-NL", {
      timeZone: "Europe/Amsterdam",
      dateStyle: "short",
      timeStyle: "medium",
    });
    expect(local).toContain("3-10-2026");
    expect(local).toContain("23:59:59");
  });

  it("staat nog open op de dag dat de melding live gaat", () => {
    expect(isWithinNoticeWindow(Date.parse("2026-09-28T12:00:00Z"))).toBe(true);
  });
});

describe("hasDismissedNotice", () => {
  it("is false zonder window, zoals in deze node-omgeving", () => {
    expect(hasDismissedNotice()).toBe(false);
  });

  it("is false wanneer localStorage gooit, zoals in een privevenster", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("The operation is insecure.");
      },
    });
    expect(hasDismissedNotice()).toBe(false);
  });

  it("is true nadat de melding is weggeklikt", () => {
    stubStorage();
    markNoticeDismissed();
    expect(hasDismissedNotice()).toBe(true);
  });

  it("schrijft onder de sleutel met het jaartal erin", () => {
    const store = stubStorage();
    markNoticeDismissed();
    expect(store.get(NOTICE_STORAGE_KEY)).toBe("1");
  });
});

describe("markNoticeDismissed", () => {
  it("gooit niet wanneer localStorage weigert te schrijven", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });
    expect(() => markNoticeDismissed()).not.toThrow();
    expect(hasDismissedNotice()).toBe(false);
  });
});

describe("shouldShowNotice", () => {
  it("toont de melding binnen het venster voor wie hem nog niet weg heeft", () => {
    stubStorage();
    expect(shouldShowNotice(END_MS - 1000)).toBe(true);
  });

  it("zwijgt na het venster, ook voor wie hem nooit heeft weggeklikt", () => {
    stubStorage();
    expect(shouldShowNotice(END_MS + 1000)).toBe(false);
  });

  it("zwijgt binnen het venster zodra hij is weggeklikt", () => {
    stubStorage();
    markNoticeDismissed();
    expect(shouldShowNotice(END_MS - 1000)).toBe(false);
  });
});
