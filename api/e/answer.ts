import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  AnswerSchema,
  TokenSchema,
  callEventConfirm,
  carriesTokenShape,
} from "./_event-confirm.js";

/**
 * Legt vast of de deelnemer op 17 november kan.
 *
 * Dit is het enige dat schrijft. Er is geen weg terug via de pagina: wie zich
 * vergist, antwoordt op de mail. Een tweede post met hetzelfde token mag de
 * BD-kant gewoon accepteren en overschrijven.
 */
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
    return carriesTokenShape(req.body)
      ? res.status(400).json({ ok: false, reason: "invalid_request" })
      : res.status(200).json({ ok: false, reason: "unknown_token" });
  }

  const result = await callEventConfirm({
    action: "answer",
    token: parsed.data.token,
    answer: parsed.data.answer,
  });

  switch (result.status) {
    case "ok":
      return res.status(200).json({ ok: true });
    case "unknown_token":
    case "closed":
      return res.status(200).json({ ok: false, reason: result.status });
    default:
      // Anders dan de lookup mag dit niet doen alsof het gelukt is: het
      // antwoord is het hele doel en er volgt geen tweede call die het alsnog
      // wegschrijft. De pagina moet een nieuwe poging kunnen aanbieden.
      return res.status(502).json({ ok: false, reason: "unavailable" });
  }
}
