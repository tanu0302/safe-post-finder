import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Download, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DMCATakedown = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'intro' | 'form' | 'preview'>('intro');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    yourName: '',
    yourEmail: '',
    yourAddress: '',
    yourPhone: '',
    workDescription: '',
    originalWorkUrl: '',
    infringingUrl: '',
    platform: '',
  });
  const [generatedNotice, setGeneratedNotice] = useState('');

  const platforms = [
    'Website',
    'YouTube',
    'Facebook',
    'Instagram',
    'Twitter/X',
    'TikTok',
    'Google Search',
    'Other',
  ];

  const generateNotice = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dmca-generator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            name: formData.yourName,
            email: formData.yourEmail,
            phone: formData.yourPhone,
            address: formData.yourAddress,
            workDescription: formData.workDescription,
            originalLocation: formData.originalWorkUrl || 'Not provided',
            infringingUrl: formData.infringingUrl,
            platform: formData.platform,
            infringementDescription: `Unauthorized use of my copyrighted work on ${formData.platform}`,
            additionalInfo: '',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate DMCA notice');
      }

      const data = await response.json();
      setGeneratedNotice(data.notice);
      setStep('preview');
      toast.success('DMCA notice generated successfully!');
    } catch (error) {
      console.error('Error generating notice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNotice);
    toast.success('DMCA notice copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedNotice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dmca-takedown-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('DMCA notice downloaded!');
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-full mb-4">
              <Shield className="w-16 h-16 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
              Your creativity deserves protection.
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              When someone uses your work without permission, it doesn't feel good—and you shouldn't have to fight alone.
            </p>

            <Card className="bg-gradient-to-br from-background to-muted/30 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Automatic DMCA Takedown Generator</CardTitle>
                <CardDescription className="text-base">
                  helps you gently (but powerfully!) reclaim what's yours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <p className="text-muted-foreground">
                  Just drop in a link and we'll prepare a fully formatted takedown notice for:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                    🌐 Websites
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                    🎥 YouTube, Facebook, Instagram & more
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                    🔍 Google Search removal requests
                  </li>
                </ul>
                <p className="text-muted-foreground italic pt-4">
                  We take care of the legal language…
                  <br />
                  So you can get back to making things you love. ✨
                </p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-lg font-medium">
                Ready to protect your content with kindness and confidence?
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-6 text-lg"
                onClick={() => setStep('form')}
              >
                💌 Start Takedown Request
              </Button>
            </div>

            <p className="text-sm text-muted-foreground italic">
              — Because your ideas matter. And they belong to you. 💖
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setStep('intro')}
            >
              ← Back
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create Your DMCA Takedown Notice</CardTitle>
                <CardDescription>
                  Fill in the details below and we'll generate a professional takedown notice for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="yourName">Your Full Name *</Label>
                  <Input
                    id="yourName"
                    value={formData.yourName}
                    onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yourEmail">Your Email Address *</Label>
                  <Input
                    id="yourEmail"
                    type="email"
                    value={formData.yourEmail}
                    onChange={(e) => setFormData({ ...formData, yourEmail: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yourAddress">Your Physical Address *</Label>
                  <Input
                    id="yourAddress"
                    value={formData.yourAddress}
                    onChange={(e) => setFormData({ ...formData, yourAddress: e.target.value })}
                    placeholder="123 Main St, City, State, ZIP"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yourPhone">Your Phone Number *</Label>
                  <Input
                    id="yourPhone"
                    type="tel"
                    value={formData.yourPhone}
                    onChange={(e) => setFormData({ ...formData, yourPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workDescription">Description of Your Copyrighted Work *</Label>
                  <Textarea
                    id="workDescription"
                    value={formData.workDescription}
                    onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
                    placeholder="Describe your original work (e.g., 'A photograph of sunset over mountains taken on June 1, 2024')"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalWorkUrl">URL of Your Original Work (if available)</Label>
                  <Input
                    id="originalWorkUrl"
                    type="url"
                    value={formData.originalWorkUrl}
                    onChange={(e) => setFormData({ ...formData, originalWorkUrl: e.target.value })}
                    placeholder="https://yourwebsite.com/original-work"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform Where Infringement Occurs *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="infringingUrl">URL of Infringing Content *</Label>
                  <Input
                    id="infringingUrl"
                    type="url"
                    value={formData.infringingUrl}
                    onChange={(e) => setFormData({ ...formData, infringingUrl: e.target.value })}
                    placeholder="https://platform.com/infringing-content"
                    required
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                  onClick={generateNotice}
                  disabled={
                    loading ||
                    !formData.yourName ||
                    !formData.yourEmail ||
                    !formData.yourAddress ||
                    !formData.yourPhone ||
                    !formData.workDescription ||
                    !formData.platform ||
                    !formData.infringingUrl
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Notice...
                    </>
                  ) : (
                    'Generate DMCA Notice'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setStep('form')}
          >
            ← Edit Details
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-teal-500" />
                Your DMCA Takedown Notice is Ready!
              </CardTitle>
              <CardDescription>
                Review the notice below, then copy or download it to send to the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                  {generatedNotice}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download as .txt
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">Next Steps:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>1. Copy or download your DMCA notice</li>
                  <li>2. Find the copyright contact information for {formData.platform}</li>
                  <li>3. Send your notice via their designated method (usually email)</li>
                  <li>4. Keep a copy for your records</li>
                  <li>5. Most platforms respond within 1-2 weeks</li>
                </ul>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('intro');
                  setFormData({
                    yourName: '',
                    yourEmail: '',
                    yourAddress: '',
                    yourPhone: '',
                    workDescription: '',
                    originalWorkUrl: '',
                    infringingUrl: '',
                    platform: '',
                  });
                  setGeneratedNotice('');
                }}
              >
                Create Another Notice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DMCATakedown;
