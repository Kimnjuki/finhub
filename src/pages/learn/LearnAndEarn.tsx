import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, BookOpen, Award, Trophy, Star, Search, Play, CheckCircle, Lock, TrendingUp, Clock, DollarSign, ChevronRight, Sparkles, Zap, Brain, BarChart3, Shield, Wallet, Coins, Gem, Users, ExternalLink, FileText, Video } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  quiz: { question: string; options: string[]; correct: number }[];
  externalLinks?: { title: string; url: string; type: 'article' | 'video' | 'documentation' }[];
}

interface Course {
  id: string;
  title: string; 
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reward: number;
  duration: string;
  lessons: Lesson[];
  enrolled: number;
  trending: boolean;
  isNew: boolean;
  icon: string;
  color: string;
  progress: number;
  externalLinks?: { title: string; url: string; type: 'article' | 'video' | 'documentation' | 'guide' }[];
}

const recommendedResources: { title: string; url: string; type: 'article' | 'video' | 'documentation' | 'guide'; description: string }[] = [
  { title: "Bitcoin Whitepaper", url: "https://bitcoin.org/bitcoin.pdf", type: "documentation", description: "The original whitepaper by Satoshi Nakamoto - essential reading" },
  { title: "Ethereum Documentation", url: "https://ethereum.org/en/developers/docs/", type: "documentation", description: "Comprehensive guide to Ethereum and smart contracts" },
  { title: "DeFi Education by Binance Academy", url: "https://academy.binance.com/en/articles/what-is-defi", type: "guide", description: "Beginner-friendly guide to Decentralized Finance" },
  { title: "Crypto Security Best Practices", url: "https://www.coindesk.com/learn/crypto-security/", type: "article", description: "Essential security practices for protecting digital assets" },
  { title: "TradingView Educational Resources", url: "https://www.tradingview.com/education/", type: "guide", description: "Learn technical analysis and chart patterns" },
  { title: "Stablecoins in Africa", url: "https://www.chainalysis.com/blog/africa-cryptocurrency-adoption-2023/", type: "article", description: "Understanding stablecoin adoption in African markets" },
  { title: "NFTs for Beginners", url: "https://ethereum.org/en/nft/", type: "documentation", description: "Official Ethereum guide to non-fungible tokens" },
  { title: "How to Buy Bitcoin in Africa", url: "https://www.investopedia.com/technical-analysis/", type: "guide", description: "Step-by-step guide to purchasing crypto in Africa" }
];

const courses: Course[] = [
  { id: '1', title: 'Bitcoin Basics', description: 'Learn what Bitcoin is, how it works, and why it matters for Africa', category: 'Bitcoin', difficulty: 'Beginner', reward: 5, duration: '15 min', lessons: [
    { id: 'l1', title: 'What is Bitcoin?', duration: '5 min', completed: true, locked: false, externalLinks: [{ title: "Bitcoin.org - How it Works", url: "https://bitcoin.org/en/how-it-works", type: "documentation" }, { title: "Bitcoin Whitepaper", url: "https://bitcoin.org/bitcoin.pdf", type: "documentation" }], quiz: [{ question: 'Who created Bitcoin?', options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Elon Musk', 'Changpeng Zhao'], correct: 1 }, { question: 'What is the maximum supply of Bitcoin?', options: ['10 million', '21 million', '100 million', 'Unlimited'], correct: 1 }] },
    { id: 'l2', title: 'How Bitcoin Mining Works', duration: '5 min', completed: false, locked: false, externalLinks: [{ title: "Bitcoin Mining Explained", url: "https://www.investopedia.com/terms/b/bitcoin-mining.asp", type: "article" }], quiz: [{ question: 'What is Bitcoin mining?', options: ['Creating new Bitcoins from thin air', 'Solving complex math problems to validate transactions', 'Buying Bitcoin on exchanges', 'Trading Bitcoin for profit'], correct: 1 }] },
    { id: 'l3', title: 'Bitcoin Wallets & Security', duration: '5 min', completed: false, locked: true, externalLinks: [{ title: "How to Choose a Bitcoin Wallet", url: "https://bitcoin.org/en/choose-your-wallet", type: "documentation" }], quiz: [{ question: 'What is a private key?', options: ['Your wallet address', 'A password to recover your account', 'A secret number that proves ownership of Bitcoin', 'Your email password'], correct: 2 }] },
  ], enrolled: 12450, trending: true, isNew: false, icon: '₿', color: 'orange', progress: 33, externalLinks: [{ title: "Bitcoin.org", url: "https://bitcoin.org/en/", type: "documentation" }, { title: "Bitcoin for Beginners", url: "https://www.bitpanda.com/academy/en", type: "guide" }] },
  { id: '2', title: 'Ethereum & Smart Contracts', description: 'Understand Ethereum, smart contracts, and decentralized applications', category: 'Ethereum', difficulty: 'Beginner', reward: 5, duration: '20 min', lessons: [
    { id: 'l4', title: 'What is Ethereum?', duration: '5 min', completed: false, locked: false, externalLinks: [{ title: "Ethereum.org", url: "https://ethereum.org/en/", type: "documentation" }, { title: "What is Ethereum?", url: "https://www.investopedia.com/terms/e/ethereum.asp", type: "article" }], quiz: [{ question: 'Who proposed Ethereum?', options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Charles Hoskinson', 'Brad Garlinghouse'], correct: 1 }] },
    { id: 'l5', title: 'Smart Contracts Explained', duration: '5 min', completed: false, locked: true, externalLinks: [{ title: "Smart Contract Guide", url: "https://ethereum.org/en/developers/docs/smart-contracts/", type: "documentation" }], quiz: [{ question: 'What is a smart contract?', options: ['A legal contract on paper', 'Self-executing code on the blockchain', 'A contract between two exchanges', 'A type of cryptocurrency'], correct: 1 }] },
    { id: 'l6', title: 'dApps & DeFi on Ethereum', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l7', title: 'Gas Fees & Transactions', duration: '5 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 8930, trending: true, isNew: false, icon: '⟠', color: 'blue', progress: 0, externalLinks: [{ title: "Ethereum Developer Docs", url: "https://ethereum.org/en/developers/docs/", type: "documentation" }, { title: "Intro to Smart Contracts", url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ", type: "video" }] },
  { id: '3', title: 'DeFi Fundamentals', description: 'Decentralized Finance: lending, borrowing, yield farming, and more', category: 'DeFi', difficulty: 'Intermediate', reward: 8, duration: '25 min', lessons: [
    { id: 'l8', title: 'What is DeFi?', duration: '5 min', completed: false, locked: false, quiz: [] },
    { id: 'l9', title: 'Lending & Borrowing Protocols', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l10', title: 'Yield Farming & Liquidity Pools', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l11', title: 'DeFi Risks & Security', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l12', title: 'DeFi on African Blockchains', duration: '5 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 5670, trending: false, isNew: true, icon: '🏦', color: 'purple', progress: 0 },
  { id: '4', title: 'Crypto Security', description: 'Essential security practices to keep your crypto safe', category: 'Security', difficulty: 'Beginner', reward: 3, duration: '10 min', lessons: [
    { id: 'l13', title: 'Common Crypto Scams', duration: '5 min', completed: false, locked: false, quiz: [] },
    { id: 'l14', title: 'Hardware Wallets & Best Practices', duration: '5 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 15230, trending: true, isNew: false, icon: '🔒', color: 'red', progress: 0 },
  { id: '5', title: 'Trading Strategies', description: 'Professional trading strategies for crypto markets', category: 'Trading', difficulty: 'Advanced', reward: 10, duration: '35 min', lessons: [
    { id: 'l15', title: 'Technical Analysis Basics', duration: '6 min', completed: false, locked: false, quiz: [] },
    { id: 'l16', title: 'Support & Resistance Levels', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l17', title: 'RSI, MACD & Moving Averages', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l18', title: 'Risk Management', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l19', title: 'Position Sizing', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l20', title: 'Trading Psychology', duration: '6 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 3450, trending: false, isNew: true, icon: '📈', color: 'green', progress: 0 },
  { id: '6', title: 'NFT Explained', description: 'Non-Fungible Tokens: digital art, collectibles, and the metaverse', category: 'NFT', difficulty: 'Intermediate', reward: 6, duration: '15 min', lessons: [
    { id: 'l21', title: 'What are NFTs?', duration: '5 min', completed: false, locked: false, quiz: [] },
    { id: 'l22', title: 'Creating & Buying NFTs', duration: '5 min', completed: false, locked: true, quiz: [] },
    { id: 'l23', title: 'NFT Use Cases in Africa', duration: '5 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 6780, trending: true, isNew: false, icon: '🎨', color: 'pink', progress: 0 },
  { id: '7', title: 'Stablecoins', description: 'How stablecoins work and their role in African finance', category: 'Stablecoins', difficulty: 'Beginner', reward: 4, duration: '10 min', lessons: [
    { id: 'l24', title: 'What are Stablecoins?', duration: '5 min', completed: false, locked: false, quiz: [] },
    { id: 'l25', title: 'USDT, USDC, DAI & African Stablecoins', duration: '5 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 11230, trending: false, isNew: false, icon: '💲', color: 'green', progress: 0 },
  { id: '8', title: 'Technical Analysis', description: 'Master chart patterns, indicators, and market analysis', category: 'Trading', difficulty: 'Advanced', reward: 12, duration: '30 min', lessons: [
    { id: 'l26', title: 'Candlestick Patterns', duration: '6 min', completed: false, locked: false, quiz: [] },
    { id: 'l27', title: 'Chart Patterns', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l28', title: 'Indicators & Oscillators', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l29', title: 'Volume Analysis', duration: '6 min', completed: false, locked: true, quiz: [] },
    { id: 'l30', title: 'Putting It All Together', duration: '6 min', completed: false, locked: true, quiz: [] },
  ], enrolled: 2890, trending: false, isNew: true, icon: '📊', color: 'cyan', progress: 0 },
];

const categories = ['All', 'Beginner', 'Intermediate', 'Advanced', 'DeFi', 'Trading', 'Security', 'Bitcoin', 'Ethereum', 'Stablecoins', 'NFT'];

const getLinkIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="h-3 w-3" />;
    case 'documentation': return <FileText className="h-3 w-3" />;
    default: return <ExternalLink className="h-3 w-3" />;
  }
};

const LearnAndEarn = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResourcesMap, setShowResourcesMap] = useState<Record<string, boolean>>({});

  const totalEarned = 5;
  const totalAvailable = courses.reduce((sum, c) => sum + c.reward, 0);

  const filteredCourses = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory === 'All') return true;
    if (['Beginner', 'Intermediate', 'Advanced'].includes(activeCategory)) return c.difficulty === activeCategory;
    return c.category === activeCategory;
  });

  const handleQuizAnswer = (lessonId: string, questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [`${lessonId}-${questionIndex}`]: answerIndex }));
  };

  const toggleShowResources = (courseId: string) => {
    setShowResourcesMap(prev => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const renderCourseDetail = (course: Course) => {
    const showResources = showResourcesMap[course.id] || false;
    return (
      <Card key={course.id} className="border-border/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className={`text-3xl`}>{course.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  <Badge variant={course.difficulty === 'Beginner' ? 'default' : course.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} className="text-[10px]">
                    {course.difficulty}
                  </Badge>
                  {course.trending && <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30"><TrendingUp className="h-3 w-3 mr-0.5" />Trending</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span><Clock className="h-3 w-3 inline mr-1" />{course.duration}</span>
                  <span><BookOpen className="h-3 w-3 inline mr-1" />{course.lessons.length} lessons</span>
                  <span><DollarSign className="h-3 w-3 inline mr-1" />Earn ${course.reward}</span>
                  <span><Users className="h-3 w-3 inline mr-1" />{course.enrolled.toLocaleString()} enrolled</span>
                </div>
              </div>
            </div>
            {course.progress > 0 && (
              <div className="text-right">
                <div className="text-sm font-medium">{course.progress}%</div>
                <Progress value={course.progress} className="w-20 h-1.5 mt-1" />
              </div>
            )}
          </div>

          {course.externalLinks && (
            <div className="mb-4">
              <button 
                onClick={() => toggleShowResources(course.id)}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {showResources ? 'Hide' : 'Show'} Recommended Resources ({course.externalLinks.length})
              </button>
              {showResources && (
                <div className="mt-2 space-y-1.5">
                  {course.externalLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 border border-border/20 transition-colors group"
                    >
                      {getLinkIcon(link.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground group-hover:text-blue-400 transition-colors truncate">{link.title}</div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-blue-400" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 mt-2">
            {course.lessons.map((lesson, li) => (
              <div key={lesson.id}>
                <div className={`p-3 rounded-lg border ${lesson.completed ? 'border-green-500/30 bg-green-500/5' : lesson.locked ? 'border-border/20 bg-muted/10 opacity-60' : 'border-border/30 hover:border-blue-500/30 cursor-pointer'}`}
                  onClick={() => !lesson.locked && setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {lesson.completed ? <CheckCircle className="h-4 w-4 text-green-400" /> : lesson.locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Play className="h-4 w-4 text-blue-400" />}
                      <span className="text-sm">{lesson.title}</span>
                      <Badge variant="outline" className="text-[10px]">{lesson.duration}</Badge>
                    </div>
                    {lesson.completed && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">Completed</Badge>}
                  </div>
                </div>

                {activeLesson === lesson.id && lesson.quiz.length > 0 && (
                  <div className="mt-2 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    {lesson.externalLinks && (
                      <div className="mb-4 pb-4 border-b border-border/20">
                        <h4 className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
                          <ExternalLink className="h-3 w-3" />
                          Recommended Learning Resources
                        </h4>
                        <div className="space-y-1.5">
                          {lesson.externalLinks.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-500/10 border border-blue-500/20 transition-colors"
                            >
                              {getLinkIcon(link.type)}
                              <span className="text-xs text-blue-300">{link.title}</span>
                              <ExternalLink className="h-3 w-3 ml-auto text-blue-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <h4 className="text-sm font-medium mb-3">Quick Quiz</h4>
                    {lesson.quiz.map((q, qi) => (
                      <div key={qi} className="mb-3 last:mb-0">
                        <p className="text-sm mb-2">{q.question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <button key={oi} className={`p-2 rounded-lg text-xs text-left border transition-colors ${
                              selectedAnswers[`${lesson.id}-${qi}`] === oi 
                                ? oi === q.correct 
                                  ? 'border-green-500 bg-green-500/10 text-green-400' 
                                  : 'border-red-500 bg-red-500/10 text-red-400'
                                : 'border-border/30 hover:border-blue-500/30'
                            }`}
                              onClick={() => handleQuizAnswer(lesson.id, qi, oi)}
                              disabled={selectedAnswers[`${lesson.id}-${qi}`] !== undefined}>
                              {opt}
                            </button>
                          ))}
                        </div>
                        {selectedAnswers[`${lesson.id}-${qi}`] !== undefined && (
                          <p className={`text-xs mt-1 ${selectedAnswers[`${lesson.id}-${qi}`] === q.correct ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedAnswers[`${lesson.id}-${qi}`] === q.correct ? '✓ Correct!' : `✗ Incorrect. The answer is: ${q.options[q.correct]}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SEOHead title="Learn & Earn Crypto - Free Crypto Education | FINHUBAFRICA" description="Learn about Bitcoin, Ethereum, DeFi and earn free crypto rewards. Complete lessons and quizzes to earn crypto. Start your crypto education journey today." />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-blue-500/10" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-4 px-4 py-1.5">
                <GraduationCap className="h-4 w-4 mr-1" /> Learn & Earn
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Learn Crypto.{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Earn Crypto.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Complete lessons, pass quizzes, and earn free crypto rewards. Start your journey from complete beginner to crypto expert.
              </p>
              
              <div className="flex justify-center gap-6">
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Award className="h-8 w-8 text-green-400" />
                    <div className="text-left"><div className="text-2xl font-bold text-green-400">${totalEarned}</div><div className="text-xs text-muted-foreground">Total Earned</div></div>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/30 bg-purple-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-purple-400" />
                    <div className="text-left"><div className="text-2xl font-bold text-purple-400">${totalAvailable}</div><div className="text-xs text-muted-foreground">Available to Earn</div></div>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                    <div className="text-left"><div className="text-2xl font-bold text-blue-400">{courses.length}</div><div className="text-xs text-muted-foreground">Courses</div></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="overflow-x-auto">
                {categories.map(cat => <TabsTrigger key={cat} value={cat} className="text-xs">{cat}</TabsTrigger>)}
              </TabsList>
            </Tabs>
          </div>

          {/* Continue Learning */}
          {courses.filter(c => c.progress > 0 && c.progress < 100).length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Play className="h-5 w-5 text-blue-400" /> Continue Learning</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courses.filter(c => c.progress > 0 && c.progress < 100).map(course => (
                  <Card key={`continue-${course.id}`} className="border-blue-500/20 bg-blue-500/5 cursor-pointer" onClick={() => setActiveCourse(activeCourse === course.id ? null : course.id)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="text-2xl">{course.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{course.title}</div>
                        <Progress value={course.progress} className="h-1.5 mt-2" />
                        <div className="text-xs text-muted-foreground mt-1">{course.progress}% complete</div>
                      </div>
                      <Play className="h-5 w-5 text-blue-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Course Grid */}
          <div className="space-y-4">
            {filteredCourses.map(course => renderCourseDetail(course))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnAndEarn;