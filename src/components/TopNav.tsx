
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Menu } from "lucide-react";

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

export const TopNav = ({ setSidebarOpen, sidebarOpen }: TopNavProps) => {
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
