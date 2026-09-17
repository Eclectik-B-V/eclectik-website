import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./waitlist.js";
import {
  invoke,
  stubConsole,
  crmOk,
  crmFail,
  crmFailUnreadable,
  XSS,
  XSS_ESCAPED,
} from "./_test-helpers.js";

const { sendMock, ctorMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  ctorMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
    constructor(apiKey: string) {
      ctorMock(apiKey);
    }
  },
}));

const validBody = (overrides: Record<string, unknown> = {}) => ({
  name: "Marco de Vries",
  email: "marco@acme-corp.com",
  company: "Acme BV",
  role: "CFO",
  sector: "Financial services",
  consent: true,
  src: "landing-hero",
  ...overrides,
});

const setMailEnv = () => {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("CONTACT_FROM_EMAIL", "site@eclectik.co");
  vi.stubEnv("CONTACT_TO_EMAIL", "hello@eclectik.co");
};

const setCrmEnv = () => {
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
};

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi.fn().mockResolvedValue(crmOk());
  vi.stubGlobal("fetch", fetchMock);
  sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null });
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/waitlist — method guard", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    setMailEnv();
    setCrmEnv();
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/waitlist — body validation", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  const bad: [string, unknown][] = [
    ["missing name", validBody({ name: undefined })],
    ["blank name", validBody({ name: "  " })],
    ["missing company", validBody({ company: undefined })],
    ["missing role", validBody({ role: "" })],
    ["missing sector", validBody({ sector: undefined })],
    ["invalid email", validBody({ email: "marco@@acme-corp" })],
    ["missing consent", validBody({ consent: undefined })],
    ["consent false", validBody({ consent: false })],
    ["consent as the string 'true'", validBody({ consent: "true" })],
    ["name over 200 chars", validBody({ name: "a".repeat(201) })],
    ["company over 200 chars", validBody({ company: "a".repeat(201) })],
    ["role over 100 chars", validBody({ role: "a".repeat(101) })],
    ["sector over 100 chars", validBody({ sector: "a".repeat(101) })],
    ["src over 100 chars", validBody({ src: "a".repeat(101) })],
    ["undefined body", undefined],
    ["array body", []],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a body without the optional src", async () => {
    const res = await invoke(handler, { body: validBody({ src: undefined }) });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).src).toBeUndefined();
    expect(sendMock.mock.calls[0][0].html).not.toContain("Source:");
  });

  it("accepts a free-provider address (no work-email gate on this form)", async () => {
    const res = await invoke(handler, {
      body: validBody({ email: "someone@gmail.com" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("api/waitlist — missing env vars", () => {
  it.each([
    ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"],
    ["CONTACT_FROM_EMAIL", "RESEND_API_KEY", "CONTACT_TO_EMAIL"],
    ["CONTACT_TO_EMAIL", "RESEND_API_KEY", "CONTACT_FROM_EMAIL"],
  ])(
    "without %s it still returns 200 and still signals the CRM",
    async (missing, keepA, keepB) => {
      setCrmEnv();
      vi.stubEnv(keepA, "set");
      vi.stubEnv(keepB, "set");
      vi.stubEnv(missing, undefined);

      const res = await invoke(handler, { body: validBody() });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(sendMock).not.toHaveBeenCalled();
      // sendCrmSignal() runs before the mail guard, as in
      // api/waitlist-qualification.ts: a mail misconfiguration must not cost
      // the signup its CRM record.
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).event).toBe(
        "waitlist_joined"
      );
      expect(console_.errorSpy).toHaveBeenCalledWith(
        "Missing Resend env vars — skipping waitlist notification"
      );
    }
  );

  it("returns 200 with neither service configured", async () => {
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it.each([
    ["CRM_BASE_URL", "CRM_WEBHOOK_SECRET"],
    ["CRM_WEBHOOK_SECRET", "CRM_BASE_URL"],
  ])(
    "without %s it warns, skips the signal and still sends the mail",
    async (missing, keep) => {
      setMailEnv();
      vi.stubEnv(keep, "set");
      vi.stubEnv(missing, undefined);

      const res = await invoke(handler, { body: validBody() });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(console_.warnSpy).toHaveBeenCalledWith(
        "CRM env vars not set — skipping website-signal"
      );
      expect(sendMock).toHaveBeenCalledTimes(2);
    }
  );
});

describe("api/waitlist — happy path", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("posts the website-signal to the CRM with the right shape", async () => {
    const res = await invoke(handler, { body: validBody() });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/website-signal");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      source: "website",
      event: "waitlist_joined",
      email: "marco@acme-corp.com",
      name: "Marco de Vries",
      company: "Acme BV",
      role: "CFO",
      sector: "Financial services",
      src: "landing-hero",
    });
  });

  it("sends the internal notification and the confirmation, in that order", async () => {
    await invoke(handler, { body: validBody() });

    expect(ctorMock).toHaveBeenCalledWith("re_test_key");
    expect(sendMock).toHaveBeenCalledTimes(2);

    const notification = sendMock.mock.calls[0][0];
    expect(notification.from).toBe("site@eclectik.co");
    expect(notification.to).toBe("hello@eclectik.co");
    expect(notification.replyTo).toBe("marco@acme-corp.com");
    expect(notification.subject).toBe(
      "Benchmark waiting list: Marco de Vries (Acme BV)"
    );
    expect(notification.html).toContain(
      "<strong>Name:</strong> Marco de Vries"
    );
    expect(notification.html).toContain("<strong>Company:</strong> Acme BV");
    expect(notification.html).toContain("<strong>Role:</strong> CFO");
    expect(notification.html).toContain(
      "<strong>Sector:</strong> Financial services"
    );
    expect(notification.html).toContain(
      "<strong>Source:</strong> landing-hero"
    );

    const confirmation = sendMock.mock.calls[1][0];
    expect(confirmation.from).toBe("site@eclectik.co");
    expect(confirmation.to).toBe("marco@acme-corp.com");
    expect(confirmation.subject).toBe(
      "You're on the Eclectik benchmark waiting list"
    );
    expect(confirmation.html).toContain("Hi Marco de Vries,");
    expect(confirmation.replyTo).toBeUndefined();
  });

  it("signals the CRM before it sends any mail", async () => {
    const order: string[] = [];
    fetchMock.mockImplementation(async () => {
      order.push("crm");
      return crmOk();
    });
    sendMock.mockImplementation(async () => {
      order.push("mail");
      return { data: { id: "msg" }, error: null };
    });

    await invoke(handler, { body: validBody() });
    expect(order).toEqual(["crm", "mail", "mail"]);
  });
});

describe("api/waitlist — HTML escaping", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("escapes a script tag in the name, in both mails", async () => {
    await invoke(handler, { body: validBody({ name: XSS }) });

    const notification = sendMock.mock.calls[0][0].html as string;
    const confirmation = sendMock.mock.calls[1][0].html as string;
    expect(notification).toContain(XSS_ESCAPED);
    expect(notification).not.toContain("<script>");
    expect(confirmation).toContain(XSS_ESCAPED);
    expect(confirmation).not.toContain("<script>");
  });

  it("escapes company, role, sector and src", async () => {
    await invoke(handler, {
      body: validBody({
        company: "Acme & <b>Co</b>",
        role: 'CFO "interim"',
        sector: "Retail > Food",
        src: "<img src=x onerror=alert(1)>",
      }),
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Acme &amp; &lt;b&gt;Co&lt;/b&gt;");
    expect(html).toContain("CFO &quot;interim&quot;");
    expect(html).toContain("Retail &gt; Food");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img");
  });

  it("sends the raw (unescaped) values to the CRM, as JSON", async () => {
    await invoke(handler, { body: validBody({ name: XSS }) });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).name).toBe(XSS);
  });
});

// The subject is a header field, so it gets the header encoding (strip line
// breaks and control chars), not the HTML encoding used for the body.
describe("api/waitlist — subject hygiene", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("strips a newline in the name so no second header can be injected", async () => {
    await invoke(handler, {
      body: validBody({ name: "Marco\nBcc: evil@example.com" }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe(
      "Benchmark waiting list: Marco Bcc: evil@example.com (Acme BV)"
    );
    expect(subject).not.toContain("\n");
  });

  it.each([
    ["carriage return", "\r"],
    ["CRLF", "\r\n"],
    ["tab", "\t"],
    ["vertical tab", "\v"],
    ["null byte", "\0"],
    ["DEL", String.fromCharCode(127)],
  ])("collapses %s in the company to a single space", async (_label, ch) => {
    await invoke(handler, { body: validBody({ company: `Acme${ch}${ch}BV` }) });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe("Benchmark waiting list: Marco de Vries (Acme BV)");
    expect(/\p{Cc}/u.test(subject)).toBe(false);
  });

  it("does not HTML-escape the subject (wrong encoding for a header)", async () => {
    await invoke(handler, {
      body: validBody({ name: XSS, company: "Acme & Co" }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe(`Benchmark waiting list: ${XSS} (Acme & Co)`);
    expect(subject).not.toContain("&amp;");
    expect(subject).not.toContain("&lt;");
  });

  it("keeps the raw newline in the CRM payload and in the escaped HTML body", async () => {
    await invoke(handler, {
      body: validBody({ name: "Marco\nBcc: evil@example.com" }),
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).name).toBe(
      "Marco\nBcc: evil@example.com"
    );
    expect(sendMock.mock.calls[0][0].html).toContain(
      "Marco\nBcc: evil@example.com"
    );
  });

  it("keeps an ordinary subject byte-for-byte", async () => {
    await invoke(handler, { body: validBody() });
    expect(sendMock.mock.calls[0][0].subject).toBe(
      "Benchmark waiting list: Marco de Vries (Acme BV)"
    );
    expect(sendMock.mock.calls[1][0].subject).toBe(
      "You're on the Eclectik benchmark waiting list"
    );
  });
});

describe("api/waitlist — CRM timeout", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an abort signal to the CRM fetch", async () => {
    await invoke(handler, { body: validBody() });
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("aborts a hanging CRM call and still finishes the signup", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener("abort", () =>
            reject(
              Object.assign(new Error("The operation was aborted"), {
                name: "AbortError",
              })
            )
          );
        })
    );

    const pending = invoke(handler, { body: validBody() });
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal error:",
      expect.objectContaining({ name: "AbortError" })
    );
  });

  it("clears the timer when the CRM answers in time", async () => {
    vi.useFakeTimers();
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    const { signal } = fetchMock.mock.calls[0][1];
    await vi.advanceTimersByTimeAsync(60_000);
    expect(signal.aborted).toBe(false);
  });
});

describe("api/waitlist — CRM failures never fail the request", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("still returns 200 when the CRM answers non-2xx", async () => {
    fetchMock.mockResolvedValue(crmFail(503, "maintenance"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      503,
      "maintenance"
    );
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("still returns 200 when the CRM error body cannot be read", async () => {
    fetchMock.mockResolvedValue(crmFailUnreadable(502));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      502,
      ""
    );
  });

  it("still returns 200 when the CRM fetch rejects (network error)", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal error:",
      expect.any(TypeError)
    );
  });

  it("still returns 200 when the CRM call times out (aborted)", async () => {
    const abort = Object.assign(new Error("The operation was aborted"), {
      name: "AbortError",
    });
    fetchMock.mockRejectedValue(abort);
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("api/waitlist — mail failures", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("returns 500 when the notification comes back with an error", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "domain not verified" },
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Signup failed" });
    // Confirmation is never attempted, but the CRM already has the signal.
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when the notification send rejects", async () => {
    sendMock.mockRejectedValueOnce(new Error("socket hang up"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Signup failed" });
  });

  it("still returns 200 when only the confirmation errors", async () => {
    sendMock
      .mockResolvedValueOnce({ data: { id: "msg_1" }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { name: "invalid_recipient", message: "mailbox unavailable" },
      });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "Resend confirmation error:",
      expect.objectContaining({ name: "invalid_recipient" })
    );
  });

  it("still returns 200 when the confirmation send rejects", async () => {
    sendMock
      .mockResolvedValueOnce({ data: { id: "msg_1" }, error: null })
      .mockRejectedValueOnce(new Error("timeout"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
