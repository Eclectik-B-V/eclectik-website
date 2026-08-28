import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Target, Zap, CheckCircle2, TrendingUp, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function CaseStudyGlint() {
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
              Sage improves retention 30% with employee listening
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              How a global payroll, HR, and finance software provider used Viva Glint and Viva Insights to gain real-time insights into employee sentiment and workplace behaviors.
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
                <div className="mb-8 rounded-xl overflow-hidden border border-ec-line shadow-sm">
                  <img 
                    src="/images/glint-manager-report.png" 
                    alt="Viva Glint Manager Report Dashboard" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p className="mb-4">
                    For a global business operating in a hybrid world, keeping a finger on the pulse of organizational culture can be a challenge. Sage needed a way to maintain their people-focused, supportive workplace culture across a distributed workforce.
                  </p>
                  <p>
                    The primary objectives were to:
                  </p>
                  <ul className="list-none space-y-2 mt-4 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Gain real-time insights into employee sentiment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Understand workplace behaviors in a hybrid environment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ec-red mt-2.5 shrink-0" />
                      <span>Improve employee retention and engagement</span>
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
                <div className="mb-8 rounded-xl overflow-hidden border border-ec-line shadow-sm">
                  <img 
                    src="/images/glint-copilot-dashboard.png" 
                    alt="Viva Glint Copilot Integration" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Sage implemented <strong>Microsoft Viva Glint</strong> and <strong>Viva Insights</strong> to create a comprehensive employee listening strategy.
                  </p>
                  <p className="mt-4">
                    By combining active feedback from surveys (Viva Glint) with passive behavioral data (Viva Insights), Sage could understand not just how employees were feeling, but how work patterns were influencing those feelings.
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
                <div className="mb-8 rounded-xl overflow-hidden border border-ec-line shadow-sm">
                  <img 
                    src="/images/viva-insights-dashboard.jpg" 
                    alt="Viva Insights Dashboard" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <TrendingUp className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">30%</div>
                      </div>
                      <p className="text-muted-foreground">
                        Improvement in employee retention through targeted listening and action.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <MessageSquare className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">Real-time</div>
                      </div>
                      <p className="text-muted-foreground">
                        Insights into employee sentiment and workplace behaviors.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-ec-surface border border-ec-line rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Key Benefits Realized:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-ec-teal/10 mt-1">
                        <Heart className="w-4 h-4 text-ec-teal-ink" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Enhanced Culture</span>
                        <p className="text-muted-foreground text-sm">Maintained a supportive, people-focused culture in a hybrid world.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-ec-sky/10 mt-1">
                        <Users className="w-4 h-4 text-ec-sky-ink" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Empowered Leaders</span>
                        <p className="text-muted-foreground text-sm">Leaders equipped with data to make informed decisions about team wellbeing.</p>
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
                  Key Takeaways
                </h2>
                <div className="space-y-4">
                  {[
                    "Listening to employees is crucial for maintaining a strong culture in a hybrid work environment.",
                    "Combining sentiment data (surveys) with behavioral data (work patterns) provides a holistic view of the employee experience.",
                    "Data-driven insights empower leaders to take targeted actions that improve retention and engagement."
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
                    <h3 className="text-lg font-bold mb-2">About Sage</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sage is a global market leader for technology that provides small and medium businesses with the visibility, flexibility, and efficiency to manage finances, operations, and people.
                    </p>
                  </div>
                  
                  <div className="border-t border-ec-line pt-6">
                    <h3 className="text-lg font-bold mb-2">Employee Listening</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "We use Microsoft Viva Glint and Viva Insights to gain real-time insights into how employees are feeling and workplace behaviors. We understand the importance of listening to employees."
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">- Sharon Oley, Customer Services Director, Sage</p>
                  </div>

                  <div className="bg-ec-cream rounded-lg p-4 mt-4">
                    <h4 className="font-bold text-ec-red mb-2">Why it Matters</h4>
                    <p className="text-sm italic text-muted-foreground">
                      "Key to that standout customer experience is a frontline workforce of engaged employees who buy into Sage’s people-focused, supportive workplace culture."
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full gap-2" asChild>
                      <a href="/contact">
                        Schedule a Consultation <ArrowRight className="w-4 h-4" />
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
