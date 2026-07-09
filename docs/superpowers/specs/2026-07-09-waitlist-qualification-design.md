# Benchmark-waitlist kwalificatievragen — design spec

**Datum:** 2026-07-09
**Status:** goedgekeurd door Olivier (vragenset herzien o.b.v. Priestley-analyse; "ga verder" 9 juli)
**Bron/rationale:** Diary of a CEO-aflevering met Daniel Priestley (analyse:
`~/Desktop/Eclectik/Priestley-analyse-benchmark-waitlist.md`). Kern: vijf
kwalificatievragen direct gekoppeld aan de waitlist-inschrijving verhogen
engagement (consistency/frictie-effect) en leveren lead-intelligence. De
vragenset volgt Priestley's archetypen: doel/why-now, alternatief, angst,
timing (eigen BANT-toevoeging) en succesdefinitie.

## Besluiten

1. **Placement: direct ná de bestaande inschrijving, in dezelfde kaart.**
   Priestley's zuivere vorm ("answer 5 questions to get on the waiting list")
   zou de lead pas ná vraag 5 aanmaken; commercieel onacceptabel om
   inschrijvingen te verliezen aan afhakers. Compromis: de bestaande POST naar
   `/api/waitlist` blijft het inschrijfmoment (lead veilig), daarna gaat de
   kaart naadloos over in de vijf vragen met gate-framing in de copy
   ("Nearly there — five quick questions to secure your place"). Afhakers
   blijven ingeschreven; hun kwalificatie ontbreekt gewoon.
2. **Eén vraag per view, in de kaart** — geen page-navigatie; een lichte
   inline stepper in `WaitlistForm` (de scorecard-`QuestionScreen` is voor
   full-page flows en wordt niet hergebruikt).
3. **Antwoorden als leesbare labels** (geen indexen zoals de scorecard): er is
   geen scoring, en labels zijn direct bruikbaar in CRM/notificatiemail.
   Vragenbank versieloos veld `BANK_VERSION` voor latere wijzigingen.
4. **Opslag fase 1: CRM-signal + Resend-fallbackmail** — zelfde idioom als
   `api/waitlist.ts`: best-effort POST naar `${CRM_BASE_URL}/api/website-signal`
   (event `waitlist_qualification`, payload = e-mail + antwoorden + src) én een
   interne notificatiemail als betrouwbaar record. CRM-opslag in
   `form_responses` (`form_type: 'waitlist_qualification'`) is fase 2
   (eclektik-crm-repo, niet in deze sessie beschikbaar).
5. **Werkmail ook op de waitlist afdwingen** — het veld heet al "Work email";
   consistent met het scorecard-besluit worden gratis providers nu ook hier
   geweigerd via de bestaande `shared/work-email.ts` (client- én server-side).
6. **Afronding faalt nooit zichtbaar**: kan de kwalificatie-POST niet slagen,
   dan toont de kaart tóch de bevestiging (inschrijving is immers al binnen);
   fout wordt server-side gelogd.

## De vijf vragen (bank v1.0, `shared/waitlist-qualification.ts`)

| id | Vraag (EN, sitecopy) | Opties |
|----|----------------------|--------|
| W1 | What's prompting you to look at benchmarking now? | Board or exec pressure to show what AI delivers · An upcoming licence or EA renewal · We're mid-rollout and can't see what's working · Curious how we compare with peers |
| W2 | How do you currently answer whether your AI transformation is working? | Vendor dashboards and usage reports · External review or audit · Internal analytics and surveys · Honestly, we can't yet |
| W3 | What worries you most about your AI investment right now? | We can't show return on investment · Adoption is stalling · Change fatigue in the workforce · Costs rising faster than value |
| W4 | When is your next licence or EA renewal moment? | <6 months · 6–12 months · 12–24 months · >24 months · Don't know |
| W5 | What would make the benchmark most valuable to you? | Seeing how we compare with sector peers · Independent evidence for the board · A stronger position in vendor negotiations · Finding out where we're falling behind |

W4 is identiek aan scorecard-vraag P3 → in het CRM op e-mail te matchen.
Archetype-dekking: W1 doel/trigger, W2 alternatief, W3 angst, W4 timing, W5
succesdefinitie. Copyregels: Brits-Engels, geen "leverage/unlock/seamless".

## Flow (client, `WaitlistForm.tsx`)

```
fase "form"      → bestaand formulier; werkmail-check (isWorkEmail) vóór submit;
                   POST /api/waitlist (ongewijzigd) → trackWaitlistJoined()
fase "questions" → kaartinhoud wisselt: "Nearly there" + W1..W5, één per view,
                   voortgang (1/5), terugknop, klik = antwoord + volgende
fase "done"      → na W5: POST /api/waitlist-qualification (best effort)
                   → bevestiging ("You're on the list — check your inbox…")
```

- Geen sessionStorage-persistentie: de flow is kort (5 klikken) en de
  inschrijving zelf is al veilig; herladen tijdens de vragen = kwalificatie
  kwijt, inschrijving niet. Bewuste vereenvoudiging.
- Tracking (bestaand `trackEvent`-patroon): `wl_q_started`,
  `wl_q_answered` (id), `wl_q_completed`. `waitlist_joined` blijft bij de
  formulier-submit.

## API: `api/waitlist-qualification.ts`

- zod: `email` (trim, email, max 200, `.refine(isWorkEmail)` — relatieve
  import), `answers` = record van bekende W-ids → waarde die exact één van de
  opties van die vraag is (validatie tegen de bank uit `shared/`), alle vijf
  verplicht; `src` optioneel (max 100).
- Acties: (1) best-effort CRM-signal `event: "waitlist_qualification"` met
  e-mail + antwoorden + src; (2) interne Resend-mail (zelfde env vars en
  escapeHtml-idioom als `api/waitlist.ts`) met de vijf antwoorden als record.
  Resend-fout → loggen, tóch `{ok:true}` (bevestiging mag nooit blokkeren;
  afwijking t.o.v. waitlist.ts waar de interne mail wél blokkeert — dáár is
  de mail het inschrijfbewijs, hier is de inschrijving al gedaan).
- 405 bij niet-POST, 400 bij ongeldige body — client toont bij 4xx/5xx gewoon
  de bevestiging (besluit 6).

## Definition of done

- `pnpm test`: bankvalidatie-tests groen (alle ids/opties, afwijzing van
  onbekende ids, ontbrekende antwoorden, optie-strings die niet in de bank
  staan; werkmail-refine).
- Browser: inschrijven met gratis provider → geweigerd; met werkmail →
  vragenflow verschijnt; vijf antwoorden → bevestiging + POST met alle vijf
  labels zichtbaar in de payload; afbreken na inschrijving → lead bestaat
  (waitlist-POST is al gedaan).
- `pnpm check` + `pnpm build` groen; bestaande waitlist-gedrag (CRM-signal,
  notificatie- en bevestigingsmail) ongewijzigd.

## Fase 2 (niet nu)

CRM-opslag in `form_responses` + koppeling aan de marketing lead;
kwalificatie-antwoorden tonen in de CRM-UI; follow-upsegmentatie per
antwoord (bijv. W4 <12 maanden → prioriteitsnotificatie zoals de
scorecard-assessmentroute); publieke waitlist-teller (Priestley's
oversubscription-mechaniek) zodra de aantallen dat rechtvaardigen.
