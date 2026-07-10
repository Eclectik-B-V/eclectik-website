// Waitlist qualification question bank (v1.0). Shared by the waitlist card
// stepper (client) and api/waitlist-qualification.ts (server-side validation).
// Copy is verbatim from docs/superpowers/specs/2026-07-09-waitlist-qualification-design.md
// (British English). Answers are stored as readable labels, not indexes.

export const BANK_VERSION = "1.0";

export interface WaitlistQuestion {
  id: "W1" | "W2" | "W3" | "W4" | "W5";
  text: string;
  options: string[];
}

export const WAITLIST_QUESTIONS: WaitlistQuestion[] = [
  {
    id: "W1",
    text: "What's prompting you to look at benchmarking now?",
    options: [
      "Board or exec pressure to show what AI delivers",
      "An upcoming licence or EA renewal",
      "We're mid-rollout and can't see what's working",
      "Curious how we compare with peers",
    ],
  },
  {
    id: "W2",
    text: "How do you currently answer whether your AI transformation is working?",
    options: [
      "Vendor dashboards and usage reports",
      "External review or audit",
      "Internal analytics and surveys",
      "Honestly, we can't yet",
    ],
  },
  {
    id: "W3",
    text: "What worries you most about your AI investment right now?",
    options: [
      "We can't show return on investment",
      "Adoption is stalling",
      "Change fatigue in the workforce",
      "Costs rising faster than value",
    ],
  },
  {
    // Identical options to scorecard profile question P3 → matchable on email in the CRM.
    id: "W4",
    text: "When is your next licence or EA renewal moment?",
    options: ["<6 months", "6–12 months", "12–24 months", ">24 months", "Don't know"],
  },
  {
    id: "W5",
    text: "What would make the benchmark most valuable to you?",
    options: [
      "Seeing how we compare with sector peers",
      "Independent evidence for the board",
      "A stronger position in vendor negotiations",
      "Finding out where we're falling behind",
    ],
  },
];

export type WaitlistAnswers = Record<string, string>;

/**
 * True iff `a` is a plain object with exactly the five W-ids as keys and, per
 * id, a value that is literally (case-sensitive) one of that question's
 * options. Free text, unknown ids, missing answers, and options attached to
 * the wrong question are all rejected.
 */
export function validateWaitlistAnswers(a: unknown): a is WaitlistAnswers {
  if (typeof a !== "object" || a === null || Array.isArray(a)) return false;
  const rec = a as Record<string, unknown>;
  if (Object.keys(rec).length !== WAITLIST_QUESTIONS.length) return false;
  return WAITLIST_QUESTIONS.every((q) => {
    const v = rec[q.id];
    return typeof v === "string" && q.options.includes(v);
  });
}
