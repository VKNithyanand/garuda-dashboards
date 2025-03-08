
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ProfileTabProps {
  userId?: string;
  userEmail?: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userId, userEmail }) => {
  const [displayName, setDisplayName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = () => {
    setIsLoading(true);
    // Simulate saving profile
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1000);
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
        </div>

        <Button onClick={handleUpdateProfile} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
