
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserSettings } from "@/lib/supabase-client";

interface ProfileTabProps {
  userId?: string;
  userEmail?: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userId, userEmail }) => {
  const [displayName, setDisplayName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const updateUserSettings = useUpdateUserSettings();

  // Load user's display name if available
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!userId) return;
      
      try {
        // This would typically fetch from the Supabase user_settings table
        // For now, we'll check localStorage as a fallback
        const savedDisplayName = localStorage.getItem(`user_${userId}_display_name`);
        if (savedDisplayName) {
          setDisplayName(savedDisplayName);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };
    
    fetchUserSettings();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to Supabase if connected
      if (updateUserSettings) {
        await updateUserSettings.mutateAsync({
          userId,
          settings: {
            display_name: displayName,
          }
        });
      }
      
      // Also save to localStorage as a fallback
      localStorage.setItem(`user_${userId}_display_name`, displayName);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <Input
            id="email"
            value={userEmail || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Your email address is used for notifications and sign-in.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium">
            Display Name
          </label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
          />
          <p className="text-xs text-muted-foreground">
            This name will be displayed in the application and notifications.
          </p>
        </div>

        <Button 
          onClick={handleUpdateProfile} 
          disabled={isLoading || !displayName.trim()}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
