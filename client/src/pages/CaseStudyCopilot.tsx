import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Target, Zap, CheckCircle2, TrendingUp, Network, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function CaseStudyCopilot() {
  return (
    <Layout>
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-ec-cream py-20 overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-ec-line-3 text-ec-red text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ec-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ec-red"></span>
              </span>
              Case Study
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Copilot Impact Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              How a Fortune Global 500 staffing company enhanced their North American recruitment solutions business with Microsoft Copilot365.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Main Story */}
            <div className="lg:col-span-2 space-y-12">
              {/* Challenge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-ec-sky-ink" />
                  The Challenge
                </h2>
                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p className="mb-4">
                    In late 2024, a Fortune Global 500 staffing company implemented Microsoft Copilot365 to enhance their North American recruitment solutions business.
                  </p>
                  <p>
                    The primary objectives were to:
                  </p>
                  <ul className="list-none space-y-2 mt-4 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Increase growth and gain competitive edge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Accelerate delivery and upgrade service quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Streamline productivity and responsiveness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Improve data quality</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Solution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-ec-sky-ink" />
                  The Solution
                </h2>
                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Eclectik was asked to conduct an independent analysis applying its proprietary AI transformation methodology - <strong>Eclectik VIA™ Framework</strong>.
                  </p>
                  <p className="mt-4">
                    Our analysis covered approximately 200 employees in an individual contributor role over an observation period of 3-4 months.
                  </p>
                </div>
              </motion.div>

              {/* Impact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-ec-sky-ink" />
                  Key Findings & Impact
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <DollarSign className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">$250-$300</div>
                      </div>
                      <p className="text-muted-foreground">
                        Positive impact generated per full-time equivalent (FTE) per month.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <Users className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">Low & New</div>
                      </div>
                      <p className="text-muted-foreground">
                        Impact was particularly significant for low performers and newer employees.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-ec-surface border border-ec-line rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">For employees actively using Copilot, benefits included:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-ec-teal/10 mt-1">
                        <TrendingUp className="w-4 h-4 text-ec-teal-ink" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Increased Activity</span>
                        <p className="text-muted-foreground text-sm">Higher number of candidate interviews and candidate ratings.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-ec-sky/10 mt-1">
                        <Network className="w-4 h-4 text-ec-sky-ink" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Stronger Networks</span>
                        <p className="text-muted-foreground text-sm">Development of stronger external networks.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-ec-navy/10 mt-1">
                        <DollarSign className="w-4 h-4 text-ec-navy" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Financial Contribution</span>
                        <p className="text-muted-foreground text-sm">Improved financial contribution to the business.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-ec-sky-ink" />
                  Recommendations
                </h2>
                <div className="space-y-4">
                  {[
                    "To maximize financial impact, target Copilot adoption efforts on specific mid-tier performers who were identified as potential early adopters.",
                    "Continually measure Copilot impact using leading indicators.",
                    "Accelerate Copilot adoption using precision selection techniques for subsequent cohorts as part of the rollout."
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-ec-surface border border-ec-line">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-ec-navy text-white text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="bg-white border-ec-line sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">About Eclectik</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Eclectik helps organizations create healthier workplace cultures by turning employee feedback into meaningful action. We work across industries globally to spark conversations that shift mindsets and improve employee wellbeing.
                    </p>
                  </div>
                  
                  <div className="border-t border-ec-line pt-6">
                    <h3 className="text-lg font-bold mb-2">Applied Signals</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Through our Applied Signals expertise, we guide clients in using tools like Microsoft Copilot to surface hidden insights and empower more inclusive decision-making.
                    </p>
                  </div>

                  <div className="bg-ec-cream rounded-lg p-4 mt-4">
                    <h4 className="font-bold text-ec-red mb-2">Our Biggest Insight?</h4>
                    <p className="text-sm italic text-muted-foreground">
                      "Real change happens when people feel heard. By focusing on trust and inclusion, we help build stronger, more resilient employees, teams and organizations."
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full gap-2" asChild>
                      <a href="/contact">
                        Schedule a Copilot Consultation <ArrowRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </Layout>
  );
}
