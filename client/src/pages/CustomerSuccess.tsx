import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, BarChart3, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";

export default function CustomerSuccess() {
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
              Customer Success
            </h1>
            <p className="text-xl text-ec-body mb-8 leading-relaxed">
              We help you unlock the full value of your technology investments by focusing on adoption, engagement, and measurable business outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-ec-navy">Why Customer Success?</h2>
              <div className="max-w-none text-ec-body">
                <p className="mb-4">
                  Technology is only as good as the people using it. Our Customer Success practice ensures that your teams not only adopt new tools but thrive with them. We bridge the gap between technical implementation and human adoption.
                </p>
                <p className="mb-4">
                  From onboarding to ongoing optimization, we partner with you to drive usage, gather feedback, and demonstrate ROI. Our approach is data-driven, people-centric, and aligned with your strategic goals.
                </p>
              </div>
              
              <div className="mt-8 grid gap-4">
                {[
                  "Accelerate user adoption and proficiency",
                  "Maximize return on technology investment",
                  "Reduce churn and improve employee satisfaction",
                  "Align technology with business objectives"
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
                    <Target className="w-6 h-6 text-ec-sky-ink" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">Strategic Alignment</h3>
                    <p className="text-ec-body text-sm">
                      We align your success metrics with business goals to ensure every initiative drives tangible value.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-ec-line-3 shadow-sm hover:border-ec-sky transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-lg bg-ec-sky/15 h-fit">
                    <Users className="w-6 h-6 text-ec-teal-ink" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">Adoption & Change Management</h3>
                    <p className="text-ec-body text-sm">
                      Proven methodologies to manage resistance, build champions, and foster a culture of continuous learning.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-ec-line-3 shadow-sm hover:border-ec-sky transition-colors">
                <CardContent className="p-6 flex gap-4">
                  <div className="p-3 rounded-lg bg-ec-sky/15 h-fit">
                    <BarChart3 className="w-6 h-6 text-ec-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-ec-navy">Data-Driven Insights</h3>
                    <p className="text-ec-body text-sm">
                      Leverage usage analytics and feedback loops to optimize performance and identify new opportunities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-ec-surface">
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
              "Their thoughtfulness, responsiveness, and creative problem-solving were truly off the charts. We hit several unexpected snags, and their deep expertise and proactive support were absolutely critical, we would have been lost without it."
            </blockquote>
            <div className="mt-8 text-center">
              <cite className="not-italic font-semibold text-ec-red text-lg block mb-1">Communication Director</cite>
              <span className="text-ec-body">Fintech Organization</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ec-navy">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6 text-ec-on-dark">Ready to elevate your success?</h2>
          <p className="text-ec-on-dark-muted mb-8">
            Let's discuss how our Customer Success services can transform your organization's relationship with technology.
          </p>
          <Button size="lg" className="gap-2 bg-ec-sky text-ec-navy hover:bg-[#54b4cb]" asChild>
            <a href="/contact">
              Get in Touch <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>
      </div>
    </Layout>
  );
}
