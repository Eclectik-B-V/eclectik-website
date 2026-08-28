import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Package, BarChart, Shield, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function Solutions() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const whatIfs = [
    {
      question: "What if we could stand up enterprise sentiment on day one?",
      answer: "We can with Viva Glint Engage Fast-Track (licensing + program design + manager enablement + action tracking).",
      icon: <Zap className="w-6 h-6 text-ec-sky-ink" />
    },
    {
      question: "What if AI impact measurement was out-of-the-box?",
      answer: "We can with the Copilot Impact Kit (dashboards, baseline, ROI calculator, rollout playbook).",
      icon: <BarChart className="w-6 h-6 text-ec-red" />
    },
    {
      question: "What if we had an always-on culture radar during transformation?",
      answer: "We can with Culture & Change Signals (Glint lifecycle programs + Smart Alerts + exec reporting).",
      icon: <Activity className="w-6 h-6 text-ec-teal" />
    },
    {
      question: "What if managers could act without HR hand-holding?",
      answer: "We can with the Manager Empowerment Pack (concierge workflows, action libraries, guided conversations).",
      icon: <Package className="w-6 h-6 text-ec-navy" />
    },
    {
      question: "What if we could monitor attrition risk while scaling AI?",
      answer: "We can with Risk Watch (Attrition Risk Index configuration + routing + intervention telemetry).",
      icon: <Shield className="w-6 h-6 text-ec-sky-ink" />
    },
    {
      question: "What if we needed multilingual survey coverage fast?",
      answer: "We can with Global Engage (pre-translated questionnaires and global delivery).",
      icon: <Globe className="w-6 h-6 text-ec-red" />
    }
  ];

  const offers = [
    "Glint Engage Fast-Track",
    "Copilot Impact Kit",
    "Culture & Change Signals",
    "Manager Empowerment Pack",
    "Risk Watch",
    "Global Engage"
  ];

  // Helper component for icon
  function Activity({ className }: { className?: string }) {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Solutions | Eclectik</title>
        <meta name="description" content="Accelerate your transformation with ARR-ready licenses and packaged solutions. Glint Engage Fast-Track, Copilot Impact Kit, and AI Readiness Audit." />
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
            src="/images/Maincomposite_red.png" 
            alt="Solutions Visual" 
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
              <div className="h-[1px] w-12 bg-ec-red" />
              <span className="text-ec-red font-medium tracking-wider uppercase text-sm">Products & Solutions</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-ec-navy">
              Licenses & <br />
              <span className="text-ec-red">Packaged Offerings</span>
            </h1>

            <p className="text-xl md:text-2xl text-ec-body max-w-2xl mb-10 leading-relaxed">
              Eclectik bundles Microsoft Viva and Copilot licenses with onboarding, analytics accelerators, and service-level commitments.
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
                      <div className="mt-1 p-2 rounded-lg bg-white border border-ec-line group-hover:border-ec-red/50 transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-ec-navy group-hover:text-ec-red transition-colors">
                          {item.question}
                        </h3>
                        <div className="flex items-start gap-2 text-ec-body">
                          <ArrowRight className="w-5 h-5 mt-1 text-ec-red shrink-0" />
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
                  Each product comes with templates, dashboards, and playbooks so you get value on day one—and keep compounding it. We offer ARR-ready bundles that combine licensing, onboarding, and analytics accelerators.
                </p>

                <div className="bg-white rounded-2xl p-8 border border-ec-line mb-10">
                  <h3 className="text-xl font-bold mb-6 text-ec-navy">Our Offerings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-ec-surface border border-ec-line hover:border-ec-red/30 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-ec-red shrink-0" />
                        <span className="text-sm font-medium text-ec-body-strong">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href="/contact">
                  <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 rounded-full bg-ec-red hover:bg-ec-red-hover text-white font-bold transition-all hover:scale-105">
                    Want to learn more about licensing & our offerings? <ArrowRight className="ml-2 w-5 h-5" />
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
