import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getAttribution, trackWaitlistJoined } from "@/lib/tracking";

const ROLE_OPTIONS = [
  "CFO / Finance leader",
  "CIO / CTO / IT leader",
  "Transformation / Change leader",
  "HR / People leader",
  "Other",
];

const SECTOR_OPTIONS = [
  "Manufacturing & Industrial",
  "Finance",
  "Telecommunications",
  "Utilities & Energy",
  "Transport",
  "Ecommerce & Retail",
  "Consumer Goods",
  "Life Sciences",
  "Public sector",
  "Professional services",
  "Other",
];

const inputClass =
  "w-full bg-white/5 border border-white/15 rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sector, setSector] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please tick the consent box to join the waiting list");
      return;
    }
    if (!role || !sector) {
      toast.error("Please select your role and sector");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          role,
          sector,
          consent,
          src: getAttribution(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Signup failed");
      }
      trackWaitlistJoined();
      toast.success("You're on the list — check your inbox for confirmation.");
      setName("");
      setEmail("");
      setCompany("");
      setRole("");
      setSector("");
      setConsent(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-4"
    >
      <h4 className="font-heading text-lg font-semibold text-white">Register your interest</h4>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className={inputClass}
        aria-label="Name"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email"
        className={inputClass}
        aria-label="Work email"
      />
      <input
        type="text"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        className={inputClass}
        aria-label="Company"
      />
      <select
        required
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className={inputClass}
        aria-label="Role"
      >
        <option value="" disabled>
          Role
        </option>
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r} className="bg-background text-foreground">
            {r}
          </option>
        ))}
      </select>
      <select
        required
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        className={inputClass}
        aria-label="Sector"
      >
        <option value="" disabled>
          Sector
        </option>
        {SECTOR_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-background text-foreground">
            {s}
          </option>
        ))}
      </select>
      <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <span>I agree to receive benchmark updates from Eclectik. Unsubscribe anytime.</span>
      </label>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
      >
        {submitting ? "Joining…" : "Join the waiting list"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        No spam. Benchmark updates only — unsubscribe anytime.
      </p>
    </form>
  );
}
