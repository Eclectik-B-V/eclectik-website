import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./submit.js";
import {
  invoke,
  stubConsole,
  crmOk,
  crmFail,
  crmFailUnreadable,
} from "../_test-helpers.js";

const TOKEN = "AbC123-_xyzAbC123-_xyz0";
const SLOT_A = "slot-2026-10-29";
const SLOT_B = "slot-2026-11-04";
const SLOT_C = "slot-2026-11-05";

const setCrmEnv = () => {
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
};

const submit = (
  body: unknown = { token: TOKEN, slots: [SLOT_A], note: "About adoption" }
) => invoke(handler, { method: "POST", body });

const bodyOf = (call: any) => JSON.parse(call[1].body);

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi.fn().mockResolvedValue(crmOk());
  vi.stubGlobal("fetch", fetchMock);
  setCrmEnv();
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/s/submit: method guard", () => {
  it.each(["GET", "PUT", "PATCH", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, {
      method,
      body: { token: TOKEN, slots: [SLOT_A] },
    });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/s/submit: the payload", () => {
  it("posts action submit with the token, the slots and the note", async () => {
    const res = await submit({
      token: TOKEN,
      slots: [SLOT_A, SLOT_C],
      note: "Anything on measurement",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/session-invite");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      action: "submit",
      token: TOKEN,
      slots: [SLOT_A, SLOT_C],
      note: "Anything on measurement",
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("keeps the order the visitor ticked", async () => {
    await submit({ token: TOKEN, slots: [SLOT_C, SLOT_A, SLOT_B], note: null });
    expect(bodyOf(fetchMock.mock.calls[0]).slots).toEqual([
      SLOT_C,
      SLOT_A,
      SLOT_B,
    ]);
  });

  it("deduplicates a slot that arrives twice", async () => {
    await submit({ token: TOKEN, slots: [SLOT_A, SLOT_A, SLOT_B], note: null });
    expect(bodyOf(fetchMock.mock.calls[0]).slots).toEqual([SLOT_A, SLOT_B]);
  });
});

// Nobody ticking a box is an answer in itself: none of the three moments work.
// The thanks page sends no slots at all.
describe("api/s/submit: zero slots", () => {
  it.each([
    ["an empty array", { token: TOKEN, slots: [], note: "Rather a recording" }],
    ["no slots field", { token: TOKEN, note: "Rather a recording" }],
  ])("accepts %s and sends an empty list", async (_label, body) => {
    const res = await submit(body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(bodyOf(fetchMock.mock.calls[0]).slots).toEqual([]);
  });

  it("accepts a submit with neither slots nor a note", async () => {
    const res = await submit({ token: TOKEN });
    expect(res.status).toBe(200);
    expect(bodyOf(fetchMock.mock.calls[0])).toEqual({
      action: "submit",
      token: TOKEN,
      slots: [],
      note: null,
    });
  });
});

describe("api/s/submit: the note", () => {
  it.each([
    ["no note field", { token: TOKEN, slots: [SLOT_A] }],
    ["note null", { token: TOKEN, slots: [SLOT_A], note: null }],
    ["an empty note", { token: TOKEN, slots: [SLOT_A], note: "" }],
    ["a blank note", { token: TOKEN, slots: [SLOT_A], note: "   " }],
  ])("sends null for %s", async (_label, body) => {
    await submit(body);
    expect(bodyOf(fetchMock.mock.calls[0]).note).toBeNull();
  });

  it("trims a note", async () => {
    await submit({ token: TOKEN, slots: [], note: "  One line  " });
    expect(bodyOf(fetchMock.mock.calls[0]).note).toBe("One line");
  });

  it("keeps the text of a longer answer intact, line breaks included", async () => {
    const note = "First point\nSecond point";
    await submit({ token: TOKEN, slots: [], note });
    expect(bodyOf(fetchMock.mock.calls[0]).note).toBe(note);
  });

  it("accepts a note of 2000 characters", async () => {
    const res = await submit({
      token: TOKEN,
      slots: [],
      note: "a".repeat(2000),
    });
    expect(res.status).toBe(200);
  });
});

// Same split as in api/s/confirm.test.ts: a token that cannot exist is
// answered like a token nobody knows, so the page ends on /s/invalid.
describe("api/s/submit: a token that cannot exist", () => {
  const unusable: [string, unknown][] = [
    ["no body", undefined],
    ["an array body", []],
    ["a string body", "token=abc"],
    ["no token", { slots: [SLOT_A] }],
    ["a token of 21 characters", { token: "a".repeat(21), slots: [] }],
    ["a token with a slash", { token: `${TOKEN}/x`, slots: [] }],
  ];

  // Straight through invoke, not the submit helper: its default argument would
  // fill in a valid body for the "no body" case.
  it.each(unusable)(
    "%s answers unknown_token without a call",
    async (_label, body) => {
      const res = await invoke(handler, { method: "POST", body });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: false, reason: "unknown_token" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );
});

describe("api/s/submit: a request that does not parse", () => {
  const bad: [string, unknown][] = [
    [
      "a slot id that does not exist",
      { token: TOKEN, slots: ["slot-2026-12-01"] },
    ],
    ["a slot id with padding", { token: TOKEN, slots: [` ${SLOT_A}`] }],
    ["a slot that is not a string", { token: TOKEN, slots: [1] }],
    ["slots as a string", { token: TOKEN, slots: SLOT_A }],
    [
      "more slots than there are moments",
      {
        token: TOKEN,
        slots: [SLOT_A, SLOT_B, SLOT_C, SLOT_A],
      },
    ],
    [
      "a note over 2000 characters",
      {
        token: TOKEN,
        slots: [],
        note: "a".repeat(2001),
      },
    ],
    ["a note that is not a string", { token: TOKEN, slots: [], note: 42 }],
  ];

  it.each(bad)("%s returns 400 without a call", async (_label, body) => {
    const res = await invoke(handler, { method: "POST", body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ ok: false, reason: "invalid_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("names no field and quotes nothing back", async () => {
    const res = await submit({ token: TOKEN, slots: ["slot-2027-01-01"] });
    const answered = JSON.stringify(res.body);
    expect(answered).not.toContain("slot-2027-01-01");
    expect(answered).not.toContain("slots");
  });
});

describe("api/s/submit: an unknown token and a closed invitation", () => {
  it("passes unknown_token through with a 200", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const res = await submit();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false, reason: "unknown_token" });
  });

  it("passes closed through with a 200", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const res = await submit();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: false, reason: "closed" });
  });

  it("differs in the reason and in nothing else", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const invalid = await submit();
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const closed = await submit();

    expect(invalid.status).toBe(closed.status);
    expect(Object.keys(invalid.body)).toEqual(Object.keys(closed.body));
  });
});

// Unlike the click, a failed submit is not something to hide: these are the
// answers we asked for, and no later call writes them again.
describe("api/s/submit: the BD application not answering", () => {
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
    const res = await submit();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(console_.errorSpy).toHaveBeenCalled();
  });

  it("answers 502 without the CRM env vars, and calls nothing", async () => {
    vi.stubEnv("CRM_BASE_URL", undefined);
    const res = await submit();
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set: session invite submit NOT stored"
    );
  });

  it("never logs the token or the note", async () => {
    fetchMock.mockResolvedValue(crmFail(500, "boom"));
    await submit({ token: TOKEN, slots: [], note: "Something confidential" });
    const logged = JSON.stringify(console_.errorSpy.mock.calls);
    expect(logged).not.toContain(TOKEN);
    expect(logged).not.toContain("Something confidential");
  });
});

describe("api/s/submit: timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an abort signal", async () => {
    await submit();
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

    const pending = submit();
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ ok: false, reason: "unavailable" });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM session-invite submit error:",
      expect.objectContaining({ name: "AbortError" })
    );
  });

  it("clears the timer when the answer is in time", async () => {
    vi.useFakeTimers();
    const res = await submit();
    expect(res.status).toBe(200);
    const { signal } = fetchMock.mock.calls[0][1];
    await vi.advanceTimersByTimeAsync(60_000);
    expect(signal.aborted).toBe(false);
  });
});
