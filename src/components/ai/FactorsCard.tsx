import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface FactorsCardProps {
  factors: string[];
}

const FactorsCard = ({ factors }: FactorsCardProps) => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          Contributing Factors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {factors.map((factor, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
              <span className="text-muted-foreground">{factor}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default FactorsCard;
