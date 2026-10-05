import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./lookup.js";
import { invoke, stubConsole, crmOk } from "../_test-helpers.js";

const TOKEN = "AbC123-_xyzAbC123-_xyz0";
const look = (body: unknown = { token: TOKEN }) =>
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

describe("api/e/lookup", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: { token: TOKEN } });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stuurt action lookup door", async () => {
    await look();
    expect(bodyOf(fetchMock.mock.calls[0])).toEqual({
      action: "lookup",
      token: TOKEN,
    });
  });

  it("schrijft niets weg: er zit geen answer in de payload", async () => {
    await look();
    expect(bodyOf(fetchMock.mock.calls[0])).not.toHaveProperty("answer");
  });

  it("geeft de voornaam terug", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true, firstName: "Marco" }),
    });
    const res = await look();
    expect(res.body).toEqual({ ok: true, firstName: "Marco" });
  });

  it("maakt een lege voornaam null in plaats van een lege aanhef", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true, firstName: "   " }),
    });
    const res = await look();
    expect(res.body).toEqual({ ok: true, firstName: null });
  });

  it("leest een body zonder tokenvorm als onbekend token", async () => {
    const res = await look({ nope: 1 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ reason: "unknown_token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("meldt een storing, zodat de pagina alsnog open kan", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));
    const res = await look();
    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({ reason: "unavailable" });
  });
});
