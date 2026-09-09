import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Lock, RefreshCw } from "lucide-react";

const EVENT_SLUG = "amsterdam-2026";
const EVENT_TITLE = "AI Transformation, Amsterdam, 6 October 2026";

// sessionStorage, not localStorage: the password lives for one browser session
// and is gone once the tab closes.
const STORAGE_KEY = "eclectik_event_admin_v1";

interface Registration {
  occurred_at?: string | null;
  email?: string | null;
  full_name?: string | null;
  company?: string | null;
  role?: string | null;
  country?: string | null;
  invited_by?: string | null;
  phone?: string | null;
  consent_workvivo?: boolean | null;
}

type Phase = "locked" | "checking" | "ready" | "error";

// A private window can throw on both read and write, so every access is
// wrapped. Same pattern as client/src/pages/Scorecard.tsx.
function loadPassword(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

function savePassword(value: string | null) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* best-effort: the page still works, it just asks again after a reload */
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CSV_HEADERS = [
  "Date",
  "Name",
  "Company",
  "Role",
  "Email",
  "Country",
  "Invited by",
  "Phone",
];

/**
 * One CSV cell.
 *
 * Two separate problems. First, formula injection: Excel and Sheets evaluate a
 * cell that opens with =, +, - or @ (and a leading tab or carriage return can
 * push a value into that position), so such a cell gets a single quote in
 * front, which those tools read as "this is text". Second, quoting: a value
 * holding a comma, a double quote or a line break has to be wrapped in double
 * quotes with its own quotes doubled, or it spills into extra columns.
 */
export function csvCell(value: unknown): string {
  let out = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(out)) out = `'${out}`;
  if (/["\n\r,]/.test(out)) out = `"${out.replace(/"/g, '""')}"`;
  return out;
}

export function buildCsv(rows: Registration[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        formatDate(row.occurred_at),
        row.full_name,
        row.company,
        row.role,
        row.email,
        row.country,
        row.invited_by,
        row.phone,
      ]
        .map(csvCell)
        .join(",")
    );
  }
  // Byte order mark, so Excel opens the file as UTF-8 and keeps the accents.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function downloadCsv(rows: Registration[]) {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `registrations-${EVENT_SLUG}.csv`;
  // Never attached to the document: nothing to clean up afterwards, and React
  // keeps ownership of the whole tree.
  link.click();
  URL.revokeObjectURL(url);
}

const inputClass =
  "w-full bg-white border border-ec-line-3 rounded-md px-4 py-3 text-sm text-ec-navy placeholder:text-ec-body-faint focus:outline-none focus:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors";

const thClass =
  "px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-ec-navy whitespace-nowrap";

const tdClass = "px-4 py-3 align-top text-ec-body-strong";

export default function EventAmsterdam2026Registrations() {
  const stored = useMemo(loadPassword, []);
  const [input, setInput] = useState(stored ?? "");
  // A stored password goes straight to the list, so a reload does not ask again.
  const [phase, setPhase] = useState<Phase>(stored ? "checking" : "locked");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async (password: string) => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, event: EVENT_SLUG }),
      });

      if (res.status === 401) {
        savePassword(null);
        setPhase("locked");
        setMessage("That password is not correct. Please try again.");
        return;
      }

      if (!res.ok) {
        setPhase("error");
        setMessage(
          res.status === 500
            ? "This page is not configured on the server yet. Whoever manages the site needs to set EVENT_ADMIN_PASSWORD."
            : "We could not reach the registration list. Please try again in a moment."
        );
        return;
      }

      const data = await res.json();
      savePassword(password);
      setRows(Array.isArray(data?.registrations) ? data.registrations : []);
      setPhase("ready");
    } catch {
      setPhase("error");
      setMessage(
        "We could not reach the registration list. Please check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (stored) void load(stored);
  }, [stored, load]);

  const lock = () => {
    savePassword(null);
    setInput("");
    setRows([]);
    setMessage("");
    setPhase("locked");
  };

  const head = (
    <>
      <title>Registrations | Eclectik</title>
      <meta name="robots" content="noindex" />
    </>
  );

  const pageHeading = (
    <>
      <h1 className="text-3xl font-heading font-bold text-ec-navy mb-2">
        Registrations
      </h1>
      <p className="text-ec-body text-sm mb-8">{EVENT_TITLE}</p>
    </>
  );

  if (phase === "checking") {
    return (
      <Layout>
        {head}
        <section className="bg-white py-20 lg:py-24">
          <div className="container max-w-md">
            {pageHeading}
            <p className="text-ec-body text-sm">Loading the registrations...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (phase === "locked") {
    return (
      <Layout>
        {head}
        <section className="bg-white py-20 lg:py-24">
          <div className="container max-w-md">
            {pageHeading}
            <form
              onSubmit={event => {
                event.preventDefault();
                if (input.trim().length === 0) {
                  setMessage("Please fill in the password.");
                  return;
                }
                void load(input);
              }}
              className="bg-white border border-ec-line-3 rounded-2xl p-8 shadow-sm space-y-4"
            >
              <label
                htmlFor="event-admin-password"
                className="block text-sm font-medium text-ec-navy"
              >
                Password
              </label>
              <input
                id="event-admin-password"
                type="password"
                autoComplete="current-password"
                value={input}
                onChange={event => setInput(event.target.value)}
                className={inputClass}
                placeholder="Enter the organiser password"
                disabled={busy}
              />
              {message && (
                <p role="alert" className="text-sm text-ec-red">
                  {message}
                </p>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-ec-red hover:bg-ec-red-hover text-white"
              >
                {busy ? "Checking..." : "Show the list"}
              </Button>
              <p className="text-xs text-ec-body-faint">
                This page holds personal data of guests. Do not pass the
                password or the export on to anyone else.
              </p>
            </form>
          </div>
        </section>
      </Layout>
    );
  }

  if (phase === "error") {
    return (
      <Layout>
        {head}
        <section className="bg-white py-20 lg:py-24">
          <div className="container max-w-md">
            {pageHeading}
            <div className="bg-white border border-ec-line-3 rounded-2xl p-8 shadow-sm space-y-5">
              <p role="alert" className="text-sm text-ec-body-strong">
                {message}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => void load(input)}
                  disabled={busy}
                  className="bg-ec-red hover:bg-ec-red-hover text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  {busy ? "Trying..." : "Try again"}
                </Button>
                <Button type="button" variant="outline" onClick={lock}>
                  Use another password
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {head}
      <section className="bg-white py-16 lg:py-20">
        <div className="container max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-ec-navy mb-2">
                Registrations
              </h1>
              <p className="text-ec-body text-sm">{EVENT_TITLE}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void load(input)}
                disabled={busy}
              >
                <RefreshCw
                  className={busy ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                />
                {busy ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                type="button"
                onClick={() => downloadCsv(rows)}
                disabled={rows.length === 0}
                className="bg-ec-red hover:bg-ec-red-hover text-white"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
              <Button type="button" variant="ghost" onClick={lock}>
                <Lock className="h-4 w-4" />
                Lock
              </Button>
            </div>
          </div>

          <p
            className="text-ec-navy font-heading text-lg font-semibold mb-4"
            data-testid="registration-count"
          >
            {rows.length === 1
              ? "1 registration"
              : `${rows.length} registrations`}
          </p>

          {rows.length === 0 ? (
            <div className="bg-ec-surface border border-ec-line-3 rounded-2xl p-10 text-center">
              <p className="text-ec-navy font-medium mb-1">
                Nobody has signed up yet.
              </p>
              <p className="text-ec-body text-sm">
                New registrations appear here as soon as the form is submitted.
              </p>
            </div>
          ) : (
            /* The table is wider than a phone, so it scrolls inside its own box
               and the page itself never scrolls sideways. */
            <div className="w-full overflow-x-auto rounded-2xl border border-ec-line-3 bg-white shadow-sm">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="bg-ec-surface">
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Company</th>
                    <th className={thClass}>Role</th>
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Country</th>
                    <th className={thClass}>Invited by</th>
                    <th className={thClass}>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={`${row.email ?? "row"}-${row.occurred_at ?? index}`}
                      className="border-t border-ec-line"
                    >
                      <td className={`${tdClass} whitespace-nowrap`}>
                        {formatDate(row.occurred_at)}
                      </td>
                      <td className={`${tdClass} text-ec-navy font-medium`}>
                        {row.full_name || ""}
                      </td>
                      <td className={tdClass}>{row.company || ""}</td>
                      <td className={tdClass}>{row.role || ""}</td>
                      <td className={tdClass}>
                        {row.email ? (
                          <a
                            href={`mailto:${row.email}`}
                            className="text-ec-sky-ink hover:underline"
                          >
                            {row.email}
                          </a>
                        ) : (
                          ""
                        )}
                      </td>
                      <td className={tdClass}>{row.country || ""}</td>
                      <td className={tdClass}>{row.invited_by || ""}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>
                        {row.phone || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-ec-body-faint mt-6">
            Names, work addresses and employers of guests. Treat the export as
            personal data.
          </p>
        </div>
      </section>
    </Layout>
  );
}
