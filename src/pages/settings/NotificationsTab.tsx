
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUpdateUserSettings } from "@/lib/supabase-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell } from "lucide-react";

interface NotificationsTabProps {
  userId?: string;
  userEmail?: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const updateUserSettings = useUpdateUserSettings();

  const handleSavePreferences = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update notification preferences.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateUserSettings.mutateAsync({
        userId,
        settings: {
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          marketing_emails: preferences.marketingEmails,
        },
      });

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
      
      // Refresh the data
      refetch();
    } catch (error: any) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <h2 className="text-lg font-medium">Notification Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage how and when you receive notifications
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3">
          <div className="space-y-0.5">
            <label
              htmlFor="email-notifications"
              className="text-sm font-medium"
            >
              Email Notifications
            </label>
            <p className="text-xs text-muted-foreground">
              Receive notifications via email at {userEmail}
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.emailNotifications}
            onCheckedChange={() => handleToggleChange("emailNotifications")}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t">
          <div className="space-y-0.5">
            <label
              htmlFor="push-notifications"
              className="text-sm font-medium"
            >
              Push Notifications
            </label>
            <p className="text-xs text-muted-foreground">
              Receive notifications on your device
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.pushNotifications}
            onCheckedChange={() => handleToggleChange("pushNotifications")}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-t">
          <div className="space-y-0.5">
            <label
              htmlFor="marketing-emails"
              className="text-sm font-medium"
            >
              Marketing Emails
            </label>
            <p className="text-xs text-muted-foreground">
              Receive emails about new features and updates
            </p>
          </div>
          <Switch
            id="marketing-emails"
            checked={preferences.marketingEmails}
            onCheckedChange={() => handleToggleChange("marketingEmails")}
          />
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
