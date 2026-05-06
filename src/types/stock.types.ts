export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  week52High: number;
  week52Low: number;
  sector: string;
  logo?: string;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: 'strong' | 'moderate' | 'weak';
  indicators: {
    rsi: number;
    macd: string;
    movingAverage: string;
    volume: string;
  };
  recommendation: string;
}

export interface StockAnalysis {
  stock: Stock;
  signal: TradingSignal;
  lastUpdated: Date;
}
