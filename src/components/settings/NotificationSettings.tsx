
import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export function NotificationSettings() {
  return (
    <TabsContent value="notifications" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receive email notifications for important updates.
                </span>
              </Label>
              <Switch id="email-notifications" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                <span>Push Notifications</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receive push notifications in your browser.
                </span>
              </Label>
              <Switch id="push-notifications" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                <span>Marketing Emails</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Receive marketing emails about our products and services.
                </span>
              </Label>
              <Switch id="marketing-emails" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save preferences</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
