import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { POSITIONING_TAGLINE } from "@shared/const";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  heading: string;
  description: string;
  cta?: { label: string; href: string };
}

export default function PlaceholderPage({ title, heading, description, cta }: PlaceholderPageProps) {
  return (
    <Layout>
      <Helmet>
        <title>{title} | Eclectik</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="bg-white min-h-[70vh] flex items-center py-16 lg:py-24">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-ec-sky" />
            <span className="text-ec-red font-semibold tracking-[0.14em] uppercase text-[13px]">
              {POSITIONING_TAGLINE}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-ec-navy mb-6">{heading}</h1>
          <p className="text-lg leading-[1.65] text-ec-body mb-10">{description}</p>
          {cta && (
            <div className="mb-10">
              <Link href={cta.href}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-full bg-ec-sky hover:bg-[#54b4cb] text-ec-navy font-bold transition-colors"
                >
                  {cta.label}
                </Button>
              </Link>
            </div>
          )}
          <Link href="/" className="text-ec-red font-semibold hover:text-ec-red-hover transition-colors">
            ← Back to home
          </Link>
        </div>
      </section>
    </Layout>
  );
}
