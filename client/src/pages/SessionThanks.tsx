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
import { SESSION_CLOSED_PATH, SESSION_COPY, SESSION_INVALID_PATH } from "@/data/sessionInvite";
import { submitSessionInvite, useSessionConfirm } from "@/hooks/useSessionInvite";

/**
 * /s/:token/thanks, de pagina achter de Nee-knop.
 *
 * Verder niets vragen dan de ene open vraag. Wie nee zegt heeft de beslissing
 * al genomen, en een pagina die daarna alsnog probeert te overtuigen kost het
 * antwoord dat we hier wel kunnen krijgen.
 */
export default function SessionThanks() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const confirm = useSessionConfirm(token, "no");

  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending || !token) return;

    setSending(true);
    setFailed(false);

    // Geen momenten: deze pagina hoort bij een nee.
    const outcome = await submitSessionInvite(token, [], note);

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
        title={SESSION_COPY.thanks.title}
      />
      <SessionBody>{SESSION_COPY.thanks.intro}</SessionBody>

      <form onSubmit={handleSubmit} noValidate>
        <SessionNoteField
          label={SESSION_COPY.thanks.noteLabel}
          value={note}
          onChange={setNote}
          rows={2}
        />
        <SessionSendButton label={SESSION_COPY.thanks.submit} sending={sending} />
        {failed && <SessionSendError />}
      </form>
    </SessionShell>
  );
}
