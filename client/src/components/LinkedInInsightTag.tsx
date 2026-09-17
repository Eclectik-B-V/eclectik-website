import { useEffect } from "react";
import { useConsent } from "@/contexts/ConsentContext";

const PARTNER_ID = "9108033";
const SCRIPT_ID = "linkedin-insight-tag";

/**
 * De LinkedIn Insight Tag kent Google Consent Mode niet en zet zijn cookies
 * ongeacht het ad_storage-signaal. Daarom injecteren we hem pas nadat de
 * bezoeker marketing-cookies heeft geaccepteerd.
 *
 * Rendert niets.
 */
export default function LinkedInInsightTag() {
  const { categories } = useConsent();
  const marketingAllowed = categories?.marketing === true;

  useEffect(() => {
    if (!marketingAllowed) return;
    if (document.getElementById(SCRIPT_ID)) return;

    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(PARTNER_ID);

    // Wachtrij zodat conversies die vlak na de toestemming worden gemeld niet
    // verloren gaan voordat het script binnen is.
    if (!window.lintrk) {
      const queue: any[][] = [];
      const shim: NonNullable<Window["lintrk"]> = (...args: any[]) => {
        queue.push(args);
      };
      shim.q = queue;
      window.lintrk = shim;
    }
    const ourShim = window.lintrk;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    script.addEventListener("error", () => {
      // Geblokkeerd door een adblocker, of LinkedIn is onbereikbaar. De shim
      // weghalen zorgt dat trackLinkedInConversion stil niets doet, in plaats
      // van conversies voor altijd in een wachtrij te laten staan die nooit
      // geleegd wordt.
      console.warn("[consent] LinkedIn Insight Tag kon niet laden");
      if (window.lintrk === ourShim) {
        window.lintrk = undefined;
      }
    });
    document.head.appendChild(script);
  }, [marketingAllowed]);

  return null;
}
