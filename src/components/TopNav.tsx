
import React from "react";
import { Bell, Search } from "lucide-react";

export const TopNav = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-64 rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-accent">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center">
            JD
          </button>
        </div>
      </div>
    </header>
  );
};
