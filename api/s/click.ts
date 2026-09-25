import type { VercelRequest, VercelResponse } from "@vercel/node";
// Relative import with a .js extension, and one directory up is still api/, so
// a helper next to this file resolves as ./_session-invite.js.
import {
  AnswerSchema,
  TokenSchema,
  callSessionInvite,
  looksLikeBot,
} from "./_session-invite.js";

const INVALID_PAGE = "/s/invalid";
const CLOSED_PAGE = "/s/closed";

/**
 * Send the visitor on with a 302.
 *
 * `no-store` matters more here than anywhere else on the site: the click url
 * carries a token, and between the mail client and the browser sit corporate
 * proxies and mail gateways that happily cache a redirect. A cached one would
 * send the next visitor to the page belonging to the previous token.
 *
 * The robots header is the same one /glint and /microsoft already carry. A
 * token page has no business in an index.
 */
function redirect(res: VercelResponse, to: string) {
  res.setHeader("Location", to);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res.status(302).end();
}

/**
 * A query parameter that appears twice arrives as an array. Rather than guess
 * which of the two was meant, treat it as absent: the link in the mail carries
 * each parameter exactly once.
 */
function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = TokenSchema.safeParse(single(req.query.t));
  const answer = AnswerSchema.safeParse(single(req.query.a));
  if (!token.success || !answer.success) {
    // Same destination as a token the BD application does not know. A link
    // that does not parse cannot be used, and the visitor learns nothing from
    // the difference. No call goes out for it either.
    return redirect(res, INVALID_PAGE);
  }

  // The user agent is read once, here, to decide the flag. It is not part of
  // the payload, it is not logged, and neither is the IP address.
  const botSuspected = looksLikeBot(req.headers["user-agent"]);

  // Deliberately a provisional write only. This url is fetched by every link
  // scanner that sees the mail, so it fills pending_answer and leaves `answer`
  // untouched. The confirm from the page, which a scanner does not run, is
  // what turns it into a real answer.
  const result = await callSessionInvite({
    action: "click",
    token: token.data,
    answer: answer.data,
    botSuspected,
  });

  if (result.status === "unknown_token") return redirect(res, INVALID_PAGE);
  if (result.status === "closed") return redirect(res, CLOSED_PAGE);

  // `unavailable` falls through to the same page as a successful click, on
  // purpose. If the BD application is slow or down, that is our problem, not
  // something the visitor should meet as an error screen after clicking a
  // button in an email. The failure is logged in callSessionInvite, and the
  // confirm that the page fires on mount writes the answer anyway, so a click
  // lost here costs nothing as long as the page loads.
  const path = answer.data === "yes" ? "slots" : "thanks";
  return redirect(res, `/s/${encodeURIComponent(token.data)}/${path}`);
}
