import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Detection {
  logo_name: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetectionResult {
  id: string;
  filename: string;
  image_url: string;
  detections: Detection[];
  timestamp: string;
}

export default function LogoDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('logo-detector', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      setResult(data);
      toast({
        title: "Detection Complete",
        description: `Found ${data.detections.length} logo(s) in the image`,
      });
    } catch (error: any) {
      console.error('Detection error:', error);
      toast({
        title: "Detection Failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Logo Detector</h1>
          <p className="text-muted-foreground">
            Upload an image to detect and identify logos using AI
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select a JPG or PNG image containing logos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG (Max 20MB)
                  </span>
                </label>
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium truncate flex-1">
                      {selectedFile.name}
                    </span>
                    <Badge variant="secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>

                  {preview && (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full rounded-lg border"
                      />
                      {result && result.detections.length > 0 && (
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ mixBlendMode: 'multiply' }}
                        >
                          {result.detections.map((detection, idx) => (
                            <rect
                              key={idx}
                              x={`${detection.bbox.x}%`}
                              y={`${detection.bbox.y}%`}
                              width={`${detection.bbox.width}%`}
                              height={`${detection.bbox.height}%`}
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="3"
                              rx="4"
                            />
                          ))}
                        </svg>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDetect}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Detect Logos'
                      )}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.detections.length > 0 ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Detection Results
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-orange-500" />
                    No Logos Detected
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {result.detections.length > 0
                  ? `Found ${result.detections.length} logo(s) in the image`
                  : 'No recognizable logos were found in this image'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.detections.length > 0 ? (
                <div className="space-y-3">
                  {result.detections.map((detection, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{detection.logo_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Position: ({detection.bbox.x.toFixed(1)}%, {detection.bbox.y.toFixed(1)}%)
                          • Size: {detection.bbox.width.toFixed(1)}% × {detection.bbox.height.toFixed(1)}%
                        </p>
                      </div>
                      <Badge
                        variant={detection.confidence > 0.7 ? "default" : "secondary"}
                      >
                        {(detection.confidence * 100).toFixed(0)}% confident
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Try uploading an image with clearer or more recognizable brand logos.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}