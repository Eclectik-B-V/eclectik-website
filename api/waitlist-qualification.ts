import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
import { isWorkEmail } from "../shared/work-email";
import {
  BANK_VERSION, WAITLIST_QUESTIONS, validateWaitlistAnswers,
} from "../shared/waitlist-qualification";

const BodySchema = z.object({
  email: z.string().trim().email().max(200).refine(isWorkEmail, "work email required"),
  answers: z.record(z.string(), z.string().max(200)).refine(validateWaitlistAnswers, "invalid answers"),
  src: z.string().trim().max(100).optional(),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Forward the qualification answers as a signal to the CRM. The CRM endpoint
 * lives in the separate eclektik-crm repo and may not exist yet — if env vars
 * are absent or the call fails, log and continue. Email is the fallback record.
 */
async function sendCrmSignal(data: z.infer<typeof BodySchema>) {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.warn("CRM env vars not set — skipping website-signal");
    return;
  }
  try {
    const r = await fetch(`${base}/api/website-signal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        source: "website",
        event: "waitlist_qualification",
        email: data.email,
        bank_version: BANK_VERSION,
        answers: data.answers,
        src: data.src,
      }),
    });
    if (!r.ok) {
      console.error("CRM website-signal failed:", r.status, await r.text().catch(() => ""));
    }
  } catch (err) {
    console.error("CRM website-signal error:", err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  const data = parsed.data;

  await sendCrmSignal(data);

  // Internal notification — the fallback record if the CRM call was skipped/failed.
  // Deliberate deviation from api/waitlist.ts (spec decisions 4/6): the signup
  // already exists, so a Resend failure or missing env vars must never surface
  // as an error to the client — log and return ok regardless.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Missing Resend env vars — skipping qualification notification");
    return res.status(200).json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    const rows = WAITLIST_QUESTIONS.map(
      (q) => `<p><strong>${escapeHtml(q.text)}</strong><br/>${escapeHtml(data.answers[q.id])}</p>`,
    ).join("\n");
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Waitlist qualification: ${data.email}`,
      html: `
        <h2>Waitlist qualification answers (bank v${escapeHtml(BANK_VERSION)})</h2>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${rows}
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
      `,
    });
    if (error) {
      console.error("Resend qualification notification error:", error);
    }
  } catch (err) {
    console.error("Resend qualification notification error:", err);
  }

  return res.status(200).json({ ok: true });
}
