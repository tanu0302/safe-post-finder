import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, History, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-card/80 border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="p-2 rounded-lg bg-gradient-primary group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text hidden sm:inline">
              Copyright Shield
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
              className="relative"
            >
              <Link to="/">
                <span className="hidden sm:inline">Home</span>
                <Sparkles className="h-4 w-4 sm:hidden" />
              </Link>
            </Button>
            <Button
              variant={isActive('/check') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/check">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Check</span>
              </Link>
            </Button>
            <Button
              variant={isActive('/history') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/history">
                <History className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </Button>
            <Button
              variant={isActive('/admin') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/admin">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
