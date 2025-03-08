
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityTabProps {
  userId?: string;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ userId }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tfaStatus, setTfaStatus] = useState<"disabled" | "enabling" | "enabled">("disabled");
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to change your password.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Using Supabase's password update
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully. You may need to sign in again.",
      });
      
      // Reset the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTFA = async () => {
    setTfaStatus("enabling");
    
    try {
      // In a real app, this would integrate with Supabase's multi-factor authentication
      // For demo purposes, we'll simulate the setup process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTfaStatus("enabled");
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully set up for your account.",
      });
    } catch (error: any) {
      console.error("Error setting up 2FA:", error);
      setTfaStatus("disabled");
      
      toast({
        title: "Setup Failed",
        description: error.message || "There was an error setting up two-factor authentication.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <h2 className="text-lg font-medium">Security Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage your password and account security
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="currentPassword" className="text-sm font-medium">
            Current Password
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
          />
        </div>

        <Button
          onClick={handleChangePassword}
          disabled={
            isLoading ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-md font-medium mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Enhance your account security</p>
            <p className="text-xs text-muted-foreground">
              Set up two-factor authentication for additional security.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSetupTFA}
            disabled={tfaStatus === "enabling" || tfaStatus === "enabled"}
          >
            {tfaStatus === "enabling" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : tfaStatus === "enabled" ? (
              "Enabled"
            ) : (
              "Set Up 2FA"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
