import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Play, Pause, RotateCcw, Target, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  pnl?: number;
  status: 'open' | 'closed';
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SimulatorState {
  balance: number;
  equity: number;
  pnl: number;
  trades: Trade[];
  positions: { [key: string]: { quantity: number; avgPrice: number; } };
  isRunning: boolean;
}

const MOCK_SYMBOLS = ['BTC', 'ETH', 'SOL', 'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'];

const INITIAL_MARKET_DATA: MarketData[] = [
  { symbol: 'BTC', price: 43250, change: 1250, changePercent: 2.97 },
  { symbol: 'ETH', price: 2580, change: 125, changePercent: 5.09 },
  { symbol: 'SOL', price: 98.45, change: -2.15, changePercent: -2.14 },
  { symbol: 'AAPL', price: 185.23, change: 3.45, changePercent: 1.90 },
  { symbol: 'TSLA', price: 245.67, change: -5.23, changePercent: -2.08 },
  { symbol: 'MSFT', price: 378.90, change: 7.20, changePercent: 1.94 },
  { symbol: 'GOOGL', price: 135.45, change: -1.25, changePercent: -0.91 },
  { symbol: 'AMZN', price: 156.78, change: 4.32, changePercent: 2.83 }
];

const TradingSimulatorPopup = () => {
  const [open, setOpen] = useState(false);
  const [simulator, setSimulator] = useState<SimulatorState>({
    balance: 100000,
    equity: 100000,
    pnl: 0,
    trades: [],
    positions: {},
    isRunning: false
  });
  const [marketData, setMarketData] = useState<MarketData[]>(INITIAL_MARKET_DATA);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [tradeQuantity, setTradeQuantity] = useState('1');
  const [activeTab, setActiveTab] = useState('trade');
  const { toast } = useToast();

  const simulateMarketMovement = useCallback(() => {
    setMarketData(prev => prev.map(data => {
      const volatility = Math.random() * 0.02 - 0.01; // ±1% random movement
      const newPrice = data.price * (1 + volatility);
      const change = newPrice - data.price;
      const changePercent = (change / data.price) * 100;
      
      return {
        ...data,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };
    }));
  }, []);

  const executeTrade = useCallback((type: 'buy' | 'sell') => {
    const selectedAsset = marketData.find(d => d.symbol === selectedSymbol);
    if (!selectedAsset) return;

    const quantity = parseFloat(tradeQuantity);
    const price = selectedAsset.price;
    const totalValue = quantity * price;

    if (type === 'buy' && totalValue > simulator.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough funds to execute this trade",
        variant: "destructive"
      });
      return;
    }

    const position = simulator.positions[selectedSymbol] || { quantity: 0, avgPrice: 0 };
    
    if (type === 'sell' && quantity > position.quantity) {
      toast({
        title: "Insufficient Position",
        description: "Cannot sell more than you own",
        variant: "destructive"
      });
      return;
    }

    // Calculate realized P&L for sell trades
    let realizedPnL = 0;
    if (type === 'sell' && position.avgPrice > 0) {
      realizedPnL = (price - position.avgPrice) * quantity;
    }

    const trade: Trade = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      type,
      quantity,
      price,
      timestamp: new Date(),
      status: type === 'sell' ? 'closed' : 'open',
      pnl: type === 'sell' ? realizedPnL : undefined
    };

    setSimulator(prev => {
      const newBalance = type === 'buy' ? prev.balance - totalValue : prev.balance + totalValue;
      const newPositions = { ...prev.positions };

      if (type === 'buy') {
        const currentPos = newPositions[selectedSymbol] || { quantity: 0, avgPrice: 0 };
        const totalQuantity = currentPos.quantity + quantity;
        const avgPrice = totalQuantity > 0 ? 
          ((currentPos.quantity * currentPos.avgPrice) + (quantity * price)) / totalQuantity : 0;
        
        newPositions[selectedSymbol] = { quantity: parseFloat(totalQuantity.toFixed(8)), avgPrice: parseFloat(avgPrice.toFixed(2)) };
      } else {
        const currentPos = newPositions[selectedSymbol];
        if (currentPos) {
          const newQuantity = parseFloat((currentPos.quantity - quantity).toFixed(8));
          if (newQuantity <= 0.00000001) {
            delete newPositions[selectedSymbol];
          } else {
            newPositions[selectedSymbol] = { ...currentPos, quantity: newQuantity };
          }
        }
      }

      return {
        ...prev,
        balance: parseFloat(newBalance.toFixed(2)),
        trades: [...prev.trades, trade],
        positions: newPositions
      };
    });

    toast({
      title: "Trade Executed",
      description: `${type.toUpperCase()} ${quantity} ${selectedSymbol} @ $${price}${type === 'sell' ? ` | P&L: ${realizedPnL >= 0 ? '+' : ''}$${realizedPnL.toFixed(2)}` : ''}`,
    });
  }, [selectedSymbol, tradeQuantity, marketData, simulator.balance, simulator.positions, toast]);

  const calculatePortfolioValue = useCallback(() => {
    let totalEquity = simulator.balance;
    let unrealizedPnL = 0;
    let realizedPnL = 0;

    // Calculate realized P&L from closed trades
    simulator.trades.forEach(trade => {
      if (trade.status === 'closed' && trade.pnl !== undefined) {
        realizedPnL += trade.pnl;
      }
    });

    // Calculate unrealized P&L from open positions
    Object.entries(simulator.positions).forEach(([symbol, position]) => {
      const currentMarketData = marketData.find(d => d.symbol === symbol);
      if (currentMarketData && position.quantity > 0) {
        const currentValue = position.quantity * currentMarketData.price;
        const costBasis = position.quantity * position.avgPrice;
        totalEquity += currentValue;
        unrealizedPnL += (currentValue - costBasis);
      }
    });

    const totalPnL = realizedPnL + unrealizedPnL;

    setSimulator(prev => ({ 
      ...prev, 
      equity: parseFloat(totalEquity.toFixed(2)), 
      pnl: parseFloat(totalPnL.toFixed(2)) 
    }));
  }, [simulator.balance, simulator.positions, simulator.trades, marketData]);

  const resetSimulator = useCallback(() => {
    setSimulator({
      balance: 100000,
      equity: 100000,
      pnl: 0,
      trades: [],
      positions: {},
      isRunning: false
    });
    setMarketData(INITIAL_MARKET_DATA);
    toast({
      title: "Simulator Reset",
      description: "Portfolio reset to initial state"
    });
  }, [toast]);

  const toggleSimulation = useCallback(() => {
    setSimulator(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulator.isRunning) {
      interval = setInterval(() => {
        simulateMarketMovement();
      }, 3000); // Update every 3 seconds for stability
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulator.isRunning, simulateMarketMovement]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculatePortfolioValue();
    }, 100); // Debounce for stability
    return () => clearTimeout(timeoutId);
  }, [calculatePortfolioValue]);

  const getCurrentPrice = useCallback((symbol: string) => {
    return marketData.find(d => d.symbol === symbol)?.price || 0;
  }, [marketData]);

  const orderValue = useMemo(() => {
    const qty = parseFloat(tradeQuantity || '0');
    const price = getCurrentPrice(selectedSymbol);
    return (qty * price).toFixed(2);
  }, [tradeQuantity, selectedSymbol, getCurrentPrice]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto glass-card bg-gradient-to-r from-warning/20 to-primary/20 hover:from-warning/30 hover:to-primary/30 border-warning/30">
          <Zap className="h-4 w-4 mr-2" />
          Trading Simulator
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
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="h-6 w-6 text-warning" />
              </div>
              Advanced Trading Simulator
              {simulator.isRunning && (
                <Badge variant="outline" className="text-success pulse-dot">
                  <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
                  Live
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Practice trading with real-time market simulation using virtual money
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="text-xl font-bold">${simulator.balance.toLocaleString()}</p>
                </div>
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Equity</p>
                  <p className="text-xl font-bold">${simulator.equity.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">P&L</p>
                  <p className={`text-xl font-bold ${simulator.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {simulator.pnl >= 0 ? '+' : ''}${simulator.pnl.toFixed(2)}
                  </p>
                </div>
                {simulator.pnl >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-success" /> : 
                  <TrendingDown className="h-6 w-6 text-destructive" />
                }
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4 space-y-2">
              <Button 
                onClick={toggleSimulation}
                className={`w-full ${simulator.isRunning ? 'btn-secondary' : 'btn-primary'}`}
                size="sm"
              >
                {simulator.isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button 
                onClick={resetSimulator}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_SYMBOLS.map(symbol => (
                          <SelectItem key={symbol} value={symbol}>
                            <div className="flex items-center justify-between w-full">
                              <span>{symbol}</span>
                              <span className="text-sm font-mono">
                                ${getCurrentPrice(symbol).toLocaleString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={tradeQuantity}
                      onChange={(e) => setTradeQuantity(e.target.value)}
                      placeholder="1"
                      step="0.01"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Current Price:</span>
                      <span className="font-mono">${getCurrentPrice(selectedSymbol).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Order Value:</span>
                      <span className="font-mono">
                        ${parseFloat(orderValue).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => executeTrade('buy')}
                      className="btn-primary"
                      disabled={!simulator.isRunning}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy
                    </Button>
                    <Button 
                      onClick={() => executeTrade('sell')}
                      variant="destructive"
                      disabled={!simulator.isRunning}
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Sell
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-sm text-muted-foreground">Available Balance</div>
                      <div className="text-lg font-bold">${simulator.balance.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-sm text-muted-foreground">Open Positions</div>
                      <div className="text-lg font-bold">{Object.keys(simulator.positions).length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                      <div className="text-lg font-bold">{simulator.trades.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="text-sm text-muted-foreground">Return %</div>
                      <div className={`text-lg font-bold ${simulator.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {((simulator.pnl / 100000) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="positions" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Open Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(simulator.positions).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Avg Price</th>
                          <th className="text-right p-2">Current Price</th>
                          <th className="text-right p-2">Market Value</th>
                          <th className="text-right p-2">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(simulator.positions).map(([symbol, position]) => {
                          const currentPrice = getCurrentPrice(symbol);
                          const marketValue = position.quantity * currentPrice;
                          const costBasis = position.quantity * position.avgPrice;
                          const pnl = marketValue - costBasis;
                          const pnlPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;

                          return (
                            <tr key={symbol} className="border-b hover:bg-muted/20">
                              <td className="p-2 font-medium">{symbol}</td>
                              <td className="text-right p-2">{position.quantity}</td>
                              <td className="text-right p-2">${position.avgPrice.toFixed(2)}</td>
                              <td className="text-right p-2">${currentPrice.toFixed(2)}</td>
                              <td className="text-right p-2 font-medium">${marketValue.toFixed(2)}</td>
                              <td className={`text-right p-2 ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                                <br />
                                <span className="text-sm">
                                  ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No open positions</p>
                    <p className="text-sm">Start trading to see your positions here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                {simulator.trades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Time</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-center p-2">Type</th>
                          <th className="text-right p-2">Quantity</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulator.trades.slice().reverse().map((trade) => (
                          <tr key={trade.id} className="border-b hover:bg-muted/20">
                            <td className="p-2 text-sm">
                              {trade.timestamp.toLocaleTimeString()}
                            </td>
                            <td className="p-2 font-medium">{trade.symbol}</td>
                            <td className="text-center p-2">
                              <Badge 
                                variant={trade.type === 'buy' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {trade.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="text-right p-2">{trade.quantity}</td>
                            <td className="text-right p-2">${trade.price.toFixed(2)}</td>
                            <td className="text-right p-2">${(trade.quantity * trade.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No trades yet</p>
                    <p className="text-sm">Your trade history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Market Data
                  {simulator.isRunning && (
                    <Badge variant="outline" className="text-success">
                      <div className="w-2 h-2 rounded-full bg-success mr-1 pulse-dot"></div>
                      Live
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData.map((data) => (
                    <div 
                      key={data.symbol}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedSymbol === data.symbol ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
                      }`}
                      onClick={() => setSelectedSymbol(data.symbol)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{data.symbol}</h3>
                        <Badge 
                          variant={data.changePercent >= 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">${data.price.toLocaleString()}</p>
                      <p className={`text-sm ${data.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TradingSimulatorPopup;