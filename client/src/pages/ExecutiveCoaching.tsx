import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, Users, BarChart, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function ExecutiveCoaching() {
  return (
    <Layout>
      <Helmet>
        <title>Executive Coaching - Eclectik</title>
        <meta name="description" content="Executive Coaching services to help leaders navigate AI transformation and drive organizational success." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative bg-background pt-40 lg:pt-48 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-100 pointer-events-none hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/20 to-background z-10"></div>
          <img 
            src="/images/consulting-hero-composite.png" 
            alt="Executive Coaching" 
            className="w-full h-full object-cover object-left"
          />
        </div>
        
        <div className="container relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-white leading-tight">
              Executive <span className="text-primary">Coaching</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light max-w-2xl">
              Turning insights into action. Building the mindsets needed for lasting change.
            </p>
            <Link href="/contact">
              <Button size="lg" className="gap-2 text-lg px-8 bg-primary hover:bg-primary/90 text-white rounded-full">
                Connect With Us <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <section className="py-20 bg-card/30 border-t border-white/5">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">Where Leadership Behaviour Blocks Progress</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  When leadership behaviour does not shift, progress slows down and organisational change struggles to take hold. Even with strong diagnostics and good intentions, leaders and managers can feel overwhelmed, disconnected or unsure how to guide their teams through new expectations.
                </p>
                <p>
                  Data often shows symptoms such as disengaged teams, burnout signals and low trust, but these point to deeper challenges in mindsets and daily behaviour.
                </p>
                <p className="font-medium text-white">
                  When leaders do not adapt, the organisation feels the impact in stalled momentum and fading confidence in the transformation.
                </p>
              </div>
            </div>
            <div className="bg-card p-8 rounded-xl border border-white/10 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Brain className="w-6 h-6 text-primary" />
                Common Challenges
              </h3>
              <ul className="space-y-4">
                {[
                  "Disengaged teams and low morale",
                  "Burnout signals and overloaded calendars",
                  "Low trust scores in leadership",
                  "Stalled transformation momentum",
                  "Uncertainty in guiding teams"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">Coaching That Builds the Mindsets Needed for Lasting Change</h2>
            <p className="text-lg text-muted-foreground">
              Executive coaching helps leaders turn insights into action. It creates space for reflection, challenge, and growth, enabling leadership that is clearer, more self-aware, more confident, and emotionally intelligent. Coaching supports the mindset and behaviour shifts needed to embed and sustain transformation, not just initiate it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-colors">
              <BarChart className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Diagnostic & Data-Driven</h3>
              <p className="text-muted-foreground">
                We take a diagnostic and data-driven approach. Our coaching helps bring the data to life, translating subjective or objective data into targeted development.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-colors">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Group & 1:1 Coaching</h3>
              <p className="text-muted-foreground">
                Through a blend of group learning and one-to-one coaching, we give leaders the space and awareness to build practical strategies to lead change.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-white/10 hover:border-primary/50 transition-colors">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Timely & Relevant</h3>
              <p className="text-muted-foreground">
                Whether coaching managers with disengaged teams or low trust scores, our approach ensures coaching is timely, relevant, and impactful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-primary/5 border-y border-white/5">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-12 text-center text-white">Our 4-Step Coaching Journey</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "Discover",
                desc: "We partner with your HR and leadership teams to review your data, identifying coaching themes and cohorts."
              },
              {
                step: "Design",
                desc: "We tailor coaching pods and 1:1 journeys to your organisation’s context, business priorities, transformation goals, and leadership challenges."
              },
              {
                step: "Deliver",
                desc: "Over 6–8 weeks, we run group coaching sessions and individual coaching for targeted behavior change, supported by custom tools and reflection guides."
              },
              {
                step: "Review",
                desc: "We close the loop with impact summaries for HR, delegate feedback, recommendations for tracking progress and next steps."
              }
            ].map((item, i) => (
              <div key={i} className="relative p-6 bg-background rounded-xl shadow-sm border border-white/10">
                <div className="text-4xl font-bold text-primary/20 mb-4">0{i + 1}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.step}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="bg-card p-10 rounded-2xl border border-white/10 relative">
            <MessageSquare className="w-12 h-12 text-primary/20 absolute top-8 left-8" />
            <blockquote className="text-xl md:text-2xl font-light italic text-center relative z-10 mb-6 text-white">
              "Executive coaching helped our leaders move from understanding the data to acting on it with confidence. The sessions created real clarity and helped managers adjust their behaviour in ways that strengthened trust and improved team energy. We now see lasting progress in how our leaders show up and how our teams perform."
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white">Turn Insight Into Real Progress</h2>
          <p className="text-xl opacity-90 mb-8 text-white/90">
            If you want to strengthen leadership behaviour, gain clarity, and lead change with confidence, we invite you to connect with us.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="text-primary font-bold px-8 bg-white hover:bg-white/90 rounded-full">
              Start the Conversation
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
