import { useState } from "react";
import { useLocation, useParams } from "wouter";
import SessionShell, {
  SessionBody,
  SessionHeading,
  SessionLoading,
  SessionSendError,
} from "@/components/SessionShell";
import { EVENT_CONFIRM_COPY, EVENT_CONFIRM_INVALID_PATH } from "@/data/eventConfirm";
import {
  answerEventConfirm,
  useEventLookup,
  type EventAnswer,
} from "@/hooks/useEventConfirm";

/**
 * /e/:token, de pagina achter de link in de mail over de nieuwe eventdatum.
 *
 * Eén vraag, twee knoppen. De lookup bij mount levert alleen de voornaam voor
 * de aanhef; pas een klik op een van de knoppen schrijft iets weg. Daarna
 * blijft de bezoeker op dezelfde route en verandert alleen wat er staat: een
 * aparte bedanktpagina zou een token in de geschiedenis achterlaten waar
 * iemand per ongeluk op terug kan.
 */

const C = EVENT_CONFIRM_COPY;

export default function EventConfirm() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const lookup = useEventLookup(token);

  const [answered, setAnswered] = useState<EventAnswer | null>(null);
  const [sending, setSending] = useState<EventAnswer | null>(null);
  const [failed, setFailed] = useState(false);

  async function send(answer: EventAnswer) {
    if (sending || !token) return;
    setSending(answer);
    setFailed(false);

    const outcome = await answerEventConfirm(token, answer);

    if (outcome === "ok") {
      setAnswered(answer);
      return;
    }
    if (outcome === "unknown_token" || outcome === "closed") {
      navigate(EVENT_CONFIRM_INVALID_PATH, { replace: true });
      return;
    }
    setSending(null);
    setFailed(true);
  }

  if (lookup.status === "pending") {
    return (
      <SessionShell documentTitle={C.documentTitle} footerNote={C.footerNote}>
        <SessionLoading />
      </SessionShell>
    );
  }

  if (answered) {
    const thanks = answered === "yes" ? C.thanksYes : C.thanksNo;
    return (
      <SessionShell documentTitle={C.documentTitle} footerNote={C.footerNote}>
        <SessionHeading greeting={null} title={thanks.title} />
        <SessionBody>{thanks.body}</SessionBody>
      </SessionShell>
    );
  }

  return (
    <SessionShell documentTitle={C.documentTitle} footerNote={C.footerNote}>
      <SessionHeading
        greeting={lookup.firstName ? C.greeting(lookup.firstName) : null}
        title={C.ask.title}
      />
      <SessionBody>{C.ask.intro}</SessionBody>

      {/* De datum als blok en niet in een zin: dit is het enige dat iemand
          echt moet onthouden, en op een telefoon moet het in één oogopslag
          te lezen zijn. */}
      <div className="mt-7 rounded-lg border border-ec-line-3 bg-ec-cream px-5 py-4">
        <p className="text-[19px] font-semibold leading-[1.3]">{C.ask.dateLine}</p>
        <p className="mt-1 text-[15px] leading-[1.5] text-ec-body">{C.ask.timeLine}</p>
      </div>

      <p className="mt-8 text-[17px] font-semibold leading-[1.4]">{C.ask.question}</p>

      {/* Twee knoppen onder elkaar, allebei ruim boven de 44px die een duim
          nodig heeft. Geen van beide is vooraf geselecteerd: dit is een vraag,
          geen formulier met een voorkeursantwoord. */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void send("yes")}
          disabled={sending !== null}
          className="min-h-[56px] w-full rounded-full border border-ec-sky bg-ec-sky px-6 py-4 text-[16px] font-bold leading-[1.3] text-ec-navy transition-colors hover:border-[#54b4cb] hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending === "yes" ? C.sending : C.ask.yes}
        </button>
        <button
          type="button"
          onClick={() => void send("no")}
          disabled={sending !== null}
          className="min-h-[56px] w-full rounded-full border border-ec-line-3 bg-white px-6 py-4 text-[16px] font-semibold leading-[1.3] text-ec-navy transition-colors hover:border-ec-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending === "no" ? C.sending : C.ask.no}
        </button>
      </div>

      {failed && <SessionSendError />}

      <p className="mt-6 text-[15px] leading-[1.6] text-ec-body">{C.ask.note}</p>
    </SessionShell>
  );
}
