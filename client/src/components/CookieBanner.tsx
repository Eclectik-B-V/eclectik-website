import { useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/contexts/ConsentContext";
import { ACCEPT_ALL, DENY_ALL } from "@/lib/consent";

export default function CookieBanner() {
  const { needsChoice, saveConsent } = useConsent();
  const [location] = useLocation();
  const bannerRef = useRef<HTMLDivElement>(null);

  // Op de voorkeurenpagina zou de banner de opslaan-knop overlappen. De keuze
  // wordt daar sowieso gemaakt, dus daar blijft hij weg.
  const visible = needsChoice && location !== "/cookie-settings";

  // De banner staat fixed onderaan en dekt anders de laatste rij van de footer
  // af, inclusief de link naar de cookie-instellingen. Zolang hij in beeld is
  // krijgt de pagina er onderaan precies evenveel ruimte bij, zodat alles
  // bereikbaar blijft door te scrollen.
  useEffect(() => {
    const node = bannerRef.current;
    if (!visible || !node) return;

    const sync = () => {
      document.body.style.paddingBottom = `${node.offsetHeight}px`;
    };
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(node);

    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto border-t border-ec-navy-line bg-ec-navy"
    >
      <div className="container mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/80">
          We use cookies to analyse our traffic and to measure our marketing. You decide what we may
          use. Read more in our{" "}
          <Link href="/privacy-policy" className="underline transition-colors hover:text-ec-sky">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button
            variant="ghost"
            size="lg"
            asChild
            className="rounded-full border border-white/30 text-white px-6 font-medium hover:bg-white/10 hover:text-white"
          >
            <Link href="/cookie-settings">Manage preferences</Link>
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-ec-sky text-ec-navy font-bold px-8 hover:bg-[#54b4cb]"
            onClick={() => saveConsent(DENY_ALL)}
          >
            Essential only
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-ec-sky text-ec-navy font-bold px-8 hover:bg-[#54b4cb]"
            onClick={() => saveConsent(ACCEPT_ALL)}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
