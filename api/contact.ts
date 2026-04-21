import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  company: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  const { firstName, lastName, company, email, phone, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error("Missing Resend env vars");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Nieuw contactformulier: ${firstName} ${lastName}${company ? ` (${company})` : ""}`,
      html: `
        <h2>Nieuw bericht via het contactformulier</h2>
        <p><strong>Naam:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${company ? `<p><strong>Bedrijf:</strong> ${escapeHtml(company)}</p>` : ""}
        ${phone ? `<p><strong>Telefoon:</strong> ${escapeHtml(phone)}</p>` : ""}
        <p><strong>Bericht:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message || "(geen bericht)")}</pre>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
