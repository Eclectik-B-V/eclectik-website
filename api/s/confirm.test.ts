import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./confirm.js";
import {
  invoke,
  stubConsole,
  crmOk,
  crmFail,
  crmFailUnreadable,
} from "../_test-helpers.js";

const TOKEN = "AbC123-_xyzAbC123-_xyz0";

const setCrmEnv = () => {
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
};

const confirm = (body: unknown = { token: TOKEN, answer: "yes" }) =>
  invoke(handler, { method: "POST", body });

const bodyOf = (call: any) => JSON.parse(call[1].body);

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi
    .fn()
    .mockResolvedValue(crmOk('{"ok":true,"firstName":"Marco"}'));
  vi.stubGlobal("fetch", fetchMock);
  setCrmEnv();
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/s/confirm: method guard", () => {
  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, {
      method,
      body: { token: TOKEN, answer: "yes" },
    });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/s/confirm: the real write", () => {
  it("posts action confirm with the token and the answer, and nothing else", async () => {
    const res = await confirm();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/session-invite");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      action: "confirm",
      token: TOKEN,
      answer: "yes",
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, firstName: "Marco" });
  });

  // The bot flag belongs to the click, which link scanners fetch. Whoever
  // reaches the confirm ran the page, so there is nothing left to suspect.
  it("sends no bot flag", async () => {
    await confirm();
    expect(bodyOf(fetchMock.mock.calls[0])).not.toHaveProperty("botSuspected");
  });

  it.each(["yes", "no"])("forwards the answer %s as sent", async answer => {
    await confirm({ token: TOKEN, answer });
    expect(bodyOf(fetchMock.mock.calls[0]).answer).toBe(answer);
  });

  it("trims a token that arrives with padding", async () => {
    await confirm({ token: `  ${TOKEN}  `, answer: "yes" });
    expect(bodyOf(fetchMock.mock.calls[0]).token).toBe(TOKEN);
  });
});

describe("api/s/confirm: the first name", () => {
  it.each([
    ["no firstName at all", '{"ok":true}'],
    ["firstName null", '{"ok":true,"firstName":null}'],
    ["an empty firstName", '{"ok":true,"firstName":""}'],
    ["a firstName that is not a string", '{"ok":true,"firstName":42}'],
  ])("answers firstName null for %s", async (_label, payload) => {
    fetchMock.mockResolvedValue(crmOk(payload));
    const res = await confirm();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, firstName: null });
  });

  it("passes a name through unchanged", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":true,"firstName":"Jean-Luc"}'));
    const res = await confirm();
    expect(res.body).toEqual({ ok: true, firstName: "Jean-Luc" });
  });

  it("answers with the name only, never the email or the company", async () => {
    fetchMock.mockResolvedValue(
      crmOk(
        '{"ok":true,"firstName":"Marco","email":"marco@acme.com","company":"Acme BV"}'
      )
    );
    const res = await confirm();
    expect(res.body).toEqual({ ok: true, firstName: "Marco" });
  });
});

// A token that is not shaped like one cannot exist in the table, so it is
// answered like a token nobody knows and the page moves to /s/invalid. That is
// the route someone takes who types a token into the address bar.
describe("api/s/confirm: a token that cannot exist", () => {
  const unusable: [string, unknown][] = [
    ["no body", undefined],
    ["an array body", []],
    ["a string body", "token=abc"],
    ["no token", { answer: "yes" }],
    ["an empty token", { token: "", answer: "yes" }],
    ["a token of 21 characters", { token: "a".repeat(21), answer: "yes" }],
    ["a token with a slash", { token: `${TOKEN}/x`, answer: "yes" }],
    [
      "a token that is a number",
      { token: 12345678901234567890, answer: "yes" },
    ],
  ];

  // Straight through invoke, not the confirm helper: its default argument
  // would fill in a valid body for the "no body" case.
  it.each(unusable)(
    "%s answers unknown_token without a call",
    async (_label, body) => {
      const res = await invoke(handler, { method: "POST", body });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: false, reason: "unknown_token" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("answers a made up token exactly like a real one the BD app rejects", async () => {
    const madeUp = await confirm({ token: "aaa", answer: "yes" });
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const rejected = await confirm();

    expect(madeUp.status).toBe(rejected.status);
    expect(madeUp.body).toEqual(rejected.body);
  });
});

describe("api/s/confirm: a request that does not parse", () => {
  const bad: [string, unknown][] = [
    ["no answer", { token: TOKEN }],
    ["answer maybe", { token: TOKEN, answer: "maybe" }],
    ["answer in capitals", { token: TOKEN, answer: "YES" }],
    ["answer true", { token: TOKEN, answer: true }],
    ["answer null", { token: TOKEN, answer: null }],
  ];

  it.each(bad)("%s returns 400 without a call", async (_label, body) => {
    const res = await invoke(handler, { method: "POST", body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, reason: "invalid_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("names no field and quotes no value in the answer", async () => {
    const res = await confirm({ token: TOKEN, answer: "maybe" });
    const answered = JSON.stringify(res.body);
    expect(answered).not.toContain("token");
    expect(answered).not.toContain("maybe");
  });
});

describe("api/s/confirm: an unknown token and a closed invitation", () => {
  it("passes unknown_token through with a 200", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const res = await confirm();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false, reason: "unknown_token" });
  });

  it("passes closed through with a 200", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const res = await confirm();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false, reason: "closed" });
  });

  // The reason exists so the page can pick between /s/invalid and /s/closed.
  // Everything else about the two answers has to be identical.
  it("differs in the reason and in nothing else", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const invalid = await confirm();
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const closed = await confirm();

    expect(invalid.status).toBe(closed.status);
    expect(Object.keys(invalid.body)).toEqual(Object.keys(closed.body));
    expect(invalid.body.ok).toBe(closed.body.ok);
  });

  it("honours a reason that comes with a non-2xx status", async () => {
    fetchMock.mockResolvedValue(crmFail(410, '{"ok":false,"reason":"closed"}'));
    const res = await confirm();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false, reason: "closed" });
  });
});

describe("api/s/confirm: the BD application not answering", () => {
  it.each([
    ["a 500", () => fetchMock.mockResolvedValue(crmFail(500, "boom"))],
    [
      "a body that will not read",
      () => fetchMock.mockResolvedValue(crmFailUnreadable(502)),
    ],
    [
      "a body that is not JSON",
      () => fetchMock.mockResolvedValue(crmOk("<html>502</html>")),
    ],
    [
      "a reason nobody knows",
      () =>
        fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"teapot"}')),
    ],
    [
      "a network error",
      () => fetchMock.mockRejectedValue(new TypeError("fetch failed")),
    ],
  ])("answers 502 unavailable on %s", async (_label, arrange) => {
    arrange();
    const res = await confirm();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(console_.errorSpy).toHaveBeenCalled();
  });

  it("answers 502 without the CRM env vars, and calls nothing", async () => {
    vi.stubEnv("CRM_WEBHOOK_SECRET", undefined);
    const res = await confirm();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set: session invite confirm NOT stored"
    );
  });

  it("never logs the token", async () => {
    fetchMock.mockResolvedValue(crmFail(500, "boom"));
    await confirm();
    expect(JSON.stringify(console_.errorSpy.mock.calls)).not.toContain(TOKEN);
  });
});

describe("api/s/confirm: timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an abort signal", async () => {
    await confirm();
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("aborts a hanging call and answers 502", async () => {
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

    const pending = confirm();
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM session-invite confirm error:",
      expect.objectContaining({ name: "AbortError" })
    );
  });

  it("clears the timer when the answer is in time", async () => {
    vi.useFakeTimers();
    const res = await confirm();
    expect(res.status).toBe(200);
    const { signal } = fetchMock.mock.calls[0][1];
    await vi.advanceTimersByTimeAsync(60_000);
    expect(signal.aborted).toBe(false);
  });
});

// Clicking no first and yes afterwards has to end on yes. Nothing in this
// handler blocks a second confirm, and the answer it sends is the one the page
// was opened with, so the last confirm wins.
describe("api/s/confirm: changing your mind", () => {
  it("sends a second confirm with the new answer", async () => {
    await confirm({ token: TOKEN, answer: "no" });
    await confirm({ token: TOKEN, answer: "yes" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(bodyOf(fetchMock.mock.calls[0]).answer).toBe("no");
    expect(bodyOf(fetchMock.mock.calls[1]).answer).toBe("yes");
  });
});
