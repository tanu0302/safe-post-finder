import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadDropzone } from '@/components/UploadDropzone';
import { checkContent, CheckResult } from '@/lib/mockData';
import { toast } from 'sonner';
import { Shield, FileText, Music, Image as ImageIcon, Type, Link as LinkIcon } from 'lucide-react';

const Check = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('logo');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Copyright Detection</h1>
            <p className="text-muted-foreground">
              Select a type and upload or enter content to check
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
              <TabsTrigger value="logo" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Logo</span>
              </TabsTrigger>
              <TabsTrigger value="tagline" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Tagline</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="gap-2">
                <Music className="h-4 w-4" />
                <span className="hidden sm:inline">Audio</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Text</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">URL</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logo" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <UploadDropzone
                  accept="image/png,image/jpeg,image/svg+xml"
                  onFileSelect={setLogoFile}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!logoFile || loading}
                  onClick={() => handleCheck('logo', logoFile?.name || '')}
                >
                  {loading ? 'Checking...' : 'Check Logo'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tagline" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="tagline-input">Enter Tagline</Label>
                <Input
                  id="tagline-input"
                  placeholder="e.g., Connecting the Future"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!tagline.trim() || loading}
                  onClick={() => handleCheck('tagline', tagline)}
                >
                  {loading ? 'Checking...' : 'Check Tagline'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="audio-upload">Upload Audio</Label>
                <UploadDropzone
                  accept="audio/mpeg,audio/wav,audio/mp3"
                  onFileSelect={setAudioFile}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!audioFile || loading}
                  onClick={() => handleCheck('audio', audioFile?.name || '')}
                >
                  {loading ? 'Checking...' : 'Check Audio'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="image-upload">Upload Image or Meme</Label>
                <UploadDropzone
                  accept="image/jpeg,image/png,image/gif"
                  onFileSelect={setImageFile}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!imageFile || loading}
                  onClick={() => handleCheck('image', imageFile?.name || '')}
                >
                  {loading ? 'Checking...' : 'Check Image'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="text-input">Paste Text Content</Label>
                <Textarea
                  id="text-input"
                  placeholder="Enter the text content you want to check..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={6}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!textContent.trim() || loading}
                  onClick={() => handleCheck('text', textContent)}
                >
                  {loading ? 'Checking...' : 'Check Text'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="url-input">Enter Social Media URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://socialmedia.com/post/12345"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!url.trim() || loading}
                  onClick={() => handleCheck('url', url)}
                >
                  {loading ? 'Checking...' : 'Check URL'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Check;
