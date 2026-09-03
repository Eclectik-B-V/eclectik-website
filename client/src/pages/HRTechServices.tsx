import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";

const DISCIPLINES = [
  {
    name: "Customer Success",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    body: "Getting the platform used, and used well. Cycle design, configuration that holds up, manager enablement, and reporting that ties sentiment back to the outcomes the board asked about.",
  },
  {
    name: "People Science",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "Reading what the data is actually saying. Survey science, behavioural science and the judgement to separate a real signal from a seasonal wobble, whatever instrument produced it.",
  },
];

export default function HRTechServices() {
  return (
    <Layout>
      <Helmet>
        <title>HR Tech Services | Eclectik</title>
        <meta
          name="description"
          content="Independent Customer Success and People Science for organisations running Viva Glint or Workvivo Seer. We did not sell you the platform and we do not resell it."
        />
      </Helmet>

      <div className="bg-white text-ec-navy font-brand font-light">
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>HR Tech Services</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[820px] text-pretty lg:text-[52px]">
              Independent support for the platform you already run.
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[700px]">
              We run Customer Success and People Science for organisations on Viva Glint and on
              Workvivo Seer. We did not sell you the licence and we do not resell it, so we have
              nothing to protect when the honest advice is to change course.
            </p>
          </div>
        </section>

        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[640px] mb-10">
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Two disciplines, one team
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                Most organisations buy the platform and then discover the work sits somewhere
                between IT, HR and the vendor. This is that work.
              </p>
            </div>
            <div className="grid gap-7 md:grid-cols-2 md:gap-11">
              {DISCIPLINES.map((d) => (
                <div key={d.name} className={`border-t-[3px] ${d.accent} pt-7`}>
                  <h3
                    className={`font-brand tracking-normal font-semibold text-[22px] mb-3 ${d.ink}`}
                  >
                    {d.name}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body">{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[640px] mb-10">
              <p className={EYEBROW}>Which platform do you run?</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] text-pretty lg:text-[40px]">
                Pick your lane
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white border border-ec-line-3 rounded-2xl p-8 flex flex-col">
                <h3 className="font-brand tracking-normal font-bold text-[24px] mb-3">
                  Glint Support
                </h3>
                <p className="text-[15px] leading-[1.65] text-ec-body mb-6">
                  Survey and cycle design, manager enablement and managed reporting on Viva Glint,
                  plus the harder part: turning the results into something that actually moves.
                </p>
                <Link
                  href="/glint-support"
                  onClick={() => trackCTAClick("Go to Glint Support", "hrtechservices")}
                  className="mt-auto self-start rounded-full font-bold bg-ec-sky text-ec-navy px-7 py-3.5 text-[15px] transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
                >
                  Go to Glint Support →
                </Link>
              </div>

              <div className="bg-white border border-ec-line-3 rounded-2xl p-8 flex flex-col">
                <h3 className="font-brand tracking-normal font-bold text-[24px] mb-3">
                  Seer Support
                </h3>
                <p className="text-[15px] leading-[1.65] text-ec-body mb-6">
                  Implementation, migration and analytics on Workvivo Seer, for teams moving across
                  or getting more out of the listening data they already collect. We are writing this
                  one up; in the meantime, ask us directly.
                </p>
                <Link
                  href="/contact"
                  onClick={() => trackCTAClick("Ask about Seer", "hrtechservices")}
                  className="mt-auto self-start rounded-full font-bold bg-ec-teal-ink text-white px-7 py-3.5 text-[15px] transition-colors hover:bg-[#276e67] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
                >
                  Ask about Seer →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ec-navy text-center px-6 py-16 lg:px-16 lg:py-[88px]">
          <h2 className="font-brand tracking-normal font-extrabold text-[28px] text-white mb-4 text-pretty lg:text-[42px]">
            Running something else entirely?
          </h2>
          <p className="text-[17px] text-ec-on-dark-caption mb-7 max-w-[560px] mx-auto">
            The method does not depend on the instrument. Tell us what you run and we will tell you
            whether we are useful to you.
          </p>
          <Link
            href="/contact"
            onClick={() => trackCTAClick("Talk to us", "hrtechservices")}
            className="rounded-full font-bold bg-ec-sky text-ec-navy inline-block px-[34px] py-4 text-[16px] transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            Talk to us
          </Link>
        </section>
      </div>
    </Layout>
  );
}
