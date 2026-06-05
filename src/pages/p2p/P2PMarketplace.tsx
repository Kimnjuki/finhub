import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Search, Shield, Star, MessageCircle, Clock, Users, TrendingUp, Plus, CheckCircle, AlertTriangle, Filter, ArrowUpDown, Wallet, Building2, Landmark, CreditCard, Smartphone, Globe, Ban, Zap, ChevronRight, ChevronDown, Percent } from 'lucide-react';

const paymentMethods = [
  { name: 'M-Pesa', countries: 'KE, TZ, UG', icon: '📱' },
  { name: 'Airtel Money', countries: 'KE, UG, TZ, MW', icon: '📲' },
  { name: 'MTN MoMo', countries: 'GH, UG, NG, CM', icon: '💰' },
  { name: 'Orange Money', countries: 'SN, ML, BF, CI', icon: '🟠' },
  { name: 'Bank Transfer', countries: 'All Countries', icon: '🏦' },
  { name: 'Wave', countries: 'SN, CI, BF', icon: '🌊' },
  { name: 'Chipper Cash', countries: 'KE, NG, GH, UG', icon: '⚡' },
  { name: 'PayPal', countries: 'Global', icon: '💳' },
  { name: 'Cash Deposit', countries: 'KE, NG, GH', icon: '💵' },
  { name: 'Baridi Mobile', countries: 'TZ', icon: '📱' },
  { name: 'Equitel', countries: 'KE', icon: '📞' },
  { name: 'Tigo Pesa', countries: 'TZ', icon: '📱' },
  { name: 'HaloBet', countries: 'ZM', icon: '📱' },
  { name: 'Flooz', countries: 'TG, BJ', icon: '📱' },
  { name: 'Cellullar Money', countries: 'GM', icon: '📱' },
  { name: 'Moov Money', countries: 'CI, BF', icon: '📱' },
  { name: 'AfriMoney', countries: 'GH', icon: '📱' },
  { name: 'E-Mola', countries: 'MZ', icon: '📱' },
  { name: 'M-Paisa', countries: 'AF', icon: '📱' },
  { name: 'MobiCash', countries: 'MG', icon: '📱' },
];

const ads = [
  { id: 1, merchant: 'CryptoKing_KE', verified: true, level: 'Diamond', trades: 1520, completion: 99.2, price: 0.000067, fiat: 'KES', crypto: 'USDT', min: '500', max: '500,000', payment: ['M-Pesa', 'Bank Transfer'], type: 'sell', country: 'KE', available: '12,500' },
  { id: 2, merchant: 'BitcoinTraderNG', verified: true, level: 'Gold', trades: 843, completion: 98.5, price: 0.000068, fiat: 'NGN', crypto: 'BTC', min: '5,000', max: '2,000,000', payment: ['Airtel Money', 'Bank Transfer', 'Cash'], type: 'sell', country: 'NG', available: '2.5' },
  { id: 3, merchant: 'GhanaCryptoPro', verified: true, level: 'Gold', trades: 612, completion: 97.8, price: 0.000074, fiat: 'GHS', crypto: 'USDT', min: '100', max: '100,000', payment: ['MTN MoMo', 'Bank Transfer'], type: 'sell', country: 'GH', available: '8,200' },
  { id: 4, merchant: 'TZ_Trader', verified: true, level: 'Verified', trades: 234, completion: 96.1, price: 0.000039, fiat: 'TZS', crypto: 'USDT', min: '10,000', max: '5,000,000', payment: ['M-Pesa', 'Tigo Pesa', 'Airtel Money'], type: 'buy', country: 'TZ', available: '3,500' },
  { id: 5, merchant: 'SA_Trader99', verified: true, level: 'Diamond', trades: 2100, completion: 99.5, price: 0.054, fiat: 'ZAR', crypto: 'BTC', min: '500', max: '500,000', payment: ['Bank Transfer', 'PayPal'], type: 'sell', country: 'ZA', available: '5.8' },
  { id: 6, merchant: 'UgandaCryptoHub', verified: true, level: 'Gold', trades: 445, completion: 97.2, price: 0.00027, fiat: 'UGX', crypto: 'USDT', min: '20,000', max: '10,000,000', payment: ['M-Pesa', 'Airtel Money', 'MTN MoMo'], type: 'sell', country: 'UG', available: '6,800' },
  { id: 7, merchant: 'MozTrader', verified: true, level: 'Verified', trades: 128, completion: 95.3, price: 0.0000016, fiat: 'MZN', crypto: 'BTC', min: '500', max: '50,000', payment: ['M-Pesa', 'E-Mola'], type: 'buy', country: 'MZ', available: '0.5' },
  { id: 8, merchant: 'CryptoSenegal', verified: true, level: 'Verified', trades: 198, completion: 94.8, price: 0.0016, fiat: 'XOF', crypto: 'USDT', min: '5,000', max: '2,000,000', payment: ['Orange Money', 'Wave'], type: 'sell', country: 'SN', available: '2,100' },
  { id: 9, merchant: 'BigFishNG', verified: true, level: 'Diamond', trades: 3200, completion: 99.8, price: 0.000066, fiat: 'NGN', crypto: 'USDT', min: '10,000', max: '10,000,000', payment: ['Bank Transfer', 'Airtel Money', 'Cash'], type: 'sell', country: 'NG', available: '45,000' },
];

const levels: Record<string, { color: string; icon: string }> = {
  Diamond: { color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: '💎' },
  Gold: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: '🥇' },
  Verified: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: '✅' },
};

const P2PMarketplace = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');

  const filteredAds = ads.filter(ad => {
    if (ad.type !== activeTab) return false;
    if (search && !ad.merchant.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCountry !== 'all' && ad.country !== selectedCountry) return false;
    if (selectedPayment !== 'all' && !ad.payment.includes(selectedPayment)) return false;
    return true;
  });

  return (
    <>
      <SEOHead
        title="P2P Crypto Marketplace - Buy & Sell Crypto Locally in Africa | FINHUBAFRICA"
        description="Peer-to-peer crypto marketplace with 50+ African payment methods. Buy and sell Bitcoin, USDT, ETH with M-Pesa, Airtel Money, bank transfers. Escrow protection."
        keywords="P2P crypto Africa, peer to peer trading, buy Bitcoin with M-Pesa, local crypto marketplace, escrow trading, P2P Bitcoin Nigeria, P2P Kenya"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-cyan-500/10" />
          <div className="container mx-auto px-4 py-12 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 mb-3 px-3 py-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Escrow Protected · 50+ Payment Methods
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">P2P Marketplace</h1>
                <p className="text-muted-foreground">Trade crypto directly with Africans. 50+ local payment methods. Bank-grade escrow.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Ad
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create P2P Ad</DialogTitle>
                    <DialogDescription>Set your price, limits, and payment methods</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">I want to</label>
                      <Tabs defaultValue="sell" className="w-full">
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
                          <TabsTrigger value="sell">Sell Crypto</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Crypto</label>
                      <Select defaultValue="USDT">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">₿ Bitcoin</SelectItem>
                          <SelectItem value="ETH">⟠ Ethereum</SelectItem>
                          <SelectItem value="USDT">₮ Tether</SelectItem>
                          <SelectItem value="SOL">◎ Solana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Fiat Currency</label>
                      <Select defaultValue="KES">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KES">🇰🇪 KES - Kenyan Shilling</SelectItem>
                          <SelectItem value="NGN">🇳🇬 NGN - Nigerian Naira</SelectItem>
                          <SelectItem value="GHS">🇬🇭 GHS - Ghanaian Cedi</SelectItem>
                          <SelectItem value="TZS">🇹🇿 TZS - Tanzanian Shilling</SelectItem>
                          <SelectItem value="UGX">🇺🇬 UGX - Ugandan Shilling</SelectItem>
                          <SelectItem value="ZAR">🇿🇦 ZAR - South African Rand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">Price per USDT</label>
                        <Input placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">Available Amount</label>
                        <Input placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Payment Methods</label>
                      <div className="grid grid-cols-3 gap-2">
                        {paymentMethods.slice(0, 6).map(pm => (
                          <label key={pm.name} className="flex items-center gap-2 p-2 rounded-lg border border-border/30 cursor-pointer hover:border-blue-500/30 text-xs">
                            <input type="checkbox" className="rounded" />
                            {pm.icon} {pm.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Create Ad</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="border-border/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-400" /></div>
                  <div><div className="text-xl font-bold">2,847</div><div className="text-xs text-muted-foreground">Active Ads</div></div>
                </CardContent>
              </Card>
              <Card className="border-border/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-400" /></div>
                  <div><div className="text-xl font-bold">$2.4M</div><div className="text-xs text-muted-foreground">24h Volume</div></div>
                </CardContent>
              </Card>
              <Card className="border-border/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10"><Users className="h-5 w-5 text-purple-400" /></div>
                  <div><div className="text-xl font-bold">12,450</div><div className="text-xs text-muted-foreground">Total Traders</div></div>
                </CardContent>
              </Card>
              <Card className="border-border/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10"><CheckCircle className="h-5 w-5 text-amber-400" /></div>
                  <div><div className="text-xl font-bold">98.3%</div><div className="text-xs text-muted-foreground">Avg Completion</div></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border/40 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex-1 max-w-xs relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search merchant..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">₮ USDT</SelectItem>
                  <SelectItem value="BTC">₿ BTC</SelectItem>
                  <SelectItem value="ETH">⟠ ETH</SelectItem>
                  <SelectItem value="SOL">◎ SOL</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                  <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                  <SelectItem value="TZ">🇹🇿 Tanzania</SelectItem>
                  <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                  <SelectItem value="ZA">🇿🇦 South Africa</SelectItem>
                  <SelectItem value="SN">🇸🇳 Senegal</SelectItem>
                  <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                  <SelectItem value="MZ">🇲🇿 Mozambique</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="M-Pesa">📱 M-Pesa</SelectItem>
                  <SelectItem value="Airtel Money">📲 Airtel Money</SelectItem>
                  <SelectItem value="MTN MoMo">💰 MTN MoMo</SelectItem>
                  <SelectItem value="Orange Money">🟠 Orange Money</SelectItem>
                  <SelectItem value="Bank Transfer">🏦 Bank Transfer</SelectItem>
                  <SelectItem value="Wave">🌊 Wave</SelectItem>
                  <SelectItem value="PayPal">💳 PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Ads Listing */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="space-y-3">
              {filteredAds.map(ad => (
                <Card key={ad.id} className="border-border/30 hover:border-blue-500/30 transition-all hover:shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Left: Merchant Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                          <AvatarFallback className="bg-blue-500/10 text-blue-400 text-sm">
                            {ad.merchant.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{ad.merchant}</span>
                            <Badge className={`text-[10px] ${levels[ad.level].color}`}>
                              {levels[ad.level].icon} {ad.level}
                            </Badge>
                            {ad.verified && <CheckCircle className="h-3.5 w-3.5 text-blue-400" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ad.trades} trades</span>
                            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{ad.completion}% completion</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {ad.payment.map(pm => (
                              <Badge key={pm} variant="secondary" className="text-[10px]">
                                {paymentMethods.find(m => m.name === pm)?.icon} {pm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Actions */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold">
                          {ad.price} <span className="text-sm font-normal text-muted-foreground">{ad.fiat}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">per {ad.crypto}</div>
                        <div className="flex items-center gap-1.5 justify-end mt-1 text-xs text-muted-foreground">
                          <Wallet className="h-3 w-3" />
                          Available: {ad.available} {ad.crypto}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {ad.min}-{ad.max} {ad.fiat}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-3 w-3 mr-1" /> Chat
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                            {activeTab === 'buy' ? 'Buy' : 'Sell'} {ad.crypto}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Why FinHubAfrica P2P</h2>
              <p className="text-muted-foreground">Africa's most trusted peer-to-peer marketplace</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-6 text-center">
                  <Shield className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Escrow Protection</h3>
                  <p className="text-sm text-muted-foreground">Every trade is secured by our escrow system. Crypto released only after payment confirmed.</p>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6 text-center">
                  <Globe className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">50+ Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">From M-Pesa to bank transfers. Pay the way you want with methods that work in your country.</p>
                </CardContent>
              </Card>
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="p-6 text-center">
                  <Zap className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Instant Trading</h3>
                  <p className="text-sm text-muted-foreground">Find a merchant, agree on price, complete the trade. No order books, no waiting.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Dispute Resolution Banner */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Dispute Resolution Center</h3>
                    <p className="text-sm text-muted-foreground">Having an issue with a trade? Our arbitration team resolves disputes within 24 hours.</p>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-500/30 text-amber-400">
                  Open Dispute
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default P2PMarketplace;