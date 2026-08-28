import { motion } from "framer-motion";
import { ArrowRight, Target, Zap, CheckCircle2, TrendingUp, Users, BarChart3, Lightbulb, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "wouter";

export default function CaseStudyMicrosoftViva() {
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
              How Microsoft Viva Became a Business Transformation Engine
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Microsoft's internal journey using Viva to drive AI and Copilot adoption across 220,000+ employees, demonstrating the power of human-centered transformation at scale.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 rounded-full bg-white border border-ec-line-3 text-ec-body-strong text-sm font-medium">Microsoft Viva</span>
              <span className="px-4 py-2 rounded-full bg-white border border-ec-line-3 text-ec-body-strong text-sm font-medium">Microsoft 365 Copilot</span>
              <span className="px-4 py-2 rounded-full bg-white border border-ec-line-3 text-ec-body-strong text-sm font-medium">Change Management</span>
            </div>
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
                    Business transformation is complex, multifaceted, and perpetual. It's also firmly rooted in an organization's culture, requiring change management technology that meets human needs directly.
                  </p>
                  <p className="mb-4">
                    When Microsoft embarked on the most revolutionary business transformation in decades—adopting AI and Microsoft 365 Copilot across its 220,000+ global workforce—the company faced unprecedented challenges in driving adoption at scale.
                  </p>
                  <p className="mb-4">
                    Operating across multiple geographies, languages, business units, and regulatory frameworks, Microsoft needed to ensure every employee understood the change, felt included in the transformation, and could adopt new AI capabilities on their own timeline while maintaining their day-to-day productivity.
                  </p>
                  <p className="italic border-l-4 border-ec-red pl-4 py-2 bg-ec-cream text-ec-body-strong">
                    "Everything we do links back to our culture. What that means is we focus on the people side of change, and we take a human-centered approach that focuses on the user's experience of the process."
                    <span className="block mt-2 text-sm not-italic">— David Laves, Director of Business Programs, Microsoft</span>
                  </p>
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
                  The Solution: Viva-Powered Transformation
                </h2>
                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p className="mb-4">
                    Microsoft turned to its own Microsoft Viva suite as the transformation engine. Rather than treating Viva as just a collection of employee experience apps, Microsoft leveraged its connected, integrated, human-focused capabilities to orchestrate change at every stage of the adoption journey.
                  </p>
                  <p className="mb-4">
                    The approach followed Microsoft's four-stage adoption framework: Get Ready, Onboard and Engage, Deliver Impact, and Extend and Optimize. At each stage, different Viva applications provided the insights, communication channels, learning opportunities, and community engagement needed to drive sustainable transformation.
                  </p>
                  
                  <div className="bg-ec-surface border border-ec-line rounded-xl p-6 my-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Microsoft Adoption Framework:</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-ec-sky-ink mt-1 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">Get Ready</div>
                          <div className="text-sm">Identify opportunities, secure sponsorship, and apply insights to planning</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-ec-sky-ink mt-1 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">Onboard and Engage</div>
                          <div className="text-sm">Drive awareness, provide knowledge and skill building, scale across communities</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-ec-sky-ink mt-1 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">Deliver Impact</div>
                          <div className="text-sm">Build communities of practice, highlight wins, resolve knowledge gaps</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-ec-sky-ink mt-1 shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">Extend and Optimize</div>
                          <div className="text-sm">Conduct employee listening, measure outcomes, explore further maturity</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="italic border-l-4 border-ec-red pl-4 py-2 bg-ec-cream text-ec-body-strong">
                    "It's a natural fit, because awareness, engagement, and insight pieces are baked in. Instead of getting hit from different directions for each change management goal, employees embark on an orchestrated journey that change management leaders can monitor and modify as it progresses."
                    <span className="block mt-2 text-sm not-italic">— Kevin Wooldridge, Senior Director, Office of the Chief Operations Officer, Microsoft</span>
                  </p>
                </div>
              </motion.div>

              {/* Viva Apps in Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-ec-sky-ink" />
                  Viva Applications in Action
                </h2>
                <div className="space-y-6">
                  <Card className="bg-white border-ec-line">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">Viva Insights, Pulse & Glint</h3>
                      <p className="text-muted-foreground mb-3">
                        Established baseline usage metrics and employee sentiment before rollout. The Copilot Dashboard provided crucial usage data aligned with employee roles and work patterns, while surveys gave employees a voice in shaping the transformation.
                      </p>
                      <div className="text-sm font-semibold text-ec-red">Stage: Get Ready</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-ec-line">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">Viva Amplify</h3>
                      <p className="text-muted-foreground mb-3">
                        Orchestrated multi-channel communication campaigns across Outlook, Teams, and Viva Engage. Enabled collaborative campaign creation and flexible audience targeting to secure executive sponsorship and drive adoption messaging.
                      </p>
                      <div className="text-sm font-semibold text-ec-red">Stage: Get Ready, Onboard and Engage</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-ec-line">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">Viva Learning</h3>
                      <p className="text-muted-foreground mb-3">
                        Delivered tailored Copilot Academy curriculum with multiple learning formats. Employees who accessed the academy saw 2x more days of Copilot usage, 5% more engagement, and better adoption across Microsoft 365 apps.
                      </p>
                      <div className="text-sm font-semibold text-ec-red">Stage: Onboard and Engage</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-ec-line">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">Viva Engage</h3>
                      <p className="text-muted-foreground mb-3">
                        Created the Copilot Champs Community for peer leaders and enabled viral spread of tips and inspiration through line-of-business communities. Fostered community-driven adoption aligned with Microsoft's cultural values.
                      </p>
                      <div className="text-sm font-semibold text-ec-red">Stage: Onboard and Engage, Deliver Impact</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-ec-line">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground">Viva Connections</h3>
                      <p className="text-muted-foreground mb-3">
                        Served as personalized home feed surfacing leadership communications, community experiences, and important engagements like Camp Copilot—a multi-week series of peer-to-peer, hands-on, gamified activations.
                      </p>
                      <div className="text-sm font-semibold text-ec-red">Stage: Onboard and Engage</div>
                    </CardContent>
                  </Card>
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
                  <TrendingUp className="w-8 h-8 text-ec-sky-ink" />
                  Transformation Outcomes
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <Users className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">220K+</div>
                      </div>
                      <p className="text-muted-foreground">
                        Employees successfully onboarded to Microsoft 365 Copilot
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <TrendingUp className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">2x</div>
                      </div>
                      <p className="text-muted-foreground">
                        More Copilot usage days for employees who accessed Copilot Academy
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <BarChart3 className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">5%</div>
                      </div>
                      <p className="text-muted-foreground">
                        Increase in engagement for academy participants
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-ec-surface border-ec-line">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-white">
                          <Award className="w-6 h-6 text-ec-sky-ink" />
                        </div>
                        <div className="text-3xl font-bold text-foreground">4-Stage</div>
                      </div>
                      <p className="text-muted-foreground">
                        Adoption framework successfully deployed at global scale
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="prose max-w-none text-muted-foreground text-lg leading-relaxed">
                  <p className="mb-4">
                    The transformation yielded measurable improvements in adoption velocity, employee engagement, and organizational readiness for AI. More importantly, it demonstrated that large-scale business transformation can be human-centered, culturally aligned, and sustainable when powered by the right employee experience platform.
                  </p>
                  <p className="mb-4">
                    By using Viva Pulse surveys, Microsoft discovered that employees felt saturated with onboarding sessions and needed role-specific scenarios instead. This insight led to focus groups that produced concrete, applicable guidance—demonstrating the power of continuous listening and adaptive change management.
                  </p>
                </div>
              </motion.div>

              {/* Key Learnings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <h2 className="text-3xl font-bold mb-6">Key Learnings</h2>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-ec-navy flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Culture-First Transformation</h3>
                      <p className="text-muted-foreground">
                        Successful transformation starts with culture. Human-centered approaches that focus on the "why" of change and empower organizational leaders as cultural torchbearers drive sustainable adoption.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-ec-navy flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Integrated Employee Experience</h3>
                      <p className="text-muted-foreground">
                        Viva's connected ecosystem enables orchestrated change journeys rather than fragmented initiatives. Employees receive coordinated support across awareness, learning, community, and measurement.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-ec-navy flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Continuous Listening and Adaptation</h3>
                      <p className="text-muted-foreground">
                        Real-time employee signals through Pulse surveys and Glint questionnaires enable change leaders to pivot quickly, addressing saturation points and knowledge gaps before they derail adoption.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-ec-navy flex items-center justify-center shrink-0 mt-1">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Community-Driven Adoption</h3>
                      <p className="text-muted-foreground">
                        Peer-led communities like the Copilot Champs Community create viral adoption patterns and provide authentic, relatable learning experiences that formal training cannot replicate.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Company Info */}
                <Card className="bg-white border-ec-line">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Organization</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Company</div>
                        <div className="font-medium text-foreground">Microsoft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Industry</div>
                        <div className="font-medium text-foreground">Technology</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Employees</div>
                        <div className="font-medium text-foreground">220,000+</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Geography</div>
                        <div className="font-medium text-foreground">Global</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Technologies */}
                <Card className="bg-white border-ec-line">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Insights</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Pulse</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Glint</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Amplify</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Learning</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Engage</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Viva Connections</span>
                      <span className="px-3 py-1 rounded-full bg-ec-surface text-ec-body-strong text-xs font-medium">Microsoft 365 Copilot</span>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-ec-cream border-ec-line-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Ready to Transform?</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      Learn how Eclectik can help you leverage Workplace Signals and Microsoft Viva to drive successful AI transformation in your organization.
                    </p>
                    <Link href="/contact">
                      <Button className="w-full group">
                        Get in Touch
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Source */}
                <Card className="bg-white border-ec-line">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Source</h3>
                    <a 
                      href="https://www.microsoft.com/insidetrack/blog/how-microsoft-viva-became-a-business-transformation-engine-at-microsoft/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-ec-red hover:text-ec-red-hover text-sm"
                    >
                      Microsoft Inside Track Blog
                    </a>
                    <p className="text-xs text-muted-foreground mt-2">Published: January 16, 2025</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ec-navy text-ec-on-dark">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Transform Your Organization with Workplace Signals
            </h2>
            <p className="text-xl text-ec-on-dark-muted mb-8">
              Eclectik helps organizations operationalize Workplace Signals to drive successful AI transformation, just like Microsoft did with Viva.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="group">
                  Start Your Transformation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/consulting">
                <Button size="lg" variant="outline" className="border-ec-navy-line-2 text-ec-on-dark hover:bg-white/10 hover:text-white">
                  Explore Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </Layout>
  );
}
