// Shared by the result-page unlock form (client) and api/scorecard.ts (server).
// The gate requires a work email: free/consumer providers are rejected.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "hotmail.com", "hotmail.nl", "hotmail.co.uk", "hotmail.fr", "hotmail.de",
  "outlook.com", "outlook.de", "live.com", "live.nl", "msn.com",
  "yahoo.com", "yahoo.co.uk", "ymail.com",
  "icloud.com", "me.com", "mac.com", "aol.com",
  "proton.me", "protonmail.com", "pm.me",
  "gmx.com", "gmx.de", "gmx.net", "mail.com",
  "yandex.com", "yandex.ru", "zoho.com",
  // NL consumer/ISP domains
  "ziggo.nl", "kpnmail.nl", "home.nl", "xs4all.nl", "hetnet.nl", "planet.nl",
  "upcmail.nl", "chello.nl", "casema.nl", "telfort.nl", "online.nl", "freedom.nl",
]);

export function isWorkEmail(email: string): boolean {
  const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email.trim().toLowerCase());
  return m !== null && !FREE_EMAIL_DOMAINS.has(m[1]);
}
