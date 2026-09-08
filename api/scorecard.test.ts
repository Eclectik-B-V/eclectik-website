import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./scorecard.js";
import { QUESTIONS, PROFILE_QUESTIONS } from "../shared/scorecard.js";
import {
  invoke,
  stubConsole,
  crmOk,
  crmFail,
  crmFailUnreadable,
} from "./_test-helpers.js";

const ALL_IDS = [
  ...QUESTIONS.map(q => q.id),
  ...PROFILE_QUESTIONS.map(q => q.id),
];

const answers = (
  value = 1,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  ...Object.fromEntries(ALL_IDS.map(id => [id, value])),
  ...overrides,
});

/** The full set minus `drop` — used for the "not exactly 23" cases. */
const answersWithout = (drop: string) => {
  const a = answers();
  delete a[drop];
  return a;
};

const validBody = (overrides: Record<string, unknown> = {}) => ({
  email: "marco@acme-corp.com",
  consent: true,
  door: "value",
  answers: answers(),
  src: "scorecard-result",
  ...overrides,
});

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
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/scorecard — fixture sanity", () => {
  it("the shared bank yields exactly the 23 accepted ids", () => {
    expect(ALL_IDS).toHaveLength(23);
    expect(Object.keys(answers())).toHaveLength(23);
    expect(
      ALL_IDS.every(id => /^(V[1-8]|C[1-8]|R[1-4]|P[1-3])$/.test(id))
    ).toBe(true);
  });
});

describe("api/scorecard — method guard", () => {
  it.each(["GET", "PUT", "DELETE", "PATCH"])("%s returns 405", async method => {
    setCrmEnv();
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(res.body).toEqual({ error: "Method not allowed" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("api/scorecard — body validation", () => {
  beforeEach(setCrmEnv);

  const bad: [string, unknown][] = [
    ["missing email", validBody({ email: undefined })],
    ["malformed email", validBody({ email: "marco@acme" })],
    [
      "email over 200 chars",
      validBody({ email: `${"a".repeat(200)}@acme.com` }),
    ],
    ["missing consent", validBody({ consent: undefined })],
    ["consent as the string 'true'", validBody({ consent: "true" })],
    ["missing door", validBody({ door: undefined })],
    ["unknown door", validBody({ door: "growth" })],
    ["door with wrong casing", validBody({ door: "Value" })],
    ["missing answers", validBody({ answers: undefined })],
    ["answers as an array", validBody({ answers: [] })],
    ["unknown answer id", validBody({ answers: answers(1, { V9: 1 }) })],
    ["lower-case answer id", validBody({ answers: answers(1, { v1: 1 }) })],
    [
      "answer value 6 (out of range)",
      validBody({ answers: answers(1, { V1: 6 }) }),
    ],
    ["negative answer value", validBody({ answers: answers(1, { C3: -1 }) })],
    [
      "non-integer answer value",
      validBody({ answers: answers(1, { R1: 1.5 }) }),
    ],
    [
      "answer value as a string",
      validBody({ answers: answers(1, { P1: "2" }) }),
    ],
    ["null answer value", validBody({ answers: answers(1, { P2: null }) })],
    ["src over 100 chars", validBody({ src: "a".repeat(101) })],
    ["undefined body", undefined],
    ["array body", []],
  ];

  it.each(bad)("%s returns 400", async (_label, body) => {
    const res = await invoke(handler, { body });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid scorecard data" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a body without the optional src", async () => {
    const res = await invoke(handler, { body: validBody({ src: undefined }) });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).src).toBeUndefined();
  });

  it("ignores unknown top-level fields", async () => {
    const res = await invoke(handler, {
      body: validBody({ scores: { index: 100 }, stored: true }),
    });
    expect(res.status).toBe(200);
    expect(Object.keys(JSON.parse(fetchMock.mock.calls[0][1].body))).toEqual([
      "source",
      "form_type",
      "email",
      "consent",
      "door",
      "answers",
      "src",
    ]);
  });

  it("accepts both doors", async () => {
    for (const door of ["value", "change"]) {
      const res = await invoke(handler, { body: validBody({ door }) });
      expect(res.status, door).toBe(200);
      expect(JSON.parse(fetchMock.mock.calls.at(-1)![1].body).door).toBe(door);
    }
  });

  it("accepts the value bounds 0 and 5", async () => {
    for (const v of [0, 5]) {
      const res = await invoke(handler, {
        body: validBody({ answers: answers(v) }),
      });
      expect(res.status, String(v)).toBe(200);
    }
  });

  // Documents the deliberate looseness noted in the handler comment: index 5 is
  // out of range for a 5-anchor maturity question, but per-question range
  // checks are the CRM intake's job.
  it("does not range-check per question type (5 passes on a maturity question)", async () => {
    const res = await invoke(handler, {
      body: validBody({ answers: answers(1, { V3: 5 }) }),
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).answers.V3).toBe(5);
  });

  // Deliberate deviation from api/waitlist.ts (z.literal(true)): the box on the
  // result page is the optional "Send me the monthly insights letter" opt-in,
  // it is not a condition for submitting — client/src/components/scorecard/
  // ResultView.tsx submits with consent:false when it is left unticked, and the
  // work email is what unlocks the report. A literal(true) here would 400 every
  // visitor who does not want the newsletter.
  it("accepts consent:false and forwards it verbatim", async () => {
    const res = await invoke(handler, { body: validBody({ consent: false }) });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: true });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).consent).toBe(false);
  });

  it("accepts consent:true and forwards it verbatim", async () => {
    const res = await invoke(handler, { body: validBody({ consent: true }) });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).consent).toBe(true);
  });
});

describe("api/scorecard — exactly 23 answers", () => {
  beforeEach(setCrmEnv);

  it("22 answers returns 400", async () => {
    const a = answersWithout("P3");
    expect(Object.keys(a)).toHaveLength(22);
    const res = await invoke(handler, { body: validBody({ answers: a }) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid scorecard data" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("an empty answers object returns 400", async () => {
    const res = await invoke(handler, { body: validBody({ answers: {} }) });
    expect(res.status).toBe(400);
  });

  it("24 answers returns 400 (the 24th key cannot match the id pattern)", async () => {
    const a = answers(1, { V9: 1 });
    expect(Object.keys(a)).toHaveLength(24);
    const res = await invoke(handler, { body: validBody({ answers: a }) });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("23 answers returns 200", async () => {
    const a = answers();
    expect(Object.keys(a)).toHaveLength(23);
    const res = await invoke(handler, { body: validBody({ answers: a }) });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: true });
  });

  it("23 keys can only be the complete set, so a swap is impossible", async () => {
    // Dropping V1 and adding a pattern-valid duplicate is not expressible: the
    // pattern admits exactly 23 ids, so any 23 valid keys are all of them.
    const a = { ...answersWithout("V1"), P3: 2, V1: 3 };
    expect(Object.keys(a).sort()).toEqual([...ALL_IDS].sort());
    const res = await invoke(handler, { body: validBody({ answers: a }) });
    expect(res.status).toBe(200);
  });
});

describe("api/scorecard — work-email gate", () => {
  beforeEach(setCrmEnv);

  it.each([
    "someone@gmail.com",
    "someone@GoogleMail.com",
    "someone@hotmail.co.uk",
    "someone@outlook.com",
    "someone@yahoo.com",
    "someone@icloud.com",
    "someone@protonmail.com",
    "someone@ziggo.nl",
    "someone@xs4all.nl",
  ])("rejects the free provider %s with 400", async email => {
    const res = await invoke(handler, { body: validBody({ email }) });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid scorecard data" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    "marco@acme-corp.com",
    "m.de.vries@klant.nl",
    "cfo@eclectik.co",
    "user@mail.acme-corp.com",
  ])("accepts the work address %s", async email => {
    const res = await invoke(handler, { body: validBody({ email }) });
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).email).toBe(email);
  });
});

describe("api/scorecard — missing CRM env vars", () => {
  it.each([
    ["CRM_BASE_URL", "CRM_WEBHOOK_SECRET"],
    ["CRM_WEBHOOK_SECRET", "CRM_BASE_URL"],
    ["both", null],
  ])("without %s it returns 200 with stored:false", async (missing, keep) => {
    if (keep) {
      vi.stubEnv(keep, "set");
      vi.stubEnv(missing, undefined);
    }

    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set — scorecard response NOT stored"
    );
  });

  it("still validates the body before it reports stored:false", async () => {
    const res = await invoke(handler, {
      body: validBody({ email: "x@gmail.com" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("api/scorecard — happy path", () => {
  beforeEach(setCrmEnv);

  it("posts the intake payload and returns stored:true", async () => {
    const res = await invoke(handler, { body: validBody() });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/scorecard-intake");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      source: "website",
      form_type: "scorecard",
      email: "marco@acme-corp.com",
      consent: true,
      door: "value",
      answers: answers(),
      src: "scorecard-result",
    });
  });

  it("forwards the trimmed email", async () => {
    await invoke(handler, {
      body: validBody({ email: "  marco@acme-corp.com " }),
    });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).email).toBe(
      "marco@acme-corp.com"
    );
  });

  it("keeps the answer values as numbers, not strings", async () => {
    await invoke(handler, { body: validBody({ answers: answers(4) }) });
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body).answers;
    expect(Object.values(sent).every(v => typeof v === "number")).toBe(true);
    expect(sent.V1).toBe(4);
  });
});

describe("api/scorecard — CRM failures degrade to stored:false", () => {
  beforeEach(setCrmEnv);

  it("non-2xx from the CRM", async () => {
    fetchMock.mockResolvedValue(crmFail(500, "intake exploded"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM scorecard-intake failed:",
      500,
      "intake exploded"
    );
  });

  it("401 from the CRM (wrong webhook secret)", async () => {
    fetchMock.mockResolvedValue(crmFail(401, "unauthorized"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.body).toEqual({ ok: true, stored: false });
  });

  it("non-2xx whose body cannot be read", async () => {
    fetchMock.mockResolvedValue(crmFailUnreadable(502));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM scorecard-intake failed:",
      502,
      ""
    );
  });

  it("network error", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM scorecard-intake error:",
      expect.any(TypeError)
    );
  });

  it("timeout (aborted request)", async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error("The operation was aborted"), {
        name: "AbortError",
      })
    );
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
  });

  it("fetch throwing synchronously", async () => {
    fetchMock.mockImplementation(() => {
      throw new TypeError("Invalid URL");
    });
    const res = await invoke(handler, { body: validBody() });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, stored: false });
  });
});

describe("api/scorecard — CRM timeout", () => {
  beforeEach(setCrmEnv);

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an abort signal to the CRM fetch", async () => {
    await invoke(handler, { body: validBody() });
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("aborts a hanging CRM call and degrades to stored:false", async () => {
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
    expect(res.body).toEqual({ ok: true, stored: false });
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM scorecard-intake error:",
      expect.objectContaining({ name: "AbortError" })
    );
  });

  it("clears the timer when the CRM answers in time", async () => {
    vi.useFakeTimers();
    const res = await invoke(handler, { body: validBody() });
    expect(res.body).toEqual({ ok: true, stored: true });
    const { signal } = fetchMock.mock.calls[0][1];
    await vi.advanceTimersByTimeAsync(60_000);
    expect(signal.aborted).toBe(false);
  });
});
