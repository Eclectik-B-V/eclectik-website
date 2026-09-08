import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./contact.js";
import { invoke, stubConsole, XSS, XSS_ESCAPED } from "./_test-helpers.js";

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
  firstName: "Marco",
  lastName: "de Vries",
  company: "Acme BV",
  email: "marco@acme-corp.com",
  phone: "+31 6 12345678",
  message: "Graag contact over de benchmark.",
  ...overrides,
});

const setEnv = () => {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("CONTACT_FROM_EMAIL", "site@eclectik.co");
  vi.stubEnv("CONTACT_TO_EMAIL", "hello@eclectik.co");
};

let console_: ReturnType<typeof stubConsole>;

beforeEach(() => {
  console_ = stubConsole();
  sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null });
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("api/contact — method guard", () => {
  it.each(["GET", "PUT", "DELETE", "PATCH", "OPTIONS"])(
    "%s returns 405 without touching Resend",
    async method => {
      setEnv();
      const res = await invoke(handler, { method, body: validBody() });
      expect(res.status).toBe(405);
      expect(res.body).toEqual({ error: "Method not allowed" });
      expect(sendMock).not.toHaveBeenCalled();
    }
  );
});

describe("api/contact — body validation", () => {
  beforeEach(setEnv);

  const bad: [string, unknown][] = [
    ["missing firstName", validBody({ firstName: undefined })],
    ["blank lastName (trims to empty)", validBody({ lastName: "   " })],
    ["invalid email", validBody({ email: "marco(at)acme.com" })],
    ["missing email", validBody({ email: undefined })],
    ["firstName over 100 chars", validBody({ firstName: "a".repeat(101) })],
    ["company over 200 chars", validBody({ company: "a".repeat(201) })],
    ["email over 200 chars", validBody({ email: `${"a".repeat(200)}@x.com` })],
    ["phone over 50 chars", validBody({ phone: "0".repeat(51) })],
    ["message over 5000 chars", validBody({ message: "a".repeat(5001) })],
    ["non-string firstName", validBody({ firstName: 42 })],
    ["undefined body", undefined],
    ["null body", null],
    ["array body", []],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("accepts a body with only the required fields", async () => {
    const res = await invoke(handler, {
      body: {
        firstName: "Marco",
        lastName: "de Vries",
        email: "marco@acme-corp.com",
      },
    });
    expect(res.status).toBe(200);
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain("Bedrijf");
    expect(html).not.toContain("Telefoon");
    expect(html).toContain("(geen bericht)");
  });

  it("accepts boundary lengths (100/200/50/5000)", async () => {
    const res = await invoke(handler, {
      body: validBody({
        firstName: "a".repeat(100),
        company: "b".repeat(200),
        phone: "0".repeat(50),
        message: "c".repeat(5000),
      }),
    });
    expect(res.status).toBe(200);
  });
});

describe("api/contact — missing env vars", () => {
  it.each([
    ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"],
    ["CONTACT_FROM_EMAIL", "RESEND_API_KEY", "CONTACT_TO_EMAIL"],
    ["CONTACT_TO_EMAIL", "RESEND_API_KEY", "CONTACT_FROM_EMAIL"],
  ])("without %s the handler returns 500", async (missing, keepA, keepB) => {
    vi.stubEnv(keepA, "set");
    vi.stubEnv(keepB, "set");
    vi.stubEnv(missing, undefined);

    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Email service not configured" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith("Missing Resend env vars");
  });

  it("validates the body before it looks at the env", async () => {
    vi.stubEnv("RESEND_API_KEY", undefined);
    const res = await invoke(handler, { body: { firstName: "Marco" } });
    expect(res.status).toBe(400);
  });
});

describe("api/contact — happy path", () => {
  beforeEach(setEnv);

  it("returns 200 and passes the expected payload to Resend", async () => {
    const res = await invoke(handler, { body: validBody() });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(ctorMock).toHaveBeenCalledWith("re_test_key");
    expect(sendMock).toHaveBeenCalledTimes(1);

    const payload = sendMock.mock.calls[0][0];
    expect(payload.from).toBe("site@eclectik.co");
    expect(payload.to).toBe("hello@eclectik.co");
    expect(payload.replyTo).toBe("marco@acme-corp.com");
    expect(payload.subject).toBe(
      "Nieuw contactformulier: Marco de Vries (Acme BV)"
    );
    expect(payload.html).toContain("<strong>Naam:</strong> Marco de Vries");
    expect(payload.html).toContain("marco@acme-corp.com");
    expect(payload.html).toContain("<strong>Bedrijf:</strong> Acme BV");
    expect(payload.html).toContain("<strong>Telefoon:</strong> +31 6 12345678");
    expect(payload.html).toContain("Graag contact over de benchmark.");
  });

  it("omits the company suffix from the subject when there is no company", async () => {
    await invoke(handler, { body: validBody({ company: "" }) });
    expect(sendMock.mock.calls[0][0].subject).toBe(
      "Nieuw contactformulier: Marco de Vries"
    );
  });

  it("trims surrounding whitespace before sending", async () => {
    await invoke(handler, {
      body: validBody({
        firstName: "  Marco  ",
        email: "  marco@acme-corp.com  ",
      }),
    });
    const payload = sendMock.mock.calls[0][0];
    expect(payload.replyTo).toBe("marco@acme-corp.com");
    expect(payload.html).toContain("<strong>Naam:</strong> Marco de Vries");
  });
});

describe("api/contact — HTML escaping", () => {
  beforeEach(setEnv);

  it("escapes a script tag in the message body", async () => {
    await invoke(handler, { body: validBody({ message: XSS }) });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain(XSS_ESCAPED);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("</script>");
  });

  it("escapes every free-text field that reaches the HTML", async () => {
    await invoke(handler, {
      body: validBody({
        firstName: `Ma<b>rco`,
        lastName: `de "Vries"`,
        company: "Acme & Co",
        phone: "<img src=x onerror=alert(1)>",
        message: "5 > 3 && 2 < 4",
      }),
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Ma&lt;b&gt;rco");
    expect(html).toContain("de &quot;Vries&quot;");
    expect(html).toContain("Acme &amp; Co");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("5 &gt; 3 &amp;&amp; 2 &lt; 4");
    expect(html).not.toContain("<img");
  });

  it("escapes an apostrophe as a numeric entity", async () => {
    await invoke(handler, { body: validBody({ message: "it's here" }) });
    expect(sendMock.mock.calls[0][0].html).toContain("it&#039;s here");
  });

  // The subject is a header field, so it gets the header encoding (strip line
  // breaks and control chars), not the HTML encoding used for the body.
  it("strips a newline in the name so no second header can be injected", async () => {
    await invoke(handler, {
      body: validBody({ firstName: "Marco\nBcc: evil@example.com" }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe(
      "Nieuw contactformulier: Marco Bcc: evil@example.com de Vries (Acme BV)"
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
    await invoke(handler, {
      body: validBody({ company: `Acme${ch}${ch}BV` }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe("Nieuw contactformulier: Marco de Vries (Acme BV)");
    expect(/\p{Cc}/u.test(subject)).toBe(false);
  });

  it("leaves the HTML body escaped while the subject stays unescaped", async () => {
    await invoke(handler, {
      body: validBody({
        firstName: "Marco\r\nBcc: evil@example.com",
        company: XSS,
      }),
    });
    const { subject, html } = sendMock.mock.calls[0][0];
    // No HTML escaping in a header field: & and < stay themselves.
    expect(subject).toContain(XSS);
    expect(subject).not.toContain("&lt;");
    expect(subject).not.toContain("&amp;");
    expect(/\p{Cc}/u.test(subject as string)).toBe(false);
    // ...and the body keeps its own, correct encoding.
    expect(html).toContain(XSS_ESCAPED);
  });

  it("keeps an ordinary subject byte-for-byte", async () => {
    await invoke(handler, { body: validBody() });
    expect(sendMock.mock.calls[0][0].subject).toBe(
      "Nieuw contactformulier: Marco de Vries (Acme BV)"
    );
  });
});

describe("api/contact — failure handling", () => {
  beforeEach(setEnv);

  it("returns 500 when Resend answers with an error object", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "domain not verified" },
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to send message" });
    expect(console_.errorSpy).toHaveBeenCalled();
  });

  it("returns 500 when the Resend call rejects", async () => {
    sendMock.mockRejectedValue(new Error("socket hang up"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to send message" });
  });

  it("returns 500 when the Resend call throws synchronously", async () => {
    sendMock.mockImplementation(() => {
      throw new TypeError("boom");
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to send message" });
  });
});
