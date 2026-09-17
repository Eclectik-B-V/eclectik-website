import { Link } from "wouter";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";

/**
 * De vijf stappen zijn een echte volgorde, dus krijgen ze een genummerde rail.
 * De aangeleverde alinea blijft er onverkort en ongewijzigd boven staan; deze
 * labels zijn letterlijk de stapnamen uit die zin, alleen ingekort tot een
 * label. Er staat hier dus geen zin die niet in de brontekst voorkomt.
 */
const SEQUENCE = [
  "Data feasibility check",
  "Privacy sign-off",
  "Digital signals analytics",
  "Econometric modelling",
  "Financial modelling",
];

/**
 * Twee namen, bewust. Er zijn geen portretfoto's, dus de naam zelf draagt het
 * blok en de rol staat in de accentkleur eronder.
 */
const PEOPLE = [
  {
    name: "Manish Goel",
    role: "Senior Advisor, AI Insights & Impact",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    body: "Former Senior Partner at Korn Ferry (Workplace Analytics), co-founder and CEO of TrustSphere (applied network analytics), and PwC Consulting (strategic change, financial services).",
  },
  {
    name: "Marco van Gelder",
    role: "Chief Strategy & Innovation Officer",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "Researcher at Tilburg University (workplace innovation), former global lead Viva Insights at Veldhoen + Company, strategic advisor to the CHRO of KPN, co-founder of TimeGrip.",
  },
];

/**
 * Dezelfde drie beloften als op de homepage, met dezelfde accentkleuren, zodat
 * de positionering over de pagina's heen als één ding leest. De aangeleverde
 * alinea is precies op de dubbele punten gesplitst; verder is er niets aan
 * veranderd.
 */
const COMMITMENTS = [
  {
    label: "Agnostic",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    body: "We do not sell what we measure, and no licence revenue rides on the answer.",
  },
  {
    label: "Independent",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "We did not build your rollout, so there is nothing for us to defend when the numbers disappoint.",
  },
  {
    label: "Scientific",
    accent: "border-ec-red",
    ink: "text-ec-red",
    body: "The method is fixed before the result.",
  },
];

export default function AboutUs() {
  return (
    <Layout>
      <title>About us | Eclectik</title>
      <meta
        name="description"
        content="Eclectik is an independent AI transformation measurement specialist. The people behind the number, the fixed sequence we work in, and what we commit to."
      />
      <link rel="canonical" href="https://www.eclectik.co/about" />

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Opening: wie er achter het getal staat */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>About us</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[780px] text-pretty lg:text-[52px]">
              The people behind the number.
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[700px]">
              Eclectik is an independent AI transformation measurement specialist. We answer one
              question for organisations investing in AI: is it working, in the P&amp;L and in how
              people actually do their work. Partners deliver the transformation; we prove whether
              it works.
            </p>
          </div>
        </section>

        {/* De methode, met de volgorde zichtbaar gemaakt */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-6 max-w-[680px] text-pretty lg:text-[40px]">
              How we work
            </h2>
            <p className="text-[17px] leading-[1.65] text-ec-body max-w-[720px]">
              Every engagement follows the same fixed sequence: a data feasibility check, privacy
              sign-off, digital signals analytics on your own telemetry, econometric modelling with
              counterfactual estimation, and financial modelling that turns effect into money. The
              method is fixed before the result. Cohorts are named in advance, one outcome
              definition holds throughout, and if a finding would not survive review, we do not
              claim it.
            </p>
            <ol className="mt-11 grid gap-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
              {SEQUENCE.map((step, i) => (
                <li key={step} className="border-t-[3px] border-ec-sky pt-5">
                  <span className="block font-brand font-extrabold text-[13px] tracking-[0.14em] text-ec-sky-ink mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block font-brand tracking-normal font-semibold text-[16px] leading-[1.3] text-pretty">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* De twee namen, en het team eromheen */}
        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-10 max-w-[680px] text-pretty lg:text-[40px]">
              Who we are
            </h2>
            <div className="grid gap-9 md:grid-cols-2 md:gap-x-11">
              {PEOPLE.map((p) => (
                <div key={p.name} className={`border-t-[3px] ${p.accent} pt-6`}>
                  <h3 className="font-brand tracking-normal font-extrabold text-[22px] leading-[1.2] mb-1.5 text-pretty lg:text-[26px]">
                    {p.name}
                  </h3>
                  <p
                    className={`text-[13px] tracking-[0.12em] uppercase font-bold mb-4 ${p.ink} text-pretty`}
                  >
                    {p.role}
                  </p>
                  <p className="text-[15px] leading-[1.65] text-ec-body">{p.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-11 border-l-[3px] border-ec-red pl-6 max-w-[720px] text-[16px] leading-[1.65] text-ec-body-strong">
              Around them works a cross-disciplinary, global team: AI strategists, HR and workforce
              consultants, data scientists, economists and technologists, working across all AI
              platforms.
            </p>
          </div>
        </section>

        {/* De drie beloften, elk met eigen gewicht */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-10 max-w-[680px] text-pretty lg:text-[40px]">
              Our commitments
            </h2>
            <div className="grid gap-8 md:grid-cols-3 md:gap-10">
              {COMMITMENTS.map((c) => (
                <div key={c.label} className={`border-t-[3px] ${c.accent} pt-7`}>
                  <p
                    className={`font-brand tracking-normal font-extrabold text-[24px] leading-[1.1] mb-3.5 ${c.ink} lg:text-[28px]`}
                  >
                    {c.label}
                  </p>
                  <p className="text-[16px] leading-[1.6] text-ec-body">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waar we mee samenwerken */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-5 max-w-[680px] text-pretty lg:text-[40px]">
              Partnerships
            </h2>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[720px]">
              Microsoft partner (UK, CH, NL, US and beyond), with joint engagements alongside our
              consulting partners.
            </p>
          </div>
        </section>

        {/* Afsluiting */}
        <section className="bg-ec-navy text-center px-6 py-16 lg:px-16 lg:py-[88px]">
          <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.1] text-white mb-7 max-w-[720px] mx-auto text-pretty lg:text-[42px]">
            Wondering whether your transformation would survive measurement?
          </h2>
          <Link
            href="/contact"
            onClick={() => trackCTAClick("Talk to us", "about")}
            className="rounded-full font-bold bg-ec-sky text-ec-navy inline-block px-[34px] py-4 text-[16px] leading-[1.3] transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            Talk to us →
          </Link>
        </section>
      </div>
    </Layout>
  );
}
