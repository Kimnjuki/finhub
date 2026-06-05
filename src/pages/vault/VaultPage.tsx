import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock, Clock, Users, Plus, CheckCircle, AlertTriangle, Key, Eye, EyeOff, ChevronRight, Download, Trash2, Copy, Wallet, ShieldCheck, Timer, UserCheck, AlertCircle } from 'lucide-react';

interface VaultAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  withdrawalDelay: number;
  requiredApprovals: number;
  totalApprovers: number;
  approvers: { name: string; approved: boolean }[];
  status: 'active' | 'pending' | 'locked';
}

interface WithdrawalRequest {
  id: string;
  vaultId: string;
  toAddress: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  requestedAt: string;
  executesAt: string;
  approvers: { name: string; approved: boolean }[];
}

const vaults: VaultAccount[] = [
  { id: '1', name: 'Long-Term Holdings', balance: 12.5, currency: 'BTC', withdrawalDelay: 48, requiredApprovals: 2, totalApprovers: 3, approvers: [{ name: 'you', approved: true }, { name: 'john@email.com', approved: true }, { name: 'sarah@email.com', approved: false }], status: 'active' },
  { id: '2', name: 'Treasury Vault', balance: 85.0, currency: 'ETH', withdrawalDelay: 24, requiredApprovals: 2, totalApprovers: 3, approvers: [{ name: 'you', approved: true }, { name: 'david@email.com', approved: false }, { name: 'grace@email.com', approved: false }], status: 'active' },
  { id: '3', name: 'Savings Vault', balance: 50000, currency: 'USDT', withdrawalDelay: 72, requiredApprovals: 3, totalApprovers: 5, approvers: [{ name: 'you', approved: true }, { name: 'alice@email.com', approved: true }, { name: 'bob@email.com', approved: true }, { name: 'carol@email.com', approved: false }, { name: 'dan@email.com', approved: false }], status: 'active' },
];

const withdrawals: WithdrawalRequest[] = [
  { id: 'w1', vaultId: '1', toAddress: 'bc1q...9x7z', amount: 0.5, currency: 'BTC', status: 'pending', requestedAt: '2025-06-03 14:30', executesAt: '2025-06-05 14:30', approvers: [{ name: 'you', approved: true }, { name: 'john@email.com', approved: true }, { name: 'sarah@email.com', approved: false }] },
  { id: 'w2', vaultId: '2', toAddress: '0x742...f3a2', amount: 15.0, currency: 'ETH', status: 'approved', requestedAt: '2025-06-02 09:15', executesAt: '2025-06-03 09:15', approvers: [{ name: 'you', approved: true }, { name: 'david@email.com', approved: true }, { name: 'grace@email.com', approved: true }] },
  { id: 'w3', vaultId: '1', toAddress: 'bc1q...4m2k', amount: 0.25, currency: 'BTC', status: 'executed', requestedAt: '2025-05-28 11:00', executesAt: '2025-05-30 11:00', approvers: [{ name: 'you', approved: true }, { name: 'john@email.com', approved: true }, { name: 'sarah@email.com', approved: true }] },
];

const whitelistedAddresses = [
  { address: 'bc1q...9x7z', label: 'Cold Wallet A', addedAt: '2025-05-01', cooldownUntil: null },
  { address: '0x742...f3a2', label: 'Treasury ETH', addedAt: '2025-04-15', cooldownUntil: '2025-04-17' },
  { address: 'bc1q...4m2k', label: 'Exchange', addedAt: '2025-03-20', cooldownUntil: null },
];

const VaultPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecovery, setShowRecovery] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('');

  const totalBalance = vaults.reduce((sum, v) => sum + v.balance, 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'executed': return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30"><CheckCircle className="h-3 w-3 mr-1" />Executed</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <SEOHead
        title="Crypto Vault - Secure Storage with Time-Locked Withdrawals | FINHUBAFRICA"
        description="Store your crypto in FinHubAfrica Vault with time-delayed withdrawals, multi-approver security, and whitelisted addresses. Bank-grade cold storage for African traders."
        keywords="crypto vault, secure storage, cold wallet, time-locked withdrawals, multi-signature, Bitcoin vault, Ethereum vault, crypto security Africa"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10" />
          <div className="container mx-auto px-4 py-12 relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 mb-3 px-3 py-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Coinbase-Style Vault Security
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">Crypto Vault</h1>
                <p className="text-muted-foreground">Time-locked withdrawals · Multi-approver security · Whitelisted addresses</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Vault
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Vault</DialogTitle>
                    <DialogDescription>Set up a secure vault for your crypto assets</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Vault Name</label>
                      <Input placeholder="e.g. Long-Term Holdings" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Withdrawal Delay</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[24, 48, 72].map(h => (
                          <label key={h} className="flex items-center justify-center p-3 rounded-lg border border-border/30 cursor-pointer hover:border-amber-500/30 bg-card text-sm">
                            <input type="radio" name="delay" className="mr-2" /> {h}h
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Required Approvals</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[2, 3, 5].map(n => (
                          <label key={n} className="flex items-center justify-center p-3 rounded-lg border border-border/30 cursor-pointer hover:border-amber-500/30 bg-card text-sm">
                            <input type="radio" name="approvals" className="mr-2" /> {n} of {n + 1}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">Create Vault</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Balance Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" />Total Vault Balance</div>
                  <div className="text-2xl font-bold mt-1">${(totalBalance * 98000).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{totalBalance} BTC equivalent</div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Active Vaults</div>
                  <div className="text-2xl font-bold mt-1">{vaults.length}</div>
                  <div className="text-xs text-muted-foreground">All secure</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Pending Withdrawals</div>
                  <div className="text-2xl font-bold mt-1">{withdrawals.filter(w => w.status === 'pending').length}</div>
                  <div className="text-xs text-muted-foreground">Awaiting approvals</div>
                </CardContent>
              </Card>
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Security Score</div>
                  <div className="text-2xl font-bold mt-1 text-green-400">A+</div>
                  <div className="text-xs text-muted-foreground">Maximum security</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview"><Shield className="h-4 w-4 mr-2" />Vaults</TabsTrigger>
              <TabsTrigger value="withdrawals"><Clock className="h-4 w-4 mr-2" />Withdrawals</TabsTrigger>
              <TabsTrigger value="addresses"><Key className="h-4 w-4 mr-2" />Whitelisted</TabsTrigger>
              <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Security</TabsTrigger>
            </TabsList>

            {/* Vaults Overview */}
            <TabsContent value="overview" className="space-y-6">
              {vaults.map(vault => (
                <Card key={vault.id} className="border-border/30 hover:border-amber-500/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-amber-500/10"><Shield className="h-6 w-6 text-amber-400" /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{vault.name}</h3>
                            {getStatusBadge(vault.status)}
                          </div>
                          <div className="text-2xl font-bold mt-1">{vault.balance} <span className="text-sm font-normal text-muted-foreground">{vault.currency}</span></div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{vault.withdrawalDelay}h delay</span>
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{vault.requiredApprovals}/{vault.totalApprovers} approvals needed</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm" className="mb-2 w-full">
                          <Plus className="h-3 w-3 mr-1" /> Deposit
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white w-full">
                          Withdraw
                        </Button>
                      </div>
                    </div>
                    
                    {/* Approvers */}
                    <div className="mt-4 p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground mb-2">Approvers</div>
                      <div className="flex flex-wrap gap-2">
                        {vault.approvers.map((a, i) => (
                          <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${a.approved ? 'bg-green-500/10 text-green-400' : 'bg-muted/30 text-muted-foreground'}`}>
                            <div className={`w-2 h-2 rounded-full ${a.approved ? 'bg-green-400' : 'bg-gray-500'}`} />
                            {a.name}
                            {a.approved && <CheckCircle className="h-3 w-3 ml-0.5" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Withdrawals */}
            <TabsContent value="withdrawals" className="space-y-4">
              {withdrawals.map(w => (
                <Card key={w.id} className="border-border/30">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{w.amount} {w.currency}</span>
                          {getStatusBadge(w.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">To: {w.toAddress}</div>
                        <div className="text-xs text-muted-foreground">Requested: {w.requestedAt}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {w.status === 'pending' ? `Executes at: ${w.executesAt}` : w.status === 'executed' ? `Executed at: ${w.executesAt}` : 'Approved'}
                        </div>
                      </div>
                      <div className="text-right">
                        {w.status === 'pending' && (
                          <div className="space-y-1">
                            {w.approvers.map((a, i) => (
                              <div key={i} className="flex items-center gap-1 text-xs">
                                <div className={`w-1.5 h-1.5 rounded-full ${a.approved ? 'bg-green-400' : 'bg-gray-500'}`} />
                                {a.name}: {a.approved ? '✓' : 'Pending'}
                              </div>
                            ))}
                            <Button size="sm" variant="outline" className="mt-2 text-xs">Approve</Button>
                          </div>
                        )}
                        {w.status === 'pending' && (
                          <Badge className="mt-2 bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                            <Timer className="h-3 w-3 mr-1" /> Time-locked
                          </Badge>
                        )}
                      </div>
                    </div>
                    {w.status === 'pending' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Time until execution</span>
                          <span>23h 45m</span>
                        </div>
                        <Progress value={85} className="h-1.5 bg-muted [&>div]:bg-amber-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Whitelisted Addresses */}
            <TabsContent value="addresses" className="space-y-4">
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold">Add Whitelisted Address</h3>
                  </div>
                  <div className="flex gap-3">
                    <Input placeholder="0x... or bc1q..." value={newAddress} onChange={e => setNewAddress(e.target.value)} className="flex-1" />
                    <Input placeholder="Label" value={newAddressLabel} onChange={e => setNewAddressLabel(e.target.value)} className="w-32" />
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2"><AlertCircle className="h-3 w-3 inline mr-1" />New addresses have a 48-hour cooldown before they can receive withdrawals</p>
                </CardContent>
              </Card>

              {whitelistedAddresses.map((addr, i) => (
                <Card key={i} className="border-border/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10"><Key className="h-4 w-4 text-blue-400" /></div>
                      <div>
                        <div className="font-medium">{addr.label}</div>
                        <div className="text-xs font-mono text-muted-foreground">{addr.address}</div>
                        <div className="text-xs text-muted-foreground">Added: {addr.addedAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {addr.cooldownUntil && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 text-[10px]">
                          <Timer className="h-3 w-3 mr-1" /> Cooldown until {addr.cooldownUntil}
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-6">
                    <ShieldCheck className="h-8 w-8 text-green-400 mb-3" />
                    <h3 className="font-semibold mb-2">Time-Locked Withdrawals</h3>
                    <p className="text-sm text-muted-foreground">Every withdrawal has a mandatory delay (24-72 hours). This gives you time to cancel any unauthorized withdrawal request.</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold mb-2">Multi-Approver Security</h3>
                    <p className="text-sm text-muted-foreground">Require multiple people to approve withdrawals. Set up 2-of-3 or 3-of-5 approval workflows to prevent unauthorized access.</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="p-6">
                    <Key className="h-8 w-8 text-purple-400 mb-3" />
                    <h3 className="font-semibold mb-2">Whitelisted Addresses</h3>
                    <p className="text-sm text-muted-foreground">Only send to pre-approved addresses. New addresses require 48-hour cooldown before they can receive funds, preventing theft via address poisoning.</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardContent className="p-6">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mb-3" />
                    <h3 className="font-semibold mb-2">Recovery Phrase</h3>
                    <p className="text-sm text-muted-foreground">Your vault is secured by a 12-word recovery phrase. Never share it with anyone.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-3 border-amber-500/30 text-amber-400" onClick={() => setShowRecovery(!showRecovery)}>
                          {showRecovery ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {showRecovery ? 'Hide' : 'View'} Recovery Phrase
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" /> Recovery Phrase</DialogTitle>
                          <DialogDescription className="text-amber-400/80">Never share this with anyone. FinHubAfrica will never ask for this.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'].map((word, i) => (
                            <div key={i} className="flex items-center gap-1.5 p-2 rounded bg-muted/30 text-sm">
                              <span className="text-muted-foreground text-[10px]">{i + 1}.</span>
                              <span className="font-mono">{word}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="flex-1"><Copy className="h-4 w-4 mr-1" /> Copy</Button>
                          <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default VaultPage;