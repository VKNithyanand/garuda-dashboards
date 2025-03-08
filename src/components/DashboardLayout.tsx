
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
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-green z-[100]"></div>
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
