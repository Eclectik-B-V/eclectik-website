// Test doubles for the serverless handlers in this directory.
//
// The underscore prefix keeps the file out of Vercel's function routing, and
// the name deliberately does not match vitest's `**/*.{test,spec}.{ts,tsx}`
// include pattern, so this file is only ever pulled in by the tests next to it.
import { vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export type Handler = (
  req: VercelRequest,
  res: VercelResponse
) => unknown | Promise<unknown>;

export interface Captured {
  status: number | undefined;
  body: any;
  headers: Record<string, string>;
}

export function createReq(
  init: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): VercelRequest {
  return {
    method: init.method ?? "POST",
    body: init.body,
    headers: init.headers ?? { "content-type": "application/json" },
    query: {},
    cookies: {},
  } as unknown as VercelRequest;
}

/** A chainable res double: `res.status(400).json({...})` records both. */
export function createRes(): { res: VercelResponse; captured: Captured } {
  const captured: Captured = {
    status: undefined,
    body: undefined,
    headers: {},
  };
  const res = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(payload: unknown) {
      captured.body = payload;
      return res;
    },
    send(payload: unknown) {
      captured.body = payload;
      return res;
    },
    setHeader(name: string, value: string) {
      captured.headers[name.toLowerCase()] = String(value);
      return res;
    },
    end() {
      return res;
    },
  };
  return { res: res as unknown as VercelResponse, captured };
}

/** Run a handler against the doubles and return what it wrote to the response. */
export async function invoke(
  handler: Handler,
  init: { method?: string; body?: unknown } = {}
): Promise<Captured> {
  const { res, captured } = createRes();
  await handler(createReq(init), res);
  return captured;
}

/** Silence (and expose) the handlers' console output. */
export function stubConsole() {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  return {
    errorSpy,
    warnSpy,
    restore() {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
    },
  };
}

/** Minimal fetch Response stand-ins for the CRM calls. */
export function crmOk(body = '{"ok":true}') {
  return {
    ok: true,
    status: 200,
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

export function crmFail(status = 500, body = "upstream exploded") {
  return {
    ok: false,
    status,
    text: async () => body,
    json: async () => ({}),
  };
}

/** A failing response whose body cannot be read either (the `.catch` branch). */
export function crmFailUnreadable(status = 502) {
  return {
    ok: false,
    status,
    text: async () => {
      throw new Error("stream already consumed");
    },
    json: async () => ({}),
  };
}

export const XSS = "<script>alert(1)</script>";
export const XSS_ESCAPED = "&lt;script&gt;alert(1)&lt;/script&gt;";
