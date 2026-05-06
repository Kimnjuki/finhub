export interface Point {
  x: number;
  y: number;
  time: number;
  price: number;
}

export interface Drawing {
  id: string;
  type: 'trendline' | 'horizontal' | 'rectangle' | 'fibonacci' | 'text';
  points: Point[];
  text?: string;
  color: string;
  completed: boolean;
}

export const saveDrawings = (drawings: Drawing[]) => {
  localStorage.setItem('tradingChartDrawings', JSON.stringify(drawings));
};

export const loadDrawings = (): Drawing[] => {
  const saved = localStorage.getItem('tradingChartDrawings');
  return saved ? JSON.parse(saved) : [];
};

export const fibonacciLevels = [
  { level: 0, label: '0%' },
  { level: 0.236, label: '23.6%' },
  { level: 0.382, label: '38.2%' },
  { level: 0.5, label: '50%' },
  { level: 0.618, label: '61.8%' },
  { level: 1, label: '100%' },
];
