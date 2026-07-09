import { describe, it, expect } from "vitest";
import { isWorkEmail } from "./work-email";

describe("isWorkEmail", () => {
  it("accepts valid business addresses", () => {
    expect(isWorkEmail("marco@eclectik.co")).toBe(true);
    expect(isWorkEmail("jan.de.vries@client-name.com")).toBe(true);
  });

  it("rejects free providers, case-insensitively", () => {
    const free = [
      "gmail.com", "googlemail.com",
      "hotmail.com", "hotmail.nl", "hotmail.co.uk", "hotmail.fr", "hotmail.de",
      "outlook.com", "outlook.de", "live.com", "live.nl", "msn.com",
      "yahoo.com", "yahoo.co.uk", "ymail.com",
      "icloud.com", "me.com", "mac.com", "aol.com",
      "proton.me", "protonmail.com", "pm.me",
      "gmx.com", "gmx.de", "gmx.net", "mail.com",
      "yandex.com", "yandex.ru", "zoho.com",
    ];
    for (const d of free) expect(isWorkEmail(`user@${d}`), d).toBe(false);
    expect(isWorkEmail("User@GMAIL.COM")).toBe(false);
  });

  it("rejects NL consumer domains", () => {
    const nl = [
      "ziggo.nl", "kpnmail.nl", "home.nl", "xs4all.nl", "hetnet.nl",
      "planet.nl", "upcmail.nl", "chello.nl", "casema.nl", "telfort.nl",
      "online.nl", "freedom.nl",
    ];
    for (const d of nl) expect(isWorkEmail(`user@${d}`), d).toBe(false);
  });

  it("rejects invalid forms", () => {
    expect(isWorkEmail("foo")).toBe(false);
    expect(isWorkEmail("a@b")).toBe(false);
    expect(isWorkEmail("")).toBe(false);
  });
});
