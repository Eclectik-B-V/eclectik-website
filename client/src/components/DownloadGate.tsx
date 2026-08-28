import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadGateProps {
  title: string;
  fileName: string;
  fileUrl: string;
  trigger?: React.ReactNode;
  onDownloadStart?: () => void;
  isExternal?: boolean;
  onComplete?: () => void; // New prop for custom completion logic
}

export default function DownloadGate({ 
  title, 
  fileName, 
  fileUrl, 
  trigger,
  onDownloadStart,
  isExternal = false,
  onComplete
}: DownloadGateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'form' | 'downloading'>('prompt');
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setStep('prompt');
  };

  const handleDirectDownload = () => {
    startDownload();
    setIsOpen(false);
    toast.success(isExternal ? "Opening report..." : "Download started!");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    startDownload();
    setIsOpen(false);
    toast.success(isExternal ? "Thanks for subscribing! Opening report..." : "Thanks for subscribing! Download started.");
  };

  const startDownload = () => {
    if (onDownloadStart) onDownloadStart();
    
    if (onComplete) {
      onComplete();
      return;
    }

    if (isExternal) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div onClick={handleOpen}>
        {trigger || (
          <Button variant="outline" className="w-full gap-2 border-ec-line-3 text-ec-navy hover:bg-ec-surface hover:text-ec-navy">
            Download PDF <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-ec-navy">{isExternal ? "Read Report" : "Download White Paper"}</DialogTitle>
            <DialogDescription className="text-ec-body">
              {title}
            </DialogDescription>
          </DialogHeader>

          {step === 'prompt' && (
            <div className="space-y-4 py-4">
              <p className="text-sm leading-[1.6] text-ec-body">
                Would you like to stay updated with our latest research and insights?
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => setStep('form')} className="w-full bg-ec-sky text-ec-navy font-semibold hover:bg-[#54b4cb]">
                  Yes, keep me informed
                </Button>
                <Button variant="ghost" onClick={handleDirectDownload} className="w-full text-ec-body hover:bg-ec-surface hover:text-ec-navy">
                  {isExternal ? "No thanks, just read report" : "No thanks, just download"}
                </Button>
              </div>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep('prompt')} className="text-ec-body hover:bg-ec-surface hover:text-ec-navy">
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-ec-sky text-ec-navy font-semibold hover:bg-[#54b4cb]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    isExternal ? "Submit & Read" : "Submit & Download"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
