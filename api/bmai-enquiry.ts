import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
// Relatieve imports met een .js-extensie: api/ is kale ESM zonder de aliassen
// die de client wel heeft.
import { sanitizeSubject } from "./_mail-subject.js";
import { escapeHtml } from "./_html.js";

/**
 * Aanvragen vanaf /bmai, naar het CRM zodat ze in de leads-tab verschijnen.
 *
 * Eerst gingen deze via /api/contact, dat alleen een mail stuurt. Olivier wil
 * ze in de leads-tab, dus nu een eigen signaal: `bmai_enquiry`, in dezelfde
 * vorm als `waitlist_joined` en `event_registered`.
 *
 * Wanneer telt een aanvraag als aangekomen? Dat verschilt per endpoint in deze
 * repo. Bij de wachtlijst is het CRM optioneel en de mail het vangnet. Bij
 * Zürich is het CRM verplicht, want daar is de rij de gastenlijst. Een aanvraag
 * zit ertussenin: hij moet vooral een mens bereiken. Dus hier allebei, en de
 * aanvraag is binnen zodra er minstens één van de twee lukt. De mail zegt erbij
 * of de rij in het CRM is beland, zodat een gemiste rij met de hand kan worden
 * toegevoegd. Pas als allebei mislukken krijgt de bezoeker een fout te zien en
 * kan hij het opnieuw proberen.
 */

/**
 * Wat iemand komt bespreken. Korte ids gaan het CRM in, zodat filteren in de
 * leads-tab niet afhangt van een zin die we later herschrijven. De labels zijn
 * alleen voor de mail. Houd in sync met INTERESTS in client/src/pages/Bmai.tsx.
 */
export const INTERESTS = {
  organisation: "Using BMAI in my organisation",
  partner: "Becoming a BMAI partner",
  app: "The BMAI Canvas app",
} as const;

type Interest = keyof typeof INTERESTS;

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(200).optional().default(""),
  role: z.string().trim().max(100).optional().default(""),
  interest: z.enum(Object.keys(INTERESTS) as [Interest, ...Interest[]]),
  // Verplicht en alleen voor het bewaren van de aanvraag om te kunnen
  // antwoorden. Niet gebundeld met nieuwsbrieven: dat staat hieronder apart,
  // zodat wie alleen een vraag heeft niet ook marketing hoeft te accepteren.
  consent: z.literal(true),
  consentMarketing: z.boolean().default(false),
  src: z.string().trim().max(100).optional(),
});

type Body = z.infer<typeof BodySchema>;

/** Een hangend CRM mag de functie niet openhouden tot Vercel hem afkapt. */
const CRM_TIMEOUT_MS = 8_000;

/** Zet de aanvraag in het CRM. Geeft terug of dat gelukt is; gooit nooit. */
async function sendCrmSignal(data: Body): Promise<boolean> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error("CRM env vars not set, BMAI enquiry NOT stored in the CRM");
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
        event: "bmai_enquiry",
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        company: data.company,
        role: data.role,
        interest: data.interest,
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
    // Inclusief de AbortError na CRM_TIMEOUT_MS: zelfde pad als elke andere
    // mislukte call.
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
    console.error("Missing Resend env vars, BMAI enquiry notification NOT sent");
    return false;
  }

  const fullName = `${data.firstName} ${data.lastName}`;
  const interestLabel = INTERESTS[data.interest];

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: data.email,
      // sanitizeSubject, niet escapeHtml: een onderwerp is een headerveld.
      subject: sanitizeSubject(`BMAI enquiry: ${fullName}, ${interestLabel}`),
      html: `
        <h2>New BMAI enquiry</h2>
        <p><strong>Interested in:</strong> ${escapeHtml(interestLabel)}</p>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
        ${data.role ? `<p><strong>Role:</strong> ${escapeHtml(data.role)}</p>` : ""}
        <p><strong>Marketing opt-in:</strong> ${data.consentMarketing ? "yes" : "no"}</p>
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
        <p><strong>In the leads tab:</strong> ${
          storedInCrm ? "yes" : "no, the CRM did not take it. Add this one by hand."
        }</p>
      `,
    });
    if (error) {
      console.error("Resend BMAI notification error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend BMAI notification error:", err);
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
    return res.status(502).json({ error: "Could not store the enquiry" });
  }
  return res.status(200).json({ ok: true });
}
