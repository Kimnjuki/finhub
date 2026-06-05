import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, Copy, TrendingUp, Star, MessageCircle, Heart, Share2, Award, Crown, BarChart3, Activity, UserPlus, ChevronRight, Target, Zap, Flame, Shield, Clock, DollarSign, Search, Filter, Trophy, CheckCircle } from 'lucide-react';

interface Trader {
  id: number;
  name: string;
  avatar: string;
  rank: number;
  pnl30d: number;
  pnlPercent: number;
  followers: number;
  roi: number;
  riskScore: number;
  winRate: number;
  avgTradeDuration: string;
  totalPnl: number;
  level: 'Diamond' | 'Gold' | 'Silver';
  isFollowing: boolean;
}

interface TradeFeed {
  id: number;
  traderName: string;
  action: 'buy' | 'sell';
  asset: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
  likes: number;
  comments: number;
  followed: boolean;
}

const traders: Trader[] = [
  { id: 1, name: 'CryptoKing_KE', avatar: 'CK', rank: 1, pnl30d: 45230, pnlPercent: 28.4, followers: 12450, roi: 142.8, riskScore: 4, winRate: 78.5, avgTradeDuration: '6h 23m', totalPnl: 285000, level: 'Diamond', isFollowing: true },
  { id: 2, name: 'BitcoinWhaleNG', avatar: 'BW', rank: 2, pnl30d: 38100, pnlPercent: 22.1, followers: 8930, roi: 98.3, riskScore: 6, winRate: 72.1, avgTradeDuration: '12h 45m', totalPnl: 190000, level: 'Diamond', isFollowing: false },
  { id: 3, name: 'SavageTraderSA', avatar: 'ST', rank: 3, pnl30d: 28450, pnlPercent: 35.7, followers: 5670, roi: 215.4, riskScore: 8, winRate: 65.3, avgTradeDuration: '3h 12m', totalPnl: 420000, level: 'Gold', isFollowing: true },
  { id: 4, name: 'DeFi_Queen_GH', avatar: 'DQ', rank: 4, pnl30d: 22100, pnlPercent: 18.9, followers: 4320, roi: 76.2, riskScore: 3, winRate: 85.2, avgTradeDuration: '24h 10m', totalPnl: 125000, level: 'Gold', isFollowing: false },
  { id: 5, name: 'AltcoinKing_TZ', avatar: 'AK', rank: 5, pnl30d: 18900, pnlPercent: 42.3, followers: 3450, roi: 267.8, riskScore: 9, winRate: 58.9, avgTradeDuration: '2h 05m', totalPnl: 580000, level: 'Gold', isFollowing: false },
  { id: 6, name: 'StableHand_UG', avatar: 'SH', rank: 6, pnl30d: 12500, pnlPercent: 12.8, followers: 2890, roi: 45.6, riskScore: 2, winRate: 91.4, avgTradeDuration: '48h 30m', totalPnl: 85000, level: 'Silver', isFollowing: true },
];

const tradeFeed: TradeFeed[] = [
  { id: 1, traderName: 'CryptoKing_KE', action: 'buy', asset: 'BTC', entryPrice: 87600, exitPrice: 92300, pnl: 4700, pnlPercent: 5.36, timestamp: '12 min ago', likes: 234, comments: 28, followed: true },
  { id: 2, traderName: 'SavageTraderSA', action: 'sell', asset: 'ETH', entryPrice: 3450, exitPrice: 3280, pnl: -170, pnlPercent: -4.93, timestamp: '45 min ago', likes: 156, comments: 42, followed: true },
  { id: 3, traderName: 'BitcoinWhaleNG', action: 'buy', asset: 'SOL', entryPrice: 142, exitPrice: 168, pnl: 2600, pnlPercent: 18.31, timestamp: '2h ago', likes: 89, comments: 15, followed: false },
  { id: 4, traderName: 'DeFi_Queen_GH', action: 'buy', asset: 'LINK', entryPrice: 14.20, exitPrice: 15.80, pnl: 1600, pnlPercent: 11.27, timestamp: '3h ago', likes: 312, comments: 45, followed: false },
];

const SocialTrading = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [search, setSearch] = useState('');
  const [copyAmount, setCopyAmount] = useState('100');

  const filteredTraders = traders.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Diamond': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Gold': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Silver': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default: return '';
    }
  };

  const renderCopyDialog = (trader: Trader) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Copy className="h-3 w-3 mr-1" /> Copy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Copy {trader.name}</DialogTitle>
          <DialogDescription>Automatically mirror their trades proportionally</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <Avatar><AvatarFallback className="bg-purple-500/10 text-purple-400">{trader.avatar}</AvatarFallback></Avatar>
            <div><div className="font-medium">{trader.name}</div><div className="text-xs text-muted-foreground">{trader.winRate}% win rate · {trader.roi}% ROI</div></div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Copy Amount (USD)</label>
            <Input value={copyAmount} onChange={e => setCopyAmount(e.target.value)} placeholder="100" />
          </div>
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Your investment</span><span className="font-medium">${copyAmount}</span></div>
            <div className="flex justify-between"><span>Max per trade</span><span className="font-medium">${(parseFloat(copyAmount) * 0.2).toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Copy fee</span><span className="font-medium text-green-400">Free</span></div>
          </div>
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">Start Copy Trading</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <SEOHead title="Social & Copy Trading - Follow Top Crypto Traders | FINHUBAFRICA" description="Follow and copy top crypto traders in Africa. Social trading platform with real-time trade feeds, leaderboards, and automated copy trading." />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-rose-500/10" />
          <div className="container mx-auto px-4 py-12 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 mb-3 px-3 py-1">
                  <Users className="h-4 w-4 mr-1" /> Social Trading
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Follow & Copy Top Traders</h1>
                <p className="text-muted-foreground">Learn from Africa's best traders. Copy their trades automatically.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <UserPlus className="h-4 w-4 mr-2" /> Become a Trader
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Become a Trader</DialogTitle><DialogDescription>Let others follow and copy your trades</DialogDescription></DialogHeader>
                  <div className="space-y-3 mt-4">
                    {['Verified account required', 'Minimum 50 trades history', '80%+ completion rate', 'Positive P&L over 30 days', 'Share 10% of copying profits'].map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-400" />{req}</div>
                    ))}
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-2">Apply Now</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="border-purple-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-purple-400" /><div><div className="text-xl font-bold">{traders.length}</div><div className="text-xs text-muted-foreground">Top Traders</div></div>
                </CardContent>
              </Card>
              <Card className="border-green-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" /><div><div className="text-xl font-bold">$185K</div><div className="text-xs text-muted-foreground">Avg 30d P&L</div></div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" /><div><div className="text-xl font-bold">37K+</div><div className="text-xs text-muted-foreground">Copiers</div></div>
                </CardContent>
              </Card>
              <Card className="border-amber-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-400" /><div><div className="text-xl font-bold">$12.4M</div><div className="text-xs text-muted-foreground">AUM Copy Trading</div></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="leaderboard"><Award className="h-4 w-4 mr-2" />Leaderboard</TabsTrigger>
              <TabsTrigger value="feed"><Activity className="h-4 w-4 mr-2" />Trade Feed</TabsTrigger>
              <TabsTrigger value="following"><Users className="h-4 w-4 mr-2" />Following</TabsTrigger>
            </TabsList>
          </Tabs>

          <TabsContent value="leaderboard">
            <div className="relative max-w-xs mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search traders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="space-y-3">
              {filteredTraders.map(trader => (
                <Card key={trader.id} className="border-border/30 hover:border-purple-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                            <AvatarFallback className="bg-purple-500/10 text-purple-400">{trader.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] font-bold text-purple-400 border border-purple-500/30">{trader.rank}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{trader.name}</span>
                            <Badge className={`text-[10px] ${getLevelColor(trader.level)}`}>{trader.level}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span>👥 {trader.followers.toLocaleString()}</span>
                            <span>🎯 {trader.winRate}% win</span>
                            <span>⚠️ Risk {trader.riskScore}/10</span>
                            <span>⏱ {trader.avgTradeDuration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-bold ${trader.pnl30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.pnl30d >= 0 ? '+' : ''}${trader.pnl30d.toLocaleString()}
                        </div>
                        <div className={`text-xs ${trader.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.pnlPercent >= 0 ? '+' : ''}{trader.pnlPercent}% (30d)
                        </div>
                        <div className="text-xs text-muted-foreground">ROI: {trader.roi}%</div>
                        <div className="flex gap-1 mt-2 justify-end">
                          <Button size="sm" variant={trader.isFollowing ? 'default' : 'outline'} className={`text-xs ${trader.isFollowing ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}`}>
                            {trader.isFollowing ? 'Following' : 'Follow'}
                          </Button>
                          {renderCopyDialog(trader)}
                        </div>
                      </div>
                    </div>
                    {/* Mini performance bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Performance (30d)</span>
                        <span className={trader.pnl30d >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {trader.pnl30d >= 0 ? '+' : ''}{trader.pnlPercent}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div className={`h-full rounded-full ${trader.pnl30d >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`} 
                          style={{ width: `${Math.min(Math.abs(trader.pnlPercent), 100)}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feed" className="space-y-4">
            {tradeFeed.map(trade => (
              <Card key={trade.id} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-purple-500/10 text-purple-400">{trade.traderName.slice(0, 2)}</AvatarFallback></Avatar>
                      <div><span className="font-medium text-sm">{trade.traderName}</span><span className="text-xs text-muted-foreground ml-2">{trade.timestamp}</span></div>
                    </div>
                    <Badge className={trade.action === 'buy' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                      {trade.action.toUpperCase()} {trade.asset}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><div className="text-xs text-muted-foreground">Entry</div><div className="font-mono text-sm">${trade.entryPrice.toLocaleString()}</div></div>
                    <div><div className="text-xs text-muted-foreground">Exit</div><div className="font-mono text-sm">${trade.exitPrice.toLocaleString()}</div></div>
                    <div><div className="text-xs text-muted-foreground">P&L</div><div className={`font-mono text-sm font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString()} ({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%)
                    </div></div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-red-400"><Heart className="h-3.5 w-3.5" />{trade.likes}</button>
                    <button className="flex items-center gap-1 hover:text-blue-400"><MessageCircle className="h-3.5 w-3.5" />{trade.comments}</button>
                    <button className="flex items-center gap-1 hover:text-green-400"><Share2 className="h-3.5 w-3.5" />Share</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="following">
            <div className="grid md:grid-cols-2 gap-4">
              {traders.filter(t => t.isFollowing).map(trader => (
                <Card key={trader.id} className="border-purple-500/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback className="bg-purple-500/10 text-purple-400">{trader.avatar}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{trader.name}</div>
                        <div className="text-xs text-muted-foreground">Win: {trader.winRate}% · Risk: {trader.riskScore}/10</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Unfollow</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </div>
    </>
  );
};

export default SocialTrading;