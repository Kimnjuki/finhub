import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownUp, CreditCard, Smartphone, Wallet, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Copy, ExternalLink, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: string;
  date: string;
  reference: string;
}

const DepositWithdrawPanel = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMpesaStep2, setIsMpesaStep2] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState<string | null>(null);
  const [paystackAuthUrl, setPaystackAuthUrl] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const createStripeIntent = useMutation(api.payments.stripe.createPaymentIntent);
  const initializePaystack = useMutation(api.payments.paystack.initializeTransaction);
  const initiateMpesa = useMutation(api.payments.mpesa.initiateMpesaPayment);

  const depositMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, fee: '0%', limit: 'KES 150,000', time: 'Instant', currency: 'KES' },
    { id: 'mtn', name: 'MTN MoMo', icon: Smartphone, fee: '0%', limit: 'GHS 50,000', time: 'Instant', currency: 'GHS' },
    { id: 'stripe_card', name: 'Credit/Debit Card', icon: CreditCard, fee: '2.9%', limit: '$5,000', time: 'Instant', currency: 'USD' },
    { id: 'paystack', name: 'Paystack', icon: CreditCard, fee: '1.5% + ₦100', limit: '₦500,000', time: 'Instant', currency: 'NGN' },
  ];

  const withdrawMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, fee: '0%', limit: 'KES 140,000', time: 'Instant', currency: 'KES' },
    { id: 'bank', name: 'Bank Transfer', icon: CreditCard, fee: '1.5%', limit: '$10,000', time: '1-3 hours', currency: 'USD' },
    { id: 'crypto', name: 'Crypto Withdrawal', icon: Wallet, fee: 'Network fee', limit: 'Unlimited', time: '10-30 min', currency: 'USDT' },
  ];

  const currentMethods = activeTab === 'deposit' ? depositMethods : withdrawMethods;
  const selectedMethodData = currentMethods.find(m => m.id === selectedMethod);

  const handleStripeDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    const key = await createStripeIntent({ amount: parseFloat(amount), currency: 'usd', userId: 'current_user' });
    setStripePublishableKey(key.clientSecret);
    toast.success('Stripe payment initiated');
  };

  const handlePaystackDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    const result = await initializePaystack({ amount: parseFloat(amount), email: 'user@example.com', userId: 'current_user', callbackUrl: window.location.href });
    setPaystackAuthUrl(result.authorizationUrl);
    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
    }
  };

  const handleMpesaDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setIsMpesaStep2(true);
  };

  const confirmMpesaPayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await initiateMpesa({ phoneNumber, amount: parseFloat(amount), userId: 'current_user' });
      if (result.success) {
        toast.success('M-Pesa payment initiated. Please check your phone to complete.');
        const newTx: Transaction = {
          id: Date.now().toString(),
          type: 'deposit',
          amount: parseFloat(amount),
          currency: selectedMethodData?.currency || 'KES',
          status: 'pending',
          method: selectedMethodData?.name || 'M-Pesa',
          date: new Date().toISOString().split('T')[0],
          reference: result.checkoutRequestId || '',
        };
        setTransactions(prev => [newTx, ...prev]);
        setShowConfirm(false);
        setIsMpesaStep2(false);
        setAmount('');
        setSelectedMethod('');
        setPhoneNumber('');
      }
    } catch (error) {
      toast.error('M-Pesa payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setShowConfirm(true);
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setIsProcessing(true);
    try {
      if (selectedMethod === 'mpesa') {
        await initiateMpesa({ phoneNumber: phoneNumber || '254700000000', amount: parseFloat(amount), userId: 'current_user' });
      }
      const newTx: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: parseFloat(amount),
        currency: selectedMethodData?.currency || 'KES',
        status: 'pending',
        method: selectedMethodData?.name || selectedMethod,
        date: new Date().toISOString().split('T')[0],
        reference: `TXN-${Date.now()}`,
      };
      setTransactions(prev => [newTx, ...prev]);
      toast.success(`${activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'} initiated successfully!`);
      setAmount('');
      setSelectedMethod('');
      setShowConfirm(false);
      setIsMpesaStep2(false);
      setPhoneNumber('');
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmTransaction = async () => {
    if (selectedMethod === 'stripe_card') {
      await handleStripeDeposit();
      return;
    }
    if (selectedMethod === 'paystack') {
      await handlePaystackDeposit();
      return;
    }
    if (selectedMethod === 'mpesa' && activeTab === 'deposit') {
      await handleMpesaDeposit();
      return;
    }
    await handleWithdraw();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Deposit & Withdraw</CardTitle>
          <CardDescription>Add or remove funds from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {/* Payment Methods */}
            <div className="md:col-span-2 space-y-4">
              <Label>Select Payment Method</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentMethods.map(method => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-border/30 hover:border-emerald-500/30'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <method.icon className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{method.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">Fee: {method.fee}</Badge>
                              <Badge variant="outline" className="text-[10px]">{method.time}</Badge>
                            </div>
                          </div>
                        </div>
                        {selectedMethod === method.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Limit: {method.limit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedMethodData && (
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="pr-16"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-7"
                        onClick={() => setAmount('10000')}
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  {selectedMethod === 'mpesa' && isMpesaStep2 && (
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="e.g. 254700000000"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}

                  <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        onClick={handleSubmit}
                      >
                        {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} Funds
                        <ArrowDownUp className="ml-2 h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm {activeTab === 'deposit' ? 'Deposit' : 'Withdrawal'}</DialogTitle>
                        <DialogDescription>
                          Please review your transaction details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method</span>
                          <span className="font-medium">{selectedMethodData?.name}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-mono font-medium">{amount} {selectedMethodData?.currency}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee</span>
                          <span className="font-medium">{selectedMethodData?.fee}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Time</span>
                          <span className="font-medium">{selectedMethodData?.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowConfirm(false);
                            setIsMpesaStep2(false);
                            setPhoneNumber('');
                          }}
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                          onClick={confirmTransaction}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div>
              <Label className="mb-3 block">Recent Transactions</Label>
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map(tx => (
                  <Card key={tx.id} className="border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {tx.type === 'deposit' ? (
                            <ArrowDownUp className="h-4 w-4 text-green-400 rotate-180" />
                          ) : (
                            <ArrowDownUp className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                        {tx.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {tx.status === 'pending' && <Clock className="h-4 w-4 text-yellow-400" />}
                        {tx.status === 'failed' && <XCircle className="h-4 w-4 text-red-400" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                          <span className="text-xs text-muted-foreground">{tx.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-medium">{tx.amount} {tx.currency}</span>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-[10px]">
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{tx.method}</span>
                          <Button variant="ghost" size="sm" className="h-6 p-1">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No recent transactions</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositWithdrawPanel;