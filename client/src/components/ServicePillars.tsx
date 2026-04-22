import { ArrowRight, LineChart, Users, Package } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ServicePillars() {
  const pillars = [
    {
      title: "Consulting",
      subtitle: "Operationalize Workplace Signals",
      description: "We combine objective telemetry with subjective signals to build actionable roadmaps that deliver measurable impact.",
      icon: <LineChart className="w-10 h-10 text-primary" />,
      link: "/consulting",
      color: "text-primary",
      borderColor: "border-primary/50",
      hoverBorder: "group-hover:border-primary",
      bgGradient: "from-primary/10 to-transparent",
      buttonBg: "bg-primary hover:bg-primary/90",
      image: "/images/consulting-hero-composite.png"
    },
    {
      title: "Training",
      subtitle: "Interpretation & Change Activation",
      description: "We upskill leaders, managers, and HR teams to interpret signals confidently and activate change consistently.",
      icon: <Users className="w-10 h-10 text-chart-4" />,
      link: "/training",
      color: "text-chart-4",
      borderColor: "border-chart-4/50",
      hoverBorder: "group-hover:border-chart-4",
      bgGradient: "from-chart-4/10 to-transparent",
      buttonBg: "bg-chart-4 hover:bg-chart-4/90",
      image: "/images/training-hero-composite.png"
    },
    {
      title: "Solutions",
      subtitle: "Licenses & Packaged Offerings",
      description: "Eclectik bundles Microsoft Viva and Copilot licenses with onboarding, analytics accelerators, and service-level commitments.",
      icon: <Package className="w-10 h-10 text-secondary" />,
      link: "/solutions",
      color: "text-secondary",
      borderColor: "border-secondary/50",
      hoverBorder: "group-hover:border-secondary",
      bgGradient: "from-secondary/10 to-transparent",
      buttonBg: "bg-secondary hover:bg-secondary/90",
      image: "/images/Maincomposite_red.png"
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="container">
        <div className="mb-20 max-w-3xl">
          <span className="text-primary font-medium tracking-wider uppercase text-sm block mb-4">Our Expertise</span>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{fontSize: '60px'}}>
            Comprehensive services to drive your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">AI Transformation</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <Link key={index} href={pillar.link}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative h-full rounded-3xl border border-white/10 bg-white/5 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${pillar.hoverBorder}`}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-b ${pillar.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="p-8 h-full flex flex-col relative z-10">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${pillar.borderColor} transition-colors`}>
                      {pillar.icon}
                    </div>
                    <div className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300`}>
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="mb-auto">
                    <h3 className={`text-3xl font-bold mb-2 ${pillar.color}`}>{pillar.title}</h3>
                    <h4 className="text-lg font-medium text-white mb-4">{pillar.subtitle}</h4>
                    <p className="text-muted-foreground leading-relaxed mb-8">
                      {pillar.description}
                    </p>
                  </div>
                  
                  {/* Image Preview (Bottom) */}
                  <div className="mt-8 relative h-48 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                    <img 
                      src={pillar.image} 
                      alt={pillar.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        Explore
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
