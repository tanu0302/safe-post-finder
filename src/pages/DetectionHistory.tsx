import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Image as ImageIcon, Search, Trash2, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface DetectionRecord {
  id: string;
  filename: string;
  image_url: string;
  detections: Detection[];
  analysis_metadata?: any;
  processing_time_ms?: number;
  created_at: string;
}

export default function DetectionHistory() {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "logos">("date");
  const [filterBy, setFilterBy] = useState<"all" | "with-logos" | "no-logos">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchTerm, sortBy, filterBy]);

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
      toast({
        title: "Failed to load history",
        description: "Could not fetch detection records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.detections.some(d => d.logo_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Logo presence filter
    if (filterBy === "with-logos") {
      filtered = filtered.filter(record => record.detections.length > 0);
    } else if (filterBy === "no-logos") {
      filtered = filtered.filter(record => record.detections.length === 0);
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "logos") {
      filtered.sort((a, b) => b.detections.length - a.detections.length);
    }

    setFilteredRecords(filtered);
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('logo_detections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Deleted",
        description: "Detection record deleted successfully",
      });
    } catch (error: any) {
      console.error('Failed to delete:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadRecord = (record: DetectionRecord) => {
    const report = {
      filename: record.filename,
      timestamp: record.created_at,
      processing_time: record.processing_time_ms ? `${record.processing_time_ms}ms` : 'N/A',
      detections: record.detections.map(d => ({
        brand: d.logo_name,
        confidence: `${(d.confidence * 100).toFixed(1)}%`,
        colors: d.colors || [],
        quality: d.quality || 'N/A',
        trademark_risk: d.trademark_risk || 'N/A',
        position: `(${d.bbox.x.toFixed(1)}%, ${d.bbox.y.toFixed(1)}%)`,
        size: `${d.bbox.width.toFixed(1)}% × ${d.bbox.height.toFixed(1)}%`
      })),
      metadata: record.analysis_metadata
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-detection-${record.filename}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Detection report saved successfully",
    });
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
            Search, filter, and manage all past logo detection results
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by filename or brand name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterBy} onValueChange={(v: any) => setFilterBy(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="with-logos">With Logos</SelectItem>
                  <SelectItem value="no-logos">No Logos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Latest First</SelectItem>
                  <SelectItem value="logos">Most Logos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredRecords.length} of {records.length} record(s)
              </span>
            </div>
          </CardContent>
        </Card>

        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {records.length === 0 ? "No detections yet" : "No results match your filters"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {records.length === 0 ? "Upload an image to start detecting logos" : "Try adjusting your search or filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
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
                  {record.processing_time_ms && (
                    <CardDescription className="text-xs">
                      Processed in {record.processing_time_ms}ms
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {record.detections.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {record.detections.slice(0, 3).map((detection, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate flex-1">
                              {detection.logo_name}
                            </span>
                            <Badge variant="secondary" className="ml-2">
                              {(detection.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          {detection.colors && detection.colors.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {detection.colors.slice(0, 5).map((color, cidx) => (
                                <div
                                  key={cidx}
                                  className="w-3 h-3 rounded border"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {record.detections.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{record.detections.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">
                      No logos detected
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => downloadRecord(record)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete detection record?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the detection record for "{record.filename}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteRecord(record.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}