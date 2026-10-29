import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./event-registration-zurich.js";
import { invoke, stubConsole } from "./_test-helpers.js";

const validBody = (over: Record<string, unknown> = {}) => ({
  firstName: "Marco",
  lastName: "van Gelder",
  email: "marco@acme-corp.com",
  company: "Acme Corp",
  jobTitle: "CHRO",
  country: "Switzerland",
  invitedBy: "PwC",
  consent: true,
  ...over,
});

const post = (body: unknown = validBody()) =>
  invoke(handler, { method: "POST", body });
const crmBody = (call: any) => JSON.parse(call[1].body);

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "{}" });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
  // Geen Resend-env: de mails zijn best-effort en worden dan overgeslagen,
  // zodat deze tests over het CRM gaan en niet over de mailer.
  vi.stubEnv("RESEND_API_KEY", "");
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/event-registration-zurich: de poort", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een inschrijving zonder toestemming", async () => {
    const res = await post(validBody({ consent: false }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een organisator buiten de drie plus Other", async () => {
    const res = await post(validBody({ invitedBy: "Workvivo" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["Eclectik", "PwC", "Microsoft", "Other"])(
    "accepteert %s als uitnodiger",
    async who => {
      const res = await post(validBody({ invitedBy: who }));
      expect(res.status).toBe(200);
    }
  );

  it("weigert een adres dat geen adres is", async () => {
    const res = await post(validBody({ email: "geen adres" }));
    expect(res.status).toBe(400);
  });
});

describe("api/event-registration-zurich: wat er naar het CRM gaat", () => {
  it("draagt de eigen slug, naam en datum", async () => {
    await post();
    expect(crmBody(fetchMock.mock.calls[0])).toMatchObject({
      event: "event_registered",
      eventSlug: "zurich-2026",
      eventDate: "2026-12-01",
    });
  });

  it("gaat niet per ongeluk naar het Amsterdam-event", async () => {
    await post();
    const sent = crmBody(fetchMock.mock.calls[0]);
    expect(sent.eventSlug).not.toBe("amsterdam-2026");
    expect(JSON.stringify(sent)).not.toContain("Workvivo");
  });

  it("stuurt marketing apart mee, standaard uit", async () => {
    await post();
    expect(crmBody(fetchMock.mock.calls[0]).consentMarketing).toBe(false);
  });

  it("stuurt marketing mee als het vinkje aan stond", async () => {
    await post(validBody({ consentMarketing: true }));
    expect(crmBody(fetchMock.mock.calls[0]).consentMarketing).toBe(true);
  });
});

describe("api/event-registration-zurich: als het CRM hapert", () => {
  it("meldt een fout in plaats van stilletjes te slagen", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => "" });
    const res = await post();
    expect(res.status).toBe(502);
  });

  it("meldt een fout als de env vars ontbreken", async () => {
    vi.stubEnv("CRM_BASE_URL", "");
    const res = await post();
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
