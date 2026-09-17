import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useConsent } from "@/contexts/ConsentContext";
import { ACCEPT_ALL, DENY_ALL, type ConsentCategories } from "@/lib/consent";

export default function CookieSettings() {
  const { categories, needsChoice, saveConsent } = useConsent();
  // De provider leest de cookie synchroon bij de eerste render, dus `categories`
  // klopt hier meteen. Er is geen naloop-effect nodig.
  const [preferences, setPreferences] = useState<ConsentCategories>(categories ?? DENY_ALL);
  const [reloadPending, setReloadPending] = useState(false);

  const stored = categories ?? DENY_ALL;
  const hasUnsavedChanges =
    preferences.analytics !== stored.analytics ||
    preferences.marketing !== stored.marketing ||
    preferences.functional !== stored.functional;

  // Zonder opgeslagen keuze mag de bezoeker ook bewust "alles uit" vastleggen,
  // dus dan is opslaan altijd zinvol.
  const canSave = needsChoice || hasUnsavedChanges;

  // Dekt het sluiten van de tab en navigatie buiten de site. Klikken op een
  // interne link gaat via wouter en veroorzaakt geen unload, dus daarvoor is de
  // zichtbare waarschuwing hieronder het vangnet.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  const handleToggle = (key: keyof ConsentCategories) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const persist = (next: ConsentCategories) => {
    setPreferences(next);
    const { reloading } = saveConsent(next);
    if (reloading) {
      // De pagina herlaadt om de LinkedIn-tag echt kwijt te raken. Een toast
      // zou daar middenin verdwijnen, dus we tonen hem niet.
      setReloadPending(true);
      return;
    }
    toast.success("Your cookie preferences have been saved.");
  };

  const handleSave = () => persist(preferences);

  return (
    <Layout>
      <title>Cookie Settings - Eclectik</title>
      <meta name="description" content="Manage your cookie preferences for the Eclectik website." />
      
      <div className="bg-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-ec-navy">Cookie Settings</h1>
            <p className="text-lg leading-[1.6] text-ec-body max-w-2xl mx-auto">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. You can manage your preferences below.
            </p>
            {needsChoice && (
              <p className="mt-4 text-sm text-ec-navy/70">
                You have not made a choice yet. Everything below is switched off by default, and
                nothing is stored until you save.
              </p>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Essential Cookies */}
            <Card className="bg-ec-surface border-ec-line shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-ec-sky/20 rounded-lg h-fit">
                    <Shield className="w-6 h-6 text-ec-sky-ink" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-ec-navy">Essential Cookies</CardTitle>
                    <CardDescription className="text-ec-body leading-[1.65] mt-2">
                      These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
                    </CardDescription>
                  </div>
                </div>
                <Switch checked={true} disabled={true} />
              </CardHeader>
            </Card>

            {/* Analytics Cookies */}
            <Card className="bg-ec-surface border-ec-line shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-ec-teal/20 rounded-lg h-fit">
                    <BarChart3 className="w-6 h-6 text-ec-teal-ink" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-ec-navy">Analytics Cookies</CardTitle>
                    <CardDescription className="text-ec-body leading-[1.65] mt-2">
                      These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                    </CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={() => handleToggle('analytics')} 
                />
              </CardHeader>
            </Card>

            {/* Marketing Cookies */}
            <Card className="bg-ec-surface border-ec-line shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-ec-red/10 rounded-lg h-fit">
                    <Megaphone className="w-6 h-6 text-ec-red" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-ec-navy">Marketing Cookies</CardTitle>
                    <CardDescription className="text-ec-body leading-[1.65] mt-2">
                      These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
                    </CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={() => handleToggle('marketing')} 
                />
              </CardHeader>
            </Card>

            {/* Functional Cookies */}
            <Card className="bg-ec-surface border-ec-line shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-4">
                  <div className="mt-1 p-2 bg-ec-yellow/25 rounded-lg h-fit">
                    <Cookie className="w-6 h-6 text-ec-navy" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-ec-navy">Functional Cookies</CardTitle>
                    <CardDescription className="text-ec-body leading-[1.65] mt-2">
                      These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages.
                    </CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={preferences.functional} 
                  onCheckedChange={() => handleToggle('functional')} 
                />
              </CardHeader>
            </Card>

            <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  disabled={reloadPending}
                  onClick={() => persist(DENY_ALL)}
                  className="rounded-full border border-ec-navy/20 text-ec-navy px-6 font-medium hover:bg-ec-navy/5"
                >
                  Reject all
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  disabled={reloadPending}
                  onClick={() => persist(ACCEPT_ALL)}
                  className="rounded-full border border-ec-navy/20 text-ec-navy px-6 font-medium hover:bg-ec-navy/5"
                >
                  Accept all
                </Button>
              </div>
              <div className="flex items-center gap-4">
                {hasUnsavedChanges && (
                  <p role="status" className="text-sm font-medium text-ec-navy">
                    You have unsaved changes.
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={!canSave || reloadPending}
                  className="rounded-full bg-ec-sky text-ec-navy font-bold px-8 hover:bg-[#54b4cb]"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
