import { useEffect } from "react";
import { Link } from "wouter";
import { trackGlintPage } from "@/lib/tracking";
import "./GlintValue.css";

/**
 * /glint: the landing page behind the link we mail to organisations that
 * already run Viva Glint, and the landing page under LinkedIn campaigns and
 * reactivation mailings.
 *
 * Briefing: "Briefing Olivier: landingspagina voor Glint-klanten en
 * -prospects", Marco, 15 September 2026. Second page in the same series as
 * /microsoft: same eight-block structure, same visual grammar, different
 * reader. The English copy is his, taken over from paragraph 4 of that
 * briefing, except in the Warburtons block. See below.
 *
 * ORDER: the briefing puts Warburtons at block 5, after the diagnosis and the
 * two roles. It sits directly under the hero instead, on Olivier's call of
 * 16 September, so the proof is the first thing the reader meets rather than
 * the reward for scrolling past two blocks of argument.
 *
 * THE WARBURTONS BLOCK IS NOT THE MOCKUP'S. Marco's mockup wrote block 5 from
 * his call notes of 23 June. His own briefing, paragraph 7.4, says the
 * approved case text wins wherever the two differ, and the approved text
 * ("warburtons-case_final", 14 September 2026) differs on nearly every fact:
 *
 *  - The quote. "The money that we pay you is worth every single penny" came
 *    from a call, not from the approved case, and paragraph 7.1 calls it a
 *    blocker. It is not on this page. The quotes below are the ones Warburtons
 *    approved, with the attribution the case carries.
 *  - The figure. "+10 points on understanding of the business strategy" came
 *    from the same call summary and paragraph 7.3 says: verify it or take it
 *    off. It is off. The three figures below are the case's own.
 *  - The framing. The mockup opens on leadership trust as the weakest measure.
 *    The approved case says the problem was never the data, it was narrowing a
 *    rich set of results down to a few priorities. That is also the better fit
 *    for this page.
 *  - The attribution. "Stefan" in the call notes, Stephen Friel in the case.
 *    The case is the source used here, job title included.
 *  - Details. 72 screens, not 70. Two annual insight cycles to date.
 *
 * What survives from the mockup is the shape of the block and the closing
 * paragraph that leaves an open problem rather than a result, which the
 * briefing asks in as many words not to remove.
 *
 * This is not a public website page yet. It renders without Layout, so it has
 * no SiteHeader and no SiteFooter: the briefing asks for no navigation and no
 * exit path other than the call to action. It is kept out of sitemap.xml and
 * out of the header nav, and carries noindex both as the meta tag below and as
 * an X-Robots-Tag header on this path in vercel.json. The header is the one
 * that counts: this is a client-rendered SPA, so a crawler that does not run
 * the JS never sees the meta tag. robots.txt deliberately says nothing about
 * this path, because a Disallow would publish the URL in a file anyone can
 * read and would stop crawlers from fetching the page to see the noindex.
 *
 * None of that is access control. Anyone holding the URL can open it.
 *
 * TO MAKE THIS PUBLIC (briefing paragraph 1, the choice Marco left open):
 * remove the /glint entry from vercel.json headers, remove the noindex effect
 * below, and add the route to sitemap.xml. The gate is the case, and the case
 * is approved, so this is now a decision rather than a blocker.
 *
 * CLEARED (both confirmed by Olivier on 16 September 2026):
 *  - The Warburtons wordmark below. Warburtons supplied it and approved its use.
 *  - The case text, which carries Kirsty's approval as well as Warburtons'.
 *
 * STILL TO CONFIRM: Kirsty to read the CSM and PSC descriptions in the block
 * above the case. That is a separate thing from her sign-off on the case: she
 * delivers that work, and the wording here is Marco's reconstruction from the
 * CRM roles (briefing, bronteksten paragraph 3).
 */

/**
 * Bookings link for the "book" CTAs, Marco's Microsoft Bookings page, the same
 * one /microsoft uses. Empty means the button falls back to the mailto: a dead
 * "Pick a slot" costs more than one missing button.
 */
const BOOKINGS_URL =
  "https://bookings.cloud.microsoft/book/MeetingwithMarco@eclectik.co/?ismsaljsauthenabled";

const MAILTO =
  "mailto:marco@eclectik.co" +
  "?subject=" +
  encodeURIComponent("30-minute review: getting more out of Glint");

/** Block 3. The five places value leaks out of a listening programme. */
const LEAKS = [
  {
    heading: "Results land, ownership does not",
    body: "Managers receive a dashboard without knowing what is theirs to fix and what is not.",
  },
  {
    heading: "Action planning is a template, not a habit",
    body: "Plans get written in the fortnight after the readout and are not looked at again.",
  },
  {
    heading: "The question set ages",
    body: "Items stay in because they always have, not because they still measure something the business is deciding on.",
  },
  {
    heading: "Scores move, nobody knows why",
    body: "Without leading and lagging indicators, a rise is celebrated and a fall is explained away.",
  },
  {
    heading: "The cycle runs on one person",
    body: "Continuity sits with a single owner, and the programme stalls the moment they change role.",
  },
];

interface Role {
  eyebrow: string;
  heading: string;
  body: string;
  deliverables: string[];
}

/* Block 4. Two roles, drawn from the CS and PS split that the CRM's
   glint_delivery table actually bills against, not from a service catalogue. */
const ROLES: Role[] = [
  {
    eyebrow: "Customer Success",
    heading: "The programme runs",
    body: "The unglamorous half, and the reason deadlines hold. Your CSM owns the mechanics of the cycle so your team owns the conversation with the business.",
    deliverables: [
      "Survey cycle planning, timelines and readiness",
      "Platform configuration, hierarchy and permissions",
      "Launch, comms support and response management",
      "A named contact who knows your setup between cycles",
    ],
  },
  {
    eyebrow: "People Science",
    heading: "The findings mean something",
    body: "Your PSC is an organisational psychologist, not a report writer. They design what you ask, interpret what comes back, and stay for the part where it turns into action.",
    deliverables: [
      "Question set and framework design, linked to your strategy",
      "Insight reviews and executive readouts",
      "Action planning design and manager enablement",
      "Construct mapping: which leading indicators move the lagging ones",
    ],
  },
];

/* Block 5, figures. All three from the approved case, none from the call
   summary. Deliberately no "+10 on strategy understanding": see the header. */
const CASE_FIGURES = [
  {
    figure: "3 years",
    caption: "without a single declining question, out of 29 asked annually",
  },
  {
    figure: "+3 to 4 pts",
    caption: "across priority areas in the latest cycle",
  },
  {
    figure: "83%",
    caption: "survey participation, and still rising",
  },
];

/* Block 5, the chain. The case calls this "from insight to action" and it is
   the part that proves this page's argument: the value is in the steps after
   the survey, and here is what those steps produced. */
const CASE_CHAIN = [
  {
    said: "Recognition was a focus area. Comments highlighted the need to make it more visible, and the nomination journey easier for manufacturing and distribution colleagues.",
    did: "Launched a new recognition programme, supported by visible Legends post boxes and locally celebrated awards across sites.",
    changed: "Up 5 points. Nominations through the programme have tripled.",
  },
  {
    said: "Insights highlighted the need to make communication more visible and accessible for a geographically dispersed frontline workforce.",
    did: "Installed 72 digital communication screens across sites, supported by the colleague magazine, the intranet and pilots on SMS and WhatsApp.",
    changed:
      "A more visible feedback loop. Frontline colleagues can see how feedback is being turned into action.",
  },
  {
    said: "Open comments ahead of the 150th anniversary said colleagues wanted more fun, and missed aspects of the culture they had known.",
    did: "Used the evidence to shape proposals including a bespoke Warburtons Monopoly board for colleagues and an additional day's holiday.",
    changed:
      "Evidence-led investment. Employee feedback gave leaders greater confidence in the proposals.",
  },
];

interface Phase {
  step: string;
  heading: string;
  body: string;
  tag: string;
  now: boolean;
}

/* Block 6. The block that says what we would not sell you yet, and the reason
   the page exists in this shape: a client asked us, in writing, to say
   explicitly when something only makes sense in a later phase. */
const PHASES: Phase[] = [
  {
    step: "01",
    heading: "Run a clean cycle",
    body: "Timelines that hold, a hierarchy that reflects the organisation, a readout the executive team can act on.",
    tag: "Start here",
    now: true,
  },
  {
    step: "02",
    heading: "Ownership and action planning",
    body: "Managers know what is theirs, plans have owners and dates, and follow-through is visible before the next survey opens.",
    tag: "Start here",
    now: true,
  },
  {
    step: "03",
    heading: "A question set that matches the strategy",
    body: "Retire items that no longer inform a decision, add the ones your strategy now depends on, keep enough trend to stay comparable.",
    tag: "When 1 and 2 hold",
    now: false,
  },
  {
    step: "04",
    heading: "Leading and lagging indicators",
    body: "Construct mapping, so you know which early movements predict the outcomes you report to the board, and which do not.",
    tag: "When 1 and 2 hold",
    now: false,
  },
];

const WORKING = [
  {
    tick: "SCOPE",
    heading: "Hours, not headcount",
    body: "Customer Success and People Science hours agreed per cycle, scaled to the survey window.",
  },
  {
    tick: "PLATFORM",
    heading: "Your existing licence",
    body: "We work in the Glint tenant you already have. Nothing new to buy, nothing to migrate.",
  },
  {
    tick: "CONTINUITY",
    heading: "The same people each cycle",
    body: "A named CSM and PSC who know your hierarchy, your history and your trend lines.",
  },
];

export default function GlintValue() {
  useEffect(() => {
    trackGlintPage("glint_page_viewed", "glint");
  }, []);

  /**
   * index.html carries site-wide `robots: index, follow` and `googlebot:
   * index, follow` meta tags, and React appends this page's own noindex
   * alongside them rather than replacing them. Googlebot gives a `googlebot`
   * tag precedence over a `robots` one, so leaving them as they are would hand
   * a crawler that renders the JS an explicit instruction to index this page.
   *
   * The X-Robots-Tag header on /glint is the authority either way; this stops
   * the rendered DOM from contradicting it. The tags are shared with every
   * other route in the SPA, so their values are put back on unmount.
   */
  useEffect(() => {
    const tags = Array.from(
      document.querySelectorAll<HTMLMetaElement>(
        'meta[name="robots"], meta[name="googlebot"]'
      )
    );
    const previous = tags.map(tag => tag.content);
    tags.forEach(tag => {
      tag.content = "noindex, nofollow";
    });
    return () => {
      tags.forEach((tag, i) => {
        tag.content = previous[i];
      });
    };
  }, []);

  const onCta = (cta: string) =>
    trackGlintPage("glint_cta_clicked", "glint", { cta });

  return (
    <div className="glv">
      <title>Getting more value out of Viva Glint | Eclectik</title>
      <meta
        name="description"
        content="You have Glint. We work alongside your team through the whole cycle: the question set, the analysis, and the action planning after the survey closes."
      />
      <meta name="robots" content="noindex, nofollow" />

      <header className="glv-masthead">
        <div className="glv-wrap">
          {/* Not a link. The briefing asks for no exit path other than the CTA,
              and the logo is the exit path every visitor reaches for first. */}
          <img
            src="/images/eclectik-logo-dark-photo.svg"
            alt="Eclectik"
            className="glv-logo glv-logo-dark"
          />
          <img
            src="/images/eclectik-logo-white-photo.svg"
            alt="Eclectik"
            className="glv-logo glv-logo-light"
          />
          <span className="glv-stamp">
            For teams already running Viva Glint
          </span>
        </div>
      </header>

      <section className="glv-hero">
        <div className="glv-wrap">
          <div className="glv-hero-grid">
            <div>
              <p className="glv-eyebrow">Insights that help employees thrive</p>
              <h1>You have Glint. How do you get the most value out of it?</h1>
              <p className="glv-lede">
                Most organisations run a good survey and stop short of the part
                that changes anything. We work alongside your team through the
                whole cycle: the question set, the analysis, and the action
                planning after the survey closes.
              </p>
              <div className="glv-actions">
                {/* The label says "book", so it opens Bookings. It falls back
                    to the mailto rather than disappearing the way the second
                    CTA does: the hero cannot be left without a primary action. */}
                <a
                  className="glv-btn glv-btn-primary"
                  href={BOOKINGS_URL || MAILTO}
                  target={BOOKINGS_URL ? "_blank" : undefined}
                  rel={BOOKINGS_URL ? "noopener noreferrer" : undefined}
                  onClick={() =>
                    onCta(BOOKINGS_URL ? "hero_bookings" : "hero_email")
                  }
                >
                  Book a 30-minute review
                </a>
                <a
                  className="glv-btn glv-btn-ghost"
                  href="#support"
                  onClick={() => onCta("hero_see_how_we_support")}
                >
                  See how we support
                </a>
              </div>
            </div>
            <figure>
              {/* The signature object of the page. It comes back as the four
                  phases in the sequencing block and works on its own in a
                  LinkedIn post. */}
              <svg
                viewBox="0 0 320 212"
                role="img"
                aria-label="Four rising steps: run the survey, own the results, plan and follow through on action, and link listening to strategy. Most organisations are marked at the first step."
              >
                <path
                  d="M24 176 L90 176 L90 140 L156 140 L156 104 L222 104 L222 68 L296 68"
                  fill="none"
                  stroke="var(--glv-rule)"
                  strokeWidth="1"
                />
                <rect
                  x="24"
                  y="176"
                  width="66"
                  height="8"
                  fill="var(--glv-accent)"
                />
                <rect
                  x="90"
                  y="140"
                  width="66"
                  height="8"
                  fill="var(--glv-accent)"
                  opacity="0.62"
                />
                <rect
                  x="156"
                  y="104"
                  width="66"
                  height="8"
                  fill="var(--glv-accent)"
                  opacity="0.42"
                />
                <rect
                  x="222"
                  y="68"
                  width="74"
                  height="8"
                  fill="var(--glv-accent)"
                  opacity="0.26"
                />
                <text x="24" y="170" fill="var(--glv-ink-2)">
                  Survey
                </text>
                <text x="90" y="134" fill="var(--glv-ink-2)">
                  Ownership
                </text>
                <text x="156" y="98" fill="var(--glv-ink-2)">
                  Action
                </text>
                <text x="222" y="62" fill="var(--glv-ink-2)">
                  Strategy
                </text>
                <line
                  x1="57"
                  y1="192"
                  x2="57"
                  y2="200"
                  stroke="var(--glv-flag-mark)"
                  strokeWidth="1"
                />
                <text x="24" y="210" fill="var(--glv-flag)">
                  most stop here
                </text>
              </svg>
              <figcaption>
                The value is not in the survey. It is in the three steps after
                it, and that is where the work usually stalls.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="glv-case" id="warburtons">
        <div className="glv-wrap">
          <div className="glv-casehead">
            <div>
              <p className="glv-eyebrow">Customer case</p>
              <h2>
                How Warburtons turned focused listening into visible action
              </h2>
              <p className="glv-casemeta">
                Food manufacturing, bakery &middot; United Kingdom &middot;
                nearly 5,000 colleagues across 29 sites &middot; Microsoft Viva
                Glint &middot; two annual insight cycles to date
              </p>
            </div>
            {/* Supplied and approved by Warburtons. It sits opposite the
                heading rather than under it, so the brand introduces the block
                the way it would on a case sheet. */}
            <img
              src="/images/clients/warburtons.png"
              alt="Warburtons"
              className="glv-caselogo"
              loading="lazy"
            />
          </div>

          <div className="glv-figures">
            {CASE_FIGURES.map(item => (
              <div key={item.figure}>
                <span className="glv-fig">{item.figure}</span>
                <p className="glv-cap">{item.caption}</p>
              </div>
            ))}
          </div>

          <div className="glv-case-grid" style={{ marginTop: "40px" }}>
            <div className="glv-story">
              <p>
                Warburtons has listened to colleagues for years. The challenge
                was never a lack of data or a disengaged workforce. It was how
                to turn a rich set of results into a small number of priorities
                across a sixth-generation family business with an average length
                of service of eleven years. In their own words: when we went
                after engagement actions before, we probably went after too
                much.
              </p>
              <p>
                Each cycle, the results are distilled into three strengths and
                three focus areas, a story the business can understand and act
                on. Analysis by site, age, gender, length of service and grade
                shows where action will have the greatest value, and the
                comments explain the experience behind the scores. The output is
                built to be used, not filed: practical recommendations for line
                managers, and an executive story presented to the board.
              </p>
              <p>
                Three strong years are not a finish line, and a 150th
                anniversary is not repeatable. The harder question is how you
                hold that level in a year with nothing to celebrate. That is the
                work in front of them now: sustaining focus, strengthening
                locally relevant action, and keeping employee feedback as a live
                source of evidence for business decisions.
              </p>
              <ul className="glv-pillars">
                <li>Communication</li>
                <li>Empowerment &amp; Growth</li>
                <li>Career Development &amp; Care</li>
              </ul>
            </div>
            <div>
              <blockquote>
                <p>
                  &ldquo;We&rsquo;ve got a very passionate workforce already, so
                  improving from that position is hard to do. Eclectik has
                  played a massive part in it.&rdquo;
                </p>
              </blockquote>
              <p className="glv-attrib">
                Stephen Friel
                <br />
                Internal Communications Professional &amp; Engagement Specialist
                <br />
                Warburtons
              </p>
            </div>
          </div>

          <div className="glv-chain">
            <p className="glv-eyebrow" style={{ marginBottom: "10px" }}>
              From insight to action
            </p>
            <div className="glv-chain-head" aria-hidden="true">
              <span>What the data said</span>
              <span>What Warburtons did</span>
              <span>What changed</span>
            </div>
            {CASE_CHAIN.map(row => (
              <div className="glv-chain-row" key={row.did}>
                <div>
                  <span className="glv-label">What the data said</span>
                  <p>{row.said}</p>
                </div>
                <div>
                  <span className="glv-label">What Warburtons did</span>
                  <p>{row.did}</p>
                </div>
                <div>
                  <span className="glv-label">What changed</span>
                  <p className="glv-changed">{row.changed}</p>
                </div>
              </div>
            ))}
          </div>

          <blockquote className="glv-casequote">
            <p>
              &ldquo;The comments showed us how to make recognition visible for
              manufacturing and distribution colleagues, and how to make the
              journey easy. We wouldn&rsquo;t have known that without
              Eclectik.&rdquo;
            </p>
          </blockquote>

          <div className="glv-actions glv-caseactions">
            <a
              className="glv-btn glv-btn-ghost"
              href={MAILTO}
              onClick={() => onCta("case_request_full_story")}
            >
              Ask for the full Warburtons case
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="glv-wrap">
          <p className="glv-eyebrow">The honest diagnosis</p>
          <h2>The survey closes. Then what?</h2>
          <p className="glv-intro">
            These are the five places value leaks out of a listening programme.
            Most teams recognise at least three of them, and none of them are a
            platform problem.
          </p>
          <ul className="glv-leaks">
            {LEAKS.map(leak => (
              <li key={leak.heading}>
                <strong>{leak.heading}</strong>
                {leak.body}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="support">
        <div className="glv-wrap">
          <p className="glv-eyebrow">How we support you</p>
          <h2>Two roles, one team alongside yours</h2>
          {/* The first two sentences answer a reader the page otherwise turns
              away: the team that runs a good cycle and is simply short-staffed
              for the next one. Kirsty's colleague raised it on 17 September,
              and it is a second reason to call rather than a second audience,
              so it is one sentence here and one in the CTA, not a block of its
              own. A block would widen the page the way the briefing's
              premortem warns against. It sits in this intro because this
              section follows the five leaks, so the relief lands immediately
              after the confrontation. */}
          <p className="glv-intro">
            You do not need a failing programme to bring us in. Plenty of teams
            run a good cycle and are a person short for the next one: someone
            leaves, the survey lands in a bad month, the team is already at
            capacity, or there is no People Science in the building. You buy
            hours, not headcount. We staff the cycle with the two roles that
            carry it, and scale up around your survey window rather than sitting
            on your payroll all year.
          </p>
          <div className="glv-roles">
            {ROLES.map(role => (
              <div className="glv-role" key={role.heading}>
                <p className="glv-eyebrow">{role.eyebrow}</p>
                <h3>{role.heading}</h3>
                <p>{role.body}</p>
                <ul className="glv-deliverables">
                  {role.deliverables.map(item => (
                    <li key={item}>
                      <span className="glv-n" aria-hidden="true">
                        &rarr;
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="glv-wrap">
          <p className="glv-eyebrow">Sequencing</p>
          <h2>What fits now, and what is better left for later</h2>
          <p className="glv-intro">
            We would rather tell you something is premature than sell it to you.
            Get the fundamentals right before layering anything more
            sophisticated on top. Most organisations belong in the first two
            rows.
          </p>
          <div className="glv-phases">
            {PHASES.map(phase => (
              <div className="glv-phase" key={phase.step}>
                <span className="glv-step">{phase.step}</span>
                <div>
                  <h3>{phase.heading}</h3>
                  <p>{phase.body}</p>
                </div>
                <span
                  className={`glv-tag ${phase.now ? "glv-tag-now" : "glv-tag-later"}`}
                >
                  {phase.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="glv-wrap">
          <p className="glv-eyebrow">How it works</p>
          <div className="glv-working">
            {WORKING.map(item => (
              <div key={item.heading}>
                <span className="glv-tick">{item.tick}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glv-cta" id="contact">
        <div className="glv-wrap">
          <p className="glv-eyebrow">Next step</p>
          <h2>Tell us where your last cycle stalled</h2>
          {/* The heading still assumes a stall, which is the right bet for most
              readers. This line is where the short-staffed team gets an opening,
              so the page does not close on a question they cannot answer. */}
          <p>
            Thirty minutes, no deck. Whether the last cycle stalled or the next
            one is short a pair of hands, we will tell you which of the four
            steps you are on and what we would do first. If that is nothing, we
            will say so.
          </p>
          <div className="glv-actions">
            {/* The one link off this page into the site proper. wouter's Link
                renders the anchor, so the navigation stays client-side and the
                unmount effect above puts the shared robots tags back before the
                contact page renders. */}
            <Link
              className="glv-btn glv-btn-primary"
              href="/contact"
              onClick={() => onCta("cta_contact")}
            >
              Contact Marco
            </Link>
            {BOOKINGS_URL && (
              <a
                className="glv-btn glv-btn-ghost"
                href={BOOKINGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onCta("cta_bookings")}
              >
                Pick a slot
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="glv-footer">
        <div className="glv-wrap">
          <span>Eclectik &middot; Haarlem, NL &middot; eclectik.co</span>
          <span>Insights that help employees thrive</span>
        </div>
      </footer>
    </div>
  );
}
