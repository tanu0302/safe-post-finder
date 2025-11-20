import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, Music, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AudioAnalysisResult {
  isCopyrighted: boolean;
  confidence: number;
  contentType: string;
  suspectedOwner: string;
  details: string;
  reasoning: string;
  transcription: string;
}

const AudioDetector = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AudioAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
        toast.error('Please upload a valid audio file (MP3, WAV, WEBM, OGG, or M4A)');
        return;
      }

      // Check file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Audio file must be less than 25MB');
        return;
      }

      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeAudio = async () => {
    if (!audioFile) {
      toast.error('Please select an audio file first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Convert audio file to base64
      const reader = new FileReader();
      const audioData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audio-detector`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            audio: audioData,
            filename: audioFile.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze audio');
      }

      const data = await response.json();
      setResult(data);
      
      // Save to detection history
      const history = JSON.parse(localStorage.getItem('audioDetectionHistory') || '[]');
      history.unshift({
        id: Date.now().toString(),
        filename: audioFile.name,
        timestamp: new Date().toISOString(),
        result: data,
      });
      localStorage.setItem('audioDetectionHistory', JSON.stringify(history.slice(0, 50)));

      toast.success('Audio analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (result.isCopyrighted && result.confidence >= 70) {
      return <XCircle className="h-12 w-12 text-red-500" />;
    } else if (result.isCopyrighted && result.confidence >= 40) {
      return <AlertCircle className="h-12 w-12 text-amber-500" />;
    } else {
      return <CheckCircle className="h-12 w-12 text-success" />;
    }
  };

  const getStatusText = () => {
    if (!result) return '';
    
    if (result.isCopyrighted && result.confidence >= 70) {
      return 'Copyrighted Content Detected';
    } else if (result.isCopyrighted && result.confidence >= 40) {
      return 'Possibly Copyrighted';
    } else {
      return 'Original Content';
    }
  };

  const getStatusColor = () => {
    if (!result) return '';
    
    if (result.isCopyrighted && result.confidence >= 70) {
      return 'from-red-100 to-red-50 dark:from-red-950/30 dark:to-red-900/20';
    } else if (result.isCopyrighted && result.confidence >= 40) {
      return 'from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/20';
    } else {
      return 'from-green-100 to-green-50 dark:from-green-950/30 dark:to-green-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent/50 rounded-full mb-2">
              <Music className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Audio Analysis</span>
            </div>
            <h1 className="text-5xl font-bold gradient-text">Audio Copyright Detector</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload audio files to detect copyrighted music, dialogue, or other protected content
            </p>
          </div>

          {/* Upload Card */}
          <Card className="shadow-2xl border-2 mb-8">
            <CardHeader className="bg-gradient-to-r from-accent/50 to-accent/30 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <Music className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Upload Audio File</CardTitle>
                  <CardDescription className="text-base mt-1">
                    MP3, WAV, WEBM, OGG, or M4A (max 25MB)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {audioFile ? audioFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Audio files up to 25MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {audioFile && (
                <div className="space-y-4">
                  <audio controls src={audioUrl} className="w-full" />
                  
                  <Button
                    className="w-full text-lg py-6"
                    size="lg"
                    onClick={analyzeAudio}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Analyzing Audio...
                      </>
                    ) : (
                      <>
                        <Music className="h-5 w-5 mr-2" />
                        Detect Copyright
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          {result && (
            <Card className={`shadow-2xl border-2 bg-gradient-to-br ${getStatusColor()} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <CardContent className="p-8 space-y-6">
                {/* Result Header */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card shadow-lg">
                    {getStatusIcon()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{getStatusText()}</h2>
                    <p className="text-lg text-muted-foreground">{result.details}</p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-3 bg-card rounded-xl p-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Confidence Score</span>
                    <span className="text-2xl font-bold">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-card rounded-xl p-4 space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Content Type</h3>
                    <p className="text-lg font-medium">{result.contentType}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">Suspected Owner</h3>
                    <p className="text-lg font-medium">{result.suspectedOwner}</p>
                  </div>
                </div>

                {/* Analysis */}
                <div className="bg-card rounded-xl p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Analysis Details
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {/* Transcription */}
                {result.transcription && (
                  <div className="bg-card/80 rounded-xl p-6 space-y-3">
                    <h3 className="font-semibold">Audio Transcription</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-h-48 overflow-y-auto">
                      {result.transcription}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setAudioFile(null);
                    setAudioUrl('');
                    setResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Check Another Audio File
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioDetector;
