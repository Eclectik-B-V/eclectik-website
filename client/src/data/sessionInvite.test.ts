import { describe, expect, it } from "vitest";
import {
  isSessionInviteClosed,
  isSessionInvitePath,
  SESSION_COPY,
  SESSION_DEADLINE_ISO,
  SESSION_SLOTS,
} from "./sessionInvite";

/**
 * De config draagt de teksten en de momenten van de tokenpagina's. Wat hier
 * getest wordt is niet de logica, want die is er nauwelijks, maar de afspraken
 * die stil te breken zijn bij een tekstwijziging vlak voor de mailing uitgaat.
 */

/** Verzamelt elke string uit SESSION_COPY, hoe diep hij ook zit. */
function allCopyStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [(value as (name: string) => string)("Marco")];
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(allCopyStrings);
  }
  return [];
}

describe("sessionInvite copy", () => {
  it("bevat nergens een em dash of en dash", () => {
    const offenders = allCopyStrings(SESSION_COPY).filter(
      (text) => text.includes("—") || text.includes("–"),
    );
    expect(offenders).toEqual([]);
  });

  it("zet de drie slotpagina's samen tot de zin uit de spec", () => {
    expect(`${SESSION_COPY.done.title} ${SESSION_COPY.done.body}`).toBe(
      "Thanks, that is all we needed. We will confirm the date by email once we have everyone's preferences.",
    );
    expect(`${SESSION_COPY.invalid.title} ${SESSION_COPY.invalid.body}`).toBe(
      "This link is not valid. It may have expired, or it was not meant for this browser. Reply to the email and we will sort it out.",
    );
    expect(`${SESSION_COPY.closed.title} ${SESSION_COPY.closed.body}`).toBe(
      "This invitation has closed. Reply to the email if you still want to join and we will see what we can do.",
    );
  });

  it("toont alleen de voornaam in de aanhef", () => {
    expect(SESSION_COPY.greeting("Marco")).toBe("Hi Marco,");
  });
});

describe("SESSION_SLOTS", () => {
  it("houdt de drie momenten met hun vaste tijdzonestrings", () => {
    expect(SESSION_SLOTS.map((slot) => slot.id)).toEqual([
      "slot-2026-10-29",
      "slot-2026-11-04",
      "slot-2026-11-05",
    ]);
    // Het eerste moment staat op zomertijd in de VS, de andere twee niet. Dat
    // verschil is precies waarom deze strings niet omgerekend worden.
    expect(SESSION_SLOTS[0].times).toContain("PDT");
    expect(SESSION_SLOTS[1].times).toContain("PST");
    expect(SESSION_SLOTS[2].times).toContain("PST");
  });
});

describe("isSessionInviteClosed", () => {
  it("is 22 oktober 2026 23:59 CEST nog open", () => {
    expect(SESSION_DEADLINE_ISO).toBe("2026-10-22T21:59:59Z");
    expect(isSessionInviteClosed(new Date("2026-10-22T21:59:59Z"))).toBe(false);
  });

  it("is een seconde later dicht", () => {
    expect(isSessionInviteClosed(new Date("2026-10-22T22:00:00Z"))).toBe(true);
  });
});

describe("isSessionInvitePath", () => {
  it("herkent de tokenpagina's", () => {
    expect(isSessionInvitePath("/s/abc123/slots")).toBe(true);
    expect(isSessionInvitePath("/s/invalid")).toBe(true);
    expect(isSessionInvitePath("/s")).toBe(true);
  });

  it("laat de rest van de site met rust", () => {
    expect(isSessionInvitePath("/")).toBe(false);
    expect(isSessionInvitePath("/scorecard")).toBe(false);
    // Geen prefixmatch op de letter alleen: /sectors is een gewone pagina en
    // houdt zijn analytics.
    expect(isSessionInvitePath("/sectors")).toBe(false);
  });
});
