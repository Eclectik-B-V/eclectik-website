import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ScoreDial from "./ScoreDial";
import { band, gapBullets, type Answers, type ScorecardResult } from "@shared/scorecard";
import { isWorkEmail } from "@shared/work-email";
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

interface Props {
  result: ScorecardResult;
  answers: Answers;
  unlocked: boolean;      // true zodra een geldige werkmail is ingestuurd
  submitting: boolean;
  onUnlock: (email: string, consent: boolean) => Promise<boolean>; // false = server wees het adres af
}

function EmailUnlockCard({ submitting, onUnlock }: Pick<Props, "submitting" | "onUnlock">) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [rejected, setRejected] = useState(false); // server (4xx) wees het adres af
  const valid = isWorkEmail(email);
  const showError = (touched && !valid) || rejected;
  return (
    <div className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-md mx-auto">
      <h2 className="text-xl font-heading font-semibold text-white mb-3">
        Fill out your work email for the full report
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Your full results — three dimension scores, your biggest gaps and the next
        step that fits — appear straight away on this page. We use your email to
        deliver your report and keep it no longer than needed for that purpose.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (!valid || submitting) return;
          const ok = await onUnlock(email.trim(), consent);
          if (!ok) setRejected(true);
        }}
        className="space-y-4" noValidate>
        <input
          type="email" required value={email}
          onChange={(e) => { setEmail(e.target.value); setRejected(false); }}
          placeholder="Work email" aria-invalid={showError}
          aria-describedby={showError ? "work-email-error" : undefined}
          className="w-full bg-background border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        {showError && (
          <p id="work-email-error" className="text-sm text-secondary" role="alert">Please use your work email.</p>
        )}
        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>Send me the monthly insights letter. Unsubscribe anytime.</span>
        </label>
        <Button type="submit" disabled={submitting}
          className="w-full bg-secondary text-white hover:bg-secondary/90 font-semibold">
          {submitting ? "One moment…" : <>Get my full report <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </form>
    </div>
  );
}

export default function ResultView({ result, answers, unlocked, submitting, onUnlock }: Props) {
  const cta = ROUTE_CTA[result.route];
  const quad = QUADRANT_COPY[result.quadrant];
  return (
    <div className="max-w-3xl mx-auto">
      {/* Teaser — altijd zichtbaar, geen e-mail nodig */}
      <p className="text-primary text-xs tracking-wider uppercase font-semibold text-center mb-3">
        Your evidence readiness profile
      </p>
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-white text-center mb-10">
        Evidence Readiness Index: {result.scores.index}
      </h1>
      <div className="flex justify-center mb-12">
        <ScoreDial label="Evidence Readiness Index" score={result.scores.index} band={band(result.scores.index)} />
      </div>
      <div className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10">
        <h2 className="text-xl font-heading font-semibold text-white mb-3">{quad.title}</h2>
        <p className="text-muted-foreground">{quad.body}</p>
      </div>

      {!unlocked ? (
        <EmailUnlockCard submitting={submitting} onUnlock={onUnlock} />
      ) : (
        <>
          <div className="flex justify-center gap-8 md:gap-14 mb-12">
            <ScoreDial label="Value" score={result.scores.value} band={result.bands.value} />
            <ScoreDial label="Change" score={result.scores.change} band={result.bands.change} />
            <ScoreDial label="Readiness" score={result.scores.readiness} band={result.bands.readiness} />
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
        </>
      )}
    </div>
  );
}
