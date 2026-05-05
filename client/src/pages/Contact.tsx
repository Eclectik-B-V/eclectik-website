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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1f2e] rounded-xl shadow-2xl w-[90vw] max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">ISO 27001 Certificaat — Eclectik B.V.</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors text-2xl leading-none ml-4"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        {/* PDF Viewer */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 px-4">
          <Document
            file={ISO_CERT_URL}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="text-white/50 py-20">Certificaat laden...</div>}
            error={<div className="text-red-400 py-20">Kon het certificaat niet laden.</div>}
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

      <section className="relative min-h-screen flex items-center pt-32 lg:pt-40 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          {/* Abstract shapes/beacon effect */}
          <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10">
            <div className="absolute inset-0 border-[40px] border-primary rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-[100px] border-[40px] border-secondary rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute inset-[200px] border-[40px] border-accent rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />
          </div>
        </div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Content & Form */}
            <motion.div 
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="max-w-xl"
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
                The information to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">accelerate transformation.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-12">
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
                      className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors"
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
                      className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors"
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
                    className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors"
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
                      className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors"
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
                      className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors"
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
                    className="w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-primary transition-colors resize-none focus:outline-none text-white placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <Checkbox 
                    id="consent" 
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
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
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-xs">
                    Protected by reCAPTCHA and the Google <a href="#" className="underline hover:text-primary">Privacy Policy</a> and <a href="#" className="underline hover:text-primary">Terms of Service</a> apply.
                  </p>
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-background font-bold px-8 rounded-full"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white">Get in touch.</h2>
                
                <div className="flex flex-col gap-4">
                  <a href="mailto:info@eclectik.com" className="text-xl text-primary hover:text-white transition-colors inline-flex items-center gap-2 border-b border-primary/30 pb-1 w-fit">
                    <Mail className="w-5 h-5" /> info@eclectik.com
                  </a>
                  
                  <div className="flex gap-6 mt-4">
                    <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-primary transition-all">
                      <Linkedin className="w-6 h-6" />
                    </a>
                    <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-secondary transition-all">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 hover:text-accent transition-all">
                      <Youtube className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Certifications & Partners (Visual Balance) */}
            <div className="hidden lg:flex flex-col justify-start pt-48 h-full min-h-[600px] pl-20 border-l border-white/5">
              <div className="space-y-12 opacity-70">
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Certifications</h3>
                  <div className="flex gap-8 items-center flex-wrap">
                    <button onClick={() => setShowIsoCert(true)} className="focus:outline-none flex flex-col items-center gap-2 group" title="Bekijk ISO 27001 certificaat">
                       <img src="/images/brand-compliance-logo-final.png" alt="Brand Compliance Certified" className="h-12 w-auto opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer" />
                       <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors tracking-wide">Click to see certificate</span>
                     </button>
                    <img src="/images/white-microsoft-startups-logo-final.png" alt="Microsoft for Startups Founders Hub" className="h-24 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Partners</h3>
                  <div className="flex gap-6 items-center flex-wrap">
                    <img src="/images/microsoft-certified-white.png" alt="Microsoft Certified Partner" className="h-20 w-auto opacity-90 hover:opacity-100 transition-opacity" />

                    <img src="/images/ipsos-grey.png" alt="Ipsos" className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    <img src="/images/softwareone-grey.png" alt="SoftwareOne" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    <img src="/images/brand-compliance-logo-final.png" alt="Brand Compliance" className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity" />
                    <img src="/images/hibob-grey.png" alt="HiBob" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />


                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Software/Platforms</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/copilot.png" alt="Copilot" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Copilot</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/fabric.png" alt="Fabric" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Fabric</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/viva-insights.svg" alt="Viva Insights" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Viva Insights</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/viva-engage.svg" alt="Viva Engage" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Viva Engage</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/glint.svg" alt="Viva Glint" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Viva Glint</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/pulse.png" alt="Viva Pulse" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Viva Pulse</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/onelake.png" alt="OneLake" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">OneLake</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/data-factory.png" alt="Data Factory" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Data Factory</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group">
                      <img src="/images/databases.png" alt="Databases" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-muted-foreground text-center">Databases</span>
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
