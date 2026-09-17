import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./event-registrations.js";
import {
  invoke,
  stubConsole,
  crmFail,
  crmFailUnreadable,
} from "./_test-helpers.js";

const PASSWORD = "correct horse battery staple";

const CRM_BODY = {
  ok: true,
  event: "amsterdam-2026",
  count: 2,
  registrations: [
    {
      occurred_at: "2026-09-01T09:15:00.000Z",
      email: "marco@acme-corp.com",
      full_name: "Marco de Vries",
      company: "Acme BV",
      role: "CFO",
      country: "Netherlands",
      phone: "+31 6 12345678",
      consent_workvivo: true,
    },
    {
      occurred_at: "2026-09-02T11:40:00.000Z",
      email: "lena@northwind.io",
      full_name: "Lena Kowalski",
      company: "Northwind",
      role: "CIO",
      country: "Poland",
      phone: null,
      consent_workvivo: true,
    },
  ],
};

/** An ok response whose JSON body is the CRM contract from the spec. */
const crmRegistrations = (body: unknown = CRM_BODY) => ({
  ok: true,
  status: 200,
  text: async () => JSON.stringify(body),
  json: async () => body,
});

/** An ok response that is not JSON at all (an HTML error page, say). */
const crmUnparseable = () => ({
  ok: true,
  status: 200,
  text: async () => "<html>gateway</html>",
  json: async () => {
    throw new SyntaxError("Unexpected token < in JSON at position 0");
  },
});

const validBody = (overrides: Record<string, unknown> = {}) => ({
  password: PASSWORD,
  event: "amsterdam-2026",
  ...overrides,
});

const setAdminEnv = () => vi.stubEnv("EVENT_ADMIN_PASSWORD", PASSWORD);

const setCrmEnv = () => {
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
};

let console_: ReturnType<typeof stubConsole>;
let logSpy: ReturnType<typeof vi.spyOn>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  fetchMock = vi.fn().mockResolvedValue(crmRegistrations());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  console_.restore();
  logSpy.mockRestore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

/** Everything the handler wrote anywhere, as one searchable string. */
function everythingWritten(body: unknown): string {
  const calls = [
    ...console_.errorSpy.mock.calls,
    ...console_.warnSpy.mock.calls,
    ...logSpy.mock.calls,
  ];
  return (
    calls.map(args => args.map(a => String(a)).join(" ")).join("\n") +
    "\n" +
    JSON.stringify(body)
  );
}

describe("api/event-registrations — method guard", () => {
  it.each(["GET", "PUT", "DELETE", "PATCH"])("%s returns 405", async method => {
    setAdminEnv();
    setCrmEnv();
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // The password belongs in a body, never in a url that ends up in history,
  // referrers and access logs.
  it("does not accept the password over GET even when it is correct", async () => {
    setAdminEnv();
    setCrmEnv();
    const res = await invoke(handler, { method: "GET", body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).not.toHaveProperty("registrations");
  });
});

describe("api/event-registrations — body validation", () => {
  beforeEach(() => {
    setAdminEnv();
    setCrmEnv();
  });

  const bad: [string, unknown][] = [
    ["missing password", validBody({ password: undefined })],
    ["empty password", validBody({ password: "" })],
    ["password as a number", validBody({ password: 1234 })],
    ["password as null", validBody({ password: null })],
    ["password over 200 chars", validBody({ password: "a".repeat(201) })],
    ["missing event", validBody({ event: undefined })],
    ["blank event", validBody({ event: "   " })],
    ["event as an array", validBody({ event: ["amsterdam-2026"] })],
    ["event over 100 chars", validBody({ event: "a".repeat(101) })],
    ["undefined body", undefined],
    ["array body", []],
    ["string body", "password=letmein"],
    ["empty object", {}],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not echo the submitted password in the 400 body", async () => {
    const res = await invoke(handler, {
      body: { password: PASSWORD, event: "" },
    });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD);
  });
});

describe("api/event-registrations — wrong password", () => {
  beforeEach(() => {
    setAdminEnv();
    setCrmEnv();
  });

  const wrong: [string, string][] = [
    ["a completely different password", "letmein"],
    ["the right password with one extra character", `${PASSWORD}x`],
    ["the right password one character short", PASSWORD.slice(0, -1)],
    ["the right password in a different case", PASSWORD.toUpperCase()],
    ["the right password with a trailing space", `${PASSWORD} `],
    ["a much longer string", "a".repeat(200)],
    ["a single character", "a"],
  ];

  // Differing lengths are the interesting case: timingSafeEqual throws on
  // buffers of unequal size, so a naive implementation would 500 here.
  it.each(wrong)("%s returns 401", async (_label, password) => {
    const res = await invoke(handler, { body: validBody({ password }) });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid password" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers every wrong password with the identical text", async () => {
    const bodies = [];
    for (const [, password] of wrong) {
      const res = await invoke(handler, { body: validBody({ password }) });
      bodies.push(JSON.stringify(res.body));
    }
    expect(new Set(bodies).size).toBe(1);
  });

  it("logs the rejection without the attempted password", async () => {
    await invoke(handler, { body: validBody({ password: "hunter2" }) });
    expect(console_.warnSpy).toHaveBeenCalledWith(
      "Rejected a registrations request: wrong password"
    );
    expect(everythingWritten(undefined)).not.toContain("hunter2");
  });
});

describe("api/event-registrations — missing EVENT_ADMIN_PASSWORD", () => {
  beforeEach(() => {
    setCrmEnv();
    vi.stubEnv("EVENT_ADMIN_PASSWORD", undefined);
  });

  it("returns 500 and never reaches the CRM", async () => {
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Server configuration error" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("logs loudly which variable is missing", async () => {
    await invoke(handler, { body: validBody() });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("EVENT_ADMIN_PASSWORD")
    );
  });

  it("keeps that detail out of the response", async () => {
    const res = await invoke(handler, { body: validBody() });
    expect(JSON.stringify(res.body)).not.toContain("EVENT_ADMIN_PASSWORD");
    expect(JSON.stringify(res.body)).not.toContain("PASSWORD");
  });

  it("does not let an empty EVENT_ADMIN_PASSWORD authenticate anyone", async () => {
    vi.stubEnv("EVENT_ADMIN_PASSWORD", "");
    const res = await invoke(handler, { body: validBody({ password: " " }) });
    expect(res.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/event-registrations — missing CRM env vars", () => {
  beforeEach(setAdminEnv);

  it.each([
    ["CRM_BASE_URL", "CRM_WEBHOOK_SECRET"],
    ["CRM_WEBHOOK_SECRET", "CRM_BASE_URL"],
  ])("without %s it returns 500 and skips the call", async (missing, keep) => {
    vi.stubEnv(keep, "set");
    vi.stubEnv(missing, undefined);

    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Server configuration error" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set — cannot read registrations"
    );
  });
});

describe("api/event-registrations — happy path", () => {
  beforeEach(() => {
    setAdminEnv();
    setCrmEnv();
  });

  it("passes the CRM answer straight through", async () => {
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(CRM_BODY);
  });

  it("calls the CRM read endpoint with the webhook secret", async () => {
    await invoke(handler, { body: validBody() });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://crm.example.com/api/event-registrations?event=amsterdam-2026"
    );
    expect(init.method).toBe("GET");
    expect(init.headers).toEqual({
      Accept: "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(init.body).toBeUndefined();
  });

  it("url-encodes the event slug", async () => {
    await invoke(handler, { body: validBody({ event: "a b&c=d" }) });
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://crm.example.com/api/event-registrations?event=a%20b%26c%3Dd"
    );
  });

  it("never puts the password in the outgoing CRM request", async () => {
    await invoke(handler, { body: validBody() });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain(PASSWORD);
    expect(JSON.stringify(init)).not.toContain(PASSWORD);
  });

  it("passes an abort signal and clears the timer when the CRM answers", async () => {
    vi.useFakeTimers();
    try {
      const res = await invoke(handler, { body: validBody() });
      expect(res.status).toBe(200);
      const { signal } = fetchMock.mock.calls[0][1];
      expect(signal).toBeInstanceOf(AbortSignal);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(signal.aborted).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("passes an empty list through unchanged", async () => {
    const empty = {
      ok: true,
      event: "amsterdam-2026",
      count: 0,
      registrations: [],
    };
    fetchMock.mockResolvedValue(crmRegistrations(empty));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(empty);
  });
});

describe("api/event-registrations — CRM failures", () => {
  beforeEach(() => {
    setAdminEnv();
    setCrmEnv();
  });

  it("returns 502 when the CRM answers non-2xx", async () => {
    fetchMock.mockResolvedValue(crmFail(503, "maintenance"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Could not load registrations" });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM event-registrations failed:",
      503,
      "maintenance"
    );
  });

  it("returns 502 when the CRM rejects the webhook secret", async () => {
    fetchMock.mockResolvedValue(crmFail(401, "unauthorized"));
    const res = await invoke(handler, { body: validBody() });
    // A CRM-side 401 must not read as "your password is wrong" to the visitor.
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Could not load registrations" });
  });

  it("returns 502 when the CRM error body cannot be read", async () => {
    fetchMock.mockResolvedValue(crmFailUnreadable(502));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(502);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM event-registrations failed:",
      502,
      ""
    );
  });

  it("returns 502 when the CRM answer is not JSON", async () => {
    fetchMock.mockResolvedValue(crmUnparseable());
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Could not load registrations" });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM event-registrations error:",
      expect.any(SyntaxError)
    );
  });

  it("returns 502 when the CRM fetch rejects (network error)", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: "Could not load registrations" });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM event-registrations error:",
      expect.any(TypeError)
    );
  });

  it("aborts a hanging CRM call instead of hanging with it", async () => {
    vi.useFakeTimers();
    try {
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
      expect(res.status).toBe(502);
      expect(res.body).toEqual({ error: "Could not load registrations" });
      expect(console_.errorSpy).toHaveBeenCalledWith(
        "CRM event-registrations error:",
        expect.objectContaining({ name: "AbortError" })
      );
    } finally {
      vi.useRealTimers();
    }
  });
});

// The list holds names, work addresses and employers of guests. The password
// that guards it must not turn up in a log line, an error message or a body.
describe("api/event-registrations — the password never leaks", () => {
  const paths: [string, () => void][] = [
    [
      "happy path",
      () => {
        setAdminEnv();
        setCrmEnv();
      },
    ],
    [
      "CRM failure",
      () => {
        setAdminEnv();
        setCrmEnv();
      },
    ],
    [
      "missing CRM env",
      () => {
        setAdminEnv();
      },
    ],
    [
      "missing admin password",
      () => {
        setCrmEnv();
      },
    ],
  ];

  it.each(paths)("%s writes the password nowhere", async (label, setup) => {
    setup();
    if (label === "CRM failure") {
      fetchMock.mockRejectedValue(new Error(`connect ECONNREFUSED`));
    }
    const res = await invoke(handler, { body: validBody() });
    expect(everythingWritten(res.body)).not.toContain(PASSWORD);
  });

  it("leaks nothing on a wrong password either, not even a prefix", async () => {
    setAdminEnv();
    setCrmEnv();
    const attempt = "correct horse battery stapler";
    const res = await invoke(handler, {
      body: validBody({ password: attempt }),
    });
    expect(res.status).toBe(401);
    const written = everythingWritten(res.body);
    expect(written).not.toContain(attempt);
    expect(written).not.toContain(PASSWORD);
    expect(written).not.toContain("correct horse");
  });

  it("leaks nothing when the body fails validation", async () => {
    setAdminEnv();
    setCrmEnv();
    const res = await invoke(handler, {
      body: { password: PASSWORD, event: 42 },
    });
    expect(res.status).toBe(400);
    expect(everythingWritten(res.body)).not.toContain(PASSWORD);
  });
});
