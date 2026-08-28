import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, MessageSquare, Target, PenTool, PlayCircle, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

export default function ChangeManagement() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const capabilities = [
    {
      title: "Write the Script",
      description: "Clarify the desired outcomes, define measurable progress, and analyze which behavioral shifts matter most.",
      icon: <PenTool className="w-8 h-8 text-ec-red" />
    },
    {
      title: "Build the Cast",
      description: "Identify the early adopters and allies who will form a \"Delta Team\" to champion change within their networks.",
      icon: <Users className="w-8 h-8 text-ec-teal-ink" />
    },
    {
      title: "Rehearse for Ideas",
      description: "Use structured creativity sessions to generate and test behavior-based solutions aligned to the change goal",
      icon: <Lightbulb className="w-8 h-8 text-ec-sky-ink" />
    },
    {
      title: "Set the Stage",
      description: "Design communication moments, cues, and environmental nudges that make the new behavior visible and repeatable.",
      icon: <Target className="w-8 h-8 text-ec-navy" />
    },
    {
      title: "Engage the Audience",
      description: "Broaden adoption by creating participatory experiences that allow others to experiment with and internalize the change",
      icon: <MessageSquare className="w-8 h-8 text-ec-sky-ink" />
    },
    {
      title: "Plan for Improvisation",
      description: "Coach leaders to sustain momentum recognizing stages of change and adapting their approach as teams evolve.",
      icon: <PlayCircle className="w-8 h-8 text-ec-red" />
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white text-ec-navy">
        {/* Hero Section */}
        <section className="relative py-20 bg-ec-cream overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-bg.jpg"
              alt="Background"
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ec-cream/60 via-ec-cream/75 to-ec-cream" />
          </div>
          
          <div className="container relative z-10">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="max-w-4xl"
            >
              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-ec-navy">
                The Moment When <br />
                <span className="text-ec-red">Engagement Stalls</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="text-xl md:text-2xl text-ec-body mb-8 leading-relaxed max-w-3xl">
                After survey results are shared, your greatest challenge as HR team isn’t identifying what needs attention. It’s enabling leaders to spark change that actually spreads.
              </motion.p>
              <motion.div variants={fadeIn}>
                <Link href="/contact">
                  <Button size="lg" className="gap-2 text-lg px-8 rounded-full bg-ec-sky text-ec-navy hover:bg-[#54b4cb]">
                    Spark Your Next Movement <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Challenge Section */}
        <section className="py-20 bg-ec-surface border-y border-ec-line">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-ec-navy">Why Standard Programs Fail</h2>
                <div className="space-y-6 text-lg text-ec-body">
                  <p>
                    Standard programs focus on structure and communication, yet they overlook how behavior truly travels through an organization.
                  </p>
                  <p className="text-ec-body-strong font-medium text-xl border-l-4 border-ec-red pl-6 py-2">
                    Real transformation happens when leaders influence the few who move the many, turning isolated improvements into a self-sustaining culture shift.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-white border border-ec-line rounded-2xl p-8 shadow-sm">
                  <h3 className="text-2xl font-bold mb-4 text-ec-navy">The Method that Makes Progress Contagious</h3>
                  <p className="text-ec-body mb-6">
                    The turning point comes when leaders stop trying to manage change and start designing how it spreads.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-ec-sky/15 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-ec-sky-ink" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 text-ec-navy">People Follow People</h4>
                        <p className="text-sm text-ec-body">Not plans. We equip leaders to influence the few who move the many.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-ec-red/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-ec-red" />
                      </div>
                      <div>
                        <h4 className="font-bold mb-1 text-ec-navy">Infectious Change Design ©</h4>
                        <p className="text-sm text-ec-body">Through emotional ownership, social modeling, and well-timed influence, progress becomes contagious.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Guide Leaders Section */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-ec-navy">How We Guide Leaders to Influence at Scale</h2>
              <p className="text-xl text-ec-body">
                Infectious Change Design © transforms culture not through workshops alone, but through applied practice. Leaders learn the behavioral science of influence while leading a real-time change initiative inside their organization.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capabilities.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-ec-line rounded-xl p-8 hover:border-ec-sky transition-all hover:shadow-lg group"
                >
                  <div className="mb-6 p-3 bg-ec-surface rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-ec-navy">{item.title}</h3>
                  <p className="text-ec-body leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 p-8 md:p-12 bg-ec-cream rounded-3xl border border-ec-line text-center">
              <p className="text-lg md:text-xl text-ec-body-strong mb-6 max-w-4xl mx-auto italic">
                "Across six capabilities, participants build both a change playbook and influence mastery. Each session generates tangible deliverables—such as stakeholder maps, behavior scripts, influence plans, and coaching strategies—that together form a comprehensive plan of action. The result is a movement designed, not declared: leaders who know how to make progress contagious."
              </p>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-ec-surface">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <Users className="w-12 h-12 text-ec-sky-ink mx-auto opacity-70" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 text-ec-navy">
                "Before this work, we had strong insights but no clear way to turn them into progress. Infectious Change helped our leaders influence the few who move the many, and we watched new behaviors spread naturally through the organization. The result is a lasting shift in how teams collaborate and take ownership, and it continues to grow without external pressure."
              </blockquote>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden bg-ec-navy">
          <div className="absolute inset-0 bg-[url('/images/change-management-bg.jpg')] opacity-10 bg-cover bg-center" />
          
          <div className="container relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-ec-on-dark">Let us Help You Spark Your Next Movement</h2>
            <p className="text-xl text-ec-on-dark-muted max-w-2xl mx-auto mb-10">
              Don't just manage change—design it to spread. Partner with us to build a self-sustaining culture shift.
            </p>
            <Link href="/contact">
              <Button size="lg" className="text-lg px-10 py-6 rounded-full bg-ec-sky text-ec-navy hover:bg-[#54b4cb] font-bold transition-all">
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
