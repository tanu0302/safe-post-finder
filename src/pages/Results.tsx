import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ResultCard } from '@/components/ResultCard';
import { CheckResult } from '@/lib/mockData';
import { ArrowLeft, Download, Flag } from 'lucide-react';
import { toast } from 'sonner';

const Results = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<CheckResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('latestResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/check');
    }
  }, [navigate]);

  const handleAppeal = () => {
    toast.success('Appeal request submitted for review');
  };

  const handleDownload = () => {
    if (!result) return;
    
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copyright-check-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded');
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/check')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Check
          </Button>

          <h1 className="text-3xl font-bold mb-8">Detection Results</h1>

          <div className="space-y-6">
            <ResultCard result={result} />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              
              {result.verdict !== 'clear' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleAppeal}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Submit Appeal
                </Button>
              )}
            </div>

            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Review the confidence score and matched references</li>
                <li>• Download the detailed report for your records</li>
                <li>• If you believe this is incorrect, submit an appeal</li>
                <li>• Check more content or view your history</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
