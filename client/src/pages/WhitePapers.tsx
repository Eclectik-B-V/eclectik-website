import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";
import DownloadGate from "@/components/DownloadGate";
import PresentationViewer from "@/components/PresentationViewer";
import { useState } from "react";

export default function WhitePapers() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [activePresentation, setActivePresentation] = useState<{title: string, slides: string[], reportUrl: string} | null>(null);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const whitePapers = [
    {
      title: "State of the Global Workplace 2026",
      description: "Gallup's annual global engagement study finds employee engagement declined to 20% in 2025 — the lowest level since 2020 — costing the world economy an estimated $10 trillion in lost productivity. Analyzes engagement, wellbeing, daily emotions, and job-market perceptions across 140+ countries.",
      date: "2026",
      readTime: "25 min read",
      image: "/images/whitepapers/gallup-global-workplace-2026-cover.jpg",
      fileUrl: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
      fileName: "gallup-state-of-the-global-workplace-2026.pdf",
      isExternal: true
    },
    {
      title: "The State of Enterprise AI 2025 Report",
      description: "This report brings together evidence from de-identified and aggregated enterprise usage data and a variety of other sources to provide a grounded view of how AI is being deployed inside organizations today.",
      date: "2025",
      readTime: "25 min read",
      image: "/images/whitepapers/openai-enterprise-ai-2025-cover.png",
      fileUrl: "https://cdn.openai.com/pdf/7ef17d82-96bf-4dd1-9df2-228f7f377a29/the-state-of-enterprise-ai_2025-report.pdf",
      fileName: "the-state-of-enterprise-ai-2025-report.pdf",
      isExternal: true,
      hasPresentation: true,
      slides: [
        "/slides/slide_1_enterprise_ai_arrived.html",
        "/slides/slide_2_productivity_multiplier.html",
        "/slides/slide_3_new_constraint.html"
      ]
    },
    {
      title: "Beyond AI Optimism",
      description: "Five ways to move your business from saving time to sparking innovation. As organizations race to adopt AI, there's a clear gap between aspiration and achievement. This report explores how to bridge that gap.",
      date: "2025",
      readTime: "15 min read",
      image: "/images/whitepapers/beyond-ai-optimism-cover.webp",
      fileUrl: "https://workspace.google.com/learning/report/content/beyond-ai-optimism",
      fileName: "beyond-ai-optimism-report.pdf",
      isExternal: true,
      hasPresentation: true,
      slides: [
        "/slides/slide_1_three_percent_club.html",
        "/slides/slide_2_beyond_time_savings.html",
        "/slides/slide_3_five_ways_transform.html"
      ]
    },
    {
      title: "State of AI in Business 2025",
      description: "A comprehensive analysis of the GenAI divide and the state of AI adoption in business for 2025. This report explores how organizations are moving from experimentation to value realization, highlighting key trends, challenges, and opportunities in the enterprise AI landscape.",
      date: "2025",
      readTime: "20 min read",
      image: "/images/whitepapers/state-of-ai-2025-cover.png",
      fileUrl: "https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf",
      fileName: "state-of-ai-business-2025.pdf",
      isExternal: true,
      hasPresentation: true,
      slides: [
        "/slides/slide_1_genai_divide.html",
        "/slides/slide_2_root_cause.html",
        "/slides/slide_3_path_forward.html"
      ]
    },
    {
      title: "2025: The Year the Frontier Firm Is Born",
      description: "2025 will go down as the year the Frontier Firm was born—the moment when companies moved beyond experimenting with AI and began rebuilding around it. Like the digital-native companies of a generation ago, they understand the power of pairing irreplaceable human insight with AI and agents to unlock outsize value.",
      date: "April 2025",
      readTime: "25 min read",
      image: "/images/whitepapers/frontier-firm-cover.webp",
      fileUrl: "https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born",
      fileName: "2025-frontier-firm-report.pdf",
      isExternal: true,
      hasPresentation: true,
      slides: [
        "/slides/slide_1_rise_of_frontier_firm.html",
        "/slides/slide_2_three_phases_ai.html",
        "/slides/slide_3_new_org_blueprint.html"
      ]
    },
    {
      title: "The Role of the Employee Experience Platform in Enterprise AI Transformation",
      description: "Discover how EX platforms are becoming the critical infrastructure for successful AI adoption and workforce transformation.",
      date: "February 2025",
      readTime: "15 min read",
      image: "/images/whitepaper-cover.png",
      fileUrl: "/documents/ex-platform-ai-report.pdf",
      fileName: "ex-platform-ai-transformation-report.pdf"
    },
    {
      title: "The State of AI Change Readiness",
      description: "Accelerating AI transformation through the employee experience. A comprehensive eBook on organizational readiness for AI.",
      date: "2024",
      readTime: "20 min read",
      image: "/images/whitepapers/state-of-ai-readiness-cover.png",
      fileUrl: "/documents/state-of-ai-readiness-ebook.pdf",
      fileName: "state-of-ai-change-readiness-ebook.pdf"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white pt-16 lg:pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-4xl mx-auto mb-16 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading text-ec-navy">
              White Papers
            </h1>
            <p className="text-xl text-ec-body">
              In-depth analysis, research, and insights on AI transformation, workplace signals, and data strategy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {whitePapers.map((paper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white border-ec-line-3 hover:border-ec-sky hover:shadow-[0_4px_14px_rgba(18,21,28,.12)] transition-all duration-300 group flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden bg-ec-surface">
                    <img
                      src={paper.image}
                      alt={paper.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-60" />
                  </div>

                  <CardHeader className="flex-grow relative z-10 -mt-8 p-4 pt-0">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3 group-hover:bg-ec-cream transition-colors border border-ec-line-3 shadow-sm">
                      <FileText className="w-5 h-5 text-ec-sky-ink" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ec-body-faint mb-2">
                      <span>{paper.date}</span>
                      <span>•</span>
                      <span>{paper.readTime}</span>
                    </div>
                    <CardTitle className="text-lg mb-2 text-ec-navy group-hover:text-ec-red transition-colors line-clamp-2 leading-tight">
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-ec-body line-clamp-3">
                      {paper.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="mt-auto p-4 pt-0">
                    <DownloadGate 
                      title={paper.title}
                      fileName={paper.fileName}
                      fileUrl={paper.fileUrl}
                      isExternal={paper.isExternal}
                      onComplete={
                        // @ts-ignore
                        paper.hasPresentation ? () => {
                          setActivePresentation({
                            title: paper.title,
                            // @ts-ignore
                            slides: paper.slides,
                            reportUrl: paper.fileUrl
                          });
                          setPresentationOpen(true);
                        } : undefined
                      }
                      trigger={
                        <Button variant="outline" size="sm" className="w-full gap-2 border-ec-line-3 text-ec-navy font-semibold hover:bg-ec-sky hover:text-ec-navy hover:border-ec-sky group-hover:bg-ec-sky group-hover:text-ec-navy group-hover:border-ec-sky transition-all duration-300 text-xs h-9">
                          {paper.isExternal ? (
                            <>Read Report <ExternalLink className="w-3 h-3" /></>
                          ) : (
                            <>Download PDF <Download className="w-3 h-3" /></>
                          )}
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </div>

      {activePresentation && (
        <PresentationViewer
          isOpen={presentationOpen}
          onClose={() => setPresentationOpen(false)}
          title={activePresentation.title}
          slides={activePresentation.slides}
          reportUrl={activePresentation.reportUrl}
        />
      )}
      </div>
    </Layout>
  );
}
