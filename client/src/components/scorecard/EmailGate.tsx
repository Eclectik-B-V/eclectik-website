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
