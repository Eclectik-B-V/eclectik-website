import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { POSITIONING_TAGLINE } from "@shared/const";

interface PlaceholderPageProps {
  title: string;
  heading: string;
  description: string;
}

export default function PlaceholderPage({ title, heading, description }: PlaceholderPageProps) {
  return (
    <Layout>
      <Helmet>
        <title>{title} | Eclectik</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="min-h-[70vh] flex items-center pt-32 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-[1px] w-12 bg-primary" />
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              {POSITIONING_TAGLINE}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">{heading}</h1>
          <p className="text-lg text-muted-foreground mb-10">{description}</p>
          <Link href="/" className="text-primary font-semibold hover:underline">
            ← Back to home
          </Link>
        </div>
      </section>
    </Layout>
  );
}
