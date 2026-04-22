import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, MessageSquare, Users, Bell, FileText, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export default function Training() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const whatIfs = [
    {
      question: "What if every manager could run a high-quality results conversation?",
      answer: "We can: teach Manager Concierge workflows and Team Conversations that turn scores into actions.",
      icon: <MessageSquare className="w-6 h-6 text-primary" />
    },
    {
      question: "What if leaders could read thousands of comments like an analyst?",
      answer: "We can: train Narrative Intelligence & Copilot-assisted summarization to distill themes and prescriptions.",
      icon: <FileText className="w-6 h-6 text-secondary" />
    },
    {
      question: "What if HR could operationalize smart alerts at scale?",
      answer: "We can: build triage playbooks for hotspots, bright spots, and cross-functional responses.",
      icon: <Bell className="w-6 h-6 text-accent" />
    },
    {
      question: "What if executives could read AI readiness in one page?",
      answer: "We can: coach on interpreting Copilot/Viva Insights metrics and deciding where to invest next.",
      icon: <Activity className="w-6 h-6 text-chart-4" />
    },
    {
      question: "What if local change champions could run targeted pulses?",
      answer: "We can: enable Viva Pulse for rapid feedback on enablement content and barriers.",
      icon: <Users className="w-6 h-6 text-primary" />
    }
  ];

  const modules = [
    "Manager Enablement: strengths/opportunities, action planning, habit formation",
    "Narrative Intelligence: comment analysis, sentiment, theme clustering",
    "Smart Alerts Operations: detection → triage → intervention → tracking",
    "Glint 360 & Executive Coaching: admin enablement + strength-based coaching",
    "Outcome Interpretation: standardized KPIs (engagement, adoption depth, cycle-time, focus)"
  ];

  return (
    <Layout>
      <Helmet>
        <title>Training | Eclectik</title>
        <meta name="description" content="Upskill leaders, managers, and HR teams to interpret signals confidently. Training in Glint results conversations, narrative intelligence, and smart alerts operations." />
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 lg:pt-40">
        <div className="absolute inset-0 z-0 bg-background/50">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        {/* Top Right Image */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-0 right-0 z-0 hidden lg:block opacity-100 h-full w-1/2"
        >
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/20 to-background z-10"></div>
          <img 
            src="/images/training-hero-composite.png" 
            alt="Training Visual" 
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
              <div className="h-[1px] w-12 bg-chart-4" />
              <span className="text-chart-4 font-medium tracking-wider uppercase text-sm">Training</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8 text-white">
              Interpretation & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-chart-4 via-white to-secondary">Change Activation</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              We upskill leaders, managers, and HR teams to interpret signals confidently and activate change consistently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: What Ifs */}
            <div className="space-y-12">
              <h2 className="text-3xl font-bold mb-8">The Questions We Answer</h2>
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
                      <div className="mt-1 p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-chart-4/50 transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-chart-4 transition-colors">
                          {item.question}
                        </h3>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <ArrowRight className="w-5 h-5 mt-1 text-chart-4 shrink-0" />
                          <p className="leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Services */}
            <div className="lg:pl-12 lg:border-l border-white/10">
              <div className="sticky top-32">
                <h2 className="text-3xl font-bold mb-6">What We Do</h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Programs range from Glint results conversations and comment analytics to Smart Alerts operations and AI readiness dashboards. We help you turn insights into concrete behavior change.
                </p>

                <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-10">
                  <h3 className="text-xl font-bold mb-6 text-white">Training Modules</h3>
                  <ul className="space-y-4">
                    {modules.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-chart-4 mt-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/contact">
                  <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 rounded-full bg-chart-4 hover:bg-chart-4/90 text-background font-bold transition-all hover:scale-105">
                    Explore with us how we can help with training <ArrowRight className="ml-2 w-5 h-5" />
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
