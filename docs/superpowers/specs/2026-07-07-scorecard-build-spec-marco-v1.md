# Eclectik AI Transformation Scorecard — Build Specification v1.0

**For:** Olivier — website + BD application logic
**Date:** 7 July 2026 · **Owner of content:** Marco · **Status:** ready to build
**Goal:** free 3–4 min self-assessment on eclectik.co that (1) scores visitors on three dimensions, (2) routes them to the right next step, (3) creates/updates a lead in Eclectik-CRM with full context, (4) grows the mailing list, (5) produces aggregate stats we can publish.

---

## 1. UX flow

```
Entry (2 doors, same test)          Questions                    Result
┌─────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────┐
│ CFO/CIO door         │   │ 20 scored items           │   │ 3 dimension scores  │
│ "prove the value"    │──▶│ order: V-block first      │──▶│ + quadrant profile  │
├─────────────────────┤   ├──────────────────────────┤   │ + 1 routed CTA      │
│ CHRO/transfo door    │   │ same 20 items             │   │ + email gate for    │
│ "prove the change"   │──▶│ order: C-block first      │   │   full PDF report   │
└─────────────────────┘   └──────────────────────────┘   └─────────────────────┘
```

- One page per question (mobile-first), progress bar, back button. No login.
- Profile questions (P1–P3) asked **last**, before the result — plus email (required for full report, optional to see on-screen summary).
- Consent checkbox at email step (see §9).
- Entry door only changes **question order** (V-first vs C-first) and result-page emphasis; scoring identical.
- Answering must feel effortless: radio buttons with the 5 anchor labels written out; "we don't know / don't track this" is always the first option.

## 2. Question bank (machine-readable)

Scale types:
- `maturity`: 5 anchors, scored 0–4, generic pattern: 0 = no sight, 1 = anecdotal, 2 = partial, 3 = structurally measured, 4 = measured **and** steering decisions. Per-question anchor labels below.
- `range`: percentage bands, scored: don't know = 0, <10% = 0, 10–25% = 1, 25–50% = 2, 50–75% = 3, >75% = 4.

```json
{
  "version": "1.0",
  "blocks": {
    "V": "Proof of value",
    "C": "Proof of change",
    "R": "Measurement readiness"
  },
  "questions": [
    {"id":"V1","block":"V","type":"range","text":"What share of your intended users actually has an AI licence (e.g. Copilot) today?","anchors":["We don't know","<10%","10–25%","25–50%","50–75%",">75%"],"scores":[0,0,1,2,3,4]},
    {"id":"V2","block":"V","type":"range","text":"What share of licensed users is actively using AI in a typical week?","anchors":["We don't track this","<10%","10–25%","25–50%","50–75%",">75%"],"scores":[0,0,1,2,3,4]},
    {"id":"V3","block":"V","type":"maturity","text":"Do you know the depth of use per function — habitual use versus occasional experiments?","anchors":["No idea","Anecdotes only","Rough picture for some groups","Measured for most groups","Tracked per persona, monthly"]},
    {"id":"V4","block":"V","type":"maturity","text":"Do you measure anything beyond usage — time, quality, business outcomes?","anchors":["Nothing beyond usage","Occasional anecdotes/satisfaction","We estimate time saved","Outcomes measured per team or use case","Usage statistically linked to business KPIs"]},
    {"id":"V5","block":"V","type":"maturity","text":"Do you know the total cost of your AI stack, including consumption/credits?","anchors":["No real picture","Licence cost only","Licences + rough consumption","Cost tracked per department","Full TCO model per use case"]},
    {"id":"V6","block":"V","type":"maturity","text":"For the agents you have deployed: do you know what each one costs and contributes?","anchors":["No sight (or: no agents, no plan)","We know which agents exist","Usage per agent","Cost per agent","Cost and contribution (ROI) per agent"]},
    {"id":"V7","block":"V","type":"maturity","text":"Are AI investment decisions — expand, pause, stop — based on measured evidence?","anchors":["Gut feel and vendor claims","Mostly conviction, some data","Mixed","Mostly evidence","Every decision on measured evidence"]},
    {"id":"V8","block":"V","type":"maturity","text":"Could you show your board independent evidence today of what AI delivers?","anchors":["No","We could tell a story, not show evidence","Internal numbers, contestable","Solid internal evidence","Yes — independently validated"]},
    {"id":"C1","block":"C","type":"maturity","text":"Do you know whether your leaders use AI themselves?","anchors":["No idea","Impressions only","We know for some leaders","Measured across leadership","Measured — and leaders visibly model it"]},
    {"id":"C2","block":"C","type":"maturity","text":"Do you have sight of AI use outside your sanctioned tools (shadow AI)?","anchors":["Never considered it","We suspect it exists","Occasional signals","Estimated periodically","Measured and openly discussable"]},
    {"id":"C3","block":"C","type":"range","text":"What share of employees has received meaningful AI training?","anchors":["We don't know","<10%","10–25%","25–50%","50–75%",">75%"],"scores":[0,0,1,2,3,4]},
    {"id":"C4","block":"C","type":"maturity","text":"Does your employee listening ask about AI — adoption, trust, anxiety, workload?","anchors":["Not at all","One-off questions once","Some items, some cycles","Structured AI module every cycle","Every cycle plus targeted pulses"]},
    {"id":"C5","block":"C","type":"maturity","text":"Is your listening data connected to actual usage data?","anchors":["Separate worlds","We eyeball both separately","Manually compared once or twice","Joined for some analyses","Systematically joined (aggregate level)"]},
    {"id":"C6","block":"C","type":"maturity","text":"Do you know how your middle managers are coping as the translation layer of change?","anchors":["No view","Anecdotes","Occasional check-ins","Measured in listening","Measured plus a support programme"]},
    {"id":"C7","block":"C","type":"maturity","text":"Do you know which teams still have capacity for the next change — and which are fatigued?","anchors":["No","Gut feel","Rough view of hotspots","Measured per unit","Measured per team and steering rollout planning"]},
    {"id":"C8","block":"C","type":"maturity","text":"Do employees see action on what they report — and do you measure that?","anchors":["We don't measure this","We assume so","Communicated, not measured","Action tracking for major themes","Action rates measured and shared"]},
    {"id":"R1","block":"R","type":"maturity","text":"Could you produce persona-level usage data within weeks, privacy-approved?","anchors":["No idea how","Theoretically, never done","With significant effort","Done before, repeatable","Yes — established process"]},
    {"id":"R2","block":"R","type":"maturity","text":"Is comparable survey/pulse data available across multiple cycles?","anchors":["Scattered or lost","Fragments, formats differ","Mostly available, gaps","Complete for recent cycles","Clean multi-year archive"]},
    {"id":"R3","block":"R","type":"maturity","text":"Are privacy and works-council arrangements in place for aggregate people-data analysis?","anchors":["Nothing arranged","We'd have to start from scratch","Informal understanding","Formal process exists","Approved framework in place"]},
    {"id":"R4","block":"R","type":"maturity","text":"Is there an executive sponsor who wants this evidence?","anchors":["Nobody owns this","Interest, no owner","Mid-level owner","Senior sponsor engaged","CFO/CIO-level sponsor with mandate"]}
  ],
  "profile": [
    {"id":"P1","text":"Your role","options":["CFO / Finance","CIO / IT / Digital","CHRO / HR","Transformation / Strategy","Other"]},
    {"id":"P2","text":"Organisation size","options":["<1,000","1,000–5,000","5,000–20,000",">20,000"]},
    {"id":"P3","text":"When is your next licence / EA renewal moment?","options":["<6 months","6–12 months","12–24 months",">24 months","Don't know"]}
  ]
}
```

## 3. Scoring engine

```
value      = mean(V1..V8)  * 25        // 0–100
change     = mean(C1..C8)  * 25        // 0–100
readiness  = mean(R1..R4)  * 25        // 0–100
index      = 0.4*value + 0.4*change + 0.2*readiness   // Evidence Readiness Index, 0–100

band(x):  x < 40 → "blind_spot" · 40–69 → "partial_view" · ≥ 70 → "evidence_led"

quadrant (threshold 60 on value and change):
  value<60  & change<60  → "flying_blind"
  value≥60  & change<60  → "spreadsheet_confident"
  value<60  & change≥60  → "people_aware_value_blind"
  value≥60  & change≥60  → "audit_ready"
```

Round all displayed scores to integers. Store raw answers + computed scores.

## 4. Routing rules (CTA on result page + follow-up track)

Evaluate top-down; first match wins:

| # | Condition | CTA on result page | Follow-up track |
|---|---|---|---|
| 1 | P3 ∈ {<6, 6–12 months} **or** (V8 ≤ 1 **and** P1 ∈ {CFO, CIO}) | "Book an assessment scoping call" + funding note ("often partner-funded — we'll show you how") | `assessment` |
| 2 | change < 40 **and** P1 = CHRO | "Start with one upgraded insight review on your existing data" | `insight_review` |
| 3 | index ≥ 70 | "You belong in the benchmark — join the waiting list" | `benchmark` |
| 4 | everything else | "Half-day diagnostic workshop (€2–5k)" | `workshop` |

Additional overlay (always, independent of route): if readiness < 40 append one line: *"First step is your data foundation — exactly what our data-lab phase does."*

## 5. Result page content

Structure: three score dials (Value / Change / Readiness, colour by band) → quadrant card → 2–3 personalised gap bullets → routed CTA → email gate for full PDF report.

Quadrant copy (EN):

- **flying_blind** — "You're investing without evidence and changing without sight. You're not alone: only 12% of CEOs can show what AI delivers. The good news: everything you need to measure already exists in your organisation."
- **spreadsheet_confident** — "Your numbers look solid — but whether behaviour is actually changing, nobody knows. 57% of employees hide their AI use; usage dashboards won't show you that. Your value story is one blind spot away from stalling."
- **people_aware_value_blind** — "You understand your organisation — but you can't make the business case stick. When budgets tighten, unproven value gets cut first. Connecting your people data to usage data closes exactly that gap."
- **audit_ready** — "You're ahead of nearly everyone. The next step isn't more measurement — it's knowing how you compare. That's what the benchmark is for."

Gap bullets: pick the 2–3 lowest-scoring items and render their gap lines (write one line per question, e.g. V5 low → "You don't know what your AI stack really costs — consumption pricing makes this urgent."). Full mapping table to be supplied by Marco/Manish with final copy; placeholder = anchor text of score 4 phrased as "what good looks like".

PDF report (post email-gate): scores + quadrant + all 20 gap lines + method note + relevant CTA. Reuse result-page components; server-side render to PDF.

## 6. Data model (Supabase — new project table or Eclectik-CRM schema)

```sql
create table scorecard_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  email text,                     -- null until gate passed
  consent_marketing boolean default false,
  entry_door text,                -- 'value' | 'change'
  role text, org_size text, renewal_window text,   -- P1..P3
  answers jsonb not null,         -- {"V1":3, ...} raw 0–4 (and raw option index for range questions)
  score_value int, score_change int, score_readiness int, score_index int,
  band_value text, band_change text, band_readiness text,
  quadrant text, route text,
  company_domain text,            -- derived from email domain
  utm jsonb                       -- source attribution
);
```

## 7. BD application logic (CRM integration — Eclectik-CRM project `jdzaypckluncdwsoxurs`)

On email submit:

1. **Match**: lookup `contacts` by email; else `companies` by email domain.
2. **Existing contact** → append activity: type `scorecard_completed`, payload = scores + quadrant + route. If the company is on List C (delivery base) notify owner (see 4) — a client filling this in is a bridge-question moment.
3. **No match** → create row in `leads`: `source = 'scorecard'`, `topic = 'AI transformation audit — {quadrant}'`, `status = 'New'`, notes = compact score summary + route. 
4. **Notification**: post to Marco (mail or Teams webhook) when: route = `assessment`, **or** index ≥ 70, **or** existing client completes. Digest the rest weekly.
5. **Mailing list**: if `consent_marketing` → add/tag subscriber `scorecard` + quadrant tag (segmentation: value-voice vs change-voice editions by P1).
6. **Signals**: optionally insert into `signals` so the existing playbook engine can pick scorecard completions up as a trigger.

## 8. Follow-up emails (3 per track, all signed by Marco, plain text)

Timing: T+0 (report delivery + one insight), T+3d (the relevant proof point / case line), T+10d (the ask matching the route). Copy to be supplied by Marco; subject-line placeholders:

- assessment: "Your scorecard report" → "What Farmers taught us about proving AI value" → "Shall we scope it? (funding usually covers it)"
- insight_review: "Your scorecard report" → "What your next survey could tell you about AI" → "One upgraded review — same data, different answers"
- benchmark: "Your scorecard report" → "How the benchmark works (your data stays yours)" → "Reserving your seat"
- workshop: "Your scorecard report" → "The measurement gap in 3 charts" → "A half-day to see your own picture"

## 9. Privacy & compliance

- Email optional to see summary on screen; required only for PDF + follow-ups. Consent checkbox (unticked by default): "Send me the monthly insights letter" — separate from transactional report delivery.
- GDPR: state purpose + retention on the email step; deletion endpoint (manual is fine at this stage).
- Aggregate publication rule: published stats only on n ≥ 30 and never per company. 
- No individual answer data ever leaves the response table; CRM gets scores + quadrant only.

## 10. Analytics & aggregate output

Events: `sc_start` (with door), `sc_q_answered` (id), `sc_completed`, `sc_email_submitted`, `sc_cta_clicked` (route). Funnel targets: ≥60% completion of starts, ≥50% email conversion on completes.

Weekly aggregate view for content/mailing (n, mean scores, % blind_spot per dimension, quadrant distribution, split per role/sector). One SQL view is enough: `scorecard_weekly_stats`.

## 11. Build notes

- Stack: whatever fits the site — a ScoreApp embed gets this live fastest but limits CRM logic; a native build (Next.js page + the Supabase table above + one edge function for scoring/CRM sync) keeps everything in-house and is preferred given §7. Olivier's call.
- Brand: dark blue #19273D base, accent per door (value #5693B1, change #39A99F), pulse #D52F08 only on the CTA. Aptos/system sans. Result dials, not gauges-with-needles.
- Question order per door: value door V1–V8 → C1–C8 → R → P; change door C1–C8 → V1–V8 → R → P.
- Copy in this spec is final-draft EN; Marco reviews before launch. NL version: phase 2.
- Definition of done: complete a test on both doors → row in `scorecard_responses` → lead visible in CRM with correct route → report PDF received → weekly stats view returns data.
```
