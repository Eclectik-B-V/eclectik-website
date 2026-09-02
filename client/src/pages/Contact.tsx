import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/Layout";
import { ArrowRight, Linkedin, Instagram, Youtube, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use local worker served from public directory to avoid CSP issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ISO_CERT_URL = "/documents/iso-27001-certificate.pdf";

// ISO Certificate Modal
function IsoCertModal({ onClose }: { onClose: () => void }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ec-navy/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-ec-line-3 rounded-xl shadow-2xl w-[90vw] max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ec-line flex-shrink-0">
          <h2 className="text-base font-semibold text-ec-navy">ISO 27001 Certificaat — Eclectik B.V.</h2>
          <button
            onClick={onClose}
            className="text-ec-body hover:text-ec-navy transition-colors text-2xl leading-none ml-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        {/* PDF Viewer */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 px-4 bg-ec-surface">
          <Document
            file={ISO_CERT_URL}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-ec-body py-20">Certificaat laden...</div>}
            error={<div className="text-ec-red py-20">Kon het certificaat niet laden.</div>}
          >
            {Array.from(new Array(numPages), (_, i) => (
              <Page
                key={i + 1}
                pageNumber={i + 1}
                width={Math.min(window.innerWidth * 0.8, 750)}
                className="mb-4 shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const [showIsoCert, setShowIsoCert] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phone: "",
        message: "",
        consent: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact | Eclectik</title>
        <meta name="description" content="Get in touch with Eclectik. Subscribe to our newsletter for insights that matter or contact us directly to start your AI transformation." />
      </Helmet>

      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Flat light canvas — the old beacon rings only read on the dark theme. */}
        <div className="absolute inset-0 z-0 bg-white" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Content & Form */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="max-w-xl"
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-ec-navy">
                The information to <br />
                <span className="text-ec-red">accelerate transformation.</span>
              </h1>

              <p className="text-xl text-ec-body mb-12">
                Leave your contact details and a message behind and we will contact you soon.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
                      First Name*
                    </label>
                    <Input 
                      type="text" 
                      id="firstName" 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
                      Last Name*
                    </label>
                    <Input 
                      type="text" 
                      id="lastName" 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-muted-foreground">
                    Company Name*
                  </label>
                  <Input 
                    type="text" 
                    id="company" 
                    placeholder="Your Company Ltd." 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    className="bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                      Email Address*
                    </label>
                    <Input 
                      type="email" 
                      id="email" 
                      placeholder="john@company.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                      Mobile Phone
                    </label>
                    <Input 
                      type="tel" 
                      id="phone" 
                      placeholder="+1 (555) 000-0000" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                    Message
                  </label>
                  <textarea 
                    id="message" 
                    rows={4}
                    placeholder="How can we help you accelerate your AI transformation?" 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border-0 border-b border-ec-line-3 rounded-none px-0 py-4 text-lg text-ec-navy placeholder:text-ec-body-faint transition-colors resize-none focus:outline-none focus-visible:border-ec-sky focus-visible:ring-2 focus-visible:ring-ec-sky/40"
                  />
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <Checkbox 
                    id="consent" 
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    className="mt-1 border-ec-line-3 data-[state=checked]:bg-ec-sky data-[state=checked]:border-ec-sky data-[state=checked]:text-ec-navy"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent"
                      className="text-sm text-muted-foreground leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to receiving news from Eclectik and consent to Eclectik storing and processing my submitted information to provide said news.*
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-ec-body-faint leading-relaxed max-w-xs">
                    Protected by reCAPTCHA and the Google <a href="#" className="underline hover:text-ec-red">Privacy Policy</a> and <a href="#" className="underline hover:text-ec-red">Terms of Service</a> apply.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-ec-sky hover:bg-[#54b4cb] text-ec-navy font-bold px-8 rounded-full"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-ec-navy">Get in touch.</h2>

                <div className="flex flex-col gap-4">
                  <a href="mailto:info@eclectik.com" className="text-xl font-semibold text-ec-red hover:text-ec-red-hover transition-colors inline-flex items-center gap-2 border-b border-ec-red/30 pb-1 w-fit">
                    <Mail className="w-5 h-5" /> info@eclectik.com
                  </a>

                  <div className="flex gap-6 mt-4">
                    <a href="#" className="p-3 rounded-full bg-ec-surface text-ec-navy hover:bg-ec-line hover:text-ec-sky-ink transition-all">
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a href="#" className="p-3 rounded-full bg-ec-surface text-ec-navy hover:bg-ec-line hover:text-ec-red transition-all">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href="#" className="p-3 rounded-full bg-ec-surface text-ec-navy hover:bg-ec-line hover:text-ec-teal-ink transition-all">
                      <Youtube className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Certifications & Partners (Visual Balance).
                Navy panel on purpose: every partner and certification logo here is
                white artwork, so it needs a dark surface to stay visible. */}
            <div className="hidden lg:flex flex-col justify-start h-full min-h-[600px] rounded-2xl bg-ec-navy px-12 py-14">
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-ec-on-dark-caption">Certifications</h3>
                  <div className="flex gap-8 items-center flex-wrap">
                    <button onClick={() => setShowIsoCert(true)} className="flex flex-col items-center gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-sky" title="Bekijk ISO 27001 certificaat">
                       <img src="/images/brand-compliance-logo-final.png" alt="Brand Compliance Certified" className="h-12 w-auto opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer" />
                       <span className="text-xs text-ec-on-dark-caption group-hover:text-ec-sky transition-colors tracking-wide">Click to see certificate</span>
                     </button>
                    <img src="/images/white-microsoft-startups-logo-final.png" alt="Microsoft for Startups Founders Hub" className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-ec-on-dark-caption">Partners</h3>
                  <div className="flex gap-6 items-center flex-wrap">
                    <img src="/images/microsoft-certified-white.png" alt="Microsoft Certified Partner" className="h-20 w-auto opacity-90 hover:opacity-100 transition-opacity" />

                    <img src="/images/ipsos-grey.png" alt="Ipsos" className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    <img src="/images/brand-compliance-logo-final.png" alt="Brand Compliance" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    {/* Wit kaartje: Workvivo en Seer zijn donkerblauw artwork en
                        verdwijnen op het navy paneel. */}
                    <span className="inline-flex items-center rounded-[10px] bg-white px-4 py-3">
                      <img src="/images/partners/workvivo-by-zoom.svg" alt="Workvivo by Zoom" className="h-7 w-auto" />
                    </span>


                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm uppercase tracking-widest text-ec-on-dark-caption">Software/Platforms</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/copilot.png" alt="Copilot" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Copilot</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/fabric.png" alt="Fabric" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Fabric</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/viva-insights.svg" alt="Viva Insights" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Viva Insights</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/viva-engage.svg" alt="Viva Engage" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Viva Engage</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/glint.svg" alt="Viva Glint" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Viva Glint</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/pulse.png" alt="Viva Pulse" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Viva Pulse</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/onelake.png" alt="OneLake" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">OneLake</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/data-factory.png" alt="Data Factory" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Data Factory</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/databases.png" alt="Databases" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-ec-on-dark-caption text-center">Databases</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

          </div>
        </div>
      </section>
      {showIsoCert && <IsoCertModal onClose={() => setShowIsoCert(false)} />}
    </Layout>
  );
}
