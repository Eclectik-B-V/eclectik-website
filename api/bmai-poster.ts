import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
// Relatieve imports met een .js-extensie: api/ is kale ESM zonder de aliassen
// die de client wel heeft.
import { sanitizeSubject } from "./_mail-subject.js";
import { escapeHtml } from "./_html.js";

/**
 * Download van de BMAI-poster (A3, twee pagina's) vanaf /bmai.
 *
 * Olivier wil dat wie de poster downloadt eerst naam, e-mail en bedrijf
 * achterlaat en toestemming geeft voor marketingmail. Die toestemming is hier
 * dus verplicht, anders dan bij een aanvraag in api/bmai-enquiry.ts, waar hij
 * optioneel is. Het formulier zegt dat ook zo: de poster in ruil voor mail.
 *
 * Het CRM krijgt een eigen signaal, `bmai_poster_download`, zodat downloads in
 * de leads-tab los staan van aanvragen. consentMarketing gaat mee in de
 * payload; daar leest het CRM de opt-in uit als een lead een contact wordt.
 *
 * Wanneer is een download binnen? Net als bij de aanvraag: zodra het CRM of de
 * mail lukt. Mislukken ze allebei, dan krijgt de bezoeker een fout en geen
 * link, want dan zijn we de lead kwijt.
 *
 * Over de grendel: de PDF staat in client/public/downloads met een willekeurig
 * achtervoegsel in de naam. De client-bundle kent dat pad niet; alleen dit
 * endpoint geeft het terug. Wie de link doorstuurt, deelt de poster, en dat is
 * goed: op de poster zelf staat eclectik.co/bmai. Komt er een nieuwe versie,
 * kies dan een nieuw achtervoegsel en pas POSTER_URL aan.
 */
export const POSTER_URL = "/downloads/bmai-model-a3-poster-0b5f9506.pdf";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(200),
  consentMarketing: z.literal(true),
  src: z.string().trim().max(100).optional(),
});

type Body = z.infer<typeof BodySchema>;

/** Een hangend CRM mag de functie niet openhouden tot Vercel hem afkapt. */
const CRM_TIMEOUT_MS = 8_000;

/** Zet de download in het CRM. Geeft terug of dat gelukt is; gooit nooit. */
async function sendCrmSignal(data: Body): Promise<boolean> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error("CRM env vars not set, BMAI poster download NOT stored in the CRM");
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const r = await fetch(`${base}/api/website-signal`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({
        source: "website",
        event: "bmai_poster_download",
        email: data.email,
        name: data.name,
        company: data.company,
        consentMarketing: data.consentMarketing,
        src: data.src,
      }),
    });
    if (!r.ok) {
      console.error(
        "CRM website-signal failed:",
        r.status,
        await r.text().catch(() => "")
      );
      return false;
    }
    return true;
  } catch (err) {
    // Inclusief de AbortError na CRM_TIMEOUT_MS.
    console.error("CRM website-signal error:", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Interne melding. Geeft terug of de mail is aangenomen; gooit nooit. */
async function sendNotification(data: Body, storedInCrm: boolean): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    console.error("Missing Resend env vars, BMAI poster notification NOT sent");
    return false;
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: data.email,
      // sanitizeSubject, niet escapeHtml: een onderwerp is een headerveld.
      subject: sanitizeSubject(`BMAI poster download: ${data.name}, ${data.company}`),
      html: `
        <h2>BMAI poster downloaded</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.company)}</p>
        <p><strong>Marketing opt-in:</strong> yes</p>
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
        <p><strong>In the leads tab:</strong> ${
          storedInCrm ? "yes" : "no, the CRM did not take it. Add this one by hand."
        }</p>
      `,
    });
    if (error) {
      console.error("Resend BMAI poster notification error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend BMAI poster notification error:", err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const data = parsed.data;

  const storedInCrm = await sendCrmSignal(data);
  const notified = await sendNotification(data, storedInCrm);

  if (!storedInCrm && !notified) {
    return res.status(502).json({ error: "Could not store the request" });
  }
  return res.status(200).json({ ok: true, url: POSTER_URL });
}
