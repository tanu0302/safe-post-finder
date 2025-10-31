import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

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

interface DetectionRecord {
  id: string;
  filename: string;
  image_url: string;
  detections: Detection[];
  created_at: string;
}

export default function DetectionHistory() {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('logo_detections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords((data || []) as unknown as DetectionRecord[]);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Detection History</h1>
          <p className="text-muted-foreground">
            View all past logo detection results
          </p>
        </div>

        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No detections yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload an image to start detecting logos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-secondary/20">
                  <img
                    src={record.image_url}
                    alt={record.filename}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">
                    {record.detections.length} logo(s)
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base truncate">
                    {record.filename}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(record.created_at), 'PPp')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {record.detections.length > 0 ? (
                    <div className="space-y-2">
                      {record.detections.slice(0, 3).map((detection, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate flex-1">
                            {detection.logo_name}
                          </span>
                          <Badge variant="secondary" className="ml-2">
                            {(detection.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                      {record.detections.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{record.detections.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No logos detected
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}