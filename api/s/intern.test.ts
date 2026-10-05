import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./intern.js";
import { invoke, stubConsole, crmOk } from "../_test-helpers.js";

/**
 * Er staat bewust geen wachtwoord op deze route, zie de toelichting in
 * intern.ts. De enige drempel die over is, is het domein van de invuller, en
 * dat is dus ook de test die er het meest toe doet: wie daar niet doorheen
 * komt, mag ook geen verkeer naar de BD-applicatie veroorzaken.
 */

const SLOT_A = "slot-2026-10-29";

const validBody = (over: Record<string, unknown> = {}) => ({
  email: "Klant@Voorbeeld.com",
  registeredBy: "collega@eclectik.co",
  slots: [SLOT_A],
  note: "Wil graag iets over adoptie",
  ...over,
});

const post = (body: unknown = validBody()) =>
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

describe("api/s/intern: de drempel", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een adres buiten eclectik.co", async () => {
    const res = await post(validBody({ registeredBy: "iemand@gmail.com" }));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een adres dat eclectik.co alleen als voorvoegsel heeft", async () => {
    const res = await post(validBody({ registeredBy: "a@eclectik.co.evil.com" }));
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een deelnemersadres dat geen adres is", async () => {
    const res = await post(validBody({ email: "geen adres" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("noemt geen veldnamen in een afwijzing", async () => {
    const res = await post(validBody({ email: "geen adres" }));
    expect(JSON.stringify(res.body)).not.toContain("email");
  });
});

describe("api/s/intern: wat er naar de BD-applicatie gaat", () => {
  it("stuurt het adres genormaliseerd door", async () => {
    await post();
    expect(bodyOf(fetchMock.mock.calls[0]).email).toBe("klant@voorbeeld.com");
  });

  it("stuurt action register met de collega erbij", async () => {
    await post();
    const sent = bodyOf(fetchMock.mock.calls[0]);
    expect(sent.action).toBe("register");
    expect(sent.registeredBy).toBe("collega@eclectik.co");
    expect(sent.confirmOverwrite).toBe(false);
  });

  it("ontdubbelt de datums", async () => {
    await post(validBody({ slots: [SLOT_A, SLOT_A] }));
    expect(bodyOf(fetchMock.mock.calls[0]).slots).toEqual([SLOT_A]);
  });

  it("laat versturen zonder datums toe, net als de klantpagina", async () => {
    const res = await post(validBody({ slots: [] }));
    expect(res.status).toBe(200);
    expect(bodyOf(fetchMock.mock.calls[0]).slots).toEqual([]);
  });

  it("maakt een lege notitie null", async () => {
    await post(validBody({ note: "   " }));
    expect(bodyOf(fetchMock.mock.calls[0]).note).toBeNull();
  });
});

describe("api/s/intern: een bestaand antwoord van de klant", () => {
  it("geeft needs_confirm door met wat er al stond", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      text: async () =>
        JSON.stringify({
          ok: false,
          reason: "needs_confirm",
          existing: { answer: "no", slots: [SLOT_A], note: "Komt niet uit" },
        }),
    });
    const res = await post();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ok: false,
      reason: "needs_confirm",
      existing: { answer: "no", slots: [SLOT_A], note: "Komt niet uit" },
    });
  });

  it("stuurt confirmOverwrite door zodra de collega bevestigt", async () => {
    await post(validBody({ confirmOverwrite: true }));
    expect(bodyOf(fetchMock.mock.calls[0]).confirmOverwrite).toBe(true);
  });

  it("meldt een storing in plaats van te doen alsof het gelukt is", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));
    const res = await post();
    expect(res.status).toBe(502);
    expect(res.body).toMatchObject({ ok: false, reason: "unavailable" });
  });
});
