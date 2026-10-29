import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { getAttribution, trackEventRegistration } from "@/lib/tracking";
import {
  AGENDA,
  INVITED_BY,
  READING,
  TAKEAWAYS,
  ZURICH_COPY as C,
  ZURICH_EVENT_SLUG,
} from "@/data/eventZurich";

/**
 * /events/zurich-2026, de besloten roundtable van Eclectik, PwC en Microsoft.
 *
 * Zelfde opbouw als de Workvivo-pagina in EventAmsterdam2026.tsx: kop,
 * inleiding, sprekers, programma, wat je meeneemt, formulier. Het verschil zit
 * in de uitvoering. Amsterdam draagt een aangeleverd Workvivo-ontwerp in een
 * eigen .evt-wrapper met eigen CSS; deze pagina gebruikt gewoon de
 * Eclectik-tokens, zodat hij bij de rest van de site hoort en er geen tweede
 * ontwerpsysteem bijkomt.
 *
 * De pagina is niet openbaar. De echte grendel is de X-Robots-Tag in
 * vercel.json; de meta hieronder is de reserve en komt naast de vaste
 * "index, follow" uit client/index.html te staan. React dedupliceert <meta>
 * niet, en een crawler die ze allebei leest houdt de strengste aan.
 */

const FIELD =
  "mt-1.5 w-full rounded-lg border border-ec-line-3 bg-white px-4 py-3 text-[16px] text-ec-navy placeholder:text-ec-placeholder focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky";
const LABEL = "block text-[15px] font-semibold text-ec-navy";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  country: string;
  phone: string;
  invitedBy: string;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  jobTitle: "",
  country: "",
  phone: "",
  invitedBy: "",
};

export default function EventZurich2026() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    if (!consent) {
      toast.error("Please tick the consent box to complete your registration");
      return;
    }
    if (!form.invitedBy) {
      toast.error("Please tell us who invited you");
      return;
    }

    setSending(true);
    try {
      const r = await fetch("/api/event-registration-zurich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone || undefined,
          consent: true,
          consentMarketing,
          src: getAttribution() ?? undefined,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      trackEventRegistration(ZURICH_EVENT_SLUG);
      setDone(true);
    } catch {
      toast.error("That did not go through. Please try again, or reply to your invitation.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <title>Roundtable, Zurich, 1 December 2026 | Eclectik</title>
      <meta name="robots" content="noindex, nofollow, noarchive" />

      {/* HERO */}
      <section className="bg-ec-navy px-6 py-16 text-ec-on-dark lg:px-16 lg:py-24">
        <div className="mx-auto max-w-[900px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ec-on-dark-eyebrow">
            Invitation-only roundtable
          </p>

          <h1 className="mt-5 font-brand text-[36px] font-extrabold leading-[1.08] tracking-[-0.02em] text-white lg:text-[56px]">
            {C.title}
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.5] text-ec-yellow lg:text-[22px]">
            {C.deck}
          </p>

          <div className="mt-9 border-t border-ec-navy-line-2 pt-7">
            <p className="text-[19px] font-semibold text-white">{C.dateLine}</p>
            <p className="mt-1 text-[16px] text-ec-on-dark-muted">{C.timeLine}</p>
            <p className="mt-4 text-[16px] text-ec-on-dark-muted">{C.venue}</p>
            <p className="text-[15px] text-ec-on-dark-caption">{C.rooms}</p>
            <p className="mt-4 text-[15px] text-ec-on-dark-caption">{C.organisers}</p>
          </div>

          <a
            href="#register"
            className="mt-8 inline-block rounded-full bg-ec-sky px-8 py-4 text-[16px] font-bold text-ec-navy transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            {C.formTitle}
          </a>
          <p className="mt-4 text-[15px] text-ec-on-dark-caption">{C.seats}</p>
        </div>
      </section>

      {/* LOGOBAND. Bewust op wit en niet in de donkere hero: PwC levert een
          zwart woordmerk en Microsoft een grijs woordmerk, allebei bedoeld voor
          een lichte achtergrond. Op ec-navy vallen ze weg, en om de omgekeerde
          varianten te mogen gebruiken is toestemming nodig die we niet hebben.

          Zolang de officiele bestanden er niet zijn staan de namen er als
          tekst. Geen <img> naar een pad dat nog niet bestaat, want dat levert
          een kapot icoon op. Zodra de bestanden er zijn wordt dit een rij van
          drie logos met dezelfde hoogte. */}
      <section className="border-b border-ec-line-2 bg-white px-6 py-8 lg:px-16">
        <div className="mx-auto flex max-w-[900px] flex-wrap items-center gap-x-10 gap-y-4">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ec-body-faint">
            Organised by
          </span>
          <img
            src="/images/eclectik-logo-dark.svg"
            alt="Eclectik"
            className="h-7 w-auto"
          />
          {/* Vult zijn canvas voor 95 procent, dus niet bijgesneden. Iets
              hoger gezet dan de andere twee: bij PwC zit een flink deel van de
              hoogte in het accent boven het woordmerk, dus op gelijke hoogte
              oogt de naam zelf kleiner. */}
          <img
            src="/images/events/zurich-2026/pwc-logo.png"
            alt="PwC"
            width={1525}
            height={752}
            className="h-9 w-auto"
          />
          {/* Aangeleverd als 3840 bij 2160 met het logo in een lege verticale
              band. Bijgesneden tot de inhoud en teruggeschaald naar 800 bij
              170, anders zou het logo op een vaste hoogte piepklein uitvallen. */}
          <img
            src="/images/events/zurich-2026/microsoft-logo.png"
            alt="Microsoft"
            width={800}
            height={170}
            className="h-6 w-auto"
          />
        </div>
      </section>

      {/* INLEIDING */}
      <section className="px-6 py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[720px]">
          {C.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="mb-5 text-[18px] leading-[1.65] text-ec-body last:mb-0 lg:text-[19px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* BESLOTEN SESSIE */}
      <section className="bg-ec-cream px-6 py-14 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-brand text-[26px] font-extrabold leading-[1.2] text-ec-navy lg:text-[32px]">
            {C.closedTitle}
          </h2>
          {C.closed.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 text-[17px] leading-[1.65] text-ec-body"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* SPREKERS */}
      <section className="px-6 py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-brand text-[26px] font-extrabold leading-[1.2] text-ec-navy lg:text-[32px]">
            {C.speakersTitle}
          </h2>
          <div className="mt-7 flex items-center gap-5 rounded-xl border border-ec-line-3 bg-white px-5 py-5">
            {/* 300 bij 300 aangeleverd, en de kaart rendert op 64px, dus ook
                op een retinascherm ruim genoeg. Bewust niet opgeschaald naar de
                520 van de Amsterdam-fotos: dat maakt hem alleen waziger. */}
            <img
              src="/images/events/zurich-2026/ralf-buechsenschuss.jpg"
              alt=""
              width={300}
              height={300}
              loading="lazy"
              className="size-16 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-[18px] font-bold text-ec-navy">Ralf Buechsenschuss</p>
              <p className="mt-0.5 text-[15px] leading-[1.4] text-ec-body">
                Org. Design, AI Transformation &amp; People Analytics
              </p>
              <p className="text-[15px] text-ec-body-faint">Microsoft</p>
            </div>
          </div>
          <p className="mt-4 text-[15px] text-ec-body-faint">
            Speakers from PwC and Eclectik to be announced.
          </p>
        </div>
      </section>

      {/* PROGRAMMA */}
      <section className="bg-ec-cream px-6 py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[760px]">
          <h2 className="font-brand text-[26px] font-extrabold leading-[1.2] text-ec-navy lg:text-[32px]">
            {C.agendaTitle}
          </h2>
          <ol className="mt-7 border-t border-ec-line-2">
            {AGENDA.map((item) => (
              <li
                key={item.time + item.title}
                className="flex flex-col gap-1 border-b border-ec-line-2 py-5 sm:flex-row sm:gap-6"
              >
                <span className="shrink-0 text-[16px] font-bold tabular-nums text-ec-navy sm:w-[72px]">
                  {item.time}
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold text-ec-navy">
                    {item.title}
                    {item.by && (
                      <span className="ml-2 align-middle text-[13px] font-semibold uppercase tracking-[0.08em] text-ec-sky-ink">
                        {item.by}
                      </span>
                    )}
                  </span>
                  {item.body && (
                    <span className="mt-1 block text-[16px] leading-[1.6] text-ec-body">
                      {item.body}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WAT JE MEENEEMT */}
      <section className="px-6 py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-brand text-[26px] font-extrabold leading-[1.2] text-ec-navy lg:text-[32px]">
            {C.takeawaysTitle}
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {TAKEAWAYS.map((item) => (
              <li key={item} className="flex gap-3.5 text-[17px] leading-[1.6] text-ec-body">
                <span aria-hidden="true" className="mt-[9px] size-2 shrink-0 rounded-full bg-ec-yellow" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* LEESVOER */}
      <section className="bg-ec-cream px-6 py-14 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="font-brand text-[24px] font-extrabold leading-[1.2] text-ec-navy lg:text-[28px]">
            {C.readingTitle}
          </h2>
          <p className="mt-3 text-[17px] leading-[1.6] text-ec-body">{C.readingBody}</p>
          <ul className="mt-5 flex flex-col gap-3">
            {READING.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[17px] text-ec-navy underline underline-offset-2 transition-colors hover:text-ec-sky-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FORMULIER */}
      <section id="register" className="px-6 py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-[620px]">
          <h2 className="font-brand text-[26px] font-extrabold leading-[1.2] text-ec-navy lg:text-[32px]">
            {C.formTitle}
          </h2>

          {done ? (
            <p
              role="status"
              className="mt-6 rounded-xl border border-ec-line-3 bg-ec-cream px-5 py-5 text-[17px] leading-[1.6] text-ec-body"
            >
              {C.done}
            </p>
          ) : (
            <>
              <p className="mt-3 text-[17px] leading-[1.6] text-ec-body">{C.formBody}</p>

              <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={LABEL}>First name</span>
                    <input required className={FIELD} value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)} />
                  </label>
                  <label>
                    <span className={LABEL}>Last name</span>
                    <input required className={FIELD} value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)} />
                  </label>
                </div>

                <label>
                  <span className={LABEL}>Email address</span>
                  <input required type="email" className={FIELD} value={form.email}
                    onChange={(e) => set("email", e.target.value)} />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={LABEL}>Organisation</span>
                    <input required className={FIELD} value={form.company}
                      onChange={(e) => set("company", e.target.value)} />
                  </label>
                  <label>
                    <span className={LABEL}>Job title</span>
                    <input required className={FIELD} value={form.jobTitle}
                      onChange={(e) => set("jobTitle", e.target.value)} />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={LABEL}>Country</span>
                    <input required className={FIELD} value={form.country}
                      onChange={(e) => set("country", e.target.value)} />
                  </label>
                  <label>
                    <span className={LABEL}>Phone (optional)</span>
                    <input className={FIELD} value={form.phone}
                      onChange={(e) => set("phone", e.target.value)} />
                  </label>
                </div>

                <label>
                  <span className={LABEL}>Who invited you?</span>
                  <select required className={FIELD} value={form.invitedBy}
                    onChange={(e) => set("invitedBy", e.target.value)}>
                    <option value="">Please choose</option>
                    {INVITED_BY.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                {/* Gesplitst, anders dan op de Amsterdam-pagina. Daar dekt één
                    verplicht vinkje zowel het delen als marketing af, en in die
                    code staan twee bezwaren daarover genoteerd: toestemming moet
                    vrij gegeven zijn, en deelname mag niet afhangen van iets dat
                    deelname niet nodig heeft. Hier staat het delen los van de
                    marketing, zodat wie alleen wil komen alleen dat aanvinkt.

                    Het delen zelf is wel verplicht: PwC en Microsoft leveren het
                    grootste deel van de genodigden en voeren de gastenlijst mee,
                    dus zonder dat is er geen plek te bevestigen. */}
                <label className="flex gap-3 text-[15px] leading-[1.55] text-ec-body">
                  <input type="checkbox" name="consentEvent" required checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-ec-sky-ink" />
                  <span>
                    I agree that Eclectik shares my registration with PwC and Microsoft,
                    so the three organisers can confirm my place and contact me about
                    this roundtable.
                  </span>
                </label>

                <label className="flex gap-3 text-[15px] leading-[1.55] text-ec-body">
                  <input type="checkbox" name="consentMarketing" checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-ec-sky-ink" />
                  <span>
                    Eclectik may also send me occasional updates about its work. I can
                    withdraw this at any time. (optional)
                  </span>
                </label>

                <p className="text-[14px] leading-[1.55] text-ec-body-faint">
                  Each organiser handles your details under its own privacy statement. See{" "}
                  <Link href="/privacy-policy" className="underline underline-offset-2">
                    Eclectik
                  </Link>
                  ,{" "}
                  <a
                    href="https://www.pwc.ch/en/site-information/privacy-statement.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    PwC Switzerland
                  </a>{" "}
                  and{" "}
                  <a
                    href="https://www.microsoft.com/en-us/privacy/privacystatement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Microsoft
                  </a>
                  .
                </p>

                <button type="submit" disabled={sending}
                  className="mt-1 rounded-full bg-ec-sky px-8 py-4 text-[16px] font-bold text-ec-navy transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky disabled:cursor-not-allowed disabled:opacity-60 sm:self-start">
                  {sending ? C.sending : C.submit}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
