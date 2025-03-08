
import React from "react";
import { Bell, Globe, User, Shield } from "lucide-react";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="dashboard-card md:col-span-2">
      <div className="space-y-1 mb-6">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "profile" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </button>
        <button 
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "notifications" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "security" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Security</span>
        </button>
        <button 
          onClick={() => setActiveTab("integrations")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "integrations" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Integrations</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
