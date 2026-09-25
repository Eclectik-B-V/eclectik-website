import { Link } from "wouter";
import { SESSION_COPY } from "@/data/sessionInvite";

/**
 * De omlijsting en de losse onderdelen van de tokenpagina's onder /s/.
 *
 * Bewust geen Layout. Die trekt SiteHeader, SiteFooter en de cookiebanner mee,
 * en elke uitgang die je hier aanbiedt is een afleiding op een pagina die in
 * tien seconden af te handelen moet zijn. Eén logo bovenaan, één kolom, en
 * onderaan de regel over wat we met het antwoord doen.
 *
 * De maatvoering staat hier en niet in de pagina's, omdat de mobiele eisen
 * (44px raakvlak, 16px in invoervelden) anders per pagina opnieuw goed moeten
 * gaan. De meeste mensen openen deze pagina's vanuit Outlook op hun telefoon,
 * ook in de ingebouwde browser daarvan.
 */
export default function SessionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ec-navy font-brand font-light">
      <title>{SESSION_COPY.documentTitle}</title>
      {/* Geen canonical en geen description: deze pagina's horen niet in een
          index, en een description zou verraden waar de link over gaat.

          De X-Robots-Tag in vercel.json is de echte grendel. Deze meta is de
          reserve. Let op dat hij naast de vaste "index, follow" uit
          client/index.html komt te staan, want React dedupliceert <meta> niet:
          een crawler die ze allebei leest houdt de strengste aan, en dat is
          deze. Precies zoals op /glint en /microsoft. */}
      <meta name="robots" content="noindex, nofollow, noarchive" />

      <main className="mx-auto w-full max-w-[560px] px-5 py-10 sm:px-6 sm:py-14">
        {/* Geen link naar de homepage: de enige weg vooruit is de knop op deze
            pagina. Wie hier is, is hier voor één vraag. */}
        <img
          src="/images/eclectik-logo-dark-photo.svg"
          alt="Eclectik"
          className="mb-9 h-7 w-auto"
        />

        {children}

        <p className="mt-12 border-t border-ec-line-2 pt-6 text-[14px] leading-[1.6] text-ec-body-faint">
          {SESSION_COPY.footerNote}{" "}
          <Link
            href="/privacy-policy"
            className="underline underline-offset-2 transition-colors hover:text-ec-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            {SESSION_COPY.footerLinkLabel}
          </Link>
        </p>
      </main>
    </div>
  );
}

/**
 * De kop van een pagina, met de aanhef erboven als de confirm een voornaam
 * teruggaf. Kleiner dan op de marketingpagina's: dit is een mededeling, geen
 * openingszin die iemand moet overtuigen.
 */
export function SessionHeading({
  greeting,
  title,
}: {
  greeting?: string | null;
  title: string;
}) {
  return (
    <>
      {greeting && <p className="mb-2 text-[16px] leading-[1.5] text-ec-body">{greeting}</p>}
      <h1 className="font-brand text-[26px] font-extrabold leading-[1.15] tracking-normal text-pretty sm:text-[30px]">
        {title}
      </h1>
    </>
  );
}

/** Een alinea body onder de kop. */
export function SessionBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[17px] leading-[1.6] text-ec-body text-pretty">{children}</p>
  );
}

/**
 * Het open tekstveld. 16px is een ondergrens en geen smaak: bij kleinere
 * letters zoomt iOS Safari in zodra het veld focus krijgt, en dan staat de
 * pagina scheef zonder dat iemand kan terugzoomen.
 */
export function SessionNoteField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="mt-8 block">
      <span className="mb-2 block text-[15px] leading-[1.5] text-ec-body-strong">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        /* Ruim boven wat iemand in één regel kwijt wil, en een grens die de
           functie aan de andere kant niet hoeft op te vangen. */
        maxLength={1000}
        className="w-full rounded-lg border border-ec-line-3 bg-white px-3.5 py-3 text-[16px] leading-[1.5] text-ec-navy focus:border-ec-sky-ink focus:outline-2 focus:outline-offset-0 focus:outline-ec-sky"
      />
    </label>
  );
}

/**
 * De verstuurknop. Op mobiel over de volle breedte, want dat is het makkelijkst
 * te raken met een duim; vanaf sm zo breed als het woord.
 */
export function SessionSendButton({
  label,
  sending,
}: {
  label: string;
  sending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={sending}
      className="mt-7 w-full rounded-full border border-ec-sky bg-ec-sky px-[30px] py-4 text-[16px] font-bold leading-[1.3] text-ec-navy transition-colors hover:border-[#54b4cb] hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {sending ? SESSION_COPY.sending : label}
    </button>
  );
}

/**
 * De melding als de submit niet aankwam. role="alert" zodat een screenreader
 * hem voorleest zonder dat de focus verspringt.
 */
export function SessionSendError() {
  return (
    <p role="alert" className="mt-4 text-[15px] leading-[1.5] text-ec-red">
      {SESSION_COPY.sendFailed}
    </p>
  );
}

/** Wat er staat zolang de confirm loopt. */
export function SessionLoading() {
  return <p className="text-[17px] leading-[1.6] text-ec-body">{SESSION_COPY.loading}</p>;
}
