import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, Users, Target, Zap, Shield, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function HRTechServices() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-ec-cream py-16 lg:py-24">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-[1px] w-12 bg-ec-sky-ink" />
                <span className="text-ec-sky-ink font-medium tracking-wider uppercase text-sm">HR Tech Customer Success</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-ec-navy">
                Why Strong Customer Success Matters Before You Press{" "}
                <span className="text-ec-sky-ink">Send</span>
              </h1>
              
              <p className="text-xl text-ec-body mb-8 leading-relaxed">
                Technology is only as good as the way people use it. A strong Customer Success approach ensures HR teams not only adopt new processes but thrive with them.
              </p>
              
              <Link href="/contact">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-ec-sky hover:bg-ec-sky/90 text-ec-navy font-bold transition-all hover:scale-105">
                  Book Your 30-Minute Readiness Call <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Hero Image - Positioned right with bottom aligned to button */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute right-[-10%] top-[15%] w-[55%] h-[70%] hidden lg:block"
        >
          <img 
            src="/images/Maincomposite_green1.png" 
            alt="Eclectik HR Tech Services" 
            className="w-full h-full object-contain opacity-60"
          />
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-ec-body-faint flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-ec-body-faint to-transparent" />
        </motion.div>
      </section>

      {/* Why Customer Success Matters */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-ec-navy">
              Survey Season Support
            </h2>
            <p className="text-xl text-center text-ec-body mb-12">
              Structured Customer Success for Confident Employee Engagement Survey Activation
            </p>
            
            <div className="bg-ec-cream border border-ec-line rounded-2xl p-8 md:p-12 mb-12">
              <p className="text-lg mb-6 leading-relaxed text-ec-body-strong">
                Launching your employee engagement survey is a high-visibility moment. It reflects on HR credibility, impacts leadership confidence, and connects technology to organizational outcomes.
              </p>
              <p className="text-lg mb-8 leading-relaxed text-ec-body-strong">
                Survey activation often happens once or twice per year. When it carries executive expectations, hesitation arises not from lack of skill but from responsibility.
              </p>

              <h3 className="text-2xl font-bold mb-6 text-ec-navy">Typical Avoidable Risks Include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Incorrect population selection",
                  "Demographic inconsistencies",
                  "Broken links",
                  "Language mismatches",
                  "Reminder flow issues",
                  "Unaligned stakeholder expectations"
                ].map((risk, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-ec-red flex-shrink-0 mt-1" />
                    <span className="text-ec-body">{risk}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-lg mt-8 leading-relaxed text-ec-body-strong">
                These risks not only create operational strain; they also interrupt adoption and slow momentum toward measurable outcomes.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xl font-semibold mb-6 text-ec-navy">
                Strong Customer Success Management turns activation from a risk into a strategic opportunity.
              </p>
              <p className="text-lg text-ec-body">
                Before you press send, we help you validate, align, and launch your survey with certainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Framework */}
      <section className="py-20 bg-ec-surface">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-ec-navy">
              Our Survey Season Support Framework
            </h2>
            <p className="text-xl text-center text-ec-body mb-16">
              This activation support is part of a broader Customer Success partnership: one that ensures your survey process is dependable now and contributes to long-term listening strategy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1: Validate */}
              <div className="bg-white border border-ec-line rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-ec-sky/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-ec-sky-ink" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-ec-navy">1. Validate</h3>
                <p className="text-sm text-ec-sky-ink font-semibold mb-4">Focus on Adoption and Precision</p>
                <p className="text-ec-body mb-6">
                  We review your employee engagement survey setup together to ensure it is ready for confident activation:
                </p>
                <ul className="space-y-2 text-sm text-ec-body">
                  <li className="flex items-start gap-2">
                    <span className="text-ec-sky-ink mt-1">•</span>
                    <span>Population and segmentation logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-sky-ink mt-1">•</span>
                    <span>Demographic structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-sky-ink mt-1">•</span>
                    <span>Technical configuration and link validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-sky-ink mt-1">•</span>
                    <span>Reminder planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-sky-ink mt-1">•</span>
                    <span>Governance and visibility alignment</span>
                  </li>
                </ul>
                <p className="text-sm text-ec-body mt-6 italic">
                  A structured validation step minimizes preventable risk and accelerates readiness.
                </p>
              </div>

              {/* Step 2: Align */}
              <div className="bg-white border border-ec-line rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-ec-red/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-ec-red" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-ec-navy">2. Align</h3>
                <p className="text-sm text-ec-red font-semibold mb-4">Ensure Strategic and Organizational Readiness</p>
                <p className="text-ec-body mb-6">
                  We confirm:
                </p>
                <ul className="space-y-2 text-sm text-ec-body">
                  <li className="flex items-start gap-2">
                    <span className="text-ec-red mt-1">•</span>
                    <span>Stakeholder clarity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-red mt-1">•</span>
                    <span>Timeline and communication alignment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-red mt-1">•</span>
                    <span>Executive expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-red mt-1">•</span>
                    <span>Escalation and governance pathways</span>
                  </li>
                </ul>
                <p className="text-sm text-ec-body mt-6 italic">
                  This ensures your launch aligns with business goals, maximizing adoption and supporting measurable outcomes.
                </p>
              </div>

              {/* Step 3: Activate */}
              <div className="bg-white border border-ec-line rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-full bg-ec-teal/10 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-ec-teal-ink" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-ec-navy">3. Activate</h3>
                <p className="text-sm text-ec-teal-ink font-semibold mb-4">Confidence and Support in Motion</p>
                <p className="text-ec-body mb-6">
                  When you launch your survey, we remain available to:
                </p>
                <ul className="space-y-2 text-sm text-ec-body">
                  <li className="flex items-start gap-2">
                    <span className="text-ec-teal-ink mt-1">•</span>
                    <span>Monitor response progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-teal-ink mt-1">•</span>
                    <span>Review participation dynamics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-teal-ink mt-1">•</span>
                    <span>Advise on steering actions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ec-teal-ink mt-1">•</span>
                    <span>Support adjustments where needed</span>
                  </li>
                </ul>
                <p className="text-sm text-ec-body mt-6 italic">
                  This creates a feedback loop that supports ongoing optimization and value realization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partnership - Lifecycle Diagram */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-ec-navy">
              Beyond Activation — Long Term Strategic Partnership
            </h2>
            <p className="text-xl text-center text-ec-body mb-16">
              Survey Season Support is one part of a disciplined Customer Success approach to HR Tech.
            </p>
            
            {/* Lifecycle Diagram */}
            <div className="bg-ec-cream border border-ec-line rounded-2xl p-12 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-ec-sky/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-ec-sky-ink" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-ec-navy">Adoption</h3>
                  <p className="text-sm text-ec-body">Increase adoption and proficiency</p>
                </div>
                
                <div className="hidden md:block">
                  <ArrowRight className="w-8 h-8 text-ec-sky-ink" />
                </div>
                <div className="block md:hidden">
                  <ArrowRight className="w-8 h-8 text-ec-sky-ink rotate-90" />
                </div>
                
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-ec-red/20 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-10 h-10 text-ec-red" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-ec-navy">Insight</h3>
                  <p className="text-sm text-ec-body">Transform insights into action</p>
                </div>
                
                <div className="hidden md:block">
                  <ArrowRight className="w-8 h-8 text-ec-red" />
                </div>
                <div className="block md:hidden">
                  <ArrowRight className="w-8 h-8 text-ec-red rotate-90" />
                </div>
                
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-ec-teal/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-10 h-10 text-ec-teal-ink" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-ec-navy">Optimization</h3>
                  <p className="text-sm text-ec-body">Demonstrate measurable value</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-ec-line rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-ec-navy">We help you:</h3>
                <ul className="space-y-2 text-ec-body">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink flex-shrink-0 mt-0.5" />
                    <span>Transform insights into action</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink flex-shrink-0 mt-0.5" />
                    <span>Connect sentiment data to organizational outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink flex-shrink-0 mt-0.5" />
                    <span>Increase adoption and proficiency</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white border border-ec-line rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-ec-navy">Long-term value:</h3>
                <ul className="space-y-2 text-ec-body">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink flex-shrink-0 mt-0.5" />
                    <span>Demonstrate measurable value from technology investments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink flex-shrink-0 mt-0.5" />
                    <span>Build governance and capability for the long term</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <p className="text-xl font-semibold text-center mt-12 text-ec-navy">
              This is how customer success becomes organizational success.
            </p>
          </div>
        </div>
      </section>

      {/* Proof + Social Validation */}
      <section className="py-20 bg-ec-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-ec-navy">
              Trusted by Global HR Teams
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white border border-ec-line rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-ec-sky-ink mb-2">750+</div>
                <p className="text-lg text-ec-body">Engagement survey launches</p>
              </div>
              
              <div className="bg-white border border-ec-line rounded-2xl p-8 text-center">
                <div className="text-5xl font-bold text-ec-red mb-2">17</div>
                <p className="text-lg text-ec-body">Countries</p>
              </div>
            </div>
            
            <div className="bg-white border-l-4 border-ec-sky rounded-xl p-8 shadow-lg">
              <p className="text-xl italic mb-6 leading-relaxed text-ec-body-strong">
                "Their thoughtfulness, responsiveness, and proactive support were critical. We would have been lost without it."
              </p>
              <p className="text-ec-body font-semibold">
                — Communication Director, Fintech Organization
              </p>
            </div>
            
            <p className="text-center text-ec-body mt-8">
              Clients appreciate not just activation certainty, but a partner that helps them drive adoption, insight and ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Audience + Value */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-ec-navy">Who It's For</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-sky-ink flex-shrink-0 mt-1" />
                    <span className="text-ec-body">HR leaders launching employee engagement surveys</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-sky-ink flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Organizations using Microsoft Viva, Glint, or other engagement platforms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-sky-ink flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Teams seeking confidence and strategic support during high-visibility moments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-sky-ink flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Enterprise and multinational organizations</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6 text-ec-navy">Key Benefits</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-red flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Minimize preventable risks and operational strain</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-red flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Launch with confidence and executive credibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-red flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Accelerate adoption and measurable outcomes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-ec-red flex-shrink-0 mt-1" />
                    <span className="text-ec-body">Build long-term capability and governance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-ec-navy">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Start with Confidence — Evolve with Insight
            </h2>
            <p className="text-xl text-ec-on-dark-caption mb-8">
              Customer Success prevents avoidable risk and unlocks the full value of your employee engagement process.
            </p>
            <p className="text-lg mb-8 text-ec-on-dark">
              Book your 30-minute Survey Readiness Call and prepare your launch with clarity and momentum.
            </p>
            <Link href="/contact">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-ec-sky hover:bg-ec-sky/90 text-ec-navy font-bold transition-all hover:scale-105">
                Book Your Readiness Call <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
