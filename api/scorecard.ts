import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
// Relative import: Vercel functions bundle relative imports; the @shared alias
// is a Vite/tsconfig-path construct that does not apply here.
import { isWorkEmail } from "../shared/work-email.js";

/** A hanging CRM must not hold the function open until Vercel kills it. */
const CRM_TIMEOUT_MS = 8_000;

// 20 scored ids + P1..P3; values are 0-based option indexes. Detailed
// validation (per-question ranges) happens in the CRM intake, which also
// recomputes all scores from these raw answers.
const BodySchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .refine(isWorkEmail, "work email required"),
  // z.boolean(), not z.literal(true) as in api/waitlist.ts: this box is the
  // optional "Send me the monthly insights letter" opt-in on the result page,
  // not a condition for submitting. The work email is what unlocks the report,
  // and consent:false is a meaningful answer the CRM needs to record.
  consent: z.boolean(),
  door: z.enum(["value", "change"]),
  answers: z.record(
    z.string().regex(/^(V[1-8]|C[1-8]|R[1-4]|P[1-3])$/),
    z.number().int().min(0).max(5)
  ),
  src: z.string().trim().max(100).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data.answers).length !== 23) {
    return res.status(400).json({ error: "Invalid scorecard data" });
  }
  const data = parsed.data;

  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    // Result is already shown client-side; losing the record is logged loudly.
    console.error("CRM env vars not set — scorecard response NOT stored");
    return res.status(200).json({ ok: true, stored: false });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const r = await fetch(`${base}/api/scorecard-intake`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        source: "website",
        form_type: "scorecard",
        email: data.email,
        consent: data.consent,
        door: data.door,
        answers: data.answers,
        src: data.src,
      }),
    });
    if (!r.ok) {
      console.error(
        "CRM scorecard-intake failed:",
        r.status,
        await r.text().catch(() => "")
      );
      return res.status(200).json({ ok: true, stored: false });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    // Includes the AbortError thrown when CRM_TIMEOUT_MS expires: same path as
    // any other failed call — log and degrade to stored:false.
    console.error("CRM scorecard-intake error:", err);
    return res.status(200).json({ ok: true, stored: false });
  } finally {
    clearTimeout(timer);
  }
}
