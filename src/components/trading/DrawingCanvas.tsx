import { useEffect, useRef, useState } from 'react';
import { IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Drawing, Point, saveDrawings, loadDrawings, fibonacciLevels } from '@/lib/drawings';
import { DrawingTool } from './DrawingToolbar';

interface DrawingCanvasProps {
  chart: IChartApi | null;
  activeTool: DrawingTool;
  isDrawing: boolean;
  onDrawingChange: (drawings: Drawing[]) => void;
}

export const DrawingCanvas = ({ chart, activeTool, isDrawing, onDrawingChange }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawings, setDrawings] = useState<Drawing[]>(() => loadDrawings());
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    onDrawingChange(drawings);
  }, [drawings, onDrawingChange]);

  useEffect(() => {
    if (!canvasRef.current || !chart) return;

    const canvas = canvasRef.current;
    const container = chart.chartElement();
    
    // Match canvas size to chart
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = activeTool === 'select' ? 'none' : 'auto';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed drawings
    drawings.forEach((drawing) => {
      if (drawing.completed) {
        drawShape(ctx, drawing, chart);
      }
    });

    // Draw current drawing in progress
    if (currentDrawing) {
      drawShape(ctx, currentDrawing, chart);
    }
  }, [drawings, currentDrawing, chart, activeTool]);

  const drawShape = (ctx: CanvasRenderingContext2D, drawing: Drawing, chart: IChartApi) => {
    if (drawing.points.length === 0) return;

    ctx.strokeStyle = drawing.color;
    ctx.fillStyle = drawing.color + '33';
    ctx.lineWidth = 2;

    const timeScale = chart.timeScale();
    const priceScale = (chart as any).priceScale();

    const toCanvasCoords = (point: Point) => {
      const x = timeScale.timeToCoordinate(point.time as Time);
      const y = priceScale.priceToCoordinate(point.price);
      return { x: x || 0, y: y || 0 };
    };

    switch (drawing.type) {
      case 'trendline':
        if (drawing.points.length >= 2) {
          const p1 = toCanvasCoords(drawing.points[0]);
          const p2 = toCanvasCoords(drawing.points[1]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        break;

      case 'horizontal':
        if (drawing.points.length >= 1) {
          const p = toCanvasCoords(drawing.points[0]);
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          ctx.lineTo(ctx.canvas.width, p.y);
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (drawing.points.length >= 2) {
          const p1 = toCanvasCoords(drawing.points[0]);
          const p2 = toCanvasCoords(drawing.points[1]);
          const width = p2.x - p1.x;
          const height = p2.y - p1.y;
          ctx.fillRect(p1.x, p1.y, width, height);
          ctx.strokeRect(p1.x, p1.y, width, height);
        }
        break;

      case 'fibonacci':
        if (drawing.points.length >= 2) {
          const p1 = toCanvasCoords(drawing.points[0]);
          const p2 = toCanvasCoords(drawing.points[1]);
          const priceRange = drawing.points[1].price - drawing.points[0].price;

          fibonacciLevels.forEach(({ level, label }) => {
            const price = drawing.points[0].price + priceRange * level;
            const y = priceScale.priceToCoordinate(price) || 0;
            
            ctx.beginPath();
            ctx.strokeStyle = drawing.color;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(p1.x, y);
            ctx.lineTo(p2.x, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = drawing.color;
            ctx.font = '12px sans-serif';
            ctx.fillText(label, p2.x + 5, y + 4);
          });
        }
        break;

      case 'text':
        if (drawing.points.length >= 1 && drawing.text) {
          const p = toCanvasCoords(drawing.points[0]);
          ctx.fillStyle = drawing.color;
          ctx.font = '14px sans-serif';
          ctx.fillText(drawing.text, p.x, p.y);
        }
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chart || activeTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const timeScale = chart.timeScale();
    const priceScale = (chart as any).priceScale();

    const time = timeScale.coordinateToTime(x) as number;
    const price = priceScale.coordinateToPrice(y);

    if (!time || price === null) return;

    if (activeTool === 'eraser') {
      // Remove drawing at this location
      const updatedDrawings = drawings.filter((drawing) => {
        // Simple distance check
        return !drawing.points.some((point) => {
          const px = timeScale.timeToCoordinate(point.time as Time) || 0;
          const py = priceScale.priceToCoordinate(point.price) || 0;
          return Math.abs(px - x) < 10 && Math.abs(py - y) < 10;
        });
      });
      setDrawings(updatedDrawings);
      saveDrawings(updatedDrawings);
      return;
    }

    setIsDragging(true);

    const point: Point = { x, y, time, price };

    if (activeTool === 'horizontal' || activeTool === 'text') {
      // Single click tools
      const text = activeTool === 'text' ? prompt('Enter text:') || 'Text' : undefined;
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: activeTool,
        points: [point],
        text,
        color: '#8B5CF6',
        completed: true,
      };
      const updated = [...drawings, newDrawing];
      setDrawings(updated);
      saveDrawings(updated);
    } else {
      // Multi-point tools
      setCurrentDrawing({
        id: Date.now().toString(),
        type: activeTool as any,
        points: [point],
        color: '#8B5CF6',
        completed: false,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chart || !currentDrawing || !isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const timeScale = chart.timeScale();
    const priceScale = (chart as any).priceScale();

    const time = timeScale.coordinateToTime(x) as number;
    const price = priceScale.coordinateToPrice(y);

    if (!time || price === null) return;

    const point: Point = { x, y, time, price };

    setCurrentDrawing({
      ...currentDrawing,
      points: [currentDrawing.points[0], point],
    });
  };

  const handleMouseUp = () => {
    if (currentDrawing && isDragging) {
      const completed = { ...currentDrawing, completed: true };
      const updated = [...drawings, completed];
      setDrawings(updated);
      saveDrawings(updated);
      setCurrentDrawing(null);
    }
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: activeTool === 'select' ? 'default' : 'crosshair',
      }}
    />
  );
};
