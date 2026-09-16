import { useEffect } from "react";
import { trackMicrosoftPage } from "@/lib/tracking";
import "./MicrosoftSellers.css";

/**
 * /microsoft: the landing page behind the link we mail to Microsoft sellers,
 * account executives and partner teams.
 *
 * Briefing: "Briefing Olivier: landingspagina voor Microsoft-collega's",
 * Marco, 15 September 2026. The English copy below is his, taken over
 * verbatim from paragraph 4 of that briefing.
 *
 * This is not a public website page. It renders without Layout, so it has no
 * SiteHeader and no SiteFooter: the briefing asks for no navigation and no
 * exit path other than the call to action. It is kept out of sitemap.xml and
 * out of the header nav, and carries noindex both as the meta tag below and as
 * an X-Robots-Tag header on this path in vercel.json. The header is the one
 * that counts: this is a client-rendered SPA, so a crawler that does not run
 * the JS never sees the meta tag. robots.txt deliberately says nothing about
 * this path, because a Disallow would publish the URL in a file anyone can read
 * and would stop crawlers from fetching the page to see the noindex at all.
 *
 * None of that is access control. Anyone holding the URL can open it, which is
 * intended: the mail asks recipients to forward it to colleagues.
 *
 * BEFORE THIS GOES LIVE (briefing paragraph 7, in Marco's words "belangrijker
 * dan de vormgeving"):
 *  1. Consent for the quote. Cleared: Olivier confirmed approval on
 *     15 September 2026 and QUOTE_APPROVED is now true. The quote and its
 *     attribution are live. Note that country plus sector plus month is
 *     traceable to one person for an insider, so any change to the attribution
 *     line needs the same approval again.
 *  2. No client names. Not the insurer, not LHH, not RS, not in unnamed form.
 *  3. No numbers. No result percentage and no amount until the baseline is
 *     confirmed internally, and then as a ratio only.
 *  4. ECIF and MCI. The funding block repeats our own outbound mail. Microsoft
 *     programme rules change per fiscal year and were not verified. Have Manish
 *     or our Microsoft contact confirm the wording before this is public.
 */

/**
 * Approved on 15 September 2026, so the proof block carries the AE's quote and
 * its attribution. Setting this back to false swaps in the fallback the
 * briefing prescribes: the three characteristics, without quotation marks and
 * without the attribution line.
 */
const QUOTE_APPROVED = true;

/**
 * Bookings link for the second CTA, Marco's Microsoft Bookings page. Empty
 * means the button does not render: a dead "Pick a slot" costs more than one
 * missing button.
 */
const BOOKINGS_URL =
  "https://bookings.cloud.microsoft/book/MeetingwithMarco@eclectik.co/?ismsaljsauthenabled";

const MAILTO =
  "mailto:marco@eclectik.co" +
  "?subject=" +
  encodeURIComponent("20-minute intro: measuring Copilot value");

/** The three reasons the AE gave, used with the quote and without it. */
const RECIPE = [
  "Delivered by a third party, independent partner",
  "Empirical data science method, with stated statistical confidence",
  "Runs on one hundred percent customer data",
];

interface Motion {
  eyebrow: string;
  heading: string;
  body: string;
  deliverables: string[];
}

const MOTIONS: Motion[] = [
  {
    eyebrow: "Pre-sales",
    heading: "Build the value case",
    body: "Before the customer commits, we size what the investment should return and where. Not a benchmark slide. A case built on their own baseline, traced through to the P&L line it lands on.",
    deliverables: [
      "Baseline on the customer's existing data, no new survey burden",
      "Value hypotheses per function, with the KPI each one moves",
      "Modelled P&L impact and the confidence attached to it",
      "A CFO-ready readout your account team presents",
    ],
  },
  {
    eyebrow: "Post-sales",
    heading: "Find the pockets of value",
    body: "After rollout, usage data tells you who logged in. We tell you which groups, roles and behaviours are actually producing impact, who is dormant, and which intervention moves them.",
    deliverables: [
      "Value map by team, role and behaviour, not by seat count",
      "Dormant and at-risk seats identified before renewal",
      "The specific intervention per segment, and what it should return",
      "Re-measurement, so the effect of the intervention is evidenced",
    ],
  },
];

interface Shape {
  size: string;
  account: string;
  preSales: string;
  postSales: string;
}

/* Seat counts only. The Microsoft slide that inspired this table carried
   investment amounts and tier names; none of that is ours to publish. */
const SHAPES: Shape[] = [
  {
    size: "XS",
    account: "300+ Copilot seats",
    preSales: "Focused value case, one function",
    postSales: "Value map, one business unit",
  },
  {
    size: "S",
    account: "500+ Copilot seats",
    preSales: "Value case across two to three functions",
    postSales: "Value map plus intervention design",
  },
  {
    size: "M",
    account: "1,500+ Copilot seats",
    preSales: "Enterprise value case with P&L traceability",
    postSales: "Value map, interventions, re-measurement",
  },
  {
    size: "L",
    account: "3,000+ Copilot seats",
    preSales: "Enterprise value case, multi-market",
    postSales: "Full programme measurement across waves",
  },
];

const FUNDING = [
  {
    tick: "FUNDING",
    heading: "ECIF eligible",
    body: "The engagement is partner-led and ECIF eligible. MCI routes run with our partners.",
  },
  {
    tick: "TIMELINE",
    heading: "Six to eight weeks",
    body: "Run on data the customer already has. No new platform, no survey programme to stand up.",
  },
  {
    tick: "OUTPUT",
    heading: "A readout at CFO level",
    body: "Independent findings your account team can take into the renewal and the expansion conversation.",
  },
];

export default function MicrosoftSellers() {
  useEffect(() => {
    trackMicrosoftPage("ms_page_viewed");
  }, []);

  /**
   * index.html carries site-wide `robots: index, follow` and `googlebot:
   * index, follow` meta tags, and React appends this page's own noindex
   * alongside them rather than replacing them. Googlebot gives a `googlebot`
   * tag precedence over a `robots` one, so leaving them as they are would hand
   * a crawler that renders the JS an explicit instruction to index this page.
   *
   * The X-Robots-Tag header on /microsoft is the authority either way; this
   * stops the rendered DOM from contradicting it. The tags are shared with
   * every other route in the SPA, so their values are put back on unmount.
   */
  useEffect(() => {
    const tags = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="robots"], meta[name="googlebot"]'),
    );
    const previous = tags.map((tag) => tag.content);
    tags.forEach((tag) => {
      tag.content = "noindex, nofollow";
    });
    return () => {
      tags.forEach((tag, i) => {
        tag.content = previous[i];
      });
    };
  }, []);

  const onCta = (cta: string) => trackMicrosoftPage("ms_cta_clicked", { cta });

  return (
    <div className="msl">
      <title>For Microsoft field teams | Eclectik</title>
      <meta
        name="description"
        content="Independent measurement of what a Copilot investment returns. Partner-led, built on the customer's own data, with a readout that lands with the CFO."
      />
      <meta name="robots" content="noindex, nofollow" />

      <header className="msl-masthead">
        <div className="msl-wrap">
          {/* Not a link. The briefing asks for no exit path other than the CTA,
              and the logo is the exit path every visitor reaches for first. */}
          <img
            src="/images/eclectik-logo-dark-photo.svg"
            alt="Eclectik"
            className="msl-logo msl-logo-dark"
          />
          <img
            src="/images/eclectik-logo-white-photo.svg"
            alt="Eclectik"
            className="msl-logo msl-logo-light"
          />
          <span className="msl-stamp">For Microsoft field teams</span>
        </div>
      </header>

      <section className="msl-hero">
        <div className="msl-wrap">
          <div className="msl-hero-grid">
            <div>
              <p className="msl-eyebrow">Independent AI value measurement</p>
              {/* Near enough the subject line of the 8 September mail that the
                  reader recognises where he clicked from. */}
              <h1>
                Your customer bought Copilot. Now the CFO wants the number.
              </h1>
              <p className="msl-lede">
                We are the third party that produces that number. Empirical
                method, statistical confidence, one hundred percent customer
                data, and a readout that lands with the CFO, which is exactly
                where your next deal starts.
              </p>
              <div className="msl-actions">
                {/* The label says "book", so it opens Bookings. It falls back
                    to the mailto rather than disappearing the way the second
                    CTA does: the hero cannot be left without a primary action. */}
                <a
                  className="msl-btn msl-btn-primary"
                  href={BOOKINGS_URL || MAILTO}
                  target={BOOKINGS_URL ? "_blank" : undefined}
                  rel={BOOKINGS_URL ? "noopener noreferrer" : undefined}
                  onClick={() => onCta(BOOKINGS_URL ? "hero_bookings" : "hero_email")}
                >
                  Book a 20-minute intro
                </a>
                <a
                  className="msl-btn msl-btn-ghost"
                  href="#what"
                  onClick={() => onCta("hero_see_what_we_deliver")}
                >
                  See what we deliver
                </a>
              </div>
            </div>
            <figure>
              <svg
                viewBox="0 0 320 210"
                role="img"
                aria-label="Illustrative chart. Two lines start at the same point at go-live. Seats deployed rises steadily across four quarters. Measured value stays flat until an intervention point halfway, then rises sharply to meet it."
              >
                <g stroke="var(--msl-rule)" strokeWidth="1">
                  <line x1="44" y1="18" x2="44" y2="168" />
                  <line x1="44" y1="168" x2="306" y2="168" />
                </g>
                <g
                  stroke="var(--msl-rule)"
                  strokeWidth=".5"
                  strokeDasharray="2 4"
                >
                  <line x1="44" y1="130" x2="306" y2="130" />
                  <line x1="44" y1="92" x2="306" y2="92" />
                  <line x1="44" y1="54" x2="306" y2="54" />
                </g>
                <path
                  d="M44 160 L110 132 L176 104 L242 74 L300 48"
                  fill="none"
                  stroke="var(--msl-ink-3)"
                  strokeWidth="2"
                />
                <path
                  d="M44 160 L110 154 L176 150 L242 118 L300 62"
                  fill="none"
                  stroke="var(--msl-accent)"
                  strokeWidth="2.5"
                />
                <line
                  x1="176"
                  y1="62"
                  x2="176"
                  y2="168"
                  stroke="var(--msl-flag-mark)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx="176" cy="150" r="3.5" fill="var(--msl-flag-mark)" />

                {/* Legend sits in the empty top-left quadrant. Labelling the
                    line ends on the right, as the mockup did, put the two
                    series names and "intervention" on top of one another. */}
                <line
                  x1="50"
                  y1="28"
                  x2="64"
                  y2="28"
                  stroke="var(--msl-ink-3)"
                  strokeWidth="2"
                />
                <text x="70" y="31" fill="var(--msl-ink-3)">
                  seats deployed
                </text>
                <line
                  x1="50"
                  y1="45"
                  x2="64"
                  y2="45"
                  stroke="var(--msl-accent)"
                  strokeWidth="2.5"
                />
                <text x="70" y="48" fill="var(--msl-accent)">
                  measured value
                </text>

                <text x="171" y="76" fill="var(--msl-flag)" textAnchor="end">
                  intervention
                </text>
                <text x="38" y="171" fill="var(--msl-ink-3)" textAnchor="end">
                  0
                </text>
                <text x="44" y="186" fill="var(--msl-ink-3)">
                  go-live
                </text>
                <text x="300" y="186" fill="var(--msl-ink-3)" textAnchor="end">
                  +4 quarters
                </text>
              </svg>
              {/* The briefing makes this caption mandatory: the shape is drawn,
                  not measured, and must never read as customer data. */}
              <figcaption>
                Illustrative. Seats deployed is not value realised. The gap is
                what we measure, and the intervention point is what we help you
                find.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="msl-proof">
        <div className="msl-wrap">
          <p className="msl-eyebrow">
            {QUOTE_APPROVED
              ? "Proof, in a colleague's words"
              : "What makes a value project land"}
          </p>
          <div className="msl-proof-grid">
            <div>
              {QUOTE_APPROVED ? (
                <>
                  <blockquote>
                    <p>
                      &ldquo;We partnered with Eclectik to do a Business Value
                      Assessment, focusing on the Customer Service organization,
                      People Managers and Leaders. The assessment delivered
                      great results: the customer is now pitching the results
                      internally at every LOB, and a second insurance group is
                      actively looking at the work we did.&rdquo;
                    </p>
                  </blockquote>
                  <p className="msl-attrib">
                    Microsoft Account Executive, Switzerland
                    <br />
                    Large US insurance account &middot; Copilot Business Value
                    Assessment, June 2026
                  </p>
                </>
              ) : (
                <blockquote>
                  <p>
                    An Account Executive who ran a Business Value Assessment
                    with us described the recipe for an ideal value project in
                    three parts. We build every engagement to that
                    specification.
                  </p>
                </blockquote>
              )}
            </div>
            <div>
              <p className="msl-eyebrow" style={{ marginBottom: "6px" }}>
                {QUOTE_APPROVED
                  ? "Why it worked, per the same AE"
                  : "The three parts"}
              </p>
              <ul className="msl-recipe">
                {RECIPE.map((reason, i) => (
                  <li key={reason}>
                    <span className="msl-k">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="what">
        <div className="msl-wrap">
          <p className="msl-eyebrow">What we do with you</p>
          <h2>Two motions, one measurement system</h2>
          <p style={{ color: "var(--msl-ink-2)" }}>
            Partner-led on both sides. You keep the account relationship; we
            bring the instrument, the analysis and the independence.
          </p>
          <div className="msl-motions">
            {MOTIONS.map(motion => (
              <div className="msl-motion" key={motion.heading}>
                <p className="msl-eyebrow">{motion.eyebrow}</p>
                <h3>{motion.heading}</h3>
                <p>{motion.body}</p>
                <ul className="msl-deliverables">
                  {motion.deliverables.map(item => (
                    <li key={item}>
                      <span className="msl-n" aria-hidden="true">
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
        <div className="msl-wrap">
          <p className="msl-eyebrow">The distinction the work turns on</p>
          <h2>Adoption is usage. Immersion is impact.</h2>
          {/* A transformation lead at a client wrote this back to us and asked
              for material on it. His employer stays off the page. */}
          <p style={{ color: "var(--msl-ink-2)" }}>
            A transformation lead at one of our clients put it back to us better
            than we had: adoption is ultimately about usage, immersion is about
            AI becoming embedded in the way people actually work. Only one of
            the two predicts a number the CFO will accept.
          </p>
          <div className="msl-compare">
            <div className="msl-a">
              <h3>Adoption, what dashboards show</h3>
              <p>
                Licences assigned. Monthly active users. Prompts sent.
                Necessary, and comfortably reported, but it cannot tell you
                whether any hour freed up turned into anything.
              </p>
            </div>
            <div className="msl-b">
              <h3>Immersion, what we measure</h3>
              <p>
                Whether the work itself changed shape: which tasks moved, where
                the released capacity landed, and which of those shifts survives
                contact with a controlled comparison.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="msl-wrap">
          <p className="msl-eyebrow">Engagement shapes</p>
          <h2>Sized to the account, not to a package</h2>
          <div className="msl-tablewrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Typical account</th>
                  <th scope="col">Pre-sales, value case</th>
                  <th scope="col">Post-sales, scaling usage</th>
                </tr>
              </thead>
              <tbody>
                {SHAPES.map(shape => (
                  <tr key={shape.size}>
                    <td className="msl-size">{shape.size}</td>
                    <td className="msl-num">{shape.account}</td>
                    <td>{shape.preSales}</td>
                    <td>{shape.postSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="msl-tnote">
            Indicative shapes for this conversation. Actual scope, duration and
            funding route are agreed per account with you and the partner
            delivering.
          </p>
        </div>
      </section>

      <section>
        <div className="msl-wrap">
          <p className="msl-eyebrow">How it lands for you</p>
          <div className="msl-funding">
            {FUNDING.map(item => (
              <div key={item.heading}>
                <span className="msl-tick">{item.tick}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="msl-cta" id="contact">
        <div className="msl-wrap">
          <p className="msl-eyebrow">Next step</p>
          <h2>Have an account under value pressure?</h2>
          <p>
            Twenty minutes is enough to tell you whether there is a measurable
            case in the account, and which of the two motions fits. If there is
            not, we will say so.
          </p>
          <div className="msl-actions">
            <a
              className="msl-btn msl-btn-primary"
              href={MAILTO}
              onClick={() => onCta("cta_email")}
            >
              Email Marco
            </a>
            {BOOKINGS_URL && (
              <a
                className="msl-btn msl-btn-ghost"
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

      <footer className="msl-footer">
        <div className="msl-wrap">
          <span>Eclectik &middot; Haarlem, NL &middot; eclectik.co</span>
          <span>Independent AI value measurement</span>
        </div>
      </footer>
    </div>
  );
}
