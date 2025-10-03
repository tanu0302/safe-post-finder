import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckResult } from '@/lib/mockData';

interface ResultCardProps {
  result: CheckResult;
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const getVerdictConfig = () => {
    switch (result.verdict) {
      case 'copyrighted':
        return {
          icon: AlertTriangle,
          label: 'Copyrighted',
          color: 'text-destructive',
          badgeVariant: 'destructive' as const,
        };
      case 'possibly':
        return {
          icon: AlertCircle,
          label: 'Possibly Copyrighted',
          color: 'text-warning',
          badgeVariant: 'outline' as const,
        };
      case 'clear':
        return {
          icon: CheckCircle,
          label: 'Clear',
          color: 'text-success',
          badgeVariant: 'secondary' as const,
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <div>
              <CardTitle className="text-xl">{config.label}</CardTitle>
              <Badge variant={config.badgeVariant} className="mt-1">
                {result.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Confidence Score
            </span>
            <span className="text-lg font-bold text-foreground">
              {result.confidence}%
            </span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        {result.matchedItem && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Matched Content
            </p>
            <p className="text-foreground font-medium">{result.matchedItem}</p>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Checked Content
          </p>
          <p className="text-foreground break-all">{result.content}</p>
        </div>

        <div className="text-xs text-muted-foreground">
          Checked on {result.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
