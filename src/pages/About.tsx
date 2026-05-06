import { Card, CardContent } from "@/components/ui/card";
import MobileNavigation from "@/components/MobileNavigation";
import SEOHead from "@/components/SEOHead";
import Footer from "@/components/Footer";
import { Building2, Target, Users, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <>
      <SEOHead
        title="About Us - FINHUBAFRICA | Leading African Fintech & Crypto Platform"
        description="Learn about FINHUBAFRICA, Africa's premier fintech and cryptocurrency platform dedicated to simplifying financial decisions with data-driven tools and transparent insights."
        keywords="about FINHUBAFRICA, African fintech, crypto platform Africa, financial technology, digital finance Africa, crypto trading platform, mission vision"
      />
      <main className="min-h-screen bg-background pt-28 lg:pt-24">
        <MobileNavigation />
        
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              About FINHUBAFRICA
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We are a fintech and crypto platform dedicated to simplifying financial decisions for African traders and investors.
            </p>
          </div>

          <Card className="glass-card border-primary/20 mb-12">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our goal is to help users navigate digital finance with data-driven tools and transparent insights. 
                    We believe that everyone deserves access to professional-grade financial tools and real-time market data, 
                    regardless of their location or experience level.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                      <p className="text-muted-foreground">
                        To become Africa's most trusted and comprehensive financial platform, empowering millions to make smarter investment decisions.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Our Community</h3>
                      <p className="text-muted-foreground">
                        Join over 12,400+ active African traders who trust FINHUBAFRICA for their cryptocurrency and forex trading needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Data-Driven</h3>
                      <p className="text-muted-foreground">
                        Real-time market data, advanced analytics, and powerful tools to give you the edge in your trading journey.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Transparency</h3>
                      <p className="text-muted-foreground">
                        We prioritize transparency in all our operations, providing clear insights and honest information about markets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
              <ul className="space-y-4 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Real-time cryptocurrency and forex market data powered by industry-leading APIs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Advanced trading tools including risk calculators, portfolio trackers, and simulators</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Comprehensive market analytics and technical signals to inform your decisions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Educational resources and weekly insights to improve your trading knowledge</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Secure platform with user privacy and data protection as top priorities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default About;
