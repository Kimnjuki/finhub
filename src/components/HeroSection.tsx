import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  headline: string;
  subtext: string;
  primaryCTA: {
    label: string;
    link: string;
  };
  secondaryCTA: {
    label: string;
    link: string;
  };
}

const HeroSection = ({ headline, subtext, primaryCTA, secondaryCTA }: HeroSectionProps) => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
      
      <div className="relative max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Africa's Leading Crypto & Forex Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
          {headline}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
          {subtext}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={primaryCTA.link}>
            <Button size="lg" className="text-lg px-8 py-6 group">
              {primaryCTA.label}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <a href={secondaryCTA.link}>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              {secondaryCTA.label}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
