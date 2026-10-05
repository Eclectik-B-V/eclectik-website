import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { SLOT_IDS, SlotSchema, callSessionInvite } from "./_session-invite.js";

/**
 * De interne aanmeldpagina onder /s/intern.
 *
 * Er zit bewust geen wachtwoord en geen login op. Olivier deelt de link met
 * één collega en heeft die keuze gemaakt op 5 oktober 2026, nadat het risico
 * benoemd was: wie dit adres heeft of raadt, kan rijen aanmaken in de tabel
 * die de deelnemerslijst is. De briefing vroeg oorspronkelijk om een login.
 *
 * Wat er wel overblijft als drempel staat hieronder: het adres van de collega
 * moet van ons eigen domein zijn. Dat is geen bewijs van identiteit, maar het
 * houdt een toevallige voorbijganger tegen en zet een naam bij elke invoer.
 *
 * Een echte login is hier sowieso niet triviaal: deze site heeft geen Supabase
 * en geen database-credentials, alles loopt via de BD-applicatie, zie
 * _session-invite.ts.
 */

/** Alleen eigen collega's, zoals de briefing vraagt. */
const COLLEAGUE_DOMAIN = "@eclectik.co";

const BodySchema = z.object({
  // Het adres van de deelnemer. Geen strenge regex: zod's e-mailcheck plus
  // lowercase is wat de BD-applicatie ook als sleutel gebruikt.
  email: z.string().trim().toLowerCase().email().max(254),
  // Het adres van de collega die invult. Moet van ons eigen domein zijn.
  registeredBy: z.string().trim().toLowerCase().email().max(254),
  slots: z.array(SlotSchema).max(SLOT_IDS.length).default([]),
  note: z.string().trim().max(2000).nullish(),
  // Pas true nadat de collega heeft gezien wat er al stond.
  confirmOverwrite: z.boolean().default(false),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // Geen veldnamen en geen zod-issues in het antwoord, net als de andere
    // endpoints onder api/s.
    return res.status(400).json({ ok: false, reason: "invalid_request" });
  }

  if (!parsed.data.registeredBy.endsWith(COLLEAGUE_DOMAIN)) {
    return res.status(403).json({ ok: false, reason: "not_a_colleague" });
  }

  const result = await callSessionInvite({
    action: "register",
    email: parsed.data.email,
    // Dezelfde ontdubbeling als in submit.ts: een herhaalde post mag geen
    // dubbele id in de rij zetten.
    slots: [...new Set(parsed.data.slots)],
    note: parsed.data.note ? parsed.data.note : null,
    registeredBy: parsed.data.registeredBy,
    confirmOverwrite: parsed.data.confirmOverwrite,
  });

  switch (result.status) {
    case "ok":
      return res.status(200).json({ ok: true });
    case "needs_confirm":
      return res
        .status(200)
        .json({ ok: false, reason: "needs_confirm", existing: result.existing });
    case "closed":
      return res.status(200).json({ ok: false, reason: "closed" });
    default:
      // unknown_token hoort niet bij deze actie, maar als BD hem toch stuurt
      // is dat een storing en geen zinnig antwoord voor de collega.
      return res.status(502).json({ ok: false, reason: "unavailable" });
  }
}
