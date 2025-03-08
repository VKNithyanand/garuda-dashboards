
import React from "react";
import { MessageSquareHeart, Globe, Brain } from "lucide-react";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="dashboard-card md:col-span-2">
      <div className="space-y-1 mb-6">
        <button 
          onClick={() => setActiveTab("feedback")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "feedback" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <MessageSquareHeart className="h-4 w-4" />
          <span>Feedback</span>
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
        <button 
          onClick={() => setActiveTab("nlp")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "nlp" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>NLP Queries</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsSidebar;
