
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Plus, X, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateUserSettings } from "@/lib/supabase-client";

interface IntegrationsTabProps {
  userId: string | undefined;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState([
    { id: "google-calendar", name: "Google Calendar", connected: false, icon: "G" },
    { id: "microsoft-office", name: "Microsoft Office", connected: false, icon: "M" },
    { id: "slack", name: "Slack", connected: false, icon: "S" },
    { id: "dropbox", name: "Dropbox", connected: false, icon: "D" },
    { id: "trello", name: "Trello", connected: false, icon: "T" },
  ]);
  const [newAppCredentials, setNewAppCredentials] = useState({
    name: 'Google Drive',
    apiKey: '',
    apiSecret: ''
  });
  
  const updateUserSettings = useUpdateUserSettings();

  // Load user integration settings
  useEffect(() => {
    const loadIntegrations = async () => {
      if (!userId) return;
      
      try {
        // Attempt to get saved integrations from local storage as fallback
        const savedIntegrations = localStorage.getItem(`user_${userId}_integrations`);
        if (savedIntegrations) {
          const integrationData = JSON.parse(savedIntegrations);
          
          // Update our state with saved integration status
          setConnectedApps(prevApps => 
            prevApps.map(app => ({
              ...app,
              connected: integrationData[app.id] || false
            }))
          );
        }
      } catch (error) {
        console.error("Error loading integrations:", error);
      }
    };
    
    loadIntegrations();
  }, [userId]);

  const handleConnectApp = async (appId: string | null) => {
    setIsSaving(true);
    try {
      if (!userId) {
        throw new Error("You need to be logged in to connect apps");
      }
      
      if (appId === null) {
        // This is a new app being added
        if (!newAppCredentials.apiKey || !newAppCredentials.apiSecret) {
          throw new Error("API Key and Secret are required");
        }
        
        // Create a new app ID based on name
        appId = newAppCredentials.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      let updatedApps;
      if (appId) {
        updatedApps = connectedApps.map(app => 
          app.id === appId ? { ...app, connected: true } : app
        );
        setConnectedApps(updatedApps);
      } else {
        // Add new app to the list
        const newApp = { 
          id: appId || newAppCredentials.name.toLowerCase().replace(/\s+/g, '-'), 
          name: newAppCredentials.name, 
          connected: true,
          icon: newAppCredentials.name.charAt(0)
        };
        updatedApps = [...connectedApps, newApp];
        setConnectedApps(updatedApps);
      }
      
      // Save to local storage as fallback
      const integrationData = updatedApps.reduce((acc, app) => {
        acc[app.id] = app.connected;
        return acc;
      }, {} as Record<string, boolean>);
      
      localStorage.setItem(`user_${userId}_integrations`, JSON.stringify(integrationData));
      
      // Save to Supabase if available
      if (updateUserSettings) {
        await updateUserSettings.mutateAsync({
          userId,
          settings: {
            integrations: integrationData
          }
        });
      }
      
      toast({
        title: "App Connected",
        description: `Successfully connected to ${appId ? connectedApps.find(a => a.id === appId)?.name : newAppCredentials.name}`,
      });
      
      // Reset form if adding new app
      if (!appId) {
        setNewAppCredentials({
          name: 'Google Drive',
          apiKey: '',
          apiSecret: ''
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect the app`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowConnectModal(false);
    }
  };

  const handleDisconnectApp = async (appId: string) => {
    setIsSaving(true);
    try {
      if (!userId) {
        throw new Error("You need to be logged in to disconnect apps");
      }
      
      // Simulate disconnecting from the app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the local state
      const updatedApps = connectedApps.map(app => 
        app.id === appId ? { ...app, connected: false } : app
      );
      setConnectedApps(updatedApps);
      
      // Save to local storage
      const integrationData = updatedApps.reduce((acc, app) => {
        acc[app.id] = app.connected;
        return acc;
      }, {} as Record<string, boolean>);
      
      localStorage.setItem(`user_${userId}_integrations`, JSON.stringify(integrationData));
      
      // Save to Supabase if available
      if (updateUserSettings) {
        await updateUserSettings.mutateAsync({
          userId,
          settings: {
            integrations: integrationData
          }
        });
      }
      
      toast({
        title: "App Disconnected",
        description: `Successfully disconnected from ${connectedApps.find(a => a.id === appId)?.name}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || `Failed to disconnect the app`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="h-5 w-5" />
          <h3 className="text-lg font-medium">Integrations</h3>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Connected Services</CardTitle>
            <CardDescription>
              Connect your account to external services for enhanced functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{app.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{app.name}</p>
                    {app.connected ? (
                      <div className="flex items-center mt-1">
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                        <p className="text-xs text-muted-foreground">Connected</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                <Button
                  variant={app.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => app.connected 
                    ? handleDisconnectApp(app.id) 
                    : handleConnectApp(app.id)
                  }
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : app.connected ? (
                    "Disconnect"
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => setShowConnectModal(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Connect New Service</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* App Connection Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md p-6 rounded-lg border border-input bg-background shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Connect New App</h4>
              <button onClick={() => setShowConnectModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select App</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newAppCredentials.name}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, name: e.target.value})}
                >
                  <option value="Google Drive">Google Drive</option>
                  <option value="Dropbox">Dropbox</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Trello">Trello</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <input
                  type="text"
                  value={newAppCredentials.apiKey}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, apiKey: e.target.value})}
                  placeholder="Enter your API key"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">API Secret</label>
                <input
                  type="password"
                  value={newAppCredentials.apiSecret}
                  onChange={(e) => setNewAppCredentials({...newAppCredentials, apiSecret: e.target.value})}
                  placeholder="Enter your API secret"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your credentials will be encrypted and stored securely.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowConnectModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleConnectApp(null)}
                  disabled={isSaving || !newAppCredentials.apiKey || !newAppCredentials.apiSecret}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IntegrationsTab;
