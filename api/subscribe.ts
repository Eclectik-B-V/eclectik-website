import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().trim().email().max(200),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { email } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error("Missing Resend env vars");
    return res.status(500).json({ error: "Subscription service not configured" });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      audienceId,
    });

    if (error) {
      console.error("Resend contacts error:", error);
      return res.status(500).json({ error: "Subscription failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Subscribe handler error:", err);
    return res.status(500).json({ error: "Subscription failed" });
  }
}
