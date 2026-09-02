import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { trackCTAClick, trackDoorSelected } from "@/lib/tracking";
import { POSITIONING_TAGLINE, POSITIONING_TAGLINE_SHORT } from "@shared/const";

const SECTION_PAD = "px-6 py-14 lg:px-16 lg:py-[56px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW =
  "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";
const PILL =
  "rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Hero background video. Autoplays muted and loops, but some encodings stall on
 * the final frame instead of looping, so a watchdog rewinds it. Paused entirely
 * when the visitor asks for reduced motion.
 */
function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      video.pause();
      return;
    }

    const keepPlaying = () => {
      if (video.duration && isFinite(video.duration) && video.currentTime >= video.duration - 0.05) {
        video.currentTime = 0;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    const rewind = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener("ended", rewind);
    const timer = window.setInterval(keepPlaying, 500);
    keepPlaying();

    return () => {
      video.removeEventListener("ended", rewind);
      window.clearInterval(timer);
    };
  }, []);

  // Grayscale is baked into the asset, so no CSS filter is needed here.
  return (
    <video
      ref={ref}
      src="/videos/eclectik-hero.mp4"
      poster="/videos/eclectik-hero-poster.jpg"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

/** The brand "bars" motif: three stacked rounded bars in descending width. */
function Bars({
  widths,
  height,
  colours = ["bg-ec-sky", "bg-ec-teal", "bg-ec-yellow"],
}: {
  widths: [number, number, number];
  height: number;
  colours?: [string, string, string];
}) {
  return (
    <div className="flex flex-col gap-1.5 flex-none" aria-hidden="true">
      {widths.map((width, i) => (
        <span
          key={i}
          className={`${colours[i]} rounded-[3px] block`}
          style={{ width, height }}
        />
      ))}
    </div>
  );
}

const STATS = [
  { figure: "3×", caption: "Leaders underestimate employee AI use (McKinsey)" },
  { figure: "57%", caption: "of employees hide their AI use from their employer (KPMG, n=48k)" },
  { figure: "12%", caption: "of CEOs can show AI delivered both cost and revenue benefit (PwC)" },
  { figure: "42%", caption: "of AI initiatives are abandoned before value (S&P Global)" },
];

const PRINCIPLES = [
  {
    label: "Agnostic",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    title: "We do not sell what we measure.",
    body: "Copilot, Viva Glint, Workvivo Seer or something you built yourself: the method does not change, and no licence revenue rides on the answer.",
  },
  {
    label: "Independent",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    title: "We did not build your rollout.",
    body: "So there is nothing for us to defend when the numbers disappoint. The finding that runs against the plan is the one worth paying for.",
  },
  {
    label: "Scientific",
    accent: "border-ec-red",
    ink: "text-ec-red",
    title: "The method is fixed before the result.",
    body: "Cohorts named in advance, one stable outcome definition, an estimator chosen up front. If it would not survive review, we do not claim it.",
  },
];

const INSIGHTS = [
  {
    category: "Evidence",
    title: "The measurement gap: why self-reported AI ROI misleads",
    body: "74% report positive ROI among those who measure. The broader sample shows no EBIT impact. Both are true, and that is the problem.",
  },
  {
    category: "Change",
    title: "Shadow AI: what 57% of your workforce isn’t telling you",
    body: "Employees use AI three times more than leadership thinks, and more than half hide it.",
  },
  {
    category: "Value",
    title: "Works councils and AI adoption: the European wedge",
    body: "Independent adoption evidence is co-determination currency. Here is why that matters for your rollout.",
  },
];

export default function Home() {
  // Scroll-snap staat op het html-element, dus alleen zolang deze pagina leeft.
  useEffect(() => {
    document.documentElement.classList.add("snap-sections");
    return () => document.documentElement.classList.remove("snap-sections");
  }, []);

  return (
    <div className="relative bg-white text-ec-navy font-brand font-light">
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
              "Eclectik is an independent AI transformation assurance firm. We prove whether AI transformation delivers value in the P&L and change in the workforce.",
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
            name: "Eclectik AI Transformation Assurance",
            image: "https://www.eclectik.co/images/eclectik-logo-dark.svg",
            description:
              "Independent assurance on AI transformation: proof of value in the P&L and proof of change in the workforce.",
            url: "https://www.eclectik.co",
            serviceType: [
              "AI Transformation Assurance",
              "AI Value Measurement",
              "Workplace Analytics",
              "Change Management",
              "AI Training & Enablement",
            ],
          })}
        </script>
      </Helmet>

      <SiteHeader variant="overlay" />

      {/* HERO */}
      <section className="relative bg-ec-navy text-ec-on-dark overflow-hidden flex min-h-[520px] items-end lg:items-center lg:min-h-[560px] lg:h-[min(56.25vw,80vh)]">
        <HeroVideo />
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,15,31,.45) 0%, rgba(10,15,31,.85) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,15,31,.5) 0%, rgba(10,15,31,.72) 100%)",
          }}
        />

        <div className={`relative ${INNER} w-full px-6 pb-11 lg:px-16 lg:pb-0 lg:text-center shell:pt-[110px]`}>
          <div className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-[0.14em] uppercase text-ec-on-dark-eyebrow border border-ec-navy-line px-4 py-2 rounded-full mb-7">
            <span className="w-[22px] h-px bg-ec-sky" aria-hidden="true" />
            <span className="lg:hidden">{POSITIONING_TAGLINE_SHORT}</span>
            <span className="hidden lg:inline">{POSITIONING_TAGLINE}</span>
          </div>
          <h1 className="font-brand font-extrabold text-[40px] leading-[1.04] tracking-[-0.02em] mb-6 max-w-[820px] lg:text-[68px] lg:leading-[1.02] lg:mx-auto text-pretty">
            Is your AI transformation <span className="text-ec-yellow">actually working?</span>
          </h1>
          <p className="text-[19px] leading-[1.55] text-ec-on-dark-muted max-w-[600px] mb-9 lg:text-[21px] lg:mx-auto">
            We prove it. In the P&amp;L, and in your people.
          </p>

          {/* Desktop keeps its CTAs in the nav; mobile needs them here. */}
          <div className="flex flex-col gap-2.5 md:hidden">
            <Link
              href="/benchmark"
              onClick={() => trackCTAClick("Join the benchmark waiting list", "hero")}
              className={`${PILL} bg-ec-sky text-ec-navy text-center px-6 py-4 focus-visible:outline-ec-sky`}
            >
              Join the benchmark waiting list
            </Link>
            <Link
              href="/hrtechservices"
              onClick={() => trackCTAClick("Glint or Seer support", "hero")}
              className={`${PILL} border border-ec-navy-line-2 text-ec-on-dark text-center px-6 py-4 focus-visible:outline-ec-sky`}
            >
              Glint or Seer support?
            </Link>
          </div>
        </div>
      </section>

      {/* SPECIALIST STATEMENT */}
      <section className="bg-ec-yellow px-6 py-12 lg:px-16 lg:py-[56px]">
        <div className={`${INNER} flex items-start gap-5 lg:gap-7`}>
          <div className="pt-2 lg:pt-3">
            <Bars
              widths={[44, 24, 12]}
              height={5}
              colours={["bg-ec-navy", "bg-ec-teal-ink", "bg-ec-red"]}
            />
          </div>
          <p className="font-semibold text-[22px] leading-[1.28] text-ec-navy max-w-[760px] text-pretty lg:text-[clamp(24px,2.6vw,32px)]">
            Proving dollar-value ROI on AI transformation takes rare expertise.{" "}
            <span className="text-ec-red">That is what we specialize in.</span>
          </p>
        </div>
      </section>

      {/* TWO DOORS */}
      <section id="proof" className="snap-point bg-white px-6 py-14 lg:px-16 lg:py-[56px]">
        <div className={INNER}>
          <div className="max-w-[640px] mb-8 lg:mb-[32px]">
            <p className={EYEBROW}>One question, two proofs</p>
            <h2 className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mb-3.5 text-pretty lg:text-[40px] lg:leading-[1.05]">
              Independent evidence, on both sides
            </h2>
            <p className="text-[17px] leading-[1.6] text-ec-body">
              Partners deliver it. We prove whether it works.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 md:gap-11">
            <div className="border-t-[3px] border-ec-sky pt-7">
              <p className="text-[12px] tracking-[0.12em] uppercase font-bold text-ec-sky-ink mb-3.5">
                Proof of value · CFO &amp; CIO
              </p>
              <h3 className="font-brand tracking-normal font-semibold text-[21px] mb-3 lg:text-[24px]">
                What is AI delivering in the P&amp;L?
              </h3>
              <p className="text-[15px] leading-[1.65] text-ec-body mb-5">
                ROI, TCO and adoption economics, modelled on your own licence, usage and telemetry
                data. An independent value statement, before the next investment decision or after
                the last one.
              </p>
              <Link
                href="/proof-of-value"
                onClick={() => trackDoorSelected("value")}
                className="font-semibold text-ec-sky-ink hover:text-ec-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
              >
                Explore proof of value →
              </Link>
            </div>

            <div className="border-t-[3px] border-ec-teal pt-7">
              <p className="text-[12px] tracking-[0.12em] uppercase font-bold text-ec-teal-ink mb-3.5">
                Proof of change · Transformation leaders
              </p>
              <h3 className="font-brand tracking-normal font-semibold text-[21px] mb-3 lg:text-[24px]">
                Is your workforce actually changing?
              </h3>
              <p className="text-[15px] leading-[1.65] text-ec-body mb-5">
                People science and expert reading of your listening data, whatever instrument you
                run. We read where things are heading and tie it back to real adoption.
              </p>
              <Link
                href="/proof-of-change"
                onClick={() => trackDoorSelected("change")}
                className="font-semibold text-ec-teal-ink hover:text-ec-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
              >
                Explore proof of change →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF BAND */}
      <section
        className="snap-point relative overflow-hidden text-ec-on-dark px-6 py-14 lg:px-16 lg:py-[60px]"
        style={{
          background: "radial-gradient(120% 100% at 80% 0%, #14204A 0%, #19273d 60%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(50% 55% at 20% 30%, rgba(83,172,162,.18), transparent 70%)",
          }}
        />
        <div className={`relative ${INNER}`}>
          <h2 className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mb-10 text-pretty lg:text-[48px] lg:leading-none lg:mb-12 lg:whitespace-nowrap">
            The measurement gap is real
          </h2>
          <div className="grid grid-cols-2 gap-x-[18px] gap-y-[26px] lg:grid-cols-4 lg:gap-8">
            {STATS.map((stat) => (
              <div key={stat.figure}>
                <div className="font-bold text-[40px] leading-none text-ec-sky lg:text-[56px]">
                  {stat.figure}
                </div>
                <p className="text-[15px] leading-[1.5] text-ec-on-dark-caption mt-3 lg:text-[16px] lg:leading-[1.55]">
                  {stat.caption}
                </p>
              </div>
            ))}
          </div>
          <p className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mt-10 text-pretty lg:text-[48px] lg:leading-none lg:mt-10">
            Only independent evidence resolves it.
          </p>
        </div>
      </section>

      {/* YELLOW BAND */}
      <section className="bg-ec-yellow px-6 py-12 lg:px-16 lg:py-[60px]">
        <div className={INNER}>
          <p className="font-extrabold text-[24px] leading-[1.15] text-ec-navy max-w-[760px] text-pretty lg:text-[clamp(26px,3vw,34px)] lg:leading-[1.1]">
            Partners deliver the transformation. We prove whether it works.
          </p>
        </div>
      </section>

      {/* BENCHMARK */}
      <section id="benchmark" className={`snap-point bg-white ${SECTION_PAD}`}>
        <div className={`${INNER} grid gap-10 items-center lg:grid-cols-[1.25fr_0.75fr] lg:gap-14`}>
          <div>
            <p className={EYEBROW}>The benchmark, opens September</p>
            <h2 className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mb-4 text-pretty lg:text-[44px] lg:leading-[1.03]">
              How does your AI transformation compare with your peers?
            </h2>
            <p className="text-[16px] leading-[1.65] text-ec-body mb-5">
              Standardised KPIs, process-level measurement and peer comparison across
              organisations, built on the same method we run inside leading enterprises today.
            </p>
            <p className="border-l-[3px] border-ec-red pl-[18px] text-[16px] leading-[1.6] text-ec-body-strong mb-6">
              We run about twelve audits a year and Q3 is full. The waiting list hears first when
              September seats open.
            </p>
            <Link
              href="/benchmark"
              onClick={() => trackCTAClick("Read the full benchmark prospectus", "benchmark")}
              className="font-semibold text-ec-red hover:text-ec-red-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
            >
              Read the full benchmark prospectus →
            </Link>
          </div>
          <img
            src="/images/benchmark/benchmark-visual.jpg"
            alt="Standardised charts and tables on a printed sheet, seen through a magnifying glass"
            loading="lazy"
            width={1000}
            height={1000}
            className="w-full h-[200px] object-cover rounded-[14px] lg:h-[340px] lg:rounded-2xl"
          />
        </div>
      </section>

      {/* INSIGHTS */}
      <section className={`bg-ec-cream ${SECTION_PAD}`}>
        <div className={INNER}>
          <div className="max-w-[640px] mb-8 lg:mb-[28px]">
            <h2 className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mb-3 lg:text-[50px] lg:leading-none">
              Evidence, not opinions.
            </h2>
            <p className="text-[17px] leading-[1.6] text-ec-body">
              One observation with a number, every month.
            </p>
          </div>
          <div className="grid gap-[22px] md:grid-cols-3">
            {INSIGHTS.map((insight) => (
              <Link
                key={insight.title}
                href="/insights"
                className="bg-white border border-ec-line-2 rounded-[14px] p-[30px] block transition-shadow hover:shadow-[0_4px_14px_rgba(18,21,28,.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
              >
                <p className="text-[12px] tracking-[0.12em] uppercase font-bold text-ec-teal-ink mb-4">
                  {insight.category}
                </p>
                <h3 className="font-brand tracking-normal font-semibold text-[18px] leading-[1.3] text-ec-navy mb-3">
                  {insight.title}
                </h3>
                <p className="text-sm leading-[1.6] text-ec-body">{insight.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className={`bg-white ${SECTION_PAD}`}>
        <div className={INNER}>
          <div className="max-w-[640px] mb-10 lg:mb-[32px]">
            <p className={EYEBROW}>Why the answer holds</p>
            <h2 className="font-brand tracking-normal font-extrabold text-[30px] leading-[1.06] mb-3.5 text-pretty lg:text-[40px] lg:leading-[1.05]">
              Agnostic. Independent. Scientific.
            </h2>
            <p className="text-[17px] leading-[1.6] text-ec-body">
              Three commitments that decide whether a number survives being challenged.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3 md:gap-11">
            {PRINCIPLES.map((p) => (
              <div key={p.label} className={`border-t-[3px] ${p.accent} pt-7`}>
                <p
                  className={`text-[12px] tracking-[0.12em] uppercase font-bold mb-3.5 ${p.ink}`}
                >
                  {p.label}
                </p>
                <h3 className="font-brand tracking-normal font-semibold text-[21px] mb-3 lg:text-[24px]">
                  {p.title}
                </h3>
                <p className="text-[15px] leading-[1.65] text-ec-body">{p.body}</p>
              </div>
            ))}
          </div>

          <p className="text-[17px] leading-[1.6] text-ec-body mt-10">
            Wondering whether that holds in your organisation?{" "}
            <Link
              href="/contact"
              onClick={() => trackCTAClick("Talk to us", "principles")}
              className="font-semibold text-ec-red hover:text-ec-red-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
            >
              Talk to us →
            </Link>
          </p>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-ec-navy text-center px-6 py-16 lg:px-16 lg:py-[88px]">
        <h2 className="font-brand tracking-normal font-extrabold text-[28px] text-white mb-4 text-pretty lg:text-[50px]">
          Is your AI transformation actually working?
        </h2>
        <p className="text-[16px] text-ec-on-dark-caption mb-7 lg:text-[18px]">
          Join the benchmark waiting list. September seats open to the list first.
        </p>
        <Link
          href="/benchmark"
          onClick={() => trackCTAClick("Join the benchmark waiting list", "closing-cta")}
          className={`${PILL} bg-ec-sky text-ec-navy inline-block px-[34px] py-4 text-[16px] hover:bg-[#54b4cb] focus-visible:outline-ec-sky`}
        >
          Join the benchmark waiting list
        </Link>
      </section>

      {/* Space for the sticky mobile bar so it never covers the footer */}
      <div className="pb-[76px] md:pb-0">
        <SiteFooter />
      </div>

      {/* Sticky mobile CTA bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-[38] md:hidden bg-white/95 backdrop-blur-[8px] border-t border-ec-line px-5 pt-3"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-2.5">
          <Link
            href="/benchmark"
            onClick={() => trackCTAClick("Waiting list", "sticky-bar")}
            className={`${PILL} bg-ec-sky text-ec-navy flex-1 text-center py-3 text-sm focus-visible:outline-ec-navy`}
          >
            Waiting list
          </Link>
          <Link
            href="/scorecard"
            onClick={() => trackCTAClick("Scorecard", "sticky-bar")}
            className={`${PILL} bg-ec-yellow text-ec-navy flex-1 text-center py-3 text-sm focus-visible:outline-ec-navy`}
          >
            Scorecard
          </Link>
        </div>
      </div>
    </div>
  );
}
