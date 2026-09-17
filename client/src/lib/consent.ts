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
  } catch (error) {
    // Meten mag falen, de site niet. Wel loggen: als dit vuurt is er iets
    // echt mis, bijvoorbeeld een dataLayer die geen array meer is.
    console.warn("[consent] kon de consent-update niet versturen", error);
  }
}
