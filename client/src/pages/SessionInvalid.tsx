import SessionShell, { SessionBody, SessionHeading } from "@/components/SessionShell";
import { SESSION_COPY } from "@/data/sessionInvite";

/**
 * /s/invalid, voor een token dat de BD-applicatie niet kent.
 *
 * Eén melding voor elk geval, en geen woord over de reden. Uit niets mag af te
 * leiden zijn of een token bestond: wie de url zou aftasten leert hier niets.
 */
export default function SessionInvalid() {
  return (
    <SessionShell>
      <SessionHeading title={SESSION_COPY.invalid.title} />
      <SessionBody>{SESSION_COPY.invalid.body}</SessionBody>
    </SessionShell>
  );
}
