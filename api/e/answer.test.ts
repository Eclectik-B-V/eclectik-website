import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./answer.js";
import { invoke, stubConsole, crmOk } from "../_test-helpers.js";

const TOKEN = "AbC123-_xyzAbC123-_xyz0";
const answer = (body: unknown = { token: TOKEN, answer: "yes" }) =>
  invoke(handler, { method: "POST", body });
const bodyOf = (call: any) => JSON.parse(call[1].body);

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi.fn().mockResolvedValue(crmOk());
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/e/answer", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: { token: TOKEN, answer: "yes" } });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["yes", "no"])("stuurt %s door", async value => {
    await answer({ token: TOKEN, answer: value });
    expect(bodyOf(fetchMock.mock.calls[0])).toEqual({
      action: "answer",
      token: TOKEN,
      answer: value,
    });
  });

  it("weigert een antwoord dat geen yes of no is", async () => {
    const res = await answer({ token: TOKEN, answer: "maybe" });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een token met de verkeerde vorm", async () => {
    const res = await answer({ token: "kort", answer: "yes" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ reason: "unknown_token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("geeft unknown_token door aan de pagina", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ ok: false, reason: "unknown_token" }),
    });
    const res = await answer();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: false, reason: "unknown_token" });
  });

  it("doet bij een storing niet alsof het gelukt is", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));
    const res = await answer();
    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({ ok: false, reason: "unavailable" });
  });

  it("noemt geen veldnamen in een afwijzing", async () => {
    const res = await answer({ token: TOKEN, answer: "maybe" });
    expect(JSON.stringify(res.body)).not.toContain("answer");
  });
});
