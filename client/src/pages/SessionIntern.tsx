import { useState } from "react";
import SessionShell, {
  SessionBody,
  SessionHeading,
  SessionNoteField,
  SessionSendButton,
  SessionSendError,
} from "@/components/SessionShell";
import { SESSION_COPY, SESSION_SLOTS } from "@/data/sessionInvite";

/**
 * /s/intern, de interne versie van de Ja-pagina.
 *
 * Een collega van CS of PS meldt hier iemand aan die in een call of per mail
 * heeft gezegd dat hij mee wil doen. De aanmelding komt in dezelfde tabel als
 * die via de mail, zodat de telling per datum klopt.
 *
 * Het wachtwoord staat in sessionStorage en gaat mee in elke post. De echte
 * controle gebeurt op de server in api/s/intern.ts; dit scherm houdt alleen de
 * pagina dicht voor wie het adres toevallig kent. Zelfde opzet als
 * EventAmsterdam2026Registrations.tsx.
 *
 * De datums komen uit SESSION_SLOTS, dezelfde bron als de klantpagina. Wijzigt
 * een datum, dan wijzigt hij hier mee.
 */

const STORAGE_KEY = "eclectik_session_intern_v1";

/** Een privevenster kan op lezen en schrijven gooien, dus allebei ingepakt. */
function loadPassword(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function savePassword(value: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Dan houdt het wachtwoord het één tabblad lang vol in de state hieronder.
  }
}

interface Existing {
  answer: string | null;
  slots: string[];
  note: string | null;
}

type Phase = "locked" | "form" | "confirm" | "done";

const C = SESSION_COPY.intern;

/** De labels van de aangevinkte momenten, voor het bevestigingsscherm. */
function slotLabels(ids: string[]): string {
  const labels = SESSION_SLOTS.filter((s) => ids.includes(s.id)).map((s) => s.date);
  return labels.length > 0 ? labels.join(", ") : C.emptyExisting;
}

export default function SessionIntern() {
  const [password, setPassword] = useState(loadPassword);
  const [phase, setPhase] = useState<Phase>(loadPassword() ? "form" : "locked");
  const [lockError, setLockError] = useState(false);

  const [email, setEmail] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [ticked, setTicked] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [byError, setByError] = useState(false);
  const [existing, setExisting] = useState<Existing | null>(null);
  const [registered, setRegistered] = useState("");

  function toggle(id: string) {
    setTicked((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  }

  /** Eén post, met of zonder bevestiging om te overschrijven. */
  async function send(confirmOverwrite: boolean) {
    setSending(true);
    setFailed(false);
    setByError(false);
    try {
      const r = await fetch("/api/s/intern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          email,
          registeredBy,
          slots: ticked,
          note: note.trim() ? note.trim() : null,
          confirmOverwrite,
        }),
      });
      const body = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        existing?: Existing;
      };

      if (body.ok) {
        setRegistered(email.trim().toLowerCase());
        setPhase("done");
        return;
      }
      if (body.reason === "needs_confirm" && body.existing) {
        setExisting(body.existing);
        setPhase("confirm");
        return;
      }
      if (body.reason === "unauthorized") {
        savePassword("");
        setPassword("");
        setLockError(true);
        setPhase("locked");
        return;
      }
      if (body.reason === "not_a_colleague") {
        setByError(true);
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setEmail("");
    setTicked([]);
    setNote("");
    setExisting(null);
    setFailed(false);
    setPhase("form");
  }

  if (phase === "locked") {
    return (
      <SessionShell>
        <SessionHeading greeting={null} title={C.lockTitle} />
        <SessionBody>{C.lockIntro}</SessionBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!password) return;
            savePassword(password);
            setLockError(false);
            setPhase("form");
          }}
          noValidate
        >
          <label className="mt-7 block">
            <span className="block text-[15px] font-semibold">{C.lockLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="mt-2 w-full rounded-lg border border-ec-line-3 px-4 py-3 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
            />
          </label>
          {lockError && (
            <p className="mt-3 text-[15px] text-ec-red">{C.lockError}</p>
          )}
          <SessionSendButton label={C.lockSubmit} sending={false} />
        </form>
      </SessionShell>
    );
  }

  if (phase === "done") {
    return (
      <SessionShell>
        <SessionHeading greeting={null} title={C.doneTitle} />
        <SessionBody>{C.doneBody(registered)}</SessionBody>
        <button
          type="button"
          onClick={reset}
          className="mt-7 w-full rounded-full bg-ec-sky px-6 py-3.5 text-[16px] font-semibold text-ec-navy transition-colors hover:bg-[#54b4cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
        >
          {C.doneAgain}
        </button>
      </SessionShell>
    );
  }

  if (phase === "confirm" && existing) {
    return (
      <SessionShell>
        <SessionHeading greeting={null} title={C.confirmTitle} />
        <SessionBody>{C.confirmIntro}</SessionBody>
        <dl className="mt-6 rounded-lg border border-ec-line-3 bg-ec-cream px-4 py-4 text-[15px] leading-[1.6]">
          <dt className="font-semibold">Answer</dt>
          <dd className="mb-3">{existing.answer ?? C.emptyExisting}</dd>
          <dt className="font-semibold">Dates</dt>
          <dd className="mb-3">{slotLabels(existing.slots)}</dd>
          <dt className="font-semibold">Note</dt>
          <dd>{existing.note ?? C.emptyExisting}</dd>
        </dl>
        {/* SessionSendButton is een submit-knop, dus een form eromheen in
            plaats van een onClick. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(true);
          }}
        >
          <SessionSendButton label={C.confirmSubmit} sending={sending} />
          {failed && <SessionSendError />}
        </form>
        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full text-[15px] underline underline-offset-2"
        >
          {C.confirmCancel}
        </button>
      </SessionShell>
    );
  }

  return (
    <SessionShell>
      <SessionHeading greeting={null} title={C.title} />
      <SessionBody>{C.intro}</SessionBody>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(false);
        }}
        noValidate
      >
        <label className="mt-7 block">
          <span className="block text-[15px] font-semibold">{C.emailLabel}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ec-line-3 px-4 py-3 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          />
        </label>

        <label className="mt-5 block">
          <span className="block text-[15px] font-semibold">{C.byLabel}</span>
          <input
            type="email"
            required
            value={registeredBy}
            onChange={(e) => setRegisteredBy(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ec-line-3 px-4 py-3 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          />
          <span className="mt-1.5 block text-[14px] text-ec-body">{C.byHint}</span>
        </label>
        {byError && <p className="mt-2 text-[15px] text-ec-red">{C.byError}</p>}

        <p className="mt-7 text-[15px] font-semibold">{C.slotsLabel}</p>
        {/* Zelfde vinkjes als op de klantpagina, uit dezelfde bron, zodat de
            waarden in de tabel identiek zijn. Versturen zonder datums mag. */}
        <div className="mt-3 flex flex-col gap-3">
          {SESSION_SLOTS.map((slot) => {
            const checked = ticked.includes(slot.id);
            return (
              <label
                key={slot.id}
                className={`flex min-h-[60px] cursor-pointer items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-colors ${
                  checked ? "border-ec-sky-ink bg-ec-cream" : "border-ec-line-3 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(slot.id)}
                  className="size-5 shrink-0 accent-ec-sky-ink"
                />
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold leading-[1.3]">
                    {slot.date}
                  </span>
                  <span className="mt-0.5 block text-[14px] leading-[1.3] text-ec-body">
                    {slot.times}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <SessionNoteField label={C.noteLabel} value={note} onChange={setNote} />
        <SessionSendButton label={C.submit} sending={sending} />
        {failed && <SessionSendError />}

        <p className="mt-5 text-[15px] leading-[1.6] text-ec-body">{C.note}</p>
      </form>
    </SessionShell>
  );
}
