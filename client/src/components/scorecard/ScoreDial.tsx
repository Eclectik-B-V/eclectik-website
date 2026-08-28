import type { Band } from "@shared/scorecard";

const BAND_CLASS: Record<Band, string> = {
  blind_spot: "text-ec-red",         // rood-oranje token
  partial_view: "text-ec-sky-ink",   // lichtblauw token, donkere variant voor wit
  evidence_led: "text-ec-teal",      // groenblauw token
};

export default function ScoreDial({ label, score, band }: { label: string; score: number; band: Band }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className={`w-28 h-28 ${BAND_CLASS[band]}`} role="img"
        aria-label={`${label}: ${score} out of 100`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 50 50)" />
        <text x="50" y="55" textAnchor="middle" className="fill-ec-navy font-heading font-bold" fontSize="24">{score}</text>
      </svg>
      <span className="text-sm text-ec-body">{label}</span>
    </div>
  );
}
