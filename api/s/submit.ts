import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  SLOT_IDS,
  SlotSchema,
  TokenSchema,
  callSessionInvite,
  carriesTokenShape,
} from "./_session-invite.js";

const BodySchema = z.object({
  token: TokenSchema,
  // Zero ticks is a real answer, not an empty form: it says none of the three
  // moments work. The thanks page sends no slots at all, so the field defaults
  // rather than being required. A value outside the three ids is refused
  // instead of forwarded, in the same spirit as invitedBy in
  // api/event-registration.ts.
  slots: z.array(SlotSchema).max(SLOT_IDS.length).default([]),
  // One open question, one line expected. The cap is generous rather than
  // strict: this is a free text field and a long answer is still useful, but
  // the row should not be able to grow without bound.
  note: z.string().trim().max(2000).nullish(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // Same split as api/s/confirm.ts: a body without a token shaped like one
    // is answered as an unknown token, anything else is a broken request. No
    // field names and no zod issues in either answer.
    return carriesTokenShape(req.body)
      ? res.status(400).json({ ok: false, reason: "invalid_request" })
      : res.status(200).json({ ok: false, reason: "unknown_token" });
  }

  // A checkbox list can send the same id twice if the page is ever rebuilt or
  // the request is replayed. Deduplicate here so the BD row does not have to
  // care, keeping the order the visitor sent.
  const slots = [...new Set(parsed.data.slots)];
  // An empty note and no note are the same thing to the reader, so both become
  // null and the column stays empty rather than holding "".
  const note = parsed.data.note ? parsed.data.note : null;

  const result = await callSessionInvite({
    action: "submit",
    token: parsed.data.token,
    slots,
    note,
  });

  switch (result.status) {
    case "ok":
      return res.status(200).json({ ok: true });
    case "unknown_token":
    case "closed":
      // Identical status and shape, the reason only tells the page which of
      // the two fixed destinations to use.
      return res.status(200).json({ ok: false, reason: result.status });
    default:
      // Unlike the click, this one must not pretend to have succeeded: the
      // answers are the point of the exercise and there is no later call that
      // writes them again, so the page has to be able to offer another try.
      return res.status(502).json({ ok: false, reason: "unavailable" });
  }
}
