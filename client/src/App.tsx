import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { initAttribution } from "@/lib/tracking";
import ScrollToTop from "@/components/ScrollToTop";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/Home";
import AboutUs from "@/pages/AboutUs";
import Consulting from "./pages/Consulting";
import Training from "./pages/Training";
import Solutions from "@/pages/Solutions";
import Contact from "@/pages/Contact";
import TermsOfService from "@/pages/TermsOfService";
import CookieSettings from "@/pages/CookieSettings";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CaseStudyCopilot from "@/pages/CaseStudyCopilot";
import CaseStudyGlint from "./pages/CaseStudyGlint";
import CaseStudyAdoption from "./pages/CaseStudyAdoption";
import CaseStudyAkkodis from "./pages/CaseStudyAkkodis";
import CaseStudyMicrosoftViva from "./pages/CaseStudyMicrosoftViva";
import CustomerSuccess from "@/pages/CustomerSuccess";
import PeopleScience from "@/pages/PeopleScience";
import ChangeManagement from "@/pages/ChangeManagement";
import PeopleSuccessAcademy from "@/pages/PeopleSuccessAcademy";
import TrainingEnablement from "@/pages/TrainingEnablement";
import ExecutiveCoaching from "@/pages/ExecutiveCoaching";
import HRTechServices from "@/pages/HRTechServices";
import Sectors from "./pages/Sectors";
import WhitePapers from "./pages/WhitePapers";
import Careers from "./pages/Careers";
import Benchmark from "@/pages/Benchmark";
import Insights from "@/pages/Insights";
import Scorecard from "@/pages/Scorecard";
import ProofOfValue from "@/pages/ProofOfValue";
import ProofOfChange from "@/pages/ProofOfChange";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutUs} />
      <Route path="/about-us">{() => <Redirect to="/about" />}</Route>
      <Route path={"/consulting"} component={Consulting} />
      <Route path={"/training"} component={Training} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/hrtechservices" component={HRTechServices} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/cookie-settings" component={CookieSettings} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/case-studies/copilot-impact" component={CaseStudyCopilot} />
      <Route path="/case-studies/glint-insights" component={CaseStudyGlint} />
      <Route path="/case-studies/copilot-adoption" component={CaseStudyAdoption} />
      <Route path="/case-studies/akkodis-power-platform" component={CaseStudyAkkodis} />
      <Route path="/case-studies/microsoft-viva-transformation" component={CaseStudyMicrosoftViva} />
      <Route path="/services/customer-success" component={CustomerSuccess} />
      <Route path="/services/people-science" component={PeopleScience} />
      <Route path="/services/change-management" component={ChangeManagement} />
      <Route path="/training/people-success-academy" component={PeopleSuccessAcademy} />
      <Route path="/training/enablement" component={TrainingEnablement} />
      <Route path="/training/executive-coaching" component={ExecutiveCoaching} />
      <Route path={"/sectors"} component={Sectors} />
      <Route path="/resources/white-papers" component={WhitePapers} />
      <Route path="/white-papers" component={WhitePapers} />
      <Route path="/careers" component={Careers} />
      <Route path="/benchmark" component={Benchmark} />
      <Route path="/insights" component={Insights} />
      <Route path="/scorecard" component={Scorecard} />
      <Route path="/proof-of-value" component={ProofOfValue} />
      <Route path="/proof-of-change" component={ProofOfChange} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    initAttribution();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
