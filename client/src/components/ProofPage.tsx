import { Link } from "wouter";
import Layout from "@/components/Layout";
import { trackCTAClick } from "@/lib/tracking";

const SECTION = "px-6 py-14 lg:px-16 lg:py-[72px]";
const INNER = "mx-auto max-w-[1000px]";
const EYEBROW = "text-[13px] tracking-[0.14em] uppercase font-semibold text-ec-red mb-3.5";

/**
 * De twee deuren dragen op de homepage al een eigen accentkleur: sky voor
 * proof of value, teal voor proof of change. Die draad loopt hier door, zodat
 * de pagina zichtbaar hoort bij de kaart waarop iemand net klikte. De kleur
 * zit alleen in lijnen, nooit in tekst: sky-ink en teal-ink halen op wit geen
 * 4.5:1 en de eyebrow blijft dus rood, precies als op Consulting en About.
 */
const ACCENT = {
  value: { rule: "border-ec-sky", note: "border-ec-sky-ink" },
  change: { rule: "border-ec-teal", note: "border-ec-teal-ink" },
} as const;

interface ProofPageProps {
  door: keyof typeof ACCENT;
  /** Route of this page, used for the canonical url (e.g. "/proof-of-value"). */
  path: string;
  title: string;
  description: string;
  eyebrow: React.ReactNode;
  heading: React.ReactNode;
  /** Opening sentence(s); staat als enige alinea in de crème band onder de h1. */
  lead: React.ReactNode;
  /** De rest van de alinea, gebroken waar het betoog draait. */
  body: React.ReactNode[];
  /** Praktische mededeling (doorlooptijd) die niet meeargumenteert. Optioneel. */
  note?: string;
  /** De regel over november: een mededeling, geen belofte. */
  closing: string;
}

/**
 * Interim-invulling voor /proof-of-value en /proof-of-change tot de volledige
 * pagina's in november 2026 opengaan.
 *
 * Bewust een eigen component en geen uitbreiding van PlaceholderPage. Die is
 * nog maar voor één pagina in gebruik (/insights), staat in de oude vormtaal
 * met container/Button/"Back to home", en zou voor deze twee bijna volledig
 * uit optionele props gaan bestaan die Insights nooit zet. De twee proof-
 * pagina's zijn onderling wél identiek van vorm, dus delen ze dit component.
 *
 * Deze pagina's staan in de sitemap en worden geïndexeerd: titel, description
 * en canonical per pagina, en geen noindex.
 */
export default function ProofPage({
  door,
  path,
  title,
  description,
  eyebrow,
  heading,
  lead,
  body,
  note,
  closing,
}: ProofPageProps) {
  const accent = ACCENT[door];

  return (
    <Layout>
      <title>{`${title} | Eclectik`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://www.eclectik.co${path}`} />

      <div className="bg-white text-ec-navy font-brand font-light">
        {/* Opening: de vraag waarmee iemand hier binnenkomt, en het antwoord in één zin */}
        <section className={`bg-ec-cream ${SECTION}`}>
          <div className={INNER}>
            <p className={EYEBROW}>{eyebrow}</p>
            <h1 className="font-brand tracking-normal font-extrabold text-[34px] leading-[1.05] mb-5 max-w-[780px] text-pretty lg:text-[52px]">
              {heading}
            </h1>
            <p className="text-[18px] leading-[1.6] text-ec-body max-w-[700px]">{lead}</p>
          </div>
        </section>

        {/* Methode, uitkomst, en daarna pas wat je kunt doen. Eén band, geen
            opgeklopte secties: er staat één stevige alinea, dus krijgt die één
            tekstkolom in plaats van vier lege kaders. */}
        <section className={`bg-white ${SECTION}`}>
          <div className={INNER}>
            <div className={`max-w-[720px] border-t-[3px] ${accent.rule} pt-8`}>
              {body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[17px] leading-[1.65] text-ec-body mb-5 last:mb-0 text-pretty"
                >
                  {paragraph}
                </p>
              ))}
              {note && (
                <p
                  className={`mt-8 border-l-[3px] ${accent.note} pl-5 text-[15px] leading-[1.65] text-ec-body-strong`}
                >
                  {note}
                </p>
              )}
            </div>

            {/* Onder de haarlijn staat wat nu kan. De novemberregel is een
                mededeling en staat er kleiner, de knoppen dragen de sectie. */}
            <div className="mt-10 pt-8 border-t border-ec-line-2 max-w-[720px]">
              <p className="text-[15px] leading-[1.6] text-ec-body mb-7 max-w-[620px]">{closing}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  href={`/scorecard?door=${door}`}
                  onClick={() => trackCTAClick("Take the scorecard", path.slice(1))}
                  /* De rand is dezelfde kleur als de vulling: puur zodat deze
                     knop precies even hoog blijft als de omlijnde ernaast. */
                  className="rounded-full font-bold bg-ec-sky border border-ec-sky text-ec-navy inline-flex items-center justify-center px-[30px] py-4 text-[16px] leading-[1.3] text-center text-balance transition-colors hover:bg-[#54b4cb] hover:border-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
                >
                  Take the scorecard (3-4 min) →
                </Link>
                <Link
                  href="/contact"
                  onClick={() => trackCTAClick("Talk to us", path.slice(1))}
                  className="rounded-full font-semibold border border-ec-navy text-ec-navy inline-flex items-center justify-center px-[30px] py-4 text-[16px] leading-[1.3] text-center transition-colors hover:bg-ec-navy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
                >
                  Talk to us →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
