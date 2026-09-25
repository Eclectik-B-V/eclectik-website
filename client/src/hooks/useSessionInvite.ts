import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  isSessionInviteClosed,
  SESSION_CLOSED_PATH,
  SESSION_INVALID_PATH,
} from "@/data/sessionInvite";

/**
 * Het verkeer van de tokenpagina's naar api/s/. Zowel de hook als de losse
 * submit-functie staan hier: het zijn twee kanten van hetzelfde contract, en
 * ze uit elkaar trekken zou betekenen dat het afhandelen van `unknown_token`
 * en `closed` op twee plekken onderhouden moet worden.
 *
 * De endpoints zelf worden door een andere agent gebouwd. Wat ze teruggeven
 * staat in docs/superpowers/specs/2026-09-25-glint-user-session-design.md.
 */

const CONFIRM_ENDPOINT = "/api/s/confirm";
const SUBMIT_ENDPOINT = "/api/s/submit";

export type SessionAnswer = "yes" | "no";

export type SessionConfirmState =
  | { status: "pending" }
  /** firstName is null als de BD-kant geen voornaam kent. Dan geen aanhef. */
  | { status: "ready"; firstName: string | null };

interface SessionApiResponse {
  ok?: boolean;
  firstName?: string | null;
  reason?: string;
}

/** Leest het antwoord uit, ook als de functie iets anders dan json teruggaf. */
async function readResponse(response: Response): Promise<SessionApiResponse | null> {
  try {
    return (await response.json()) as SessionApiResponse;
  } catch {
    return null;
  }
}

/**
 * Bevestigt bij mount het antwoord dat bij deze pagina hoort.
 *
 * Dit is laag twee van de afweer tegen linkscanners. De klik op de knop in de
 * mail schrijft alleen een provisioneel antwoord, want een scanner van een
 * mailfilter haalt die url net zo goed op. Een scanner voert geen JavaScript
 * uit, dus deze POST komt alleen van een echte browser, en pas hij zet het
 * antwoord definitief.
 *
 * De confirm doet ook de aanhef: de pagina kent het token, verder niets.
 */
export function useSessionConfirm(
  token: string | undefined,
  answer: SessionAnswer,
): SessionConfirmState {
  const [, navigate] = useLocation();
  const [state, setState] = useState<SessionConfirmState>({ status: "pending" });

  useEffect(() => {
    if (!token) {
      navigate(SESSION_INVALID_PATH, { replace: true });
      return;
    }

    if (isSessionInviteClosed()) {
      navigate(SESSION_CLOSED_PATH, { replace: true });
      return;
    }

    let cancelled = false;

    void (async () => {
      let data: SessionApiResponse | null = null;

      try {
        const response = await fetch(CONFIRM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, answer }),
        });
        data = await readResponse(response);
      } catch {
        // Netwerkfout. Hieronder valt hij in dezelfde tak als een antwoord dat
        // we niet herkennen: pagina open, geen aanhef.
        data = null;
      }

      if (cancelled) return;

      if (data?.reason === "unknown_token") {
        navigate(SESSION_INVALID_PATH, { replace: true });
        return;
      }
      if (data?.reason === "closed") {
        navigate(SESSION_CLOSED_PATH, { replace: true });
        return;
      }

      // Alles wat geen van beide is, ook een hapering in het netwerk, laat de
      // pagina gewoon opengaan. Wie een slechte verbinding heeft naar
      // /s/invalid sturen zou een werkende uitnodiging als kapot presenteren,
      // en versturen kan daarna alsnog lukken.
      const firstName = typeof data?.firstName === "string" && data.firstName.trim() !== ""
        ? data.firstName
        : null;
      setState({ status: "ready", firstName });
    })();

    return () => {
      cancelled = true;
    };
  }, [token, answer, navigate]);

  return state;
}

export type SessionSubmitOutcome = "ok" | "unknown_token" | "closed" | "failed";

/**
 * Stuurt de gekozen momenten en de open vraag door.
 *
 * Nul momenten versturen mag: dat iemand wel wil maar op geen van de drie
 * kan is precies zo bruikbaar als een lijstje vinkjes.
 */
export async function submitSessionInvite(
  token: string,
  slots: string[],
  note: string,
): Promise<SessionSubmitOutcome> {
  const trimmed = note.trim();

  try {
    const response = await fetch(SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, slots, note: trimmed === "" ? null : trimmed }),
    });
    const data = await readResponse(response);

    if (data?.ok === true) return "ok";
    if (data?.reason === "unknown_token") return "unknown_token";
    if (data?.reason === "closed") return "closed";
    return "failed";
  } catch {
    return "failed";
  }
}
