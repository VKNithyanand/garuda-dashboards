import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  BarChart,
  User,
  HelpCircle,
  LogIn,
  FileText,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Sidebar = () => {
  const { pathname } = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
        }
      );
      
      return () => {
        authListener?.subscription.unsubscribe();
      };
    };
    
    checkAuth();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Dashboard
        </h2>
        <div className="space-y-1">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/" && "bg-accent text-accent-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          <Link
            to="/analytics"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/analytics" && "bg-accent text-accent-foreground"
            )}
          >
            <BarChart className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/reports"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/reports" && "bg-accent text-accent-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </Link>
          <Link
            to="/users"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/users" && "bg-accent text-accent-foreground"
            )}
          >
            <User className="h-4 w-4" />
            <span>Users</span>
          </Link>
          <Link
            to="/insights"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/insights" && "bg-accent text-accent-foreground"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Insights</span>
          </Link>
        </div>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Settings
        </h2>
        <div className="space-y-1">
          <Link
            to="/settings/account"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/settings/account" && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Account</span>
          </Link>
          <Link
            to="/settings/appearance"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/settings/appearance" &&
                "bg-accent text-accent-foreground"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Appearance</span>
          </Link>
        </div>
      </div>
    
      {!isAuthenticated ? (
        <Link
          to="/auth"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
            pathname === "/auth" && "bg-accent text-accent-foreground"
          )}
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      ) : (
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
        >
          <LogIn className="h-4 w-4 rotate-180" />
          <span>Sign Out</span>
        </button>
      )}
    
    </div>
  );
};

export default Sidebar;
