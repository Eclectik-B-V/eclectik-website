import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";
import { sanitizeSubject } from "./_mail-subject.js";
// Relative import with a .js extension: api/ is plain ESM without the bundler
// aliases the client has, so neither @shared nor an extensionless path resolves.
import { isWorkEmail } from "../shared/work-email.js";

const BodySchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .refine(isWorkEmail, "work email required"),
  company: z.string().trim().min(1).max(200),
  jobTitle: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  // A closed set, not a free string: the value is written straight into the CRM
  // payload, and the point of the field is that the two organisers can split
  // the guest list. Keep in sync with INVITED_BY in the page component.
  invitedBy: z.enum(["Eclectik", "Zoom/Workvivo", "Other"]),
  phone: z.string().trim().max(50).optional(),
  // z.literal(true), not z.boolean() as in api/scorecard.ts: the box on this
  // form is consent to share the registration with Workvivo by Zoom, which is
  // a condition for submitting, not an optional opt-in.
  consent: z.literal(true),
  src: z.string().trim().max(100).optional(),
});

type Body = z.infer<typeof BodySchema>;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** A hanging CRM must not hold the function open until Vercel kills it. */
const CRM_TIMEOUT_MS = 8_000;

const EVENT_SLUG = "amsterdam-2026";
const EVENT_NAME = "AI Transformation: Measure It. Steer It. Prove It.";
const EVENT_DATE = "2026-10-06";
const REGISTRATIONS_URL =
  "https://www.eclectik.co/events/amsterdam-2026/registrations";

/**
 * Store the registration as a signal in the CRM.
 *
 * Unlike api/waitlist.ts and api/waitlist-qualification.ts this call is NOT
 * best-effort: the CRM row is the registration, and the organiser reads the
 * guest list from it. Without a row there is nothing to confirm later, so a
 * failure here has to reach the visitor as an error rather than a quiet log.
 *
 * Returns whether the signal was stored.
 */
async function sendCrmSignal(data: Body): Promise<boolean> {
  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error("CRM env vars not set — event registration NOT stored");
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
        consentWorkvivo: true,
        // `sector` is deliberately absent: this form does not ask for it, and
        // an empty value would overwrite nothing but does clutter the payload.
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
    // Includes the AbortError thrown when CRM_TIMEOUT_MS expires: same path as
    // any other failed call — log and report failure.
    console.error("CRM website-signal error:", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// No duplicate check, and no 409.
//
// Verified against eclektik-crm: POST /api/website-signal validates only the
// email and the event name, then calls upsertMarketingLead(), which is
// find-or-create on email and always inserts one marketing_lead_activity row.
// It answers `{ ok: true }` with status 200 whether the lead already existed or
// was just created, and the response carries no id, no "created" flag and no
// activity count. A second registration from the same address is therefore
// indistinguishable from a first one on this side of the wire.
//
// The read endpoint in the design (onderdeel 4) de-duplicates on email and
// keeps the first row, so a repeat registration does not corrupt the guest
// list either. Adding a 409 here would mean either a branch that can never run
// or a second round trip to an endpoint that does not exist yet, so the choice
// is to have neither. If duplicate feedback is ever wanted, the CRM write
// endpoint has to start reporting whether it created the lead.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data" });
  }

  const data = parsed.data;
  const fullName = `${data.firstName} ${data.lastName}`;

  const stored = await sendCrmSignal(data);
  if (!stored) {
    return res.status(500).json({ error: "Registration failed" });
  }

  // Past this point the registration exists, so nothing below may turn the
  // answer into an error: both mails are best-effort and only logged.
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.error(
      "Missing Resend env vars — skipping event registration notification"
    );
    return res.status(200).json({ ok: true });
  }

  const resend = new Resend(apiKey);

  // Notification to the organiser.
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      // sanitizeSubject, not escapeHtml: a subject is a header field, so the
      // risk is a newline in a name, not an unescaped angle bracket.
      subject: sanitizeSubject(
        `Event registration: ${fullName} (${data.company})`
      ),
      html: `
        <h2>New registration for Amsterdam, 6 October 2026</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(data.company)}</p>
        <p><strong>Job title:</strong> ${escapeHtml(data.jobTitle)}</p>
        <p><strong>Country:</strong> ${escapeHtml(data.country)}</p>
        <p><strong>Invited by:</strong> ${escapeHtml(data.invitedBy)}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        <p><strong>Consent to share with Workvivo by Zoom:</strong> yes</p>
        ${data.src ? `<p><strong>Source:</strong> ${escapeHtml(data.src)}</p>` : ""}
        <p><a href="${REGISTRATIONS_URL}">See all registrations</a></p>
      `,
    });
    if (error) {
      console.error("Resend registration notification error:", error);
    }
  } catch (err) {
    console.error("Resend registration notification error:", err);
  }

  // Acknowledgement to the registrant.
  try {
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      subject: "We received your registration for 6 October in Amsterdam",
      html: `
        <p>Hi ${escapeHtml(data.firstName)},</p>
        <p>Thank you for registering for ${EVENT_NAME}</p>
        <p>Date: 6 October 2026. Location: the Zoom office in Amsterdam.</p>
        <p>Seats are limited, so we run a short check on role before we confirm a place. You will hear from us by email once your seat is confirmed.</p>
        <p>Eclectik and Workvivo by Zoom</p>
      `,
    });
    if (error) {
      console.error("Resend registration confirmation error:", error);
    }
  } catch (err) {
    console.error("Resend registration confirmation error:", err);
  }

  return res.status(200).json({ ok: true });
}
