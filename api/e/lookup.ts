import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import {
  TokenSchema,
  callEventConfirm,
  carriesTokenShape,
} from "./_event-confirm.js";

/**
 * Haalt op wie achter een token zit, zodat /e/:token kan groeten.
 *
 * Schrijft niets. Dat is het verschil met api/s/confirm.ts, waar de klik in de
 * mail al een antwoord was: hier staan de twee antwoorden als knoppen op de
 * pagina, dus een mailscanner die de link ophaalt legt niets vast.
 */
const BodySchema = z.object({ token: TokenSchema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // Zelfde splitsing als api/s/confirm.ts: een body zonder iets dat op een
    // token lijkt wordt beantwoord als een onbekend token, de rest als een
    // kapot verzoek. Geen veldnamen in beide antwoorden.
    return carriesTokenShape(req.body)
      ? res.status(400).json({ ok: false, reason: "invalid_request" })
      : res.status(200).json({ ok: false, reason: "unknown_token" });
  }

  const result = await callEventConfirm({
    action: "lookup",
    token: parsed.data.token,
  });

  switch (result.status) {
    case "ok":
      return res.status(200).json({ ok: true, firstName: result.firstName });
    case "unknown_token":
    case "closed":
      return res.status(200).json({ ok: false, reason: result.status });
    default:
      // Een hapering mag de pagina niet als kapotte uitnodiging presenteren.
      // De hook laat de pagina dan gewoon opengaan, zonder aanhef.
      return res.status(502).json({ ok: false, reason: "unavailable" });
  }
}
