import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, ArrowRight, CheckCircle, Shield, Zap, TrendingUp, Globe, Wallet, QrCode, Clock, Star, RefreshCw, Landmark, CreditCard, ArrowDownUp, Copy, ExternalLink, ChevronRight } from 'lucide-react';

const providers = [
  { name: 'M-Pesa', countries: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Mozambique', 'DRC', 'Ghana', 'Lesotho'], color: '#4CAF50', icon: '📱' },
  { name: 'Airtel Money', countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Malawi', 'Zambia', 'DRC', 'Niger', 'Chad', 'Madagascar'], color: '#E91E63', icon: '📲' },
  { name: 'MTN MoMo', countries: ['Ghana', 'Uganda', 'Rwanda', 'Côte d\'Ivoire', 'Cameroon', 'Nigeria', 'South Africa', 'Zambia', 'Liberia'], color: '#FFD700', icon: '💰' },
  { name: 'Orange Money', countries: ['Senegal', 'Mali', 'Burkina Faso', 'Guinea', 'Liberia', 'Sierra Leone', 'Cameroon', 'DRC'], color: '#FF6600', icon: '🟠' },
  { name: 'Wave', countries: ['Senegal', 'Côte d\'Ivoire', 'Burkina Faso'], color: '#2196F3', icon: '🌊' },
  { name: 'Chipper Cash', countries: ['Kenya', 'Nigeria', 'Ghana', 'Uganda', 'Tanzania', 'Rwanda', 'South Africa', 'Zambia'], color: '#9C27B0', icon: '⚡' },
];

const currencies = [
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 0.0078 },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 0.00067 },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 0.074 },
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿', rate: 0.00039 },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬', rate: 0.00027 },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 0.054 },
  { code: 'XAF', name: 'CFA Franc BEAC', flag: '🇨🇲', rate: 0.0016 },
  { code: 'XOF', name: 'CFA Franc BCEAO', flag: '🇸🇳', rate: 0.0016 },
  { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼', rate: 0.00079 },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹', rate: 0.018 },
];

const steps = [
  { icon: Smartphone, title: 'Choose Your Mobile Money', desc: 'Select M-Pesa, Airtel Money, MTN MoMo, or Orange Money' },
  { icon: Wallet, title: 'Enter Amount in Local Currency', desc: 'Start with as little as KES 10 / NGN 50' },
  { icon: CheckCircle, title: 'Confirm via USSD/App', desc: 'Authorize payment on your phone in seconds' },
  { icon: TrendingUp, title: 'Crypto Instantly in Wallet', desc: 'BTC, ETH, USDT or any supported crypto instantly credited' },
];

const transactions = [
  { type: 'buy', crypto: 'BTC', amount: '0.0025', local: 'KES 15,000', provider: 'M-Pesa', status: 'completed', date: '2025-06-03', fee: 0 },
  { type: 'sell', crypto: 'ETH', amount: '0.15', local: 'NGN 45,000', provider: 'Airtel Money', status: 'completed', date: '2025-06-02', fee: 0.5 },
  { type: 'buy', crypto: 'USDT', amount: '50', local: 'GHS 675', provider: 'MTN MoMo', status: 'pending', date: '2025-06-01', fee: 0 },
  { type: 'buy', crypto: 'SOL', amount: '5', local: 'KES 6,500', provider: 'M-Pesa', status: 'completed', date: '2025-05-30', fee: 0 },
];

const MobileMoney = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedProvider, setSelectedProvider] = useState('M-Pesa');
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  return (
    <>
      <SEOHead
        title="Mobile Money Crypto - Buy & Sell with M-Pesa, Airtel Money | FINHUBAFRICA"
        description="Africa's first mobile money crypto platform. Buy and sell Bitcoin, Ethereum, USDT and more with M-Pesa, Airtel Money, MTN MoMo, Orange Money. Zero fees for mobile money deposits."
        keywords="M-Pesa crypto, Airtel Money Bitcoin, MTN MoMo crypto, mobile money trading Africa, buy Bitcoin with M-Pesa, crypto Kenya, crypto Nigeria, crypto Ghana"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10" />
          <div className="container mx-auto px-4 py-16 lg:py-24 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-sm">
                  <Star className="h-4 w-4 mr-1 inline" />
                  Africa's First Mobile Money Crypto Platform
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  Buy & Sell Crypto with{' '}
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Mobile Money
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Use M-Pesa, Airtel Money, MTN MoMo, Orange Money and more. 
                  Zero fees on mobile money deposits. Start with as little as KES 10.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-2xl font-bold text-emerald-400">0%</div>
                    <div className="text-xs text-muted-foreground">Deposit Fees</div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">10+</div>
                    <div className="text-xs text-muted-foreground">Currencies</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">54</div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">6</div>
                    <div className="text-xs text-muted-foreground">Providers</div>
                  </div>
                </div>
              </div>
              
              {/* Buy/Sell Widget */}
              <Card className="border-emerald-500/30 bg-card/80 backdrop-blur">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">
                    {activeTab === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
                  </CardTitle>
                  <CardDescription>With your mobile money account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="buy">Buy</TabsTrigger>
                      <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">You Pay</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Enter amount" 
                          value={amount} 
                          onChange={e => setAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(c => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.flag} {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">You Receive</label>
                      <div className="flex gap-2">
                        <div className="flex-1 h-10 px-3 rounded-md border border-border bg-muted/20 flex items-center text-sm">
                          ~{amount ? (parseFloat(amount) * 0.000067).toFixed(6) : '0.000000'} BTC
                        </div>
                        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BTC">₿ BTC</SelectItem>
                            <SelectItem value="ETH">⟠ ETH</SelectItem>
                            <SelectItem value="USDT">₮ USDT</SelectItem>
                            <SelectItem value="SOL">◎ SOL</SelectItem>
                            <SelectItem value="BNB">◆ BNB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Mobile Money Provider</label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => (
                            <SelectItem key={p.name} value={p.name}>
                              {p.icon} {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/20 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex justify-between"><span>Exchange Rate</span><span>1 BTC = {(1 / 0.000067).toFixed(2)} KES</span></div>
                      <div className="flex justify-between"><span>Fee</span><span className="text-emerald-400">Free (Mobile Money)</span></div>
                      <div className="flex justify-between"><span>Estimated Arrival</span><span>~30 seconds</span></div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                      {activeTab === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Supported Providers */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Supported Mobile Money Providers</h2>
              <p className="text-muted-foreground">Available in 54 African countries</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map(provider => (
                <Card key={provider.name} className="border-border/30 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {provider.countries.slice(0, 4).map(c => (
                        <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                      ))}
                      {provider.countries.length > 4 && (
                        <Badge variant="outline" className="text-[10px]">+{provider.countries.length - 4}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Exchange Rates */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Live Exchange Rates</h2>
                <p className="text-muted-foreground">Real-time rates for African currencies</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-3">Currency</th>
                    <th className="text-right py-3 px-3">1 BTC</th>
                    <th className="text-right py-3 px-3">1 ETH</th>
                    <th className="text-right py-3 px-3">1 USDT</th>
                    <th className="text-right py-3 px-3">1 SOL</th>
                    <th className="text-right py-3 px-3">24h Change</th>
                    <th className="text-right py-3 px-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currencies.slice(0, 6).map(c => (
                    <tr key={c.code} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="py-3 px-3">
                        <span className="mr-2">{c.flag}</span>
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground ml-2">{c.name}</span>
                      </td>
                      <td className="text-right py-3 px-3 font-mono">{(98000 / (c.rate || 0.001)).toFixed(2)}</td>
                      <td className="text-right py-3 px-3 font-mono">{(3500 / (c.rate || 0.001)).toFixed(2)}</td>
                      <td className="text-right py-3 px-3 font-mono">{(1 / (c.rate || 0.001)).toFixed(2)}</td>
                      <td className="text-right py-3 px-3 font-mono">{(180 / (c.rate || 0.001)).toFixed(2)}</td>
                      <td className="text-right py-3 px-3 text-green-500">+2.4%</td>
                      <td className="text-right py-3 px-3">
                        <Button size="sm" variant="ghost" className="text-emerald-400">Buy</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground">Buy crypto with mobile money in 4 simple steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <Card key={i} className="border-border/30 relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Transaction History */}
        <section className="py-16 border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Recent Transactions</h2>
                <p className="text-muted-foreground">Your mobile money crypto activity</p>
              </div>
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <Card key={i} className="border-border/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {tx.type === 'buy' ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingUp className="h-5 w-5 text-red-400 rotate-180" />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {tx.type === 'buy' ? 'Bought' : 'Sold'} {tx.crypto}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.local} via {tx.provider}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">{tx.amount} {tx.crypto}</div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                          {tx.status}
                        </Badge>
                        {tx.fee === 0 && (
                          <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">No Fee</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Why Choose FinHubAfrica Mobile Money</h2>
              <p className="text-muted-foreground">Built for Africans, by Africans</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-emerald-400 mb-3" />
                  <h3 className="font-semibold mb-2">Zero Fees</h3>
                  <p className="text-sm text-muted-foreground">No deposit fees for mobile money transactions. Keep 100% of your crypto.</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold mb-2">Instant Settlement</h3>
                  <p className="text-sm text-muted-foreground">Crypto credited within 30 seconds of mobile money confirmation via USSD/app.</p>
                </CardContent>
              </Card>
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="p-6">
                  <Globe className="h-8 w-8 text-purple-400 mb-3" />
                  <h3 className="font-semibold mb-2">54 Countries</h3>
                  <p className="text-sm text-muted-foreground">Available across Africa with 6 major mobile money providers and 10+ currencies.</p>
                </CardContent>
              </Card>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-6">
                  <Wallet className="h-8 w-8 text-amber-400 mb-3" />
                  <h3 className="font-semibold mb-2">Any Amount</h3>
                  <p className="text-sm text-muted-foreground">Buy as little as KES 10 / NGN 50. No minimum buy limits for mobile money users.</p>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6">
                  <QrCode className="h-8 w-8 text-green-400 mb-3" />
                  <h3 className="font-semibold mb-2">QR Payments</h3>
                  <p className="text-sm text-muted-foreground">Scan & pay with QR codes at partner merchants. Auto-convert to crypto.</p>
                </CardContent>
              </Card>
              <Card className="border-rose-500/20 bg-rose-500/5">
                <CardContent className="p-6">
                  <Clock className="h-8 w-8 text-rose-400 mb-3" />
                  <h3 className="font-semibold mb-2">Recurring Buys</h3>
                  <p className="text-sm text-muted-foreground">Auto-buy crypto daily/weekly/monthly via mobile money. Set & forget.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MobileMoney;