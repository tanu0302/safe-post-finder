import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Sparkles, Heart, Loader2, Brain, User } from 'lucide-react';

interface AnalysisResult {
  isAI: boolean;
  confidence: number;
  message: string;
}

const AITextChecker = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getEncouragingMessage = (isAI: boolean, confidence: number): string => {
    if (!isAI && confidence >= 80) {
      return "Looks beautifully original! Your unique voice shines through! ✨";
    } else if (!isAI && confidence >= 60) {
      return "Great work! This has a wonderful human touch! 💫";
    } else if (!isAI) {
      return "Nice! This appears to be human-written content! 🌟";
    } else if (isAI && confidence >= 80) {
      return "Hmm, this seems crafted by AI magic ✨ Consider adding your personal touch!";
    } else if (isAI && confidence >= 60) {
      return "This might be AI-assisted. A little human warmth could make it even better! 🤖";
    } else {
      return "Interesting mix! Could be AI-enhanced or human-written with structure! 🎭";
    }
  };

  // Mock AI detection logic
  const mockAIDetection = async (text: string): Promise<{ isAI: boolean; confidence: number }> => {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const aiIndicators = [
      /in conclusion/gi,
      /furthermore/gi,
      /moreover/gi,
      /it is important to note/gi,
      /delve into/gi,
      /comprehensive/gi,
      /leverage/gi,
      /robust/gi,
      /cutting-edge/gi,
      /state-of-the-art/gi,
    ];

    const humanIndicators = [
      /\bi\b/gi,
      /\bme\b/gi,
      /\bmy\b/gi,
      /lol/gi,
      /haha/gi,
      /basically/gi,
      /like/gi,
      /you know/gi,
    ];

    let aiScore = 0;
    let humanScore = 0;

    aiIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) aiScore += matches.length * 10;
    });

    humanIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) humanScore += matches.length * 8;
    });

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) {
      const lengths = sentences.map(s => s.trim().split(/\s+/).length);
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
      
      if (variance < 20) aiScore += 15;
      if (variance > 50) humanScore += 10;
    }

    const hasTypos = /\b(teh|recieve|occured|seperate|definately)\b/gi.test(text);
    if (hasTypos) humanScore += 20;

    const totalScore = aiScore + humanScore;
    const aiProbability = totalScore > 0 ? aiScore / totalScore : 0.5;
    const confidence = Math.min(95, Math.max(50, (aiProbability * 100) + (Math.random() - 0.5) * 20));
    const isAI = aiProbability > 0.5;

    return {
      isAI,
      confidence: Math.round(confidence),
    };
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please paste some text to analyze!');
      return;
    }

    if (text.trim().length < 50) {
      toast.error('Please provide at least 50 characters for accurate analysis');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await mockAIDetection(text.trim());

      const analysisResult: AnalysisResult = {
        isAI: data.isAI,
        confidence: data.confidence,
        message: getEncouragingMessage(data.isAI, data.confidence)
      };

      setResult(analysisResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Could not analyze text. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (isAI: boolean) => {
    return isAI 
      ? 'from-red-100 to-red-50 dark:from-red-950/30 dark:to-red-900/20' 
      : 'from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-900/20';
  };

  const getProgressColor = (isAI: boolean) => {
    return isAI ? 'bg-red-500' : 'bg-success';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent/50 rounded-full mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Analysis (Mock Mode)</span>
            </div>
            <h1 className="text-5xl font-bold gradient-text">AI Text Checker</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your friendly companion to understand if content is AI-generated or human-written! 
              We're here to help, not judge! 💖
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-2xl border-2 mb-8">
            <CardHeader className="bg-gradient-to-r from-accent/50 to-accent/30 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Paste Your Text</CardTitle>
                  <CardDescription className="text-base mt-1">
                    We'll analyze it with care and give you insights!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Your Text
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {text.length} characters (min. 50)
                  </span>
                </div>
                <Textarea
                  placeholder="Paste any text here... articles, essays, social media posts, emails - anything you'd like to check! We're here to help you understand your content better. ✨"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="text-base resize-none"
                />
              </div>

              <Button
                className="w-full text-lg py-6"
                size="lg"
                onClick={handleAnalyze}
                disabled={loading || text.trim().length < 50}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Analyzing with care...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Analyze Text
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {result && (
            <Card className={`shadow-2xl border-2 bg-gradient-to-br ${getColorClasses(result.isAI)} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <CardContent className="p-8 space-y-6">
                {/* Result Header */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card shadow-lg">
                    {result.isAI ? (
                      <Brain className="h-10 w-10 text-red-500" />
                    ) : (
                      <User className="h-10 w-10 text-success" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {result.isAI ? 'AI-Generated Content' : 'Human-Written Content'}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-3 bg-card rounded-xl p-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Confidence Score</span>
                    <span className="text-2xl font-bold">
                      {result.confidence}%
                    </span>
                  </div>
                  <Progress 
                    value={result.confidence} 
                    className="h-3"
                    style={{
                      '--progress-background': result.isAI 
                        ? 'hsl(0 85% 60%)' 
                        : 'hsl(180 50% 45%)'
                    } as React.CSSProperties}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {result.confidence >= 80 && "Very confident in this assessment"}
                    {result.confidence >= 60 && result.confidence < 80 && "Fairly confident in this assessment"}
                    {result.confidence < 60 && "Moderate confidence - mixed signals detected"}
                  </p>
                </div>

                {/* Educational Note */}
                <div className="bg-card/80 rounded-xl p-6 border-2 border-dashed space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Remember
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI tools are amazing helpers, but your unique voice and perspective make content truly special! 
                    Whether AI-assisted or fully human-written, what matters most is authenticity and value for your readers. 
                    Keep creating! 🌟
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setText('');
                    setResult(null);
                  }}
                >
                  Check Another Text
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITextChecker;
