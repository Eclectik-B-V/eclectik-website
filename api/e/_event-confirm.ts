// Shared plumbing for the two event confirmation endpoints in this directory.
//
// Same shape as api/s/_session-invite.ts, and for the same reasons: the
// underscore keeps this file out of Vercel's function routing, and the
// relative imports that pull it in carry a .js extension because api/ is plain
// ESM without the bundler aliases the client has.
import { z } from "zod";

/**
 * A visitor is waiting for the answer of both calls here: the lookup blocks
 * the page and the answer blocks the button. Same budget as the user session
 * endpoints, shorter than the 8s the form endpoints allow themselves.
 */
const CRM_TIMEOUT_MS = 4_000;

/**
 * Tokens are minted in the BD application, one per registration. Checking the
 * shape costs nothing and keeps junk out of the round trip.
 */
export const TokenSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{22,128}$/);

export const AnswerSchema = z.enum(["yes", "no"]);
export type Answer = z.infer<typeof AnswerSchema>;

/** Whether a rejected body at least carries something shaped like a token. */
export function carriesTokenShape(body: unknown): boolean {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }
  return TokenSchema.safeParse((body as Record<string, unknown>).token).success;
}

export type ConfirmResult =
  | { status: "ok"; firstName: string | null }
  | { status: "unknown_token" }
  /** De BD-applicatie wil geen antwoorden meer aannemen, bijvoorbeeld omdat
   *  het event geweest is. De pagina zegt dan hetzelfde als bij een onbekend
   *  token: er valt niets meer te bevestigen. */
  | { status: "closed" }
  | { status: "unavailable" };

export type ConfirmPayload =
  /** Haalt de voornaam op zodat de pagina kan groeten. Schrijft niets. */
  | { action: "lookup"; token: string }
  /** Legt het antwoord vast. */
  | { action: "answer"; token: string; answer: Answer };

/** Parse a response body without trusting it to be JSON, or to be an object. */
function parseJsonObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Call the one endpoint in the BD application that owns the event registrations.
 *
 * The site holds no database credentials, so this goes through
 * POST {CRM_BASE_URL}/api/event-confirm behind the shared secret, exactly like
 * api/s/_session-invite.ts does for the user session. Nothing about the caller
 * travels with the payload: no IP address and no user agent.
 *
 * A failure never throws. The caller decides what a failed round trip means.
 */
export async function callEventConfirm(
  payload: ConfirmPayload
): Promise<ConfirmResult> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error(
      `CRM env vars not set: event confirm ${payload.action} NOT handled`
    );
    return { status: "unavailable" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const r = await fetch(`${base}/api/event-confirm`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text().catch(() => "");
    const body = parseJsonObject(text);

    if (r.ok && body?.ok === true) {
      const firstName = body.firstName;
      return {
        status: "ok",
        // Alleen de lookup geeft een naam terug. Alles wat geen string is
        // wordt null, zodat een pagina nooit "undefined" als aanhef toont.
        firstName:
          typeof firstName === "string" && firstName.trim() !== ""
            ? firstName
            : null,
      };
    }

    // De reason telt, wat de statuscode ook is, zodat de BD-kant vrij blijft
    // om 404 of 410 te antwoorden op een token dat hij niet accepteert.
    const reason = typeof body?.reason === "string" ? body.reason : "";
    if (reason === "unknown_token") return { status: "unknown_token" };
    if (reason === "closed") return { status: "closed" };
    return { status: "unavailable" };
  } catch {
    // Inclusief de AbortError na CRM_TIMEOUT_MS.
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
