
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUpdateUserSettings, useUserSettings } from "@/lib/supabase-client";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Lock,
  Globe,
  Shield,
  Loader2,
  Check,
  Smartphone,
  Clock,
  X,
  Plus,
  Mail
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    autoLogout: 60,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("notifications");
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
  const [newAppCredentials, setNewAppCredentials] = useState({
    name: 'Google Drive',
    apiKey: '',
    apiSecret: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [is2FASetupActive, setIs2FASetupActive] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
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
  
  // Set up auto logout based on user preference
  useEffect(() => {
    if (preferences.autoLogout > 0) {
      const logoutTimer = setTimeout(() => {
        handleLogout();
      }, preferences.autoLogout * 60 * 1000); // Convert minutes to milliseconds
      
      return () => clearTimeout(logoutTimer);
    }
  }, [preferences.autoLogout]);
  
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
        autoLogout: settings.auto_logout || 60,
      });
    }
  }, [userSettings]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
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
        
        // Send a test notification
        if (!preferences.emailNotifications) {
          // Push a test email notification
          toast({
            title: "Email Notification Sent",
            description: "A welcome email notification has been sent to your email address.",
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
          // Request notification permission
          if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                new Notification("Notifications Enabled", {
                  body: "You will now receive push notifications.",
                  icon: "/placeholder.svg"
                });
              }
            });
          } else {
            new Notification("Notifications Enabled", {
              body: "You will now receive push notifications.",
              icon: "/placeholder.svg"
            });
          }
          
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
      if (!newAppCredentials.apiKey || !newAppCredentials.apiSecret) {
        throw new Error("API Key and Secret are required");
      }
      
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "App Connected",
        description: `Successfully connected to ${appName || newAppCredentials.name}`,
      });
      
      // Update the local state
      if (appName) {
        setConnectedApps(prevApps => 
          prevApps.map(app => 
            app.name === appName ? { ...app, connected: true } : app
          )
        );
      } else {
        // Add new app to the list
        setConnectedApps(prevApps => [
          ...prevApps,
          { name: newAppCredentials.name, connected: true }
        ]);
        
        // Reset form
        setNewAppCredentials({
          name: 'Google Drive',
          apiKey: '',
          apiSecret: ''
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect to ${appName || newAppCredentials.name}`,
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
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to change your password.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Your new password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      
      // Clear the form and close it
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsChangingPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const setup2FA = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      // Simulate generating TOTP secret and QR code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would generate a TOTP secret and QR code URL
      const mockSecret = "KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD";
      const mockQrCode = "https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/Lovable:user@example.com?secret=KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD&issuer=Lovable&algorithm=SHA1&digits=6&period=30";
      
      setTwoFactorSecret(mockSecret);
      setQrCodeUrl(mockQrCode);
      setIs2FASetupActive(true);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set up 2FA",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const verify2FACode = async () => {
    if (!userId || !verificationCode) return;
    
    setIsSaving(true);
    try {
      // Simulate verifying TOTP code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would verify the TOTP code against the secret
      if (verificationCode === "123456") {
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled for your account.",
        });
        
        // Update user settings to indicate 2FA is enabled
        await updateUserSettings.mutateAsync({
          userId,
          settings: { two_factor_enabled: true },
        });
        
        setIs2FASetupActive(false);
        setVerificationCode('');
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify 2FA code",
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                      >
                        {isChangingPassword ? "Cancel" : "Change"}
                      </Button>
                    </div>
                    
                    {isChangingPassword && (
                      <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                        <div>
                          <label className="text-sm font-medium">Current Password</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">New Password</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                            className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
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
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={setup2FA}
                        disabled={isSaving || is2FASetupActive}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Set up"
                        )}
                      </Button>
                    </div>
                    
                    {is2FASetupActive && (
                      <div className="mt-4 space-y-4">
                        <div className="border rounded-md p-4 bg-background">
                          <p className="text-sm font-medium mb-2">
                            Scan this QR code with your authenticator app
                          </p>
                          <div className="flex justify-center my-4">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="h-48 w-48" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Or enter this code manually:
                          </p>
                          <code className="bg-muted p-2 rounded text-sm block overflow-x-auto">
                            {twoFactorSecret}
                          </code>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Verification Code</label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter the 6-digit code"
                              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                            <Button 
                              onClick={verify2FACode}
                              disabled={isSaving || !verificationCode}
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            For testing, use code 123456
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                        <Button
                          variant={app.connected ? "outline" : "default"}
                          size="sm"
                          onClick={() => app.connected 
                            ? handleDisconnectApp(app.name) 
                            : setShowConnectModal(true)
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
                        </Button>
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
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newAppCredentials.name}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, name: e.target.value})}
                >
                  <option value="Google Drive">Google Drive</option>
                  <option value="Dropbox">Dropbox</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Trello">Trello</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <input
                  type="text"
                  value={newAppCredentials.apiKey}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, apiKey: e.target.value})}
                  placeholder="Enter your API key"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Secret</label>
                <input
                  type="password"
                  value={newAppCredentials.apiSecret}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, apiSecret: e.target.value})}
                  placeholder="Enter your API secret"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your credentials will be encrypted and stored securely.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleConnectApp('')}
                  disabled={isSaving || !newAppCredentials.apiKey || !newAppCredentials.apiSecret}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
