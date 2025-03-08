
import React, { useState } from "react";
import { useUserSettings, useUpdateUserSettings } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bell, Loader2, Check, Mail, X, Smartphone } from "lucide-react";

interface NotificationsTabProps {
  userId: string | undefined;
  userEmail: string | undefined;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  setPreferences: React.Dispatch<React.SetStateAction<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  }>>;
  refetch: () => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  userId,
  userEmail,
  preferences,
  setPreferences,
  refetch
}) => {
  const { toast } = useToast();
  const updateUserSettings = useUpdateUserSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{
    message: string;
    type: "success" | "error" | "loading" | null;
  }>({ message: "", type: null });

  // Function to send a test notification
  const sendTestNotification = async (type: 'email' | 'push' | 'marketing') => {
    if (!userId || !userEmail) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to send test notifications.",
        variant: "destructive",
      });
      return;
    }
    
    setNotificationStatus({
      message: `Sending test ${type} notification...`,
      type: "loading"
    });
    
    try {
      let payload = {};
      let action = '';
      
      if (type === 'email') {
        action = 'email_notification';
        payload = {
          recipient: userEmail,
          subject: "Test Email Notification",
          message: "This is a test email notification from the dashboard."
        };
      } else if (type === 'push') {
        action = 'push_notification';
        payload = {
          userId,
          title: "Test Push Notification",
          body: "This is a test push notification from the dashboard."
        };
      } else if (type === 'marketing') {
        action = 'marketing_email';
        payload = {
          recipients: [userEmail],
          campaign: "Test Marketing Campaign",
          content: "This is a test marketing email campaign."
        };
      }
      
      const response = await fetch('https://pjgxeexnyculxivmtccj.supabase.co/functions/v1/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          data: payload
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotificationStatus({
          message: data.message,
          type: "success"
        });
        
        setTimeout(() => {
          setNotificationStatus({ message: "", type: null });
        }, 5000);
        
        toast({
          title: "Notification Sent",
          description: data.message,
        });
      } else {
        throw new Error(data.error || "Failed to send notification");
      }
    } catch (error: any) {
      setNotificationStatus({
        message: error.message || `Failed to send ${type} notification`,
        type: "error"
      });
      
      toast({
        title: "Error",
        description: error.message || `Failed to send ${type} notification`,
        variant: "destructive",
      });
      
      setTimeout(() => {
        setNotificationStatus({ message: "", type: null });
      }, 5000);
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
        
        // Send a test notification if being enabled
        if (!preferences.emailNotifications) {
          // We'll handle this after saving the preference
          setTimeout(() => {
            sendTestNotification('email');
          }, 1000);
        }
      } else if (setting === "pushNotifications") {
        updatedSettings.push_notifications = !preferences.pushNotifications;
        setPreferences({
          ...preferences,
          pushNotifications: !preferences.pushNotifications,
        });
        
        // Request notification permissions if being enabled
        if (!preferences.pushNotifications) {
          if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              setTimeout(() => {
                sendTestNotification('push');
              }, 1000);
            }
          } else {
            // Send a test push notification
            setTimeout(() => {
              sendTestNotification('push');
            }, 1000);
          }
        }
      } else if (setting === "marketingEmails") {
        updatedSettings.marketing_emails = !preferences.marketingEmails;
        setPreferences({
          ...preferences,
          marketingEmails: !preferences.marketingEmails,
        });
        
        if (!preferences.marketingEmails) {
          setTimeout(() => {
            sendTestNotification('marketing');
          }, 1000);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-4 w-4" />
        <h3 className="font-medium">Notification Settings</h3>
      </div>
      
      <div className="space-y-6">
        {notificationStatus.type && (
          <Alert variant={notificationStatus.type === "error" ? "destructive" : "default"}>
            {notificationStatus.type === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : notificationStatus.type === "success" ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>Notification Status</AlertTitle>
            <AlertDescription>{notificationStatus.message}</AlertDescription>
          </Alert>
        )}
        
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
          <div className="flex items-center gap-2">
            {preferences.emailNotifications && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendTestNotification('email')}
                disabled={isSaving || notificationStatus.type === "loading"}
              >
                {notificationStatus.type === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Test
              </Button>
            )}
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
          <div className="flex items-center gap-2">
            {preferences.pushNotifications && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendTestNotification('push')}
                disabled={isSaving || notificationStatus.type === "loading"}
              >
                {notificationStatus.type === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Test
              </Button>
            )}
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
          <div className="flex items-center gap-2">
            {preferences.marketingEmails && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendTestNotification('marketing')}
                disabled={isSaving || notificationStatus.type === "loading"}
              >
                {notificationStatus.type === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Test
              </Button>
            )}
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
        
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            These settings control how you receive notifications from the application. 
            You can use the test buttons to verify that notifications are working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
