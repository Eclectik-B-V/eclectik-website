import SessionShell, { SessionBody, SessionHeading } from "@/components/SessionShell";
import { SESSION_COPY } from "@/data/sessionInvite";

/**
 * /s/:token/done, het eindpunt na het versturen.
 *
 * Geen confirm en geen call: het antwoord staat er al. De pagina heeft het
 * token alleen in het pad staan omdat de twee antwoordpagina's hierheen
 * navigeren met replace, zodat de terugknop niet op een formulier uitkomt dat
 * al verstuurd is.
 */
export default function SessionDone() {
  return (
    <SessionShell>
      <SessionHeading title={SESSION_COPY.done.title} />
      <SessionBody>{SESSION_COPY.done.body}</SessionBody>
    </SessionShell>
  );
}
