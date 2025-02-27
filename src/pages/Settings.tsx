
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUpdateUserSettings, useUserSettings } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Lock,
  User,
  Globe,
  Shield,
  Palette,
  Save,
  Loader2,
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    theme: "light",
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    getUser();
  }, []);
  
  // Get user settings
  const { data: userSettings, isLoading } = useUserSettings(userId);
  const updateUserSettings = useUpdateUserSettings();
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setPreferences({
        emailNotifications: userSettings.email_notifications,
        theme: userSettings.theme,
        language: userSettings.language,
      });
    }
  }, [userSettings]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // In a real app, you would update the user profile in the database
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = async (setting: string) => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to change settings.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Map the setting name to database field
      let updatedSettings: Record<string, any> = {};
      
      if (setting === "emailNotifications") {
        updatedSettings.email_notifications = !preferences.emailNotifications;
        setPreferences({
          ...preferences,
          emailNotifications: !preferences.emailNotifications,
        });
      }
      
      // Update in database
      await updateUserSettings.mutateAsync({
        userId,
        settings: updatedSettings,
      });
      
      toast({
        title: "Setting Updated",
        description: `Your ${setting} preference has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="dashboard-card md:col-span-3">
            <h3 className="font-medium mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="dashboard-card md:col-span-4">
            <h3 className="font-medium mb-4">Preferences</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    icon: Bell,
                    title: "Notifications",
                    description: "Manage notification settings",
                    key: "emailNotifications",
                    value: preferences.emailNotifications,
                  },
                  {
                    icon: Lock,
                    title: "Privacy",
                    description: "Control your privacy settings",
                  },
                  {
                    icon: Shield,
                    title: "Security",
                    description: "Configure security options",
                  },
                  {
                    icon: Globe,
                    title: "Language",
                    description: "Set your preferred language",
                    key: "language",
                    value: preferences.language,
                  },
                  {
                    icon: Palette,
                    title: "Appearance",
                    description: "Customize the interface",
                    key: "theme",
                    value: preferences.theme,
                  },
                ].map((setting, i) => {
                  const Icon = setting.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => setting.key && handleToggleSetting(setting.key)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{setting.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <button className="rounded-full p-2 hover:bg-accent">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
