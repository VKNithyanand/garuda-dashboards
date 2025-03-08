
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "pl-64" : "pl-0 md:pl-64"}`}>
        <TopNav setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        <main className="container py-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
