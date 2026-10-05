import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { SLOT_IDS, SlotSchema, callSessionInvite } from "./_session-invite.js";

/**
 * De interne aanmeldpagina onder /s/intern, achter een gedeeld wachtwoord.
 *
 * Waarom een wachtwoord en geen echte login: deze site heeft geen Supabase en
 * geen database-credentials. Alles loopt via de BD-applicatie, zie
 * _session-invite.ts. De briefing noemt een gedeeld wachtwoord als
 * noodoplossing, met als bezwaar dat je niet weet wie wat invoerde. Dat
 * bezwaar is hier opgelost door de collega zijn eigen adres te laten invullen:
 * dat gaat als registeredBy mee de rij in. Het is geen bewijs van identiteit,
 * wel een naam bij de invoer.
 */
const ADMIN_PASSWORD_ENV = "SESSION_INTERN_PASSWORD";

/** Alleen eigen collega's, zoals de briefing vraagt. */
const COLLEAGUE_DOMAIN = "@eclectik.co";

const BodySchema = z.object({
  password: z.string().min(1),
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

  const expected = process.env[ADMIN_PASSWORD_ENV];
  if (!expected) {
    console.error(
      `${ADMIN_PASSWORD_ENV} is not set, the internal registration page is unreachable until it is configured`
    );
    return res.status(503).json({ ok: false, reason: "not_configured" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // Geen veldnamen en geen zod-issues in het antwoord, net als de andere
    // endpoints onder api/s.
    return res.status(400).json({ ok: false, reason: "invalid_request" });
  }

  if (parsed.data.password !== expected) {
    return res.status(401).json({ ok: false, reason: "unauthorized" });
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
