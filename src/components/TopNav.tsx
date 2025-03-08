
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Menu, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export const TopNav = ({ setSidebarOpen, sidebarOpen }: TopNavProps) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    getUser();
  }, []);

  // Get user settings
  const { data: userSettings } = useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Update local theme when settings are loaded
  useEffect(() => {
    if (userSettings?.theme) {
      setTheme(userSettings.theme);
      document.documentElement.classList.toggle('dark', userSettings.theme === 'dark');
    }
  }, [userSettings]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Update theme in the state
    setTheme(newTheme);
    
    // Apply theme to the document
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Save theme to database if user is logged in
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({ 
            user_id: userId, 
            theme: newTheme 
          }, { 
            onConflict: 'user_id' 
          });
        
        if (error) throw error;
        
        toast({
          title: "Theme Updated",
          description: `Theme changed to ${newTheme === "dark" ? "Dark" : "Light"} mode`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update theme",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-background flex items-center px-4 md:px-6">
      <button
        className="mr-4 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </button>
      
      <div className="w-full flex items-center justify-between">
        <div className="relative w-full max-w-md hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-background border border-input pl-8 py-2 text-sm rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button className="h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center">
            <Bell className="h-4 w-4" />
          </button>
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
