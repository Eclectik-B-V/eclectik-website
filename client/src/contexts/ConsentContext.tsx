import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { applyConsent, readConsent, writeConsent, type ConsentCategories } from "@/lib/consent";

export type SaveResult = {
  /** true als de pagina herlaadt omdat marketing-consent is ingetrokken */
  reloading: boolean;
};

interface ConsentContextType {
  /** null betekent: de bezoeker heeft nog geen geldige keuze gemaakt */
  categories: ConsentCategories | null;
  /** true zolang de banner getoond moet worden */
  needsChoice: boolean;
  saveConsent: (categories: ConsentCategories) => SaveResult;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  // document.cookie is synchroon leesbaar en dit is een SPA zonder SSR, dus we
  // lezen meteen bij de eerste render. Dat scheelt een extra render en maakt
  // een flits van de banner onmogelijk in plaats van onwaarschijnlijk.
  const [categories, setCategories] = useState<ConsentCategories | null>(
    () => readConsent()?.categories ?? null,
  );

  // saveConsent mag niet afhangen van de render-cyclus. Twee klikken binnen een
  // tick zouden anders allebei dezelfde verouderde waarde als `previous` zien,
  // en dan wordt een intrekking van marketing gemist. Deze ref is de enige
  // bron van waarheid voor "wat stond er net", en saveConsent is de enige
  // plek die hem bijwerkt.
  const latest = useRef<ConsentCategories | null>(categories);

  const saveConsent = useCallback((next: ConsentCategories): SaveResult => {
    const previous = latest.current;
    latest.current = next;

    writeConsent(next);
    applyConsent(next);
    setCategories(next);

    // De LinkedIn Insight Tag laat zich niet ontladen zodra hij in de pagina
    // zit. Trekt iemand marketing-consent in terwijl de tag al draait, dan is
    // herladen de enige manier om hem echt kwijt te raken.
    const reloading = previous?.marketing === true && next.marketing === false;
    if (reloading) {
      window.location.reload();
    }

    return { reloading };
  }, []);

  const value = useMemo<ConsentContextType>(
    () => ({
      categories,
      needsChoice: categories === null,
      saveConsent,
    }),
    [categories, saveConsent],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextType {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent moet binnen een ConsentProvider gebruikt worden");
  }
  return context;
}
