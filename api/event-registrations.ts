import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// POST, not GET: the password would otherwise sit in the url, and from there in
// browser history, referrers and any log the request passes through.
const BodySchema = z.object({
  password: z.string().min(1).max(200),
  event: z.string().trim().min(1).max(100),
});

/** A hanging CRM must not hold the function open until Vercel kills it. */
const CRM_TIMEOUT_MS = 8_000;

// One text for every rejected password. The caller never learns whether the
// password was wrong, whether the account exists, or how far it got.
const UNAUTHORIZED = { error: "Invalid password" } as const;
const MISCONFIGURED = { error: "Server configuration error" } as const;
const UPSTREAM_FAILED = { error: "Could not load registrations" } as const;

/**
 * Constant-time string comparison.
 *
 * `timingSafeEqual` throws when the two buffers differ in length, so the raw
 * strings cannot go in directly: guarding that with an early length check would
 * hand an attacker the password length through a fast path. Hashing both sides
 * to a SHA-256 digest first makes the inputs a fixed 32 bytes, so the compare
 * always runs over the same width and reveals neither length nor content.
 */
function constantTimeEquals(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(digestA, digestB);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    // No zod issues in the response: they would echo the submitted password
    // back to the client and into whatever logs the response.
    return res.status(400).json({ error: "Invalid request" });
  }

  const expected = process.env.EVENT_ADMIN_PASSWORD;
  if (!expected) {
    console.error(
      "EVENT_ADMIN_PASSWORD is not set — the registrations overview is unreachable until it is configured"
    );
    return res.status(500).json(MISCONFIGURED);
  }

  if (!constantTimeEquals(parsed.data.password, expected)) {
    // Never log the attempted password, not even a prefix or its length.
    console.warn("Rejected a registrations request: wrong password");
    return res.status(401).json(UNAUTHORIZED);
  }

  const base = process.env.CRM_BASE_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!base || !secret) {
    console.error("CRM env vars not set — cannot read registrations");
    return res.status(500).json(MISCONFIGURED);
  }

  const url = `${base}/api/event-registrations?event=${encodeURIComponent(
    parsed.data.event
  )}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "x-webhook-secret": secret,
      },
    });

    if (!r.ok) {
      console.error(
        "CRM event-registrations failed:",
        r.status,
        await r.text().catch(() => "")
      );
      return res.status(502).json(UPSTREAM_FAILED);
    }

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    // Includes the AbortError thrown when CRM_TIMEOUT_MS expires, and a body
    // that does not parse as JSON: same answer for all of them.
    console.error("CRM event-registrations error:", err);
    return res.status(502).json(UPSTREAM_FAILED);
  } finally {
    clearTimeout(timer);
  }
}
