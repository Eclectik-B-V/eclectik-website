import { describe, expect, it } from "vitest";
import {
  EVENT_CONFIRM_COPY,
  EVENT_CONFIRM_INVALID_PATH,
  isEventConfirmPath,
} from "./eventConfirm";

/**
 * Wat hier getest wordt is niet de logica, want die is er nauwelijks, maar de
 * afspraken die stil te breken zijn: de datum staat in deze repo op twee
 * plekken, en de huisregel over em dashes hangt anders aan de oplettendheid
 * van een reviewer.
 */

/** Verzamelt elke string uit de copy, hoe diep hij ook zit. */
function allCopyStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [(value as (name: string) => string)("Marco")];
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(allCopyStrings);
  }
  return [];
}

const copy = allCopyStrings(EVENT_CONFIRM_COPY);

describe("EVENT_CONFIRM_COPY", () => {
  it("bevat nergens een em dash of en dash", () => {
    const offenders = copy.filter((t) => t.includes("—") || t.includes("–"));
    expect(offenders).toEqual([]);
  });

  it("noemt de definitieve datum", () => {
    expect(EVENT_CONFIRM_COPY.ask.dateLine).toBe("Tuesday 17 November 2026");
  });

  it("noemt 17 november in de bevestiging na een ja", () => {
    expect(EVENT_CONFIRM_COPY.thanksYes.title).toContain("17 November");
  });

  it("noemt de twee oude datums alleen in de uitleg, nergens als de datum", () => {
    // 6 oktober en 12 november mogen genoemd worden om uit te leggen waarom er
    // weer een mail komt, maar niet in de regel die iemand overneemt.
    expect(EVENT_CONFIRM_COPY.ask.intro).toContain("6 October");
    expect(EVENT_CONFIRM_COPY.ask.intro).toContain("12 November");
    expect(EVENT_CONFIRM_COPY.ask.dateLine).not.toContain("October");
    expect(EVENT_CONFIRM_COPY.ask.dateLine).not.toContain("12");
  });

  it("zegt nergens 10 november, de datum die nooit heeft bestaan", () => {
    const offenders = copy.filter((t) => t.includes("10 November"));
    expect(offenders).toEqual([]);
  });

  it("houdt de tijd in CET, want 17 november valt na de wintertijd", () => {
    expect(EVENT_CONFIRM_COPY.ask.timeLine).toContain("CET");
    expect(EVENT_CONFIRM_COPY.ask.timeLine).not.toContain("CEST");
  });

  it("geeft de twee antwoorden als hele zinnen, niet als Ja en Nee", () => {
    expect(EVENT_CONFIRM_COPY.ask.yes).toBe("Yes, that date suits me");
    expect(EVENT_CONFIRM_COPY.ask.no).toBe("No, sorry, I cannot make it");
  });
});

describe("isEventConfirmPath", () => {
  it.each(["/e", "/e/", "/e/invalid", "/e/AbC123-_xyzAbC123-_xyz0"])(
    "%s hoort bij de kale pagina's",
    (path) => {
      expect(isEventConfirmPath(path)).toBe(true);
    }
  );

  it.each(["/", "/events/amsterdam-2026", "/s/intern", "/essays"])(
    "%s hoort er niet bij",
    (path) => {
      expect(isEventConfirmPath(path)).toBe(false);
    }
  );

  it("de invalid-route valt onder zijn eigen check", () => {
    expect(isEventConfirmPath(EVENT_CONFIRM_INVALID_PATH)).toBe(true);
  });
});
