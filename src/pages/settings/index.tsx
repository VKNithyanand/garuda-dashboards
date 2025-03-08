
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUserSettings } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import FeedbackTab from "./FeedbackTab";
import IntegrationsTab from "./IntegrationsTab";
import SettingsSidebar from "./SettingsSidebar";
import { useToast } from "@/hooks/use-toast";
import { QueryInput } from "@/components/nlp/QueryInput";

const Settings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [activeSettingsTab, setActiveSettingsTab] = useState("feedback");
  
  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email);
      }
    };
    
    getUser();
  }, []);
  
  // Get user settings
  const { data: userSettings, isLoading, refetch } = useUserSettings(userId);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <SettingsSidebar 
            activeTab={activeSettingsTab} 
            setActiveTab={setActiveSettingsTab} 
          />

          <div className="dashboard-card md:col-span-5">
            {activeSettingsTab === "feedback" && (
              isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FeedbackTab userId={userId} />
              )
            )}
            
            {activeSettingsTab === "integrations" && (
              <IntegrationsTab userId={userId} />
            )}

            {activeSettingsTab === "nlp" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Natural Language Queries</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask questions about your business data in natural language. 
                    For example: "Show me last month's revenue" or "Which products have the highest sales?"
                  </p>
                </div>
                <QueryInput />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
