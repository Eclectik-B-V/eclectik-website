import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getAttribution,
  trackWaitlistJoined,
  trackWaitlistQualification,
} from "@/lib/tracking";
import { isWorkEmail } from "@shared/work-email";
import {
  WAITLIST_QUESTIONS,
  type WaitlistAnswers,
  type WaitlistQuestion,
} from "@shared/waitlist-qualification";

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

const cardClass = "bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-4";

type Phase = "form" | "questions" | "done";

interface QuestionStepProps {
  question: WaitlistQuestion;
  index: number;
  total: number;
  selected?: string;
  onSelect: (option: string) => void;
  onBack?: () => void;
}

function QuestionStep({ question, index, total, selected, onSelect, onBack }: QuestionStepProps) {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to previous question"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h4 className="font-heading text-lg font-semibold text-white">Nearly there</h4>
        </div>
        <span className="text-sm text-muted-foreground" aria-label={`Question ${index + 1} of ${total}`}>
          {index + 1}/{total}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Five quick questions to secure your place — 30 seconds.
      </p>
      <p className="text-sm font-medium text-foreground">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={selected === option}
            className={`w-full text-left bg-white/5 border rounded-md px-4 py-3 text-sm text-foreground transition-colors hover:border-primary focus:outline-none focus:border-primary ${
              selected === option ? "border-primary" : "border-white/15"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function WaitlistForm() {
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sector, setSector] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<WaitlistAnswers>({});
  const completedRef = useRef(false);

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
    if (!isWorkEmail(email)) {
      toast.error("Please use your work email");
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
      // Signup is secured; the card now moves into the qualification questions.
      // Fields are intentionally not reset — the email is needed for the
      // qualification POST after W5.
      trackWaitlistJoined();
      trackWaitlistQualification("wl_q_started");
      setPhase("questions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // After W5: fire completion tracking and a best-effort qualification POST.
  // The confirmation always appears, even if the POST fails (spec decision 6) —
  // the signup itself already happened in the form phase.
  const completeQualification = (finalAnswers: WaitlistAnswers) => {
    if (completedRef.current) return;
    completedRef.current = true;
    trackWaitlistQualification("wl_q_completed");
    fetch("/api/waitlist-qualification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, answers: finalAnswers, src: getAttribution() }),
    })
      .then((res) => {
        if (!res.ok) console.error("Waitlist qualification POST failed:", res.status);
      })
      .catch((err) => {
        console.error("Waitlist qualification POST failed:", err);
      });
    toast.success("You're on the list — check your inbox for confirmation.");
    setPhase("done");
  };

  const handleAnswer = (id: string, option: string) => {
    const next = { ...answers, [id]: option };
    setAnswers(next);
    trackWaitlistQualification("wl_q_answered", { id });
    if (questionIndex < WAITLIST_QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      completeQualification(next);
    }
  };

  if (phase === "questions") {
    const question = WAITLIST_QUESTIONS[questionIndex];
    return (
      <QuestionStep
        question={question}
        index={questionIndex}
        total={WAITLIST_QUESTIONS.length}
        selected={answers[question.id]}
        onSelect={(option) => handleAnswer(question.id, option)}
        onBack={questionIndex > 0 ? () => setQuestionIndex(questionIndex - 1) : undefined}
      />
    );
  }

  if (phase === "done") {
    return (
      <div className={cardClass}>
        <h4 className="font-heading text-lg font-semibold text-white">
          You're on the list — check your inbox for confirmation.
        </h4>
        <p className="text-xs text-muted-foreground">
          No spam. Benchmark updates only — unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
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
