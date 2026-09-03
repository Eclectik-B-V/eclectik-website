import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";

const PHASES = [
  {
    step: "Before you press send",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    body: "Population and segmentation logic, demographic structure, technical configuration, reminder planning and governance. One structured validation pass removes most of what goes wrong later.",
  },
  {
    step: "While it runs",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "We watch response progress and participation dynamics with you, and advise on steering actions while there is still time to steer. Not a report afterwards.",
  },
  {
    step: "After the results",
    accent: "border-ec-red",
    ink: "text-ec-red",
    body: "Manager dashboards people actually open, action tracking that survives the second month, and reporting that ties sentiment back to the outcomes your board asked about.",
  },
];

export default function GlintSupport() {
  return (
    <Layout>
      <Helmet>
        <title>Glint Support | Eclectik</title>
        <meta
          name="description"
          content="Independent Customer Success and People Science for organisations running Viva Glint. Survey and cycle design, manager enablement, and turning results into movement."
        />
      </Helmet>

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Opening: the problem the reader already has */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>Glint Support</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[760px] text-pretty lg:text-[52px]">
              The results are in. That is when the hard part starts.
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[680px]">
              Your challenge was never finding out what needs attention. Glint tells you that.
              The challenge is getting leaders to act on it, in the weeks before the findings
              go quiet and the next cycle comes round.
            </p>
          </div>
        </section>

        {/* Why it usually stalls */}
        <section className={`bg-ec-navy ${SECTION}`}>
          <div className={`${INNER} max-w-[820px]`}>
            <h2 className="font-brand tracking-normal font-extrabold text-[26px] leading-[1.2] text-ec-on-dark mb-5 text-pretty lg:text-[34px]">
              Standard programmes focus on structure and communication. Behaviour does not
              travel that way.
            </h2>
            <p className="text-[17px] leading-[1.65] text-ec-on-dark-muted">
              Plans are announced, dashboards are shared, and the organisation waits. Real change
              spreads person to person, not top down. Progress starts when leaders stop trying to
              manage change and start designing how it spreads.
            </p>
          </div>
        </section>

        {/* What we actually do */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[640px] mb-10">
              <p className={EYEBROW}>What we do on Glint</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Three moments where a cycle is won or lost
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                Survey and cycle design, manager enablement, and managed reporting. The same team
                throughout, so nothing is handed over at the point it matters.
              </p>
            </div>
            <div className="grid gap-7 md:grid-cols-3 md:gap-10">
              {PHASES.map((p) => (
                <div key={p.step} className={`border-t-[3px] ${p.accent} pt-7`}>
                  <h3
                    className={`font-brand tracking-normal font-semibold text-[20px] mb-3 ${p.ink}`}
                  >
                    {p.step}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The method */}
        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={`${INNER} grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:items-center`}>
            <div>
              <p className={EYEBROW}>Infectious Change</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-4 text-pretty lg:text-[36px]">
                People follow people. Not plans.
              </h2>
              <p className="text-[16px] leading-[1.65] text-ec-body mb-4">
                We pinpoint the cultural signals, the influencers and the habits that decide whether
                a finding turns into a movement or a slide. Then we equip the few who move the many.
              </p>
              <p className="text-[16px] leading-[1.65] text-ec-body">
                It is behavioural science applied to your own listening data, which is a different
                thing from a change programme bolted on beside it.
              </p>
            </div>
            <ul className="space-y-3 text-[15px] leading-[1.6] text-ec-body-strong">
              <li className="border-l-[3px] border-ec-teal-ink pl-4">
                Emotional ownership instead of announcements
              </li>
              <li className="border-l-[3px] border-ec-teal-ink pl-4">
                Social modelling by the managers people already watch
              </li>
              <li className="border-l-[3px] border-ec-teal-ink pl-4">
                Well-timed influence, while the results are still warm
              </li>
            </ul>
          </div>
        </section>

        {/* Close */}
        <section className={`bg-ec-navy text-center px-6 py-16 lg:px-16 lg:py-[88px]`}>
          <h2 className="font-brand tracking-normal font-extrabold text-[28px] text-white mb-4 text-pretty lg:text-[42px]">
            Your next cycle is already close.
          </h2>
          <p className="text-[17px] text-ec-on-dark-caption mb-7 max-w-[560px] mx-auto">
            Tell us where you are in it, and we will tell you honestly whether we can help before
            it launches or whether it is better to start with the one after.
          </p>
          <Link
            href="/contact"
            onClick={() => trackCTAClick("Talk to us", "glint-support")}
            className="rounded-full font-bold bg-ec-sky text-ec-navy inline-block px-[34px] py-4 text-[16px] transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            Talk to us
          </Link>
        </section>
      </div>
    </Layout>
  );
}
