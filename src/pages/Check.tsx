import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadDropzone } from '@/components/UploadDropzone';
import { checkContent, CheckResult } from '@/lib/mockData';
import { toast } from 'sonner';
import { Shield, FileText, Music, Image as ImageIcon, Type, Link as LinkIcon, Sparkles } from 'lucide-react';

const Check = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<CheckResult['type']>('logo');
  const [loading, setLoading] = useState(false);

  // Form states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [tagline, setTagline] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [url, setUrl] = useState('');

  const handleCheck = async (type: CheckResult['type'], content: string) => {
    if (!content.trim()) {
      toast.error('Please provide content to check');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = checkContent(type, content);
    
    // Store result in sessionStorage for the results page
    sessionStorage.setItem('latestResult', JSON.stringify(result));
    
    // Store in history
    const history = JSON.parse(localStorage.getItem('checkHistory') || '[]');
    history.unshift(result);
    localStorage.setItem('checkHistory', JSON.stringify(history.slice(0, 50)));
    
    setLoading(false);
    
    if (result.verdict === 'copyrighted') {
      toast.error('Copyright violation detected!');
    } else if (result.verdict === 'possibly') {
      toast.warning('Possible copyright issue found');
    } else {
      toast.success('Content appears clear');
    }
    
    navigate('/results');
  };

  const checkTypes = [
    { type: 'logo' as const, icon: Shield, title: 'Logo', description: 'Verify brand logos', gradient: 'from-purple-500 to-purple-600' },
    { type: 'tagline' as const, icon: FileText, title: 'Tagline', description: 'Check text slogans', gradient: 'from-teal-500 to-teal-600' },
    { type: 'audio' as const, icon: Music, title: 'Audio', description: 'Scan audio files', gradient: 'from-purple-500 to-pink-600' },
    { type: 'image' as const, icon: ImageIcon, title: 'Image', description: 'Analyze images & memes', gradient: 'from-teal-500 to-cyan-600' },
    { type: 'text' as const, icon: Type, title: 'Text', description: 'Check text content', gradient: 'from-purple-600 to-teal-500' },
    { type: 'url' as const, icon: LinkIcon, title: 'URL', description: 'Scan social media links', gradient: 'from-teal-600 to-purple-500' },
  ];

  const renderCheckForm = () => {
    switch (activeType) {
      case 'logo':
        return (
          <>
            <Label htmlFor="logo-upload" className="text-lg font-semibold">Upload Logo File</Label>
            <UploadDropzone accept="image/png,image/jpeg,image/svg+xml" onFileSelect={setLogoFile} />
            <Button
              className="w-full"
              size="lg"
              disabled={!logoFile || loading}
              onClick={() => handleCheck('logo', logoFile?.name || '')}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
      case 'tagline':
        return (
          <>
            <Label htmlFor="tagline-input" className="text-lg font-semibold">Enter Your Tagline</Label>
            <Input
              id="tagline-input"
              placeholder="e.g., Connecting the Future"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="text-lg py-6"
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!tagline.trim() || loading}
              onClick={() => handleCheck('tagline', tagline)}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
      case 'audio':
        return (
          <>
            <Label htmlFor="audio-upload" className="text-lg font-semibold">Upload Audio File</Label>
            <UploadDropzone accept="audio/mpeg,audio/wav,audio/mp3" onFileSelect={setAudioFile} />
            <Button
              className="w-full"
              size="lg"
              disabled={!audioFile || loading}
              onClick={() => handleCheck('audio', audioFile?.name || '')}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
      case 'image':
        return (
          <>
            <Label htmlFor="image-upload" className="text-lg font-semibold">Upload Image or Meme</Label>
            <UploadDropzone accept="image/jpeg,image/png,image/gif" onFileSelect={setImageFile} />
            <Button
              className="w-full"
              size="lg"
              disabled={!imageFile || loading}
              onClick={() => handleCheck('image', imageFile?.name || '')}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
      case 'text':
        return (
          <>
            <Label htmlFor="text-input" className="text-lg font-semibold">Paste Text Content</Label>
            <Textarea
              id="text-input"
              placeholder="Enter the text content you want to check..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={8}
              className="text-base"
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!textContent.trim() || loading}
              onClick={() => handleCheck('text', textContent)}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
      case 'url':
        return (
          <>
            <Label htmlFor="url-input" className="text-lg font-semibold">Enter Social Media URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://socialmedia.com/post/12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-lg py-6"
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!url.trim() || loading}
              onClick={() => handleCheck('url', url)}
            >
              {loading ? 'Analyzing...' : 'Run Copyright Check'}
            </Button>
          </>
        );
    }
  };

  const activeCheckType = checkTypes.find(t => t.type === activeType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Detection</span>
            </div>
            <h1 className="text-5xl font-bold gradient-text">Select Check Type</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose what you want to verify for copyright violations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {checkTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.type;
              return (
                <Card
                  key={type.type}
                  className={`cursor-pointer card-hover ${
                    isActive ? 'ring-2 ring-primary shadow-lg' : ''
                  }`}
                  onClick={() => setActiveType(type.type)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{type.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-2xl border-2">
            <CardHeader className="bg-gradient-to-r from-accent/50 to-accent/30 border-b">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activeCheckType.gradient} flex items-center justify-center`}>
                  <activeCheckType.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Check {activeCheckType.title}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {activeCheckType.description} against our copyright database
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {renderCheckForm()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Check;
