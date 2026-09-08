import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";
const EYEBROW_DARK =
  "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-on-dark-eyebrow mb-3.5";

// The two halves of the platform, and why each one matters before measurement
// is even possible.
const PLATFORM = [
  {
    name: "Why Workvivo",
    accent: "border-ec-sky-ink",
    ink: "text-ec-sky-ink",
    body: "Most employee platforms reach the people who already sit behind a screen. Workvivo, part of Zoom, is built for frontline and deskless workers, the part of the workforce internal communication usually misses. That reach is the foundation. You cannot measure impact on people you never reached.",
  },
  {
    name: "Why Seer",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "Seer is Workvivo's people intelligence platform, built by the people science leadership behind Glint. It goes past listening and surfaces execution gaps: the distance between feedback given and change seen. Knowing where a programme stalls is a different capability from collecting scores.",
  },
];

const SERVICES = [
  {
    title: "Adoption and activation measurement",
    body: "Who is actually reached and activated on Workvivo, segment by segment, frontline included. Reach reported as reach, not as licences issued.",
  },
  {
    title: "Communication impact analysis",
    body: "Which messages land and which do not, and what that means for engagement and behaviour. The answer is usually narrower than the send list suggests.",
  },
  {
    title: "Seer-certified survey onboarding and programme design",
    body: "Listening programmes on Seer designed to drive action rather than collect scores. What to measure, when to listen, and how you will respond, settled before the instrument is configured.",
  },
  {
    title: "Execution gap assessment",
    body: "Four to six weeks. We establish whether the gap is real in your organisation, quantify what closing it is worth, and turn that into a business case a CFO can read without a translator.",
    lead: true,
  },
];

export default function WorkvivoSeer() {
  return (
    <Layout>
      <Helmet>
        <title>Workvivo and Seer | Eclectik</title>
        <meta
          name="description"
          content="Eclectik is a Workvivo and Seer partner for organisations that want their employee experience investment to show up in the numbers. Adoption measurement, communication impact analysis, listening programme design and a four to six week execution gap assessment."
        />
        <link rel="canonical" href="https://www.eclectik.co/workvivo" />
      </Helmet>

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Hero */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>Workvivo and Seer partner</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[780px] text-pretty lg:text-[52px]">
              Feedback given. No change seen. We close that gap.
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[700px] mb-8">
              Eclectik is a Workvivo and Seer partner for organisations that want their employee
              experience investment to show up in the numbers. We measure what reaches people, what
              they do with it, and what it is worth.
            </p>
            <Link
              href="/contact"
              onClick={() => trackCTAClick("Book an execution gap assessment", "workvivo-hero")}
              className="rounded-full font-bold bg-ec-navy text-white inline-block px-[30px] py-4 text-[16px] transition-colors hover:bg-[#26365a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
            >
              Book an execution gap assessment
            </Link>
          </div>
        </section>

        {/* The execution gap, in the two numbers the page turns on */}
        <section className={`bg-ec-navy ${SECTION}`}>
          <div className={`${INNER} max-w-[860px]`}>
            <p className={EYEBROW_DARK}>The execution gap</p>
            <h2 className="font-brand tracking-normal font-extrabold text-[26px] leading-[1.2] text-ec-on-dark mb-8 text-pretty lg:text-[34px]">
              The industry does not have a listening problem. It has an execution problem.
            </h2>

            <div className="grid gap-9 lg:grid-cols-2 lg:gap-12 lg:items-start">
              <div className="flex gap-9 sm:gap-12">
                <div>
                  <p className="font-brand font-extrabold text-[48px] leading-none text-ec-sky tabular-nums lg:text-[64px]">
                    62%
                  </p>
                  <p className="text-[15px] leading-[1.5] text-ec-on-dark-muted mt-3 max-w-[180px]">
                    feel comfortable giving feedback
                  </p>
                </div>
                <div>
                  <p className="font-brand font-extrabold text-[48px] leading-none text-ec-red tabular-nums lg:text-[64px]">
                    49%
                  </p>
                  <p className="text-[15px] leading-[1.5] text-ec-on-dark-muted mt-3 max-w-[180px]">
                    see meaningful change follow
                  </p>
                </div>
              </div>
              <div className="border-l-[3px] border-ec-yellow pl-5">
                <p className="text-[16px] leading-[1.6] text-ec-on-dark">
                  The distance between those two numbers is the gap. Workvivo reports it from their
                  own Seer research. Every organisation we have worked in has a version of it, and
                  almost none of them can say how large theirs is.
                </p>
              </div>
            </div>

            <p className="text-[17px] leading-[1.65] text-ec-on-dark-muted mt-10 max-w-[760px]">
              Every partner in this ecosystem promises adoption. That is the easy half, and it is
              measured in logins. The hard half is proving that reach, adoption and feedback
              actually produced change, and putting a number on what that is worth. That is the
              part we do.
            </p>
          </div>
        </section>

        {/* The platform: reach, then intelligence */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[660px] mb-10">
              <p className={EYEBROW}>The platform</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Reach first, then intelligence
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                The two halves do different jobs, and they have to be in that order.
              </p>
            </div>
            <div className="grid gap-7 md:grid-cols-2 md:gap-11">
              {PLATFORM.map((p) => (
                <div key={p.name} className={`border-t-[3px] ${p.accent} pt-7`}>
                  <h3
                    className={`font-brand tracking-normal font-semibold text-[22px] mb-3 ${p.ink}`}
                  >
                    {p.name}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we do */}
        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[680px] mb-10">
              <p className={EYEBROW}>What we do</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Measurement, not another rollout
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                We did not sell you the licence and we do not resell it. So when the honest read is
                that the data does not support the conclusion someone in the room wants, that is the
                read you get.
              </p>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-9">
              {SERVICES.filter((s) => !s.lead).map((s) => (
                <div key={s.title} className="border-t-[3px] border-ec-sky-ink pt-6">
                  {/* Two lines' worth of height only where the three sit in a row,
                      so the body copy starts on one baseline across the columns. */}
                  <h3 className="font-brand tracking-normal font-semibold text-[19px] mb-2.5 text-ec-sky-ink lg:min-h-[58px]">
                    {s.title}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body">{s.body}</p>
                </div>
              ))}
            </div>

            {/* The lead offer gets its own treatment: it is what the CTA sells. */}
            {SERVICES.filter((s) => s.lead).map((s) => (
              <div
                key={s.title}
                className="mt-11 rounded-2xl border border-ec-line-3 bg-white p-8 lg:p-10"
              >
                <p className="text-[13px] tracking-[0.12em] uppercase font-semibold text-ec-red mb-3">
                  Where most engagements start
                </p>
                <h3 className="font-brand tracking-normal font-extrabold text-[24px] leading-[1.12] mb-3.5 text-pretty lg:text-[28px]">
                  {s.title}
                </h3>
                <p className="text-[16px] leading-[1.65] text-ec-body max-w-[660px] mb-6">
                  {s.body}
                </p>
                <ul className="grid gap-x-8 gap-y-2.5 text-[15px] leading-[1.5] text-ec-body-strong sm:grid-cols-3">
                  <li className="border-l-[3px] border-ec-sky-ink pl-4">
                    Is the gap real here, and how large
                  </li>
                  <li className="border-l-[3px] border-ec-teal-ink pl-4">
                    What closing it is worth, with the assumptions stated
                  </li>
                  <li className="border-l-[3px] border-ec-red pl-4">
                    What we cannot claim from your data
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Positioning */}
        <section className={`bg-white ${SECTION}`}>
          <div className={`${INNER} max-w-[820px]`}>
            <p className={EYEBROW}>Where we sit</p>
            <p className="font-brand tracking-normal font-semibold text-[22px] leading-[1.4] text-ec-body-strong text-pretty lg:text-[26px]">
              Eclectik is the measurement and people intelligence partner in the Workvivo
              ecosystem. Workvivo reaches the people other platforms miss. Seer shows where
              feedback stalls. We add the third piece: proof.
            </p>
          </div>
        </section>

        {/* Close */}
        <section className="bg-ec-navy text-center px-6 py-16 lg:px-16 lg:py-[88px]">
          <h2 className="font-brand tracking-normal font-extrabold text-[28px] text-white mb-4 text-pretty lg:text-[42px]">
            Ready to know what your employee experience is worth?
          </h2>
          <p className="text-[17px] text-ec-on-dark-caption mb-8 max-w-[580px] mx-auto">
            Tell us what you run and where you are in the rollout. If an assessment would not tell
            you anything you do not already know, we will say so.
          </p>
          <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              onClick={() => trackCTAClick("Book an execution gap assessment", "workvivo-close")}
              className="rounded-full font-bold bg-ec-sky text-ec-navy inline-block px-[34px] py-4 text-[16px] transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
            >
              Book an execution gap assessment
            </Link>
            <Link
              href="/contact"
              onClick={() => trackCTAClick("Talk to our team", "workvivo-close")}
              className="rounded-full font-semibold text-ec-on-dark inline-block px-[30px] py-4 text-[16px] border border-ec-navy-line-2 transition-colors hover:bg-[#26365a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
            >
              Talk to our team
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
