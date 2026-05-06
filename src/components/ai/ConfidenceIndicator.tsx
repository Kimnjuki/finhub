import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number;
}

const ConfidenceIndicator = ({ confidence }: ConfidenceIndicatorProps) => {
  const getConfidenceLevel = () => {
    if (confidence >= 75) return { label: 'High', color: 'text-success', icon: CheckCircle2 };
    if (confidence >= 50) return { label: 'Medium', color: 'text-warning', icon: AlertCircle };
    return { label: 'Low', color: 'text-destructive', icon: XCircle };
  };

  const level = getConfidenceLevel();
  const Icon = level.icon;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Confidence Level</p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${level.color}`} />
            <span className={`font-semibold ${level.color}`}>{level.label}</span>
          </div>
          <span className="text-2xl font-bold">{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-2" />
      </div>
    </div>
  );
};

export default ConfidenceIndicator;
