# Scorecard Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The `/scorecard` self-assessment: two doors, 20+3 questions one-per-screen, client-side scoring for an instant result, mandatory email gate, result page with dials/quadrant/gaps/routed CTA, submission proxied to the CRM intake.

**Architecture:** A typed question bank + pure scoring functions in `shared/scorecard.ts` (mirrors the CRM's `api/_lib/scorecard-lib.js`, bank v1.0). The page `client/src/pages/Scorecard.tsx` is a phase machine (door → questions → profile → email → result) with sessionStorage persistence. `api/scorecard.ts` validates with zod and proxies to `${CRM_BASE_URL}/api/scorecard-intake` with the shared secret (same graceful-degradation idiom as `api/waitlist.ts`).

**Tech Stack:** Vite 7 + React 19 + TS, wouter, framer-motion, Tailwind 4 (existing tokens only), zod, vitest (new devDependency), Vercel functions.

**Repo:** `/Users/olivierarnolds/Desktop/eclectik-website-H22026` (worktree, branch `h2-2026-redesign`). Commit per task, NEVER push. Copy rules apply: British English, no "leverage/unlock/seamless", no MIT-95% stat.

**Spec:** `docs/superpowers/specs/2026-07-09-scorecard-fase1-design.md`; question texts/anchors/copy: `docs/superpowers/specs/2026-07-07-scorecard-build-spec-marco-v1.md` (§2 JSON is the verbatim source for the bank; §5 quadrant copy verbatim).

**Payload contract to CRM** (must match the CRM plan `eclektik-crm/docs/superpowers/plans/2026-07-09-scorecard-intake.md`):

```json
{ "source":"website", "form_type":"scorecard", "email":"a@b.co", "consent":false,
  "door":"value", "answers":{"V1":2, "...":0, "P3":1}, "src":"li-x" }
```

---

### Task 1: vitest setup + `shared/scorecard.ts` (TDD)

**Files:**
- Modify: `package.json` (add vitest devDependency + `"test": "vitest run"` script)
- Create: `shared/scorecard.ts`
- Test: `shared/scorecard.test.ts`

- [ ] **Step 1: Add vitest** — `pnpm add -D vitest`, add `"test": "vitest run"` to scripts. Verify `pnpm test` runs (no test files yet → "No test files found" is fine).

- [ ] **Step 2: Write the failing tests** — `shared/scorecard.test.ts`. Port the CRM plan's Task 2 test cases (same maths, same expectations) to TS against this module's API, plus order/gap tests:

```ts
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
});
```

- [ ] **Step 3: Run, verify FAIL** — `pnpm test` → module not found.

- [ ] **Step 4: Implement `shared/scorecard.ts`**

The 20 questions + anchors are copied VERBATIM from the spec JSON in `docs/superpowers/specs/2026-07-07-scorecard-build-spec-marco-v1.md` §2 — read that file and transcribe exactly (all texts, anchors, the three `range` questions V1/V2/C3 with `scores:[0,0,1,2,3,4]`, and P1–P3 options). Skeleton around the bank:

```ts
// Scorecard bank v1.0 + scoring/routing rules. MUST stay in sync with the
// CRM's api/_lib/scorecard-lib.js (eclektik-crm repo). Source of truth for
// texts: docs/superpowers/specs/2026-07-07-scorecard-build-spec-marco-v1.md §2–§4.
// Answers are 0-based OPTION INDEXES; scoring maps per question type.

export type Block = "V" | "C" | "R";
export type Door = "value" | "change";
export type Route = "assessment" | "insight_review" | "benchmark" | "workshop";
export type Band = "blind_spot" | "partial_view" | "evidence_led";
export type Answers = Record<string, number>;

export interface Question {
  id: string; block: Block; type: "maturity" | "range";
  text: string; anchors: string[]; scores?: number[];
}
export interface ProfileQuestion { id: "P1" | "P2" | "P3"; text: string; options: string[]; }

export const BANK_VERSION = "1.0";
export const QUESTIONS: Question[] = [ /* V1..V8, C1..C8, R1..R4 — verbatim uit §2 */ ];
export const PROFILE_QUESTIONS: ProfileQuestion[] = [ /* P1..P3 verbatim uit §2 */ ];

const byBlock = (b: Block) => QUESTIONS.filter((q) => q.id.startsWith(b));

export function questionOrder(door: Door): Question[] {
  return door === "change"
    ? [...byBlock("C"), ...byBlock("V"), ...byBlock("R")]
    : [...byBlock("V"), ...byBlock("C"), ...byBlock("R")];
}

const answerScore = (q: Question, idx: number) => (q.scores ? q.scores[idx] : idx);
const qById = new Map(QUESTIONS.map((q) => [q.id, q]));

export function validateAnswers(answers: Answers): boolean {
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (!Number.isInteger(v) || v < 0 || v >= q.anchors.length) return false;
  }
  for (const p of PROFILE_QUESTIONS) {
    const v = answers[p.id];
    if (!Number.isInteger(v) || v < 0 || v >= p.options.length) return false;
  }
  return true;
}

export interface ScorecardResult {
  scores: { value: number; change: number; readiness: number; index: number };
  bands: { value: Band; change: Band; readiness: Band };
  quadrant: "flying_blind" | "spreadsheet_confident" | "people_aware_value_blind" | "audit_ready";
  route: Route;
  readinessOverlay: boolean;
  profile: { role: string; orgSize: string; renewalWindow: string };
}

const band = (x: number): Band => (x < 40 ? "blind_spot" : x < 70 ? "partial_view" : "evidence_led");
const mean = (b: Block, a: Answers) => {
  const qs = byBlock(b);
  return qs.reduce((s, q) => s + answerScore(q, a[q.id]), 0) / qs.length;
};

export function computeScorecard(a: Answers): ScorecardResult {
  const value = mean("V", a) * 25, change = mean("C", a) * 25, readiness = mean("R", a) * 25;
  const index = 0.4 * value + 0.4 * change + 0.2 * readiness;
  const quadrant =
    value < 60 && change < 60 ? "flying_blind"
    : value >= 60 && change < 60 ? "spreadsheet_confident"
    : value < 60 ? "people_aware_value_blind" : "audit_ready";
  const role = PROFILE_QUESTIONS[0].options[a.P1];
  const renewal = PROFILE_QUESTIONS[2].options[a.P3];
  let route: Route = "workshop";
  const v8 = qById.get("V8")!;
  if (["<6 months", "6–12 months"].includes(renewal)
      || (answerScore(v8, a.V8) <= 1 && ["CFO / Finance", "CIO / IT / Digital"].includes(role))) {
    route = "assessment";
  } else if (change < 40 && role === "CHRO / HR") route = "insight_review";
  else if (index >= 70) route = "benchmark";
  return {
    scores: { value: Math.round(value), change: Math.round(change), readiness: Math.round(readiness), index: Math.round(index) },
    bands: { value: band(value), change: band(change), readiness: band(readiness) },
    quadrant, route,
    readinessOverlay: readiness < 40,
    profile: { role, orgSize: PROFILE_QUESTIONS[1].options[a.P2], renewalWindow: renewal },
  };
}

// Placeholder gap lines until Marco/Manish supply final copy (spec §5):
// "what good looks like" = the anchor text of the top score.
export function gapBullets(a: Answers): { id: string; text: string }[] {
  return QUESTIONS
    .map((q) => ({ q, score: answerScore(q, a[q.id]) }))
    .sort((x, y) => x.score - y.score)
    .slice(0, 3)
    .map(({ q }) => ({
      id: q.id,
      text: `What good looks like: ${q.anchors[q.anchors.length - 1]}`,
    }));
}
```

- [ ] **Step 5: Run, verify PASS** — `pnpm test` all green; `pnpm check` (tsc) clean.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml shared/scorecard.ts shared/scorecard.test.ts
git commit -m "feat: scorecard question bank + scoring engine (TDD, bank v1.0)"
```

---

### Task 2: Tracking events + API proxy

**Files:**
- Modify: `client/src/lib/tracking.ts` (append)
- Create: `api/scorecard.ts`

- [ ] **Step 1: Append to `client/src/lib/tracking.ts`**

```ts
/**
 * Scorecard funnel events (spec §10): sc_start, sc_q_answered, sc_completed,
 * sc_email_submitted, sc_cta_clicked.
 */
export function trackScorecard(
  event: "sc_start" | "sc_q_answered" | "sc_completed" | "sc_email_submitted" | "sc_cta_clicked",
  params?: Record<string, any>,
) {
  trackEvent(event, { event_category: "scorecard", src: getAttribution(), ...params });
  if (event === "sc_email_submitted") trackLinkedInConversion();
}
```

- [ ] **Step 2: Create `api/scorecard.ts`** — same idiom as `api/waitlist.ts` (zod + graceful CRM degradation), but the CRM call is the primary action here; there is no email step on the website side:

```ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

// 20 scored ids + P1..P3; values are 0-based option indexes. Detailed
// validation (per-question ranges) happens in the CRM intake, which also
// recomputes all scores from these raw answers.
const BodySchema = z.object({
  email: z.string().trim().email().max(200),
  consent: z.boolean(),
  door: z.enum(["value", "change"]),
  answers: z.record(z.string().regex(/^(V[1-8]|C[1-8]|R[1-4]|P[1-3])$/), z.number().int().min(0).max(5)),
  src: z.string().trim().max(100).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data.answers).length !== 23) {
    return res.status(400).json({ error: "Invalid scorecard data" });
  }
  const data = parsed.data;

  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    // Result is already shown client-side; losing the record is logged loudly.
    console.error("CRM env vars not set — scorecard response NOT stored");
    return res.status(200).json({ ok: true, stored: false });
  }

  try {
    const r = await fetch(`${base}/api/scorecard-intake`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify({
        source: "website", form_type: "scorecard",
        email: data.email, consent: data.consent, door: data.door,
        answers: data.answers, src: data.src,
      }),
    });
    if (!r.ok) {
      console.error("CRM scorecard-intake failed:", r.status, await r.text().catch(() => ""));
      return res.status(200).json({ ok: true, stored: false });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    console.error("CRM scorecard-intake error:", err);
    return res.status(200).json({ ok: true, stored: false });
  }
}
```

- [ ] **Step 3: Verify** — `pnpm check` clean; `pnpm test` green.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/tracking.ts api/scorecard.ts
git commit -m "feat: scorecard tracking events + API proxy naar CRM-intake"
```

---

### Task 3: Scorecard flow UI (door chooser + question screens + email gate)

**Files:**
- Create: `client/src/components/scorecard/DoorChooser.tsx`
- Create: `client/src/components/scorecard/QuestionScreen.tsx`
- Create: `client/src/components/scorecard/EmailGate.tsx`
- Rewrite: `client/src/pages/Scorecard.tsx` (replaces the placeholder)

House style: dark theme, `bg-card backdrop-blur-md border border-white/10 rounded-2xl` cards, `Button` from `@/components/ui/button`, framer-motion `initial/animate` fades, `Helmet` for meta, Layout wrapper — mirror `client/src/pages/Benchmark.tsx` and `client/src/components/WaitlistForm.tsx` idioms.

- [ ] **Step 1: `DoorChooser.tsx`**

```tsx
import { motion } from "framer-motion";
import type { Door } from "@shared/scorecard";

const DOORS: { door: Door; eyebrow: string; title: string; body: string; accent: string }[] = [
  {
    door: "value", accent: "text-primary",
    eyebrow: "Proof of value · CFO & CIO",
    title: "Prove the value",
    body: "Start from the numbers: licences, usage, cost and evidence for the board.",
  },
  {
    door: "change", accent: "text-accent",
    eyebrow: "Proof of change · Transformation leaders",
    title: "Prove the change",
    body: "Start from your people: leadership, training, listening and change capacity.",
  },
];

export default function DoorChooser({ onSelect }: { onSelect: (door: Door) => void }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
        Is your AI transformation actually working?
      </h1>
      <p className="text-muted-foreground mb-10">
        A free 3–4 minute self-assessment. 23 questions, an instant readiness profile,
        and the one next step that fits your situation.
      </p>
      <div className="grid md:grid-cols-2 gap-6 text-left">
        {DOORS.map((d, i) => (
          <motion.button
            key={d.door} type="button" onClick={() => onSelect(d.door)}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-all hover:-translate-y-1 hover:border-primary text-left"
          >
            <span className={`${d.accent} text-xs tracking-wider uppercase font-semibold block mb-3`}>{d.eyebrow}</span>
            <span className="text-xl font-heading font-semibold text-white block mb-2">{d.title}</span>
            <span className="text-sm text-muted-foreground">{d.body}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `QuestionScreen.tsx`** — one question, anchors as radio cards, progress bar, back button. Works for both scored and profile questions:

```tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  step: number; total: number;              // 1-based over alle 23 vragen
  text: string; options: string[];
  selected?: number;
  onAnswer: (optionIndex: number) => void;  // auto-advance
  onBack?: () => void;
}

export default function QuestionScreen({ step, total, text, options, selected, onAnswer, onBack }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back"
            className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : <span className="w-5" />}
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">{step}/{total}</span>
      </div>
      <motion.div key={text} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-white mb-8">{text}</h2>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label={text}>
          {options.map((label, i) => (
            <Button
              key={i} type="button" variant="outline" role="radio" aria-checked={selected === i}
              onClick={() => onAnswer(i)}
              className={`justify-start text-left h-auto py-4 px-5 whitespace-normal border-white/10 bg-card hover:border-primary hover:bg-card ${
                selected === i ? "border-primary text-primary" : "text-foreground"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: `EmailGate.tsx`** — mandatory email before the result (spec besluit 5), consent checkbox default-off, GDPR line:

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  submitting: boolean;
  onSubmit: (email: string, consent: boolean) => void;
  onBack: () => void;
}

export default function EmailGate({ submitting, onSubmit, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="max-w-md mx-auto">
      <button type="button" onClick={onBack} aria-label="Back"
        className="text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-heading font-semibold text-white mb-3">Where do we send your report?</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Your results appear straight away. We use your email to deliver your full report
        and keep it no longer than needed for that purpose.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); if (valid && !submitting) onSubmit(email.trim(), consent); }}
        className="space-y-4">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Work email"
          className="w-full bg-card border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>Send me the monthly insights letter. Unsubscribe anytime.</span>
        </label>
        <Button type="submit" disabled={!valid || submitting}
          className="w-full bg-secondary text-white hover:bg-secondary/90 font-semibold">
          {submitting ? "One moment…" : <>See my results <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `client/src/pages/Scorecard.tsx`** — the phase machine. Result rendering is Task 4's `ResultView`; for THIS task render a temporary `<pre>{JSON.stringify(result.scores)}</pre>` in the result phase (replaced in Task 4).

```tsx
import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import DoorChooser from "@/components/scorecard/DoorChooser";
import QuestionScreen from "@/components/scorecard/QuestionScreen";
import EmailGate from "@/components/scorecard/EmailGate";
import {
  PROFILE_QUESTIONS, questionOrder, validateAnswers, computeScorecard,
  type Answers, type Door, type ScorecardResult,
} from "@shared/scorecard";
import { getAttribution, trackScorecard, trackDoorSelected } from "@/lib/tracking";

const STORAGE_KEY = "eclectik_scorecard_v1";
type Phase = "door" | "questions" | "email" | "result";
interface Saved { door: Door; answers: Answers; step: number }

function loadSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch { return null; }
}
function save(state: Saved | null) {
  try {
    if (state) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* best-effort */ }
}

export default function Scorecard() {
  const urlDoor = useMemo<Door | null>(() => {
    const d = new URLSearchParams(window.location.search).get("door");
    return d === "value" || d === "change" ? d : null;
  }, []);
  const saved = useMemo(loadSaved, []);

  const [door, setDoor] = useState<Door | null>(saved?.door ?? urlDoor);
  const [answers, setAnswers] = useState<Answers>(saved?.answers ?? {});
  const [step, setStep] = useState(saved?.step ?? 0);      // 0-based over items[]
  const [phase, setPhase] = useState<Phase>(door ? "questions" : "door");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScorecardResult | null>(null);

  // 23 items: 20 scored (volgorde per deur) + P1..P3 als laatste
  const items = useMemo(() => {
    if (!door) return [];
    return [
      ...questionOrder(door).map((q) => ({ id: q.id, text: q.text, options: q.anchors })),
      ...PROFILE_QUESTIONS.map((p) => ({ id: p.id, text: p.text, options: p.options })),
    ];
  }, [door]);

  useEffect(() => {
    if (door && phase === "questions") save({ door, answers, step });
  }, [door, answers, step, phase]);

  useEffect(() => {
    if (door && phase === "questions" && step === 0 && Object.keys(answers).length === 0) {
      trackScorecard("sc_start", { door });
    }
  }, [door, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDoor = (d: Door) => {
    trackDoorSelected(d);
    setDoor(d); setPhase("questions"); setStep(0);
  };

  const answer = (optionIndex: number) => {
    const item = items[step];
    const next = { ...answers, [item.id]: optionIndex };
    setAnswers(next);
    trackScorecard("sc_q_answered", { id: item.id });
    if (step + 1 < items.length) setStep(step + 1);
    else {
      trackScorecard("sc_completed", { door });
      setPhase("email");
    }
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else { setPhase("door"); setDoor(null); }
  };

  const submit = async (email: string, consent: boolean) => {
    if (!door || !validateAnswers(answers)) return;
    setSubmitting(true);
    const computed = computeScorecard(answers);           // instant, client-side
    try {
      await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, door, answers, src: getAttribution() }),
      });
    } catch { /* resultaat toch tonen; opslag is server-side gelogd */ }
    trackScorecard("sc_email_submitted", { route: computed.route });
    setResult(computed);
    setPhase("result");
    setSubmitting(false);
    save(null);
  };

  return (
    <Layout>
      <Helmet>
        <title>AI Transformation Scorecard | Eclectik</title>
        <meta name="description" content="Free 3–4 minute self-assessment: how evidence-led is your AI transformation? Three scores, your readiness profile and the next step that fits." />
      </Helmet>
      <section className="min-h-screen pt-40 pb-24 px-4">
        {phase === "door" && <DoorChooser onSelect={startDoor} />}
        {phase === "questions" && door && items[step] && (
          <QuestionScreen
            step={step + 1} total={items.length}
            text={items[step].text} options={items[step].options}
            selected={answers[items[step].id]}
            onAnswer={answer} onBack={step === 0 && !urlDoor ? back : step > 0 ? back : undefined}
          />
        )}
        {phase === "email" && (
          <EmailGate submitting={submitting} onSubmit={submit} onBack={() => setPhase("questions")} />
        )}
        {phase === "result" && result && (
          <pre className="text-muted-foreground max-w-md mx-auto">{JSON.stringify(result, null, 2)}</pre>
        )}
      </section>
    </Layout>
  );
}
```

- [ ] **Step 5: Verify in browser (preview tools)** — dev server; `/scorecard` shows the chooser; `/scorecard?door=change` starts with C1; answer all 23 (spot-check progress bar, back button, sessionStorage survives a reload mid-flow); email gate blocks invalid email; submit shows the JSON result and POSTs `/api/scorecard` (network tab: payload contains all 23 answers + src). `pnpm check` + `pnpm test` green; `pnpm build` ✓.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/scorecard client/src/pages/Scorecard.tsx
git commit -m "feat: scorecard flow — deuren, 23 vragen, verplichte e-mailgate"
```

---

### Task 4: Result page

**Files:**
- Create: `client/src/components/scorecard/ScoreDial.tsx`
- Create: `client/src/components/scorecard/ResultView.tsx`
- Modify: `client/src/pages/Scorecard.tsx` (replace the `<pre>` with `<ResultView …/>`)

- [ ] **Step 1: `ScoreDial.tsx`** — SVG arc dial (spec: dials, not gauges-with-needles), colour by band using existing tokens:

```tsx
import type { Band } from "@shared/scorecard";

const BAND_CLASS: Record<Band, string> = {
  blind_spot: "text-secondary",      // rood-oranje token
  partial_view: "text-primary",      // lichtblauw token
  evidence_led: "text-accent",       // groenblauw token
};

export default function ScoreDial({ label, score, band }: { label: string; score: number; band: Band }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className={`w-28 h-28 ${BAND_CLASS[band]}`} role="img"
        aria-label={`${label}: ${score} out of 100`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
        <text x="50" y="55" textAnchor="middle" className="fill-white font-heading font-bold" fontSize="24">{score}</text>
      </svg>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: `ResultView.tsx`** — dials → quadrant card (copy VERBATIM from Marco's spec §5) → gap bullets → routed CTA → readiness overlay:

```tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ScoreDial from "./ScoreDial";
import { gapBullets, type Answers, type ScorecardResult } from "@shared/scorecard";
import { trackScorecard } from "@/lib/tracking";

const QUADRANT_COPY: Record<ScorecardResult["quadrant"], { title: string; body: string }> = {
  flying_blind: {
    title: "Flying blind",
    body: "You're investing without evidence and changing without sight. You're not alone: only 12% of CEOs can show what AI delivers. The good news: everything you need to measure already exists in your organisation.",
  },
  spreadsheet_confident: {
    title: "Spreadsheet confident",
    body: "Your numbers look solid — but whether behaviour is actually changing, nobody knows. 57% of employees hide their AI use; usage dashboards won't show you that. Your value story is one blind spot away from stalling.",
  },
  people_aware_value_blind: {
    title: "People-aware, value-blind",
    body: "You understand your organisation — but you can't make the business case stick. When budgets tighten, unproven value gets cut first. Connecting your people data to usage data closes exactly that gap.",
  },
  audit_ready: {
    title: "Audit-ready",
    body: "You're ahead of nearly everyone. The next step isn't more measurement — it's knowing how you compare. That's what the benchmark is for.",
  },
};

const ROUTE_CTA: Record<ScorecardResult["route"], { label: string; href: string; note?: string }> = {
  assessment: {
    label: "Book an assessment scoping call", href: "/contact",
    note: "Often partner-funded — we'll show you how.",
  },
  insight_review: { label: "Start with one upgraded insight review on your existing data", href: "/contact" },
  benchmark: { label: "You belong in the benchmark — join the waiting list", href: "/benchmark#waitlist" },
  workshop: { label: "Book a half-day diagnostic workshop", href: "/contact" },
};

export default function ResultView({ result, answers }: { result: ScorecardResult; answers: Answers }) {
  const cta = ROUTE_CTA[result.route];
  const quad = QUADRANT_COPY[result.quadrant];
  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-primary text-xs tracking-wider uppercase font-semibold text-center mb-3">
        Your evidence readiness profile
      </p>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-white text-center mb-10">
        Evidence Readiness Index: {result.scores.index}
      </h1>
      <div className="flex justify-center gap-8 md:gap-14 mb-12">
        <ScoreDial label="Value" score={result.scores.value} band={result.bands.value} />
        <ScoreDial label="Change" score={result.scores.change} band={result.bands.change} />
        <ScoreDial label="Readiness" score={result.scores.readiness} band={result.bands.readiness} />
      </div>
      <div className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-heading font-semibold text-white mb-3">{quad.title}</h2>
        <p className="text-muted-foreground">{quad.body}</p>
      </div>
      <div className="mb-10">
        <h3 className="text-sm tracking-wider uppercase text-muted-foreground font-semibold mb-4">
          Your biggest gaps
        </h3>
        <ul className="space-y-3">
          {gapBullets(answers).map((g) => (
            <li key={g.id} className="flex gap-3 text-muted-foreground">
              <span className="text-secondary mt-1">•</span><span>{g.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-center">
        <Link href={cta.href} onClick={() => trackScorecard("sc_cta_clicked", { route: result.route })}>
          <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 font-semibold">
            {cta.label} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        {cta.note && <p className="text-sm text-muted-foreground mt-3">{cta.note}</p>}
        {result.readinessOverlay && (
          <p className="text-sm text-muted-foreground mt-6">
            First step is your data foundation — exactly what our data-lab phase does.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-8">Your full report arrives by email within a few days.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire into `Scorecard.tsx`** — replace the `<pre>…</pre>` line with:

```tsx
        {phase === "result" && result && <ResultView result={result} answers={answers} />}
```

plus `import ResultView from "@/components/scorecard/ResultView";`. NOTE: `save(null)` wipes sessionStorage but `answers` state must stay in memory for gapBullets — it already does.

- [ ] **Step 4: Verify in browser** — complete a run with mixed answers: dials render with correct colours (inspect CSS), quadrant copy matches the computed quadrant, 3 gap bullets show, CTA matches the route (test an assessment case via P3='<6 months'), overlay line appears when readiness < 40, benchmark CTA navigates to `/benchmark#waitlist`. Zero console errors. `pnpm check`, `pnpm test`, `pnpm build` green.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/scorecard client/src/pages/Scorecard.tsx
git commit -m "feat: scorecard resultaatpagina — dials, kwadrant, gaps, geroute CTA"
```

---

### Task 5: Entry points + copy fix

**Files:**
- Modify: `client/src/pages/Home.tsx` (hero CTA copy "Take the 10-question scorecard" → "Take the scorecard (3–4 min)"; around line 205–211)
- Modify: `client/src/pages/ProofOfValue.tsx`, `client/src/pages/ProofOfChange.tsx` (placeholder pages: add a CTA button under the existing copy linking to `/scorecard?door=value` resp. `/scorecard?door=change` with label "Take the scorecard (3–4 min)" — follow the PlaceholderPage component's API; if it doesn't support children/CTA, extend `client/src/components/PlaceholderPage.tsx` with an optional `cta?: { label: string; href: string }` prop rendered as a `Button` link)

- [ ] Step 1: Make both edits. Step 2: browser-verify both placeholder pages show the CTA and it lands in the right door; hero copy updated. Step 3: `pnpm check` + `pnpm build` green. Step 4: Commit `git commit -m "feat: scorecard-instap vanaf home en deurpagina's"` (add the touched files).

---

### Task 6: Full verification + live e2e (controller/Olivier — do not delegate the push)

- [ ] Full browser pass on dev: both doors end-to-end, reload-resume mid-flow, mobile viewport (375px), no console errors, all existing routes still render.
- [ ] `pnpm check` && `pnpm test` && `pnpm build` all green.
- [ ] ASK OLIVIER, then push `h2-2026-redesign` → review-site deploy.
- [ ] Live e2e (CRM side must be deployed first — see CRM plan Task 6): complete a scorecard on https://eclectik-website-h2.vercel.app/scorecard?src=li-sc-e2e with a test email → `{ok:true, stored:true}`; `form_responses` row (computed scores match client display); marketing lead activity `scorecard_completed` without raw answers; assessment-route test triggers Marco-notify; cleanup test rows afterwards.

## Self-review notes

- Spec coverage: bank+engine+tests (T1), events §10 + proxy (T2), flow/gate incl. besluit 5 (T3), result §5 incl. overlay + verbatim quadrant copy (T4), entries + "10-question" copy bug (T5), DoD checks (T6). PDF/mails/NL: fase 2, uit scope.
- Type consistency: `Answers`/`Door`/`ScorecardResult`/`computeScorecard`/`gapBullets`/`questionOrder` are defined in T1 and used with identical signatures in T3/T4; payload matches `api/scorecard.ts` zod schema and the CRM contract.
- The `.max(5)` in the zod schema is safe: only range questions have index 5 and per-question range validation happens server-side in the CRM.
