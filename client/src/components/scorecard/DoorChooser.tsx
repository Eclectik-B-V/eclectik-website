import { motion } from "framer-motion";
import type { Door } from "@shared/scorecard";

const DOORS: { door: Door; eyebrow: string; title: string; body: string; accent: string }[] = [
  {
    door: "value", accent: "text-ec-sky-ink",
    eyebrow: "Proof of value · CFO & CIO",
    title: "Prove the value",
    body: "Start from the numbers: licences, usage, cost and evidence for the board.",
  },
  {
    door: "change", accent: "text-ec-teal-ink",
    eyebrow: "Proof of change · Transformation leaders",
    title: "Prove the change",
    body: "Start from your people: leadership, training, listening and change capacity.",
  },
];

export default function DoorChooser({ onSelect }: { onSelect: (door: Door) => void }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-3xl md:text-5xl font-heading font-bold text-ec-navy mb-4">
        Is your AI transformation actually working?
      </h1>
      <p className="text-ec-body mb-10">
        A free 3–4 minute self-assessment. 23 questions, an instant readiness profile,
        and the one next step that fits your situation.
      </p>
      <div className="grid md:grid-cols-2 gap-6 text-left">
        {DOORS.map((d, i) => (
          <motion.button
            key={d.door} type="button" onClick={() => onSelect(d.door)}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white border border-ec-line-3 rounded-2xl p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-ec-sky hover:shadow-[0_4px_14px_rgba(18,21,28,.12)] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
          >
            <span className={`${d.accent} text-xs tracking-[0.12em] uppercase font-bold block mb-3`}>{d.eyebrow}</span>
            <span className="text-xl font-heading font-semibold text-ec-navy block mb-2">{d.title}</span>
            <span className="text-sm text-ec-body">{d.body}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
