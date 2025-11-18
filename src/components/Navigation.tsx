import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Search, History, Settings, Sparkles, Brain, LogOut, LogIn, ScanSearch, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      navigate('/');
    }
  };

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
              Rightcheck
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
              variant={isActive('/ai-checker') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/ai-checker">
                <Brain className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">AI Checker</span>
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
            <Button
              variant={isActive('/logo-detector') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/logo-detector">
                <ScanSearch className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline"></span>
              </Link>
            </Button>
            <Button
              variant={isActive('/detection-history') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/detection-history">
                <History className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline"></span>
              </Link>
            </Button>
            <Button
              variant={isActive('/dmca-takedown') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/dmca-takedown">
                <Scale className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">DMCA</span>
              </Link>
            </Button>
            
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                asChild
              >
                <Link to="/auth">
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
