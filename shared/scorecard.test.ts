import { describe, it, expect } from "vitest";
import {
  QUESTIONS, PROFILE_QUESTIONS, questionOrder, validateAnswers,
  computeScorecard, gapBullets, type Answers,
} from "./scorecard";

const allAnswers = (i: number, p: Partial<Answers> = {}): Answers => {
  const a: Answers = {};
  QUESTIONS.forEach((q) => { a[q.id] = i; });
  return { P1: 0, P2: 0, P3: 0, ...a, ...p };
};

describe("bank shape", () => {
  it("has 20 scored questions (8V, 8C, 4R) and 3 profile questions", () => {
    expect(QUESTIONS).toHaveLength(20);
    expect(QUESTIONS.filter((q) => q.block === "V")).toHaveLength(8);
    expect(QUESTIONS.filter((q) => q.block === "C")).toHaveLength(8);
    expect(QUESTIONS.filter((q) => q.block === "R")).toHaveLength(4);
    expect(PROFILE_QUESTIONS).toHaveLength(3);
  });
  it("range questions have 6 anchors + scores, maturity 5 anchors", () => {
    for (const q of QUESTIONS) {
      if (q.type === "range") { expect(q.anchors).toHaveLength(6); expect(q.scores).toEqual([0,0,1,2,3,4]); }
      else expect(q.anchors).toHaveLength(5);
    }
  });
  it("every question has a short label, and labels are unique", () => {
    for (const q of QUESTIONS) {
      expect(q.label.trim().length).toBeGreaterThan(0);
      expect(q.label.length).toBeLessThan(45);
      expect(q.label).not.toContain("?");
    }
    expect(new Set(QUESTIONS.map((q) => q.label)).size).toBe(QUESTIONS.length);
  });
});

describe("questionOrder", () => {
  it("value door: V1..V8 then C1..C8 then R1..R4", () => {
    expect(questionOrder("value").map((q) => q.id).join(","))
      .toBe("V1,V2,V3,V4,V5,V6,V7,V8,C1,C2,C3,C4,C5,C6,C7,C8,R1,R2,R3,R4");
  });
  it("change door: C-block first", () => {
    const ids = questionOrder("change").map((q) => q.id);
    expect(ids.slice(0, 8).join(",")).toBe("C1,C2,C3,C4,C5,C6,C7,C8");
    expect(ids.slice(16).join(",")).toBe("R1,R2,R3,R4");
  });
});

describe("computeScorecard", () => {
  it("all-zero → flying_blind, workshop, overlay", () => {
    const r = computeScorecard(allAnswers(0, { P1: 4, P2: 0, P3: 3 }));
    expect(r.scores).toEqual({ value: 0, change: 0, readiness: 0, index: 0 });
    expect(r.quadrant).toBe("flying_blind");
    expect(r.route).toBe("workshop");
    expect(r.readinessOverlay).toBe(true);
  });
  it("all-max → audit_ready, benchmark", () => {
    const a = allAnswers(4, { P1: 4, P2: 3, P3: 3 });
    (["V1", "V2", "C3"] as const).forEach((id) => { a[id] = 5; });
    const r = computeScorecard(a);
    expect(r.scores).toEqual({ value: 100, change: 100, readiness: 100, index: 100 });
    expect(r.quadrant).toBe("audit_ready");
    expect(r.route).toBe("benchmark");
  });
  it("renewal <6 months → assessment", () => {
    expect(computeScorecard(allAnswers(4, { P1: 4, P2: 0, P3: 0 })).route).toBe("assessment");
  });
  it("V8<=1 + CFO → assessment", () => {
    const a = allAnswers(3, { P1: 0, P2: 0, P3: 3 }); a.V8 = 1;
    expect(computeScorecard(a).route).toBe("assessment");
  });
  it("change<40 + CHRO → insight_review", () => {
    const a = allAnswers(0, { P1: 2, P2: 0, P3: 3 }); a.V1 = 5; a.V2 = 5;
    expect(computeScorecard(a).route).toBe("insight_review");
  });
});

describe("validateAnswers / gapBullets", () => {
  it("rejects incomplete sets", () => {
    const a = allAnswers(1); delete a.C4;
    expect(validateAnswers(a)).toBe(false);
    expect(validateAnswers(allAnswers(1))).toBe(true);
  });
  it("returns the 3 lowest-scoring gaps with 'what good looks like' text", () => {
    const a = allAnswers(3); a.V5 = 0; a.C2 = 0; a.R3 = 1;
    const gaps = gapBullets(a);
    expect(gaps.map((g) => g.id).sort()).toEqual(["C2", "R3", "V5"]);
    const v5 = QUESTIONS.find((q) => q.id === "V5")!;
    expect(gaps.find((g) => g.id === "V5")!.text).toContain(v5.anchors[4]);
  });
  it("names the topic and the answer given next to what good looks like", () => {
    const a = allAnswers(3); a.V5 = 0; a.C2 = 0; a.R3 = 1;
    const v5 = QUESTIONS.find((q) => q.id === "V5")!;
    const g = gapBullets(a).find((x) => x.id === "V5")!;
    expect(g.label).toBe(v5.label);
    expect(g.current).toBe(v5.anchors[0]);
    expect(g.target).toBe(v5.anchors[4]);
    expect(g.text).toBe(
      `${v5.label}. Today: ${v5.anchors[0]}. What good looks like: ${v5.anchors[4]}.`
    );
  });
  it("all-lowest answers still give three distinct, self-explaining bullets", () => {
    const gaps = gapBullets(allAnswers(0));
    expect(gaps).toHaveLength(3);
    expect(new Set(gaps.map((g) => g.label)).size).toBe(3);
    expect(new Set(gaps.map((g) => g.text)).size).toBe(3);
    for (const g of gaps) {
      const q = QUESTIONS.find((x) => x.id === g.id)!;
      expect(g.current).toBe(q.anchors[0]);
      expect(g.text.startsWith(`${q.label}.`)).toBe(true);
      expect(g.text).toContain(`Today: ${q.anchors[0]}.`);
      expect(g.text).toContain(`What good looks like: ${q.anchors[q.anchors.length - 1]}`);
    }
  });
  it("questions sharing a top anchor produce different bullets", () => {
    const a = allAnswers(4); a.V1 = 0; a.V2 = 0; a.C3 = 0;
    const gaps = gapBullets(a);
    expect(gaps.map((g) => g.id).sort()).toEqual(["C3", "V1", "V2"]);
    expect(new Set(gaps.map((g) => g.target))).toEqual(new Set([">75%"]));
    expect(new Set(gaps.map((g) => g.text)).size).toBe(3);
  });
});
