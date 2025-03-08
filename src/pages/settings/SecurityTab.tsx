
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, KeyRound, Shield, PhoneCall } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityTabProps {
  userId?: string;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ userId }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryCodesGenerated, setRecoveryCodesGenerated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          
          // In a real app, we would fetch 2FA status from the database
          // For now we'll simulate it being disabled by default
          setTwoFactorEnabled(false);
        }
      } catch (error) {
        console.error("Error fetching security data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        title: "Passwords don't match",
        description: "Your new password and confirmation password must match.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Your new password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail || '',
        password: currentPassword,
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
      
      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleTwoFactor = () => {
    // For demo purposes, we'll simulate enabling/disabling 2FA
    // In a real app, this would involve more complex authentication steps
    const newStatus = !twoFactorEnabled;
    
    toast({
      title: newStatus ? "2FA Setup Required" : "2FA Disabled",
      description: newStatus 
        ? "In a production app, you would be prompted to set up 2FA now." 
        : "Two-factor authentication has been disabled.",
    });
    
    setTwoFactorEnabled(newStatus);
    
    if (newStatus) {
      // In a real app, this would trigger a setup process
      // For demo, we'll just show this as enabled
      setRecoveryCodesGenerated(false);
    }
  };

  const generateRecoveryCodes = () => {
    // Simulate generating recovery codes
    toast({
      title: "Recovery Codes Generated",
      description: "In a production app, you would see your recovery codes here.",
    });
    
    setRecoveryCodesGenerated(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <h2 className="text-lg font-medium">Security Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage your account security settings
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Password
          </CardTitle>
          <CardDescription>
            Change your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Current Password
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Enable Two-Factor Authentication</div>
              <div className="text-xs text-muted-foreground">
                Require a code from your phone in addition to your password
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={toggleTwoFactor}
            />
          </div>

          {twoFactorEnabled && (
            <>
              <div className="space-y-2 pt-2 border-t">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number (for SMS verification)
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">
                  In a production app, this would allow you to receive verification codes
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="text-sm font-medium">Recovery Codes</div>
                <p className="text-xs text-muted-foreground">
                  Generate recovery codes in case you lose access to your phone
                </p>
                <Button 
                  variant="outline" 
                  onClick={generateRecoveryCodes}
                  disabled={recoveryCodesGenerated}
                >
                  {recoveryCodesGenerated ? "Codes Generated" : "Generate Recovery Codes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
