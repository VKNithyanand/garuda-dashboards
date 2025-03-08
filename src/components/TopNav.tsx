import {
  BrainCircuit,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/UserNav";
import { useMobileMenu } from "@/hooks/use-mobile-menu";

import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const { isMenuOpen, toggleMobileMenu } = useMobileMenu();

  return (
    <div className="top-nav-container border-b bg-background">
      <header className="top-nav">
        <div className="flex items-center gap-2 md:gap-4">
          <button className="lg:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6" />
            <span className="font-semibold hidden md:inline-block">DataDash</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link to="/analytics" className="text-sm font-medium hover:underline">Analytics</Link>
            <Link to="/insights" className="text-sm font-medium hover:underline">Insights</Link>
            <Link to="/reports" className="text-sm font-medium hover:underline">Reports</Link>
            <Link to="/users" className="text-sm font-medium hover:underline">Users</Link>
            <Link to="/settings" className="text-sm font-medium hover:underline">Settings</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <UserNav />
          <ThemeToggle />
          
          {!loading && (
            user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" /> Login
              </Button>
            )
          )}
        </div>
      </header>
    </div>
  );
}
