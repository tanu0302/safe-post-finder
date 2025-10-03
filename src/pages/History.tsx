import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckResult } from '@/lib/mockData';
import { Search, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<CheckResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('checkHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const filteredHistory = history.filter(item =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (result: CheckResult) => {
    sessionStorage.setItem('latestResult', JSON.stringify(result));
    navigate('/results');
  };

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('checkHistory', JSON.stringify(updated));
    toast.success('Check deleted from history');
  };

  const getVerdictBadge = (verdict: CheckResult['verdict']) => {
    switch (verdict) {
      case 'copyrighted':
        return <Badge variant="destructive">Copyrighted</Badge>;
      case 'possibly':
        return <Badge variant="outline">Possibly</Badge>;
      case 'clear':
        return <Badge variant="secondary">Clear</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Check History</h1>
          <p className="text-muted-foreground">
            View and manage your past copyright checks
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              {searchTerm ? 'No matching results found' : 'No checks performed yet'}
            </p>
            <Button onClick={() => navigate('/check')}>
              Start Your First Check
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.content}
                    </TableCell>
                    <TableCell>{getVerdictBadge(item.verdict)}</TableCell>
                    <TableCell>{item.confidence}%</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
