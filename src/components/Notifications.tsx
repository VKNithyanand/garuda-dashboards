
import React, { useState, useEffect } from "react";
import { Bell, X, Check, MessageSquare, User, ShoppingCart, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error" | "message";
}

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Load demo notifications
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: "1",
        title: "New User Registered",
        description: "John Doe has joined the platform",
        time: "5 minutes ago",
        read: false,
        type: "info"
      },
      {
        id: "2",
        title: "Report Generated",
        description: "Your monthly sales report is ready to download",
        time: "1 hour ago",
        read: false,
        type: "success"
      },
      {
        id: "3",
        title: "New Message",
        description: "You have a new message from Sarah",
        time: "2 hours ago",
        read: true,
        type: "message"
      },
      {
        id: "4",
        title: "System Update",
        description: "System will be updated at 2:00 AM",
        time: "Yesterday",
        read: true,
        type: "warning"
      }
    ];
    
    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
    
    toast({
      title: "All notifications marked as read",
      description: "Your notification inbox is now cleared",
    });
  };

  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
    
    // Update unread count if necessary
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        className="relative rounded-full p-2 hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border border-input bg-background shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                className="text-xs text-primary hover:text-primary/80"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
              <button 
                className="rounded-full p-1 hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 hover:bg-accent/20 transition-colors relative ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-primary/10">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!notification.read && (
                      <button
                        className="p-1 rounded-full hover:bg-accent"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      className="p-1 rounded-full hover:bg-accent"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-2 border-t">
            <button 
              className="w-full py-2 text-center text-sm text-primary hover:text-primary/80"
              onClick={() => {
                setIsOpen(false);
                toast({
                  title: "Notifications Settings",
                  description: "Configure your notification preferences in Settings",
                });
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
