
import React from 'react';
import { Lock, Cookie, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function PrivacySettings() {
  const { toast } = useToast();

  const handleDeleteAccount = () => {
    toast({
      title: "Action Required",
      description: "Please confirm account deletion via the email we sent you.",
    });
  };

  return (
    <TabsContent value="privacy" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Manage your privacy preferences and data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="analytics-consent" className="flex flex-col space-y-1">
                <span>Analytics Consent</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Allow us to collect anonymous usage data to improve our service.
                </span>
              </Label>
              <Switch id="analytics-consent" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="cookie-preferences" className="flex flex-col space-y-1">
                <span>Cookie Preferences</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Manage which cookies are allowed on this device.
                </span>
              </Label>
              <Button variant="outline" size="sm">
                <Cookie className="mr-2 h-4 w-4" /> Manage Cookies
              </Button>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="data-sharing" className="flex flex-col space-y-1">
                <span>Data Sharing</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Share your data with our trusted partners.
                </span>
              </Label>
              <Switch id="data-sharing" />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="font-medium">Data Management</span>
              <span className="text-sm text-muted-foreground">
                Export or delete your account data.
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                Export Data
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save preferences</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
          <CardDescription>
            Find answers to common questions and get support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h4 className="font-medium">Frequently Asked Questions</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">How is my data protected?</h5>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and stored securely. We follow industry best practices for data protection and never share your personal information without your consent.
                </p>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Can I opt out of data collection?</h5>
                <p className="text-sm text-muted-foreground">
                  Yes, you can adjust your privacy settings at any time to control what data we collect and how it's used.
                </p>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-sm">How do I delete my account?</h5>
                <p className="text-sm text-muted-foreground">
                  You can delete your account from the Privacy tab in your account settings. This will permanently delete all your data.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <Info className="mr-2 h-4 w-4" /> Contact Support
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
