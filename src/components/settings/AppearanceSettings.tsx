
import React from 'react';
import { Laptop } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AppearanceSettings() {
  const { toast } = useToast();

  const handleChangeTheme = (theme: 'light' | 'dark' | 'system') => {
    // Logic to change theme
    toast({
      title: "Theme Updated",
      description: `Theme has been changed to ${theme}.`,
    });
  };

  return (
    <TabsContent value="appearance" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the appearance of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleChangeTheme('light')}
              >
                <div className="h-10 w-10 rounded-full bg-background"></div>
                <span className="text-xs font-medium">Light</span>
              </div>
              <div 
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleChangeTheme('dark')}
              >
                <div className="h-10 w-10 rounded-full bg-slate-950"></div>
                <span className="text-xs font-medium">Dark</span>
              </div>
              <div 
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleChangeTheme('system')}
              >
                <Laptop className="h-10 w-10" />
                <span className="text-xs font-medium">System</span>
              </div>
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
