import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { EVENT_CONFIRM_INVALID_PATH } from "@/data/eventConfirm";

/**
 * Het verkeer van /e/:token naar api/e/. Beide kanten van hetzelfde contract
 * staan hier, om dezelfde reden als in useSessionInvite.ts: het afhandelen van
 * `unknown_token` en `closed` hoort op één plek thuis.
 */

const LOOKUP_ENDPOINT = "/api/e/lookup";
const ANSWER_ENDPOINT = "/api/e/answer";

export type EventAnswer = "yes" | "no";

export type EventLookupState =
  | { status: "pending" }
  /** firstName is null als de BD-kant geen voornaam kent. Dan geen aanhef. */
  | { status: "ready"; firstName: string | null };

interface EventApiResponse {
  ok?: boolean;
  firstName?: string | null;
  reason?: string;
}

async function readResponse(response: Response): Promise<EventApiResponse | null> {
  try {
    return (await response.json()) as EventApiResponse;
  } catch {
    return null;
  }
}

/**
 * Haalt bij mount de voornaam op.
 *
 * Schrijft niets, anders dan useSessionConfirm. Daar was de klik in de mail al
 * een antwoord en moest een tweede, door JavaScript uitgevoerde call
 * bevestigen dat er een mens achter zat. Hier staan de twee antwoorden als
 * knoppen op de pagina, dus een mailscanner die de link ophaalt legt niets
 * vast en is die laag niet nodig.
 */
export function useEventLookup(token: string | undefined): EventLookupState {
  const [, navigate] = useLocation();
  const [state, setState] = useState<EventLookupState>({ status: "pending" });

  useEffect(() => {
    if (!token) {
      navigate(EVENT_CONFIRM_INVALID_PATH, { replace: true });
      return;
    }

    let cancelled = false;

    void (async () => {
      let data: EventApiResponse | null = null;
      try {
        const response = await fetch(LOOKUP_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        data = await readResponse(response);
      } catch {
        data = null;
      }

      if (cancelled) return;

      if (data?.reason === "unknown_token" || data?.reason === "closed") {
        navigate(EVENT_CONFIRM_INVALID_PATH, { replace: true });
        return;
      }

      // Alles wat geen van beide is, ook een hapering in het netwerk, laat de
      // pagina gewoon opengaan. Iemand met een slechte verbinding naar
      // /e/invalid sturen zou een werkende uitnodiging als kapot presenteren,
      // en antwoorden kan daarna alsnog lukken.
      const firstName =
        typeof data?.firstName === "string" && data.firstName.trim() !== ""
          ? data.firstName
          : null;
      setState({ status: "ready", firstName });
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return state;
}

export type EventAnswerOutcome = "ok" | "unknown_token" | "closed" | "failed";

/** Legt het antwoord vast. */
export async function answerEventConfirm(
  token: string,
  answer: EventAnswer
): Promise<EventAnswerOutcome> {
  try {
    const response = await fetch(ANSWER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answer }),
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
