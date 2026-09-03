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
    body: "One structured validation pass removes most of what goes wrong later. Activation happens once or twice a year, which is exactly why nobody has it in their fingers.",
    items: [
      "Population and segmentation logic",
      "Demographic structure, and whether it will still slice cleanly next cycle",
      "Technical configuration and link validation",
      "Reminder planning, per language and per shift pattern",
      "Governance: who sees which dashboard, agreed before launch rather than after",
      "Stakeholder clarity, timelines and what leadership has been told to expect",
      "Escalation paths, settled while nothing is on fire",
    ],
  },
  {
    step: "While it runs",
    accent: "border-ec-teal-ink",
    ink: "text-ec-teal-ink",
    body: "We watch the cycle with you and advise on steering actions while there is still time to steer. Not a report afterwards explaining why response rates were low.",
    items: [
      "Response progress against where the cycle should be by now",
      "Participation dynamics by team, language and location",
      "Steering actions, with the trade-offs of each one spelled out",
      "Adjustments to reminders and comms mid-cycle",
    ],
  },
  {
    step: "After the results",
    accent: "border-ec-red",
    ink: "text-ec-red",
    body: "The part most programmes leave to the platform. Results land, dashboards open, and then the organisation waits for someone to do something with them.",
    items: [
      "Manager briefings and dashboards people actually open",
      "Action tracking that survives the second month",
      "Reporting that ties sentiment back to the outcomes your board asked about",
      "An honest read on what to change in the next cycle, while this one is fresh",
    ],
  },
];

const FAILURES = [
  "Wrong population selected",
  "Demographics that do not reconcile",
  "Broken links",
  "Language mismatches",
  "Reminder flows firing at the wrong people",
  "Executive expectations nobody aligned",
];

// The wider Customer Success work. A cycle is two months; the licence is twelve,
// and the old Customer Success page was mostly about the other ten.
const BETWEEN = [
  {
    title: "Adoption and proficiency",
    body: "Getting the platform used, and used well. There is a difference between a manager who opens the dashboard and one who can run a team conversation off it.",
  },
  {
    title: "What the licence returns",
    body: "What you pay set against what you get out of it. Worth having before a renewal conversation, and worth more a year before one.",
  },
  {
    title: "Alignment and governance",
    body: "The platform's measures tied to objectives the business already has, and the governance that stops both from decaying between cycles.",
  },
];

const SCIENCE: { title: string; body: string; wide?: boolean }[] = [
  {
    title: "Listening strategy and design",
    body: "What to measure, when to listen, and how you will respond, settled before the instrument is configured rather than after. Usually that means fewer questions, asked on purpose.",
  },
  {
    title: "Signal against noise",
    body: "A three point move is not automatically a change. We separate real shifts from sampling, seasonality, a restructure still working through, and comparison groups that were never comparable.",
  },
  {
    title: "Employee experience insight",
    body: "Survey science applied to your own data. We cut the reporting down to the findings that would change a decision, and say plainly which ones we are not confident about.",
  },
  {
    title: "Sentiment against outcomes",
    body: "Driver scores read alongside what the business already tracks: retention, absence, cycle times, safety, whatever sits on the board pack. Correlation described as correlation.",
  },
  {
    title: "Leadership and manager enablement",
    body: "Managers shape how a finding feels day to day, and most of them were handed a dashboard and left to it. We give them the insight and the practical tools to read their own data, act on it with intent, and stop treating the report as something that happened to them.",
    wide: true,
  },
];

const CAPABILITIES = [
  {
    title: "Write the script",
    body: "Agree the outcome, define what progress looks like, and work out which behaviours actually have to shift.",
  },
  {
    title: "Build the cast",
    body: "Identify the early adopters and allies who form a Delta Team and champion the change inside their own networks. Then give them something worth carrying.",
  },
  {
    title: "Rehearse for ideas",
    body: "Structured sessions that generate and test behaviour-based solutions against the goal, before anything is announced.",
  },
  {
    title: "Set the stage",
    body: "Design the moments, cues and nudges that make the new behaviour visible, easy and repeatable.",
  },
  {
    title: "Engage the audience",
    body: "Widen adoption through experiences where people try the behaviour rather than hear about it.",
  },
  {
    title: "Plan for improvisation",
    body: "Coach leaders to read which stage a team is in and adapt, instead of repeating the launch message louder.",
  },
];

// Client quotes, kept verbatim from the pages this one replaces. Each sits in
// the section whose work it speaks to rather than in a wall of testimonials.
const QUOTE = {
  cs: {
    label: "On survey season",
    text: "Their thoughtfulness, responsiveness, and creative problem-solving were truly off the charts. We hit several unexpected snags, and their deep expertise and proactive support were absolutely critical, we would have been lost without it.",
    who: "Communication Director",
    where: "Fintech organisation",
  },
  ps: {
    label: "On working together",
    text: "I want to express my appreciation for the exceptional support provided by the team. Their attentiveness, reliable follow up, and timely communication have had a clear positive effect on our workflow. Their commitment to delivering on every detail has been highly valuable to our team.",
    who: "HR Director",
    where: "Fintech organisation",
  },
  change: {
    label: "On Infectious Change",
    text: "Before this work, we had strong insights but no clear way to turn them into progress. Infectious Change helped our leaders influence the few who move the many, and we watched new behaviors spread naturally through the organization. The result is a lasting shift in how teams collaborate and take ownership, and it continues to grow without external pressure.",
  },
};

function Quote({
  label,
  text,
  who,
  where,
}: {
  label: string;
  text: string;
  who?: string;
  where?: string;
}) {
  return (
    <figure className="m-0 mt-12 border-t-[3px] border-ec-sky-ink pt-7 max-w-[720px]">
      <p className="text-[13px] tracking-[0.12em] uppercase font-semibold text-ec-body-faint mb-4">
        {label}
      </p>
      <blockquote className="m-0 text-[17px] leading-[1.6] text-ec-body-strong">
        &ldquo;{text}&rdquo;
      </blockquote>
      {who && (
        <figcaption className="mt-5 text-[14px] leading-[1.5]">
          <span className="block font-semibold text-ec-navy">{who}</span>
          <span className="block text-ec-body">{where}</span>
        </figcaption>
      )}
    </figure>
  );
}

export default function GlintSupport() {
  return (
    <Layout>
      <Helmet>
        <title>Glint Support | Eclectik</title>
        <meta
          name="description"
          content="Independent Customer Success, People Science and change management for organisations running Viva Glint. Survey and cycle design, manager enablement, and turning results into movement."
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
            <p className="text-[17px] leading-[1.65] text-ec-on-dark-muted mb-5">
              Plans are announced, dashboards are shared, and the organisation waits. Real change
              spreads person to person, not top down. Progress starts when leaders stop trying to
              manage change and start designing how it spreads.
            </p>
            <p className="text-[17px] leading-[1.65] text-ec-on-dark-muted">
              So we bring three things to a Glint programme, and the same team carries all three:
              the Customer Success work that keeps the cycle sound, the People Science that reads
              what the data is really saying, and the change design that gets a finding out of the
              deck and into how people behave.
            </p>
          </div>
        </section>

        {/* Customer Success */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[660px] mb-10">
              <p className={EYEBROW}>Customer Success</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Three moments where a cycle is won or lost
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                Survey and cycle design, manager enablement, and managed reporting. One team from
                validation through to the action review, so nothing is handed over at the point it
                matters.
              </p>
            </div>
            <div className="grid gap-9 lg:grid-cols-3 lg:gap-8">
              {PHASES.map((p) => (
                <div key={p.step} className={`border-t-[3px] ${p.accent} pt-7`}>
                  <h3
                    className={`font-brand tracking-normal font-semibold text-[20px] mb-3 ${p.ink}`}
                  >
                    {p.step}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body mb-5 max-w-[620px]">{p.body}</p>
                  <ul className="space-y-2.5 text-[14px] leading-[1.55] text-ec-body-strong max-w-[620px]">
                    {p.items.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span aria-hidden="true" className={`${p.ink} shrink-0`}>
                          &bull;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* The failure modes the validation pass is looking for */}
            <div className="mt-12 rounded-2xl border border-ec-line-3 bg-ec-cream p-8 lg:p-10">
              <h3 className="font-brand tracking-normal font-bold text-[20px] mb-2.5 lg:text-[22px]">
                What we are looking for before you press send
              </h3>
              <p className="text-[15px] leading-[1.65] text-ec-body max-w-[620px] mb-6">
                None of this is difficult. It is just easy to miss when the launch date is fixed,
                the setup is a once-a-year job, and the whole organisation is about to see the
                result.
              </p>
              <ul className="grid gap-x-8 gap-y-2.5 text-[15px] leading-[1.5] text-ec-body-strong sm:grid-cols-2">
                {FAILURES.map((f) => (
                  <li key={f} className="border-l-[3px] border-ec-red pl-4">
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* The rest of the year, where the licence actually earns its keep */}
            <div className="mt-14 pt-12 border-t border-ec-line-3">
              <div className="max-w-[660px] mb-9">
                <h3 className="font-brand tracking-normal font-extrabold text-[24px] leading-[1.12] mb-3.5 text-pretty lg:text-[30px]">
                  Survey season is only the visible part
                </h3>
                <p className="text-[16px] leading-[1.65] text-ec-body">
                  A cycle is two busy months. The licence is twelve, and most of what decides
                  whether it was worth buying happens in the other ten.
                </p>
              </div>
              <div className="grid gap-7 lg:grid-cols-3 lg:gap-9">
                {BETWEEN.map((b) => (
                  <div key={b.title}>
                    <h4 className="font-brand tracking-normal font-semibold text-[18px] mb-2 text-ec-sky-ink">
                      {b.title}
                    </h4>
                    <p className="text-[15px] leading-[1.6] text-ec-body max-w-[620px]">{b.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <Quote {...QUOTE.cs} />
          </div>
        </section>

        {/* People Science */}
        <section className={`bg-ec-surface ${SECTION}`}>
          <div className={INNER}>
            <div className="max-w-[680px] mb-10">
              <p className={EYEBROW}>People Science</p>
              <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-3.5 text-pretty lg:text-[40px]">
                Reading what the data is actually saying
              </h2>
              <p className="text-[17px] leading-[1.6] text-ec-body">
                Glint gives you scores, drivers and comments. It does not tell you which of those
                is a real signal, which is an artefact of how the question was asked, and which one
                is worth spending a leadership team&rsquo;s attention on.
              </p>
            </div>
            <div className="grid gap-7 sm:grid-cols-2 md:gap-x-11 md:gap-y-9">
              {SCIENCE.map((s) => (
                <div
                  key={s.title}
                  className={`border-t-[3px] border-ec-teal-ink pt-6${
                    s.wide ? " sm:col-span-2" : ""
                  }`}
                >
                  <h3 className="font-brand tracking-normal font-semibold text-[19px] mb-2.5 text-ec-teal-ink">
                    {s.title}
                  </h3>
                  <p className="text-[15px] leading-[1.65] text-ec-body max-w-[720px]">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-11 border-l-[3px] border-ec-red pl-6 max-w-[720px]">
              <p className="text-[16px] leading-[1.65] text-ec-body-strong">
                We did not sell you the licence and we do not resell it. So when the honest read is
                that your data does not support the conclusion someone in the room wants, that is
                the read you get.
              </p>
            </div>

            <Quote {...QUOTE.ps} />
          </div>
        </section>

        {/* Change management: the method */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:items-center">
              <div>
                <p className={EYEBROW}>Infectious Change</p>
                <h2 className="font-brand tracking-normal font-extrabold text-[28px] leading-[1.08] mb-4 text-pretty lg:text-[36px]">
                  People follow people. Not plans.
                </h2>
                <p className="text-[16px] leading-[1.65] text-ec-body mb-4">
                  We pinpoint the cultural signals, the influencers and the habits that decide
                  whether a finding turns into a movement or a slide. Then we equip the few who move
                  the many.
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

            {/* The six capabilities */}
            <div className="mt-14 pt-12 border-t border-ec-line-3">
              <div className="max-w-[680px] mb-9">
                <h3 className="font-brand tracking-normal font-extrabold text-[24px] leading-[1.12] mb-3.5 text-pretty lg:text-[30px]">
                  Six capabilities, one live initiative
                </h3>
                <p className="text-[16px] leading-[1.65] text-ec-body">
                  Infectious Change Design &copy; works through applied practice rather than
                  workshops alone. Leaders learn the behavioural science of influence while running
                  a real change initiative inside their own organisation, not a case study about
                  someone else&rsquo;s. Every session leaves them with something usable: a
                  stakeholder map, a behaviour script, an influence plan, a coaching approach.
                </p>
              </div>
              <ol className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 md:gap-x-9">
                {CAPABILITIES.map((c, i) => (
                  <li key={c.title}>
                    <span className="block font-brand font-extrabold text-[13px] tracking-[0.14em] text-ec-sky-ink mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-brand tracking-normal font-semibold text-[18px] mb-2">
                      {c.title}
                    </h4>
                    <p className="text-[15px] leading-[1.6] text-ec-body">{c.body}</p>
                  </li>
                ))}
              </ol>
              <p className="text-[16px] leading-[1.65] text-ec-body-strong mt-10 max-w-[660px] border-l-[3px] border-ec-red pl-6">
                Taken together those deliverables are a change playbook your own leaders wrote, and
                the influence to use it. That is what turns isolated improvements into a
                self-sustaining shift instead of a programme somebody has to keep pushing. A
                movement designed rather than declared.
              </p>
            </div>

            <Quote {...QUOTE.change} />
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
