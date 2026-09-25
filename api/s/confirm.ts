import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  AnswerSchema,
  TokenSchema,
  callSessionInvite,
  carriesTokenShape,
} from "./_session-invite.js";

// The answer travels with the confirm rather than being read back from the
// provisional column. That keeps a link scanner out of the real answer
// entirely: it can fill pending_answer, but only a browser that runs the page
// sends this call, and only this call fills `answer`.
const BodySchema = z.object({
  token: TokenSchema,
  answer: AnswerSchema,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // No zod issues in the answer and no mention of which field was wrong: the
    // body carries a token, and an error that quotes it would echo that token
    // back through whatever logs the response. A value that is not even shaped
    // like a token gets the answer an unknown token gets, so a made up link
    // ends on /s/invalid whether it was typed by hand or copied wrong.
    return carriesTokenShape(req.body)
      ? res.status(400).json({ ok: false, reason: "invalid_request" })
      : res.status(200).json({ ok: false, reason: "unknown_token" });
  }

  const result = await callSessionInvite({
    action: "confirm",
    token: parsed.data.token,
    answer: parsed.data.answer,
  });

  switch (result.status) {
    case "ok":
      // firstName is null when the invitation has no name on it. The page then
      // greets nobody, rather than showing the email address or the company,
      // which a forwarded mail would leak to a colleague.
      return res.status(200).json({ ok: true, firstName: result.firstName });
    case "unknown_token":
    case "closed":
      // Both answer 200, with nothing but the reason to tell them apart. That
      // reason exists so the page can pick between /s/invalid and /s/closed,
      // which is the one distinction the design allows. The status code, the
      // shape and the wording are identical, so nothing else can be read from
      // a probe about whether a token was ever issued.
      return res.status(200).json({ ok: false, reason: result.status });
    default:
      // The BD application did not answer. Says nothing about the token, so it
      // gets its own reason and a status the page can retry on.
      return res.status(502).json({ ok: false, reason: "unavailable" });
  }
}
