# Waitlist-kwalificatievragen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Direct na de benchmark-waitlist-inschrijving beantwoordt de inschrijver vijf kwalificatievragen in dezelfde kaart (één per view); antwoorden gaan als CRM-signal + interne notificatiemail naar Eclectik. Werkmail wordt voortaan ook op de waitlist afgedwongen.

**Spec:** `docs/superpowers/specs/2026-07-09-waitlist-qualification-design.md` (vragen, flow, besluiten 1–6). Vragenteksten dáár zijn leidend, verbatim overnemen.

**Repo:** `/Users/olivierarnolds/Desktop/eclectik-website-H22026` (worktree, branch `h2-2026-redesign`). Commit per task, NEVER push. Copyregels: Brits-Engels, geen "leverage/unlock/seamless" in zichtbare copy. `git add` alleen de eigen bestanden (geen `-A`).

**Bestaande bouwstenen:** `shared/work-email.ts` (isWorkEmail, met tests), `api/waitlist.ts` (zod + CRM-signal + Resend-idioom, incl. `escapeHtml`), `client/src/components/WaitlistForm.tsx` (het formulier), `client/src/lib/tracking.ts` (`trackEvent`, `trackWaitlistJoined`, `getAttribution`).

---

### Task 1: Vragenbank + validatie in `shared/` (TDD)

**Files:**
- Create: `shared/waitlist-qualification.ts`
- Test: `shared/waitlist-qualification.test.ts`

- [ ] **Step 1: failing tests eerst** (`pnpm test` → FAIL), dan implementeren, dan PASS. API van de module:

```ts
export const BANK_VERSION = "1.0";
export interface WaitlistQuestion { id: "W1"|"W2"|"W3"|"W4"|"W5"; text: string; options: string[] }
export const WAITLIST_QUESTIONS: WaitlistQuestion[]; // exact de spec-tabel, verbatim
export type WaitlistAnswers = Record<string, string>;
export function validateWaitlistAnswers(a: unknown): a is WaitlistAnswers;
// true ⇔ object met exact de vijf W-ids en per id een waarde die letterlijk
// (case-sensitief) één van de options van die vraag is; geen extra keys.
```

Testgevallen: geldig compleet antwoordenobject → true; ontbrekende W3 → false; extra key "W6" → false; optie-string die niet in de bank staat ("gmail") → false; juiste optie bij verkeerde vraag → false; niet-object (null, string, array) → false; W4-opties identiek aan scorecard-P3-opties (regressietest tegen de bank in `shared/scorecard.ts`, importeer PROFILE_QUESTIONS en vergelijk).

- [ ] **Step 2:** `pnpm check` + `pnpm test` groen. Commit: `feat: waitlist-kwalificatie vragenbank v1.0 (TDD)`

---

### Task 2: API-endpoint `api/waitlist-qualification.ts`

**Files:**
- Create: `api/waitlist-qualification.ts`

- [ ] **Step 1:** Zelfde structuur als `api/waitlist.ts` (405 bij niet-POST; zod-safeParse → 400 "Invalid form data"). Schema:

```ts
import { isWorkEmail } from "../shared/work-email";           // relatief — @shared werkt niet in Vercel fns
import { validateWaitlistAnswers, WAITLIST_QUESTIONS, BANK_VERSION } from "../shared/waitlist-qualification";

const BodySchema = z.object({
  email: z.string().trim().email().max(200).refine(isWorkEmail, "work email required"),
  answers: z.record(z.string(), z.string().max(200)).refine(validateWaitlistAnswers, "invalid answers"),
  src: z.string().trim().max(100).optional(),
});
```

- [ ] **Step 2:** Acties na validatie, in deze volgorde:
  1. Best-effort CRM-signal (kopieer het `sendCrmSignal`-idioom uit `api/waitlist.ts`): POST `${CRM_BASE_URL}/api/website-signal` met `{ source:"website", event:"waitlist_qualification", email, bank_version: BANK_VERSION, answers, src }`. Env vars ontbreken of call faalt → log, ga door.
  2. Interne Resend-notificatiemail (zelfde env vars `RESEND_API_KEY`/`CONTACT_FROM_EMAIL`/`CONTACT_TO_EMAIL`, zelfde `escapeHtml`-aanpak — kopieer de helper): subject `Waitlist qualification: ${email}`, body = de vijf vragen (tekst uit de bank) + gegeven antwoorden. **Afwijking van waitlist.ts (spec besluit 4/6):** Resend-fout of ontbrekende env vars → alleen `console.error`, géén 500.
  3. Altijd `res.status(200).json({ ok: true })` na geldige body.

- [ ] **Step 3:** `pnpm check` + `pnpm test` + `pnpm build` groen. Commit: `feat: waitlist-kwalificatie endpoint — CRM-signal + notificatiemail`

---

### Task 3: WaitlistForm — drie fasen + werkmail-check + tracking

**Files:**
- Modify: `client/src/components/WaitlistForm.tsx`
- Modify: `client/src/lib/tracking.ts` (alleen toevoegen)

- [ ] **Step 1: tracking-helper** — voeg toe aan `tracking.ts` (bestaand patroon volgen):

```ts
export function trackWaitlistQualification(event: "wl_q_started" | "wl_q_answered" | "wl_q_completed", params?: Record<string, any>) {
  trackEvent(event, params);
}
```

- [ ] **Step 2: fasemachine in `WaitlistForm.tsx`** — `type Phase = "form" | "questions" | "done"`:
  - **form:** bestaand formulier. Extra vóór submit: `isWorkEmail(email)`-check (import via `@shared/work-email`); faalt → `toast.error("Please use your work email")`, geen POST. Bij succesvolle POST naar `/api/waitlist` (ongewijzigd): `trackWaitlistJoined()`, velden NIET meer resetten (e-mail is nodig voor de kwalificatie-POST), `trackWaitlistQualification("wl_q_started")`, naar fase "questions". De bestaande success-toast verplaatst naar fase "done".
  - **questions:** kaart (zelfde container-styling) toont: kop "Nearly there", regel "Five quick questions to secure your place — 30 seconds.", voortgang "1/5", de vraagtekst en de opties als volle-breedte knoppen (zelfde stijl als `inputClass`-look maar als button; hover met `border-primary`). Klik = antwoord vastleggen (`{[id]: optionLabel}`), `trackWaitlistQualification("wl_q_answered", { id })`, volgende vraag. Terugknop (pijl) vanaf vraag 2 om het vorige antwoord te wijzigen. Vragen en opties uit `@shared/waitlist-qualification` — geen copy in de component.
  - **done:** na W5: `trackWaitlistQualification("wl_q_completed")` en best-effort `fetch("/api/waitlist-qualification", …)` met `{ email, answers, src: getAttribution() }` — response wordt genegeerd behalve voor logging (spec besluit 6: bevestiging verschijnt altijd). Kaartinhoud: "You're on the list — check your inbox for confirmation." + de bestaande no-spam-regel. Toon toast success zoals voorheen.
- [ ] **Step 3:** géén sessionStorage; wie de pagina tijdens de vragen verlaat is gewoon ingeschreven (de waitlist-POST is al gebeurd).
- [ ] **Step 4:** `pnpm check` + `pnpm test` + `pnpm build` groen. Commit: `feat: waitlist — vijf kwalificatievragen na inschrijving + werkmail-check`

---

### Task 4: Browserverificatie (controller)

- [ ] Dev-server: `/benchmark#waitlist` → formulier zichtbaar. Gratis provider (test@gmail.com) → toast "Please use your work email", geen POST naar `/api/waitlist`.
- [ ] Werkmail → POST `/api/waitlist` (in dev 404 — toast met foutafhandeling is bestaand gedrag; voor de flowtest fetch stubben) → vragenfase verschijnt, 1/5.
- [ ] Vijf vragen beantwoorden (terugknop testen op vraag 3) → POST `/api/waitlist-qualification` met e-mail + vijf labels in de payload → bevestiging in de kaart.
- [ ] Console schoon; `pnpm check` + `pnpm test` + `pnpm build` groen.

## Self-review notes

- Task 1 borgt dat de API nooit vrije tekst doorlaat (labels moeten letterlijk in de bank staan) — belangrijk omdat de mail HTML rendert (escapeHtml blijft evengoed staan, defense in depth).
- De waitlist-POST en de kwalificatie-POST delen bewust géén transactie: inschrijving mag nooit afhangen van de vragen (spec besluit 1).
- W4 ≡ scorecard-P3 wordt met een test afgedwongen, zodat CRM-matching op renewal-window betrouwbaar blijft.
