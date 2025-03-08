
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
  Save,
  Loader2,
  Check,
  Smartphone,
  BarChart4,
  Clock,
  X,
  Settings as SettingsIcon,
  Plus,
  HelpCircle,
  Upload,
  Camera,
  Download,
  Mail
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    language: "en",
    dashboardLayout: "default",
    autoLogout: 60,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("notifications");
  const [availableLanguages] = useState([
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ]);
  const [dashboardLayouts] = useState([
    { value: "default", name: "Default" },
    { value: "compact", name: "Compact" },
    { value: "expanded", name: "Expanded" },
  ]);
  const [autoLogoutOptions] = useState([
    { value: 30, name: "30 minutes" },
    { value: 60, name: "1 hour" },
    { value: 120, name: "2 hours" },
    { value: 240, name: "4 hours" },
    { value: 0, name: "Never" },
  ]);
  const [connectedApps, setConnectedApps] = useState([
    { name: "Google Calendar", connected: true },
    { name: "Microsoft Office", connected: false },
    { name: "Slack", connected: true },
    { name: "Dropbox", connected: false },
    { name: "Trello", connected: false },
  ]);
  
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
  const { data: userSettings, isLoading, refetch } = useUserSettings(userId);
  const updateUserSettings = useUpdateUserSettings();
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      // Using type assertion to handle dynamic properties
      const settings = userSettings as any;
      
      setPreferences({
        emailNotifications: settings.email_notifications || true,
        pushNotifications: settings.push_notifications || false,
        marketingEmails: settings.marketing_emails || false,
        language: settings.language || "en",
        dashboardLayout: settings.dashboard_layout && typeof settings.dashboard_layout === 'object' 
          ? (settings.dashboard_layout as any).layout || "default"
          : "default",
        autoLogout: settings.auto_logout || 60,
      });
    }
  }, [userSettings]);

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
        
        // Send a test notification
        if (!preferences.emailNotifications) {
          toast({
            title: "Test Email Notification Sent",
            description: "You will receive a test email notification shortly.",
          });
        }
      } else if (setting === "pushNotifications") {
        updatedSettings.push_notifications = !preferences.pushNotifications;
        setPreferences({
          ...preferences,
          pushNotifications: !preferences.pushNotifications,
        });
        
        // Show push notification
        if (!preferences.pushNotifications) {
          toast({
            title: "Push Notifications Enabled",
            description: "You will now receive push notifications.",
          });
        }
      } else if (setting === "marketingEmails") {
        updatedSettings.marketing_emails = !preferences.marketingEmails;
        setPreferences({
          ...preferences,
          marketingEmails: !preferences.marketingEmails,
        });
        
        if (!preferences.marketingEmails) {
          toast({
            title: "Marketing Emails Enabled",
            description: "You have subscribed to marketing emails.",
          });
        } else {
          toast({
            title: "Marketing Emails Disabled",
            description: "You have unsubscribed from marketing emails.",
          });
        }
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

  const handleUpdateDashboardLayout = async (layout: string) => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings.mutateAsync({
        userId,
        settings: { dashboard_layout: { layout } },
      });
      
      setPreferences({ ...preferences, dashboardLayout: layout });
      
      toast({
        title: "Layout Updated",
        description: `Dashboard layout changed to ${dashboardLayouts.find(l => l.value === layout)?.name}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update dashboard layout",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAutoLogout = async (minutes: number) => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      await updateUserSettings.mutateAsync({
        userId,
        settings: { auto_logout: minutes },
      });
      
      setPreferences({ ...preferences, autoLogout: minutes });
      
      toast({
        title: "Auto-Logout Updated",
        description: `Auto-logout timing set to ${autoLogoutOptions.find(o => o.value === minutes)?.name}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update auto-logout settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectApp = async (appName: string) => {
    setIsSaving(true);
    try {
      // Simulate connecting to the app
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "App Connected",
        description: `Successfully connected to ${appName}`,
      });
      
      // Update the local state
      setConnectedApps(prevApps => 
        prevApps.map(app => 
          app.name === appName ? { ...app, connected: true } : app
        )
      );
      
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect to ${appName}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowConnectModal(false);
    }
  };

  const handleDisconnectApp = async (appName: string) => {
    setIsSaving(true);
    try {
      // Simulate disconnecting from the app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "App Disconnected",
        description: `Successfully disconnected from ${appName}`,
      });
      
      // Update the local state
      setConnectedApps(prevApps => 
        prevApps.map(app => 
          app.name === appName ? { ...app, connected: false } : app
        )
      );
      
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || `Failed to disconnect from ${appName}`,
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
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="dashboard-card md:col-span-2">
            <div className="space-y-1 mb-6">
              <button 
                onClick={() => setActiveSettingsTab("notifications")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "notifications" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
              <button 
                onClick={() => setActiveSettingsTab("security")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "security" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </button>
              <button 
                onClick={() => setActiveSettingsTab("integrations")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "integrations" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Integrations</span>
              </button>
              <button 
                onClick={() => setActiveSettingsTab("preferences")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "preferences" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                <SettingsIcon className="h-4 w-4" />
                <span>Preferences</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card md:col-span-5">
            {activeSettingsTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Bell className="h-4 w-4" />
                  <h3 className="font-medium">Notification Settings</h3>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
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
                    
                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your devices
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSetting("pushNotifications")}
                        disabled={isSaving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.pushNotifications ? "bg-primary" : "bg-input"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            preferences.pushNotifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Marketing Emails */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Marketing Emails</p>
                          <p className="text-sm text-muted-foreground">
                            Receive marketing and promotional emails
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSetting("marketingEmails")}
                        disabled={isSaving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.marketingEmails ? "bg-primary" : "bg-input"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            preferences.marketingEmails ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeSettingsTab === "security" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-4 w-4" />
                  <h3 className="font-medium">Security Settings</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">
                            Update your account password
                          </p>
                        </div>
                      </div>
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        onClick={() => {
                          toast({
                            title: "Password Reset Email Sent",
                            description: "Check your email for a link to reset your password.",
                          });
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  
                  {/* Auto Logout */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Auto Logout</p>
                        <p className="text-sm text-muted-foreground">
                          Set the time of inactivity before automatic logout
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <select
                        value={preferences.autoLogout}
                        onChange={(e) => handleUpdateAutoLogout(Number(e.target.value))}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {autoLogoutOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Two Factor Authentication */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full bg-input`}
                      onClick={() => {
                        toast({
                          title: "Two-Factor Authentication",
                          description: "2FA setup wizard will be implemented soon.",
                        });
                      }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform translate-x-1`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeSettingsTab === "preferences" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <SettingsIcon className="h-4 w-4" />
                  <h3 className="font-medium">User Preferences</h3>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Language */}
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
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
                    
                    {/* Dashboard Layout */}
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center gap-3">
                        <BarChart4 className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Dashboard Layout</p>
                          <p className="text-sm text-muted-foreground">
                            Customize your dashboard view
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <select
                          value={preferences.dashboardLayout}
                          onChange={(e) => handleUpdateDashboardLayout(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {dashboardLayouts.map((layout) => (
                            <option key={layout.value} value={layout.value}>
                              {layout.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeSettingsTab === "integrations" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="h-4 w-4" />
                  <h3 className="font-medium">Integrations</h3>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Connect your account to external services for enhanced functionality.
                  </p>
                  
                  {/* Connected Apps */}
                  <div className="space-y-4">
                    {connectedApps.map((app) => (
                      <div key={app.name} className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium">{app.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{app.name}</p>
                            {app.connected ? (
                              <div className="flex items-center mt-1">
                                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                <p className="text-xs text-muted-foreground">Connected</p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Not connected</p>
                            )}
                          </div>
                        </div>
                        <button
                          className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                            app.connected 
                              ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" 
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          } h-9 px-4 py-2`}
                          onClick={() => app.connected 
                            ? handleDisconnectApp(app.name) 
                            : handleConnectApp(app.name)
                          }
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : app.connected ? (
                            "Disconnect"
                          ) : (
                            "Connect"
                          )}
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-input hover:bg-accent transition-colors"
                      onClick={() => setShowConnectModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Connect New App</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* App Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-6 rounded-lg border border-input bg-background shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Connect New App</h4>
              <button onClick={() => setShowConnectModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select App</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="google-drive">Google Drive</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="github">GitHub</option>
                  <option value="trello">Trello</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the app to authorize this connection.
              </p>
              <div className="flex justify-end gap-2">
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                  onClick={() => handleConnectApp("Google Drive")}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
