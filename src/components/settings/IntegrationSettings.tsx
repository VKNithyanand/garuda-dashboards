
import React from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export function IntegrationSettings() {
  return (
    <TabsContent value="integrations" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>
            Manage third-party service integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-muted rounded-md p-2">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">Google</h4>
                    <Badge variant="outline">Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access to Google Drive and Gmail
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-muted rounded-md p-2">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">Slack</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications through Slack
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-muted rounded-md p-2">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">GitHub</h4>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integration with GitHub repositories
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Manage All Integrations</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
