
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { VoiceAssistant } from "./VoiceAssistant";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Colorful gradient top bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-green z-[100]"></div>
      
      {/* Subtle background pattern/gradient */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0"></div>
      
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "pl-64" : "pl-0 md:pl-64"}`}>
        <TopNav setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        <main className="container py-6 animate-fade-in">
          {children}
        </main>
      </div>
      
      {/* Voice Assistant Integration */}
      <VoiceAssistant />
      
      {/* Add a subtle gradient overlay at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-0"></div>
      
      {/* Cricbuzz link button */}
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-white shadow-md hover:bg-gray-100 border-brand-blue"
          onClick={() => window.open('https://garuda-sastra.netlify.app/', '_self')}
        >
          <ExternalLink className="h-4 w-4 text-brand-blue" />
          <span className="text-brand-blue">Home</span>
        </Button>
      </div>
    </div>
  );
};
