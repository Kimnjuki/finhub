import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Plus, Trash2, Edit, DollarSign, Percent, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercentage: number;
  topGainer: Holding | null;
  topLoser: Holding | null;
}

const MOCK_HOLDINGS: Holding[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 0.5,
    avgPrice: 40000,
    currentPrice: 43250,
    value: 21625,
    pnl: 1625,
    pnlPercentage: 8.12,
    allocation: 45.2
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    quantity: 8,
    avgPrice: 2400,
    currentPrice: 2580,
    value: 20640,
    pnl: 1440,
    pnlPercentage: 7.50,
    allocation: 43.1
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    quantity: 100,
    avgPrice: 45,
    currentPrice: 98,
    value: 9800,
    pnl: 5300,
    pnlPercentage: 117.78,
    allocation: 20.5
  }
];

const PortfolioTrackerPopup = () => {
  const [open, setOpen] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>(MOCK_HOLDINGS);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    quantity: '',
    avgPrice: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const calculateSummary = useCallback(() => {
    if (holdings.length === 0) {
      setSummary(null);
      return;
    }

    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const totalCost = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.avgPrice), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    const topGainer = holdings.reduce((prev, current) => 
      (prev.pnlPercentage > current.pnlPercentage) ? prev : current);
    const topLoser = holdings.reduce((prev, current) => 
      (prev.pnlPercentage < current.pnlPercentage) ? prev : current);

    setSummary({
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
      topGainer,
      topLoser
    });
  }, [holdings]);

  const addHolding = useCallback(() => {
    if (!newHolding.symbol || !newHolding.quantity || !newHolding.avgPrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const mockCurrentPrice = parseFloat(newHolding.avgPrice) * (0.8 + Math.random() * 0.4); // Random price variation
    const quantity = parseFloat(newHolding.quantity);
    const avgPrice = parseFloat(newHolding.avgPrice);
    const value = quantity * mockCurrentPrice;
    const pnl = value - (quantity * avgPrice);
    const pnlPercentage = ((mockCurrentPrice - avgPrice) / avgPrice) * 100;

    const holding: Holding = {
      id: Date.now().toString(),
      symbol: newHolding.symbol.toUpperCase(),
      name: newHolding.symbol.toUpperCase(),
      quantity,
      avgPrice,
      currentPrice: mockCurrentPrice,
      value,
      pnl,
      pnlPercentage,
      allocation: 0 // Will be calculated in summary
    };

    setHoldings(prev => [...prev, holding]);
    setNewHolding({ symbol: '', quantity: '', avgPrice: '' });
    toast({
      title: "Holding Added",
      description: `${holding.symbol} added to portfolio`
    });
  }, [newHolding, toast]);

  const removeHolding = useCallback((id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    toast({
      title: "Holding Removed",
      description: "Position removed from portfolio"
    });
  }, [toast]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto glass-card bg-gradient-to-r from-accent/20 to-success/20 hover:from-accent/30 hover:to-success/30 border-accent/30">
          <PieChart className="h-4 w-4 mr-2" />
          Portfolio Tracker
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-6xl max-h-[90vh] overflow-y-auto glass-card" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div>
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-accent/10">
                <PieChart className="h-6 w-6 text-accent" />
              </div>
              Advanced Portfolio Tracker
            </DialogTitle>
            <DialogDescription>
              Track your investments, analyze performance, and monitor portfolio allocation
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-bold">${summary.totalValue.toLocaleString()}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                        <p className={`text-2xl font-bold ${summary.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {summary.totalPnL >= 0 ? '+' : ''}${summary.totalPnL.toLocaleString()}
                        </p>
                      </div>
                      {summary.totalPnL >= 0 ? 
                        <TrendingUp className="h-8 w-8 text-success" /> : 
                        <TrendingDown className="h-8 w-8 text-destructive" />
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">P&L %</p>
                        <p className={`text-2xl font-bold ${summary.totalPnLPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {summary.totalPnLPercentage >= 0 ? '+' : ''}{summary.totalPnLPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-warning" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Best Performer</p>
                        <p className="text-lg font-bold text-success">
                          {summary.topGainer?.symbol} +{summary.topGainer?.pnlPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-success" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Holdings Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Portfolio Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {holdings.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{holding.symbol}</p>
                          <p className="text-sm text-muted-foreground">{holding.quantity} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${holding.value.toLocaleString()}</p>
                        <p className={`text-sm ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(0)} ({holding.pnlPercentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-4 mt-6">
            {/* Add New Holding */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Holding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newHolding.symbol}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="BTC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newHolding.quantity}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avgPrice">Avg Price ($)</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      value={newHolding.avgPrice}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, avgPrice: e.target.value }))}
                      placeholder="40000"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addHolding} className="w-full btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Holdings Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Asset</th>
                        <th className="text-right p-2">Quantity</th>
                        <th className="text-right p-2">Avg Price</th>
                        <th className="text-right p-2">Current Price</th>
                        <th className="text-right p-2">Value</th>
                        <th className="text-right p-2">P&L</th>
                        <th className="text-center p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr key={holding.id} className="border-b hover:bg-muted/20">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{holding.symbol}</p>
                              <p className="text-sm text-muted-foreground">{holding.name}</p>
                            </div>
                          </td>
                          <td className="text-right p-2">{holding.quantity}</td>
                          <td className="text-right p-2">${holding.avgPrice.toLocaleString()}</td>
                          <td className="text-right p-2">${holding.currentPrice.toLocaleString()}</td>
                          <td className="text-right p-2 font-medium">${holding.value.toLocaleString()}</td>
                          <td className={`text-right p-2 ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(0)}
                            <br />
                            <span className="text-sm">
                              ({holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="text-center p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHolding(holding.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Allocation Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {holdings.map((holding, index) => (
                      <div key={holding.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{holding.symbol}</span>
                          <span className="text-sm text-muted-foreground">
                            {((holding.value / (summary?.totalValue || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${(holding.value / (summary?.totalValue || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm font-medium">Total Invested</span>
                    <span className="font-bold">${summary?.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm font-medium">Current Value</span>
                    <span className="font-bold">${summary?.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm font-medium">Best Performer</span>
                    <Badge variant="outline" className="text-success">
                      {summary?.topGainer?.symbol} +{summary?.topGainer?.pnlPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                    <span className="text-sm font-medium">Worst Performer</span>
                    <Badge variant="outline" className="text-destructive">
                      {summary?.topLoser?.symbol} {summary?.topLoser?.pnlPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioTrackerPopup;