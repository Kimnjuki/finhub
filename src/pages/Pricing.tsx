import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Lock, Shield, TrendingUp, Users, HeadphonesIcon, BookOpen, Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

const Pricing = () => {
  const { user } = useAuth();

  const freeFeatures = [
    "Smart Currency Calculator",
    "Basic Market News & Updates",
    "Educational Resources & Tutorials", 
    "FAQ & Community Support",
    "SEO Marketing Topics & Insights",
    "Portfolio Tracking (Basic)",
    "Market Analysis Fundamentals",
    "Financial Learning Center"
  ];

  const exclusiveFeatures = [
    "Advanced Market Analytics",
    "Real-time Trading Signals",
    "Premium Research Reports", 
    "AI-Powered Insights",
    "Advanced SEO Strategies",
    "Personal Trading Dashboard",
    "Priority Support Access",
    "Expert Market Commentary"
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <MobileNavigation />
      
      <div className="max-w-7xl mx-auto p-4 md:p-8 pt-20 lg:pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Free Financial Platform
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Access all our financial tools and resources completely free. 
            Sign up to unlock exclusive features and premium content.
          </p>
          
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20 mb-8">
            <Star className="h-4 w-4 mr-1" />
            100% Free Forever
          </Badge>
        </div>

        {/* Free Platform Overview */}
        <div className="text-center mb-12">
          <Card className="max-w-4xl mx-auto glass-card hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                <TrendingUp className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="text-3xl">100% Free Platform</CardTitle>
              <CardDescription className="text-lg">
                All features available to everyone - no payment, no subscription required
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <h3 className="text-xl font-semibold text-center flex items-center justify-center gap-2 mb-6">
                <CheckCircle className="h-5 w-5 text-success" />
                What You Get For Free:
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...freeFeatures, ...exclusiveFeatures].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 text-center">
                {user ? (
                  <Button className="btn-primary" size="lg" disabled>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    You Have Full Access
                  </Button>
                ) : (
                  <Link to="/auth" className="block">
                    <Button className="btn-primary" size="lg">
                      Sign Up Free - Unlock All Features
                    </Button>
                  </Link>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  Sign up to save preferences and access personalized features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Topics Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Search className="h-8 w-8 text-primary" />
            SEO & Digital Marketing Hub
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "SEO Fundamentals",
                description: "Learn the basics of search engine optimization",
                topics: ["Keyword Research", "On-Page SEO", "Technical SEO", "Content Strategy"]
              },
              {
                title: "Advanced SEO",
                description: "Master advanced SEO techniques and strategies",
                topics: ["Link Building", "Local SEO", "E-commerce SEO", "SEO Analytics"]
              },
              {
                title: "Digital Marketing",
                description: "Comprehensive digital marketing strategies",
                topics: ["Social Media Marketing", "PPC Advertising", "Email Marketing", "Content Marketing"]
              },
              {
                title: "Financial SEO",
                description: "SEO strategies for financial websites",
                topics: ["Finance Content SEO", "Trading Platform SEO", "Investment Blog SEO", "FinTech Marketing"]
              },
              {
                title: "Market Analysis SEO",
                description: "Optimize market analysis and financial content",
                topics: ["Market Research SEO", "Financial News SEO", "Trading Signal SEO", "Investment Guide SEO"]
              },
              {
                title: "SEO Tools & Analytics",
                description: "Master SEO tools and performance tracking",
                topics: ["Google Analytics", "Search Console", "SEO Auditing", "Performance Metrics"]
              }
            ].map((category, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300 glass-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIdx) => (
                      <li key={topicIdx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


        {/* Trust & Security */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6">Secure & Trusted Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Shield className="h-8 w-8" />, text: "SSL Encrypted" },
              { icon: <TrendingUp className="h-8 w-8" />, text: "Instant Access" },
              { icon: <Users className="h-8 w-8" />, text: "10,000+ Users" },
              { icon: <HeadphonesIcon className="h-8 w-8" />, text: "24/7 Support" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-muted-foreground">
            <p>100% free platform with secure account registration</p>
            <p className="mt-2">No hidden fees, no subscription costs - completely free forever</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;