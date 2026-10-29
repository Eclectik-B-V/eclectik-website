import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
// Relatieve imports met een .js-extensie: api/ is kale ESM zonder de aliassen
// die de client wel heeft.
import { sanitizeSubject } from "./_mail-subject.js";
import { escapeHtml } from "./_html.js";

/**
 * Inschrijvingen voor de roundtable in Zürich, 1 december 2026.
 *
 * Een eigen endpoint naast event-registration.ts en geen gedeelde versie met
 * een slug erin. Dat is een bewuste keuze: Amsterdam is over negentien dagen
 * en dat endpoint werkt en staat onder test. Het verbouwen om er een tweede
 * event in te passen zet dat op het spel voor een besparing die vooral op
 * papier bestaat, want inhoudelijk verschillen ze op drie punten.
 *
 * 1. Toestemming. Bij Amsterdam gaat de inschrijving naar Workvivo, hier naar
 *    PwC en Microsoft. Die twee leveren het grootste deel van de genodigden en
 *    voeren de gastenlijst mee, dus delen is een voorwaarde om een plek te
 *    kunnen bevestigen en het vinkje daarvoor is verplicht.
 * 2. Dit formulier gebruikt wel de gesplitste opzet die bij Amsterdam als
 *    commentaar klaarstaat: het verplichte vinkje dekt alleen het delen voor
 *    dit event, en marketing staat er apart en optioneel naast.
 * 3. Andere organisatoren in invitedBy, en andere teksten in beide mails.
 *
 * escapeHtml is wel gedeeld, want een tweede kopie van een functie die XSS
 * tegenhoudt loopt vroeg of laat uit elkaar.
 */

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  // Geen zakelijk-adrescontrole, net als bij Amsterdam: dit is een besloten
  // roundtable waar plekken met de hand bevestigd worden, dus een persoonlijk
  // adres is geen reden om iemand bij het formulier al weg te sturen.
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(1).max(200),
  jobTitle: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  // Optioneel, anders dan bij Amsterdam. Het veld helpt de drie organisatoren
  // hun eigen genodigden terug te vinden, maar een leeg antwoord is beter dan
  // een gokje: wie het niet weet en toch moet kiezen, kiest iets.
  //
  // Wel een gesloten verzameling en geen vrije tekst, want de waarde gaat zo
  // het CRM in. Houd in sync met INVITED_BY in de pagina.
  invitedBy: z.enum(["Eclectik", "PwC", "Microsoft", "Other"]).optional(),
  phone: z.string().trim().max(50).optional(),
  // Verplicht: dekt het delen van de inschrijving met PwC en Microsoft, die de
  // gastenlijst meevoeren. Dit en niets meer; marketing staat hieronder apart.
  consent: z.literal(true),
  // Optioneel en apart, zodat wie alleen wil komen geen marketing hoeft te
  // accepteren. Toestemming moet vrij gegeven zijn, en deelname mag niet
  // afhangen van iets dat deelname niet nodig heeft.
  consentMarketing: z.boolean().default(false),
  src: z.string().trim().max(100).optional(),
});

type Body = z.infer<typeof BodySchema>;

/** Een hangend CRM mag de functie niet openhouden tot Vercel hem afkapt. */
const CRM_TIMEOUT_MS = 8_000;

const EVENT_SLUG = "zurich-2026";
const EVENT_NAME =
  "Roundtable: AI and agents reshaping the workplace";
const EVENT_DATE = "2026-12-01";

/**
 * Zet de inschrijving als signaal in het CRM.
 *
 * Net als bij Amsterdam is dit niet best-effort: de rij in het CRM is de
 * inschrijving, en de organisator leest de gastenlijst daaruit. Zonder rij is
 * er niets om later te bevestigen, dus een fout hier moet de bezoeker als
 * fout bereiken en niet als stille log.
 */
async function sendCrmSignal(data: Body): Promise<boolean> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error("CRM env vars not set, Zurich registration NOT stored");
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
        event: "event_registered",
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        company: data.company,
        role: data.jobTitle,
        eventSlug: EVENT_SLUG,
        eventName: EVENT_NAME,
        eventDate: EVENT_DATE,
        country: data.country,
        invitedBy: data.invitedBy,
        phone: data.phone,
        consentShare: true,
        consentMarketing: data.consentMarketing,
        src: data.src,
      }),
    });
    if (!r.ok) {
      console.error("CRM website-signal failed:", r.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("CRM website-signal error:", err);
    return false;
  } finally {
    clearTimeout(timer);
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

  const stored = await sendCrmSignal(data);
  if (!stored) {
    return res.status(502).json({ error: "Could not store the registration" });
  }

  const fullName = `${data.firstName} ${data.lastName}`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  // De mails zijn best-effort: de inschrijving staat al in het CRM, en een
  // hapering bij Resend mag de bezoeker geen fout opleveren voor iets dat wel
  // gelukt is.
  if (apiKey && from && to) {
    const resend = new Resend(apiKey);

    try {
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject: sanitizeSubject(
          `New Zurich roundtable registration: ${fullName}, ${data.company}`
        ),
        html: `
        <h2>New registration for Zurich, 1 December 2026</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.company)}</p>
        <p><strong>Job title:</strong> ${escapeHtml(data.jobTitle)}</p>
        <p><strong>Country:</strong> ${escapeHtml(data.country)}</p>
${data.invitedBy ? `<p><strong>Invited by:</strong> ${escapeHtml(data.invitedBy)}</p>` : ""}
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        <p><strong>Consent to share with PwC and Microsoft:</strong> yes</p>
        <p><strong>Marketing opt-in:</strong> ${data.consentMarketing ? "yes" : "no"}</p>
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
      `,
      });
      if (error) console.error("Resend Zurich notification error:", error);
    } catch (err) {
      console.error("Resend Zurich notification error:", err);
    }

    try {
      const { error } = await resend.emails.send({
        from,
        to: data.email,
        subject: "We received your registration for 1 December in Zurich",
        html: `
        <p>Hi ${escapeHtml(data.firstName)},</p>
        <p>Thank you for registering for ${escapeHtml(EVENT_NAME)}.</p>
        <p>Date: 1 December 2026, 14:00 to 17:00 CET, followed by an apero. Location: the Microsoft office at The Circle 02, 8058 Zurich.</p>
        <p>Seats are limited, so we run a short check on role before we confirm a place. You will hear from us by email once your seat is confirmed.</p>
        <p>Eclectik, PwC and Microsoft</p>
      `,
      });
      if (error) console.error("Resend Zurich confirmation error:", error);
    } catch (err) {
      console.error("Resend Zurich confirmation error:", err);
    }
  }

  return res.status(200).json({ ok: true });
}
