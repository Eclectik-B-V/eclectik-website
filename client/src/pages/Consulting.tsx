import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, BarChart3, Users, Zap, Target, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function Consulting() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const whatIfs = [
    {
      question: "What if we could see the ROI of AI before we scale?",
      answer: "We can: model value with real collaboration telemetry and Copilot usage to predict ROI/TCO and guide rollout.",
      icon: <LineChart className="w-6 h-6 text-ec-sky-ink" />
    },
    {
      question: "What if we knew which roles unlock disproportionate AI value?",
      answer: "We can: cluster signals (meeting load, authoring, cross-team work) to find 'value pockets' and prioritize investments.",
      icon: <Target className="w-6 h-6 text-ec-red" />
    },
    {
      question: "What if we pinpointed productivity bottlenecks undermining transformation?",
      answer: "We can: surface friction (after-hours spikes, long meetings, handoff delays) and design targeted fixes.",
      icon: <Zap className="w-6 h-6 text-ec-teal" />
    },
    {
      question: "What if we could forecast adoption trajectory for the next wave?",
      answer: "We can: use leading indicators (trial usage, feature breadth, prompt diversity) to predict curves and focus enablement.",
      icon: <BarChart3 className="w-6 h-6 text-ec-navy" />
    },
    {
      question: "What if we could connect sentiment to measurable business outcomes?",
      answer: "We can: link engagement drivers to observable behavior changes (cycle-time, rework, focus time).",
      icon: <Users className="w-6 h-6 text-ec-sky-ink" />
    }
  ];

  const engagements = [
    "Discovery & Diagnostics: baseline of behaviors, sentiment, and outcomes",
    "Value Pockets Mapping: cohort analysis for outsized returns",
    "AI ROI & TCO Modelling: executive-ready investment case",
    "Change Architecture & Pacing: interventions that protect focus and reduce drag",
    "Executive Storytelling: clear narrative linking signals → actions → outcomes"
  ];

  return (
    <Layout>
      <Helmet>
        <title>Consulting | Eclectik</title>
        <meta name="description" content="Operationalize Workplace Signals to answer 'what if?' with 'we can'. Our consulting services include AI ROI modelling, value pockets mapping, and change architecture." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-white py-16 lg:py-24">
        {/* Top Right Image */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-0 right-0 z-0 hidden lg:block opacity-100 h-full w-1/2"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-white z-10"></div>
          <img 
            src="/images/consulting-hero-composite.png" 
            alt="Consulting Visual" 
            className="w-full h-full object-cover object-left"
          />
        </motion.div>

        <div className="container relative z-10">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-4xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-[1px] w-12 bg-ec-sky-ink" />
              <span className="text-ec-sky-ink font-medium tracking-wider uppercase text-sm">Consulting</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-ec-navy">
              Operationalizing <br />
              <span className="text-ec-sky-ink">Workplace Signals</span>
            </h1>

            <p className="text-xl md:text-2xl text-ec-body max-w-2xl mb-10 leading-relaxed">
              We combine objective telemetry with subjective signals to build actionable roadmaps that deliver measurable impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-ec-surface">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: What Ifs */}
            <div className="space-y-12">
              <h2 className="text-3xl font-bold mb-8 text-ec-navy">The Questions We Answer</h2>
              <div className="space-y-8">
                {whatIfs.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="flex gap-4 mb-3">
                      <div className="mt-1 p-2 rounded-lg bg-white border border-ec-line group-hover:border-ec-sky transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-ec-navy group-hover:text-ec-sky-ink transition-colors">
                          {item.question}
                        </h3>
                        <div className="flex items-start gap-2 text-ec-body">
                          <ArrowRight className="w-5 h-5 mt-1 text-ec-sky-ink shrink-0" />
                          <p className="leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Services */}
            <div className="lg:pl-12 lg:border-l border-ec-line">
              <div className="sticky top-28">
                <h2 className="text-3xl font-bold mb-6 text-ec-navy">What We Do</h2>
                <p className="text-lg text-ec-body mb-8 leading-relaxed">
                  Eclectik's consulting practice operationalizes Workplace Signals end-to-end. We combine objective telemetry (e.g., Viva Insights/Copilot dashboards) with subjective signals (e.g., Viva Glint drivers, narrative themes) to build actionable roadmaps that deliver measurable impact.
                </p>

                <div className="bg-white rounded-2xl p-8 border border-ec-line mb-10">
                  <h3 className="text-xl font-bold mb-6 text-ec-navy">Typical Engagements</h3>
                  <ul className="space-y-4">
                    {engagements.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-ec-body">
                        <div className="w-1.5 h-1.5 rounded-full bg-ec-sky-ink mt-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contact">
                  <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 rounded-full bg-ec-sky hover:bg-ec-sky/90 text-ec-navy font-bold transition-all hover:scale-105">
                    Talk to us about your AI ROI roadmap <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
