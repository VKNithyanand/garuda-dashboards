
import React, { useState } from 'react';
import { Shield, Key, Smartphone, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function SecuritySettings() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const recoveryCodes = [
    'A1B2C3D4E5F6',
    'G7H8I9J0K1L2',
    'M3N4O5P6Q7R8',
    'S9T0U1V2W3X4',
    'Y5Z6A7B8C9D0'
  ];

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Implementation for password change
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled." 
        : "Two-factor authentication has been enabled for your account.",
    });
  };

  const handleCopyRecoveryCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Recovery code copied to clipboard",
    });
  };

  return (
    <TabsContent value="security" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleChangePassword}>Update Password</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <span>Two-Factor Authentication</span>
              <span className="text-sm font-normal text-muted-foreground">
                Protect your account with an additional security layer.
              </span>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleToggleTwoFactor}
            />
          </div>

          {twoFactorEnabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">Authentication App</span>
                  <span className="text-sm text-muted-foreground">
                    Use an authentication app like Google Authenticator or Authy.
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-48 w-48 bg-slate-100 flex items-center justify-center border rounded-md">
                    <span className="text-sm text-muted-foreground">QR Code Placeholder</span>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Scan this QR code with your authentication app
                  </div>
                </div>
                <Button onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}>
                  {showRecoveryCodes ? "Hide Recovery Codes" : "Show Recovery Codes"}
                </Button>
                
                {showRecoveryCodes && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recovery Codes</p>
                    <p className="text-sm text-muted-foreground">
                      Save these recovery codes in a secure location. You can use these codes to access your account if you lose your authentication device.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recoveryCodes.map((code, index) => (
                        <div key={index} className="flex items-center space-x-2 font-mono text-sm bg-muted p-2 rounded-md">
                          <span>{code}</span>
                          <button 
                            onClick={() => handleCopyRecoveryCode(code)}
                            className="ml-auto text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
