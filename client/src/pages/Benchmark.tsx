import { useEffect } from "react";
import Layout from "@/components/Layout";
import WaitlistForm from "@/components/WaitlistForm";
import { Helmet } from "react-helmet-async";
import { POSITIONING_TAGLINE } from "@shared/const";

export default function Benchmark() {
  // Support /benchmark#waitlist deep links (ScrollToTop resets scroll on route
  // change, so scroll to the anchor after mount).
  useEffect(() => {
    if (window.location.hash === "#waitlist") {
      requestAnimationFrame(() => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>The AI Transformation Benchmark | Eclectik</title>
        <meta
          name="description"
          content="Standardised KPIs, process-level measurement and peer comparison for AI transformation. Opens September 2026 — join the waiting list."
        />
      </Helmet>

      {/* Hero — solid background, no image */}
      <section className="pt-40 pb-16">
        <div className="container max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              {POSITIONING_TAGLINE}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight mb-6">
            The benchmark — opens September
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            How does your AI transformation compare with your peers? Standardised KPIs,
            process-level measurement and peer comparison across organisations — built on the
            same method we run inside leading enterprises today.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Standardised KPIs
            </h3>
            <p className="text-muted-foreground text-sm">
              The same value and change indicators measured the same way in every
              participating organisation — so comparison means something.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Process-level measurement
            </h3>
            <p className="text-muted-foreground text-sm">
              Evidence gathered where the work happens: licence, usage and telemetry data on
              the value side, listening data on the change side.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Peer comparison
            </h3>
            <p className="text-muted-foreground text-sm">
              Placement against organisations of comparable shape — sector, size and
              transformation stage — not against averages.
            </p>
          </div>
        </div>
      </section>

      {/* Who it is for + capacity */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-heading font-semibold text-white mb-6">Who it is for</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            CFOs and CIOs who need an independent value statement before the next investment
            decision, and transformation leaders who need proof their workforce is actually
            changing. If AI spend is on your board agenda, the benchmark tells you where you
            stand.
          </p>
          <p className="border-l-2 border-secondary pl-5 text-foreground max-w-2xl">
            We run around twelve audits a year. Q3 is full. The waiting list hears first when
            September seats open.
          </p>
        </div>
      </section>

      {/* Data governance — placeholder pending legal review */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-heading font-semibold text-white mb-6">
            Data governance
          </h2>
          {/* LEGAL REVIEW PENDING — placeholder copy below must be legal-reviewed before launch */}
          <p className="text-muted-foreground max-w-2xl">
            Benchmark participation runs on your own data, under your own governance. Data is
            processed under a data-processing agreement, stored within the EU, and never
            shared between participants — peer comparison uses aggregated, anonymised
            placement only. Eclectik is ISO 27001 certified.
          </p>
        </div>
      </section>

      {/* Waiting list */}
      <section id="waitlist" className="py-20 border-t border-white/10 bg-white/[0.03]">
        <div className="container max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-secondary text-sm tracking-wider uppercase font-semibold block mb-4">
              The benchmark — opens September
            </span>
            <h2 className="text-3xl font-heading font-semibold text-white mb-4">
              Join the waiting list
            </h2>
            <p className="text-muted-foreground">
              Benchmark updates only. You hear first when September seats open — no spam,
              unsubscribe anytime.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </Layout>
  );
}
