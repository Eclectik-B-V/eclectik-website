import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-ec-surface">
      <Card className="w-full max-w-lg mx-4 shadow-sm border border-ec-line-3 bg-white">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-ec-red/10 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-ec-red" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-ec-navy mb-2">404</h1>

          <h2 className="text-xl font-semibold text-ec-navy mb-4">
            Page Not Found
          </h2>

          <p className="text-ec-body mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-ec-sky hover:bg-[#54b4cb] text-ec-navy font-bold px-6 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-navy"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
