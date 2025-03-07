
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useUpdateUserSettings, useUserSettings } from "@/lib/supabase-client";
import { useSession, useSignOut, useResetPassword, useUploadProfileImage } from "@/lib/supabase-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Smartphone,
  BarChart4,
  Clock,
  X,
  Settings as SettingsIcon,
  Plus,
  HelpCircle,
  LogOut,
  Upload,
  Camera,
  Download,
  Mail,
  Info,
  FileText,
  KeyRound,
  CheckCircle2,
  QrCode,
  MessageCircle, 
  Cloud,
  Video,
  Github,
  Trello
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Settings = () => {
  const { toast } = useToast();
  const { session } = useSession();
  const isMobile = useIsMobile();
  const userId = session?.user?.id;
  const [profile, setProfile] = useState({
    name: session?.user?.user_metadata?.name || "",
    email: session?.user?.email || "",
    phone: session?.user?.user_metadata?.phone || "",
    avatar: session?.user?.user_metadata?.avatar_url || "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    theme: "light",
    language: "en",
    dashboardLayout: "default",
    autoLogout: 60,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [showFaq, setShowFaq] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [passwordChange, setPasswordChange] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
  const [connectedApps] = useState([
    { name: "Google Calendar", connected: true, icon: <BarChart4 className="h-4 w-4" /> },
    { name: "Microsoft Office", connected: false, icon: <FileText className="h-4 w-4" /> },
    { name: "Slack", connected: true, icon: <MessageCircle className="h-4 w-4" /> },
    { name: "Dropbox", connected: false, icon: <Download className="h-4 w-4" /> },
  ]);
  const [availableIntegrations] = useState([
    { name: "Google Drive", icon: <Cloud className="h-4 w-4" /> },
    { name: "Zoom", icon: <Video className="h-4 w-4" /> },
    { name: "Trello", icon: <Trello className="h-4 w-4" /> },
    { name: "GitHub", icon: <Github className="h-4 w-4" /> },
  ]);
  
  // Get user settings
  const { data: userSettings, isLoading, refetch } = useUserSettings(userId);
  const updateUserSettings = useUpdateUserSettings();
  const { uploadImage, loading: isImageUploading } = useUploadProfileImage();
  const { signOut, loading: isSigningOut } = useSignOut();
  const { resetPassword, loading: isResetLoading } = useResetPassword();
  
  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      // Using type assertion to handle dynamic properties
      const settings = userSettings as any;
      
      setPreferences({
        emailNotifications: userSettings.email_notifications,
        theme: userSettings.theme || "light",
        language: userSettings.language || "en",
        dashboardLayout: userSettings.dashboard_layout && typeof userSettings.dashboard_layout === 'object' 
          ? (userSettings.dashboard_layout as any).layout || "default"
          : "default",
        autoLogout: settings.auto_logout || 60,
      });
    }
  }, [userSettings]);

  // Set document theme based on preferences
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

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
      // Validate phone if provided
      if (profile.phone && !/^\+?[0-9\s-]{10,15}$/.test(profile.phone)) {
        throw new Error("Please enter a valid phone number");
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: profile.name,
          phone: profile.phone,
        }
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

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    setIsUploadingAvatar(true);
    try {
      // Upload the profile image
      const imageUrl = await uploadImage(file, userId);
      
      if (imageUrl) {
        setProfile({...profile, avatar: imageUrl});
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
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
      } else if (setting === "2fa") {
        // Toggle 2FA (simulation)
        setIs2FAEnabled(!is2FAEnabled);
        toast({
          title: `2FA ${!is2FAEnabled ? 'Enabled' : 'Disabled'}`,
          description: `Two-factor authentication has been ${!is2FAEnabled ? 'enabled' : 'disabled'} for your account.`,
        });
        return;
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
      
      // Update the local state (in a real app we would save this to the database)
      
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
      
      // Update the local state (in a real app we would save this to the database)
      
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

  const handleResetPassword = async () => {
    if (!profile.email) {
      toast({
        title: "Email Required",
        description: "Your email address is needed to reset your password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await resetPassword(profile.email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    }
  };
  
  const handle2FASetup = () => {
    if (is2FAEnabled) {
      // If already enabled, disable it
      setIs2FAEnabled(false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
    } else {
      // Show the 2FA setup flow (simplified for demo)
      setIs2FAEnabled(true);
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const ConnectionModal = ({ app }: { app: { name: string, icon: React.ReactNode } }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Connect to {app.name}</h3>
          <button onClick={() => setShowConnectModal(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-md bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              {app.icon}
              <div>
                <p className="font-medium">{app.name}</p>
                <p className="text-sm text-muted-foreground">
                  Connect your account to enable {app.name} integration
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 text-sm">
            <p className="mb-2">By connecting to {app.name}, you agree to:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>Share access to your profile information</li>
              <li>Allow read/write access to your data</li>
              <li>Enable seamless integration between platforms</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setShowConnectModal(false)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Cancel
            </button>
            <button 
              onClick={() => handleConnectApp(app.name)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
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
  );

  const FAQSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-4 w-4" />
        <h3 className="font-medium">Help & Support</h3>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          {[
            {
              question: "How do I change my password?",
              answer: "Go to Settings > Security and click on the 'Change Password' button. You'll receive an email with a link to reset your password."
            },
            {
              question: "How do I enable two-factor authentication?",
              answer: "Go to Settings > Security and toggle on the Two-Factor Authentication option. You'll be guided through the setup process to enhance your account security."
            },
            {
              question: "Can I connect my account to external services?",
              answer: "Yes, go to Settings > Integrations to connect your account with services like Google Calendar, Microsoft Office, and Slack for enhanced functionality."
            },
            {
              question: "How do I change the app's appearance?",
              answer: "Go to Settings > Appearance and choose between Light and Dark modes. You can also customize your dashboard layout and select your preferred language."
            },
            {
              question: "How do I update my profile information?",
              answer: "Go to Settings > Profile to update your name, email, phone number, and profile picture. Click 'Save Changes' when you're done."
            }
          ].map((faq, index) => (
            <div key={index} className="p-4 rounded-lg bg-primary/5">
              <h4 className="text-sm font-medium mb-2">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-lg border border-input">
          <h4 className="text-sm font-medium mb-2">Need more help?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            If you couldn't find the answer to your question, please contact our support team.
          </p>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
              <FileText className="mr-2 h-4 w-4" />
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <div className="dashboard-card md:col-span-2">
            <div className="space-y-1 mb-6">
              <button 
                onClick={() => {
                  setActiveSettingsTab("profile");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "profile" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSettingsTab("appearance");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "appearance" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSettingsTab("notifications");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "notifications" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSettingsTab("security");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "security" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSettingsTab("integrations");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "integrations" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Integrations</span>
              </button>
              <button 
                onClick={() => {
                  setActiveSettingsTab("privacy");
                  setShowFaq(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md ${
                  activeSettingsTab === "privacy" && !showFaq 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </button>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex flex-col space-y-2">
                <button 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-muted-foreground ${
                    showFaq ? "bg-primary text-primary-foreground hover:bg-primary" : ""
                  }`}
                  onClick={() => setShowFaq(!showFaq)}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </button>
                <button 
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-red-500"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-card md:col-span-5">
            {showFaq ? (
              <FAQSection />
            ) : activeSettingsTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-4 w-4" />
                  <h3 className="font-medium">Profile Settings</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="text-lg">
                          {profile.name
                            ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-1 -right-1 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{profile.name || "Your Name"}</h4>
                    <p className="text-sm text-muted-foreground">{profile.email || "your.email@example.com"}</p>
                  </div>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="+1 (555) 123-4567"
                    />
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
            )}
            
            {!showFaq && activeSettingsTab === "appearance" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="h-4 w-4" />
                  <h3 className="font-medium">Appearance</h3>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Palette className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Theme</p>
                            <p className="text-sm text-muted-foreground">
                              Select your preferred theme
                            </p>
                          </div>
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
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Language</p>
                            <p className="text-sm text-muted-foreground">
                              Choose your preferred language
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleUpdateLanguage(lang.code)}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                              preferences.language === lang.code
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-accent"
                            }`}
                          >
                            {preferences.language === lang.code && <Check className="h-4 w-4" />}
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Dashboard Layout */}
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SettingsIcon className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Dashboard Layout</p>
                            <p className="text-sm text-muted-foreground">
                              Customize how your dashboard is displayed
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {dashboardLayouts.map((layout) => (
                          <button
                            key={layout.value}
                            onClick={() => handleUpdateDashboardLayout(layout.value)}
                            className={`flex items-center justify-between px-3 py-2 rounded-md ${
                              preferences.dashboardLayout === layout.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-accent"
                            }`}
                          >
                            <span>{layout.name}</span>
                            {preferences.dashboardLayout === layout.value && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Auto-Logout */}
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Auto-Logout</p>
                            <p className="text-sm text-muted-foreground">
                              Set the time before you're automatically logged out
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {autoLogoutOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleUpdateAutoLogout(option.value)}
                            className={`flex items-center justify-between px-3 py-2 rounded-md ${
                              preferences.autoLogout === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-card hover:bg-accent"
                            }`}
                          >
                            <span>{option.name}</span>
                            {preferences.autoLogout === option.value && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Mobile Preferences (if on mobile) */}
                    {isMobile && (
                      <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">Mobile Settings</p>
                              <p className="text-sm text-muted-foreground">
                                Additional settings for mobile devices
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Additional mobile settings go here */}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!showFaq && activeSettingsTab === "notifications" && (
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
                    <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive important updates via email
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSetting("emailNotifications")}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            preferences.emailNotifications 
                              ? "bg-primary" 
                              : "bg-input"
                          }`}
                          role="switch"
                          aria-checked={preferences.emailNotifications}
                          disabled={isSaving}
                        >
                          <span
                            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                              preferences.emailNotifications ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {/* Additional notification settings */}
                    <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                      <h4 className="text-sm font-medium mb-4">Notification Types</h4>
                      
                      {/* List of notification types with toggles */}
                      <div className="space-y-4">
                        {[
                          { id: "security", name: "Security Alerts", defaultEnabled: true, icon: <Shield className="h-4 w-4" /> },
                          { id: "updates", name: "Product Updates", defaultEnabled: true, icon: <Info className="h-4 w-4" /> },
                          { id: "marketing", name: "Marketing Communications", defaultEnabled: false, icon: <Mail className="h-4 w-4" /> },
                          { id: "team", name: "Team Activity", defaultEnabled: true, icon: <User className="h-4 w-4" /> },
                        ].map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {notification.icon}
                              <span className="text-sm">{notification.name}</span>
                            </div>
                            <button
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                notification.defaultEnabled ? "bg-primary" : "bg-input"
                              }`}
                              role="switch"
                              aria-checked={notification.defaultEnabled}
                            >
                              <span
                                className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                  notification.defaultEnabled ? "translate-x-5" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-input">
                      <h4 className="text-sm font-medium mb-2">Communication Preferences</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Customize how and when you'd like to be contacted.
                      </p>
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        Manage Communication Preferences
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!showFaq && activeSettingsTab === "security" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-4 w-4" />
                  <h3 className="font-medium">Security Settings</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Password Reset */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <KeyRound className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Password</p>
                          <p className="text-sm text-muted-foreground">
                            Update your password for better security
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <button 
                        onClick={handleResetPassword}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                        disabled={isResetLoading}
                      >
                        {isResetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Two-Factor Authentication */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handle2FASetup}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          is2FAEnabled 
                            ? "bg-primary" 
                            : "bg-input"
                        }`}
                        role="switch"
                        aria-checked={is2FAEnabled}
                        disabled={isSaving}
                      >
                        <span
                          className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                            is2FAEnabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    
                    {is2FAEnabled && (
                      <div className="mt-4 p-4 rounded-md bg-muted space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-2 rounded-md">
                            {/* Placeholder for QR code - in a real app, this would be a generated QR code */}
                            <div className="w-24 h-24 grid grid-cols-4 grid-rows-4 gap-1">
                              {Array.from({ length: 16 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Scan this QR code</p>
                            <p className="text-xs text-muted-foreground">
                              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code.
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Or enter this code manually:</p>
                          <div className="flex items-center gap-2">
                            <code className="p-2 bg-muted-foreground/10 rounded text-sm font-mono">
                              ABCD EFGH IJKL MNOP
                            </code>
                            <button className="rounded-md p-1 hover:bg-muted-foreground/20">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t space-y-2">
                          <p className="text-sm font-medium">Verify your setup:</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              placeholder="Enter the 6-digit code"
                            />
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Session Management */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Active Sessions</p>
                          <p className="text-sm text-muted-foreground">
                            Manage devices where you're currently logged in
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-3">
                      <div className="p-3 rounded-md bg-muted/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Current Device</p>
                            <p className="text-xs text-muted-foreground">Last active: Just now</p>
                          </div>
                        </div>
                        <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                          Current
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-md bg-muted/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Laptop className="h-4 w-4" />
                          <div>
                            <p className="text-sm font-medium">Macbook Pro</p>
                            <p className="text-xs text-muted-foreground">Last active: 2 days ago</p>
                          </div>
                        </div>
                        <button className="text-destructive hover:text-destructive/80 text-xs font-medium px-2 py-1 rounded">
                          <LogOut className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <button className="mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out of All Devices
                    </button>
                  </div>
                  
                  {/* Login History */}
                  <div className="space-y-2 p-4 rounded-lg border border-input">
                    <h4 className="text-sm font-medium">Login History</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Recent login attempts to your account.
                    </p>
                    
                    <div className="space-y-2">
                      {[
                        { date: "Today, 10:30 AM", location: "San Francisco, CA", success: true },
                        { date: "Yesterday, 8:45 PM", location: "San Francisco, CA", success: true },
                        { date: "Jul 12, 2023, 3:20 PM", location: "New York, NY", success: false },
                      ].map((login, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {login.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span>{login.date}</span>
                          </div>
                          <span className="text-muted-foreground">{login.location}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="mt-2 text-sm text-primary hover:underline">
                      View full history
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {!showFaq && activeSettingsTab === "integrations" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="h-4 w-4" />
                  <h3 className="font-medium">Integrations</h3>
                </div>
                
                {/* Connected Apps */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Connected Applications</h4>
                  
                  <div className="grid gap-4">
                    {connectedApps.map((app) => (
                      <div key={app.name} className="p-4 rounded-lg border border-input flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {app.icon}
                          </div>
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {app.connected ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        
                        {app.connected ? (
                          <button 
                            onClick={() => handleDisconnectApp(app.name)}
                            className="text-sm font-medium text-destructive hover:text-destructive/80"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Disconnect"
                            )}
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              // Set the app to connect and show modal
                              setShowConnectModal(true);
                            }}
                            className="text-sm font-medium text-primary hover:text-primary/80"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Available Integrations */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Available Integrations</h4>
                    <button className="inline-flex items-center text-xs font-medium text-primary">
                      <Plus className="mr-1 h-3 w-3" />
                      Browse Integration Marketplace
                    </button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {availableIntegrations.map((app) => (
                      <div key={app.name} className="p-4 rounded-lg border border-input flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {app.icon}
                          </div>
                          <p className="font-medium">{app.name}</p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            // Show the connection modal
                            setShowConnectModal(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-2"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* API Access */}
                <div className="p-4 rounded-lg border border-input space-y-4">
                  <h4 className="text-sm font-medium">API Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage your API tokens for custom integrations.
                  </p>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Manage API Keys
                  </button>
                </div>
                
                {/* Connection Modal */}
                {showConnectModal && <ConnectionModal app={availableIntegrations[0]} />}
              </div>
            )}
            
            {!showFaq && activeSettingsTab === "privacy" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-4 w-4" />
                  <h3 className="font-medium">Privacy Settings</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Data Collection */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Info className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Data Collection</p>
                          <p className="text-sm text-muted-foreground">
                            Controls how we collect data about your usage
                          </p>
                        </div>
                      </div>
                      <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-primary"
                        role="switch"
                        aria-checked="true"
                      >
                        <span
                          className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-5"
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Cookie Preferences */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cookie className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Cookie Preferences</p>
                          <p className="text-sm text-muted-foreground">
                            Manage cookies and tracking technologies
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {[
                        { id: "essential", name: "Essential Cookies", description: "Required for basic functionality", required: true },
                        { id: "functional", name: "Functional Cookies", description: "Enhance user experience", required: false },
                        { id: "analytics", name: "Analytics Cookies", description: "Help us improve our services", required: false },
                        { id: "marketing", name: "Marketing Cookies", description: "Used for targeted advertising", required: false },
                      ].map((cookie) => (
                        <div key={cookie.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                          <input
                            type="checkbox"
                            id={cookie.id}
                            checked={cookie.required}
                            disabled={cookie.required}
                            className="mt-1"
                          />
                          <div>
                            <label htmlFor={cookie.id} className="text-sm font-medium block">
                              {cookie.name} {cookie.required && <span className="text-xs text-muted-foreground">(Required)</span>}
                            </label>
                            <p className="text-xs text-muted-foreground">{cookie.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="mt-2 w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                      Save Cookie Preferences
                    </button>
                  </div>
                  
                  {/* Communication Preferences */}
                  <div className="space-y-2 p-4 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">Communication Preferences</p>
                          <p className="text-sm text-muted-foreground">
                            Control what types of emails you receive
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {[
                        { id: "product", name: "Product Updates", enabled: true },
                        { id: "security", name: "Security Alerts", enabled: true },
                        { id: "newsletter", name: "Newsletter", enabled: false },
                        { id: "promotions", name: "Promotions and Offers", enabled: false },
                      ].map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <label htmlFor={pref.id} className="text-sm font-medium">
                            {pref.name}
                          </label>
                          <button
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                              pref.enabled ? "bg-primary" : "bg-input"
                            }`}
                            role="switch"
                            aria-checked={pref.enabled}
                          >
                            <span
                              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                pref.enabled ? "translate-x-5" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Data Export & Deletion */}
                  <div className="p-4 rounded-lg border border-input space-y-4">
                    <h4 className="text-sm font-medium">Your Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download your data or request account deletion.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </button>
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 px-4 py-2">
                        Delete Account
                      </button>
                    </div>
                  </div>
                  
                  {/* Privacy Policy */}
                  <div className="p-4 rounded-lg border border-input">
                    <h4 className="text-sm font-medium mb-2">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our privacy policy was last updated on July 24, 2023.
                    </p>
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                      <FileText className="mr-2 h-4 w-4" />
                      View Privacy Policy
                    </button>
                  </div>
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
