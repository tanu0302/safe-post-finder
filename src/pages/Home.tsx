import { Link } from 'react-router-dom';
import { Shield, Search, History, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Logo Detection',
      description: 'Verify logos against registered brand databases',
    },
    {
      icon: Search,
      title: 'Content Analysis',
      description: 'Check text, images, and audio for copyright issues',
    },
    {
      icon: History,
      title: 'History Tracking',
      description: 'Keep records of all your copyright checks',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get real-time detection with confidence scores',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-accent rounded-full mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Copyright Violation Detector
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Detect Copyright Issues in Social Media Content
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Protect your brand and ensure compliance with our comprehensive copyright detection system. 
            Check logos, taglines, images, audio, text, and URLs instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/check">
                <Search className="mr-2 h-5 w-5" />
                Start Detection
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/history">
                <History className="mr-2 h-5 w-5" />
                View History
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-accent rounded-lg w-fit mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-gradient-primary rounded-xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Protect Your Content?
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
            Start checking your content now and get instant results with detailed confidence scores.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/check">Get Started Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
