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
