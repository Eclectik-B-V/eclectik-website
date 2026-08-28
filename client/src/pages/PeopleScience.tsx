import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Brain, Users, LineChart, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function PeopleScience() {
  return (
    <Layout>
      <div className="min-h-screen bg-white text-ec-navy">
      {/* Hero Section */}
      <section className="relative py-20 bg-ec-cream overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-ec-navy">
              People Science
            </h1>
            <p className="text-xl text-ec-body mb-8 leading-relaxed">
              Understanding the science of human behaviour at work has never been more imperative. We support you to help leaders cut through the complexity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-ec-navy">Why People Science?</h2>
              <div className="max-w-none text-ec-body">
                <p className="mb-4">
                  Organizations everywhere are adapting to rapid change, new technologies, evolving employee expectations, and increasing pressure to deliver results fast. Are you too, like many others, finding it hard to keep people aligned, engaged, and focused amid the noise?
                </p>
                <p className="mb-4">
                  We are surrounded by more change, more noise, more tools and more data than ever before. More tools and more data alone don’t equate to more change. You and your teams are stretched, whilst expectations to think and act as strategic partners that add value to the business, remain high.
                </p>
                <p className="mb-4">
                  To do this, you need to understand what employees are thinking, feeling and how they’re working in the context of business goals and strategy.
                </p>
                <p className="mb-4">
                  By turning employee insight into clear, actionable direction we enable your organization to build momentum, strengthen culture, and perform at its best.
                </p>
              </div>
              
              <div className="mt-8 grid gap-4">
                {[
                  "Connect people data to business outcomes",
                  "Understand what employees think, feel, and experience",
                  "Turn complex data into meaningful stories",
                  "Drive organizational performance with evidence-led approach"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-ec-sky-ink" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-6"
            >
              <Card className="bg-white border-ec-line-3 shadow-sm hover:border-ec-sky transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-lg bg-ec-sky/15 h-fit">
                    <Brain className="w-6 h-6 text-ec-sky-ink" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">The Science of Work</h3>
                    <p className="text-ec-body text-sm">
                      People Science is the study of what makes humans feel happy, successful, and motivated to do their best work. We use data and an evidence-led approach to identify conditions that drive performance.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-ec-line-3 shadow-sm hover:border-ec-sky transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-lg bg-ec-sky/15 h-fit">
                    <LineChart className="w-6 h-6 text-ec-teal-ink" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">Data & Insight</h3>
                    <p className="text-ec-body text-sm">
                      People Science brings the power of data and the insight of psychology together. By combining science, analytics, and real-world context, we turn complex employee data into meaningful stories.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-ec-line-3 shadow-sm hover:border-ec-sky transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-lg bg-ec-sky/15 h-fit">
                    <Lightbulb className="w-6 h-6 text-ec-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">Actionable Direction</h3>
                    <p className="text-ec-body text-sm">
                      We move beyond just opinion and intuition. Our approach turns insights into practical actions that accelerate culture, clarity, and results for your organization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-ec-surface">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-ec-navy">Our Approach</h2>
            <p className="text-ec-body text-lg">
              We combine behavioural science with practical tools to help you embed the beliefs and behaviours that make transformation stick.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white border-ec-line-3 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-ec-navy">Culture & Infectious Change</h3>
                <p className="text-ec-body mb-4">
                  Real change spreads person to person not top down. Using our Infectious Change approach, we pinpoint the cultural signals, influencers, and habits that drive momentum.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-ec-line-3 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-ec-navy">Listening Strategy and Design</h3>
                <p className="text-ec-body mb-4">
                  Every great employee experience starts with a clear listening strategy. We help you design purposeful, insight-driven programmes that align to your business goals and culture defining what to measure, when & how to listen, and how to respond.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-ec-line-3 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-ec-navy">Employee Experience Insight</h3>
                <p className="text-ec-body mb-4">
                  We help you understand what employees think, feel, and experience. As experts in survey science, we reduce data overload and highlight the insights that drive the strongest impact.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-ec-line-3 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 text-ec-navy">Leadership & Manager Enablement</h3>
                <p className="text-ec-body mb-4">
                  Managers and leaders shape how change feels day to day. We equip them with the insight, confidence, and practical tools to interpret data, act with purpose, and spark positive energy across their teams.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-ec-cream">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 text-ec-sky/40">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                <path d="M30 60 C30 40 40 30 50 20 L40 10 C20 20 10 40 10 70 L30 70 L30 90 L50 90 L50 60 L30 60 Z M80 60 C80 40 90 30 100 20 L90 10 C70 20 60 40 60 70 L80 70 L80 90 L100 90 L100 60 L80 60 Z" />
              </svg>
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-center leading-relaxed relative z-10 text-ec-navy">
              "I want to express my appreciation for the exceptional support provided by the team. Their attentiveness, reliable follow up, and timely communication have had a clear positive effect on our workflow. Their commitment to delivering on every detail has been highly valuable to our team."
            </blockquote>
            <div className="mt-8 text-center">
              <span className="text-ec-body">Fintech - HR Director</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ec-navy">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6 text-ec-on-dark">People Science isn’t just a lens, it’s a lever.</h2>
          <p className="text-ec-on-dark-muted mb-8">
            If you’re ready to move from reactive HR to predictive, strategic impact and shape a workforce that thrives, get in touch!
          </p>
          <Button size="lg" className="gap-2 bg-ec-sky text-ec-navy hover:bg-[#54b4cb]" asChild>
            <a href="/contact">
              Let's explore together <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
      </div>
    </Layout>
  );
}
