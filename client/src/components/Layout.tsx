import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [footerEmail, setFooterEmail] = useState("");
  const [footerSubmitting, setFooterSubmitting] = useState(false);
  const [footerConsent, setFooterConsent] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (footerSubmitting) return;
    setFooterSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: footerEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Subscription failed");
      }
      toast.success("Thanks for subscribing!");
      setFooterEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setFooterSubmitting(false);
    }
  };

  const navLinks: { name: string; href: string; dropdown?: { name: string; href: string }[] }[] = [
    { name: "Benchmark", href: "/benchmark" },
    { name: "Insights", href: "/insights" },
    {
      name: "HR Tech Services",
      href: "/hrtechservices",
      dropdown: [
        { name: "Customer Success", href: "/services/customer-success" },
        { name: "People Science", href: "/services/people-science" },
        { name: "Change Management", href: "/services/change-management" },
        { name: "People Success Academy", href: "/training/people-success-academy" },
        { name: "Training & Enablement", href: "/training/enablement" },
        { name: "Executive Coaching", href: "/training/executive-coaching" },
      ],
    },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          isScrolled ? "bg-background/80 backdrop-blur-md border-white/10 py-6" : "bg-transparent py-8"
        )}
      >
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/images/eclectik-logo-white-photo.svg" alt="Eclectik - Insights that accelerate AI Transformation" className="h-16 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.name} className="relative group">
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1" style={{fontSize: '16px'}}>
                    {link.name}
                  </Link>
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-background/95 backdrop-blur-md border border-white/10 rounded-md shadow-lg overflow-hidden p-2 flex flex-col gap-1">
                      {link.dropdown.map((item) => (
                        <Link key={item.name} href={item.href} className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-white/5 rounded-sm transition-colors">
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group" style={{fontSize: '16px'}}>
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            ))}
            {/* Login/Logout Button - Temporarily disabled due to OAuth platform issues */}
            <Link href="/scorecard">
              <Button className="bg-primary text-background hover:bg-primary/90 font-semibold">
                Take the scorecard
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed left-0 right-0 bottom-0 z-40 bg-background backdrop-blur-xl transition-transform duration-500 lg:hidden flex flex-col justify-start items-center gap-4 pt-8 pb-8 overflow-y-auto",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ top: '180px' }}
      >
        {navLinks.map((link) => (
          link.dropdown ? (
            <div key={link.name} className="flex flex-col items-center gap-2">
              <span className="text-xl font-heading font-bold text-muted-foreground">{link.name}</span>
              {link.dropdown.map((item) => (
                <Link key={item.name} href={item.href} className="text-base font-heading font-medium hover:text-primary transition-colors text-center px-4">
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            <Link key={link.name} href={link.href} className="text-xl font-heading font-bold hover:text-primary transition-colors">
              {link.name}
            </Link>
          )
        ))}
        <Link href="/scorecard">
          <Button className="bg-primary text-background hover:bg-primary/90 font-semibold">
            Take the scorecard
          </Button>
        </Link>
        {/* Mobile Auth Button - Temporarily disabled due to OAuth platform issues */}
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 pt-20 pb-10">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            <div className="space-y-6">
              <div className="flex items-center">
                <img src="/images/eclectik-logo-white-photo.svg" alt="Eclectik" className="h-14 w-auto" />
              </div>
              <p className="text-muted-foreground max-w-xs">
                The independent authority on whether AI transformation is working. Proof of value
                in the P&amp;L, proof of change in the workforce.
              </p>
            </div>

            <div className="lg:pl-8">
              <h4 className="font-heading font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/insights" className="text-muted-foreground hover:text-primary transition-colors">Insights</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-lg mb-6">HR Tech Services</h4>
              <ul className="space-y-4">
                <li><Link href="/hrtechservices" className="text-muted-foreground hover:text-primary transition-colors">HR Tech Services</Link></li>
                <li><Link href="/services/customer-success" className="text-muted-foreground hover:text-primary transition-colors">Customer Success</Link></li>
                <li><Link href="/services/people-science" className="text-muted-foreground hover:text-primary transition-colors">People Science</Link></li>
                <li><Link href="/services/change-management" className="text-muted-foreground hover:text-primary transition-colors">Change Management</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-lg mb-6">Trust</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="/documents/iso-27001-certificate.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    ISO 27001
                  </a>
                </li>
                <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy policy</Link></li>
                <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Terms of service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-lg mb-6">Stay updated</h4>
              <p className="text-muted-foreground mb-4">Evidence on AI transformation, monthly.</p>
              <form onSubmit={handleFooterSubscribe} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="Your email"
                    className="bg-white/5 border border-white/10 rounded-md px-4 py-2 w-full focus:outline-none focus:border-primary transition-colors"
                  />
                  <Button type="submit" size="icon" className="shrink-0" disabled={footerSubmitting || !footerConsent}>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={footerConsent}
                    onChange={(e) => setFooterConsent(e.target.checked)}
                    className="mt-0.5 accent-[#65C1D6]"
                  />
                  <span>I agree to receive the Eclectik newsletter. Unsubscribe anytime.</span>
                </label>
              </form>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2026 Eclectik B.V. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookie-settings" className="hover:text-white transition-colors">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
