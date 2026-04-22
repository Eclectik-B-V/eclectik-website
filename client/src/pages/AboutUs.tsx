import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, Lightbulb, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function AboutUs() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const values = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "People-Centered",
      description: "We believe engagement and happiness are the foundations of strong, healthy, and enduring cultures."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Data-Driven",
      description: "We combine objective telemetry with subjective sentiment to build actionable roadmaps that deliver measurable impact."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-primary" />,
      title: "Innovation-Led",
      description: "We combine objective workplace telemetry with subjective sentiment analysis to operationalize AI transformation—from Copilot ROI modeling to change activation and sustained adoption."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
        <div className="container relative z-10 px-4 mx-auto">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-heading tracking-tight">
              Insights that accelerate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI Transformation</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Eclectik is a boutique consultancy dedicated to operationalizing Workplace Signals end-to-end. We help organizations create healthier workplace cultures by turning employee feedback into meaningful action.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-black/20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 font-heading">
                  <span className="text-primary">We Are</span>: A Boutique Consultancy
                </h3>
                <p className="text-lg text-muted-foreground italic">
                  Specialized expertise with a personal touch.
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Eclectik empowers organizations to build thriving, people-centered workplaces through exceptional employee listening solutions. We work across industries globally to spark conversations that shift mindsets and improve employee wellbeing.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our proprietary <strong>Eclectik VIA™ Framework</strong> combines objective telemetry (like Viva Insights and Copilot dashboards) with subjective signals (such as Viva Glint drivers and narrative themes) to provide a holistic view of your organization's health and AI readiness.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Operationalize Workplace Signals end-to-end",
                  "Create AI-native organizations",
                  "Turn employee feedback into meaningful action",
                  "Deliver measurable business impact"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 p-1">
                <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden relative">
                  <img 
                    src="/images/about-team-photo.jpg" 
                    alt="Eclectik Team Collaboration" 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">Our Core Values</h2>
            <p className="text-lg text-muted-foreground">
              We are driven by a commitment to excellence, innovation, and the belief that people are the heart of every successful transformation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-white/5">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">Ready to transform your organization?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the forward-thinking companies that are leveraging Eclectik's expertise to build AI-native, people-first cultures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="text-lg px-8 h-14">
                Get in Touch <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/solutions">
              <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                Explore Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
