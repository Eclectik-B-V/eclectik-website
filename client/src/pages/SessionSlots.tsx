import { useState } from "react";
import { useLocation, useParams } from "wouter";
import SessionShell, {
  SessionBody,
  SessionHeading,
  SessionLoading,
  SessionNoteField,
  SessionSendButton,
  SessionSendError,
} from "@/components/SessionShell";
import {
  SESSION_CLOSED_PATH,
  SESSION_COPY,
  SESSION_INVALID_PATH,
  SESSION_SLOTS,
} from "@/data/sessionInvite";
import { submitSessionInvite, useSessionConfirm } from "@/hooks/useSessionInvite";

/**
 * /s/:token/slots, de pagina achter de Ja-knop in de uitnodigingsmail.
 *
 * De confirm bij mount zet het antwoord op 'yes' en levert de voornaam voor de
 * aanhef. Zie useSessionConfirm voor waarom dat hier gebeurt en niet in de
 * functie achter de knop.
 */
export default function SessionSlots() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const confirm = useSessionConfirm(token, "yes");

  const [ticked, setTicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  function toggle(id: string) {
    setTicked((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending || !token) return;

    setSending(true);
    setFailed(false);

    // Niet de volgorde van aanvinken, maar die van de momenten zelf. Dat maakt
    // twee gelijke antwoorden aan de andere kant ook gelijk.
    const slots = SESSION_SLOTS.filter((slot) => ticked.includes(slot.id)).map(
      (slot) => slot.id,
    );

    const outcome = await submitSessionInvite(token, slots, note);

    if (outcome === "ok") {
      navigate(`/s/${token}/done`, { replace: true });
      return;
    }
    if (outcome === "unknown_token") {
      navigate(SESSION_INVALID_PATH, { replace: true });
      return;
    }
    if (outcome === "closed") {
      navigate(SESSION_CLOSED_PATH, { replace: true });
      return;
    }

    setSending(false);
    setFailed(true);
  }

  if (confirm.status === "pending") {
    return (
      <SessionShell>
        <SessionLoading />
      </SessionShell>
    );
  }

  return (
    <SessionShell>
      <SessionHeading
        greeting={confirm.firstName ? SESSION_COPY.greeting(confirm.firstName) : null}
        title={SESSION_COPY.slots.title}
      />
      <SessionBody>{SESSION_COPY.slots.intro}</SessionBody>

      <form onSubmit={handleSubmit} noValidate>
        {/* Losse vinkjes, geen radio's: meerdere aanvinken is gewenst, en
            versturen met nul vinkjes mag ook. Dat laatste is bruikbare
            informatie, dus de knop blijft altijd aan. */}
        <div className="mt-7 flex flex-col gap-3">
          {SESSION_SLOTS.map((slot) => {
            const checked = ticked.includes(slot.id);
            return (
              /* Het hele label is het raakvlak, en de rij is ruim boven de
                 44px die een duim nodig heeft. */
              <label
                key={slot.id}
                className={`flex min-h-[60px] cursor-pointer items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-colors ${
                  checked ? "border-ec-sky-ink bg-ec-cream" : "border-ec-line-3 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(slot.id)}
                  /* Bewust het vinkje van het besturingssysteem en niet een
                     nagebouwde: die doen het in de ingebouwde browser van
                     Outlook niet altijd, en dit is de enige interactie op de
                     pagina die echt moet werken. */
                  className="size-5 shrink-0 accent-ec-sky-ink"
                />
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold leading-[1.3]">
                    {slot.date}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-[1.3] text-ec-body">
                    {slot.times}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <SessionNoteField
          label={SESSION_COPY.slots.noteLabel}
          value={note}
          onChange={setNote}
        />

        <SessionSendButton label={SESSION_COPY.slots.submit} sending={sending} />
        {failed && <SessionSendError />}

        <p className="mt-5 text-[15px] leading-[1.6] text-ec-body">
          {SESSION_COPY.slots.note}
        </p>
      </form>
    </SessionShell>
  );
}
