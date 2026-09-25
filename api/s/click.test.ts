import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "./click.js";
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

const BROWSER_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

/** The click is a GET with the token and the answer in the query string. */
const click = (
  query: Record<string, string | string[]> = { t: TOKEN, a: "yes" },
  headers: Record<string, string> = { "user-agent": BROWSER_UA }
) => invoke(handler, { method: "GET", query, headers });

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

describe("api/s/click: method guard", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE", "HEAD"])(
    "%s returns 405",
    async method => {
      const res = await invoke(handler, {
        method,
        query: { t: TOKEN, a: "yes" },
      });
      expect(res.status).toBe(405);
      expect(res.body).toEqual({ error: "Method not allowed" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );
});

describe("api/s/click: the provisional write", () => {
  it("posts action click with the answer and the bot flag, and nothing else", async () => {
    await click();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://crm.example.com/api/session-invite");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "x-webhook-secret": "s3cret",
    });
    expect(JSON.parse(init.body)).toEqual({
      action: "click",
      token: TOKEN,
      answer: "yes",
      botSuspected: false,
    });
  });

  it.each([
    ["yes", "slots"],
    ["no", "thanks"],
  ])("a=%s redirects to the %s page", async (answer, page) => {
    const res = await click({ t: TOKEN, a: answer });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/s/${TOKEN}/${page}`);
    expect(bodyOf(fetchMock.mock.calls[0]).answer).toBe(answer);
  });

  it("sends no body with the redirect", async () => {
    const res = await click();
    expect(res.body).toBeUndefined();
  });

  it("forbids caching and indexing of the redirect", async () => {
    const res = await click();
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  });
});

describe("api/s/click: unusable links", () => {
  const unusable: [string, Record<string, string | string[]>][] = [
    ["no query at all", {}],
    ["no token", { a: "yes" }],
    ["no answer", { t: TOKEN }],
    ["empty token", { t: "", a: "yes" }],
    ["token of 21 characters", { t: "a".repeat(21), a: "yes" }],
    ["token over 128 characters", { t: "a".repeat(129), a: "yes" }],
    ["token with a slash", { t: `${TOKEN}/admin`, a: "yes" }],
    ["token with a query string", { t: `${TOKEN}?x=1`, a: "yes" }],
    ["token with a newline", { t: `${TOKEN}\nx`, a: "yes" }],
    ["token with a dot", { t: `${TOKEN}.js`, a: "yes" }],
    ["answer maybe", { t: TOKEN, a: "maybe" }],
    ["answer in capitals", { t: TOKEN, a: "YES" }],
    ["answer with padding", { t: TOKEN, a: " yes" }],
    ["a repeated token parameter", { t: [TOKEN, TOKEN], a: "yes" }],
    ["a repeated answer parameter", { t: TOKEN, a: ["yes", "no"] }],
  ];

  it.each(unusable)(
    "%s goes to /s/invalid without a call",
    async (_l, query) => {
      const res = await click(query);
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe("/s/invalid");
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("cannot smuggle a host into the Location header", async () => {
    const res = await click({ t: "https://evil.example/x", a: "yes" });
    expect(res.headers.location).toBe("/s/invalid");
  });
});

describe("api/s/click: what the BD application answers", () => {
  it("sends an unknown token to /s/invalid", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const res = await click();
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/s/invalid");
  });

  it("sends a closed invitation to /s/closed", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const res = await click({ t: TOKEN, a: "no" });
    expect(res.headers.location).toBe("/s/closed");
  });

  it("honours a reason that comes with a non-2xx status", async () => {
    fetchMock.mockResolvedValue(
      crmFail(404, '{"ok":false,"reason":"unknown_token"}')
    );
    const res = await click();
    expect(res.headers.location).toBe("/s/invalid");
    expect(console_.errorSpy).not.toHaveBeenCalled();
  });

  it("gives an unknown token and a closed invitation the same status code", async () => {
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"unknown_token"}'));
    const invalid = await click();
    fetchMock.mockResolvedValue(crmOk('{"ok":false,"reason":"closed"}'));
    const closed = await click();

    expect(invalid.status).toBe(closed.status);
    expect(invalid.body).toBeUndefined();
    expect(closed.body).toBeUndefined();
    expect(invalid.headers.location).not.toBe(closed.headers.location);
  });
});

// A visitor who clicked a button in an email may not end up on an error screen
// because something behind the scenes went wrong. The redirect happens anyway
// and the confirm on the page writes the answer again.
describe("api/s/click: a broken BD application still lets the visitor through", () => {
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
  ])("%s still redirects to the answer page", async (_label, arrange) => {
    arrange();
    const res = await click();
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/s/${TOKEN}/slots`);
    expect(console_.errorSpy).toHaveBeenCalled();
  });

  it("redirects without calling anything when the CRM env vars are missing", async () => {
    vi.stubEnv("CRM_BASE_URL", undefined);
    const res = await click({ t: TOKEN, a: "no" });
    expect(res.headers.location).toBe(`/s/${TOKEN}/thanks`);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM env vars not set: session invite click NOT stored"
    );
  });
});

describe("api/s/click: timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes an abort signal", async () => {
    await click();
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  it("aborts a hanging call and redirects anyway", async () => {
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

    const pending = click();
    await vi.advanceTimersByTimeAsync(10_000);
    const res = await pending;

    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`/s/${TOKEN}/slots`);
    expect(console_.errorSpy).toHaveBeenCalledWith(
      "CRM session-invite click error:",
      expect.objectContaining({ name: "AbortError" })
    );
  });

  it("clears the timer when the answer is in time", async () => {
    vi.useFakeTimers();
    await click();
    const { signal } = fetchMock.mock.calls[0][1];
    await vi.advanceTimersByTimeAsync(60_000);
    expect(signal.aborted).toBe(false);
  });
});

describe("api/s/click: bot detection", () => {
  it.each([
    [
      "Microsoft Defender Safe Links",
      "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1) SafeLinks",
    ],
    ["Defender by name", "Mozilla/5.0 Microsoft-Defender/1.0"],
    ["BingPreview", "Mozilla/5.0 (compatible; BingPreview/1.0b)"],
    ["Slackbot", "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)"],
    ["facebookexternalhit", "facebookexternalhit/1.1"],
    ["Twitterbot", "Twitterbot/1.0"],
    ["a generic crawler", "Mozilla/5.0 (compatible; SomeCrawler/2.1)"],
    ["a spider", "Custom Spider 3"],
    ["a scanner", "Corporate Mail Scanner 4.2"],
    ["a preview fetcher", "LinkPreview/1.0"],
    ["Office", "Microsoft Office Existence Discovery"],
    ["a mail gateway", "Proofpoint-URL-Defense/2"],
    ["curl", "curl/8.4.0"],
    ["headless chrome", "Mozilla/5.0 HeadlessChrome/120.0.0.0"],
  ])("flags %s", async (_label, ua) => {
    await click({ t: TOKEN, a: "yes" }, { "user-agent": ua });
    expect(bodyOf(fetchMock.mock.calls[0]).botSuspected).toBe(true);
  });

  it.each([
    ["an iPhone", BROWSER_UA],
    [
      "Outlook on Windows",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
    ],
    [
      "Firefox on Android",
      "Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0",
    ],
    [
      "Safari on a Mac",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    ],
  ])("does not flag %s", async (_label, ua) => {
    await click({ t: TOKEN, a: "yes" }, { "user-agent": ua });
    expect(bodyOf(fetchMock.mock.calls[0]).botSuspected).toBe(false);
  });

  it.each([
    ["a missing user agent", {}],
    ["an empty user agent", { "user-agent": "" }],
    ["a blank user agent", { "user-agent": "   " }],
  ])("flags %s, because every browser sends one", async (_label, headers) => {
    await click({ t: TOKEN, a: "yes" }, headers);
    expect(bodyOf(fetchMock.mock.calls[0]).botSuspected).toBe(true);
  });

  it("writes the row for a bot as well, it only adds the flag", async () => {
    const res = await click(
      { t: TOKEN, a: "yes" },
      { "user-agent": "curl/8.4.0" }
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.headers.location).toBe(`/s/${TOKEN}/slots`);
  });
});

describe("api/s/click: what never leaves the function", () => {
  const ua = "Mozilla/5.0 (X11; Linux x86_64) SecretAgent/9.9";

  it("does not forward the user agent, in the body or in a header", async () => {
    await click({ t: TOKEN, a: "yes" }, { "user-agent": ua });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).not.toContain("SecretAgent");
    expect(Object.keys(init.headers)).toEqual([
      "Content-Type",
      "x-webhook-secret",
    ]);
    expect(Object.keys(bodyOf(fetchMock.mock.calls[0])).sort()).toEqual([
      "action",
      "answer",
      "botSuspected",
      "token",
    ]);
  });

  it("does not forward an IP address that arrives in a header", async () => {
    await click(
      { t: TOKEN, a: "yes" },
      { "user-agent": BROWSER_UA, "x-forwarded-for": "203.0.113.7" }
    );
    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).not.toContain("203.0.113.7");
    expect(JSON.stringify(init.headers)).not.toContain("203.0.113.7");
  });

  it("logs neither the token nor the user agent when the call fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await click({ t: TOKEN, a: "yes" }, { "user-agent": ua });
    const logged = JSON.stringify(console_.errorSpy.mock.calls);
    expect(logged).not.toContain(TOKEN);
    expect(logged).not.toContain("SecretAgent");
  });
});
