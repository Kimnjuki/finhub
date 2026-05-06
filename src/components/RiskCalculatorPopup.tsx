import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, Shield, AlertTriangle, DollarSign, Info, Target, CheckCircle2, Download, History, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RiskResult {
  positionSize: number;
  positionSizeShares: number;
  riskAmount: number;
  riskPercentage: number;
  stopLossDistance: number;
  stopLossPercentage: number;
  takeProfitDistance: number;
  takeProfitPercentage: number;
  riskRewardRatio: number;
  profitPotential: number;
  breakEvenPrice: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive' | 'extreme';
  positionValue: number;
}

interface CalculationHistory extends RiskResult {
  id: string;
  timestamp: Date;
  tradeType: 'long' | 'short';
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number | null;
  accountBalance: number;
}

const RiskCalculatorPopup = () => {
  const [open, setOpen] = useState(false);
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [tradeType, setTradeType] = useState<'long' | 'short'>('long');
  const [result, setResult] = useState<RiskResult | null>(null);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('riskCalculatorHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('riskCalculatorHistory', JSON.stringify(history));
    }
  }, [history]);

  const calculateRisk = () => {
    if (!entryPrice || !stopLossPrice || !accountBalance || !riskPercentage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Entry, Stop Loss, Account Balance, Risk %)",
        variant: "destructive"
      });
      return;
    }

    const balance = parseFloat(accountBalance);
    const riskPercent = parseFloat(riskPercentage);
    const entry = parseFloat(entryPrice);
    const stopLoss = parseFloat(stopLossPrice);
    const takeProfit = takeProfitPrice ? parseFloat(takeProfitPrice) : null;

    // Validation: Check for valid numbers
    if (isNaN(balance) || isNaN(riskPercent) || isNaN(entry) || isNaN(stopLoss) || balance <= 0 || entry <= 0 || stopLoss <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid positive numbers",
        variant: "destructive"
      });
      return;
    }

    // Validation: Check if stop loss is in correct direction
    if (tradeType === 'long' && stopLoss >= entry) {
      toast({
        title: "Invalid Stop Loss",
        description: "For LONG trades, stop loss must be BELOW entry price",
        variant: "destructive"
      });
      return;
    }

    if (tradeType === 'short' && stopLoss <= entry) {
      toast({
        title: "Invalid Stop Loss",
        description: "For SHORT trades, stop loss must be ABOVE entry price",
        variant: "destructive"
      });
      return;
    }

    // Validation: Check if take profit is in correct direction
    if (takeProfit) {
      if (tradeType === 'long' && takeProfit <= entry) {
        toast({
          title: "Invalid Take Profit",
          description: "For LONG trades, take profit must be ABOVE entry price",
          variant: "destructive"
        });
        return;
      }
      if (tradeType === 'short' && takeProfit >= entry) {
        toast({
          title: "Invalid Take Profit",
          description: "For SHORT trades, take profit must be BELOW entry price",
          variant: "destructive"
        });
        return;
      }
    }

    // Calculate risk amount in dollars
    const riskAmountDollars = balance * (riskPercent / 100);
    
    // Calculate distance from entry to stop loss
    const stopLossDistance = Math.abs(entry - stopLoss);
    const stopLossPercentage = (stopLossDistance / entry) * 100;
    
    // Calculate position size: Risk Amount / Distance to Stop Loss
    const positionSizeShares = Math.floor(riskAmountDollars / stopLossDistance);
    const positionValue = positionSizeShares * entry;

    // Calculate take profit metrics
    let takeProfitDistance = 0;
    let takeProfitPercentage = 0;
    let profitPotential = 0;
    let riskRewardRatio = 0;

    if (takeProfit) {
      takeProfitDistance = Math.abs(takeProfit - entry);
      takeProfitPercentage = (takeProfitDistance / entry) * 100;
      profitPotential = positionSizeShares * takeProfitDistance;
      riskRewardRatio = takeProfitDistance / stopLossDistance;
    }

    // Determine risk level
    const getRiskLevel = (percent: number): 'conservative' | 'moderate' | 'aggressive' | 'extreme' => {
      if (percent <= 1) return 'conservative';
      if (percent <= 2) return 'moderate';
      if (percent <= 5) return 'aggressive';
      return 'extreme';
    };

    const riskResult: RiskResult = {
      positionSize: positionValue,
      positionSizeShares,
      riskAmount: riskAmountDollars,
      riskPercentage: riskPercent,
      stopLossDistance,
      stopLossPercentage,
      takeProfitDistance,
      takeProfitPercentage,
      riskRewardRatio,
      profitPotential,
      breakEvenPrice: entry,
      riskLevel: getRiskLevel(riskPercent),
      positionValue
    };

    setResult(riskResult);
    setCurrentStep(4);
    
    // Save to history
    const historyEntry: CalculationHistory = {
      ...riskResult,
      id: Date.now().toString(),
      timestamp: new Date(),
      tradeType,
      entryPrice: entry,
      stopLossPrice: stopLoss,
      takeProfitPrice: takeProfit,
      accountBalance: balance
    };
    setHistory(prev => [historyEntry, ...prev].slice(0, 20)); // Keep last 20 calculations
    
    toast({
      title: "Risk Calculated",
      description: "Your position has been calculated successfully",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'conservative': return 'bg-success/10 text-success border-success/20';
      case 'moderate': return 'bg-primary/10 text-primary border-primary/20';
      case 'aggressive': return 'bg-warning/10 text-warning border-warning/20';
      case 'extreme': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'conservative': return <Shield className="h-5 w-5" />;
      case 'moderate': return <Target className="h-5 w-5" />;
      case 'aggressive': return <AlertTriangle className="h-5 w-5" />;
      case 'extreme': return <TrendingUp className="h-5 w-5" />;
      default: return <Calculator className="h-5 w-5" />;
    }
  };

  const resetCalculator = () => {
    setAccountBalance('10000');
    setRiskPercentage('2');
    setEntryPrice('');
    setStopLossPrice('');
    setTakeProfitPrice('');
    setTradeType('long');
    setResult(null);
    setCurrentStep(1);
  };

  const exportCalculation = () => {
    if (!result) return;
    
    const exportData = {
      timestamp: new Date().toLocaleString(),
      tradeType: tradeType.toUpperCase(),
      accountBalance: `$${accountBalance}`,
      riskPercentage: `${riskPercentage}%`,
      entryPrice: `$${entryPrice}`,
      stopLossPrice: `$${stopLossPrice}`,
      takeProfitPrice: takeProfitPrice ? `$${takeProfitPrice}` : 'N/A',
      positionSize: `${result.positionSizeShares} shares`,
      positionValue: `$${result.positionValue.toFixed(2)}`,
      maxRisk: `$${result.riskAmount.toFixed(2)}`,
      profitPotential: result.profitPotential > 0 ? `$${result.profitPotential.toFixed(2)}` : 'N/A',
      riskRewardRatio: result.riskRewardRatio > 0 ? `1:${result.riskRewardRatio.toFixed(2)}` : 'N/A',
      riskLevel: result.riskLevel.toUpperCase()
    };

    const text = Object.entries(exportData)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').toUpperCase()}: ${value}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-calculation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported Successfully",
      description: "Calculation saved to file",
    });
  };

  const loadFromHistory = (historyItem: CalculationHistory) => {
    setAccountBalance(historyItem.accountBalance.toString());
    setRiskPercentage(historyItem.riskPercentage.toString());
    setEntryPrice(historyItem.entryPrice.toString());
    setStopLossPrice(historyItem.stopLossPrice.toString());
    setTakeProfitPrice(historyItem.takeProfitPrice?.toString() || '');
    setTradeType(historyItem.tradeType);
    setResult(historyItem);
    setCurrentStep(4);
    setShowHistory(false);
    
    toast({
      title: "History Loaded",
      description: "Previous calculation restored",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('riskCalculatorHistory');
    toast({
      title: "History Cleared",
      description: "All saved calculations removed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto glass-card bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border-primary/30">
          <Calculator className="h-4 w-4 mr-2" />
          Risk Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            Professional Risk Calculator
          </DialogTitle>
          <DialogDescription className="text-base">
            Calculate optimal position sizes, risk-reward ratios, and manage your trading capital professionally
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              History ({history.length})
            </Button>
            {result && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportCalculation}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {showHistory && history.length > 0 && (
          <Card className="mb-6 glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Calculation History
                </CardTitle>
                <Button variant="destructive" size="sm" onClick={clearHistory}>
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => loadFromHistory(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.tradeType === 'long' ? 'default' : 'destructive'}>
                              {item.tradeType === 'long' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {item.tradeType.toUpperCase()}
                            </Badge>
                            <Badge className={getRiskColor(item.riskLevel)}>
                              {item.riskLevel}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Entry</p>
                            <p className="font-semibold">${item.entryPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Position</p>
                            <p className="font-semibold">{item.positionSizeShares} shares</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">R:R</p>
                            <p className="font-semibold">
                              {item.riskRewardRatio > 0 ? `1:${item.riskRewardRatio.toFixed(2)}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="1" onClick={() => setCurrentStep(1)} className="flex items-center gap-2">
              <span className="hidden sm:inline">Account Setup</span>
              <span className="sm:hidden">Setup</span>
            </TabsTrigger>
            <TabsTrigger value="2" onClick={() => setCurrentStep(2)} className="flex items-center gap-2">
              <span className="hidden sm:inline">Trade Details</span>
              <span className="sm:hidden">Trade</span>
            </TabsTrigger>
            <TabsTrigger value="3" onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
              <span className="hidden sm:inline">Price Levels</span>
              <span className="sm:hidden">Prices</span>
            </TabsTrigger>
            <TabsTrigger value="4" onClick={() => setCurrentStep(4)} disabled={!result} className="flex items-center gap-2">
              <span className="hidden sm:inline">Results</span>
              <span className="sm:hidden">Results</span>
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Account Setup */}
          <TabsContent value="1" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Step 1: Configure Your Trading Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Why This Matters:</p>
                      <p className="text-muted-foreground">Proper risk management starts with knowing your account size and deciding how much you're willing to risk per trade. Professional traders typically risk 1-2% per trade.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="accountBalance" className="text-base font-semibold">Account Balance ($)</Label>
                    <Input
                      id="accountBalance"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      placeholder="10000"
                      type="number"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Your total trading capital</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="riskPercentage" className="text-base font-semibold">Risk Per Trade (%)</Label>
                    <Input
                      id="riskPercentage"
                      value={riskPercentage}
                      onChange={(e) => setRiskPercentage(e.target.value)}
                      placeholder="2"
                      type="number"
                      step="0.1"
                      max="10"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 1-2% (Conservative), 2-3% (Moderate)</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setRiskPercentage('1')}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <Shield className="h-5 w-5 text-success" />
                    <span className="font-semibold">Conservative</span>
                    <span className="text-xs text-muted-foreground">1% Risk</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRiskPercentage('2')}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Moderate</span>
                    <span className="text-xs text-muted-foreground">2% Risk</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRiskPercentage('3')}
                    className="h-auto py-4 flex flex-col gap-2"
                  >
                    <TrendingUp className="h-5 w-5 text-warning" />
                    <span className="font-semibold">Aggressive</span>
                    <span className="text-xs text-muted-foreground">3% Risk</span>
                  </Button>
                </div>

                {accountBalance && riskPercentage && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Maximum Risk Per Trade:</p>
                    <p className="text-3xl font-bold text-primary">
                      ${(parseFloat(accountBalance) * parseFloat(riskPercentage) / 100).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button onClick={() => setCurrentStep(2)} className="w-full h-12 text-base" size="lg">
                  Continue to Trade Details
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Trade Direction */}
          <TabsContent value="2" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Step 2: Select Trade Direction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Trade Direction:</p>
                      <p className="text-muted-foreground">Choose LONG if you expect the price to go up, or SHORT if you expect it to go down. This affects where your stop loss and take profit should be placed.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card 
                    className={`cursor-pointer transition-all ${tradeType === 'long' ? 'ring-2 ring-success bg-success/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setTradeType('long')}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-8 w-8 text-success" />
                        {tradeType === 'long' && <CheckCircle2 className="h-6 w-6 text-success" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Long Position (Buy)</h3>
                        <p className="text-sm text-muted-foreground">
                          Profit when price goes UP. Stop loss will be BELOW entry price.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">Example: Buy at $100, Sell at $110</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${tradeType === 'short' ? 'ring-2 ring-destructive bg-destructive/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setTradeType('short')}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <TrendingDown className="h-8 w-8 text-destructive" />
                        {tradeType === 'short' && <CheckCircle2 className="h-6 w-6 text-destructive" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Short Position (Sell)</h3>
                        <p className="text-sm text-muted-foreground">
                          Profit when price goes DOWN. Stop loss will be ABOVE entry price.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">Example: Sell at $100, Buy back at $90</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1 h-12">
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1 h-12 text-base">
                    Continue to Price Levels
                    <Target className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Price Levels */}
          <TabsContent value="3" className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Step 3: Set Price Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">Setting Price Levels:</p>
                      <p className="text-muted-foreground">
                        {tradeType === 'long' 
                          ? 'For LONG trades: Entry → Stop Loss (below) → Take Profit (above)'
                          : 'For SHORT trades: Entry → Stop Loss (above) → Take Profit (below)'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="entryPrice" className="text-base font-semibold">Entry Price ($) *</Label>
                    <Input
                      id="entryPrice"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="50.00"
                      type="number"
                      step="0.01"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">The price at which you plan to enter the trade</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="stopLossPrice" className="text-base font-semibold">Stop Loss Price ($) *</Label>
                    <Input
                      id="stopLossPrice"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      placeholder={tradeType === 'long' ? '48.00 (below entry)' : '52.00 (above entry)'}
                      type="number"
                      step="0.01"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum loss level - {tradeType === 'long' ? 'Must be BELOW' : 'Must be ABOVE'} entry price
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="takeProfitPrice" className="text-base font-semibold">Take Profit Price ($)</Label>
                    <Input
                      id="takeProfitPrice"
                      value={takeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(e.target.value)}
                      placeholder={tradeType === 'long' ? '54.00 (above entry)' : '46.00 (below entry)'}
                      type="number"
                      step="0.01"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target profit level (optional) - {tradeType === 'long' ? 'Should be ABOVE' : 'Should be BELOW'} entry price
                    </p>
                  </div>

                  {entryPrice && stopLossPrice && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                      <p className="text-sm font-medium">Quick Check:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Stop Loss Distance:</p>
                          <p className="font-semibold">${Math.abs(parseFloat(entryPrice) - parseFloat(stopLossPrice)).toFixed(2)}</p>
                        </div>
                        {takeProfitPrice && (
                          <div>
                            <p className="text-muted-foreground">Take Profit Distance:</p>
                            <p className="font-semibold">${Math.abs(parseFloat(entryPrice) - parseFloat(takeProfitPrice)).toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1 h-12">
                    Back
                  </Button>
                  <Button 
                    onClick={calculateRisk} 
                    className="flex-1 h-12 text-base btn-primary"
                    disabled={!entryPrice || !stopLossPrice || !accountBalance || !riskPercentage}
                  >
                    Calculate Position
                    <Calculator className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Results */}
          <TabsContent value="4" className="space-y-6">
            {result && (
              <>
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-success" />
                        Position Calculated Successfully
                      </CardTitle>
                      <Badge className={`text-base px-4 py-2 ${getRiskColor(result.riskLevel)}`}>
                        {getRiskIcon(result.riskLevel)}
                        <span className="ml-2">{result.riskLevel.toUpperCase()} RISK</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-2">Position Size</p>
                        <p className="text-3xl font-bold text-primary">{result.positionSizeShares}</p>
                        <p className="text-sm text-muted-foreground mt-1">shares</p>
                        <p className="text-xs text-muted-foreground mt-2">Total Value: ${result.positionValue.toFixed(2)}</p>
                      </div>

                      <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-muted-foreground mb-2">Maximum Risk</p>
                        <p className="text-3xl font-bold text-destructive">${result.riskAmount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground mt-1">{result.riskPercentage}% of account</p>
                        <p className="text-xs text-muted-foreground mt-2">Distance: ${result.stopLossDistance.toFixed(2)} ({result.stopLossPercentage.toFixed(2)}%)</p>
                      </div>

                      {result.profitPotential > 0 && (
                        <div className="p-5 rounded-xl bg-success/10 border border-success/20">
                          <p className="text-sm text-muted-foreground mb-2">Profit Potential</p>
                          <p className="text-3xl font-bold text-success">${result.profitPotential.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground mt-1">If target is hit</p>
                          <p className="text-xs text-muted-foreground mt-2">Distance: ${result.takeProfitDistance.toFixed(2)} ({result.takeProfitPercentage.toFixed(2)}%)</p>
                        </div>
                      )}
                    </div>

                    {/* Risk/Reward Ratio */}
                    {result.riskRewardRatio > 0 && (
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Risk/Reward Ratio</p>
                            <p className="text-4xl font-bold">1 : {result.riskRewardRatio.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {result.riskRewardRatio >= 3 
                                ? '🎯 Excellent - Professional grade ratio!'
                                : result.riskRewardRatio >= 2
                                ? '✅ Good - Meets minimum standards'
                                : result.riskRewardRatio >= 1.5
                                ? '⚠️ Fair - Consider higher target'
                                : '❌ Poor - Increase target or reduce stop loss'}
                            </p>
                          </div>
                          <div className="text-6xl">
                            {result.riskRewardRatio >= 2 ? '🎯' : '⚠️'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trade Summary */}
                    <div className="p-5 rounded-xl bg-muted/50 border border-border space-y-3">
                      <h4 className="font-semibold text-lg mb-4">Trade Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Direction</p>
                          <p className="font-semibold capitalize flex items-center gap-2">
                            {tradeType === 'long' ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                            {tradeType}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account Balance</p>
                          <p className="font-semibold">${parseFloat(accountBalance).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-semibold">${parseFloat(entryPrice).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stop Loss</p>
                          <p className="font-semibold">${parseFloat(stopLossPrice).toFixed(2)}</p>
                        </div>
                        {takeProfitPrice && (
                          <>
                            <div>
                              <p className="text-muted-foreground">Take Profit</p>
                              <p className="font-semibold">${parseFloat(takeProfitPrice).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Win Rate Needed</p>
                              <p className="font-semibold">{(100 / (1 + result.riskRewardRatio)).toFixed(1)}%</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Visual Price Level Diagram */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Visual Price Levels
                      </h4>
                      <div className="space-y-3">
                        {tradeType === 'long' ? (
                          <>
                            {takeProfitPrice && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                                <Target className="h-4 w-4 text-success" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-success">Take Profit</p>
                                  <p className="text-xs text-muted-foreground">${parseFloat(takeProfitPrice).toFixed(2)}</p>
                                </div>
                                <span className="text-xs font-mono text-success">+{result.takeProfitPercentage.toFixed(2)}%</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold">Entry Price</p>
                                <p className="text-xs text-muted-foreground">${parseFloat(entryPrice).toFixed(2)}</p>
                              </div>
                              <span className="text-xs font-mono">Entry</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                              <Shield className="h-4 w-4 text-destructive" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-destructive">Stop Loss</p>
                                <p className="text-xs text-muted-foreground">${parseFloat(stopLossPrice).toFixed(2)}</p>
                              </div>
                              <span className="text-xs font-mono text-destructive">-{result.stopLossPercentage.toFixed(2)}%</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                              <Shield className="h-4 w-4 text-destructive" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-destructive">Stop Loss</p>
                                <p className="text-xs text-muted-foreground">${parseFloat(stopLossPrice).toFixed(2)}</p>
                              </div>
                              <span className="text-xs font-mono text-destructive">-{result.stopLossPercentage.toFixed(2)}%</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold">Entry Price</p>
                                <p className="text-xs text-muted-foreground">${parseFloat(entryPrice).toFixed(2)}</p>
                              </div>
                              <span className="text-xs font-mono">Entry</span>
                            </div>
                            {takeProfitPrice && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                                <Target className="h-4 w-4 text-success" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-success">Take Profit</p>
                                  <p className="text-xs text-muted-foreground">${parseFloat(takeProfitPrice).toFixed(2)}</p>
                                </div>
                                <span className="text-xs font-mono text-success">+{result.takeProfitPercentage.toFixed(2)}%</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Professional Tips */}
                    <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Professional Risk Management Tips
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Never risk more than 1-2% of your account on a single trade</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Always use stop losses - no exceptions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Aim for minimum 1:2 risk/reward ratio, ideally 1:3 or higher</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Consider market volatility and adjust position size accordingly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Keep a trading journal to track all your trades and learn from them</span>
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button onClick={resetCalculator} variant="outline" className="flex-1 h-12">
                        New Calculation
                      </Button>
                      <Button onClick={exportCalculation} variant="outline" className="flex-1 h-12">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button onClick={() => setCurrentStep(3)} variant="outline" className="flex-1 h-12">
                        Adjust Values
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RiskCalculatorPopup;