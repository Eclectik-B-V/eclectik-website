import { Link } from "wouter";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";

/**
 * De vier vragen zijn de kern van de pagina. Genummerd in plaats van in
 * kaartjes, zodat ze als een reeks lezen en niet als een dienstenmenu.
 */
const QUESTIONS = [
  {
    title: "What is AI delivering in the P&L today?",
    body: "ROI and TCO modelled on your own licence, usage and telemetry data, with a counterfactual, so the effect is isolated from everything else that moves the business.",
  },
  {
    title: "Where does value concentrate, and why there?",
    body: "Cohort analysis that shows which teams, roles and working patterns convert usage into outcomes, and which do not. Value is never evenly distributed; the distribution is the finding.",
  },
  {
    title: "Is adoption heading the right way?",
    body: "Leading indicators that predict the curve before the lagging numbers arrive, so you steer early instead of explaining late.",
  },
  {
    title: "What should the next wave learn from the last one?",
    body: "An investment case per group, grounded in measured differences in your own organisation rather than vendor benchmarks.",
  },
];

/**
 * De readout is geen losse opdracht maar iets wat elke opdracht afsluit,
 * vandaar dat die over de volle breedte staat en de andere vier niet.
 */
const ENGAGEMENTS: { title: string; body: string; wide?: boolean }[] = [
  {
    title: "Diagnostics and baseline",
    body: "behaviours, sentiment and outcomes before anything changes.",
  },
  {
    title: "Value distribution mapping",
    body: "cohort analysis for where returns concentrate.",
  },
  {
    title: "AI ROI and TCO investment case",
    body: "the numbers your board will actually challenge.",
  },
  {
    title: "Adoption steering",
    body: "measure, interpret, adjust, measure again.",
  },
  {
    title: "Executive readout",
    body: "every engagement ends with a readout your CFO can interrogate.",
    wide: true,
  },
];

export default function Consulting() {
  return (
    <Layout>
      <title>Consulting | Eclectik</title>
      <meta
        name="description"
        content="Advisory on whether your AI transformation is delivering: ROI and TCO on your own data, cohort analysis and adoption steering. We do not sell licences."
      />
      <link rel="canonical" href="https://www.eclectik.co/consulting" />

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Opening: waar we wel en niet staan */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>Consulting</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[780px] text-pretty lg:text-[52px]">
              Advisory that stays on the measurement side.
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[700px]">
              We advise on one question: is your AI transformation delivering, and what should
              change so it does. We do not build rollouts and we do not sell licences. Our advice
              stands on what your own data shows, and on nothing else.
            </p>
          </div>
        </section>

        {/* De vier vragen */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-10 max-w-[680px] text-pretty lg:text-[40px]">
              The questions we answer
            </h2>
            <ol className="grid gap-9 sm:grid-cols-2 md:gap-x-11 md:gap-y-10">
              {QUESTIONS.map((q, i) => (
                <li key={q.title} className="border-t-[3px] border-ec-sky pt-6">
                  <span className="block font-brand font-extrabold text-[13px] tracking-[0.14em] text-ec-sky-ink mb-2.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-brand tracking-normal font-semibold text-[20px] leading-[1.25] mb-3 text-pretty">
                    {q.title}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body max-w-[620px]">{q.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Wat dat in de praktijk is */}
        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-10 max-w-[680px] text-pretty lg:text-[40px]">
              Typical engagements
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 md:gap-x-10">
              {ENGAGEMENTS.map((e) => (
                <li
                  key={e.title}
                  className={`border-l-[3px] border-ec-teal-ink pl-5 text-[16px] leading-[1.6] text-ec-body${
                    e.wide ? " sm:col-span-2" : ""
                  }`}
                >
                  <span className="font-semibold text-ec-navy">{e.title}:</span> {e.body}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* De grens, en meteen de uitnodiging. Geen kaartje: dit is het punt
            waar de pagina het scherpst is, dus staat het vol in het donker. */}
        <section className={`bg-ec-navy ${SECTION}`}>
          <div className={`${INNER} max-w-[820px]`}>
            <h2 className="font-brand tracking-normal font-extrabold text-[26px] leading-[1.1] text-ec-on-dark mb-6 text-pretty lg:text-[34px]">
              What we do not do
            </h2>
            <p className="text-[17px] leading-[1.65] text-ec-on-dark-muted mb-6 max-w-[680px]">
              We do not implement platforms, run change programmes or resell licences.
            </p>
            <p className="font-brand tracking-normal font-semibold text-[21px] leading-[1.35] text-white max-w-[680px] text-pretty lg:text-[26px]">
              Partners deliver the transformation; we prove whether it works and show where to
              steer.
            </p>
            <div className="mt-10 pt-9 border-t border-ec-navy-line-2">
              <Link
                href="/contact"
                onClick={() => trackCTAClick("Talk to us about your measurement question", "consulting")}
                className="rounded-full font-bold bg-ec-sky text-ec-navy inline-block px-[30px] py-4 text-[16px] leading-[1.3] text-center text-balance transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
              >
                Talk to us about your measurement question →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
