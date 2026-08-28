import { Link } from "wouter";

const SERVICES = [
  { name: "Consulting", href: "/consulting" },
  { name: "Training", href: "/training" },
  { name: "Solutions", href: "/solutions" },
];

const COMPANY = [
  { name: "About Us", href: "/about" },
  { name: "Sectors", href: "/sectors" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

const LINK_CLASS =
  "hover:text-ec-red transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy";

/** Footer for the 2026 design: white surface, two link columns, legal strip. */
export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-ec-line px-6 py-14 sm:px-16">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-[300px]">
            <img
              src="/images/eclectik-logo-dark-photo.svg"
              alt="Eclectik"
              className="h-10 w-auto block mb-3"
            />
            <p className="text-sm text-ec-body-faint">
              Independent AI transformation assurance. ISO 27001 certified.
            </p>
          </div>

          <div className="flex gap-14 text-sm text-ec-body">
            <div className="flex flex-col gap-2.5">
              <span className="font-brand font-semibold text-ec-navy">Services</span>
              {SERVICES.map((link) => (
                <Link key={link.name} href={link.href} className={LINK_CLASS}>
                  {link.name}
                </Link>
              ))}
              <a href="#hr-services" className={LINK_CLASS}>
                HR Services
              </a>
              <Link href="/hrtechservices" className={LINK_CLASS}>
                HR Tech Services
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-brand font-semibold text-ec-navy">Company</span>
              {COMPANY.map((link) => (
                <Link key={link.name} href={link.href} className={LINK_CLASS}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal strip. Not in the artboard, but the site cannot ship without it. */}
        <div className="mt-12 pt-6 border-t border-ec-line flex flex-col gap-3 text-xs text-ec-body-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Eclectik B.V. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <a
              href="/documents/iso-27001-certificate.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={LINK_CLASS}
            >
              ISO 27001
            </a>
            <Link href="/privacy-policy" className={LINK_CLASS}>
              Privacy policy
            </Link>
            <Link href="/terms-of-service" className={LINK_CLASS}>
              Terms of service
            </Link>
            <Link href="/cookie-settings" className={LINK_CLASS}>
              Cookie settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
