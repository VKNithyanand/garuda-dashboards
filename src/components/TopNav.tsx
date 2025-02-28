
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Notifications } from "@/components/Notifications";

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
}

export const TopNav = ({ setSidebarOpen }: TopNavProps) => {
  const isMobile = useMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically implement search functionality
    console.log(`Searching for: ${searchQuery}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground lg:hidden h-9 w-9"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </button>
      <div className="flex-1">
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[600px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Notifications />
        <Link
          to="/settings"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
        >
          <span className="font-medium text-sm">JD</span>
          <span className="sr-only">Profile</span>
        </Link>
      </div>
    </header>
  );
};
