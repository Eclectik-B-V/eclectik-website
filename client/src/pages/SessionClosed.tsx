import SessionShell, { SessionBody, SessionHeading } from "@/components/SessionShell";
import { SESSION_COPY } from "@/data/sessionInvite";

/**
 * /s/closed, voor na de deadline uit sessionInvite.ts.
 *
 * De deur gaat dicht, maar niet op slot: mailen kan nog, en dat staat er ook.
 */
export default function SessionClosed() {
  return (
    <SessionShell>
      <SessionHeading title={SESSION_COPY.closed.title} />
      <SessionBody>{SESSION_COPY.closed.body}</SessionBody>
    </SessionShell>
  );
}
