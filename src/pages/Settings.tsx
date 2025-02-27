
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
  Check,
  Moon,
  Sun,
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    theme: "light",
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [availableLanguages] = useState([
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ]);
  
  // Get the current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Set default profile data based on user
        setProfile({
          name: user.user_metadata?.name || "",
          email: user.email || "",
        });
      }
    };
    
    getUser();
  }, []);
  
  // Get user settings
  const { data: userSettings, isLoading, refetch } = useUserSettings(userId);
  const updateUserSettings = useUpdateUserSettings();
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setPreferences({
        emailNotifications: userSettings.email_notifications,
        theme: userSettings.theme || "light",
        language: userSettings.language || "en",
      });
    }
  }, [userSettings]);

  const handleSaveProfile = async () => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingProfile(true);
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name }
      });

      if (error) throw error;
      
      // Update the email if it's been changed
      if (profile.email !== (await supabase.auth.getUser()).data.user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email,
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: "Verification Email Sent",
          description: "Please check your email to confirm your new address",
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
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
    
    setIsSaving(true);
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
      
      // Refetch settings to make sure we have the latest data
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTheme = async (theme: string) => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings.mutateAsync({
        userId,
        settings: { theme },
      });
      
      setPreferences({ ...preferences, theme });
      
      toast({
        title: "Theme Updated",
        description: `Theme changed to ${theme === "dark" ? "Dark" : "Light"} mode`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update theme",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLanguage = async (language: string) => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings.mutateAsync({
        userId,
        settings: { language },
      });
      
      setPreferences({ ...preferences, language });
      
      toast({
        title: "Language Updated",
        description: `Display language changed to ${availableLanguages.find(lang => lang.code === language)?.name}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update language",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="dashboard-card md:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4" />
              <h3 className="font-medium">Profile Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Changing your email will require verification
                </p>
              </div>
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
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
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">Preferences</h3>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates and alerts via email
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting("emailNotifications")}
                    disabled={isSaving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.emailNotifications ? "bg-primary" : "bg-input"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                        preferences.emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Theme */}
                <div className="space-y-2 p-4 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Appearance</p>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred theme
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateTheme("light")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md ${
                        preferences.theme === "light" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-card hover:bg-accent"
                      }`}
                    >
                      {preferences.theme === "light" && <Check className="h-4 w-4" />}
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => handleUpdateTheme("dark")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md ${
                        preferences.theme === "dark" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-card hover:bg-accent"
                      }`}
                    >
                      {preferences.theme === "dark" && <Check className="h-4 w-4" />}
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2 p-4 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred language
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <select
                      value={preferences.language}
                      onChange={(e) => handleUpdateLanguage(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {availableLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Password & Security</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your password and security settings
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

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">Privacy</p>
                      <p className="text-sm text-muted-foreground">
                        Control your privacy settings
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
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
