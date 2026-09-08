import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./event-registration.js";
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
  firstName: "Marco",
  lastName: "de Vries",
  email: "marco@acme-corp.com",
  company: "Acme BV",
  jobTitle: "CFO",
  country: "Netherlands",
  phone: "+31 6 12345678",
  consent: true,
  src: "event-hero",
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

describe("api/event-registration — method guard", () => {
  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s returns 405", async method => {
    setMailEnv();
    setCrmEnv();
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/event-registration — body validation", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  const bad: [string, unknown][] = [
    ["missing firstName", validBody({ firstName: undefined })],
    ["blank firstName", validBody({ firstName: "   " })],
    ["firstName over 100 chars", validBody({ firstName: "a".repeat(101) })],
    ["missing lastName", validBody({ lastName: undefined })],
    ["blank lastName", validBody({ lastName: "" })],
    ["lastName over 100 chars", validBody({ lastName: "a".repeat(101) })],
    ["missing email", validBody({ email: undefined })],
    ["invalid email", validBody({ email: "marco@@acme-corp" })],
    ["email over 200 chars", validBody({ email: `${"a".repeat(200)}@x.com` })],
    ["missing company", validBody({ company: undefined })],
    ["blank company", validBody({ company: " " })],
    ["company over 200 chars", validBody({ company: "a".repeat(201) })],
    ["missing jobTitle", validBody({ jobTitle: undefined })],
    ["blank jobTitle", validBody({ jobTitle: "" })],
    ["jobTitle over 100 chars", validBody({ jobTitle: "a".repeat(101) })],
    ["missing country", validBody({ country: undefined })],
    ["blank country", validBody({ country: "  " })],
    ["country over 100 chars", validBody({ country: "a".repeat(101) })],
    ["phone over 50 chars", validBody({ phone: "1".repeat(51) })],
    ["phone as a number", validBody({ phone: 31612345678 })],
    ["src over 100 chars", validBody({ src: "a".repeat(101) })],
    ["undefined body", undefined],
    ["array body", []],
    ["string body", "firstName=Marco"],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a body without the optional phone and src", async () => {
    const res = await invoke(handler, {
      body: validBody({ phone: undefined, src: undefined }),
    });
    expect(res.status).toBe(200);
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.phone).toBeUndefined();
    expect(payload.src).toBeUndefined();
    expect(sendMock.mock.calls[0][0].html).not.toContain("Phone:");
    expect(sendMock.mock.calls[0][0].html).not.toContain("Source:");
  });

  it("trims the values it forwards", async () => {
    await invoke(handler, {
      body: validBody({
        firstName: "  Marco  ",
        lastName: " de Vries ",
        email: "  marco@acme-corp.com ",
        company: " Acme BV ",
        jobTitle: " CFO ",
        country: " Netherlands ",
      }),
    });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.name).toBe("Marco de Vries");
    expect(payload.email).toBe("marco@acme-corp.com");
    expect(payload.company).toBe("Acme BV");
    expect(payload.role).toBe("CFO");
    expect(payload.country).toBe("Netherlands");
  });
});

describe("api/event-registration — work email gate", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it.each([
    "someone@gmail.com",
    "someone@hotmail.com",
    "someone@outlook.com",
    "someone@ziggo.nl",
  ])("rejects the free-provider address %s with a 400", async email => {
    const res = await invoke(handler, { body: validBody({ email }) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects a free-provider address whatever its casing", async () => {
    const res = await invoke(handler, {
      body: validBody({ email: "Someone@GMAIL.com" }),
    });
    expect(res.status).toBe(400);
  });

  it("accepts a work address", async () => {
    const res = await invoke(handler, {
      body: validBody({ email: "marco@zoom.us" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("api/event-registration — consent is a condition for submitting", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it.each([
    ["missing consent", undefined],
    ["consent false", false],
    ["consent as the string 'true'", "true"],
    ["consent as 1", 1],
    ["consent as null", null],
  ])("%s returns 400", async (_label, consent) => {
    const res = await invoke(handler, { body: validBody({ consent }) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("api/event-registration — CRM signal", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("posts the website-signal with exactly the payload from the design", async () => {
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
      event: "event_registered",
      email: "marco@acme-corp.com",
      name: "Marco de Vries",
      company: "Acme BV",
      role: "CFO",
      eventSlug: "amsterdam-2026",
      eventName: "AI Transformation: Measure It. Steer It. Prove It.",
      eventDate: "2026-10-06",
      country: "Netherlands",
      phone: "+31 6 12345678",
      consentWorkvivo: true,
      src: "event-hero",
    });
  });

  it("does not send sector, which this form never asks for", async () => {
    await invoke(handler, { body: validBody() });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty(
      "sector"
    );
  });

  it("stores the registration before it sends any mail", async () => {
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

  it("sends the raw (unescaped) values to the CRM, as JSON", async () => {
    await invoke(handler, { body: validBody({ firstName: XSS }) });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).name).toBe(
      `${XSS} de Vries`
    );
  });
});

describe("api/event-registration — CRM failure means no registration", () => {
  beforeEach(() => {
    setMailEnv();
  });

  it.each([
    ["CRM_BASE_URL", "CRM_WEBHOOK_SECRET"],
    ["CRM_WEBHOOK_SECRET", "CRM_BASE_URL"],
  ])("returns 500 without %s, and sends no mail", async (missing, keep) => {
    vi.stubEnv(keep, "set");
    vi.stubEnv(missing, undefined);

    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Registration failed" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set — event registration NOT stored"
    );
  });

  it("returns 500 when the CRM answers non-2xx", async () => {
    setCrmEnv();
    fetchMock.mockResolvedValue(crmFail(503, "maintenance"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Registration failed" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      503,
      "maintenance"
    );
  });

  it("returns 500 when the CRM error body cannot be read", async () => {
    setCrmEnv();
    fetchMock.mockResolvedValue(crmFailUnreadable(502));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      502,
      ""
    );
  });

  it("returns 500 when the CRM fetch rejects (network error)", async () => {
    setCrmEnv();
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Registration failed" });
    expect(sendMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal error:",
      expect.any(TypeError)
    );
  });
});

describe("api/event-registration — CRM timeout", () => {
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

  it("aborts a hanging CRM call and answers 500", async () => {
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
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Registration failed" });
    expect(sendMock).not.toHaveBeenCalled();
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

describe("api/event-registration — the two mails", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("notifies the organiser and links to the registrations overview", async () => {
    await invoke(handler, { body: validBody() });

    expect(ctorMock).toHaveBeenCalledWith("re_test_key");
    expect(sendMock).toHaveBeenCalledTimes(2);

    const notification = sendMock.mock.calls[0][0];
    expect(notification.from).toBe("site@eclectik.co");
    expect(notification.to).toBe("hello@eclectik.co");
    expect(notification.replyTo).toBe("marco@acme-corp.com");
    expect(notification.subject).toBe(
      "Event registration: Marco de Vries (Acme BV)"
    );
    expect(notification.html).toContain(
      "<strong>Name:</strong> Marco de Vries"
    );
    expect(notification.html).toContain(
      "<strong>Email:</strong> marco@acme-corp.com"
    );
    expect(notification.html).toContain("<strong>Company:</strong> Acme BV");
    expect(notification.html).toContain("<strong>Job title:</strong> CFO");
    expect(notification.html).toContain(
      "<strong>Country:</strong> Netherlands"
    );
    expect(notification.html).toContain(
      "<strong>Phone:</strong> +31 6 12345678"
    );
    expect(notification.html).toContain("Workvivo by Zoom");
    expect(notification.html).toContain("<strong>Source:</strong> event-hero");
    expect(notification.html).toContain(
      'href="https://www.eclectik.co/events/amsterdam-2026/registrations"'
    );
  });

  it("acknowledges to the registrant that the seat still needs confirming", async () => {
    await invoke(handler, { body: validBody() });

    const confirmation = sendMock.mock.calls[1][0];
    expect(confirmation.from).toBe("site@eclectik.co");
    expect(confirmation.to).toBe("marco@acme-corp.com");
    expect(confirmation.subject).toBe(
      "We received your registration for 6 October in Amsterdam"
    );
    expect(confirmation.replyTo).toBeUndefined();
    expect(confirmation.html).toContain("Hi Marco,");
    expect(confirmation.html).toContain(
      "AI Transformation: Measure It. Steer It. Prove It."
    );
    expect(confirmation.html).toContain("6 October 2026");
    expect(confirmation.html).toContain("a short check on role");
    expect(confirmation.html).toContain("once your seat is confirmed");
  });

  it("uses no em dash or en dash anywhere in either mail", async () => {
    await invoke(handler, { body: validBody() });
    for (const call of sendMock.mock.calls) {
      expect(call[0].subject).not.toMatch(/[—–]/);
      expect(call[0].html).not.toMatch(/[—–]/);
    }
  });
});

describe("api/event-registration — HTML escaping", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("escapes a script tag in the first name, in both mails", async () => {
    await invoke(handler, { body: validBody({ firstName: XSS }) });

    const notification = sendMock.mock.calls[0][0].html as string;
    const confirmation = sendMock.mock.calls[1][0].html as string;
    expect(notification).toContain(XSS_ESCAPED);
    expect(notification).not.toContain("<script>");
    expect(confirmation).toContain(XSS_ESCAPED);
    expect(confirmation).not.toContain("<script>");
  });

  it("escapes company, job title, country, phone and src", async () => {
    await invoke(handler, {
      body: validBody({
        company: "Acme & <b>Co</b>",
        jobTitle: 'CFO "interim"',
        country: "Curacao > NL",
        phone: "<img src=x onerror=alert(1)>",
        src: "'quoted'",
      }),
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain("Acme &amp; &lt;b&gt;Co&lt;/b&gt;");
    expect(html).toContain("CFO &quot;interim&quot;");
    expect(html).toContain("Curacao &gt; NL");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img");
    expect(html).toContain("&#039;quoted&#039;");
  });

  it("cannot break out of the registrations link through the last name", async () => {
    await invoke(handler, {
      body: validBody({ lastName: '"><a href="https://evil.example">' }),
    });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).not.toContain('href="https://evil.example"');
    expect(html).toContain("&quot;&gt;&lt;a href=&quot;https://evil.example");
  });
});

// The subject is a header field, so it gets the header encoding (strip line
// breaks and control chars), not the HTML encoding used for the body.
describe("api/event-registration — subject hygiene", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("strips a newline in the name so no second header can be injected", async () => {
    await invoke(handler, {
      body: validBody({ lastName: "de Vries\nBcc: evil@example.com" }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe(
      "Event registration: Marco de Vries Bcc: evil@example.com (Acme BV)"
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
    expect(subject).toBe("Event registration: Marco de Vries (Acme BV)");
    expect(/\p{Cc}/u.test(subject)).toBe(false);
  });

  it("does not HTML-escape the subject (wrong encoding for a header)", async () => {
    await invoke(handler, {
      body: validBody({ firstName: XSS, company: "Acme & Co" }),
    });
    const subject = sendMock.mock.calls[0][0].subject as string;
    expect(subject).toBe(`Event registration: ${XSS} de Vries (Acme & Co)`);
    expect(subject).not.toContain("&amp;");
    expect(subject).not.toContain("&lt;");
  });

  it("keeps the raw newline in the CRM payload and in the escaped HTML body", async () => {
    await invoke(handler, {
      body: validBody({ lastName: "de Vries\nBcc: evil@example.com" }),
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).name).toBe(
      "Marco de Vries\nBcc: evil@example.com"
    );
    expect(sendMock.mock.calls[0][0].html).toContain(
      "Marco de Vries\nBcc: evil@example.com"
    );
  });
});

describe("api/event-registration — mail failures never undo the registration", () => {
  beforeEach(() => {
    setCrmEnv();
  });

  it.each([
    ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"],
    ["CONTACT_FROM_EMAIL", "RESEND_API_KEY", "CONTACT_TO_EMAIL"],
    ["CONTACT_TO_EMAIL", "RESEND_API_KEY", "CONTACT_FROM_EMAIL"],
  ])(
    "without %s it still returns 200 and the CRM still has the record",
    async (missing, keepA, keepB) => {
      vi.stubEnv(keepA, "set");
      vi.stubEnv(keepB, "set");
      vi.stubEnv(missing, undefined);

      const res = await invoke(handler, { body: validBody() });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(sendMock).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(JSON.parse(fetchMock.mock.calls[0][1].body).event).toBe(
        "event_registered"
      );
      expect(console_.errorSpy).toHaveBeenCalledWith(
        "Missing Resend env vars — skipping event registration notification"
      );
    }
  );

  it("returns 200 when the organiser notification comes back with an error", async () => {
    setMailEnv();
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { name: "validation_error", message: "domain not verified" },
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    // The acknowledgement is still attempted: the two mails are independent.
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "Resend registration notification error:",
      expect.objectContaining({ name: "validation_error" })
    );
  });

  it("returns 200 when the organiser notification rejects", async () => {
    setMailEnv();
    sendMock.mockRejectedValueOnce(new Error("socket hang up"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "Resend registration notification error:",
      expect.any(Error)
    );
  });

  it("returns 200 when only the acknowledgement errors", async () => {
    setMailEnv();
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
      "Resend registration confirmation error:",
      expect.objectContaining({ name: "invalid_recipient" })
    );
  });

  it("returns 200 when the acknowledgement send rejects", async () => {
    setMailEnv();
    sendMock
      .mockResolvedValueOnce({ data: { id: "msg_1" }, error: null })
      .mockRejectedValueOnce(new Error("timeout"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 200 when both mails reject", async () => {
    setMailEnv();
    sendMock.mockRejectedValue(new Error("resend is down"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledTimes(2);
  });
});

// No 409 for a repeat registration, on purpose. The CRM write endpoint does
// find-or-create on the email address and answers `{ ok: true }` with 200
// either way, so this handler cannot tell a second registration from a first.
// See the comment in api/event-registration.ts.
describe("api/event-registration — a repeat registration", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("is accepted with a 200, exactly like the first one", async () => {
    const first = await invoke(handler, { body: validBody() });
    const second = await invoke(handler, { body: validBody() });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(
      JSON.parse(fetchMock.mock.calls[1][1].body)
    );
  });
});
