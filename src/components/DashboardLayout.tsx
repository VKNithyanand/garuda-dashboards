
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { TopNav } from "./TopNav";
import { useToast } from "@/hooks/use-toast";
import { requestIntelligenceAnalysis } from "@/lib/dashboard-intelligence";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const { toast } = useToast();
  
  // Set up periodic health checks
  useEffect(() => {
    // Initial health check
    performHealthCheck();
    
    // Set up interval for regular health checks
    const interval = setInterval(() => {
      performHealthCheck();
    }, 300000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle component reload events
  useEffect(() => {
    const handleComponentReload = (event: Event) => {
      const customEvent = event as CustomEvent;
      toast({
        title: "Self-healing activated",
        description: `Attempting to recover ${customEvent.detail.component}`,
        duration: 3000,
      });
      setIsHealing(true);
      
      // Reset healing state after a short delay
      setTimeout(() => setIsHealing(false), 2000);
    };
    
    window.addEventListener('dashboard:reload-component', handleComponentReload);
    return () => window.removeEventListener('dashboard:reload-component', handleComponentReload);
  }, [toast]);
  
  const performHealthCheck = async () => {
    try {
      const analysis = await requestIntelligenceAnalysis();
      
      if (analysis && analysis.healthScore < 70) {
        // Dashboard is experiencing issues
        toast({
          title: "Dashboard Health Warning",
          description: `Health score: ${analysis.healthScore}. Self-healing activated.`,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error performing health check:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <TopNav setSidebarOpen={setSidebarOpen} />
        <main className={`container py-6 ${isHealing ? "animate-pulse" : "animate-fade-in"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
