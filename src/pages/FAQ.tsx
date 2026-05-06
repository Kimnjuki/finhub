import MobileNavigation from "@/components/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, DollarSign, Shield, BarChart3, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      id: "forex-basics",
      title: "Forex Trading Basics",
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-primary/10 text-primary border-primary/20",
      questions: [
        {
          question: "How does forex trading work?",
          answer: "Forex trading involves buying and selling currency pairs to profit from exchange rate fluctuations. When you trade forex, you're simultaneously buying one currency and selling another. For example, in EUR/USD, you're buying euros and selling US dollars. The goal is to buy low and sell high, profiting from the difference in exchange rates over time.",
          keywords: ["forex trading", "currency pairs", "exchange rates"]
        },
        {
          question: "What is a pip in forex trading?",
          answer: "A pip (percentage in point) is the smallest price movement in a currency pair. For most major currency pairs, a pip is equal to 0.0001 or 1/100th of 1%. For example, if EUR/USD moves from 1.1050 to 1.1051, that's a 1-pip movement. Pips are crucial for calculating profits, losses, and position sizing in forex trading.",
          keywords: ["pip", "forex", "price movement", "currency"]
        },
        {
          question: "What is leverage in forex and how does it work?",
          answer: "Leverage allows you to control a larger position with a smaller amount of capital. For example, with 100:1 leverage, you can control $100,000 worth of currency with just $1,000. While leverage amplifies potential profits, it also increases potential losses. Always use proper risk management when trading with leverage.",
          keywords: ["leverage", "margin", "risk management", "forex"]
        },
        {
          question: "When is the best time to trade forex?",
          answer: "The forex market is open 24 hours a day, 5 days a week. The best trading times are during market overlaps: London-New York (8 AM - 12 PM EST) and Sydney-Tokyo (7 PM - 2 AM EST). These periods typically offer higher liquidity and volatility, providing more trading opportunities.",
          keywords: ["trading hours", "market sessions", "liquidity", "volatility"]
        }
      ]
    },
    {
      id: "crypto-basics",
      title: "Cryptocurrency Trading",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-accent/10 text-accent border-accent/20",
      questions: [
        {
          question: "How to start trading cryptocurrency for beginners?",
          answer: "To start crypto trading: 1) Choose a reputable exchange, 2) Complete identity verification, 3) Deposit funds, 4) Start with small amounts, 5) Learn about market analysis, 6) Use proper risk management. Begin with major cryptocurrencies like Bitcoin and Ethereum before exploring altcoins.",
          keywords: ["cryptocurrency trading", "beginners", "crypto exchange", "bitcoin"]
        },
        {
          question: "What are the best cryptocurrencies to invest in 2024?",
          answer: "Top cryptocurrencies for 2024 consideration include Bitcoin (store of value), Ethereum (smart contracts), Solana (fast transactions), and emerging Layer 2 solutions. However, always do your own research (DYOR) and never invest more than you can afford to lose. Market conditions change rapidly in crypto.",
          keywords: ["best cryptocurrencies", "crypto investment", "bitcoin", "ethereum", "solana"]
        },
        {
          question: "What is the difference between crypto trading and investing?",
          answer: "Crypto trading involves frequent buying and selling to profit from short-term price movements, while crypto investing is a long-term strategy of holding cryptocurrencies for potential future growth. Trading requires more time, technical analysis skills, and risk tolerance, while investing focuses on fundamental analysis and patience.",
          keywords: ["crypto trading vs investing", "long-term investing", "short-term trading"]
        },
        {
          question: "How to read cryptocurrency charts and indicators?",
          answer: "Crypto chart reading involves understanding candlestick patterns, support/resistance levels, and technical indicators. Key indicators include RSI (momentum), MACD (trend), moving averages (trend direction), and volume. Start with basic chart patterns like triangles, head and shoulders, and double tops/bottoms.",
          keywords: ["crypto charts", "technical analysis", "indicators", "candlesticks"]
        }
      ]
    },
    {
      id: "trading-strategies",
      title: "Trading Strategies & Analysis",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-success/10 text-success border-success/20",
      questions: [
        {
          question: "What are the best forex trading strategies for beginners?",
          answer: "Beginner-friendly forex strategies include: 1) Trend following using moving averages, 2) Support and resistance trading, 3) Price action trading, 4) Carry trades for long-term positions. Start with demo trading to practice these strategies risk-free before using real money.",
          keywords: ["forex strategies", "beginner trading", "trend following", "price action"]
        },
        {
          question: "How to use RSI indicator for crypto trading?",
          answer: "RSI (Relative Strength Index) measures momentum from 0-100. Values above 70 suggest overbought conditions (potential sell signal), while values below 30 indicate oversold conditions (potential buy signal). Use RSI with other indicators for confirmation and avoid trading solely based on RSI signals.",
          keywords: ["RSI indicator", "technical analysis", "overbought", "oversold"]
        },
        {
          question: "What is scalping in forex and crypto trading?",
          answer: "Scalping is a high-frequency trading strategy that aims to profit from small price movements by holding positions for seconds to minutes. Scalpers make numerous trades daily, requiring tight spreads, fast execution, and strong risk management. It's suitable for experienced traders with good discipline.",
          keywords: ["scalping", "high-frequency trading", "short-term trading"]
        },
        {
          question: "How to set stop loss and take profit levels?",
          answer: "Set stop losses at key support/resistance levels, typically 1-3% for crypto and 20-50 pips for forex. Take profit levels should maintain a positive risk-reward ratio (at least 1:2). Use technical levels, percentage-based rules, or ATR (Average True Range) to determine optimal placement.",
          keywords: ["stop loss", "take profit", "risk management", "risk reward ratio"]
        }
      ]
    },
    {
      id: "risk-management",
      title: "Risk Management & Security",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-destructive/10 text-destructive border-destructive/20",
      questions: [
        {
          question: "How much money should I risk per trade?",
          answer: "Never risk more than 1-2% of your trading capital per trade. This means if you have $10,000, don't risk more than $100-200 per trade. This rule helps preserve capital during losing streaks and ensures long-term trading survival. Position sizing is crucial for consistent profitability.",
          keywords: ["risk per trade", "position sizing", "capital management", "risk management"]
        },
        {
          question: "What are the biggest mistakes new traders make?",
          answer: "Common trading mistakes include: 1) Over-leveraging positions, 2) Not using stop losses, 3) Emotional trading, 4) Lack of trading plan, 5) Chasing losses, 6) Not keeping a trading journal. Avoiding these mistakes significantly improves trading success rates.",
          keywords: ["trading mistakes", "common errors", "trading psychology", "beginner mistakes"]
        },
        {
          question: "How to secure cryptocurrency investments?",
          answer: "Crypto security best practices: 1) Use hardware wallets for long-term storage, 2) Enable 2FA on all accounts, 3) Never share private keys, 4) Use reputable exchanges, 5) Keep software updated, 6) Be wary of phishing attempts. Remember: 'Not your keys, not your crypto.'",
          keywords: ["crypto security", "hardware wallet", "private keys", "2FA"]
        },
        {
          question: "What is diversification in trading and investing?",
          answer: "Diversification involves spreading investments across different assets, timeframes, and strategies to reduce risk. Don't put all funds in one currency pair or cryptocurrency. Diversify across major and minor pairs, different market sectors, and various trading strategies to minimize portfolio risk.",
          keywords: ["diversification", "portfolio management", "risk reduction", "asset allocation"]
        }
      ]
    },
    {
      id: "advanced-topics",
      title: "Advanced Trading Concepts",
      icon: <Lightbulb className="w-5 h-5" />,
      color: "bg-warning/10 text-warning border-warning/20",
      questions: [
        {
          question: "What is algorithmic trading and how does it work?",
          answer: "Algorithmic trading uses computer programs to execute trades based on predetermined criteria. These algorithms can analyze market data, identify opportunities, and execute trades faster than human traders. Popular strategies include arbitrage, market making, and trend following algorithms.",
          keywords: ["algorithmic trading", "automated trading", "trading bots", "algorithms"]
        },
        {
          question: "How do central bank policies affect forex markets?",
          answer: "Central bank policies significantly impact currency values through interest rate decisions, quantitative easing, and forward guidance. Higher interest rates typically strengthen a currency, while dovish policies weaken it. Major announcements from Fed, ECB, BOJ, and BOE can cause significant market volatility.",
          keywords: ["central banks", "monetary policy", "interest rates", "forex impact"]
        },
        {
          question: "What is DeFi and how does it impact crypto trading?",
          answer: "DeFi (Decentralized Finance) offers financial services without traditional intermediaries. It includes lending, borrowing, trading, and yield farming on blockchain platforms. DeFi impacts crypto trading through new tokens, liquidity pools, and automated market makers (AMMs) like Uniswap.",
          keywords: ["DeFi", "decentralized finance", "yield farming", "liquidity pools"]
        },
        {
          question: "How to analyze market sentiment for better trading decisions?",
          answer: "Market sentiment analysis involves gauging trader emotions and market psychology. Use tools like Fear & Greed Index, social media sentiment, news analysis, and positioning data. Contrarian approaches often work well - when everyone is extremely bullish or bearish, reversals may occur.",
          keywords: ["market sentiment", "trader psychology", "fear and greed", "contrarian trading"]
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.title, categoryId: category.id }))
  );

  const filteredQuestions = searchTerm 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : allQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        <MobileNavigation />
        
        <div className="p-4 md:p-8 pt-20 lg:pt-8">
        
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 text-gradient animate-bounce-in font-vogun">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto animate-slide-up">
            Get answers to the most common questions about forex trading, cryptocurrency, and financial markets
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-md mx-auto relative animate-slide-in">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
            />
          </div>
        </header>

        {!searchTerm ? (
          /* Category View */
          <div className="space-y-8">
            {faqCategories.map((category, index) => (
              <Card key={category.id} className="glass-card animate-slide-in hover:shadow-xl transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-vogun">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      {category.icon}
                    </div>
                    {category.title}
                    <Badge variant="outline" className="ml-auto">
                      {category.questions.length} questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, qIndex) => (
                      <AccordionItem key={qIndex} value={`${category.id}-${qIndex}`} className="border border-border/30 rounded-lg px-4">
                        <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-2 pb-4">
                          <p className="mb-3">{faq.answer}</p>
                          <div className="flex flex-wrap gap-2">
                            {faq.keywords.map((keyword, kIndex) => (
                              <Badge key={kIndex} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Search Results View */
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 font-vogun">Search Results</h2>
              <p className="text-muted-foreground">
                Found {filteredQuestions.length} results for "{searchTerm}"
              </p>
            </div>
            
            {filteredQuestions.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="text-muted-foreground mb-4">No questions found matching your search.</p>
                <p className="text-sm text-muted-foreground">Try different keywords or browse by category above.</p>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredQuestions.map((faq, index) => (
                  <Card key={index} className="glass-card animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <AccordionItem value={`search-${index}`} className="border-none">
                      <AccordionTrigger className="px-6 py-4 text-left font-medium hover:text-primary transition-colors">
                        <div>
                          <div>{faq.question}</div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        <p className="mb-3">{faq.answer}</p>
                        <div className="flex flex-wrap gap-2">
                          {faq.keywords.map((keyword, kIndex) => (
                            <Badge key={kIndex} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                ))}
              </Accordion>
            )}
          </div>
        )}

        {/* SEO Footer */}
        <footer className="mt-16 py-8 border-t border-border/30 bg-card/30 rounded-lg backdrop-blur-sm">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold font-vogun">Still have questions?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive FAQ covers everything from basic forex and crypto trading concepts to advanced strategies and risk management. 
              These questions are based on real searches and concerns from traders worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                🎓 Trading Education
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                📈 Market Analysis
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                🛡️ Risk Management
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                💡 Trading Strategies
              </Badge>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default FAQ;