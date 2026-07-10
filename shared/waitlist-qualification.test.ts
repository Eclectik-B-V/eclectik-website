import { describe, it, expect } from "vitest";
import {
  BANK_VERSION, WAITLIST_QUESTIONS, validateWaitlistAnswers,
} from "./waitlist-qualification";
import { PROFILE_QUESTIONS } from "./scorecard";

const validAnswers = (): Record<string, string> =>
  Object.fromEntries(WAITLIST_QUESTIONS.map((q) => [q.id, q.options[0]]));

describe("bank shape", () => {
  it("is version 1.0 with five questions W1..W5", () => {
    expect(BANK_VERSION).toBe("1.0");
    expect(WAITLIST_QUESTIONS.map((q) => q.id)).toEqual(["W1", "W2", "W3", "W4", "W5"]);
  });
  it("every question has at least four options", () => {
    for (const q of WAITLIST_QUESTIONS) expect(q.options.length).toBeGreaterThanOrEqual(4);
  });
  it("W4 options are identical to scorecard profile question P3 (regression)", () => {
    const w4 = WAITLIST_QUESTIONS.find((q) => q.id === "W4")!;
    const p3 = PROFILE_QUESTIONS.find((q) => q.id === "P3")!;
    expect(w4.options).toEqual(p3.options);
  });
});

describe("validateWaitlistAnswers", () => {
  it("accepts a complete answers object with one valid option per question", () => {
    expect(validateWaitlistAnswers(validAnswers())).toBe(true);
    // and with the last option of each question
    const last = Object.fromEntries(
      WAITLIST_QUESTIONS.map((q) => [q.id, q.options[q.options.length - 1]]),
    );
    expect(validateWaitlistAnswers(last)).toBe(true);
  });
  it("rejects a missing answer (no W3)", () => {
    const a = validAnswers();
    delete a.W3;
    expect(validateWaitlistAnswers(a)).toBe(false);
  });
  it("rejects extra keys (W6)", () => {
    const a = { ...validAnswers(), W6: "anything" };
    expect(validateWaitlistAnswers(a)).toBe(false);
  });
  it("rejects an option string that is not in the bank (free text)", () => {
    const a = { ...validAnswers(), W1: "Some free-text answer" };
    expect(validateWaitlistAnswers(a)).toBe(false);
  });
  it("rejects a case variation of a valid option", () => {
    const a = validAnswers();
    a.W1 = a.W1.toUpperCase();
    expect(validateWaitlistAnswers(a)).toBe(false);
  });
  it("rejects a correct option attached to the wrong question", () => {
    const w5 = WAITLIST_QUESTIONS.find((q) => q.id === "W5")!;
    const a = { ...validAnswers(), W1: w5.options[0] };
    expect(validateWaitlistAnswers(a)).toBe(false);
  });
  it("rejects non-object inputs", () => {
    expect(validateWaitlistAnswers(null)).toBe(false);
    expect(validateWaitlistAnswers(undefined)).toBe(false);
    expect(validateWaitlistAnswers("W1")).toBe(false);
    expect(validateWaitlistAnswers(42)).toBe(false);
    expect(validateWaitlistAnswers([])).toBe(false);
    expect(validateWaitlistAnswers(["<6 months"])).toBe(false);
  });
});
