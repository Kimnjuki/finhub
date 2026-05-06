// Technical Indicator Calculations

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  // Start with SMA for first value
  const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  for (let i = period; i < data.length; i++) {
    ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
  }
  
  // Pad beginning with NaN
  const result = new Array(period - 1).fill(NaN).concat(ema);
  return result;
}

// Bollinger Bands
export function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(data, period);
  const bands = sma.map((avg, i) => {
    if (isNaN(avg)) {
      return { upper: NaN, middle: NaN, lower: NaN };
    }
    const slice = data.slice(Math.max(0, i - period + 1), i + 1);
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period;
    const std = Math.sqrt(variance);
    return {
      upper: avg + (std * stdDev),
      middle: avg,
      lower: avg - (std * stdDev)
    };
  });
  return bands;
}

// Volume-Weighted Average Price
export function calculateVWAP(ohlcvData: OHLCVData[]): number[] {
  const vwap: number[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  ohlcvData.forEach((candle) => {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    vwap.push(cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : NaN);
  });
  
  return vwap;
}

// Relative Strength Index
export function calculateRSI(data: number[], period: number = 14): number[] {
  const changes = data.slice(1).map((price, i) => price - data[i]);
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  
  const result: number[] = new Array(period).fill(NaN);
  
  // First average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  
  return result;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const ema12 = calculateEMA(data, fastPeriod);
  const ema26 = calculateEMA(data, slowPeriod);
  
  const macdLine = ema12.map((val, i) => {
    if (isNaN(val) || isNaN(ema26[i])) return NaN;
    return val - ema26[i];
  });
  
  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine = calculateEMA(validMacd, signalPeriod);
  
  // Pad signal line
  const paddedSignal = new Array(macdLine.length - validMacd.length + signalPeriod - 1)
    .fill(NaN)
    .concat(signalLine);
  
  const histogram = macdLine.map((val, i) => {
    if (isNaN(val) || isNaN(paddedSignal[i])) return NaN;
    return val - paddedSignal[i];
  });
  
  return { macdLine, signalLine: paddedSignal, histogram };
}

// Stochastic Oscillator
export function calculateStochastic(ohlcvData: OHLCVData[], kPeriod: number = 14, dPeriod: number = 3) {
  const kLine: number[] = [];
  
  ohlcvData.forEach((candle, i) => {
    if (i < kPeriod - 1) {
      kLine.push(NaN);
    } else {
      const slice = ohlcvData.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...slice.map(c => c.high));
      const lowestLow = Math.min(...slice.map(c => c.low));
      const k = ((candle.close - lowestLow) / (highestHigh - lowestLow)) * 100;
      kLine.push(k);
    }
  });
  
  const validK = kLine.filter(v => !isNaN(v));
  const dLine = calculateSMA(validK, dPeriod);
  
  // Pad d line
  const paddedD = new Array(kLine.length - validK.length + dPeriod - 1)
    .fill(NaN)
    .concat(dLine);
  
  return { kLine, dLine: paddedD };
}
