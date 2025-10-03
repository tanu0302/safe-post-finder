import { Link } from 'react-router-dom';
import { Shield, Search, History, Zap, Lock, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Logo Detection',
      description: 'Verify logos against registered brand databases with 95%+ accuracy',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Search,
      title: 'Content Analysis',
      description: 'Check text, images, and audio for copyright issues instantly',
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Confidence Scoring',
      description: 'Get detailed confidence scores for every detection result',
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Real-time detection with AI-powered matching algorithms',
      gradient: 'from-teal-600 to-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24 space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-full mb-4">
            <Shield className="h-6 w-6 text-white" />
            <span className="text-white font-semibold">AI-Powered Protection</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="gradient-text">
              Copyright Violation
            </span>
            <br />
            <span className="text-foreground">Detector</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto font-light">
            Protect your content. Detect violations instantly.
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive AI-powered system scans logos, taglines, images, audio, text, and URLs 
            to ensure your content is original and protected.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Button size="lg" asChild className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl">
              <Link to="/check">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Detection
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 py-6">
              <Link to="/history">
                <History className="mr-2 h-5 w-5" />
                View History
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="card-hover border-2">
                <CardHeader>
                  <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl w-fit mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-2">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold gradient-text mb-2">6</div>
              <p className="text-lg text-muted-foreground">Detection Types</p>
            </CardContent>
          </Card>
          <Card className="text-center p-8 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30 border-2">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold gradient-text mb-2">95%</div>
              <p className="text-lg text-muted-foreground">Accuracy Rate</p>
            </CardContent>
          </Card>
          <Card className="text-center p-8 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/30 border-2">
            <CardContent className="pt-6">
              <div className="text-5xl font-bold gradient-text mb-2">&lt;2s</div>
              <p className="text-lg text-muted-foreground">Analysis Time</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="overflow-hidden border-2">
          <div className="bg-gradient-hero p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Protect Your Content?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and brands using our AI-powered copyright detection system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link to="/check">
                  <Search className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link to="/admin">
                  <Lock className="mr-2 h-5 w-5" />
                  Admin Access
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
