import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Repeat, TrendingUp, Wallet, PiggyBank, Plus, Clock, Calendar, Settings, Trash2, ChevronRight, BarChart3, DollarSign, Activity, Sparkles, Target, Coins, Landmark, ArrowUpRight } from 'lucide-react';

interface RecurringPlan {
  id: string;
  crypto: string;
  amount: number;
  currency: string;
  frequency: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  nextBuy: string;
  totalInvested: number;
  currentValue: number;
  status: 'active' | 'paused' | 'completed';
  purchases: number;
  startDate: string;
}

const activePlans: RecurringPlan[] = [
  { id: 'r1', crypto: 'BTC', amount: 5, currency: 'USD', frequency: 'Weekly', nextBuy: '2025-06-08', totalInvested: 85, currentValue: 91.20, status: 'active', purchases: 17, startDate: '2025-02-01' },
  { id: 'r2', crypto: 'ETH', amount: 10, currency: 'USD', frequency: 'Monthly', nextBuy: '2025-06-15', totalInvested: 40, currentValue: 43.50, status: 'active', purchases: 4, startDate: '2025-03-01' },
  { id: 'r3', crypto: 'SOL', amount: 3, currency: 'USD', frequency: 'Daily', nextBuy: '2025-06-06', totalInvested: 270, currentValue: 312.80, status: 'active', purchases: 90, startDate: '2025-03-01' },
  { id: 'r4', crypto: 'USDT', amount: 2, currency: 'USD', frequency: 'Daily', nextBuy: '2025-06-06', totalInvested: 120, currentValue: 120, status: 'paused', purchases: 60, startDate: '2025-04-01' },
];

const popularPlans = [
  { name: 'Bitcoin Weekly', crypto: 'BTC', amount: '$5', frequency: 'Weekly', description: 'Build Bitcoin position slowly over time', roi: '+12.4%', followers: '8,450' },
  { name: 'Crypto Index', crypto: 'Basket', amount: '$10', frequency: 'Monthly', description: 'Invest in top 10 crypto by market cap', roi: '+8.7%', followers: '5,230' },
  { name: 'Top 10 Tokens', crypto: 'Basket', amount: '$20', frequency: 'Weekly', description: 'Diversified weekly crypto investment', roi: '+15.2%', followers: '3,890' },
  { name: 'ETH Builder', crypto: 'ETH', amount: '$25', frequency: 'Monthly', description: 'Build Ethereum position for staking', roi: '+9.8%', followers: '6,120' },
  { name: 'Solana Power', crypto: 'SOL', amount: '$10', frequency: 'Weekly', description: 'High-growth Solana DCA strategy', roi: '+22.1%', followers: '2,450' },
  { name: 'Stable Yield', crypto: 'USDC', amount: '$100', frequency: 'Monthly', description: 'Earn 12% APY on stablecoin savings', roi: '+3.0%', followers: '1,890' },
];

const cryptoOptions = [
  { value: 'BTC', label: '₿ Bitcoin' },
  { value: 'ETH', label: '⟠ Ethereum' },
  { value: 'USDT', label: '₮ Tether' },
  { value: 'SOL', label: '◎ Solana' },
  { value: 'BNB', label: '◆ BNB' },
  { value: 'ADA', label: '🅰 Cardano' },
  { value: 'DOT', label: '● Polkadot' },
  { value: 'AVAX', label: '▲ Avalanche' },
  { value: 'MATIC', label: '⬡ Polygon' },
  { value: 'LINK', label: '🔗 Chainlink' },
];

const RecurringBuys = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [selectedFrequency, setSelectedFrequency] = useState('Weekly');
  const [amount, setAmount] = useState('5');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const totalInvested = activePlans.reduce((s, p) => s + p.totalInvested, 0);
  const totalValue = activePlans.reduce((s, p) => s + p.currentValue, 0);
  const totalReturn = totalValue - totalInvested;
  const roi = ((totalValue - totalInvested) / totalInvested * 100);

  return (
    <>
      <SEOHead title="Recurring Crypto Buys - DCA Nano-Investing | FINHUBAFRICA" description="Start investing in crypto with as little as $0.10. Set up recurring buys daily, weekly or monthly. Dollar-cost averaging made simple for African investors." />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-4 px-4 py-1.5">
                <Sparkles className="h-4 w-4 mr-1" /> Nano-Investing
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Start Investing with{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">as Little as $0.10</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Set up recurring buys and build your crypto portfolio automatically. Dollar-cost averaging made simple for African investors.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg px-8 py-6">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Recurring Buy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Create Recurring Buy</DialogTitle><DialogDescription>Set up automatic crypto purchases</DialogDescription></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Crypto</label>
                      <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {cryptoOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Amount</label>
                      <div className="flex gap-2">
                        <Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="flex-1" />
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="KES">KES</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="GHS">GHS</SelectItem>
                            <SelectItem value="ZAR">ZAR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Frequency</label>
                      <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                      Start Recurring Buy
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto">
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xl font-bold">${totalInvested.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Total Invested</div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4 text-center">
                  <Wallet className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-xl font-bold">${totalValue.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">Current Value</div>
                </CardContent>
              </Card>
              <Card className={`${totalReturn >= 0 ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  <div className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Return</div>
                </CardContent>
              </Card>
              <Card className="border-purple-500/30 bg-purple-500/5">
                <CardContent className="p-4 text-center">
                  <Activity className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-xl font-bold text-purple-400">{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="plans"><Clock className="h-4 w-4 mr-2" />Active Plans</TabsTrigger>
              <TabsTrigger value="explore"><Target className="h-4 w-4 mr-2" />Explore Plans</TabsTrigger>
              <TabsTrigger value="roundup"><PiggyBank className="h-4 w-4 mr-2" />Round-Up</TabsTrigger>
            </TabsList>
          <TabsContent value="plans" className="space-y-4">
            {activePlans.map(plan => (
              <Card key={plan.id} className="border-border/30 hover:border-emerald-500/30">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${plan.status === 'active' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                        <Repeat className={`h-5 w-5 ${plan.status === 'active' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plan.crypto} · ${plan.amount}/{plan.frequency === 'Daily' ? 'day' : plan.frequency === 'Weekly' ? 'wk' : plan.frequency === 'Bi-Weekly' ? '2wk' : 'mo'}</span>
                          <Badge className={plan.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}>
                            {plan.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="mr-3"><Calendar className="h-3 w-3 inline mr-1" />Next: {plan.nextBuy}</span>
                          <span>{plan.purchases} purchases · Started {plan.startDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${plan.currentValue.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Invested: ${plan.totalInvested.toFixed(2)}</div>
                      <div className={`text-xs font-medium ${plan.currentValue >= plan.totalInvested ? 'text-green-400' : 'text-red-400'}`}>
                        {plan.currentValue >= plan.totalInvested ? '+' : ''}${(plan.currentValue - plan.totalInvested).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={(plan.currentValue / plan.totalInvested) * 100} className="h-1.5 flex-1" />
                    <Button size="sm" variant="ghost"><Settings className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-400"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="explore">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPlans.map((plan, i) => (
                <Card key={i} className="border-border/30 hover:border-emerald-500/30">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">{plan.frequency}</Badge>
                      <span className="text-xs text-muted-foreground">👥 {plan.followers}</span>
                    </div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <div className="text-lg font-bold">{plan.amount}</div>
                        <div className="text-xs text-muted-foreground">per {plan.frequency.toLowerCase().replace('-', ' ')}</div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">{plan.roi} ROI</Badge>
                    </div>
                    <Button className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white" size="sm">
                      Start This Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roundup">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-8 text-center">
                <PiggyBank className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Round-Up Savings</h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  Connect your mobile money or bank account. Every time you make a purchase, we round up the change and invest it in crypto automatically.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                  <div className="p-3 rounded-lg bg-muted/20">
                    <div className="text-2xl font-bold text-amber-400">$0.42</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <div className="text-2xl font-bold text-amber-400">$12.80</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20">
                    <div className="text-2xl font-bold text-amber-400">$48.30</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Enable Round-Up
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>

        {/* How DCA Works */}
        <section className="py-16 border-t border-border/40">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Dollar-Cost Averaging?</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="border-border/30">
                <CardContent className="p-6">
                  <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Remove Emotion</h3>
                  <p className="text-sm text-muted-foreground">Invest automatically regardless of market conditions. No FOMO, no panic selling.</p>
                </CardContent>
              </Card>
              <Card className="border-border/30">
                <CardContent className="p-6">
                  <Coins className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Buy the Dips</h3>
                  <p className="text-sm text-muted-foreground">When prices drop, your fixed amount buys more crypto. You get a better average price.</p>
                </CardContent>
              </Card>
              <Card className="border-border/30">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Small Start, Big Future</h3>
                  <p className="text-sm text-muted-foreground">Start with just $0.10. Consistent small investments compound into significant wealth over time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default RecurringBuys;