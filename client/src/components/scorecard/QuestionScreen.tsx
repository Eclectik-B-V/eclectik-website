import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  step: number; total: number;              // 1-based over alle 23 vragen
  text: string; options: string[];
  selected?: number;
  onAnswer: (optionIndex: number) => void;  // auto-advance
  onBack?: () => void;
}

export default function QuestionScreen({ step, total, text, options, selected, onAnswer, onBack }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back"
            className="text-ec-body hover:text-ec-navy transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : <span className="w-5" />}
        <div className="flex-1 h-1.5 rounded-full bg-ec-line overflow-hidden">
          <div className="h-full bg-ec-sky transition-all duration-300" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <span className="text-xs text-ec-body tabular-nums">{step}/{total}</span>
      </div>
      <motion.div key={text} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-ec-navy mb-8">{text}</h2>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label={text}>
          {options.map((label, i) => (
            <Button
              key={i} type="button" variant="outline" role="radio" aria-checked={selected === i}
              onClick={() => onAnswer(i)}
              className={`justify-start text-left h-auto py-4 px-5 whitespace-normal shadow-sm hover:border-ec-sky hover:bg-ec-cream ${
                selected === i
                  ? "border-ec-sky bg-ec-cream text-ec-navy"
                  : "border-ec-line-3 bg-white text-ec-body-strong"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
