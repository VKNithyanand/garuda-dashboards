
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUserSettings } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import NotificationsTab from "./NotificationsTab";
import IntegrationsTab from "./IntegrationsTab";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import SettingsSidebar from "./SettingsSidebar";

const Settings = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  
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
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      // Using type assertion to handle dynamic properties
      const settings = userSettings as any;
      
      setPreferences({
        emailNotifications: settings.email_notifications || true,
        pushNotifications: settings.push_notifications || false,
        marketingEmails: settings.marketing_emails || false,
      });
    }
  }, [userSettings]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

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
            {activeSettingsTab === "profile" && (
              <ProfileTab 
                userId={userId}
                userEmail={userEmail}
              />
            )}
            
            {activeSettingsTab === "security" && (
              <SecurityTab userId={userId} />
            )}
            
            {activeSettingsTab === "notifications" && (
              isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <NotificationsTab 
                  userId={userId}
                  userEmail={userEmail}
                  preferences={preferences}
                  setPreferences={setPreferences}
                  refetch={refetch}
                />
              )
            )}
            
            {activeSettingsTab === "integrations" && (
              <IntegrationsTab userId={userId} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
