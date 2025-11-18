import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, History } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Detection {
  logo_name: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "logos">("date");
  const [filterBy, setFilterBy] = useState<"all" | "with-logos" | "no-logos">("all");

  useEffect(() => {
    const savedHistory = localStorage.getItem('logo-detection-history');
    if (savedHistory) {
      try {
        setRecords(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  useEffect(() => {
    let filtered = [...records];
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.detections.some(d => d.logo_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterBy === "with-logos") filtered = filtered.filter(r => r.detections.length > 0);
    else if (filterBy === "no-logos") filtered = filtered.filter(r => r.detections.length === 0);
    
    if (sortBy === "date") filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else filtered.sort((a, b) => b.detections.length - a.detections.length);
    
    setFilteredRecords(filtered);
  }, [records, searchTerm, sortBy, filterBy]);

  const downloadReport = (record: DetectionRecord) => {
    const blob = new Blob([JSON.stringify({ filename: record.filename, timestamp: record.created_at, detections: record.detections, metadata: record.analysis_metadata }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logo-detection-${record.filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent/50 rounded-full mb-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Local Storage</span>
            </div>
            <h1 className="text-5xl font-bold gradient-text">Detection History</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              View past logo detection analyses (stored locally)
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterBy} onValueChange={(v: any) => setFilterBy(v)}>
                  <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="with-logos">With Logos</SelectItem>
                    <SelectItem value="no-logos">No Logos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="logos">By Logos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {filteredRecords.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><History className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-xl font-medium">No history found</p></CardContent></Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base truncate">{record.filename}</CardTitle>
                    <CardDescription className="text-xs">{format(new Date(record.created_at), 'PPp')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img src={record.image_url} alt={record.filename} className="w-full aspect-video object-contain rounded bg-muted" />
                    {record.detections.length > 0 ? (
                      <div className="space-y-2">
                        {record.detections.map((d, i) => (
                          <div key={i} className="text-sm p-2 bg-accent/50 rounded">
                            <div className="flex justify-between">
                              <span className="font-medium">{d.logo_name}</span>
                              <Badge variant="outline" className="text-xs">{d.confidence.toFixed(0)}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-center text-muted-foreground py-4">No logos detected</p>}
                    <Button variant="outline" size="sm" onClick={() => downloadReport(record)} className="w-full gap-2"><Download className="h-4 w-4" />Download Report</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
