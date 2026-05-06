import { Button } from '@/components/ui/button';
import { TrendingUp, Minus, Square, PenTool, Type, Eraser, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type DrawingTool = 'select' | 'trendline' | 'horizontal' | 'rectangle' | 'fibonacci' | 'text' | 'eraser';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onClearAll: () => void;
}

export const DrawingToolbar = ({ activeTool, onToolChange, onClearAll }: DrawingToolbarProps) => {
  const tools: { id: DrawingTool; icon: any; label: string }[] = [
    { id: 'select', icon: PenTool, label: 'Select' },
    { id: 'trendline', icon: TrendingUp, label: 'Trend Line' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'fibonacci', icon: TrendingUp, label: 'Fibonacci' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <Card className="p-2">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium mr-2 px-2">Drawing Tools:</span>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.id}
              size="sm"
              variant={activeTool === tool.id ? 'default' : 'ghost'}
              onClick={() => onToolChange(tool.id)}
              className="h-8 px-2"
              title={tool.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
        <div className="ml-2 border-l pl-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            className="h-8 px-2 text-destructive"
            title="Clear All Drawings"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
