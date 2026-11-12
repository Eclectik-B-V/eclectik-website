import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./bmai-enquiry.js";
import { invoke, stubConsole, crmOk, crmFail, XSS, XSS_ESCAPED } from "./_test-helpers.js";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

const validBody = (over: Record<string, unknown> = {}) => ({
  firstName: "Marco",
  lastName: "de Vries",
  email: "marco@acme-corp.com",
  company: "Acme BV",
  role: "Head of HR",
  interest: "partner",
  consent: true,
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

describe("api/bmai-enquiry: de poort", () => {
  it.each(["GET", "PUT", "DELETE"])("%s returns 405", async method => {
    const res = await invoke(handler, { method, body: validBody() });
    expect(res.status).toBe(405);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("weigert een aanvraag zonder toestemming", async () => {
    const res = await post(validBody({ consent: false }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("weigert een interesse buiten de drie", async () => {
    const res = await post(validBody({ interest: "book" }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
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

describe("api/bmai-enquiry: wat er naar het CRM gaat", () => {
  it("stuurt een bmai_enquiry-signaal", async () => {
    await post();
    expect(fetchMock.mock.calls[0][0]).toBe("https://crm.example.com/api/website-signal");
    expect(crmBody(fetchMock.mock.calls[0])).toMatchObject({
      source: "website",
      event: "bmai_enquiry",
      email: "marco@acme-corp.com",
      name: "Marco de Vries",
      company: "Acme BV",
      role: "Head of HR",
      interest: "partner",
    });
  });

  it("stuurt de korte id van de interesse, niet het label", async () => {
    await post(validBody({ interest: "organisation" }));
    expect(crmBody(fetchMock.mock.calls[0]).interest).toBe("organisation");
  });

  it("zet marketing standaard uit", async () => {
    await post();
    expect(crmBody(fetchMock.mock.calls[0]).consentMarketing).toBe(false);
  });

  it("zet marketing aan als het vinkje aan stond", async () => {
    await post(validBody({ consentMarketing: true }));
    expect(crmBody(fetchMock.mock.calls[0]).consentMarketing).toBe(true);
  });

  it("laat bedrijf en rol leeg zijn", async () => {
    const res = await post(validBody({ company: undefined, role: undefined }));
    expect(res.status).toBe(200);
  });
});

describe("api/bmai-enquiry: de mail", () => {
  it("meldt de aanvraag met het label van de interesse", async () => {
    await post();
    expect(mail().subject).toBe("BMAI enquiry: Marco de Vries, Becoming a BMAI partner");
    expect(mail().replyTo).toBe("marco@acme-corp.com");
  });

  it("zegt dat de aanvraag in de leads-tab staat als het CRM hem nam", async () => {
    await post();
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

describe("api/bmai-enquiry: wanneer is hij binnen", () => {
  it("is binnen als het CRM faalt maar de mail aankomt", async () => {
    fetchMock.mockResolvedValue(crmFail());
    const res = await post();
    expect(res.status).toBe(200);
  });

  it("is binnen als de mail faalt maar het CRM hem nam", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "nope" } });
    const res = await post();
    expect(res.status).toBe(200);
  });

  it("is binnen zonder CRM-instellingen, zolang de mail aankomt", async () => {
    vi.stubEnv("CRM_BASE_URL", "");
    const res = await post();
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("meldt een fout pas als allebei mislukken", async () => {
    fetchMock.mockResolvedValue(crmFail());
    sendMock.mockRejectedValue(new Error("boom"));
    const res = await post();
    expect(res.status).toBe(502);
  });
});
