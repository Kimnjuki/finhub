import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Trophy,
  XCircle,
  CheckCircle2,
  Play,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { SimulationConfig } from '@/types/learning';

interface PaperTradingSimulationProps {
  config: SimulationConfig;
  onComplete: (profitLoss: number, trades: number) => void;
  onClose: () => void;
}

interface Position {
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  size: number;
  timestamp: number;
}

interface Trade {
  type: 'buy' | 'sell';
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  pnl?: number;
}

// Simulated price data
const generatePriceData = (basePrice: number): number[] => {
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < 50; i++) {
    price += (Math.random() - 0.48) * (basePrice * 0.02);
    data.push(price);
  }
  return data;
};

const PAPER_TRADING_ASSETS = [
  { symbol: 'BTC/USD', basePrice: 45000, volatility: 0.02 },
  { symbol: 'ETH/USD', basePrice: 3000, volatility: 0.025 },
  { symbol: 'SOL/USD', basePrice: 100, volatility: 0.03 },
  { symbol: 'BNB/USD', basePrice: 300, volatility: 0.02 },
  { symbol: 'XRP/USD', basePrice: 0.6, volatility: 0.025 },
];

const PaperTradingSimulation: React.FC<PaperTradingSimulationProps> = ({
  config,
  onComplete,
  onClose,
}) => {
  const [balance, setBalance] = useState(config.initialBalance);
  const [selectedAsset, setSelectedAsset] = useState(PAPER_TRADING_ASSETS[0]);
  const [currentPrice, setCurrentPrice] = useState(selectedAsset.basePrice);
  const [priceHistory, setPriceHistory] = useState(() =>
    generatePriceData(selectedAsset.basePrice)
  );
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [tradeSize, setTradeSize] = useState(100);
  const [selectedType, setSelectedType] = useState<'long' | 'short'>('long');
  const [isRunning, setIsRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState<'ready' | 'running' | 'completed'>(
    'ready'
  );
  const [remainingDays, setRemainingDays] = useState(config.duration);
  const [totalPnL, setTotalPnL] = useState(0);

  // Price simulation ticker
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setPriceHistory((prev) => {
        const newPrice =
          prev[prev.length - 1] +
          (Math.random() - 0.48) * selectedAsset.volatility * selectedAsset.basePrice;
        setCurrentPrice(newPrice);

        // Update unrealized P&L
        const updatedPositions = positions.map((pos) => {
          if (pos.symbol === selectedAsset.symbol) {
            const pnl =
              pos.type === 'long'
                ? (newPrice - pos.entryPrice) * pos.size
                : (pos.entryPrice - newPrice) * pos.size;
            return { ...pos, currentPrice: newPrice };
          }
          return pos;
        });
        setPositions(updatedPositions);

        const newHistory = [...prev.slice(1), newPrice];
        return newHistory;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, positions, selectedAsset]);

  // Game duration timer
  useEffect(() => {
    if (!isRunning || gameStatus !== 'running') return;

    const interval = setInterval(() => {
      setRemainingDays((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setGameStatus('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 10000); // 10 seconds = 1 day for demo

    return () => clearInterval(interval);
  }, [isRunning, gameStatus]);

  const handleTrade = useCallback(() => {
    if (balance < tradeSize) {
      alert('Insufficient balance!');
      return;
    }

    const trade: Trade = {
      type: selectedType === 'long' ? 'buy' : 'sell',
      symbol: selectedAsset.symbol,
      price: currentPrice,
      size: tradeSize,
      timestamp: Date.now(),
    };

    setBalance((prev) => prev - tradeSize);
    setTradeHistory((prev) => [...prev, trade]);
    setTotalPnL((prev) => prev - trade.size);

    const newPosition: Position = {
      symbol: selectedAsset.symbol,
      type: selectedType,
      entryPrice: currentPrice,
      size: tradeSize,
      timestamp: Date.now(),
    };

    setPositions((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.symbol === selectedAsset.symbol && p.type === selectedType
      );
      if (existingIndex >= 0) {
        // Close existing position and open new one
        const existing = prev[existingIndex];
        const closePnL =
          existing.type === 'long'
            ? (currentPrice - existing.entryPrice) * existing.size
            : (existing.entryPrice - currentPrice) * existing.size;
        setTotalPnL((prevPnl) => prevPnl + closePnL + trade.size);
        return prev.filter((_, i) => i !== existingIndex);
      }
      return [...prev, newPosition];
    });
  }, [balance, tradeSize, selectedType, selectedAsset, currentPrice]);

  const handleClosePosition = (position: Position) => {
    const pnl =
      position.type === 'long'
        ? (currentPrice - position.entryPrice) * position.size
        : (position.entryPrice - currentPrice) * position.size;

    setBalance((prev) => prev + position.size + pnl);
    setTotalPnL((prev) => prev + pnl + position.size);
    setPositions((prev) => prev.filter((p) => p !== position));

    const trade: Trade = {
      type: position.type === 'long' ? 'sell' : 'buy',
      symbol: position.symbol,
      price: currentPrice,
      size: position.size,
      timestamp: Date.now(),
      pnl,
    };
    setTradeHistory((prev) => [...prev, trade]);
  };

  const startSimulation = () => {
    setGameStatus('running');
    setIsRunning(true);
  };

  const resetSimulation = () => {
    setBalance(config.initialBalance);
    setPositions([]);
    setTradeHistory([]);
    setTotalPnL(0);
    setGameStatus('ready');
    setIsRunning(false);
    setRemainingDays(config.duration);
  };

  const finishSimulation = () => {
    setGameStatus('completed');
    setIsRunning(false);
    onComplete(totalPnL, tradeHistory.length);
  };

  const unrealizedPnL =
    positions
      .filter((p) => p.symbol === selectedAsset.symbol)
      .reduce((sum, p) => {
        const pnl =
          p.type === 'long'
            ? (currentPrice - p.entryPrice) * p.size
            : (p.entryPrice - currentPrice) * p.size;
        return sum + pnl;
      }, 0) || 0;

  const totalValue = balance + unrealizedPnL;

  const renderReadyState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Paper Trading Simulation
        </CardTitle>
        <CardDescription>
          Practice trading with ${config.initialBalance} virtual money over {config.duration} days.
          Test your strategies risk-free!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Objectives:</h3>
          {config.objectives.map((objective, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>{objective}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-sm">Available Assets:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PAPER_TRADING_ASSETS.map((asset) => (
              <Button
                key={asset.symbol}
                variant={selectedAsset.symbol === asset.symbol ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedAsset(asset);
                  setCurrentPrice(asset.basePrice);
                  setPriceHistory(generatePriceData(asset.basePrice));
                }}
              >
                {asset.symbol}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Account Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Initial Balance</div>
              <div className="font-bold text-lg">${config.initialBalance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-bold text-lg">{config.duration} days</div>
            </div>
          </div>
        </div>

        <Button size="lg" className="w-full gap-2" onClick={startSimulation}>
          <Play className="h-5 w-5" />
          Start Simulation
        </Button>
      </CardContent>
    </Card>
  );

  const renderRunningState = () => (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Price Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedAsset.symbol}
                <Badge variant="outline">
                  {selectedType === 'long' ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                </Badge>
              </CardTitle>
              <CardDescription>
                Current: <span className="font-bold text-lg">${currentPrice.toFixed(2)}</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                ${totalValue.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                P&L: {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {priceHistory.map((price, index) => {
              const minPrice = Math.min(...priceHistory);
              const maxPrice = Math.max(...priceHistory);
              const height = maxPrice > minPrice ? ((price - minPrice) / (maxPrice - minPrice)) * 100 : 50;
              const isLast = index === priceHistory.length - 1;
              return (
                <div
                  key={index}
                  className={`flex-1 rounded-sm ${
                    isLast ? 'bg-primary' : index > 0 && price > priceHistory[index - 1]
                      ? 'bg-green-500/50'
                      : 'bg-red-500/50'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`$${price.toFixed(2)}`}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trading Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trading Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedType === 'long' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setSelectedType('long')}
            >
              <TrendingUp className="h-4 w-4" />
              Long
            </Button>
            <Button
              variant={selectedType === 'short' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setSelectedType('short')}
            >
              <TrendingDown className="h-4 w-4" />
              Short
            </Button>
          </div>

          <Input
            type="number"
            placeholder="Trade size ($)"
            value={tradeSize}
            onChange={(e) => setTradeSize(Number(e.target.value))}
            min={10}
            max={balance}
          />

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleTrade}
            disabled={balance < tradeSize}
          >
            {selectedType === 'long' ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {selectedType === 'long' ? 'Buy' : 'Sell'}
          </Button>

          <div className="text-sm text-muted-foreground">
            Available: <span className="font-bold text-green-400">${balance.toFixed(2)}</span>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm mb-3">
              <span>Open Positions</span>
              <span className="text-muted-foreground">
                {positions.filter((p) => p.symbol === selectedAsset.symbol).length}
              </span>
            </div>
            {positions
              .filter((p) => p.symbol === selectedAsset.symbol)
              .map((position, index) => {
                const pnl =
                  position.type === 'long'
                    ? (currentPrice - position.entryPrice) * position.size
                    : (position.entryPrice - currentPrice) * position.size;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg mb-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{position.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {position.type.toUpperCase()} @ ${position.entryPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClosePosition(position)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="md:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Simulation Stats</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {remainingDays} days left
              </Badge>
              <Button variant="outline" onClick={finishSimulation}>
                Finish Early
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                ${balance.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Cash Balance</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Unrealized P&L</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Realized P&L</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className={`text-2xl font-bold ${totalValue >= config.initialBalance ? 'text-green-400' : 'text-red-400'}`}>
                ${totalValue.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
          </div>

          {totalValue >= config.initialBalance * 1.2 && totalValue < config.initialBalance * 5 && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-400">Great Progress!</div>
                <div className="text-sm text-muted-foreground">
                  You've achieved 20% profit target! Keep it up.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCompletedState = () => {
    const profitPercentage = ((totalValue - config.initialBalance) / config.initialBalance) * 100;
    const success = profitPercentage > 0;

    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {success ? (
                <Trophy className="h-10 w-10 text-green-400" />
              ) : (
                <XCircle className="h-10 w-10 text-red-400" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {success ? 'Congratulations!' : 'Simulation Complete'}
          </CardTitle>
          <CardDescription className="text-lg">
            Final Balance: <span className="font-bold">${totalValue.toFixed(2)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${success ? 'text-green-400' : 'text-red-400'}`}>
                  {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground">Total Return</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Total P&L</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{tradeHistory.length}</div>
                <div className="text-xs text-muted-foreground">Total Trades</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {tradeHistory.length > 0
                    ? Math.round(
                        (tradeHistory.filter((t) => t.pnl && t.pnl > 0).length /
                          tradeHistory.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {gameStatus === 'ready' && renderReadyState()}
      {gameStatus === 'running' && renderRunningState()}
      {gameStatus === 'completed' && renderCompletedState()}
    </div>
  );
};

export default PaperTradingSimulation;