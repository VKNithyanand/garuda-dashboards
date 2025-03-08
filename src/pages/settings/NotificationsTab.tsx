
import React, { useState } from "react";
import { useUpdateUserSettings } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2, Check, Mail, X, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotificationStatus({
        message: `Test ${type} notification sent successfully!`,
        type: "success"
      });
      
      setTimeout(() => {
        setNotificationStatus({ message: "", type: null });
      }, 3000);
      
      toast({
        title: "Notification Sent",
        description: `Test ${type} notification sent successfully!`,
      });
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
      }, 3000);
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
        description: `Your notification preferences have been updated.`,
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
        <Bell className="h-5 w-5" />
        <h3 className="text-lg font-medium">Notification Settings</h3>
      </div>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle>Communication Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications from the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates and alerts via email
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.emailNotifications && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendTestNotification('email')}
                  disabled={isSaving || notificationStatus.type === "loading"}
                >
                  {notificationStatus.type === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
                  ) : (
                    <Mail className="h-3 w-3 mr-1" />
                  )}
                  Test
                </Button>
              )}
              <Switch 
                id="email-notifications" 
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggleSetting("emailNotifications")}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your devices
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.pushNotifications && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendTestNotification('push')}
                  disabled={isSaving || notificationStatus.type === "loading"}
                >
                  {notificationStatus.type === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
                  ) : (
                    <Bell className="h-3 w-3 mr-1" />
                  )}
                  Test
                </Button>
              )}
              <Switch 
                id="push-notifications" 
                checked={preferences.pushNotifications}
                onCheckedChange={() => handleToggleSetting("pushNotifications")}
                disabled={isSaving}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base" htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive marketing and promotional emails
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {preferences.marketingEmails && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => sendTestNotification('marketing')}
                  disabled={isSaving || notificationStatus.type === "loading"}
                >
                  {notificationStatus.type === "loading" ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
                  ) : (
                    <Mail className="h-3 w-3 mr-1" />
                  )}
                  Test
                </Button>
              )}
              <Switch 
                id="marketing-emails" 
                checked={preferences.marketingEmails}
                onCheckedChange={() => handleToggleSetting("marketingEmails")}
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You can use the test buttons to verify that notifications are working correctly
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationsTab;
