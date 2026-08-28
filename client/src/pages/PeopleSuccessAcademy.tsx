import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Target, Zap, CheckCircle2, MessageSquare, Lightbulb, PenTool, Layout, PlayCircle } from "lucide-react";
import { Link } from "wouter";
import LayoutComponent from "@/components/Layout";

export default function PeopleSuccessAcademy() {
  return (
    <LayoutComponent>
      <div className="min-h-screen bg-white text-ec-navy">
        {/* Hero Section */}
        <section className="relative py-20 bg-ec-cream overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ec-sky/15 text-ec-sky-ink text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ec-sky-ink opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ec-sky-ink"></span>
                </span>
                People Success Labs©
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-ec-navy">
                When Engagement Insights <br />
                <span className="text-ec-red">Do Not Turn Into Action</span>
              </h1>
              <p className="text-xl text-ec-body mb-8 leading-relaxed max-w-2xl">
                Most companies are quick to measure engagement, yet only a small fraction take consistent, effective action on the results. Employees feel disenchanted by the lack of action, managers feel stuck, and you run the risk of losing credibility when the feedback loop is left unclosed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" className="gap-2 text-lg px-8 bg-ec-sky text-ec-navy hover:bg-[#54b4cb]">
                    Start the Conversation <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-ec-navy">The Manager Impact</h2>
                <div className="space-y-6 text-lg text-ec-body">
                  <p>
                    Managers account for around <strong className="text-ec-navy">70% of the variance in employee engagement</strong>. Which means that unless managers have the skills and support to act on feedback, surveys won’t shift performance.
                  </p>
                  <p>
                    That’s why our People Science team created <strong className="text-ec-navy">People Success Labs©</strong> to give managers the skills and the space to positively impact engagement. Each People Success Lab is directly linked to a proven driver of engagement and designed to help managers sustainably improve team performance.
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-ec-line">
                  <img 
                    src="/images/webinar-session.jpg" 
                    alt="Interactive online webinar session with happy participants" 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="bg-white border border-ec-line rounded-2xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 text-ec-navy">A Practical Way to Turn Insight Into Better Performance</h3>
                  <ul className="space-y-4">
                    {[
                      "Helps managers move swiftly towards meaningful actions.",
                      "Gives managers the support they need to have a positive impact.",
                      "Brings together People Science and manager development."
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-ec-sky-ink shrink-0 mt-0.5" />
                        <span className="text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-20 bg-ec-surface">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-ec-navy">Delivering Real Progress</h2>
              <p className="text-xl text-ec-body">
                People Success Academy helps you deliver real progress without heavy preparation and at manageable cost.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Co-design",
                  description: "We offer proven, templated Success Labs that can be tailored to your specific context. Together we co-design these webinars/sessions, and help you plan their rollout.",
                  icon: PenTool
                },
                {
                  title: "Analysis",
                  description: "We analyze your employee survey to ascertain where the biggest opportunities are for manager development.",
                  icon: BarChart3
                },
                {
                  title: "Identification",
                  description: "We help you identify the populations that will get the greatest value from People Success Labs.",
                  icon: Target
                },
                {
                  title: "Delivery",
                  description: "We deliver the People Success Labs to Managers in cohorts – and support you to sustain and measure learning.",
                  icon: PlayCircle
                }
              ].map((step, index) => (
                <div key={index} className="bg-white border border-ec-line rounded-xl p-6 hover:border-ec-sky transition-colors">
                  <div className="w-12 h-12 bg-ec-sky/15 rounded-lg flex items-center justify-center mb-6">
                    <step.icon className="w-6 h-6 text-ec-sky-ink" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-ec-navy">{step.title}</h3>
                  <p className="text-ec-body">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-ec-cream">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <MessageSquare className="w-12 h-12 text-ec-sky-ink mx-auto mb-8 opacity-70" />
              <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8 text-ec-navy">
                "People Success Labs helped our managers turn engagement results into real progress that teams could feel in their daily work. The sessions gave them simple practices they could apply immediately, and the impact started to spread across departments. We now see stronger ownership, better communication, and lasting improvements in team performance."
              </blockquote>
              <div className="text-lg font-bold text-ec-red">
                What Clients See in Practice
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container">
            <div className="bg-ec-navy rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-ec-on-dark">Start the Conversation That Moves Your People Forward</h2>
              <p className="text-xl text-ec-on-dark-muted mb-8 max-w-2xl mx-auto">
                Don't let another engagement survey go to waste. Equip your managers with the tools they need to drive real change.
              </p>
              <Link href="/contact">
                <Button size="lg" className="gap-2 text-lg px-8 bg-ec-sky text-ec-navy hover:bg-[#54b4cb]">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </LayoutComponent>
  );
}
