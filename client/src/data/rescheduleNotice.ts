/**
 * De tijdelijke melding dat het event is verschoven van 6 oktober naar
 * 12 november 2026.
 *
 * Tijdelijk: na 3 oktober 2026 rendert de melding niets meer. Daarna kunnen
 * dit bestand, rescheduleNotice.test.ts, RescheduleNotice.tsx en de aanroep in
 * EventAmsterdam2026.tsx allemaal weg.
 *
 * De logica staat bewust los van de component. Vitest draait hier op
 * `environment: "node"` en er is geen testing-library, dus een component valt
 * niet te testen maar dit wel.
 */

/**
 * 3 oktober 2026 23:59:59 CEST, genoteerd in UTC omdat de browser van de
 * bezoeker in elke tijdzone kan staan. Dezelfde afspraak als
 * SESSION_DEADLINE_ISO in sessionInvite.ts.
 */
export const NOTICE_END_ISO = "2026-10-03T21:59:59Z";

const NOTICE_END_MS = Date.parse(NOTICE_END_ISO);

/**
 * localStorage en niet sessionStorage: wie hem wegklikt moet hem ook bij een
 * volgend bezoek kwijt zijn. De sleutel draagt het jaartal zodat een volgend
 * event er niet per ongeluk op meelift.
 */
export const NOTICE_STORAGE_KEY = "evt-ams-2026-rescheduled-dismissed";

/**
 * Of de melding nog binnen zijn venster valt.
 *
 * Let op dat dit de klok van het apparaat leest. Staat die dagen verkeerd, dan
 * klopt de uitkomst niet, en dat is hier prima: het ergste geval is een
 * bezoeker die een melding ziet die hij niet meer nodig had.
 */
export function isWithinNoticeWindow(now: number = Date.now()): boolean {
  return now <= NOTICE_END_MS;
}

/** Of deze browser de melding al heeft weggeklikt. */
export function hasDismissedNotice(): boolean {
  try {
    return window.localStorage.getItem(NOTICE_STORAGE_KEY) === "1";
  } catch {
    // Privevenster, geblokkeerde site-data, of helemaal geen window. Dan tonen
    // we de melding liever een keer te vaak dan helemaal niet.
    return false;
  }
}

/** Onthoudt dat de melding weg mag. Mislukt dat, dan komt hij gewoon terug. */
export function markNoticeDismissed(): void {
  try {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, "1");
  } catch {
    // Niets aan te doen en niets aan verloren.
  }
}

/** De enige vraag die de component stelt. */
export function shouldShowNotice(now: number = Date.now()): boolean {
  return isWithinNoticeWindow(now) && !hasDismissedNotice();
}
