
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const TopNav = ({ setSidebarOpen, sidebarOpen }: TopNavProps) => {
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Sale', message: 'A new sale of $1,200 was recorded.', time: '10 minutes ago', read: false },
    { id: '2', title: 'New Customer', message: 'John Smith just signed up.', time: '1 hour ago', read: false },
    { id: '3', title: 'Report Generated', message: 'Your monthly report is ready.', time: '2 hours ago', read: false },
    { id: '4', title: 'System Update', message: 'System will be updated tonight.', time: '1 day ago', read: true },
  ]);

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    toast({
      title: "Notification read",
      description: "The notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    toast({
      title: "All notifications read",
      description: "All notifications have been marked as read.",
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    });
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
        <div className="flex-1"></div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500"
                    variant="destructive"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium">Notifications</h4>
                <div className="flex gap-1">
                  {notifications.length > 0 && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        Mark all read
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearNotifications}
                      >
                        Clear all
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex items-start p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
