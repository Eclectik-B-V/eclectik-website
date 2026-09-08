import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { getAttribution } from "@/lib/tracking";
import { isWorkEmail } from "@shared/work-email";
import "./EventAmsterdam2026.css";

/**
 * Event page for the Workvivo/Eclectik afternoon in Amsterdam, 6 October 2026.
 * Design spec: docs/superpowers/specs/2026-09-08-event-amsterdam-2026-design.md
 *
 * The dark Workvivo design lives inside the .evt wrapper; every rule in
 * EventAmsterdam2026.css is scoped to it so the rest of the site is untouched.
 */

const EVENT_START_MS = Date.parse("2026-10-06T12:15:00+02:00");
const EVENT_END_MS = Date.parse("2026-10-06T16:30:00+02:00");

const PHOTOS = {
  marc: "/images/events/amsterdam-2026/marc-van-veldhoven.jpg",
  steven: "/images/events/amsterdam-2026/steven-buck.jpg",
  marco: "/images/events/amsterdam-2026/marco-van-gelder.jpg",
} as const;

type SpeakerKey = keyof typeof PHOTOS;

const SPEAKER_NAMES: Record<SpeakerKey, string> = {
  marc: "Prof. dr. Marc van Veldhoven",
  steven: "Steven Buck",
  marco: "Marco van Gelder",
};

interface Session {
  card: { title: string; accent: string };
  heading: string;
  time: string;
  description: string;
  who?: SpeakerKey[];
}

const SESSIONS: Session[] = [
  {
    card: { title: "Registration", accent: "& Lunch" },
    heading: "Registration & Networking Lunch",
    time: "Tue, Oct 6, 2026 12:15 PM – 1:00 PM CEST",
    description: "Welcome in the double-height lobby of the Parnassus Tower.",
  },
  {
    card: { title: "The first", accent: "measurement" },
    heading: "Opening: who steers your AI transformation?",
    time: "Tue, Oct 6, 2026 1:00 PM – 1:25 PM CEST",
    description:
      "Not an ice-breaker. A live anonymous poll on the room itself. Who owns AI here, has a commitment already been made outside HR, for which group has the work actually changed, and is AI currently a help or an extra burden for your frontline. Results go on screen immediately.",
  },
  {
    card: { title: "Keynote", accent: "Tilburg University" },
    heading: "Implemented is not the same as experienced",
    time: "Tue, Oct 6, 2026 1:25 PM – 1:50 PM CEST",
    description:
      "What employees perceive of an activity decides whether the implemented policy achieves what it was meant to achieve. With AI, that gap is wider than ever. Picks up the poll results live.",
    who: ["marc"],
  },
  {
    card: { title: "Part 1", accent: "Measure it" },
    heading: "What is AI doing to the work, and for whom?",
    time: "Tue, Oct 6, 2026 1:50 PM – 2:35 PM CEST",
    description:
      "Eclectik opens with two of its own cases: objective diagnosis first, then the translation to employees. Workvivo follows with the instrument, a targeted pulse rather than the annual survey. AI acts as a demand and as a resource at the same time, and which one dominates differs per group. It has to be measured, not assumed. Closing exercise: for which group in your organisation would you least like to guess the answer?",
    who: ["marco", "steven"],
  },
  {
    card: { title: "Coffee", accent: "Break" },
    heading: "Coffee Break",
    time: "Tue, Oct 6, 2026 2:35 PM – 2:50 PM CEST",
    description: "At the coffee bar.",
  },
  {
    card: { title: "Part 2", accent: "Steer it" },
    heading: "The steering levers, with a live demo",
    time: "Tue, Oct 6, 2026 2:50 PM – 3:25 PM CEST",
    description:
      "What you actually adjust once the diagnosis is in: transparency about what AI will and will not do, perceived fairness, and human oversight. Steven Buck gives a live demo of Workvivo HQ and HQ Agent as the lever that reaches everyone, frontline first, and takes questions from the room as they come up. Closing exercise: which three questions do your team leaders answer every week?",
    who: ["steven"],
  },
  {
    card: { title: "Part 3", accent: "Prove it" },
    heading: "Which pilot do you stop?",
    time: "Tue, Oct 6, 2026 3:25 PM – 3:50 PM CEST",
    description:
      "Unguided experimentation is expensive not because AI is expensive, but because you cannot tell which pilot to stop. How to connect employee data to performance indicators, which claims survive a conversation with the CFO, and which do not. Participants fill in a one-page worksheet for their own organisation.",
    who: ["marco"],
  },
  {
    card: { title: "Close &", accent: "Networking" },
    heading: "Close and Networking Reception",
    time: "Tue, Oct 6, 2026 3:50 PM – 4:30 PM CEST",
    description:
      "The loop in one slide, then drinks around the coffee bar. Optional customers corner with a Seer and Workvivo HQ roadmap preview.",
  },
];

/**
 * A closed list rather than a free text field. The registrations end up in one
 * CRM export that a human reads before confirming a place, and free text turns
 * "Netherlands" into NL, Nederland, Holland and the-netherlands within a day.
 * The list covers where in-person guests for an Amsterdam afternoon realistically
 * travel from, with an escape hatch at the end.
 */
const COUNTRIES = [
  "Netherlands",
  "Belgium",
  "Germany",
  "Austria",
  "Czechia",
  "Denmark",
  "Finland",
  "France",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Luxembourg",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
];

type Phase = "before" | "during" | "after";

interface Clock {
  phase: Phase;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function readClock(): Clock {
  const now = Date.now();
  if (now >= EVENT_END_MS) return { phase: "after", days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (now >= EVENT_START_MS) return { phase: "during", days: 0, hours: 0, minutes: 0, seconds: 0 };
  const sec = Math.floor((EVENT_START_MS - now) / 1000);
  return {
    phase: "before",
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
  };
}

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));

/**
 * Counts down to the opening of the doors. Once the event is over the timer
 * stops for good; in between it says so rather than showing four zeroes.
 */
function Countdown() {
  const [clock, setClock] = useState<Clock>(readClock);

  useEffect(() => {
    if (clock.phase === "after") return;
    const id = setInterval(() => setClock(readClock()), 1000);
    return () => clearInterval(id);
  }, [clock.phase]);

  if (clock.phase === "during") {
    return (
      <p className="count-msg">This session is under way at the Zoom office in Amsterdam.</p>
    );
  }
  if (clock.phase === "after") {
    return (
      <p className="count-msg">
        This event has taken place. Thank you to everyone who joined us in Amsterdam.
      </p>
    );
  }

  return (
    <div className="count" aria-label="Time remaining until the event starts">
      <div>
        <div className="n">{clock.days}</div>
        {/* The other three are zero-padded, so they read as clock digits and
            keep their plural. This one does not. */}
        <div className="l">{clock.days === 1 ? "DAY" : "DAYS"}</div>
      </div>
      <div>
        <div className="n">{pad(clock.hours)}</div>
        <div className="l">HOURS</div>
      </div>
      <div>
        <div className="n">{pad(clock.minutes)}</div>
        <div className="l">MINUTES</div>
      </div>
      <div>
        <div className="n">{pad(clock.seconds)}</div>
        <div className="l">SECONDS</div>
      </div>
    </div>
  );
}

function SpeakerChip({ who }: { who: SpeakerKey }) {
  return (
    <span className="chip">
      {/* alt="" on purpose: the name sits right next to the photo, so a second
          reading of it would only be noise in a screen reader. */}
      <span className="dot">
        <img src={PHOTOS[who]} alt="" loading="lazy" decoding="async" />
      </span>
      {SPEAKER_NAMES[who]}
    </span>
  );
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  jobTitle: "",
  country: "",
  phone: "",
};

type RegistrationState = "form" | "registered" | "duplicate";

export default function EventAmsterdam2026() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<RegistrationState>("form");

  const field =
    (name: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      toast.error("Please tick the consent box to complete your registration");
      return;
    }
    if (!isWorkEmail(form.email)) {
      toast.error("Please use your business email address");
      return;
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const phone = form.phone.trim();

    setSubmitting(true);
    try {
      const res = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Field names match BodySchema in api/event-registration.ts. The event
        // itself (slug, name, date) is a constant on the server, so it is not
        // sent from here. phone is left out entirely when empty rather than
        // sent as "": the schema has it optional.
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email.trim(),
          company: form.company.trim(),
          jobTitle: form.jobTitle.trim(),
          country: form.country,
          ...(phone ? { phone } : {}),
          consent: true,
          src: getAttribution(),
        }),
      });

      if (res.status === 409) {
        // Already on the list. Not an error: say so and stop. The handler does
        // not emit a 409 today (the CRM cannot tell a repeat from a first
        // registration), so this is the branch for when it can.
        setState("duplicate");
        toast.info("You are already registered for this event.");
        return;
      }

      const data = await res.json().catch(() => ({}) as { error?: string });

      if (!res.ok) {
        toast.error(
          typeof data.error === "string" && data.error
            ? data.error
            : "Registration failed. Please try again.",
        );
        return;
      }

      setState("registered");
      toast.success("You're registered. Check your inbox for the confirmation.");
    } catch {
      // fetch only rejects on a network-level failure; anything the server
      // answered is handled above.
      toast.error("Could not reach the registration service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <title>AI Transformation: Measure It. Steer It. Prove It. | Eclectik</title>
      <meta
        name="description"
        content="Half-day working session for CPOs, CHROs and senior People leaders on steering AI transformation. Amsterdam, 6 October 2026, by Workvivo by Zoom and Eclectik."
      />
      <link rel="canonical" href="https://www.eclectik.co/events/amsterdam-2026" />
      {/* The event design is set in Inter; the site loads Outfit, Plus Jakarta
          Sans and Figtree, so this page fetches the one face it adds. */}
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      />

      <div className="evt">
        {/* Event branding strip. Kept from the mockup as the co-brand for the
            afternoon and as the seam between the site header and the dark
            design; the mockup's fake "English" language switcher is gone. */}
        <div className="topbar">
          <div className="wrap">
            <div className="mark">
              <span className="word">seer</span>
              <span className="sub">by workvivo</span>
            </div>
            <div className="topbar-meta">Amsterdam · 6 October 2026</div>
          </div>
        </div>

        <div className="wrap hero">
          <div className="hero-grid">
            <div className="cover">
              <div className="cover-txt">
                <h1>
                  AI transformation:<em>Measure it. Steer it. Prove it.</em>
                </h1>
              </div>
              <div className="brandrow">
                <span className="w">seer</span>
                <span className="t">
                  by workvivo
                  <br />
                  with Eclectik
                </span>
              </div>
            </div>

            <div className="panel">
              <p className="date">
                Tuesday, October 6, 2026
                <br />
                12:15 – 16:30 CEST
              </p>
              <h2>AI Transformation: Measure It. Steer It. Prove It.</h2>
              <p className="deck">AI Is Everywhere. The Experience Isn’t.</p>
              <p className="org">Organised by Workvivo by Zoom and Eclectik</p>
              <p className="venue">Zoom Office Amsterdam</p>
              <p className="addr">
                Parnassus Tower, Locatellikade 1, 1076 AZ Amsterdam, The Netherlands
              </p>
              <a className="cta" href="#register">
                Register now
              </a>
              <p className="cta-note">Registration handled by Eclectik</p>
              <p className="free">
                This event is FREE to attend and 100% in-person!
                <em>(Be sure to use your business email address to register!)</em>
              </p>
            </div>
          </div>
        </div>

        <section className="wrap about">
          <h3>AI Is Everywhere. The Experience Isn’t.</h3>
          <p className="lead">
            AI transformation is decided at the top and experienced at the bottom. Almost nobody
            measures the distance between the two.
          </p>
          <p>
            In most organisations the AI transformation is driven by IT or by a board mandate.
            Pilots start, licences get bought, a policy document appears. HR is brought in later,
            for reskilling and change management. Meanwhile employees are left with the questions
            nobody answers: am I allowed to use this, will it cost me my job, and why does the
            office get an assistant while the shop floor gets nothing.
          </p>
          <p>
            So this afternoon does not ask you to predict which jobs will exist in 2029. It asks a
            question you can actually act on:{" "}
            <span className="hl">
              the transformation is already running, with or without you. Can you steer it?
            </span>
          </p>
          <p>
            On Tuesday, October 6 in Amsterdam, Workvivo and Eclectik bring together a select group
            of CPOs, CHROs and senior People leaders for a half-day working session on guided
            transformation as a control loop: measure what has actually changed in the work,
            interpret for whom AI is a resource and for whom it is an extra demand, steer on the
            levers that move the outcome, then measure again.
          </p>
          <p>
            This is a practical afternoon for leaders who are done watching AI happen to their
            organisation.
          </p>

          <p className="kicker">Speakers:</p>
          <ul className="list">
            <li>
              <b>Prof. dr. Marc van Veldhoven</b>, Professor of Work, Health and Well-being, Tilburg
              University
            </li>
            <li>
              <b>Marco van Gelder</b>, Chief Strategy Officer at Eclectik
            </li>
            <li>
              <b>Steven Buck</b>, Principal People Scientist, Seer by Workvivo
            </li>
          </ul>

          <p className="kicker">You'll leave with:</p>
          <ul className="list">
            <li>
              <b>An independent academic perspective</b> from Tilburg University on why implemented
              is not the same as experienced, and why that gap is wider with AI than with anything
              before it.
            </li>
            <li>
              <b>How you can strengthen the role of HR</b> in your organisation's AI transformation.
            </li>
            <li>
              <b>A diagnostic frame</b> for finding where AI lands as a resource and where it lands
              as an extra demand, and for whom. You cannot read that off a rollout plan.
            </li>
            <li>
              <b>The steering levers that actually move the outcome:</b> transparency, perceived
              fairness and human oversight, and how they reach every employee including the people
              without a desk.
            </li>
            <li>
              <b>A live demo of Workvivo HQ and HQ Agent</b>, presented by Steven Buck rather than
              played from a recording, so the questions that come up in the room get answered in the
              room. Built for the workforce that does not sit behind a desk: 62% of desk workers use
              AI regularly, only 32% of frontline workers do.
            </li>
            <li>
              <b>A way to tell a working pilot from an expensive one</b>, and a one-page worksheet
              you fill in for your own organisation.
            </li>
            <li>
              <b>A network of peers</b> working through exactly the same challenges.
            </li>
          </ul>

          <p className="small-note">
            We've kept this group deliberately small so the conversation stays honest, the room
            stays engaged, and everyone leaves with something real that they can implement right
            after. The programme ends at 16:30, so you are on the road before the evening rush.
          </p>
          <p className="small-note">If that sounds like your kind of afternoon, we'd love to have you there.</p>
          <a className="save" href="#register">
            Spaces are limited. Save your place now!
          </a>
        </section>

        <section className="wrap">
          <h3 className="sec">Speakers</h3>
          <div className="spk">
            <figure>
              <div className="avatar">
                <img
                  src={PHOTOS.marc}
                  alt="Prof. dr. Marc van Veldhoven, Professor of Work, Health and Well-being at Tilburg University"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="nm">Prof. dr. Marc van Veldhoven</p>
              <p className="rl">Professor of Work, Health and Well-being</p>
              <p className="or">Tilburg University</p>
              <span className="tag">Keynote</span>
            </figure>
            <figure>
              <div className="avatar">
                <img
                  src={PHOTOS.steven}
                  alt="Steven Buck, Principal People Scientist at Seer by Workvivo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="nm">Steven Buck</p>
              <p className="rl">Principal People Scientist</p>
              <p className="or">Seer by Workvivo</p>
              <span className="tag">Lead presenter</span>
            </figure>
            <figure>
              <div className="avatar">
                <img
                  src={PHOTOS.marco}
                  alt="Marco van Gelder, Chief Strategy Officer at Eclectik"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="nm">Marco van Gelder</p>
              <p className="rl">Chief Strategy Officer</p>
              <p className="or">Eclectik</p>
              <span className="tag">Confirmed</span>
            </figure>
          </div>
        </section>

        <div className="wrap">
          <Countdown />
        </div>

        <section className="wrap" id="sessions">
          <h3 className="sec">Sessions</h3>
          <div className="sessions-box">
            {SESSIONS.map((session) => (
              <div className="srow" key={session.heading}>
                <div className="thumb">
                  <div className="thumb-in">
                    <span className="lg">seer</span>
                    <span className="tt">
                      {session.card.title}
                      <em>{session.card.accent}</em>
                    </span>
                  </div>
                </div>
                <div className="smeta">
                  <h4>{session.heading}</h4>
                  <p className="stime">{session.time}</p>
                  <p className="sdesc">{session.description}</p>
                  {session.who && (
                    <div className="who">
                      {session.who.map((who) => (
                        <SpeakerChip key={who} who={who} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wrap" id="register">
          <h3 className="sec">Register</h3>
          <div className="reg">
            {state === "form" ? (
              <form onSubmit={handleSubmit}>
                <h4>Reserve your place</h4>
                <p className="sub">
                  Registration is handled by Eclectik. Places are confirmed after a short check on
                  role.
                </p>
                <div className="fields">
                  <div className="fld">
                    <label htmlFor="evt-first-name">
                      First name <span className="req">*</span>
                    </label>
                    <input
                      id="evt-first-name"
                      name="firstName"
                      type="text"
                      required
                      autoComplete="given-name"
                      maxLength={100}
                      value={form.firstName}
                      onChange={field("firstName")}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="evt-last-name">
                      Last name <span className="req">*</span>
                    </label>
                    <input
                      id="evt-last-name"
                      name="lastName"
                      type="text"
                      required
                      autoComplete="family-name"
                      maxLength={100}
                      value={form.lastName}
                      onChange={field("lastName")}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="evt-email">
                      Business email <span className="req">*</span>
                    </label>
                    <input
                      id="evt-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={200}
                      value={form.email}
                      onChange={field("email")}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="evt-company">
                      Company <span className="req">*</span>
                    </label>
                    <input
                      id="evt-company"
                      name="company"
                      type="text"
                      required
                      autoComplete="organization"
                      maxLength={200}
                      value={form.company}
                      onChange={field("company")}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="evt-job-title">
                      Job title <span className="req">*</span>
                    </label>
                    <input
                      id="evt-job-title"
                      name="jobTitle"
                      type="text"
                      required
                      autoComplete="organization-title"
                      maxLength={100}
                      value={form.jobTitle}
                      onChange={field("jobTitle")}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="evt-country">
                      Country <span className="req">*</span>
                    </label>
                    <select
                      id="evt-country"
                      name="country"
                      required
                      autoComplete="country-name"
                      value={form.country}
                      onChange={field("country")}
                    >
                      <option value="" disabled>
                        Select a country
                      </option>
                      {COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="fld full">
                    <label htmlFor="evt-phone">Phone (optional)</label>
                    <input
                      id="evt-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      value={form.phone}
                      onChange={field("phone")}
                    />
                  </div>
                </div>

                {/*
                  Consent copy supplied by Workvivo, used verbatim. Two objections
                  are on record in the design doc, and both need a conversation
                  with Workvivo rather than a change on our side:

                  1. One required tick covers two things. "To process your request"
                     is needed to put someone on the guest list; "provide relevant
                     updates or services" is marketing. Because the tick is required
                     to submit, anyone who only wants to attend has to accept
                     marketing too. Consent has to be freely given, and attendance
                     may not depend on something attendance does not need.
                  2. "our Privacy Policy" is ambiguous. The form sits on eclectik.co,
                     so a reader thinks of Eclectik. Workvivo wrote the line, where
                     "our" means theirs. Once Workvivo holds the data, their policy
                     governs what they do with it.

                  The split version below is ready to swap in once the two
                  organisers agree. It needs a second `consentMarketing` state, and
                  that field travels in the free payload to the CRM. `consent` stays
                  as it is for the required half, so the API contract does not move.

                  <label className="consent">
                    <input type="checkbox" className="tick" name="consentEvent"
                      checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span className="ctext">
                      I agree that Eclectik shares my registration details with Workvivo
                      by Zoom, so that both organisers can process my registration and
                      contact me about this event.
                    </span>
                  </label>
                  <label className="consent">
                    <input type="checkbox" className="tick" name="consentMarketing"
                      checked={consentMarketing}
                      onChange={(e) => setConsentMarketing(e.target.checked)} />
                    <span className="ctext">
                      Workvivo by Zoom and Eclectik may also send me updates about their
                      products and services. I can withdraw this at any time.
                    </span>
                  </label>
                  <p className="ctext">
                    See the <Link href="/privacy-policy">Eclectik privacy policy</Link> and
                    the <a href="https://www.zoom.com/en/trust/privacy/" target="_blank"
                      rel="noopener noreferrer">Workvivo privacy policy</a>.
                  </p>
                */}
                <label className="consent">
                  <input
                    type="checkbox"
                    className="tick"
                    name="consentWorkvivo"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span className="ctext">
                    By ticking this box, you authorize us to share your personal details with
                    Workvivo by Zoom to process your request and provide relevant updates or
                    services. Your information will be handled securely and in accordance with our{" "}
                    <Link href="/privacy-policy">Privacy Policy</Link>, and you may withdraw your
                    consent at any time.
                  </span>
                </label>

                <button type="submit" className="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Complete registration"}
                </button>
                <p className="foot-note">
                  Places are limited. We confirm your place by email after a short check on role.
                </p>
              </form>
            ) : (
              <div className="reg-done">
                <p className="lead-in">
                  {state === "duplicate" ? "Already registered" : "Registration received"}
                </p>
                <h4>
                  {state === "duplicate"
                    ? "You are already on the list"
                    : "Thank you, your registration is in"}
                </h4>
                {state === "duplicate" ? (
                  <p className="body">
                    This email address is already registered for the afternoon of 6 October. There
                    is nothing left for you to do. If you have not had a confirmation, mail us at{" "}
                    <a href="mailto:info@eclectik.co">info@eclectik.co</a> and we will look it up.
                  </p>
                ) : (
                  <>
                    <p className="body">
                      We have your details. A confirmation is on its way to your inbox, and we
                      confirm your place after a short check on role.
                    </p>
                    <p className="body">
                      Tuesday, October 6, 2026, 12:15 to 16:30 CEST, Zoom Office Amsterdam,
                      Parnassus Tower, Locatellikade 1.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="wrap">
          <div className="two">
            <div className="infocard">
              <h4>Venue &amp; getting there</h4>
              <p>
                <strong>Zoom Office Amsterdam</strong>
                <br />
                Parnassus Tower, Locatellikade 1, 1076 AZ Amsterdam
              </p>
              <p>
                Parking is available on the street around the office building at your own cost.
                Amsterdam Zuid station is within walking distance. Please report to the reception
                desk in the lobby on arrival.
              </p>
            </div>
            <div className="infocard">
              <h4>Who this is for</h4>
              <p>
                CPOs, CHROs, HR directors, Heads of People and Employee Experience, and People
                Analytics leads at organisations of 500 employees and up, with an emphasis on
                organisations where a large share of the workforce does not sit behind a desk.
              </p>
              <p>
                The afternoon is held in English. Places are limited and registrations are confirmed
                after a short check on role.
              </p>
            </div>
          </div>
        </section>

        <div className="evt-colophon">
          <div className="wrap foot">
            <span>Organised by Workvivo by Zoom and Eclectik · Amsterdam, 6 October 2026</span>
            <span>
              Prof. dr. Marc van Veldhoven speaks independently and does not endorse any product.
            </span>
          </div>
        </div>

        <div className="bottom-edge" aria-hidden="true" />
      </div>
    </Layout>
  );
}
