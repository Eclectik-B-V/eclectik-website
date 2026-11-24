import { useState } from "react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import {
  getAttribution,
  trackBmaiPosterDownload,
  trackCTAClick,
  trackContactFormSubmission,
} from "@/lib/tracking";

/**
 * /bmai, de pagina over BMAI by Eclectik.
 *
 * De inhoud komt uit het prototype "BMAI Business Model" (versie 0.1). De opmaak
 * niet: die volgt de rest van de site, zodat BMAI leest als iets van Eclectik en
 * niet als een losse microsite. Het prototype had zes onderdelen; het boek, de
 * community en de webshop zijn er op verzoek uit, omdat geen van drie klaar was
 * (geen formaat of prijs, geen sessies, geen levering). Wat overblijft: het
 * verhaal, het model, wat het per rol oplevert, de app en de partners.
 *
 * Eén formulier onderaan vervangt de drie aanmeldingen uit het prototype. Het
 * gaat naar /api/bmai-enquiry, dat de aanvraag als `bmai_enquiry` in het CRM zet
 * zodat hij in de leads-tab verschijnt, en daarnaast een mail stuurt.
 *
 * In de modelsectie staat sinds 24 november 2026 de A3-poster van het model.
 * Downloaden kan pas na naam, e-mail, bedrijf en toestemming voor marketingmail;
 * dat formulier gaat naar /api/bmai-poster, dat pas dan de link teruggeeft.
 *
 * Openbaar sinds 24 november 2026: gelinkt vanuit de header, naast Consulting
 * en in het mobiele menu, en in de sitemap en llms.txt. Daarvoor stond hij op
 * noindex, omdat het bronmateriaal gemarkeerd was als "Concept, not for
 * distribution".
 */

const SECTION = "px-6 py-14 lg:px-16 lg:py-[80px] scroll-mt-24";
const INNER = "mx-auto max-w-[1080px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";
const EYEBROW_DARK =
  "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-on-dark-eyebrow mb-3.5";
const H2 =
  "font-brand tracking-normal font-extrabold text-[28px] leading-[1.1] mb-5 text-pretty lg:text-[40px]";
const PILL =
  "rounded-full font-bold inline-flex items-center min-h-[44px] px-[28px] py-3.5 text-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

const BANDS = [
  {
    name: "People",
    body: "Whether people use the tools, trust them, and have the conditions to change how they work.",
  },
  {
    name: "Process",
    body: "Where the work itself is redesigned around what the tools can now do.",
  },
  {
    name: "Technology",
    body: "The platforms and data behind it, what they cost, and whether they can be trusted.",
  },
];

const AUDIENCE = [
  {
    seat: "Business owners",
    problem: "AI spend with no visible return.",
    answer: "One page that shows which AI work changes results, which is stuck, and what to fix first.",
  },
  {
    seat: "HR and people leads",
    problem: "Tools are used, but not trusted or fully adopted.",
    answer: "A people band that is measured and owned, so adoption is tracked instead of assumed.",
  },
  {
    seat: "IT leads",
    problem: "Tools deployed that nobody owns or uses.",
    answer: "A clear list of what runs, who owns it, and what to fix, merge or retire.",
  },
  {
    seat: "Change and AI leads",
    problem: "Every team talks about AI in a different language.",
    answer: "One shared page to run the conversation from, with an owner named for each layer.",
  },
];

const APP_STEPS = [
  { name: "Map", body: "Place initiatives on the bands and flag anything stalled at “deployed”." },
  { name: "Own", body: "One named owner for each layer, visible to the whole team." },
  { name: "Measure", body: "Leading and outcome indicators, kept apart on the same page." },
];

const PLANS = [
  { name: "Free", body: "One canvas for an individual or a first programme." },
  { name: "Team", body: "Several canvases, shared owners and a history of changes." },
  { name: "Practitioner", body: "For facilitators: a private workspace per client, with certification." },
];

const PARTNERS = [
  { name: "Practitioners", body: "Run BMAI workshops with certification and access to the case library." },
  {
    name: "Consultancies",
    body: "Use the diagnosis to open an AI programme, and hand the redesign to your own teams.",
  },
  { name: "Contributors", body: "Share an anonymised case with consent and earn a place in the library." },
];

/** Voorbeeldcanvas uit het prototype. Fictief, en zo ook gelabeld. */
const EXAMPLE = [
  {
    band: "People",
    items: [
      { label: "Team adoption, claims", flag: false },
      { label: "Enablement: no sessions yet", flag: true },
    ],
  },
  { band: "Process", items: [{ label: "Intake redesigned", flag: false }] },
  {
    band: "Technology",
    items: [
      { label: "Assistant v2", flag: false },
      { label: "Data layer incomplete", flag: true },
    ],
  },
];

/**
 * Korte ids gaan het CRM in, de labels zijn voor de bezoeker. Houd in sync met
 * INTERESTS in api/bmai-enquiry.ts.
 */
const INTERESTS = [
  { id: "organisation", label: "Using BMAI in my organisation" },
  { id: "partner", label: "Becoming a BMAI partner" },
  { id: "app", label: "The BMAI Canvas app" },
] as const;

const FIELD =
  "mt-1.5 w-full rounded-lg border border-ec-line-3 bg-white px-4 py-3 text-[16px] text-ec-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky";
const LABEL = "block text-[15px] font-semibold text-ec-navy";

function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [interest, setInterest] = useState<string>(INTERESTS[0].id);
  const [consent, setConsent] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill in your name and email address.");
      return;
    }
    if (!consent) {
      toast.error("Please tick the box so we can store your enquiry.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/bmai-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          company: company.trim(),
          role: role.trim(),
          interest,
          consent: true,
          consentMarketing,
          src: getAttribution() ?? undefined,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      trackContactFormSubmission();
      setDone(true);
    } catch {
      toast.error("That did not go through. Please try again, or email us directly.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="text-[17px] leading-[1.6] text-ec-navy">
        Thank you. We will reply by email. Nothing is agreed until we have spoken.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <label>
        <span className={LABEL}>What would you like to talk about?</span>
        <select className={FIELD} value={interest} onChange={(e) => setInterest(e.target.value)}>
          {INTERESTS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={LABEL}>First name</span>
          <input
            required
            autoComplete="given-name"
            className={FIELD}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label>
          <span className={LABEL}>Last name</span>
          <input
            required
            autoComplete="family-name"
            className={FIELD}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </label>
      </div>
      <label>
        <span className={LABEL}>Work email</span>
        <input
          required
          type="email"
          autoComplete="email"
          className={FIELD}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label>
          <span className={LABEL}>Company (optional)</span>
          <input
            autoComplete="organization"
            className={FIELD}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
        <label>
          <span className={LABEL}>Role (optional)</span>
          <input
            autoComplete="organization-title"
            className={FIELD}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </label>
      </div>
      {/* Gesplitst, net als op de Zürich-pagina en anders dan op /contact,
          waar één verplicht vinkje ook nieuwsbrieven afdekt. Bewaren om te
          kunnen antwoorden is nodig; nieuws is een keuze. */}
      <label className="flex gap-3 text-[15px] leading-[1.55] text-ec-body">
        <input
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-ec-navy"
        />
        <span>I agree that Eclectik stores my details to reply to this enquiry.</span>
      </label>
      <label className="flex gap-3 text-[15px] leading-[1.55] text-ec-body">
        <input
          type="checkbox"
          name="consentMarketing"
          checked={consentMarketing}
          onChange={(e) => setConsentMarketing(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-ec-navy"
        />
        <span>Eclectik may also send me occasional updates about BMAI. I can withdraw this at any time. (optional)</span>
      </label>
      <button
        type="submit"
        disabled={sending}
        className={`${PILL} self-start bg-ec-navy text-white hover:bg-[#26365a] focus-visible:outline-ec-navy disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {sending ? "Sending" : "Send"}
      </button>
    </form>
  );
}

/**
 * De poster: het model op A3, twee pagina's. Het pad naar de PDF staat bewust
 * niet in deze bundle; /api/bmai-poster geeft het pas terug als de gegevens
 * zijn opgeslagen. Dit is alleen de naam waaronder het bestand bij de bezoeker
 * binnenkomt.
 */
const POSTER_FILENAME = "BMAI Model A3 Poster.pdf";

function startDownload(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = POSTER_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function PosterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    if (!name.trim() || !email.trim() || !company.trim()) {
      toast.error("Please fill in your name, work email and company.");
      return;
    }
    if (!consent) {
      toast.error("Please tick the box to get the poster.");
      return;
    }

    setSending(true);
    let url: string;
    try {
      const res = await fetch("/api/bmai-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          consentMarketing: true,
          src: getAttribution() ?? undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || typeof body?.url !== "string") throw new Error(String(res.status));
      url = body.url;
    } catch {
      toast.error("That did not go through. Please try again, or email us directly.");
      return;
    } finally {
      setSending(false);
    }

    setPosterUrl(url);
    startDownload(url);
    trackBmaiPosterDownload();
  }

  if (posterUrl) {
    return (
      <div role="status">
        <p className="text-[17px] leading-[1.6] text-ec-navy mb-5">
          Thank you. Your download has started. If it has not, use the button below.
        </p>
        <a
          href={posterUrl}
          download={POSTER_FILENAME}
          className={`${PILL} bg-ec-navy text-white hover:bg-[#26365a] focus-visible:outline-ec-navy`}
        >
          Download the poster (PDF)
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <label>
        <span className={LABEL}>Name</span>
        <input
          required
          autoComplete="name"
          className={FIELD}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        <span className={LABEL}>Work email</span>
        <input
          required
          type="email"
          autoComplete="email"
          className={FIELD}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span className={LABEL}>Company</span>
        <input
          required
          autoComplete="organization"
          className={FIELD}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>
      {/* Verplicht, op verzoek van Olivier: de poster is er in ruil voor
          marketingmail. De tekst erboven zegt dat ook, zodat het geen
          verrassing is. Anders dan in ContactForm hieronder, waar nieuws een
          keuze is. */}
      <label className="flex gap-3 text-[15px] leading-[1.55] text-ec-body">
        <input
          type="checkbox"
          name="consentMarketing"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-ec-navy"
        />
        <span>
          I agree to receive emails from Eclectik about BMAI and related work. I can unsubscribe
          at any time.
        </span>
      </label>
      <p className="text-[14px] leading-[1.55] text-ec-body">
        We use your details to send you the poster and these emails, as described in our{" "}
        <a href="/privacy-policy" className="underline underline-offset-2 hover:text-ec-navy">
          privacy policy
        </a>
        .
      </p>
      <button
        type="submit"
        disabled={sending}
        className={`${PILL} self-start bg-ec-navy text-white hover:bg-[#26365a] focus-visible:outline-ec-navy disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {sending ? "One moment" : "Download the poster"}
      </button>
    </form>
  );
}

export default function Bmai() {
  return (
    <Layout>
      <title>BMAI: a canvas for the real AI impact conversation | Eclectik</title>
      <meta
        name="description"
        content="BMAI by Eclectik puts what changed in the work, who owns that change and what it is worth on one page. Three bands, one owner for each."
      />
      <link rel="canonical" href="https://www.eclectik.co/bmai" />

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Hero */}
        <section className={`bg-white ${SECTION}`}>
          <div className={`${INNER} grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14`}>
            <div>
              <p className={EYEBROW}>BMAI by Eclectik</p>
              <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 text-pretty lg:text-[50px]">
                A business model canvas for the real AI impact conversation.
              </h1>
              <p className="text-[18px] leading-[1.6] text-ec-body mb-8 max-w-[560px]">
                Most companies already run AI tools. Few can show what changed in the work, who owns
                that change, or what it is worth. BMAI puts all three on one page, agreed in a
                morning.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#contact"
                  onClick={() => trackCTAClick("Talk to us about BMAI", "bmai-hero")}
                  className={`${PILL} bg-ec-navy text-white hover:bg-[#26365a] focus-visible:outline-ec-navy`}
                >
                  Talk to us about BMAI
                </a>
                <a
                  href="#app"
                  onClick={() => trackCTAClick("BMAI Canvas app", "bmai-hero")}
                  className={`${PILL} border border-ec-navy text-ec-navy hover:bg-ec-cream focus-visible:outline-ec-navy`}
                >
                  For consultants: the app
                </a>
              </div>
              <p className="mt-5 text-[15px] text-ec-body">
                Or{" "}
                <a
                  href="#poster"
                  onClick={() => trackCTAClick("BMAI poster", "bmai-hero")}
                  className="font-semibold text-ec-navy underline underline-offset-4 hover:text-ec-red"
                >
                  download the model as an A3 poster
                </a>
                .
              </p>
            </div>
            {/* De omslag uit het BMAI-materiaal. Het origineel had onderaan de regel
                "Private confidential, copyright reserved" en een donker kader;
                allebei weggesneden voordat hij op de site kwam. */}
            <img
              src="/images/bmai/bmai-cover.png"
              alt="BMAI: a canvas for the real AI impact conversation"
              width={1600}
              height={751}
              className="w-full h-auto rounded-xl border border-ec-line-3 shadow-[0_20px_50px_-24px_rgba(25,39,61,0.45)]"
            />
          </div>
        </section>

        {/* The problem */}
        <section className={`bg-ec-navy ${SECTION}`}>
          <div className={`${INNER} max-w-[860px]`}>
            <p className={EYEBROW_DARK}>The problem</p>
            <h2 className={`${H2} text-ec-on-dark`}>Usage goes up. Impact does not follow.</h2>
            <p className="text-[19px] leading-[1.65] text-ec-on-dark-muted">
              Tools are switched on and people feel faster, but the process around them stays the
              same. The value never reaches the accounts, and nobody can say why. The gap sits in the
              work, not in the software.
            </p>
          </div>
        </section>

        {/* The model */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>The model</p>
            <h2 className={H2}>Three bands. One owner for each.</h2>
            {/* Gestapeld en niet naast elkaar: het model heet niet voor niets
                "banden", en zo leest het ook als lagen in plaats van als drie
                losse kaarten. */}
            <ol className="mt-8 border-t-2 border-ec-navy">
              {BANDS.map((band, index) => (
                <li
                  key={band.name}
                  className="grid gap-2 border-b border-ec-line-3 py-6 sm:grid-cols-[200px_1fr_auto] sm:items-center sm:gap-8"
                >
                  <p className="flex items-center gap-3 font-brand text-[22px] font-extrabold">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-8 items-center justify-center rounded-full bg-ec-navy text-[14px] text-ec-yellow"
                    >
                      {index + 1}
                    </span>
                    {band.name}
                  </p>
                  <p className="text-[17px] leading-[1.6] text-ec-body">{band.body}</p>
                  <p className="justify-self-start rounded-full bg-ec-cream px-3.5 py-1.5 text-[13px] font-semibold text-ec-navy sm:justify-self-end">
                    One owner
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-[15px] text-ec-body">
              Context, governance and measures sit around the bands.
            </p>

            {/* De poster. In deze sectie en niet in een eigen sectie: hij is
                het model, en zo blijven de achtergrondkleuren afwisselen. */}
            <div
              id="poster"
              className="mt-12 scroll-mt-24 grid gap-8 rounded-2xl bg-ec-cream p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12"
            >
              <figure className="m-0">
                <img
                  src="/images/bmai/bmai-poster-preview.png"
                  alt="The BMAI poster: the People, Process and Technology bands, framed by context, governance, responsibilities and indicators"
                  width={1400}
                  height={991}
                  loading="lazy"
                  className="w-full h-auto rounded-lg border border-ec-line-3 bg-white shadow-[0_20px_50px_-24px_rgba(25,39,61,0.45)]"
                />
                <figcaption className="mt-3 text-[14px] text-ec-body">
                  Page 1 of 2. Page 2 explains how to read the model.
                </figcaption>
              </figure>
              <div>
                <h3 className="font-brand text-[24px] font-extrabold leading-[1.15] mb-3 text-pretty lg:text-[28px]">
                  Get the model as an A3 poster
                </h3>
                <p className="text-[17px] leading-[1.6] text-ec-body mb-6">
                  The canvas to print and fill in with your team, and a guide to reading it. Free,
                  in exchange for your details and the occasional email from us.
                </p>
                <PosterForm />
              </div>
            </div>
          </div>
        </section>

        {/* What's in it for you */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>What&apos;s in it for you</p>
            <h2 className={H2}>Each seat gets a problem solved.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {AUDIENCE.map((item) => (
                <article
                  key={item.seat}
                  className="rounded-2xl border border-ec-line-3 bg-white px-7 py-7"
                >
                  <h3 className="font-brand text-[21px] font-extrabold mb-3">{item.seat}</h3>
                  <p className="text-[15px] font-semibold text-ec-red mb-2">
                    The problem: {item.problem}
                  </p>
                  <p className="text-[17px] leading-[1.6] text-ec-body">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* The app */}
        <section id="app" className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>For AI transformation professionals</p>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <h2 className={`${H2} mb-0`}>BMAI Canvas</h2>
              <span className="rounded-full bg-ec-yellow px-3 py-1 text-[13px] font-bold text-ec-navy">
                In development
              </span>
            </div>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[640px] mb-10">
              Place your initiatives on the three bands, name one owner for each layer, and record
              your indicators.
            </p>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:items-start">
              <figure className="m-0">
                <div className="rounded-2xl border border-ec-line-3 bg-ec-cream p-5">
                  {EXAMPLE.map((row) => (
                    <div
                      key={row.band}
                      className="grid grid-cols-[96px_1fr] items-center gap-3 border-b border-ec-line-3 py-3.5 last:border-b-0"
                    >
                      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-ec-body">
                        {row.band}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {row.items.map((item) =>
                          item.flag ? (
                            <span
                              key={item.label}
                              className="inline-flex items-center gap-1.5 rounded-md border border-ec-yellow bg-[#fff3cc] px-3 py-1.5 text-[14px] text-ec-navy"
                            >
                              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8v5" />
                                <path d="M12 16.5v.5" />
                                <circle cx="12" cy="12" r="9" />
                              </svg>
                              {item.label}
                            </span>
                          ) : (
                            <span
                              key={item.label}
                              className="rounded-md border border-ec-navy bg-white px-3 py-1.5 text-[14px] text-ec-navy"
                            >
                              {item.label}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-[13px] text-ec-body">
                    <span>Example data, fictional</span>
                    <span>Owners: 3 of 3 named</span>
                  </div>
                </div>
                <figcaption className="sr-only">
                  An example canvas with fictional initiatives on the three bands. Two items are
                  flagged as stalled.
                </figcaption>
              </figure>

              <ul className="border-t-2 border-ec-navy">
                {APP_STEPS.map((step) => (
                  <li key={step.name} className="grid grid-cols-[110px_1fr] gap-4 border-b border-ec-line-3 py-5">
                    <p className="font-brand text-[20px] font-extrabold">{step.name}</p>
                    <p className="text-[16px] leading-[1.6] text-ec-body">{step.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {PLANS.map((plan) => (
                <article key={plan.name} className="rounded-2xl border border-ec-line-3 px-6 py-6">
                  <h3 className="font-brand text-[19px] font-extrabold mb-2">{plan.name}</h3>
                  <p className="text-[16px] leading-[1.55] text-ec-body">{plan.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-[15px] leading-[1.6] text-ec-body max-w-[720px]">
              The app is in development and pricing follows at launch. The measurement module comes
              later, once its method has been validated.
            </p>
          </div>
        </section>

        {/* Partners */}
        <section id="partners" className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>Partners</p>
            <h2 className={H2}>Bring BMAI to your clients.</h2>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[640px] mb-10">
              Partnerships are non-exclusive. Diagnosis and redesign stay with the roles they belong
              to.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {PARTNERS.map((partner) => (
                <article key={partner.name} className="rounded-2xl border border-ec-line-3 bg-white px-6 py-6">
                  <h3 className="font-brand text-[19px] font-extrabold mb-2">{partner.name}</h3>
                  <p className="text-[16px] leading-[1.55] text-ec-body">{partner.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={`bg-ec-navy ${SECTION}`}>
          <div className={`${INNER} grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:items-start`}>
            <div>
              <p className={EYEBROW_DARK}>Start where you are</p>
              <h2 className={`${H2} text-ec-on-dark`}>Run it in your organisation, or with your clients.</h2>
              <p className="text-[18px] leading-[1.6] text-ec-on-dark-muted max-w-[460px]">
                Leave your details and we will reply. Nothing is agreed until we have spoken.
              </p>
            </div>
            <div className="rounded-2xl bg-white px-7 py-8">
              <ContactForm />
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
