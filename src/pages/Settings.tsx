<lov-code>
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
                          <span>Dark
