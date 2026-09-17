import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./waitlist-qualification.js";
import {
  BANK_VERSION,
  WAITLIST_QUESTIONS,
} from "../shared/waitlist-qualification.js";
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

const validAnswers = (overrides: Record<string, string> = {}) => ({
  ...Object.fromEntries(WAITLIST_QUESTIONS.map(q => [q.id, q.options[0]])),
  ...overrides,
});

const validBody = (overrides: Record<string, unknown> = {}) => ({
  email: "marco@acme-corp.com",
  answers: validAnswers(),
  src: "waitlist-card",
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

describe("api/waitlist-qualification — method guard", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    setMailEnv();
    setCrmEnv();
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("api/waitlist-qualification — body validation", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  const bad: [string, unknown][] = [
    ["missing email", validBody({ email: undefined })],
    ["malformed email", validBody({ email: "marco@acme" })],
    [
      "email over 200 chars",
      validBody({ email: `${"a".repeat(200)}@acme.com` }),
    ],
    ["missing answers", validBody({ answers: undefined })],
    ["answers as an array", validBody({ answers: [] })],
    ["answers as a string", validBody({ answers: "W1" })],
    ["only four answers", validBody({ answers: omit(validAnswers(), "W5") })],
    [
      "a sixth answer",
      validBody({ answers: { ...validAnswers(), W6: "extra" } }),
    ],
    ["free-text answer", validBody({ answers: validAnswers({ W1: "iets" }) })],
    [
      "an option borrowed from another question",
      validBody({
        answers: validAnswers({ W1: WAITLIST_QUESTIONS[4].options[0] }),
      }),
    ],
    [
      "a case variation of a valid option",
      validBody({
        answers: validAnswers({
          W2: WAITLIST_QUESTIONS[1].options[0].toUpperCase(),
        }),
      }),
    ],
    [
      "an answer over 200 chars",
      validBody({ answers: validAnswers({ W3: "a".repeat(201) }) }),
    ],
    [
      "numeric answer value",
      validBody({ answers: { ...validAnswers(), W1: 0 } }),
    ],
    ["src over 100 chars", validBody({ src: "a".repeat(101) })],
    ["undefined body", undefined],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("accepts the last option of every question and no src", async () => {
    const answers = Object.fromEntries(
      WAITLIST_QUESTIONS.map(q => [q.id, q.options[q.options.length - 1]])
    );
    const res = await invoke(handler, {
      body: { email: "marco@acme-corp.com", answers },
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).src).toBeUndefined();
    expect(sendMock.mock.calls[0][0].html).not.toContain("Source:");
  });
});

describe("api/waitlist-qualification — work-email gate", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it.each([
    "someone@gmail.com",
    "someone@GMAIL.COM",
    "someone@hotmail.nl",
    "someone@outlook.com",
    "someone@icloud.com",
    "someone@proton.me",
    "someone@ziggo.nl",
    "someone@kpnmail.nl",
  ])("rejects the free provider %s with 400", async email => {
    const res = await invoke(handler, { body: validBody({ email }) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid form data" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "marco@acme-corp.com",
    "m.de.vries@klant.nl",
    "cfo@eclectik.co",
    "user@gmail.company.com",
  ])("accepts the work address %s", async email => {
    const res = await invoke(handler, { body: validBody({ email }) });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("api/waitlist-qualification — env vars", () => {
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
      // sendCrmSignal() runs before the mail guard here, unlike api/waitlist.ts.
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(console_.errorSpy).toHaveBeenCalledWith(
        "Missing Resend env vars — skipping qualification notification"
      );
    }
  );

  it.each([
    ["CRM_BASE_URL", "CRM_WEBHOOK_SECRET"],
    ["CRM_WEBHOOK_SECRET", "CRM_BASE_URL"],
  ])(
    "without %s it warns, skips the signal and still mails",
    async (missing, keep) => {
      setMailEnv();
      vi.stubEnv(keep, "set");
      vi.stubEnv(missing, undefined);

      const res = await invoke(handler, { body: validBody() });
      expect(res.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(console_.warnSpy).toHaveBeenCalledWith(
        "CRM env vars not set — skipping website-signal"
      );
      expect(sendMock).toHaveBeenCalledTimes(1);
    }
  );

  it("returns 200 with neither service configured", async () => {
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("api/waitlist-qualification — happy path", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("posts the qualification signal with the bank version and answers", async () => {
    const res = await invoke(handler, { body: validBody() });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/website-signal");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      source: "website",
      event: "waitlist_qualification",
      email: "marco@acme-corp.com",
      bank_version: BANK_VERSION,
      answers: validAnswers(),
      src: "waitlist-card",
    });
  });

  it("mails one row per question, in bank order", async () => {
    await invoke(handler, { body: validBody() });

    expect(ctorMock).toHaveBeenCalledWith("re_test_key");
    expect(sendMock).toHaveBeenCalledTimes(1);

    const payload = sendMock.mock.calls[0][0];
    expect(payload.from).toBe("site@eclectik.co");
    expect(payload.to).toBe("hello@eclectik.co");
    expect(payload.replyTo).toBe("marco@acme-corp.com");
    expect(payload.subject).toBe("Waitlist qualification: marco@acme-corp.com");

    const html = payload.html as string;
    expect(html).toContain(
      `Waitlist qualification answers (bank v${BANK_VERSION})`
    );
    expect(html).toContain("<strong>Source:</strong> waitlist-card");

    const positions = WAITLIST_QUESTIONS.map(q =>
      html.indexOf(escapeForAssert(q.text))
    );
    expect(positions.every(p => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    for (const q of WAITLIST_QUESTIONS) {
      expect(html).toContain(escapeForAssert(q.options[0]));
    }
  });

  it("escapes the apostrophes in the question copy", async () => {
    await invoke(handler, { body: validBody() });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain(
      "What&#039;s prompting you to look at benchmarking now?"
    );
    expect(html).not.toContain("What's prompting");
  });
});

describe("api/waitlist-qualification — HTML escaping", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("escapes a script tag in src (the only free-text field that reaches HTML)", async () => {
    await invoke(handler, { body: validBody({ src: XSS }) });
    const html = sendMock.mock.calls[0][0].html as string;
    expect(html).toContain(XSS_ESCAPED);
    expect(html).not.toContain("<script>");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).src).toBe(XSS);
  });

  it("cannot be fed a script tag through the answers (bank options only)", async () => {
    const res = await invoke(handler, {
      body: validBody({ answers: validAnswers({ W1: XSS }) }),
    });
    expect(res.status).toBe(400);
  });
});

describe("api/waitlist-qualification — downstream failures never fail the request", () => {
  beforeEach(() => {
    setMailEnv();
    setCrmEnv();
  });

  it("returns 200 when the CRM answers non-2xx", async () => {
    fetchMock.mockResolvedValue(crmFail(500, "intake down"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      500,
      "intake down"
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("returns 200 when the CRM error body cannot be read", async () => {
    fetchMock.mockResolvedValue(crmFailUnreadable(504));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM website-signal failed:",
      504,
      ""
    );
  });

  it("returns 200 when the CRM fetch rejects", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("returns 200 when the CRM call times out (aborted)", async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error("The operation was aborted"), {
        name: "AbortError",
      })
    );
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 200 when Resend answers with an error object", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "domain not verified" },
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "Resend qualification notification error:",
      expect.objectContaining({ name: "validation_error" })
    );
  });

  it("returns 200 when the Resend call rejects", async () => {
    sendMock.mockRejectedValue(new Error("socket hang up"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 200 when both the CRM and Resend fail", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    sendMock.mockRejectedValue(new Error("mail"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("api/waitlist-qualification — CRM timeout", () => {
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

  it("aborts a hanging CRM call and still mails and returns 200", async () => {
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
    expect(sendMock).toHaveBeenCalledTimes(1);
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

function omit(obj: Record<string, string>, key: string) {
  const copy = { ...obj };
  delete copy[key];
  return copy;
}

/** Mirrors the handler's escapeHtml so assertions compare like with like. */
function escapeForAssert(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
