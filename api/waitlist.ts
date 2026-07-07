import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(100),
  sector: z.string().trim().min(1).max(100),
  consent: z.literal(true),
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
 * Forward the signup as a signal to the CRM. The CRM endpoint lives in the
 * separate eclektik-crm repo and may not exist yet — if env vars are absent
 * or the call fails, log and continue. Email is the fallback record.
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
        event: "waitlist_joined",
        email: data.email,
        name: data.name,
        company: data.company,
        role: data.role,
        sector: data.sector,
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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Missing Resend env vars");
    return res.status(500).json({ error: "Service not configured" });
  }

  await sendCrmSignal(data);

  const resend = new Resend(apiKey);

  try {
    // Internal notification — the fallback record if the CRM call was skipped/failed
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Benchmark waiting list: ${data.name} (${data.company})`,
      html: `
        <h2>New benchmark waiting-list signup</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.company)}</p>
        <p><strong>Role:</strong> ${escapeHtml(data.role)}</p>
        <p><strong>Sector:</strong> ${escapeHtml(data.sector)}</p>
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
      `,
    });

    if (error) {
      console.error("Resend notification error:", error);
      return res.status(500).json({ error: "Signup failed" });
    }

    // Confirmation to the subscriber — best-effort, must never fail the request
    try {
      const confirmation = await resend.emails.send({
        from,
        to: data.email,
        subject: "You're on the Eclectik benchmark waiting list",
        html: `
          <p>Hi ${escapeHtml(data.name)},</p>
          <p>You're on the waiting list for the Eclectik AI transformation benchmark.
          We run around twelve audits a year and the waiting list hears first when
          September seats open.</p>
          <p>You'll only receive benchmark updates — unsubscribe anytime.</p>
          <p>— Eclectik</p>
        `,
      });
      if (confirmation.error) {
        console.error("Resend confirmation error:", confirmation.error);
      }
    } catch (err) {
      console.error("Resend confirmation error:", err);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Waitlist handler error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}
