import { useState } from "react";
import { Link } from "wouter";
import { trackCTAClick } from "@/lib/tracking";

const NAV_LINKS = [
  { name: "Consulting", href: "/consulting" },
  { name: "Training", href: "/training" },
  { name: "Solutions", href: "/solutions" },
];

const PILL_BASE =
  "rounded-full font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky";

/**
 * Header for the 2026 design. On desktop it sits over the hero video as a
 * transparent row; on mobile it is a solid navy bar that sticks to the top,
 * with a slide-down menu underneath it.
 */
export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Desktop: transparent row layered over the hero video */}
      <div className="hidden shell:flex absolute inset-x-0 top-0 z-30 items-center justify-between px-16 py-[26px]">
        <Link href="/" className="flex-none" aria-label="Eclectik, naar de homepage">
          <img
            src="/images/eclectik-logo-white-photo.svg"
            alt="Eclectik"
            className="h-[34px] w-auto block"
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-[26px] gap-y-[18px] ml-10 text-[15px] text-ec-on-dark-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="whitespace-nowrap hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
            >
              {link.name}
            </Link>
          ))}
          <a
            href="#hr-services"
            className="whitespace-nowrap hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            HR Services
          </a>
          <Link
            href="/benchmark"
            onClick={() => trackCTAClick("Join the benchmark waiting list", "header")}
            className={`${PILL_BASE} bg-ec-sky text-ec-navy px-5 py-2.5 hover:bg-[#54b4cb]`}
          >
            Join the benchmark waiting list
          </Link>
          <Link
            href="/scorecard"
            onClick={() => trackCTAClick("Take the scorecard", "header")}
            className={`${PILL_BASE} bg-ec-yellow text-ec-navy px-5 py-2.5 hover:bg-[#ebb100]`}
          >
            Take the scorecard
          </Link>
        </nav>
      </div>

      {/* Mobile: solid sticky bar */}
      <div className="shell:hidden sticky top-0 z-40 bg-ec-navy">
        <div className="flex items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex-none" aria-label="Eclectik, naar de homepage">
            <img
              src="/images/eclectik-logo-white-photo.svg"
              alt="Eclectik"
              className="h-[26px] w-auto block"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="w-11 h-11 -mr-2 flex flex-col items-center justify-center gap-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky"
          >
            <span className="block w-[22px] h-0.5 bg-ec-on-dark" />
            <span className="block w-[22px] h-0.5 bg-ec-on-dark" />
            <span className="block w-[22px] h-0.5 bg-ec-on-dark" />
          </button>
        </div>

        {menuOpen && (
          <div
            id="site-mobile-menu"
            className="bg-ec-navy border-t border-ec-navy-line px-5 pt-2 pb-[22px]"
          >
            <a
              href="#proof"
              onClick={closeMenu}
              className="flex items-center justify-between py-3.5 text-[17px] text-ec-on-dark border-b border-ec-navy-line"
            >
              Proof of value &amp; change
            </a>
            <a
              href="#hr-services"
              onClick={closeMenu}
              className="flex items-center justify-between gap-3 py-3.5 text-[17px] text-ec-on-dark border-b border-ec-navy-line"
            >
              <span className="font-semibold">HR Services</span>
              <span className="text-[11px] uppercase tracking-[0.1em] font-bold text-ec-sky">
                Glint · Seer
              </span>
            </a>
            <a
              href="#benchmark"
              onClick={closeMenu}
              className="flex items-center justify-between py-3.5 text-[17px] text-ec-on-dark border-b border-ec-navy-line"
            >
              Benchmark
            </a>
            <Link
              href="/about"
              onClick={closeMenu}
              className="flex items-center justify-between py-3.5 text-[17px] text-ec-on-dark border-b border-ec-navy-line"
            >
              About us
            </Link>
            <div className="flex flex-col gap-2.5 pt-[22px]">
              <Link
                href="/benchmark"
                onClick={() => {
                  trackCTAClick("Join the benchmark waiting list", "mobile-menu");
                  closeMenu();
                }}
                className={`${PILL_BASE} bg-ec-sky text-ec-navy text-center px-5 py-3.5`}
              >
                Join the benchmark waiting list
              </Link>
              <Link
                href="/scorecard"
                onClick={() => {
                  trackCTAClick("Take the scorecard", "mobile-menu");
                  closeMenu();
                }}
                className={`${PILL_BASE} bg-ec-yellow text-ec-navy text-center px-5 py-3.5`}
              >
                Take the scorecard
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
