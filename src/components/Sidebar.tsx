
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart4,
  FileText,
  Users,
  Settings,
  Home,
  Lightbulb,
  X,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5" />,
      color: "text-brand-purple",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart4 className="h-5 w-5" />,
      color: "text-brand-blue",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
      color: "text-brand-green",
    },
    {
      name: "Insights",
      path: "/insights",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-brand-orange",
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users className="h-5 w-5" />,
      color: "text-brand-pink",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      color: "text-muted-foreground",
    },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 w-64 bg-background border-r z-50 transition-transform duration-300 ease-in-out transform shadow-lg",
          {
            "translate-x-0": isOpen,
            "-translate-x-full md:translate-x-0": !isOpen,
          }
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient bg-gradient-to-r from-brand-purple to-brand-blue">Analytics</span>
          </Link>
          <button 
            className="p-1 rounded-md md:hidden hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200",
                {
                  "bg-gradient-to-r from-primary/80 to-primary text-primary-foreground shadow-md": isActive(item.path),
                  "hover:bg-accent/50": !isActive(item.path),
                }
              )}
              onClick={() => window.innerWidth < 768 && setIsOpen(false)}
            >
              <div className={cn("transition-colors", isActive(item.path) ? "text-white" : item.color)}>
                {item.icon}
              </div>
              <span>{item.name}</span>
              {isActive(item.path) && (
                <div className="ml-auto rounded-full h-1.5 w-1.5 bg-white animate-pulse-subtle"></div>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-lg bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 p-4 border border-brand-purple/10">
            <div className="text-sm font-medium mb-2">Pro Analytics</div>
            <div className="text-xs text-muted-foreground mb-3">Upgrade to access advanced features and insights</div>
            <button className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-md py-1.5 text-xs font-medium hover:opacity-90 transition-opacity">
              Upgrade Now
            </button>
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="text-xs text-muted-foreground text-center">
              Analytics Dashboard v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
