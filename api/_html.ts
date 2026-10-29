/**
 * Ontsnapt tekst die in een HTML-mailbody terechtkomt.
 *
 * Stond eerst alleen in event-registration.ts. Nu twee endpoints hem nodig
 * hebben staat hij hier: een tweede kopie van een functie die XSS moet
 * tegenhouden is precies het soort duplicaat dat uit elkaar gaat lopen.
 *
 * Voor een onderwerpregel is dit niet het goede gereedschap. Dat is een
 * headerveld, zie sanitizeSubject in _mail-subject.ts.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
