# H2 2026 Redesign — Foundation Phase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Foundation slice of the H2 2026 redesign — new nav/routing, rebuilt Home, Benchmark page, and waiting-list form end-to-end — on branch `h2-2026-redesign`, deployed to a new review-only Vercel project.

**Architecture:** Vite + React 19 SPA (wouter routing) with Vercel serverless functions. New `api/waitlist.ts` follows the existing `api/contact.ts` pattern: zod validation → optional CRM webhook (graceful when env vars absent) → Resend emails. UI work preserves all design tokens and the Layout shell; only nav contents, footer, Home and new pages change.

**Tech Stack:** React 19, Vite 7, TypeScript, Tailwind 4, wouter, framer-motion, react-helmet-async, sonner, zod, Resend, pnpm.

**Spec:** `docs/superpowers/specs/2026-07-07-h2-2026-redesign-foundation-design.md`

**Verification convention:** This repo has no unit-test framework and its established convention (ONBOARDING.md) is: `pnpm check` (tsc) + `pnpm build` + verify in the browser before moving on. Per instruction priority, that convention replaces TDD steps here. Every task ends with `pnpm check` + a browser check where applicable, then a commit. **All work happens in the worktree at `~/Desktop/eclectik-website-H22026` after Task 1.** Never `git push` without asking Olivier first.

---

### Task 1: Branch + worktree setup

**Files:** none in-repo (git plumbing); Create: `.gitignore` entry

The target folder `~/Desktop/eclectik-website-H22026` already exists and contains 3 reference files (instructions md, mockup html, funnel pptx). `git worktree add` needs the target to be empty, so move them aside first, then back in under `redesign-reference/` (untracked, gitignored).

- [ ] **Step 1: Move reference files aside**

```bash
mkdir -p ~/Desktop/eclectik-h2-refs-tmp
mv ~/Desktop/eclectik-website-H22026/* ~/Desktop/eclectik-h2-refs-tmp/
```

- [ ] **Step 2: Create branch + worktree**

```bash
cd ~/Desktop/eclectik-website
git worktree add ~/Desktop/eclectik-website-H22026 -b h2-2026-redesign main
```

Expected: `Preparing worktree (new branch 'h2-2026-redesign')`.

- [ ] **Step 3: Move reference files back in, gitignored**

```bash
mkdir -p ~/Desktop/eclectik-website-H22026/redesign-reference
mv ~/Desktop/eclectik-h2-refs-tmp/* ~/Desktop/eclectik-website-H22026/redesign-reference/
rmdir ~/Desktop/eclectik-h2-refs-tmp
cd ~/Desktop/eclectik-website-H22026
echo "/redesign-reference/" >> .gitignore
```

- [ ] **Step 4: Install deps in the worktree and verify baseline**

```bash
cd ~/Desktop/eclectik-website-H22026
pnpm install
pnpm check && pnpm build
```

Expected: install succeeds, `tsc` clean, build clean. (If rollup native-module error: `rm -rf node_modules && pnpm install` — known Node-switch gotcha.)

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: start h2-2026-redesign branch, ignore redesign-reference"
```

---

### Task 2: Positioning constant in `shared/const.ts`

**Files:**
- Modify: `shared/const.ts`

The eyebrow/tagline string must live in one place so the pending naming decision (15 Jul test) is a one-line swap.

- [ ] **Step 1: Append the constant**

```ts
// H2 2026 positioning eyebrow — single source of truth.
// Naming decision gated on the 15 Jul landing-page test; swap here only.
export const POSITIONING_TAGLINE = "Independent AI transformation assurance";
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm check
git add shared/const.ts
git commit -m "feat: add POSITIONING_TAGLINE constant"
```

---

### Task 3: Attribution + new tracking events in `lib/tracking.ts`

**Files:**
- Modify: `client/src/lib/tracking.ts` (append at end)
- Modify: `client/src/App.tsx` (init call)

- [ ] **Step 1: Append to `client/src/lib/tracking.ts`**

```ts
/**
 * Attribution: capture ?src= from the URL on page load, persist for the
 * session, include in form submissions and funnel events. No cookies.
 */
const ATTRIBUTION_KEY = "eclectik_src";

export function initAttribution() {
  if (typeof window === "undefined") return;
  try {
    const src = new URLSearchParams(window.location.search).get("src");
    if (src) {
      sessionStorage.setItem(ATTRIBUTION_KEY, src.slice(0, 100));
    }
  } catch {
    // sessionStorage unavailable (private mode edge cases) — attribution is best-effort
  }
}

export function getAttribution(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return sessionStorage.getItem(ATTRIBUTION_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Track a visitor choosing one of the two doors on Home
 */
export function trackDoorSelected(door: "value" | "change") {
  trackEvent("door_selected", {
    event_category: "engagement",
    door,
    src: getAttribution(),
  });
}

/**
 * Track a successful benchmark waiting-list signup
 */
export function trackWaitlistJoined() {
  trackEvent("waitlist_joined", {
    event_category: "conversion",
    src: getAttribution(),
  });
  trackLinkedInConversion();
}
```

- [ ] **Step 2: Call `initAttribution()` once in `client/src/App.tsx`**

Add imports and a `useEffect` in the `App` component:

```tsx
import { useEffect } from "react";
import { initAttribution } from "@/lib/tracking";
```

Inside `function App()` before `return`:

```tsx
useEffect(() => {
  initAttribution();
}, []);
```

- [ ] **Step 3: Verify and commit**

```bash
pnpm check
git add client/src/lib/tracking.ts client/src/App.tsx
git commit -m "feat: src attribution helper + door/waitlist tracking events"
```

---

### Task 4: `api/waitlist.ts` serverless function

**Files:**
- Create: `api/waitlist.ts`

Pattern-match `api/contact.ts`. Behaviour: validate → CRM signal (skip/log if env absent or failing) → Resend notification to `CONTACT_TO_EMAIL` (this is the fallback record; its failure = 500) → Resend confirmation to subscriber (failure = log only).

- [ ] **Step 1: Create `api/waitlist.ts`**

```ts
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

    // Confirmation to the subscriber — best-effort
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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Waitlist handler error:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm check
git add api/waitlist.ts
git commit -m "feat: waitlist API — zod validation, CRM signal (graceful), Resend emails"
```

---

### Task 5: `WaitlistForm` component

**Files:**
- Create: `client/src/components/WaitlistForm.tsx`

Used in two places: Home benchmark band and `/benchmark#waitlist`. Native `<select>` elements styled to match the existing input treatment (mockup look), shadcn `Checkbox` for consent.

- [ ] **Step 1: Create `client/src/components/WaitlistForm.tsx`**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getAttribution, trackWaitlistJoined } from "@/lib/tracking";

const ROLE_OPTIONS = [
  "CFO / Finance leader",
  "CIO / CTO / IT leader",
  "Transformation / Change leader",
  "HR / People leader",
  "Other",
];

const SECTOR_OPTIONS = [
  "Manufacturing & Industrial",
  "Finance",
  "Telecommunications",
  "Utilities & Energy",
  "Transport",
  "Ecommerce & Retail",
  "Consumer Goods",
  "Life Sciences",
  "Public sector",
  "Professional services",
  "Other",
];

const inputClass =
  "w-full bg-white/5 border border-white/15 rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

export default function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sector, setSector] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Please tick the consent box to join the waiting list");
      return;
    }
    if (!role || !sector) {
      toast.error("Please select your role and sector");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          role,
          sector,
          consent,
          src: getAttribution(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Signup failed");
      }
      trackWaitlistJoined();
      toast.success("You're on the list — check your inbox for confirmation.");
      setName("");
      setEmail("");
      setCompany("");
      setRole("");
      setSector("");
      setConsent(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card backdrop-blur-md border border-white/10 rounded-2xl p-8 space-y-4"
    >
      <h4 className="font-heading text-lg font-semibold text-white">Register your interest</h4>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className={inputClass}
        aria-label="Name"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Work email"
        className={inputClass}
        aria-label="Work email"
      />
      <input
        type="text"
        required
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company"
        className={inputClass}
        aria-label="Company"
      />
      <select
        required
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className={inputClass}
        aria-label="Role"
      >
        <option value="" disabled>
          Role
        </option>
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r} className="bg-background text-foreground">
            {r}
          </option>
        ))}
      </select>
      <select
        required
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        className={inputClass}
        aria-label="Sector"
      >
        <option value="" disabled>
          Sector
        </option>
        {SECTOR_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-background text-foreground">
            {s}
          </option>
        ))}
      </select>
      <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-0.5"
        />
        <span>I agree to receive benchmark updates from Eclectik. Unsubscribe anytime.</span>
      </label>
      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
      >
        {submitting ? "Joining…" : "Join the waiting list"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        No spam. Benchmark updates only — unsubscribe anytime.
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm check
git add client/src/components/WaitlistForm.tsx
git commit -m "feat: WaitlistForm component with consent + attribution"
```

---

### Task 6: Placeholder pages (Insights, Scorecard, Proof of Value, Proof of Change)

**Files:**
- Create: `client/src/components/PlaceholderPage.tsx`
- Create: `client/src/pages/Insights.tsx`
- Create: `client/src/pages/Scorecard.tsx`
- Create: `client/src/pages/ProofOfValue.tsx`
- Create: `client/src/pages/ProofOfChange.tsx`

Review-URL-only placeholders so stakeholders see the full nav now; each is swapped for a real page in Spec 2.

- [ ] **Step 1: Create `client/src/components/PlaceholderPage.tsx`**

```tsx
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { POSITIONING_TAGLINE } from "@shared/const";

interface PlaceholderPageProps {
  title: string;
  heading: string;
  description: string;
}

export default function PlaceholderPage({ title, heading, description }: PlaceholderPageProps) {
  return (
    <Layout>
      <Helmet>
        <title>{title} | Eclectik</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="min-h-[70vh] flex items-center pt-32 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              {POSITIONING_TAGLINE}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">{heading}</h1>
          <p className="text-lg text-muted-foreground mb-10">{description}</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </Layout>
  );
}
```

Note: the `@shared` alias is configured in both `vite.config.ts` and `tsconfig.json` (`@shared/*` → `shared/*`), so this import works as written.

- [ ] **Step 2: Create the four thin pages**

`client/src/pages/Insights.tsx`:

```tsx
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Insights() {
  return (
    <PlaceholderPage
      title="Insights"
      heading="Insights"
      description="Evidence, not opinions. One observation with a number, every month. The full insights library launches in August 2026."
    />
  );
}
```

`client/src/pages/Scorecard.tsx`:

```tsx
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Scorecard() {
  return (
    <PlaceholderPage
      title="Scorecard"
      heading="The 10-question scorecard"
      description="Ten questions, three dimensions: value proof, change proof, readiness. Launches in August 2026 — join the benchmark waiting list to hear first."
    />
  );
}
```

`client/src/pages/ProofOfValue.tsx`:

```tsx
import PlaceholderPage from "@/components/PlaceholderPage";

export default function ProofOfValue() {
  return (
    <PlaceholderPage
      title="Proof of value"
      heading="What is AI delivering in the P&L?"
      description="ROI, TCO and adoption economics, modelled on your own licence, usage and telemetry data. The full proof-of-value page launches in August 2026."
    />
  );
}
```

`client/src/pages/ProofOfChange.tsx`:

```tsx
import PlaceholderPage from "@/components/PlaceholderPage";

export default function ProofOfChange() {
  return (
    <PlaceholderPage
      title="Proof of change"
      heading="Is your workforce actually changing?"
      description="People science and expert interpretation of your listening data — whatever instrument you run. The full proof-of-change page launches in August 2026."
    />
  );
}
```

- [ ] **Step 3: Verify and commit**

```bash
pnpm check
git add client/src/components/PlaceholderPage.tsx client/src/pages/Insights.tsx client/src/pages/Scorecard.tsx client/src/pages/ProofOfValue.tsx client/src/pages/ProofOfChange.tsx
git commit -m "feat: placeholder pages for Insights, Scorecard and door pages"
```

---

### Task 7: Benchmark page

**Files:**
- Create: `client/src/pages/Benchmark.tsx`

Prospectus page: smaller hero, no background image; what/who/capacity; data-governance placeholder flagged for legal review; `WaitlistForm` anchored at `#waitlist`.

- [ ] **Step 1: Create `client/src/pages/Benchmark.tsx`**

```tsx
import { useEffect } from "react";
import Layout from "@/components/Layout";
import WaitlistForm from "@/components/WaitlistForm";
import { Helmet } from "react-helmet-async";
import { POSITIONING_TAGLINE } from "@shared/const";

export default function Benchmark() {
  // Support /benchmark#waitlist deep links (ScrollToTop resets scroll on route
  // change, so scroll to the anchor after mount).
  useEffect(() => {
    if (window.location.hash === "#waitlist") {
      requestAnimationFrame(() => {
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>The AI Transformation Benchmark | Eclectik</title>
        <meta
          name="description"
          content="Standardised KPIs, process-level measurement and peer comparison for AI transformation. Opens September 2026 — join the waiting list."
        />
      </Helmet>

      {/* Hero — solid background, no image */}
      <section className="pt-40 pb-16">
        <div className="container max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              {POSITIONING_TAGLINE}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight mb-6">
            The benchmark — opens September
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            How does your AI transformation compare with your peers? Standardised KPIs,
            process-level measurement and peer comparison across organisations — built on the
            same method we run inside leading enterprises today.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Standardised KPIs
            </h3>
            <p className="text-muted-foreground text-sm">
              The same value and change indicators measured the same way in every
              participating organisation — so comparison means something.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Process-level measurement
            </h3>
            <p className="text-muted-foreground text-sm">
              Evidence gathered where the work happens: licence, usage and telemetry data on
              the value side, listening data on the change side.
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Peer comparison
            </h3>
            <p className="text-muted-foreground text-sm">
              Placement against organisations of comparable shape — sector, size and
              transformation stage — not against averages.
            </p>
          </div>
        </div>
      </section>

      {/* Who it is for + capacity */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-heading font-semibold text-white mb-6">Who it is for</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            CFOs and CIOs who need an independent value statement before the next investment
            decision, and transformation leaders who need proof their workforce is actually
            changing. If AI spend is on your board agenda, the benchmark tells you where you
            stand.
          </p>
          <p className="border-l-2 border-secondary pl-5 text-foreground max-w-2xl">
            We run around twelve audits a year. Q3 is full. The waiting list hears first when
            September seats open.
          </p>
        </div>
      </section>

      {/* Data governance — placeholder pending legal review */}
      <section className="py-16 border-t border-white/10">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-heading font-semibold text-white mb-6">
            Data governance
          </h2>
          {/* LEGAL REVIEW PENDING — placeholder copy below must be legal-reviewed before launch */}
          <p className="text-muted-foreground max-w-2xl">
            Benchmark participation runs on your own data, under your own governance. Data is
            processed under a data-processing agreement, stored within the EU, and never
            shared between participants — peer comparison uses aggregated, anonymised
            placement only. Eclectik is ISO 27001 certified.
          </p>
        </div>
      </section>

      {/* Waiting list */}
      <section id="waitlist" className="py-20 border-t border-white/10 bg-white/[0.03]">
        <div className="container max-w-4xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-secondary text-sm tracking-wider uppercase font-semibold block mb-4">
              The benchmark — opens September
            </span>
            <h2 className="text-3xl font-heading font-semibold text-white mb-4">
              Join the waiting list
            </h2>
            <p className="text-muted-foreground">
              Benchmark updates only. You hear first when September seats open — no spam,
              unsubscribe anytime.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </Layout>
  );
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm check
git add client/src/pages/Benchmark.tsx
git commit -m "feat: benchmark prospectus page with waiting-list form"
```

---

### Task 8: Routing — new routes + redirects in `App.tsx`

**Files:**
- Modify: `client/src/App.tsx`

Add new pages; move About to `/about` with a redirect from `/about-us`. All existing routes stay so nothing in `sitemap.xml` 404s.

- [ ] **Step 1: Add imports**

```tsx
import { Route, Switch, Redirect } from "wouter";
import Benchmark from "@/pages/Benchmark";
import Insights from "@/pages/Insights";
import Scorecard from "@/pages/Scorecard";
import ProofOfValue from "@/pages/ProofOfValue";
import ProofOfChange from "@/pages/ProofOfChange";
```

(The `Route, Switch` import line replaces the existing one to add `Redirect`.)

- [ ] **Step 2: Update the route table**

Replace `<Route path="/about-us" component={AboutUs} />` with:

```tsx
<Route path="/about" component={AboutUs} />
<Route path="/about-us">{() => <Redirect to="/about" />}</Route>
```

Add the new routes (before the `/404` route):

```tsx
<Route path="/benchmark" component={Benchmark} />
<Route path="/insights" component={Insights} />
<Route path="/scorecard" component={Scorecard} />
<Route path="/proof-of-value" component={ProofOfValue} />
<Route path="/proof-of-change" component={ProofOfChange} />
```

- [ ] **Step 3: Verify all routes in the browser**

```bash
pnpm dev
```

Visit and confirm each renders (no 404): `/`, `/about` (AboutUs), `/about-us` (redirects to `/about`), `/benchmark`, `/insights`, `/scorecard`, `/proof-of-value`, `/proof-of-change`, plus spot-check old URLs: `/consulting`, `/training`, `/solutions`, `/hrtechservices`, `/sectors`, `/careers`, `/resources/white-papers`, `/case-studies/copilot-impact`, `/services/people-science`, `/training/executive-coaching`, `/privacy-policy`, `/terms-of-service`.

- [ ] **Step 4: Verify and commit**

```bash
pnpm check
git add client/src/App.tsx
git commit -m "feat: routes for benchmark/insights/scorecard/doors, /about redirect"
```

---

### Task 9: New nav + slimmed footer in `Layout.tsx`

**Files:**
- Modify: `client/src/components/Layout.tsx`

- [ ] **Step 1: Replace the `navLinks` array** (`Layout.tsx:50-79`)

```tsx
const navLinks = [
  { name: "Benchmark", href: "/benchmark" },
  { name: "Insights", href: "/insights" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];
```

(The dropdown rendering branches become dead code paths but stay harmless — type the array as `{ name: string; href: string; dropdown?: { name: string; href: string }[] }[]` if tsc complains about the missing `dropdown` property.)

- [ ] **Step 2: Add the scorecard CTA button**

Desktop nav — inside `<nav className="hidden lg:flex …">`, after the `navLinks.map(...)`:

```tsx
<Link href="/scorecard">
  <Button className="bg-primary text-background hover:bg-primary/90 font-semibold">
    Take the scorecard
  </Button>
</Link>
```

Mobile menu overlay — after the `navLinks.map(...)`:

```tsx
<Link href="/scorecard">
  <Button className="bg-primary text-background hover:bg-primary/90 font-semibold">
    Take the scorecard
  </Button>
</Link>
```

- [ ] **Step 3: Slim the footer** — replace the footer grid (`Layout.tsx:168-226`) with:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
  <div className="space-y-6">
    <div className="flex items-center">
      <img src="/images/eclectik-logo-white-photo.svg" alt="Eclectik" className="h-14 w-auto" />
    </div>
    <p className="text-muted-foreground max-w-xs">
      The independent authority on whether AI transformation is working. Proof of value
      in the P&amp;L, proof of change in the workforce.
    </p>
  </div>

  <div className="lg:pl-8">
    <h4 className="font-heading font-bold text-lg mb-6">Company</h4>
    <ul className="space-y-4">
      <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
      <li><Link href="/insights" className="text-muted-foreground hover:text-primary transition-colors">Insights</Link></li>
      <li><Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
      <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
    </ul>
  </div>

  <div>
    <h4 className="font-heading font-bold text-lg mb-6">Trust</h4>
    <ul className="space-y-4">
      <li>
        <a
          href="/documents/iso-27001-certificate.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          ISO 27001
        </a>
      </li>
      <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy policy</Link></li>
      <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Terms of service</Link></li>
    </ul>
  </div>

  <div>
    <h4 className="font-heading font-bold text-lg mb-6">Stay updated</h4>
    <p className="text-muted-foreground mb-4">Evidence on AI transformation, monthly.</p>
    <form onSubmit={handleFooterSubscribe} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={footerEmail}
          onChange={(e) => setFooterEmail(e.target.value)}
          placeholder="Your email"
          className="bg-white/5 border border-white/10 rounded-md px-4 py-2 w-full focus:outline-none focus:border-primary transition-colors"
        />
        <Button type="submit" size="icon" className="shrink-0" disabled={footerSubmitting || !footerConsent}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={footerConsent}
          onChange={(e) => setFooterConsent(e.target.checked)}
          className="mt-0.5 accent-[#65C1D6]"
        />
        <span>I agree to receive the Eclectik newsletter. Unsubscribe anytime.</span>
      </label>
    </form>
  </div>
</div>
```

And add the consent state next to the existing footer state (`Layout.tsx:12-13`):

```tsx
const [footerConsent, setFooterConsent] = useState(false);
```

- [ ] **Step 4: Update the copyright line** (`Layout.tsx:229`)

```tsx
<p>&copy; 2026 Eclectik B.V. All rights reserved.</p>
```

Keep the bottom-bar links (Privacy Policy / Terms of Service / Cookie Settings) as they are.

- [ ] **Step 5: Verify in browser** — nav shows Benchmark/Insights/About/Contact + CTA button; footer shows the three columns + newsletter with consent; mobile menu works.

- [ ] **Step 6: Verify and commit**

```bash
pnpm check
git add client/src/components/Layout.tsx
git commit -m "feat: new top nav with scorecard CTA, slimmed footer"
```

---

### Task 10: Home rebuild

**Files:**
- Rewrite: `client/src/pages/Home.tsx`

Full rebuild per spec §6 and the mockup. Keep: `IsoCertModal` + hero ISO stamp animation (preserved trust infrastructure), hero background + overlays + stagger animations, JSON-LD blocks (verbatim except the email fix `info@eclectik.com` → `info@eclectik.co`). Remove: "what if?" carousel, five-service grid, sectors list, AINews, FAQ, the old composite image. New sections: hero copy, two doors, proof band, benchmark band with `WaitlistForm`, insights teaser.

- [ ] **Step 1: Replace `client/src/pages/Home.tsx` with:**

```tsx
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Link } from "wouter";
import WaitlistForm from "@/components/WaitlistForm";
import { Helmet } from "react-helmet-async";
import { trackCTAClick, trackDoorSelected } from "@/lib/tracking";
import { POSITIONING_TAGLINE } from "@shared/const";

// Use local worker served from public directory to avoid CSP issues
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const ISO_CERT_URL = "/documents/iso-27001-certificate.pdf";

function IsoCertModal({ onClose }: { onClose: () => void }) {
  const [numPages, setNumPages] = useState<number>(0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1f2e] rounded-xl shadow-2xl w-[90vw] max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">ISO 27001 Certificaat — Eclectik B.V.</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors text-2xl leading-none ml-4"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 px-4">
          <Document
            file={ISO_CERT_URL}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-white/50 py-20">Certificaat laden...</div>}
            error={<div className="text-red-400 py-20">Kon het certificaat niet laden.</div>}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={Math.min(window.innerWidth * 0.8, 750)}
                className="mb-4 shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

const PROOF_STATS = [
  { num: "3×", label: "Leaders underestimate employee AI use — McKinsey" },
  { num: "57%", label: "of employees hide their AI use from their employer — KPMG, n=48k" },
  { num: "12%", label: "of CEOs can show AI delivered both cost and revenue benefit — PwC" },
  { num: "42%", label: "of AI initiatives are abandoned before value — S&P Global" },
];

const INSIGHT_TEASERS = [
  {
    category: "Evidence",
    title: "The measurement gap: why self-reported AI ROI misleads",
    summary:
      "74% report positive ROI among those who measure. The broader sample shows no EBIT impact. Both are true.",
  },
  {
    category: "Change",
    title: "Shadow AI: what 57% of your workforce isn't telling you",
    summary:
      "Employees use AI three times more than leadership thinks — and more than half hide it.",
  },
  {
    category: "Value",
    title: "Works councils and AI adoption: the European wedge",
    summary:
      "Independent adoption evidence is co-determination currency. Why that matters for your rollout.",
  },
];

export default function Home() {
  const [showIsoCert, setShowIsoCert] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Layout>
      <Helmet>
        <title>Eclectik | Independent AI Transformation Assurance</title>

        {/* Organization Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Eclectik",
            alternateName: "Eclectik AI Transformation",
            url: "https://www.eclectik.co",
            logo: "https://www.eclectik.co/images/eclectik-logo-dark.svg",
            description:
              "Eclectik operationalizes Workplace Signals end-to-end, combining objective telemetry with subjective sentiment to build actionable AI transformation roadmaps.",
            contactPoint: {
              "@type": "ContactPoint",
              email: "info@eclectik.co",
              contactType: "Customer Service",
            },
            sameAs: [
              "https://www.linkedin.com/company/eclectik",
              "https://www.instagram.com/eclectik",
              "https://www.youtube.com/@eclectik",
            ],
          })}
        </script>

        {/* Professional Service Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            name: "Eclectik AI Transformation Consulting",
            image: "https://www.eclectik.co/images/eclectik-logo-dark.svg",
            description:
              "AI transformation consulting services including Copilot ROI modeling, change activation, and sustained adoption through workplace signals analysis.",
            url: "https://www.eclectik.co",
            serviceType: [
              "AI Transformation Consulting",
              "Microsoft Copilot Implementation",
              "Workplace Analytics",
              "Change Management",
              "AI Training & Enablement",
            ],
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-abstract-ai.png"
            alt="AI Neural Network Background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>

        <div className="container relative z-10">
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="max-w-4xl">
            <motion.div variants={fadeIn} className="mb-6 flex items-center gap-3">
              <div className="h-[1px] w-12 bg-primary" />
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                {POSITIONING_TAGLINE}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-white"
            >
              Is your AI transformation{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                actually working?
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              We prove it — in the P&amp;L and in your people.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/benchmark#waitlist" onClick={() => trackCTAClick("Join waiting list", "Hero Section")}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full bg-secondary hover:bg-secondary/90 text-white font-bold transition-all hover:scale-105"
                >
                  Join the benchmark waiting list <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/scorecard" onClick={() => trackCTAClick("Take scorecard", "Hero Section")}>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Take the 10-question scorecard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ISO Stamp — top right, opens certificate modal */}
        <motion.div
          initial={{ opacity: 0, y: -120, scale: 1.4, rotate: -15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -8 }}
          transition={{ delay: 1.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-24 right-8 z-20 hidden lg:block"
        >
          <button
            onClick={() => setShowIsoCert(true)}
            className="focus:outline-none relative group cursor-pointer"
            title="View ISO 27001 certificate"
          >
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(76,201,240,0.25) 0%, transparent 70%)" }}
            />
            <img
              src="/images/brand-compliance-logo-final.png"
              alt="Brand Compliance Certified"
              className="relative h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </button>
        </motion.div>
      </section>

      {/* Two Doors */}
      <section className="py-28">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <h2 className="text-4xl font-heading font-semibold text-white mb-4">
              One question, two proofs
            </h2>
            <p className="text-muted-foreground text-lg">
              Partners deliver the transformation. We prove whether it works — with independent
              evidence on both sides of the equation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-7">
            <Link
              href="/proof-of-value"
              onClick={() => trackDoorSelected("value")}
              className="block bg-card backdrop-blur-md border border-white/10 rounded-2xl p-10 transition-all hover:-translate-y-1 hover:border-primary group"
            >
              <span className="text-primary text-xs tracking-wider uppercase font-semibold block mb-4">
                Proof of value · CFO &amp; CIO
              </span>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                What is AI delivering in the P&amp;L?
              </h3>
              <p className="text-muted-foreground mb-6">
                ROI, TCO and adoption economics, modelled on your own licence, usage and
                telemetry data. An independent value statement — before the next investment
                decision, or after the last one.
              </p>
              <span className="text-primary font-semibold">Explore proof of value →</span>
            </Link>
            <Link
              href="/proof-of-change"
              onClick={() => trackDoorSelected("change")}
              className="block bg-card backdrop-blur-md border border-white/10 rounded-2xl p-10 transition-all hover:-translate-y-1 hover:border-accent group"
            >
              <span className="text-accent text-xs tracking-wider uppercase font-semibold block mb-4">
                Proof of change · Transformation leaders
              </span>
              <h3 className="text-2xl font-heading font-semibold text-white mb-3">
                Is your workforce actually changing?
              </h3>
              <p className="text-muted-foreground mb-6">
                People science and expert interpretation of your listening data — whatever
                instrument you run. We read the direction of travel and connect it to adoption
                reality.
              </p>
              <span className="text-accent font-semibold">Explore proof of change →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Proof Band */}
      <section className="py-20 bg-white/5">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {PROOF_STATS.map((stat) => (
              <div key={stat.num}>
                <div className="font-heading text-5xl font-bold text-primary leading-none">
                  {stat.num}
                </div>
                <div className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-11 opacity-75">
            The measurement gap is real. Only independent evidence resolves it.
          </p>
        </div>
      </section>

      {/* Benchmark Prospectus Band */}
      <section className="py-28">
        <div className="container grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-secondary text-sm tracking-wider uppercase font-semibold block mb-4">
              The benchmark — opens September
            </span>
            <h2 className="text-4xl font-heading font-semibold text-white mb-5">
              How does your AI transformation compare with your peers?
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              Standardised KPIs, process-level measurement, peer comparison across
              organisations — built on the same method we run inside leading enterprises
              today.
            </p>
            <p className="border-l-2 border-secondary pl-5 text-foreground mb-6">
              We run around twelve audits a year. Q3 is full. The waiting list hears first
              when September seats open.
            </p>
            <Link href="/benchmark" className="text-primary font-semibold hover:underline">
              Read the full benchmark prospectus →
            </Link>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* Insights Teaser */}
      <section className="py-28 bg-white/[0.03]">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <h2 className="text-4xl font-heading font-semibold text-white mb-4">Insights</h2>
            <p className="text-muted-foreground text-lg">
              Evidence, not opinions. One observation with a number, every month.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INSIGHT_TEASERS.map((item) => (
              <Link
                key={item.title}
                href="/insights"
                className="block bg-card border border-white/10 rounded-xl p-8 transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="text-accent text-xs tracking-wider uppercase font-semibold block mb-4">
                  {item.category}
                </span>
                <h4 className="font-heading text-lg font-semibold text-white leading-snug mb-3">
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {showIsoCert && <IsoCertModal onClose={() => setShowIsoCert(false)} />}
    </Layout>
  );
}
```

- [ ] **Step 2: Verify in browser** — hero copy/CTAs, gradient on "actually working?", doors, proof band (four stats + attributions), benchmark band with form, insights teaser, ISO stamp click opens cert modal. Compare side-by-side with `redesign-reference/eclectik-redesign-mockup.html` opened in a browser tab.

- [ ] **Step 3: Verify and commit**

```bash
pnpm check && pnpm build
git add client/src/pages/Home.tsx
git commit -m "feat: rebuild Home around H2 2026 assurance positioning"
```

---

### Task 11: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Type-check and build**

```bash
pnpm check && pnpm build
```

Expected: both clean.

- [ ] **Step 2: Route sweep** — with `pnpm dev` running, verify every URL from `client/public/sitemap.xml` resolves (renders a page, not NotFound): `/`, `/about-us` (→ `/about`), `/consulting`, `/training`, `/solutions`, `/hrtechservices`, `/contact`, `/sectors`, `/careers`, all 5 `/case-studies/*`, all 3 `/services/*`, all 3 `/training/*` subpages, `/resources/white-papers`, `/privacy-policy`, `/terms-of-service`. Plus the new routes: `/benchmark`, `/benchmark#waitlist` (scrolls to form), `/insights`, `/scorecard`, `/proof-of-value`, `/proof-of-change`.

- [ ] **Step 3: Attribution check** — open `http://localhost:5173/?src=li-test-1`, navigate to `/benchmark`, open devtools → `sessionStorage.getItem("eclectik_src")` returns `"li-test-1"`. Fill the waitlist form, submit, and confirm in the Network tab that the POST body includes `"src":"li-test-1"`. (Vite dev does not run `/api/*` — the request 404s locally; the body content is what's being verified. Full end-to-end happens on Vercel in Task 12.)

- [ ] **Step 4: Form validation check** — submit with empty fields (blocked by `required`), without consent (toast error), with all fields (request fires).

- [ ] **Step 5: Copy audit** — grep the new/changed pages for banned language:

```bash
grep -rniE "leverage|unlock|seamless|95%" client/src/pages/Home.tsx client/src/pages/Benchmark.tsx client/src/components/WaitlistForm.tsx client/src/pages/Insights.tsx client/src/pages/Scorecard.tsx client/src/pages/ProofOfValue.tsx client/src/pages/ProofOfChange.tsx
```

Expected: no matches. Also confirm no customer-facing "audit" except inside the approved capacity statement ("We run around twelve audits a year" — that phrasing is verbatim from the instructions doc and allowed).

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: verification pass corrections"
```

(Skip the commit if nothing changed.)

---

### Task 12: Push branch + new Vercel project (requires Olivier)

**Files:** none (deployment)

- [ ] **Step 1: Ask Olivier for permission to push** (hard convention — never push unprompted). Then:

```bash
git push -u origin h2-2026-redesign
```

- [ ] **Step 2: Create the new Vercel project** (Olivier in the Vercel dashboard, or via `vercel` CLI):

1. Vercel dashboard → Add New → Project → import `Eclectik-B-V/eclectik-website` (same repo, second project). Name it e.g. `eclectik-website-h2`.
2. Project Settings → Git → set **Production Branch** to `h2-2026-redesign`.
3. Build settings come from `vercel.json` (build `pnpm build`, output `dist/public`) — no overrides needed.
4. Settings → Environment Variables — add for Production:
   - `RESEND_API_KEY` (copy from existing project)
   - `RESEND_AUDIENCE_ID` (copy from existing project)
   - `CONTACT_FROM_EMAIL` = `noreply@eclectik.co`
   - `CONTACT_TO_EMAIL` = `olivier@eclectik.co`
   - `CRM_BASE_URL` / `CRM_WEBHOOK_SECRET` — **leave unset** until the CRM endpoint exists (the API degrades gracefully).
5. Deploy; note the stable review URL (e.g. `eclectik-website-h2.vercel.app`).

- [ ] **Step 3: End-to-end form test on the review URL** — visit `https://<review-url>/?src=li-test-e2e`, go to `/benchmark#waitlist`, submit the form with a real test email. Confirm: success toast; internal notification email arrives at `olivier@eclectik.co` with all fields + `Source: li-test-e2e`; confirmation email arrives at the test address; Vercel function logs show `CRM env vars not set — skipping website-signal`.

- [ ] **Step 4: Confirm the live site is untouched** — `https://www.eclectik.co` still serves the old site from the `main` project.

**Do NOT touch domains/DNS.** The domain cutover is a separate, deliberate future action outside this plan.

---

## Deferred to Spec 2 (Qualification phase — do not build now)

Scorecard (questions from Manish + threshold formula), real door pages, Insights listing + White Papers migration, AINews removal/deletion of dead components (`AINews.tsx`, `ServicePillars.tsx`, `ServicesOverview.tsx`, `FAQ.tsx` stay in the repo unused), partner lanes (`/microsoft`, `/workvivo`), sitemap regeneration, `llms.txt` update, full JSON-LD rework, `scorecard_started`/`scorecard_completed` events.
