import { useState } from "react";
import { Upload, Loader2, CheckCircle, XCircle, X, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Detection {
  logo_name: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  colors?: string[];
  quality?: string;
  trademark_risk?: string;
}

interface DetectionResult {
  id: string;
  filename: string;
  image_url: string;
  detections: Detection[];
  metadata?: {
    total_logos?: number;
    image_quality?: string;
    recommendations?: string[];
  };
  processing_time_ms?: number;
  timestamp: string;
}

interface BatchItem {
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: DetectionResult;
  error?: string;
}

export default function LogoDetector() {
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newItems: BatchItem[] = validFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return {
        file,
        preview,
        status: 'pending' as const,
      };
    });

    setBatchItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (index: number) => {
    setBatchItems(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Call backend to detect logos
  const detectLogo = async (file: File): Promise<DetectionResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logo-detector`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze image');
    }

    const data = await response.json();
    
    // Map backend response to frontend format
    return {
      id: data.id,
      filename: data.filename,
      image_url: data.imageUrl,
      detections: data.detections.map((d: any) => ({
        logo_name: d.name,
        confidence: d.confidence / 100,
        bbox: {
          x: d.boundingBox?.x || 0,
          y: d.boundingBox?.y || 0,
          width: d.boundingBox?.width || 0,
          height: d.boundingBox?.height || 0,
        },
      })),
      metadata: {
        total_logos: data.detections.length,
        recommendations: data.detections.length > 0
          ? ["Trademark detected - verify usage rights", "Consider consulting legal expert"]
          : ["No trademarks detected", "Safe to use with proper attribution"],
      },
      timestamp: new Date().toISOString(),
    };
  };

  const processAllImages = async () => {
    setProcessing(true);
    setCurrentProgress(0);

    const pendingItems = batchItems.filter(item => item.status === 'pending' || item.status === 'error');
    
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      const itemIndex = batchItems.findIndex(b => b.file === item.file);
      
      setBatchItems(prev => prev.map((b, idx) => 
        idx === itemIndex ? { ...b, status: 'processing' } : b
      ));

      try {
        const result = await detectLogo(item.file);

        setBatchItems(prev => prev.map((b, idx) => 
          idx === itemIndex ? { ...b, status: 'completed', result } : b
        ));

        toast({
          title: "Analysis Complete",
          description: `${item.file.name}: Found ${result.detections.length} logo(s)`,
        });
      } catch (error: any) {
        console.error('Detection error:', error);
        setBatchItems(prev => prev.map((b, idx) =>
          idx === itemIndex ? { ...b, status: 'error', error: error.message } : b
        ));
        
        toast({
          title: "Detection Failed",
          description: `${item.file.name}: ${error.message}`,
          variant: "destructive",
        });
      }

      setCurrentProgress(((i + 1) / pendingItems.length) * 100);
    }

    setProcessing(false);
    toast({
      title: "Batch Complete",
      description: `Processed ${pendingItems.length} image(s)`,
    });
  };

  const downloadReport = (item: BatchItem) => {
    if (!item.result) return;

    const report = {
      filename: item.file.name,
      timestamp: item.result.timestamp,
      processing_time: item.result.processing_time_ms ? `${item.result.processing_time_ms}ms` : 'N/A',
      detections: item.result.detections.map(d => ({
        brand: d.logo_name,
        confidence: `${(d.confidence * 100).toFixed(1)}%`,
        colors: d.colors || [],
        quality: d.quality || 'N/A',
        trademark_risk: d.trademark_risk || 'N/A',
        position: `(${d.bbox.x.toFixed(1)}%, ${d.bbox.y.toFixed(1)}%)`,
        size: `${d.bbox.width.toFixed(1)}% × ${d.bbox.height.toFixed(1)}%`
      })),
      metadata: item.result.metadata
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-detection-${item.file.name}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Detection report saved successfully",
    });
  };

  const clearAll = () => {
    batchItems.forEach(item => URL.revokeObjectURL(item.preview));
    setBatchItems([]);
    setCurrentProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Logo Detector</h1>
          <p className="text-muted-foreground">
            Upload single or multiple images to detect and analyze logos with AI
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
            <CardDescription>
              Drag and drop or click to select one or more images (JPG, PNG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleFileSelect}
                disabled={processing}
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
                  JPG, PNG (Max 20MB per file) • Multiple files supported
                </span>
              </label>
            </div>

            {batchItems.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {batchItems.length} image(s) • {batchItems.filter(i => i.status === 'completed').length} completed
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={processAllImages}
                      disabled={processing || batchItems.every(i => i.status === 'completed')}
                      size="sm"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Analyze All'
                      )}
                    </Button>
                    <Button onClick={clearAll} variant="outline" size="sm" disabled={processing}>
                      Clear All
                    </Button>
                  </div>
                </div>

                {processing && (
                  <Progress value={currentProgress} className="w-full" />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {batchItems.map((item, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <div className="relative aspect-video bg-secondary/20">
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                        {item.result && item.result.detections.length > 0 && (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ mixBlendMode: 'multiply' }}
                          >
                            {item.result.detections.map((detection, didx) => (
                              <rect
                                key={didx}
                                x={`${detection.bbox.x}%`}
                                y={`${detection.bbox.y}%`}
                                width={`${detection.bbox.width}%`}
                                height={`${detection.bbox.height}%`}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                rx="3"
                              />
                            ))}
                          </svg>
                        )}
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => removeItem(idx)}
                          disabled={processing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Badge className="absolute top-2 left-2">
                          {item.status === 'pending' && 'Pending'}
                          {item.status === 'processing' && 'Processing...'}
                          {item.status === 'completed' && `${item.result?.detections.length || 0} logo(s)`}
                          {item.status === 'error' && 'Error'}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(item.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {item.result?.processing_time_ms && (
                              <p className="text-xs text-muted-foreground">
                                Processed in {item.result.processing_time_ms}ms
                              </p>
                            )}
                            {item.error && (
                              <p className="text-xs text-destructive mt-1">{item.error}</p>
                            )}
                          </div>
                          {item.status === 'completed' && item.result && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => downloadReport(item)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {item.result && item.result.detections.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <Separator />
                            {item.result.detections.slice(0, 2).map((detection, didx) => (
                              <div key={didx} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{detection.logo_name}</span>
                                  <Badge variant="secondary">
                                    {(detection.confidence * 100).toFixed(0)}%
                                  </Badge>
                                </div>
                                {detection.colors && detection.colors.length > 0 && (
                                  <div className="flex gap-1">
                                    {detection.colors.slice(0, 5).map((color, cidx) => (
                                      <div
                                        key={cidx}
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                )}
                                 {detection.quality && (
                                  <p className="text-xs text-muted-foreground">{detection.quality}</p>
                                )}
                                {detection.trademark_risk && (
                                  <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                                    <p className="text-xs font-medium text-destructive">⚠️ Usage Rights:</p>
                                    <p className="text-xs text-destructive/90">{detection.trademark_risk}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                            {item.result.detections.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{item.result.detections.length - 2} more logo(s)
                              </p>
                            )}
                          </div>
                        )}

                        {item.result?.metadata && (
                          <div className="mt-3 space-y-2">
                            <Separator />
                            {item.result.metadata.image_quality && (
                              <p className="text-xs text-muted-foreground">
                                Quality: {item.result.metadata.image_quality}
                              </p>
                            )}
                            {item.result.metadata.recommendations && item.result.metadata.recommendations.length > 0 && (
                              <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-500">💡 Important Recommendations:</p>
                                <ul className="list-disc list-inside mt-1 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                                  {item.result.metadata.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {item.result && item.result.detections.length > 0 && (
                          <div className="mt-3 p-3 rounded-md bg-muted border border-border">
                            <p className="text-xs font-medium mb-1">⚖️ Legal Disclaimer:</p>
                            <p className="text-xs text-muted-foreground">
                              This analysis is for informational purposes only. Consult a legal professional before using any detected logos commercially. Trademark rights belong to their respective owners.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}