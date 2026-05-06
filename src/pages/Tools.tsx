import React, { lazy, Suspense } from 'react';
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";
import SignUpPrompt from "@/components/SignUpPrompt";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Target, PieChart, Zap, TrendingUp, BarChart3, Shield, DollarSign, Percent, ArrowUpRight, LineChart, BookOpen, Lightbulb, Clock, CheckCircle2 } from "lucide-react";
import { Loader2 } from "lucide-react";

// Lazy load heavy components to prevent initialization issues
const RiskCalculatorPopup = lazy(() => import("@/components/RiskCalculatorPopup"));
const PortfolioTrackerPopup = lazy(() => import("@/components/PortfolioTrackerPopup"));
const TradingSimulatorPopup = lazy(() => import("@/components/TradingSimulatorPopup"));
const SmartCalculator = lazy(() => import("@/components/SmartCalculator"));

const Tools = () => {
  const { user } = useAuth();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "FINHUBAFRICA Trading Tools",
    "description": "Professional trading tools including risk calculator, portfolio tracker, and trading simulator",
    "applicationCategory": "FinanceApplication",
    "featureList": [
      "Risk Calculator with Position Sizing",
      "Portfolio Tracker with Analytics",
      "Trading Simulator",
      "Multi-Currency Calculator"
    ]
  };
  
  const toolsFeatures = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Risk Calculator",
      description: "Calculate position sizes and risk/reward ratios with precision",
      features: [
        "Multi-step wizard interface",
        "Long & short trade support",
        "Visual price level diagrams",
        "Calculation history tracking",
        "Export functionality",
        "Real-time risk assessment"
      ],
      color: "primary"
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: "Portfolio Tracker",
      description: "Monitor and analyze your investment portfolio performance",
      features: [
        "Real-time portfolio tracking",
        "P&L calculations",
        "Asset allocation analysis",
        "Performance metrics",
        "Multi-asset support",
        "Visual breakdowns"
      ],
      color: "accent"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Trading Simulator",
      description: "Practice trading with virtual money in real-time market conditions",
      features: [
        "Live market simulation",
        "Virtual $100k starting balance",
        "Real-time order execution",
        "Position management",
        "Performance tracking",
        "Risk-free practice environment"
      ],
      color: "warning"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Currency Calculator",
      description: "Convert between 200+ currencies with real-time exchange rates",
      features: [
        "200+ currency pairs",
        "Real-time rates",
        "Searchable currency selection",
        "Historical data",
        "Instant conversion",
        "Mobile optimized"
      ],
      color: "success"
    }
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Professional-Grade Tools",
      description: "Access the same tools used by professional traders and institutions"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Save Time",
      description: "Automate complex calculations and focus on strategy"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Learn by Doing",
      description: "Practice without risk using our simulator and calculators"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Track Performance",
      description: "Monitor your progress and improve your trading decisions"
    }
  ];

  return (
    <>
      <SEOHead
        title="Professional Trading Tools | Risk Calculator & Portfolio Tracker | FINHUBAFRICA"
        description="Access professional trading tools including advanced risk calculator, portfolio tracker with analytics, trading simulator, and smart currency calculator. Make informed trading decisions with accurate position sizing and risk management."
        keywords="risk calculator, position size calculator, portfolio tracker, trading simulator, currency calculator, trading tools, risk management, forex tools, crypto tools"
        structuredData={structuredData}
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-28 lg:pt-24">
        <MobileNavigation />
      
      <div className="p-4 md:p-8">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 border border-primary/20">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Professional Trading Tools</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
            Advanced Financial Tools
            <br />
            <span className="text-primary">for Smart Traders</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Professional-grade calculators, portfolio trackers, and trading simulators designed to help you make informed trading decisions and manage risk effectively.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold">🎯 Risk Management</span>
            </div>
            <div className="px-6 py-3 bg-accent/10 rounded-full border border-accent/20">
              <span className="text-sm font-semibold">📊 Portfolio Analysis</span>
            </div>
            <div className="px-6 py-3 bg-success/10 rounded-full border border-success/20">
              <span className="text-sm font-semibold">⚡ Real-Time Data</span>
            </div>
          </div>

          {!user && (
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = '/auth'} className="px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
                Explore Tools
              </Button>
            </div>
          )}
        </header>

        {/* Interactive Tools Section */}
        <section className="mb-16">
          <Tabs defaultValue="risk" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent mb-8">
              <TabsTrigger 
                value="risk" 
                className="data-[state=active]:bg-primary/10 data-[state=active]:border-primary/50 border-2 border-transparent py-4 px-6"
              >
                <Target className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Risk Calculator</span>
                <span className="sm:hidden">Risk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio"
                className="data-[state=active]:bg-accent/10 data-[state=active]:border-accent/50 border-2 border-transparent py-4 px-6"
              >
                <PieChart className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Portfolio Tracker</span>
                <span className="sm:hidden">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger 
                value="simulator"
                className="data-[state=active]:bg-warning/10 data-[state=active]:border-warning/50 border-2 border-transparent py-4 px-6"
              >
                <Zap className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Trading Simulator</span>
                <span className="sm:hidden">Simulator</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calculator"
                className="data-[state=active]:bg-success/10 data-[state=active]:border-success/50 border-2 border-transparent py-4 px-6"
              >
                <Calculator className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Currency Calculator</span>
                <span className="sm:hidden">Currency</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="risk" className="space-y-6">
              <Card className="glass-card border-primary/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Advanced Risk Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Calculate position sizes and risk/reward ratios with industry-standard formulas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Key Features
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Multi-step wizard interface
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Support for long and short trades
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Visual price level diagrams
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Calculation history tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          Export results to file
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-success" />
                        What You Can Calculate
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-success" />
                          Optimal position size in shares and dollars
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-warning" />
                          Risk percentage per trade
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Risk/reward ratio analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-accent" />
                          Profit potential and max loss
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                      <RiskCalculatorPopup />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <Card className="glass-card border-accent/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                    <PieChart className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Portfolio Tracker & Analyzer</CardTitle>
                  <CardDescription className="text-base">
                    Track your investments and analyze portfolio performance in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                        Portfolio Management
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                          Add and track multiple holdings
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                          Real-time P&L calculations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                          Asset allocation breakdown
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                          Top gainers and losers
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Analytics & Insights
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <LineChart className="h-4 w-4 text-primary" />
                          Performance metrics dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-success" />
                          Percentage returns tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-accent" />
                          Visual allocation charts
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-warning" />
                          Total portfolio value
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                      <PortfolioTrackerPopup />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6">
              <Card className="glass-card border-warning/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-warning" />
                  </div>
                  <CardTitle className="text-2xl">Advanced Trading Simulator</CardTitle>
                  <CardDescription className="text-base">
                    Practice trading with virtual $100k in a realistic market environment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-warning" />
                        Simulation Features
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                          Live market price simulation
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                          Virtual $100,000 starting balance
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                          Real-time order execution
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                          Multiple asset support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-warning"></div>
                          Complete trading history
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-success" />
                        Risk-Free Learning
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Learn without financial risk
                        </li>
                        <li className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          Test trading strategies
                        </li>
                        <li className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-accent" />
                          Track performance metrics
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-warning" />
                          Build trading confidence
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                      <TradingSimulatorPopup />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <Card className="glass-card border-success/20">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                    <Calculator className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-2xl">Smart Currency Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Convert between 200+ currencies with real-time exchange rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-success mx-auto" />}>
                      <SmartCalculator />
                    </Suspense>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold text-success mb-1">200+</div>
                      <div className="text-sm text-muted-foreground">Currency Pairs</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold text-primary mb-1">Real-Time</div>
                      <div className="text-sm text-muted-foreground">Exchange Rates</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/20">
                      <div className="text-2xl font-bold text-accent mb-1">Instant</div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Benefits Section */}
        <section className="mb-16 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Our Trading Tools?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional-grade tools designed to help you make better trading decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="glass-card group hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16 animate-slide-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Trading Toolkit</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to analyze, plan, and execute successful trades
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {toolsFeatures.map((tool, idx) => (
              <Card key={idx} className={`glass-card group hover:shadow-xl transition-all duration-300 border-${tool.color}/20`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-${tool.color}/10 flex items-center justify-center flex-shrink-0`}>
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tool.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className={`h-4 w-4 text-${tool.color} flex-shrink-0`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16 animate-slide-up">
          <Card className="glass-card border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
            <CardContent className="relative z-10 text-center py-16 px-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Start Trading Smarter Today
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Join thousands of traders using our professional tools to improve their trading decisions and manage risk effectively.
              </p>
              {!user ? (
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" onClick={() => window.location.href = '/auth'} className="px-8">
                    <ArrowUpRight className="h-5 w-5 mr-2" />
                    Get Started Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => window.location.href = '/pricing'}>
                    View Pricing
                  </Button>
                </div>
              ) : (
                <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <ArrowUpRight className="h-5 w-5 mr-2" />
                  Start Using Tools
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {!user && <SignUpPrompt />}
      </main>
    </>
  );
};

export default Tools;
