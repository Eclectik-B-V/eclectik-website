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

export const QUESTIONS: Question[] = [
  { id: "V1", block: "V", type: "range", text: "What share of your intended users actually has an AI licence (e.g. Copilot) today?", anchors: ["We don't know", "<10%", "10–25%", "25–50%", "50–75%", ">75%"], scores: [0, 0, 1, 2, 3, 4] },
  { id: "V2", block: "V", type: "range", text: "What share of licensed users is actively using AI in a typical week?", anchors: ["We don't track this", "<10%", "10–25%", "25–50%", "50–75%", ">75%"], scores: [0, 0, 1, 2, 3, 4] },
  { id: "V3", block: "V", type: "maturity", text: "Do you know the depth of use per function — habitual use versus occasional experiments?", anchors: ["No idea", "Anecdotes only", "Rough picture for some groups", "Measured for most groups", "Tracked per persona, monthly"] },
  { id: "V4", block: "V", type: "maturity", text: "Do you measure anything beyond usage — time, quality, business outcomes?", anchors: ["Nothing beyond usage", "Occasional anecdotes/satisfaction", "We estimate time saved", "Outcomes measured per team or use case", "Usage statistically linked to business KPIs"] },
  { id: "V5", block: "V", type: "maturity", text: "Do you know the total cost of your AI stack, including consumption/credits?", anchors: ["No real picture", "Licence cost only", "Licences + rough consumption", "Cost tracked per department", "Full TCO model per use case"] },
  { id: "V6", block: "V", type: "maturity", text: "For the agents you have deployed: do you know what each one costs and contributes?", anchors: ["No sight (or: no agents, no plan)", "We know which agents exist", "Usage per agent", "Cost per agent", "Cost and contribution (ROI) per agent"] },
  { id: "V7", block: "V", type: "maturity", text: "Are AI investment decisions — expand, pause, stop — based on measured evidence?", anchors: ["Gut feel and vendor claims", "Mostly conviction, some data", "Mixed", "Mostly evidence", "Every decision on measured evidence"] },
  { id: "V8", block: "V", type: "maturity", text: "Could you show your board independent evidence today of what AI delivers?", anchors: ["No", "We could tell a story, not show evidence", "Internal numbers, contestable", "Solid internal evidence", "Yes — independently validated"] },
  { id: "C1", block: "C", type: "maturity", text: "Do you know whether your leaders use AI themselves?", anchors: ["No idea", "Impressions only", "We know for some leaders", "Measured across leadership", "Measured — and leaders visibly model it"] },
  { id: "C2", block: "C", type: "maturity", text: "Do you have sight of AI use outside your sanctioned tools (shadow AI)?", anchors: ["Never considered it", "We suspect it exists", "Occasional signals", "Estimated periodically", "Measured and openly discussable"] },
  { id: "C3", block: "C", type: "range", text: "What share of employees has received meaningful AI training?", anchors: ["We don't know", "<10%", "10–25%", "25–50%", "50–75%", ">75%"], scores: [0, 0, 1, 2, 3, 4] },
  { id: "C4", block: "C", type: "maturity", text: "Does your employee listening ask about AI — adoption, trust, anxiety, workload?", anchors: ["Not at all", "One-off questions once", "Some items, some cycles", "Structured AI module every cycle", "Every cycle plus targeted pulses"] },
  { id: "C5", block: "C", type: "maturity", text: "Is your listening data connected to actual usage data?", anchors: ["Separate worlds", "We eyeball both separately", "Manually compared once or twice", "Joined for some analyses", "Systematically joined (aggregate level)"] },
  { id: "C6", block: "C", type: "maturity", text: "Do you know how your middle managers are coping as the translation layer of change?", anchors: ["No view", "Anecdotes", "Occasional check-ins", "Measured in listening", "Measured plus a support programme"] },
  { id: "C7", block: "C", type: "maturity", text: "Do you know which teams still have capacity for the next change — and which are fatigued?", anchors: ["No", "Gut feel", "Rough view of hotspots", "Measured per unit", "Measured per team and steering rollout planning"] },
  { id: "C8", block: "C", type: "maturity", text: "Do employees see action on what they report — and do you measure that?", anchors: ["We don't measure this", "We assume so", "Communicated, not measured", "Action tracking for major themes", "Action rates measured and shared"] },
  { id: "R1", block: "R", type: "maturity", text: "Could you produce persona-level usage data within weeks, privacy-approved?", anchors: ["No idea how", "Theoretically, never done", "With significant effort", "Done before, repeatable", "Yes — established process"] },
  { id: "R2", block: "R", type: "maturity", text: "Is comparable survey/pulse data available across multiple cycles?", anchors: ["Scattered or lost", "Fragments, formats differ", "Mostly available, gaps", "Complete for recent cycles", "Clean multi-year archive"] },
  { id: "R3", block: "R", type: "maturity", text: "Are privacy and works-council arrangements in place for aggregate people-data analysis?", anchors: ["Nothing arranged", "We'd have to start from scratch", "Informal understanding", "Formal process exists", "Approved framework in place"] },
  { id: "R4", block: "R", type: "maturity", text: "Is there an executive sponsor who wants this evidence?", anchors: ["Nobody owns this", "Interest, no owner", "Mid-level owner", "Senior sponsor engaged", "CFO/CIO-level sponsor with mandate"] },
];

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  { id: "P1", text: "Your role", options: ["CFO / Finance", "CIO / IT / Digital", "CHRO / HR", "Transformation / Strategy", "Other"] },
  { id: "P2", text: "Organisation size", options: ["<1,000", "1,000–5,000", "5,000–20,000", ">20,000"] },
  { id: "P3", text: "When is your next licence / EA renewal moment?", options: ["<6 months", "6–12 months", "12–24 months", ">24 months", "Don't know"] },
];

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

export const band = (x: number): Band => (x < 40 ? "blind_spot" : x < 70 ? "partial_view" : "evidence_led");
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
