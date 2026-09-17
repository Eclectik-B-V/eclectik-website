import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, COOKIE_NAME } from "./consent";

// Vitest draait vanaf de repo-root, niet vanaf client/.
const indexHtml = readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");

// Prettier mag dit bestand herformatteren: het zet enkele quotes om naar dubbele
// en herindenteert. Deze canary moet daar niet op omvallen, dus we vergelijken op
// een genormaliseerde vorm in plaats van op letterlijke brontekst.
const normalized = indexHtml.replace(/"/g, "'").replace(/\s+/g, " ");

function objectLiteralAfter(marker: string): string {
  const start = normalized.indexOf(marker);
  expect(start, `marker niet gevonden in client/index.html: ${marker}`).toBeGreaterThan(-1);
  return normalized.slice(start, normalized.indexOf("});", start));
}

describe("bootstrap-script in client/index.html", () => {
  it("gebruikt dezelfde cookienaam als de consent-store", () => {
    expect(normalized).toContain(`var COOKIE_NAME = '${COOKIE_NAME}';`);
  });

  it("gebruikt hetzelfde versienummer als de consent-store", () => {
    expect(normalized).toContain(`var CONSENT_VERSION = ${CONSENT_VERSION};`);
  });

  it("staat boven de GA4-snippet", () => {
    const bootstrapAt = normalized.indexOf("Consent bootstrap");
    const ga4At = normalized.indexOf("Google Analytics 4");
    expect(bootstrapAt).toBeGreaterThan(-1);
    expect(ga4At).toBeGreaterThan(-1);
    expect(bootstrapAt).toBeLessThan(ga4At);
  });

  it("laadt geen Google Tag Manager meer", () => {
    // De container GTM-KZKSN8CT was leeg: nul tags, nul triggers. Hij laadde
    // ruim 330 KB runtime om niets te doen. Komt hij ooit terug, dan moet het
    // bootstrap-script er weer boven staan, net als bij GA4.
    expect(normalized).not.toContain("GTM-KZKSN8CT");
    expect(normalized).not.toContain("googletagmanager.com/gtm.js");
  });

  it("zet elk niet-essentieel signaal op denied als default", () => {
    const defaults = objectLiteralAfter("gtag('consent', 'default'");
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

  it("mapt bij de consent-update dezelfde categorieen op dezelfde signalen als toSignals", () => {
    const update = objectLiteralAfter("gtag('consent', 'update'");
    expect(update).toContain("ad_storage: g(c.marketing)");
    expect(update).toContain("ad_user_data: g(c.marketing)");
    expect(update).toContain("ad_personalization: g(c.marketing)");
    expect(update).toContain("analytics_storage: g(c.analytics)");
    expect(update).toContain("functionality_storage: g(c.functional)");
    expect(update).toContain("personalization_storage: g(c.functional)");
    expect(update).toContain("security_storage: 'granted'");
  });

  it("valideert de opgeslagen keuze even streng als readConsent", () => {
    // readConsent eist ook een timestamp. Zonder deze check zouden de bootstrap
    // en de store het oneens zijn over of er geldige toestemming ligt.
    expect(normalized).toContain("typeof stored.timestamp !== 'string'");
  });
});
