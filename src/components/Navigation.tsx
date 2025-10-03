import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-primary" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Copyright Shield
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              variant={isActive('/check') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/check">
                <Search className="h-4 w-4 mr-2" />
                Check
              </Link>
            </Button>
            <Button
              variant={isActive('/history') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/history">
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
            <Button
              variant={isActive('/admin') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
