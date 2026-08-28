import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Careers() {
  return (
    <Layout>
      <Helmet>
        <title>Careers - Eclectik</title>
        <meta name="description" content="Join Our Talent Pool at Eclectik. We empower organizations to build thriving, people-centered workplaces through exceptional employee listening solutions." />
      </Helmet>
      
      <div className="bg-white pt-16 lg:pt-24 pb-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-ec-navy">Join Our Talent Pool</h1>
            <div className="w-24 h-1 bg-ec-sky mx-auto mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none text-ec-body">
            <p className="text-xl text-ec-navy leading-relaxed mb-8">
              Eclectik empowers organizations to build thriving, people-centered workplaces through exceptional employee listening solutions. We believe engagement and happiness are the foundations of strong, healthy, and enduring cultures. And we’re here to help make that a reality.
            </p>
            
            <p className="mb-8">
              Our team of kind, generous, and deeply experienced engagement experts brings years of success in implementation, insights, project management, training, change management, and platform support. Guided by our core principles, we combine data, technology, and people science to help companies ensure their employees feel heard, supported, and inspired to reach their full potential.
            </p>
            
            <p className="text-xl font-medium text-ec-navy mb-12">
              Join us in shaping the future of professional services where listening leads to lasting impact.
            </p>
            
            <div className="flex justify-center mt-12">
              <Button size="lg" className="text-lg px-8 py-6 h-auto bg-ec-sky hover:bg-[#54b4cb] text-ec-navy font-bold rounded-full group">
                View Open Positions <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
