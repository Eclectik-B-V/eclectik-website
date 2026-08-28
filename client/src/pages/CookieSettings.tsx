import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";

export default function CookieSettings() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true
  });

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    // In a real implementation, this would save to localStorage or a cookie management system
    console.log("Saving cookie preferences:", preferences);
    // Show success message or toast here
  };

  return (
    <Layout>
      <Helmet>
        <title>Cookie Settings - Eclectik</title>
        <meta name="description" content="Manage your cookie preferences for the Eclectik website." />
      </Helmet>
      
      <div className="bg-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-ec-navy">Cookie Settings</h1>
            <p className="text-lg leading-[1.6] text-ec-body max-w-2xl mx-auto">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. You can manage your preferences below.
            </p>
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

            <div className="flex justify-end pt-6">
              <Button size="lg" onClick={handleSave} className="rounded-full bg-ec-sky text-ec-navy font-bold px-8 hover:bg-[#54b4cb]">
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
