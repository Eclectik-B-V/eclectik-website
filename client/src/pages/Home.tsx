import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Link } from "wouter";
import WaitlistForm from "@/components/WaitlistForm";
import { Helmet } from "react-helmet-async";
import { trackCTAClick, trackDoorSelected } from "@/lib/tracking";
import { POSITIONING_TAGLINE } from "@shared/const";

// Use local worker served from public directory to avoid CSP issues
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const ISO_CERT_URL = "/documents/iso-27001-certificate.pdf";

function IsoCertModal({ onClose }: { onClose: () => void }) {
  const [numPages, setNumPages] = useState<number>(0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1f2e] rounded-xl shadow-2xl w-[90vw] max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">ISO 27001 Certificaat — Eclectik B.V.</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors text-2xl leading-none ml-4"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 px-4">
          <Document
            file={ISO_CERT_URL}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-white/50 py-20">Certificaat laden...</div>}
            error={<div className="text-red-400 py-20">Kon het certificaat niet laden.</div>}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={Math.min(window.innerWidth * 0.8, 750)}
                className="mb-4 shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

const PROOF_STATS = [
  { num: "3×", label: "Leaders underestimate employee AI use — McKinsey" },
  { num: "57%", label: "of employees hide their AI use from their employer — KPMG, n=48k" },
  { num: "12%", label: "of CEOs can show AI delivered both cost and revenue benefit — PwC" },
  { num: "42%", label: "of AI initiatives are abandoned before value — S&P Global" },
];

const INSIGHT_TEASERS = [
  {
    category: "Evidence",
    title: "The measurement gap: why self-reported AI ROI misleads",
    summary:
      "74% report positive ROI among those who measure. The broader sample shows no EBIT impact. Both are true.",
  },
  {
    category: "Change",
    title: "Shadow AI: what 57% of your workforce isn't telling you",
    summary:
      "Employees use AI three times more than leadership thinks — and more than half hide it.",
  },
  {
    category: "Value",
    title: "Works councils and AI adoption: the European wedge",
    summary:
      "Independent adoption evidence is co-determination currency. Why that matters for your rollout.",
  },
];

export default function Home() {
  const [showIsoCert, setShowIsoCert] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Layout>
      <Helmet>
        <title>Eclectik | Independent AI Transformation Assurance</title>

        {/* Organization Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Eclectik",
            alternateName: "Eclectik AI Transformation",
            url: "https://www.eclectik.co",
            logo: "https://www.eclectik.co/images/eclectik-logo-dark.svg",
            description:
              "Eclectik operationalizes Workplace Signals end-to-end, combining objective telemetry with subjective sentiment to build actionable AI transformation roadmaps.",
            contactPoint: {
              "@type": "ContactPoint",
              email: "info@eclectik.co",
              contactType: "Customer Service",
            },
            sameAs: [
              "https://www.linkedin.com/company/eclectik",
              "https://www.instagram.com/eclectik",
              "https://www.youtube.com/@eclectik",
            ],
          })}
        </script>

        {/* Professional Service Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Eclectik AI Transformation Consulting",
            image: "https://www.eclectik.co/images/eclectik-logo-dark.svg",
            description:
              "AI transformation consulting services including Copilot ROI modeling, change activation, and sustained adoption through workplace signals analysis.",
            url: "https://www.eclectik.co",
            serviceType: [
              "AI Transformation Consulting",
              "Microsoft Copilot Implementation",
              "Workplace Analytics",
              "Change Management",
              "AI Training & Enablement",
            ],
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-abstract-ai.png"
            alt="AI Neural Network Background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>

        <div className="container relative z-10">
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="max-w-4xl">
            <motion.div variants={fadeIn} className="mb-6 flex items-center gap-3">
              <div className="h-[1px] w-12 bg-primary" />
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                {POSITIONING_TAGLINE}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-white"
            >
              Is your AI transformation{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                actually working?
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              We prove it — in the P&amp;L and in your people.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/benchmark#waitlist" onClick={() => trackCTAClick("Join waiting list", "Hero Section")}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold transition-all hover:scale-105"
                >
                  Join the benchmark waiting list <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/scorecard" onClick={() => trackCTAClick("Take scorecard", "Hero Section")}>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Take the scorecard (3–4 min)
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ISO Stamp — top right, opens certificate modal */}
        <motion.div
          initial={{ opacity: 0, y: -120, scale: 1.4, rotate: -15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -8 }}
          transition={{ delay: 1.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-24 right-8 z-20 hidden lg:block"
        >
          <button
            onClick={() => setShowIsoCert(true)}
            className="focus:outline-none relative group cursor-pointer"
            title="View ISO 27001 certificate"
          >
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(76,201,240,0.25) 0%, transparent 70%)" }}
            />
            <img
              src="/images/brand-compliance-logo-final.png"
              alt="Brand Compliance Certified"
              className="relative h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </button>
        </motion.div>
      </section>

      {/* Two Doors */}
      <section className="py-28">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <h2 className="text-4xl font-heading font-semibold text-white mb-4">
              One question, two proofs
            </h2>
            <p className="text-muted-foreground text-lg">
              Partners deliver the transformation. We prove whether it works — with independent
              evidence on both sides of the equation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-7">
            <Link
              href="/proof-of-value"
              onClick={() => trackDoorSelected("value")}
              className="block bg-card backdrop-blur-md border border-white/10 rounded-2xl p-10 transition-all hover:-translate-y-1 hover:border-primary group"
            >
              <span className="text-primary text-xs tracking-wider uppercase font-semibold block mb-4">
                Proof of value · CFO &amp; CIO
              </span>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                What is AI delivering in the P&amp;L?
              </h3>
              <p className="text-muted-foreground mb-6">
                ROI, TCO and adoption economics, modelled on your own licence, usage and
                telemetry data. An independent value statement — before the next investment
                decision, or after the last one.
              </p>
              <span className="text-primary font-semibold">Explore proof of value →</span>
            </Link>
            <Link
              href="/proof-of-change"
              onClick={() => trackDoorSelected("change")}
              className="block bg-card backdrop-blur-md border border-white/10 rounded-2xl p-10 transition-all hover:-translate-y-1 hover:border-accent group"
            >
              <span className="text-accent text-xs tracking-wider uppercase font-semibold block mb-4">
                Proof of change · Transformation leaders
              </span>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                Is your workforce actually changing?
              </h3>
              <p className="text-muted-foreground mb-6">
                People science and expert interpretation of your listening data — whatever
                instrument you run. We read the direction of travel and connect it to adoption
                reality.
              </p>
              <span className="text-accent font-semibold">Explore proof of change →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proof Band */}
      <section className="py-20 bg-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {PROOF_STATS.map((stat) => (
              <div key={stat.num}>
                <div className="font-heading text-5xl font-bold text-primary leading-none">
                  {stat.num}
                </div>
                <div className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-11 opacity-75">
            The measurement gap is real. Only independent evidence resolves it.
          </p>
        </div>
      </section>

      {/* Benchmark Prospectus Band */}
      <section className="py-28">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-secondary text-sm tracking-wider uppercase font-semibold block mb-4">
              The benchmark — opens September
            </span>
            <h2 className="text-4xl font-heading font-semibold text-white mb-5">
              How does your AI transformation compare with your peers?
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              Standardised KPIs, process-level measurement, peer comparison across
              organisations — built on the same method we run inside leading enterprises
              today.
            </p>
            <p className="border-l-2 border-secondary pl-5 text-foreground mb-6">
              We run around twelve audits a year. Q3 is full. The waiting list hears first
              when September seats open.
            </p>
            <Link href="/benchmark" className="text-primary font-semibold hover:underline">
              Read the full benchmark prospectus →
            </Link>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* Insights Teaser */}
      <section className="py-28 bg-white/[0.03]">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <h2 className="text-4xl font-heading font-semibold text-white mb-4">Insights</h2>
            <p className="text-muted-foreground text-lg">
              Evidence, not opinions. One observation with a number, every month.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INSIGHT_TEASERS.map((item) => (
              <Link
                key={item.title}
                href="/insights"
                className="block bg-card border border-white/10 rounded-xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="text-accent text-xs tracking-wider uppercase font-semibold block mb-4">
                  {item.category}
                </span>
                <h4 className="font-heading text-lg font-semibold text-white leading-snug mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {showIsoCert && <IsoCertModal onClose={() => setShowIsoCert(false)} />}
    </Layout>
  );
}
