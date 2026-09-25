// Shared plumbing for the three user session endpoints in this directory.
//
// The underscore prefix keeps this file out of Vercel's function routing:
// every other file under api/ becomes a public endpoint, and this one is a
// library, not a route. The relative imports that pull it in carry a .js
// extension because api/ is plain ESM without the bundler aliases the client
// has, so neither @shared nor an extensionless path resolves.
import { z } from "zod";

/**
 * A visitor is waiting for the answer of every call in this file: the click
 * redirect, the confirm on mount and the submit all block a page. That is why
 * the budget here is shorter than the 8s the form endpoints allow themselves.
 */
const CRM_TIMEOUT_MS = 4_000;

/**
 * Tokens are minted in the BD application: random, url-safe, at least 22
 * characters. Checking the shape on this side costs nothing and buys two
 * things. A request with junk in `t` never reaches the BD application, and the
 * value that ends up in the Location header of the click redirect cannot carry
 * a path, a query string or a newline.
 */
export const TokenSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{22,128}$/);

export const AnswerSchema = z.enum(["yes", "no"]);
export type Answer = z.infer<typeof AnswerSchema>;

/**
 * Whether a body that failed validation at least carries something shaped like
 * a token.
 *
 * It decides which of the two answers a rejected request gets. A value that is
 * not shaped like a token cannot exist in the table, so that case answers
 * exactly like a token the BD application does not know and the page sends the
 * visitor to /s/invalid. Someone who types a token by hand into the address
 * bar belongs there, not on a form that will be refused on submit. If the
 * token looks fine and something else was wrong, the request is broken and
 * says nothing about the invitation.
 */
export function carriesTokenShape(body: unknown): boolean {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }
  return TokenSchema.safeParse((body as Record<string, unknown>).token).success;
}

/**
 * The three moments from the design. A closed set rather than a free string:
 * the value is written straight into the BD row and is read back as a slot id,
 * not as a label. Keep in sync with the slots page component.
 */
export const SLOT_IDS = [
  "slot-2026-10-29",
  "slot-2026-11-04",
  "slot-2026-11-05",
] as const;

export const SlotSchema = z.enum(SLOT_IDS);

/**
 * What the BD application can tell us about a token, mapped onto the four
 * outcomes the endpoints act on.
 *
 * `unavailable` is deliberately separate from `unknown_token`: it says nothing
 * about the token, only that this round trip did not happen. The click treats
 * it as a success so the visitor still reaches a page, the confirm and the
 * submit report it so the page can ask for another attempt.
 */
export type InviteResult =
  | { status: "ok"; firstName: string | null }
  | { status: "unknown_token" }
  | { status: "closed" }
  | { status: "unavailable" };

export type InvitePayload =
  | { action: "click"; token: string; answer: Answer; botSuspected: boolean }
  | { action: "confirm"; token: string; answer: Answer }
  | { action: "submit"; token: string; slots: string[]; note: string | null };

/** Markers that mean the request is almost certainly not a person. */
const BOT_MARKERS = [
  // Generic, and enough on its own for Slackbot, Twitterbot, Googlebot and the
  // rest of the well behaved crawlers.
  "bot",
  "crawler",
  "spider",
  "preview",
  "scanner",
  // Microsoft Defender for Office 365 Safe Links, and the Office applications
  // that fetch a link to render a preview card.
  "safelinks",
  "defender",
  "microsoft office",
  "bingpreview",
  // Link unfurlers that do not carry the word bot.
  "facebookexternalhit",
  "skypeuripreview",
  "whatsapp",
  // Mail security gateways that follow every link in a message.
  "proofpoint",
  "mimecast",
  "barracuda",
  "symantec",
  "forcepoint",
  // Command line clients and libraries. A person clicking a link in Outlook
  // never arrives with one of these.
  "curl/",
  "wget",
  "python-requests",
  "go-http-client",
  "okhttp",
  "java/",
  "libwww",
  "httpclient",
  "headlesschrome",
  "phantomjs",
];

/**
 * Decide whether a click looks like a link scanner rather than a person.
 *
 * This is a net, not a filter. The row is written either way, with the flag
 * alongside it, because guessing wrong and dropping a real answer costs more
 * than a flagged row costs. The user agent is read here and nowhere else: it
 * is never forwarded to the BD application, never logged and never stored, and
 * the same goes for the IP address, which these endpoints do not touch at all.
 *
 * A missing or empty user agent counts as suspicious: every browser sends one,
 * so its absence means something on the path stripped it or nothing human sent
 * the request.
 */
export function looksLikeBot(userAgent: string | undefined): boolean {
  const ua = (userAgent ?? "").trim().toLowerCase();
  if (!ua) return true;
  return BOT_MARKERS.some(marker => ua.includes(marker));
}

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
 * Call the one endpoint in the BD application that owns this table.
 *
 * The site holds no database credentials, so every read and write goes through
 * POST {CRM_BASE_URL}/api/session-invite behind the shared secret, exactly like
 * api/website-signal. Nothing about the caller travels with the payload: no IP
 * address, no user agent, only the fields the design lists.
 *
 * A failure never throws. The caller decides what a failed round trip means
 * for the visitor, because that answer differs per endpoint.
 */
export async function callSessionInvite(
  payload: InvitePayload
): Promise<InviteResult> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error(
      `CRM env vars not set: session invite ${payload.action} NOT stored`
    );
    return { status: "unavailable" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const r = await fetch(`${base}/api/session-invite`, {
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
        // Only the confirm answers with a name. Anything that is not a string
        // becomes null so a page never renders "undefined" as a greeting.
        firstName:
          typeof firstName === "string" && firstName.length > 0
            ? firstName
            : null,
      };
    }

    // The reason is honoured whatever the status code is, so the BD side stays
    // free to answer 404 or 410 for a token it will not accept.
    const reason = typeof body?.reason === "string" ? body.reason : "";
    if (reason === "unknown_token") return { status: "unknown_token" };
    if (reason === "closed") return { status: "closed" };

    // Never log the token: the log would then hold a working link to someone
    // else's invitation.
    console.error(
      `CRM session-invite ${payload.action} failed:`,
      r.status,
      text
    );
    return { status: "unavailable" };
  } catch (err) {
    // Includes the AbortError thrown when CRM_TIMEOUT_MS expires: same path as
    // any other failed call, log and report that nothing was stored.
    console.error(`CRM session-invite ${payload.action} error:`, err);
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
