import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
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
          label: 'Copyrighted Material',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          badgeVariant: 'destructive' as const,
          gradient: 'from-red-500 to-red-600',
        };
      case 'possibly':
        return {
          icon: AlertCircle,
          label: 'Possibly Copyrighted',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          badgeVariant: 'outline' as const,
          gradient: 'from-yellow-500 to-orange-600',
        };
      case 'clear':
        return {
          icon: CheckCircle,
          label: 'Content Clear',
          color: 'text-success',
          bgColor: 'bg-success/10',
          badgeVariant: 'secondary' as const,
          gradient: 'from-teal-500 to-teal-600',
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <Card className="w-full shadow-xl border-2">
      <CardHeader className={`${config.bgColor} border-b-2`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient}`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">{config.label}</CardTitle>
              <div className="flex gap-2">
                <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
                  {result.type.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        <div className="p-6 bg-gradient-to-br from-accent/50 to-accent/30 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Confidence Score
              </span>
            </div>
            <span className="text-4xl font-bold gradient-text">
              {result.confidence}%
            </span>
          </div>
          <Progress value={result.confidence} className="h-3" />
        </div>

        {result.matchedItem && (
          <div className="p-6 bg-muted rounded-xl border-l-4 border-primary">
            <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Matched Reference
            </p>
            <p className="text-lg text-foreground font-semibold">{result.matchedItem}</p>
          </div>
        )}

        <div className="p-6 bg-muted rounded-xl">
          <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Analyzed Content
          </p>
          <p className="text-base text-foreground break-all">{result.content}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">Analysis Date</span>
          <span className="text-sm font-medium text-foreground">
            {result.timestamp.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
