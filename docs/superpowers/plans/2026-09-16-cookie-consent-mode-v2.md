# Cookie Consent en Google Consent Mode v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een werkende consent-laag voor eclectik.co zodat GA4 via Google Consent Mode v2 wordt aangestuurd, de LinkedIn Insight Tag pas na marketing-toestemming laadt, en de bestaande pagina `/cookie-settings` echt doet wat hij belooft.

**Architecture:** Vier lagen. Een inline, synchroon bootstrap-script bovenin `client/index.html` zet de Consent Mode v2 defaults op `denied` voordat GTM laadt en stuurt meteen een `update` als er al een keuze in de cookie staat. Een nieuwe `client/src/lib/consent.ts` is de enige plek die weet hoe toestemming wordt opgeslagen en hoe categorieen op Google-signalen mappen. Een `ConsentProvider` plus `CookieBanner` in React regelen de UI en de keuze. Een `LinkedInInsightTag`-component injecteert de LinkedIn-tag pas na marketing-consent, omdat die tag Consent Mode niet ondersteunt.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9 (strict), Tailwind 4, wouter, sonner, radix-ui, pnpm 10.4.1. Nieuw in dit plan: vitest en jsdom.

**Spec:** `docs/superpowers/specs/2026-09-16-cookie-consent-mode-v2-design.md`

**Conventies uit `ONBOARDING.md` die hier gelden:**
- **Nooit `git push` zonder eerst aan Olivier te vragen.** `main` deployt automatisch naar productie via Vercel, dus al dit werk gebeurt op een branch.
- Commit per stap.
- `pnpm check` (tsc) en `pnpm build` moeten groen zijn voordat een taak af is.
- Verifieer in de browser voordat je verdergaat, via de preview-configuratie `eclectik-site-dev` op poort 5173.

**Uitgangssituatie:** `client/index.html` bevat hardcoded GTM (`GTM-KZKSN8CT`), GA4 (`G-LD7EPKT1W2`) en de LinkedIn Insight Tag (partner `9108033`). Alle drie vuren onvoorwaardelijk. `client/src/pages/CookieSettings.tsx` schrijft alleen een `console.log`. Het project heeft geen testframework.

---

## Bestandsoverzicht

| Bestand | Actie | Verantwoordelijkheid |
|---|---|---|
| `vitest.config.ts` | Create | Testrunner, jsdom-omgeving, `@`-alias |
| `package.json` | Modify | `test`-script, `vitest` en `jsdom` als devDependency |
| `tsconfig.json` | Modify | Testbestanden meenemen in `pnpm check` |
| `client/src/lib/consent.ts` | Create | Consent-store: opslag, validatie, categorie-naar-signaal mapping, `gtag`-update |
| `client/src/lib/consent.test.ts` | Create | Unit tests voor bovenstaande |
| `client/index.html` | Modify | Bootstrap-script bovenin de head; LinkedIn-scripts en noscript-pixel eruit |
| `client/src/lib/consent.bootstrap.test.ts` | Create | Canary die de bewuste duplicatie tussen bootstrap en store bewaakt |
| `client/src/contexts/ConsentContext.tsx` | Create | React-state rond de store, plus de herlaadregel bij intrekken van marketing |
| `client/src/components/CookieBanner.tsx` | Create | Banner met drie gelijkwaardige keuzes |
| `client/src/components/LinkedInInsightTag.tsx` | Create | Injecteert de LinkedIn-tag pas na marketing-consent |
| `client/src/lib/tracking.ts` | Modify | `Window`-declaratie uitbreiden met `_linkedin_data_partner_ids` en `lintrk.q` |
| `client/src/App.tsx` | Modify | `ConsentProvider`, `CookieBanner` en `LinkedInInsightTag` monteren |
| `client/src/pages/CookieSettings.tsx` | Modify | Lezen uit en schrijven naar de store in plaats van `console.log` |
| `GTM-SETUP-GUIDE.md` | Modify | Consent-sectie toevoegen, verouderd domein corrigeren |

---

### Task 1: Branch en worktree

**Files:** geen in-repo wijzigingen, alleen git plumbing.

`main` deployt automatisch naar productie. Werk daarom in een aparte worktree.

- [ ] **Step 1: Controleer dat je op een schone main staat**

```bash
cd ~/Desktop/eclectik-website
git status --short
git branch --show-current
```

Expected: branch is `main`. Er staan mogelijk untracked bestanden (`eclectik_website_H2design.zip`, `website_content/`, `.claude/worktrees/`). Die laat je met rust.

- [ ] **Step 2: Maak branch en worktree**

```bash
cd ~/Desktop/eclectik-website
git worktree add ~/Desktop/eclectik-website-consent -b cookie-consent-mode-v2 main
```

Expected: `Preparing worktree (new branch 'cookie-consent-mode-v2')`.

- [ ] **Step 3: Installeer dependencies in de worktree**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm install
```

Expected: `Done in ...`. Geen errors.

**Vanaf hier gebeurt al het werk in `~/Desktop/eclectik-website-consent`.**

---

### Task 2: Vitest opzetten

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

Het project heeft geen testrunner. Vitest sluit aan op de bestaande Vite-setup. `jsdom` is nodig omdat de consent-store `document.cookie` gebruikt.

- [ ] **Step 1: Installeer vitest en jsdom**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm add -D vitest jsdom
```

Expected: beide verschijnen in `devDependencies` in `package.json`.

- [ ] **Step 2: Maak `vitest.config.ts`**

Een losse config in plaats van een merge met `vite.config.ts`, omdat die laatste `root` op `client/` zet en dat de test-globs zou verschuiven.

```ts
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["client/src/**/*.test.ts", "client/src/**/*.test.tsx"],
  },
});
```

- [ ] **Step 3: Voeg het test-script toe aan `package.json`**

Voeg in het `"scripts"`-blok, direct na de regel `"check": "tsc --noEmit",`, deze twee regels toe:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 4: Laat `pnpm check` de tests ook typechecken**

In `tsconfig.json` staat nu:

```json
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
```

Vervang die regel door:

```json
  "exclude": ["node_modules", "build", "dist"],
```

De tests importeren `describe`, `it` en `expect` expliciet uit `vitest`, dus er is geen `globals`-configuratie of extra `types`-entry nodig.

- [ ] **Step 5: Verifieer dat de runner draait**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm test
```

Expected: `No test files found, exiting with code 0` of vergelijkbaar. Geen configuratiefout.

- [ ] **Step 6: Verifieer dat de typecheck nog groen is**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 7: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts
git commit -m "chore: add vitest with jsdom for consent logic tests"
```

---

### Task 3: De consent-store, test eerst

**Files:**
- Create: `client/src/lib/consent.test.ts`
- Create: `client/src/lib/consent.ts`

Dit is het hart van de laag. Test eerst, dan implementeren.

- [ ] **Step 1: Schrijf de falende tests**

Maak `client/src/lib/consent.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCEPT_ALL,
  CONSENT_VERSION,
  COOKIE_NAME,
  DENY_ALL,
  applyConsent,
  hasValidConsent,
  readConsent,
  toSignals,
  writeConsent,
  type ConsentCategories,
} from "./consent";

function clearConsentCookie() {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/`;
}

function setRawConsentCookie(raw: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/`;
}

beforeEach(() => {
  clearConsentCookie();
  window.gtag = undefined;
  window.dataLayer = undefined;
});

describe("readConsent", () => {
  it("geeft null zonder cookie", () => {
    expect(readConsent()).toBeNull();
  });

  it("geeft null bij een onleesbare cookiewaarde", () => {
    setRawConsentCookie("dit-is-geen-json");
    expect(readConsent()).toBeNull();
  });

  it("geeft null bij een oudere consent-versie", () => {
    setRawConsentCookie(
      JSON.stringify({
        version: CONSENT_VERSION - 1,
        timestamp: "2026-01-01T00:00:00.000Z",
        categories: ACCEPT_ALL,
      }),
    );
    expect(readConsent()).toBeNull();
  });

  it("geeft null als categories ontbreekt", () => {
    setRawConsentCookie(
      JSON.stringify({ version: CONSENT_VERSION, timestamp: "2026-01-01T00:00:00.000Z" }),
    );
    expect(readConsent()).toBeNull();
  });

  it("geeft null als een categorie geen boolean is", () => {
    setRawConsentCookie(
      JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: "2026-01-01T00:00:00.000Z",
        categories: { analytics: "ja", marketing: false, functional: false },
      }),
    );
    expect(readConsent()).toBeNull();
  });
});

describe("writeConsent en readConsent samen", () => {
  const combinations: ConsentCategories[] = [
    ACCEPT_ALL,
    DENY_ALL,
    { analytics: true, marketing: false, functional: false },
    { analytics: false, marketing: true, functional: false },
    { analytics: false, marketing: false, functional: true },
  ];

  it.each(combinations)("schrijft en leest %o terug", (categories) => {
    writeConsent(categories);
    expect(readConsent()?.categories).toEqual(categories);
  });

  it("zet de huidige versie en een ISO-timestamp", () => {
    const stored = writeConsent(ACCEPT_ALL);
    expect(stored.version).toBe(CONSENT_VERSION);
    expect(() => new Date(stored.timestamp).toISOString()).not.toThrow();
    expect(readConsent()?.version).toBe(CONSENT_VERSION);
  });
});

describe("hasValidConsent", () => {
  it("is false zonder opgeslagen keuze", () => {
    expect(hasValidConsent()).toBe(false);
  });

  it("is true na een opgeslagen keuze", () => {
    writeConsent(DENY_ALL);
    expect(hasValidConsent()).toBe(true);
  });
});

describe("toSignals", () => {
  it("vertaalt marketing naar alle drie de advertentiesignalen", () => {
    expect(toSignals({ analytics: false, marketing: true, functional: false })).toEqual({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  });

  it("vertaalt analytics en functional los van elkaar", () => {
    expect(toSignals({ analytics: true, marketing: false, functional: true })).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
      functionality_storage: "granted",
      personalization_storage: "granted",
      security_storage: "granted",
    });
  });

  it("houdt security_storage altijd granted", () => {
    expect(toSignals(DENY_ALL).security_storage).toBe("granted");
  });
});

describe("applyConsent", () => {
  it("stuurt een consent update naar gtag", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    applyConsent(ACCEPT_ALL);

    expect(gtag).toHaveBeenCalledWith("consent", "update", toSignals(ACCEPT_ALL));
  });

  it("pusht een consent_update event naar de dataLayer", () => {
    window.dataLayer = [];

    applyConsent(DENY_ALL);

    expect(window.dataLayer?.[0]).toEqual({
      event: "consent_update",
      ...toSignals(DENY_ALL),
    });
  });

  it("gooit geen fout als gtag en dataLayer ontbreken", () => {
    expect(() => applyConsent(ACCEPT_ALL)).not.toThrow();
  });
});
```

- [ ] **Step 2: Draai de tests en bevestig dat ze falen**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm test
```

Expected: FAIL met `Failed to resolve import "./consent"` of `Cannot find module`.

- [ ] **Step 3: Schrijf de implementatie**

Maak `client/src/lib/consent.ts`:

```ts
/**
 * Consent-store voor Google Consent Mode v2.
 *
 * Dit is de enige plek die weet hoe toestemming wordt opgeslagen en hoe onze
 * categorieen zich verhouden tot de Google-signalen.
 *
 * LET OP: het bootstrap-script bovenin `client/index.html` dupliceert
 * COOKIE_NAME, CONSENT_VERSION en de mapping in `toSignals`, omdat dat script
 * moet draaien voordat deze bundle bestaat. Wijzig je hier iets, wijzig het
 * daar dan ook.
 */

export const COOKIE_NAME = "eclectik_consent";

/**
 * Verhoog dit nummer zodra er een tracker bijkomt of de categorieen wijzigen.
 * Opgeslagen toestemming met een ander versienummer telt als ongeldig, dus de
 * banner verschijnt dan opnieuw.
 */
export const CONSENT_VERSION = 1;

/** Twaalf maanden. De browser dwingt het verlopen af, niet onze eigen code. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentCategories = {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

export type StoredConsent = {
  version: number;
  timestamp: string;
  categories: ConsentCategories;
};

export const ACCEPT_ALL: ConsentCategories = {
  analytics: true,
  marketing: true,
  functional: true,
};

export const DENY_ALL: ConsentCategories = {
  analytics: false,
  marketing: false,
  functional: false,
};

type SignalValue = "granted" | "denied";

export type ConsentSignals = {
  ad_storage: SignalValue;
  ad_user_data: SignalValue;
  ad_personalization: SignalValue;
  analytics_storage: SignalValue;
  functionality_storage: SignalValue;
  personalization_storage: SignalValue;
  security_storage: SignalValue;
};

export function toSignals(categories: ConsentCategories): ConsentSignals {
  const g = (allowed: boolean): SignalValue => (allowed ? "granted" : "denied");
  return {
    ad_storage: g(categories.marketing),
    ad_user_data: g(categories.marketing),
    ad_personalization: g(categories.marketing),
    analytics_storage: g(categories.analytics),
    functionality_storage: g(categories.functional),
    personalization_storage: g(categories.functional),
    // Essentiele cookies zijn nooit optioneel.
    security_storage: "granted",
  };
}

function isConsentCategories(value: unknown): value is ConsentCategories {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    typeof candidate.functional === "boolean"
  );
}

export function readConsent(): StoredConsent | null {
  try {
    const prefix = `${COOKIE_NAME}=`;
    const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
    if (!match) return null;

    const parsed: unknown = JSON.parse(decodeURIComponent(match.slice(prefix.length)));
    if (typeof parsed !== "object" || parsed === null) return null;

    const stored = parsed as Record<string, unknown>;
    if (stored.version !== CONSENT_VERSION) return null;
    if (typeof stored.timestamp !== "string") return null;
    if (!isConsentCategories(stored.categories)) return null;

    return {
      version: stored.version,
      timestamp: stored.timestamp,
      categories: stored.categories,
    };
  } catch {
    // Cookies geblokkeerd of onleesbare waarde: behandelen als geen toestemming.
    return null;
  }
}

export function writeConsent(categories: ConsentCategories): StoredConsent {
  const stored: StoredConsent = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories,
  };

  try {
    const value = encodeURIComponent(JSON.stringify(stored));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Cookies geblokkeerd: de keuze geldt voor deze paginaweergave en gaat
    // daarna verloren. De banner verschijnt dan opnieuw, wat correct is.
  }

  return stored;
}

export function hasValidConsent(): boolean {
  return readConsent() !== null;
}

/**
 * Stuurt de keuze naar Google en naar de dataLayer. Ontbreekt `gtag` omdat een
 * adblocker toesloeg, dan gebeurt er stil niets en blijft de UI werken.
 */
export function applyConsent(categories: ConsentCategories): void {
  const signals = toSignals(categories);
  try {
    window.gtag?.("consent", "update", signals);
    window.dataLayer?.push({ event: "consent_update", ...signals });
  } catch {
    // Geen actie: meten mag falen, de site niet.
  }
}
```

Let op: `window.gtag` en `window.dataLayer` zijn al getypeerd via de `declare global` in `client/src/lib/tracking.ts`, die tot hetzelfde TypeScript-programma behoort.

- [ ] **Step 4: Draai de tests en bevestig dat ze slagen**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm test
```

Expected: PASS, 19 tests geslaagd, 0 gefaald.

- [ ] **Step 5: Typecheck**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/src/lib/consent.ts client/src/lib/consent.test.ts
git commit -m "feat: add consent store with Consent Mode v2 signal mapping"
```

---

### Task 4: Consent bootstrap in de head

**Files:**
- Modify: `client/index.html`
- Create: `client/src/lib/consent.bootstrap.test.ts`

Het script moet inline en synchroon draaien, als allereerste in de `<head>`, boven de GTM-snippet. Laadt GTM eerder, dan zijn de defaults te laat en vuurt GA4 met volledige opslag.

- [ ] **Step 1: Voeg het bootstrap-script toe**

In `client/index.html` staat nu direct na `<head>` de GTM-snippet, die begint met `<!-- Google Tag Manager -->`. Plak het volgende blok er direct **boven**, zodat het het eerste element in de `<head>` is:

```html
    <!-- Consent bootstrap: MOET boven GTM en GA4 staan en synchroon draaien.
         Dupliceert bewust de cookienaam, het versienummer en de signaalmapping
         uit client/src/lib/consent.ts, omdat dit draait voordat de bundle
         bestaat. Wijzig je daar iets, wijzig het hier ook. -->
    <script>
    (function () {
      var COOKIE_NAME = 'eclectik_consent';
      var CONSENT_VERSION = 1;

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = window.gtag || gtag;

      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
        wait_for_update: 500
      });
      gtag('set', 'ads_data_redaction', true);
      gtag('set', 'url_passthrough', true);

      try {
        var prefix = COOKIE_NAME + '=';
        var match = document.cookie.split('; ').filter(function (row) {
          return row.indexOf(prefix) === 0;
        })[0];
        if (!match) return;

        var stored = JSON.parse(decodeURIComponent(match.slice(prefix.length)));
        if (!stored || stored.version !== CONSENT_VERSION || !stored.categories) return;

        var c = stored.categories;
        if (typeof c.analytics !== 'boolean' ||
            typeof c.marketing !== 'boolean' ||
            typeof c.functional !== 'boolean') return;

        var g = function (allowed) { return allowed ? 'granted' : 'denied'; };
        gtag('consent', 'update', {
          ad_storage: g(c.marketing),
          ad_user_data: g(c.marketing),
          ad_personalization: g(c.marketing),
          analytics_storage: g(c.analytics),
          functionality_storage: g(c.functional),
          personalization_storage: g(c.functional),
          security_storage: 'granted'
        });
      } catch (e) {
        /* Onleesbare of geblokkeerde cookie: de denied-defaults blijven staan. */
      }
    })();
    </script>

```

- [ ] **Step 2: Controleer de volgorde in het bestand**

```bash
cd ~/Desktop/eclectik-website-consent
grep -n "Consent bootstrap\|Google Tag Manager\|Google Analytics 4" client/index.html | head -5
```

Expected: het regelnummer van `Consent bootstrap` is lager dan dat van `Google Tag Manager`, dat weer lager is dan `Google Analytics 4`.

- [ ] **Step 3: Leg de duplicatie vast met een canary-test**

Het bootstrap-script dupliceert bewust de cookienaam, het versienummer en de
signaalmapping uit `client/src/lib/consent.ts`. Zonder vangnet loopt die
duplicatie stil uit elkaar zodra iemand `CONSENT_VERSION` verhoogt en het
script vergeet. Deze test laat dat luid falen.

Maak `client/src/lib/consent.bootstrap.test.ts`:

```ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, COOKIE_NAME } from "./consent";

// Vitest draait vanaf de repo-root, niet vanaf client/.
const indexHtml = readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");

describe("bootstrap-script in client/index.html", () => {
  it("gebruikt dezelfde cookienaam als de consent-store", () => {
    expect(indexHtml).toContain(`var COOKIE_NAME = '${COOKIE_NAME}';`);
  });

  it("gebruikt hetzelfde versienummer als de consent-store", () => {
    expect(indexHtml).toContain(`var CONSENT_VERSION = ${CONSENT_VERSION};`);
  });

  it("staat boven de GTM-snippet", () => {
    const bootstrapAt = indexHtml.indexOf("Consent bootstrap");
    const gtmAt = indexHtml.indexOf("Google Tag Manager");
    expect(bootstrapAt).toBeGreaterThan(-1);
    expect(gtmAt).toBeGreaterThan(-1);
    expect(bootstrapAt).toBeLessThan(gtmAt);
  });

  it("zet elk niet-essentieel signaal op denied als default", () => {
    const defaults = indexHtml.slice(
      indexHtml.indexOf("gtag('consent', 'default'"),
      indexHtml.indexOf("gtag('set', 'ads_data_redaction'"),
    );
    for (const signal of [
      "ad_storage",
      "ad_user_data",
      "ad_personalization",
      "analytics_storage",
      "functionality_storage",
      "personalization_storage",
    ]) {
      expect(defaults).toContain(`${signal}: 'denied'`);
    }
    expect(defaults).toContain("security_storage: 'granted'");
    expect(defaults).toContain("wait_for_update: 500");
  });
});
```

Draai de tests:

```bash
cd ~/Desktop/eclectik-website-consent
pnpm test
```

Expected: alle tests slagen, inclusief de vier nieuwe.

- [ ] **Step 4: Verifieer in de browser dat de default-call vooraan staat**

Start de preview met de configuratie `eclectik-site-dev` (poort 5173) en voer op de pagina uit:

```js
window.dataLayer.map(function (entry) { return Array.prototype.slice.call(entry); }).slice(0, 4)
```

Expected: het eerste item is `["consent", "default", {...}]` met alle waarden `denied` behalve `security_storage`, en het staat vóór de `gtm.start`-entry.

- [ ] **Step 5: Build-sanity**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm build
```

Expected: `built in ...` zonder errors.

- [ ] **Step 6: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/index.html client/src/lib/consent.bootstrap.test.ts
git commit -m "feat: set Consent Mode v2 defaults to denied before GTM loads"
```

---

### Task 5: ConsentProvider en mounting

**Files:**
- Create: `client/src/contexts/ConsentContext.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Maak de context**

Maak `client/src/contexts/ConsentContext.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyConsent, readConsent, writeConsent, type ConsentCategories } from "@/lib/consent";

type SaveResult = {
  /** true als de pagina herlaadt omdat marketing-consent is ingetrokken */
  reloading: boolean;
};

interface ConsentContextType {
  /** null betekent: de bezoeker heeft nog geen geldige keuze gemaakt */
  categories: ConsentCategories | null;
  /** true zolang de banner getoond moet worden */
  needsChoice: boolean;
  saveConsent: (categories: ConsentCategories) => SaveResult;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ConsentCategories | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setCategories(stored ? stored.categories : null);
    setHydrated(true);
  }, []);

  const saveConsent = useCallback(
    (next: ConsentCategories): SaveResult => {
      const previous = categories;

      writeConsent(next);
      applyConsent(next);
      setCategories(next);

      // De LinkedIn Insight Tag laat zich niet ontladen zodra hij in de pagina
      // zit. Trekt iemand marketing-consent in terwijl de tag al draait, dan is
      // herladen de enige manier om hem echt kwijt te raken.
      const reloading = previous?.marketing === true && next.marketing === false;
      if (reloading) {
        window.location.reload();
      }

      return { reloading };
    },
    [categories],
  );

  const value = useMemo<ConsentContextType>(
    () => ({
      categories,
      needsChoice: hydrated && categories === null,
      saveConsent,
    }),
    [categories, hydrated, saveConsent],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextType {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent moet binnen een ConsentProvider gebruikt worden");
  }
  return context;
}
```

- [ ] **Step 2: Monteer de provider in `client/src/App.tsx`**

Voeg bij de imports toe, direct onder `import { ThemeProvider } from "./contexts/ThemeContext";`:

```tsx
import { ConsentProvider } from "./contexts/ConsentContext";
```

Vervang vervolgens de hele `App`-functie door:

```tsx
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <ConsentProvider>
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ConsentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 4: Verifieer dat de site nog laadt**

Open de preview op poort 5173 en controleer de console op errors.

Expected: de homepage rendert normaal, geen errors in de console.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/src/contexts/ConsentContext.tsx client/src/App.tsx
git commit -m "feat: add ConsentProvider and mount it in App"
```

---

### Task 6: De cookiebanner

**Files:**
- Create: `client/src/components/CookieBanner.tsx`
- Modify: `client/src/App.tsx`

De drie knoppen krijgen gelijk visueel gewicht. Weigeren moet even makkelijk zijn als accepteren, anders is de toestemming niet vrij gegeven en juridisch ongeldig.

- [ ] **Step 1: Maak de banner**

Maak `client/src/components/CookieBanner.tsx`:

```tsx
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/contexts/ConsentContext";
import { ACCEPT_ALL, DENY_ALL } from "@/lib/consent";

export default function CookieBanner() {
  const { needsChoice, saveConsent } = useConsent();
  const [location] = useLocation();

  // Op de voorkeurenpagina zou de banner de opslaan-knop overlappen. De keuze
  // wordt daar sowieso gemaakt, dus daar blijft hij weg.
  if (!needsChoice || location === "/cookie-settings") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-card/95 backdrop-blur-md"
    >
      <div className="container mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to analyse our traffic and to measure our marketing. You decide what we may
          use. Read more in our{" "}
          <Link href="/privacy-policy" className="underline transition-colors hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button variant="outline" size="lg" onClick={() => saveConsent(DENY_ALL)}>
            Essential only
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/cookie-settings">Manage preferences</Link>
          </Button>
          <Button size="lg" onClick={() => saveConsent(ACCEPT_ALL)}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Monteer de banner in `client/src/App.tsx`**

Voeg bij de imports toe, direct onder de bestaande `import ScrollToTop from "@/components/ScrollToTop";`:

```tsx
import CookieBanner from "@/components/CookieBanner";
```

Voeg in de `App`-functie `<CookieBanner />` toe direct na `<Router />`, zodat het blok er zo uitziet:

```tsx
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <Router />
            <CookieBanner />
          </TooltipProvider>
```

- [ ] **Step 3: Typecheck**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 4: Verifieer in de browser**

Open de preview op poort 5173 in een schone staat. Wis eerst de cookie via de console:

```js
document.cookie = "eclectik_consent=; Max-Age=0; Path=/"; window.location.reload();
```

Expected na de reload:
- De banner staat onderaan in beeld met drie knoppen.
- Klikken op "Accept all" laat de banner verdwijnen.
- `document.cookie` bevat nu `eclectik_consent` met `"analytics":true`.
- De laatste dataLayer-entry is een `consent_update` met alle signalen `granted`.
- Na een handmatige reload blijft de banner weg.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/src/components/CookieBanner.tsx client/src/App.tsx
git commit -m "feat: add cookie banner with equally weighted accept and reject"
```

---

### Task 7: LinkedIn Insight Tag achter consent

**Files:**
- Modify: `client/src/lib/tracking.ts`
- Create: `client/src/components/LinkedInInsightTag.tsx`
- Modify: `client/index.html`
- Modify: `client/src/App.tsx`

De LinkedIn Insight Tag ondersteunt Google Consent Mode niet en zet zijn cookies ongeacht het `ad_storage`-signaal. Hij moet dus fysiek niet geladen worden tot er marketing-consent is.

- [ ] **Step 1: Breid de Window-declaratie uit**

In `client/src/lib/tracking.ts` staat nu:

```ts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    lintrk?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
```

Vervang dat blok door:

```ts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    // `q` is de wachtrij die de Insight Tag zelf leegt zodra hij geladen is.
    lintrk?: ((...args: any[]) => void) & { q?: any[][] };
    dataLayer?: any[];
    _linkedin_data_partner_ids?: string[];
  }
}
```

- [ ] **Step 2: Maak de gated component**

Maak `client/src/components/LinkedInInsightTag.tsx`:

```tsx
import { useEffect } from "react";
import { useConsent } from "@/contexts/ConsentContext";

const PARTNER_ID = "9108033";
const SCRIPT_ID = "linkedin-insight-tag";

/**
 * De LinkedIn Insight Tag kent Google Consent Mode niet en zet zijn cookies
 * ongeacht het ad_storage-signaal. Daarom injecteren we hem pas nadat de
 * bezoeker marketing-cookies heeft geaccepteerd.
 *
 * Rendert niets.
 */
export default function LinkedInInsightTag() {
  const { categories } = useConsent();
  const marketingAllowed = categories?.marketing === true;

  useEffect(() => {
    if (!marketingAllowed) return;
    if (document.getElementById(SCRIPT_ID)) return;

    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(PARTNER_ID);

    // Wachtrij zodat conversies die vlak na de toestemming worden gemeld niet
    // verloren gaan voordat het script binnen is.
    if (!window.lintrk) {
      const queue: any[][] = [];
      const shim = ((a: any, b: any) => {
        queue.push([a, b]);
      }) as NonNullable<Window["lintrk"]>;
      shim.q = queue;
      window.lintrk = shim;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    document.head.appendChild(script);
  }, [marketingAllowed]);

  return null;
}
```

- [ ] **Step 3: Haal de LinkedIn-tag uit `client/index.html`**

Verwijder in de `<head>` het hele blok tussen en inclusief `<!-- LinkedIn Insight Tag -->` en `<!-- End LinkedIn Insight Tag -->`.

Verwijder in de `<body>` het hele blok tussen en inclusief `<!-- LinkedIn Insight Tag (noscript) -->` en `<!-- End LinkedIn Insight Tag (noscript) -->`.

De noscript-pixel komt niet terug. Een pixel in `<noscript>` kan niet afhankelijk zijn van een keuze die via JavaScript gemaakt wordt, dus hij zou per definitie zonder toestemming vuren.

- [ ] **Step 4: Controleer dat de tag echt weg is uit de HTML**

```bash
cd ~/Desktop/eclectik-website-consent
grep -c "licdn\|linkedin" client/index.html
```

Expected: `0`.

- [ ] **Step 5: Monteer de component in `client/src/App.tsx`**

Voeg bij de imports toe, direct onder `import CookieBanner from "@/components/CookieBanner";`:

```tsx
import LinkedInInsightTag from "@/components/LinkedInInsightTag";
```

Voeg `<LinkedInInsightTag />` toe direct na `<CookieBanner />`:

```tsx
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <Router />
            <CookieBanner />
            <LinkedInInsightTag />
          </TooltipProvider>
```

- [ ] **Step 6: Typecheck**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 7: Verifieer in de browser**

Wis de cookie en herlaad:

```js
document.cookie = "eclectik_consent=; Max-Age=0; Path=/"; window.location.reload();
```

Expected:
- Vóór een keuze staat er geen enkel netwerkrequest naar `snap.licdn.com` in de lijst.
- Na "Essential only" nog steeds niet.
- Na het accepteren van marketing via `/cookie-settings` of "Accept all" verschijnt er wel een request naar `snap.licdn.com/li.lms-analytics/insight.min.js`.

- [ ] **Step 8: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/src/lib/tracking.ts client/src/components/LinkedInInsightTag.tsx client/index.html client/src/App.tsx
git commit -m "feat: load LinkedIn Insight Tag only after marketing consent"
```

---

### Task 8: Cookievoorkeurenpagina werkend maken

**Files:**
- Modify: `client/src/pages/CookieSettings.tsx`

De pagina schrijft nu alleen een `console.log`. De opmaak blijft ongewijzigd, alleen de logica verandert.

- [ ] **Step 1: Vervang de imports bovenin het bestand**

Het bestand begint nu met:

```tsx
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
```

Vervang dat blok door:

```tsx
import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useConsent } from "@/contexts/ConsentContext";
import { DENY_ALL, type ConsentCategories } from "@/lib/consent";
```

- [ ] **Step 2: Vervang de state en handlers**

Het huidige blok is:

```tsx
export default function CookieSettings() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true
  });

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // In a real implementation, this would save to localStorage or a cookie management system
    console.log("Saving cookie preferences:", preferences);
    // Show success message or toast here
  };
```

Vervang dat door:

```tsx
export default function CookieSettings() {
  const { categories, saveConsent } = useConsent();
  const [preferences, setPreferences] = useState<ConsentCategories>(categories ?? DENY_ALL);

  // De provider leest de cookie pas na de eerste render, dus de opgeslagen
  // keuze komt een tik later binnen.
  useEffect(() => {
    if (categories) setPreferences(categories);
  }, [categories]);

  const handleToggle = (key: keyof ConsentCategories) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    const { reloading } = saveConsent(preferences);
    // Bij intrekken van marketing herlaadt de pagina, dan is een toast zinloos.
    if (!reloading) {
      toast.success("Your cookie preferences have been saved.");
    }
  };
```

De `essential`-schakelaar in de JSX staat al hardcoded op `checked={true} disabled={true}` en hoeft niet te veranderen. Essential zit bewust niet in `ConsentCategories`, want hij is nooit optioneel.

- [ ] **Step 3: Typecheck**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm check
```

Expected: geen output, exit code 0.

- [ ] **Step 4: Verifieer in de browser**

Ga naar `/cookie-settings` op poort 5173 en loop dit door:

1. Wis de cookie via de console en herlaad. Expected: alle drie de schakelaars staan uit.
2. Zet analytics aan, klik op "Save Preferences". Expected: een toast met "Your cookie preferences have been saved." en de cookie `eclectik_consent` bevat `"analytics":true,"marketing":false`.
3. Navigeer naar de homepage. Expected: geen banner meer.
4. Ga terug naar `/cookie-settings`. Expected: analytics staat aan, de andere twee uit.
5. Zet marketing aan en sla op. Expected: een request naar `snap.licdn.com` verschijnt.
6. Zet marketing weer uit en sla op. Expected: de pagina herlaadt, en na de reload is er geen nieuw request naar `snap.licdn.com`.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add client/src/pages/CookieSettings.tsx
git commit -m "fix: make cookie settings page actually store and apply consent"
```

---

### Task 9: Volledige verificatie met bewijs

**Files:** geen wijzigingen, tenzij er iets stuk blijkt.

Dit is de acceptatietest uit de spec. Leg het bewijs vast en vat het samen voor Olivier. Vraag hem niet om zelf te controleren.

- [ ] **Step 1: Draai de volledige testsuite en build**

```bash
cd ~/Desktop/eclectik-website-consent
pnpm test && pnpm check && pnpm build
```

Expected: tests PASS, geen tsc-output, build slaagt.

- [ ] **Step 2: Controleer de `gcs`-parameter zonder toestemming**

Wis de cookie, herlaad, en lees de netwerkrequests naar `google-analytics.com` uit.

Expected: het `collect`-request bevat `gcs=G100`. De `1` op positie twee en drie staan voor `ad_storage` en `analytics_storage`, en `0` betekent geweigerd, dus `G100` is de geweigerde staat.

- [ ] **Step 3: Controleer de `gcs`-parameter met toestemming**

Klik op "Accept all" en bekijk het volgende `collect`-request.

Expected: `gcs=G111`.

- [ ] **Step 4: Controleer dat LinkedIn niet vroegtijdig vuurt**

Wis de cookie, herlaad, en filter de netwerkrequests op `licdn`.

Expected: nul resultaten voordat er marketing-consent is.

- [ ] **Step 5: Controleer het herhaalbezoek**

Accepteer alles, herlaad de pagina, en inspecteer de eerste vier dataLayer-entries.

Expected: er staat een `consent default` met `denied` en direct daarna een `consent update` met `granted`, beide vóór de `gtm.start`-entry. De banner verschijnt niet.

- [ ] **Step 6: Maak een screenshot van de banner**

Wis de cookie, herlaad de homepage, en maak een screenshot van de banner onderaan.

- [ ] **Step 7: Vat het bewijs samen voor Olivier**

Rapporteer per controle het waargenomen resultaat, met de screenshot erbij. Als een controle faalt: niet doorgaan, maar de oorzaak opzoeken en repareren.

---

### Task 10: Documentatie bijwerken

**Files:**
- Modify: `GTM-SETUP-GUIDE.md`

De guide beschrijft nu een situatie zonder consent en verwijst naar een verouderd domein.

- [ ] **Step 1: Corrigeer het verouderde domein**

In `GTM-SETUP-GUIDE.md` staat bij Stap 1 van de GTM-configuratie:

```
5. Voer je website URL in: `https://www.eclectik-insights.co`
```

Vervang die regel door:

```
5. Voer je website URL in: `https://www.eclectik.co`
```

- [ ] **Step 2: Voeg een consent-sectie toe**

Voeg direct onder het blok `## ✅ Wat is al geïnstalleerd` (dus na de opsomming van de vier punten en vóór de `---`) deze sectie in:

```markdown

---

## 🍪 Consent en Google Consent Mode v2

Sinds september 2026 draait de site op Google Consent Mode v2 in advanced mode.

**Hoe het werkt**

1. Een inline script bovenin `client/index.html` zet alle consent-signalen op `denied` voordat GTM laadt. GA4 laadt dus wel, maar stuurt cookieloze pings tot de bezoeker kiest.
2. De bezoeker kiest via de banner of via `/cookie-settings`.
3. De keuze wordt opgeslagen in de first-party cookie `eclectik_consent`, twaalf maanden geldig, en direct als `consent update` naar Google gestuurd.
4. Bij een herhaalbezoek stuurt het bootstrap-script de update opnieuw, nog voordat GTM laadt.

**Categorieen en signalen**

| Categorie | Google Consent Mode v2 signalen |
|---|---|
| essential | `security_storage`, altijd granted |
| analytics | `analytics_storage` |
| marketing | `ad_storage`, `ad_user_data`, `ad_personalization` |
| functional | `functionality_storage`, `personalization_storage` |

**LinkedIn valt hierbuiten.** De LinkedIn Insight Tag ondersteunt Consent Mode niet en zet zijn cookies ongeacht het `ad_storage`-signaal. Hij wordt daarom pas door `client/src/components/LinkedInInsightTag.tsx` in de pagina geïnjecteerd nadat marketing is geaccepteerd. Trekt iemand die toestemming in, dan herlaadt de pagina, want een eenmaal geladen Insight Tag laat zich niet ontladen.

**Als je een tracker toevoegt:** verhoog `CONSENT_VERSION` in `client/src/lib/consent.ts` en in het bootstrap-script in `client/index.html`. Bestaande toestemming vervalt dan en de banner verschijnt opnieuw.

**Tags testen in GTM:** gebruik in de GTM-preview het tabblad Consent om per tag te zien welke signalen hij vereist en of hij daadwerkelijk gevuurd heeft.

**Nog te doen, buiten de scope van deze wijziging:**
- Controleren of de GTM-container een eigen GA4-configuratietag bevat. Als dat zo is, vuurt elke pageview dubbel naast de directe `gtag('config', ...)` in `client/index.html`.
- De events uit `client/src/lib/tracking.ts` aansluiten. Alleen `trackCTAClick` en `trackNewsletterSignup` worden nu aangeroepen, beide in `client/src/pages/Home.tsx`. Het contactformulier stuurt geen `contact_form_submit`, ondanks wat hieronder beschreven staat.
```

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/eclectik-website-consent
git add GTM-SETUP-GUIDE.md
git commit -m "docs: document consent mode v2 setup and correct stale domain"
```

- [ ] **Step 4: Vat de branch samen en vraag om toestemming voor de push**

```bash
cd ~/Desktop/eclectik-website-consent
git log --oneline main..cookie-consent-mode-v2
git diff --stat main..cookie-consent-mode-v2
```

Laat dit aan Olivier zien en **vraag expliciet of hij wil dat je pusht.** Nooit pushen zonder dat hij ja zegt.
