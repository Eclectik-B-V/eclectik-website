import { existsSync } from "node:fs";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler, { POSTER_URL } from "./bmai-poster.js";
import { invoke, stubConsole, crmOk, crmFail, XSS, XSS_ESCAPED } from "./_test-helpers.js";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const validBody = (over: Record<string, unknown> = {}) => ({
  name: "Marco de Vries",
  email: "marco@acme-corp.com",
  company: "Acme BV",
  consentMarketing: true,
  ...over,
});

const post = (body: unknown = validBody()) => invoke(handler, { method: "POST", body });
const crmBody = (call: any) => JSON.parse(call[1].body);
const mail = () => sendMock.mock.calls[0][0];

let console_: ReturnType<typeof stubConsole>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  console_ = stubConsole();
  fetchMock = vi.fn().mockResolvedValue(crmOk());
  vi.stubGlobal("fetch", fetchMock);
  sendMock.mockResolvedValue({ data: { id: "m1" }, error: null });
  vi.stubEnv("CRM_BASE_URL", "https://crm.example.com");
  vi.stubEnv("CRM_WEBHOOK_SECRET", "s3cret");
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("CONTACT_FROM_EMAIL", "site@eclectik.co");
  vi.stubEnv("CONTACT_TO_EMAIL", "hello@eclectik.co");
});

afterEach(() => {
  console_.restore();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("api/bmai-poster: de poort", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("geeft geen poster zonder toestemming voor marketingmail", async () => {
    const res = await post(validBody({ consentMarketing: false }));
    expect(res.status).toBe(400);
    expect(res.body.url).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it.each(["name", "email", "company"])("weigert een aanvraag zonder %s", async field => {
    const res = await post(validBody({ [field]: "  " }));
    expect(res.status).toBe(400);
    expect(res.body.url).toBeUndefined();
  });

  it("weigert een adres dat geen adres is", async () => {
    const res = await post(validBody({ email: "geen adres" }));
    expect(res.status).toBe(400);
  });

  it("noemt geen veldnamen in een afwijzing", async () => {
    const res = await post(validBody({ email: "geen adres" }));
    expect(JSON.stringify(res.body)).not.toContain("email");
  });
});

describe("api/bmai-poster: de poster", () => {
  it("geeft de link naar de poster terug", async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, url: POSTER_URL });
  });

  it("wijst naar een PDF die echt in client/public staat", () => {
    expect(POSTER_URL).toMatch(/^\/downloads\/.+\.pdf$/);
    expect(existsSync(new URL(`../client/public${POSTER_URL}`, import.meta.url))).toBe(true);
  });
});

describe("api/bmai-poster: wat er naar het CRM gaat", () => {
  it("stuurt een bmai_poster_download-signaal met de opt-in", async () => {
    await post(validBody({ src: "linkedin" }));
    expect(fetchMock.mock.calls[0][0]).toBe("https://crm.example.com/api/website-signal");
    expect(crmBody(fetchMock.mock.calls[0])).toEqual({
      source: "website",
      event: "bmai_poster_download",
      email: "marco@acme-corp.com",
      name: "Marco de Vries",
      company: "Acme BV",
      consentMarketing: true,
      src: "linkedin",
    });
  });

  it("knipt spaties van de velden", async () => {
    await post(validBody({ name: "  Marco de Vries ", company: " Acme BV  " }));
    const body = crmBody(fetchMock.mock.calls[0]);
    expect(body.name).toBe("Marco de Vries");
    expect(body.company).toBe("Acme BV");
  });
});

describe("api/bmai-poster: de mail", () => {
  it("meldt de download met naam en bedrijf", async () => {
    await post();
    expect(mail().subject).toBe("BMAI poster download: Marco de Vries, Acme BV");
    expect(mail().replyTo).toBe("marco@acme-corp.com");
    expect(mail().html).toContain("In the leads tab:</strong> yes");
  });

  it("zegt dat hij met de hand moet als het CRM hem niet nam", async () => {
    fetchMock.mockResolvedValue(crmFail());
    await post();
    expect(mail().html).toContain("Add this one by hand");
  });

  it("ontsnapt wat een bezoeker invult", async () => {
    await post(validBody({ company: XSS }));
    expect(mail().html).toContain(XSS_ESCAPED);
    expect(mail().html).not.toContain(XSS);
  });

  it("gebruikt nergens een em dash of en dash", async () => {
    await post();
    expect(mail().subject).not.toMatch(/[—–]/);
    expect(mail().html).not.toMatch(/[—–]/);
  });
});

describe("api/bmai-poster: wanneer is hij binnen", () => {
  it("geeft de poster als het CRM faalt maar de mail aankomt", async () => {
    fetchMock.mockResolvedValue(crmFail());
    const res = await post();
    expect(res.status).toBe(200);
    expect(res.body.url).toBe(POSTER_URL);
  });

  it("geeft de poster als de mail faalt maar het CRM hem nam", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "nope" } });
    const res = await post();
    expect(res.status).toBe(200);
  });

  it("geeft geen poster als allebei mislukken", async () => {
    fetchMock.mockResolvedValue(crmFail());
    sendMock.mockRejectedValue(new Error("boom"));
    const res = await post();
    expect(res.status).toBe(502);
    expect(res.body.url).toBeUndefined();
  });
});
