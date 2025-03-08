
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUserSettings } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import NotificationsTab from "./NotificationsTab";
import IntegrationsTab from "./IntegrationsTab";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import SettingsSidebar from "./SettingsSidebar";

const Settings = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
  });
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access settings.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);
      setUserEmail(user.email);
      setIsLoading(false);
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
  
  // Get user settings
  const { data: userSettings, isLoading: settingsLoading, refetch } = useUserSettings(userId);
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setPreferences({
        emailNotifications: userSettings.email_notifications ?? true,
        pushNotifications: userSettings.push_notifications ?? false,
        marketingEmails: userSettings.marketing_emails ?? false,
      });
    }
  }, [userSettings]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
              settingsLoading ? (
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
