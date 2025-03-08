
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Plus, X } from "lucide-react";

interface IntegrationsTabProps {
  userId: string | undefined;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState([
    { name: "Google Calendar", connected: true },
    { name: "Microsoft Office", connected: false },
    { name: "Slack", connected: true },
    { name: "Dropbox", connected: false },
    { name: "Trello", connected: false },
  ]);
  const [newAppCredentials, setNewAppCredentials] = useState({
    name: 'Google Drive',
    apiKey: '',
    apiSecret: ''
  });

  const handleConnectApp = async (appName: string) => {
    setIsSaving(true);
    try {
      if (!userId) {
        throw new Error("You need to be logged in to connect apps");
      }
      
      if (!newAppCredentials.apiKey || !newAppCredentials.apiSecret) {
        throw new Error("API Key and Secret are required");
      }
      
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "App Connected",
        description: `Successfully connected to ${appName || newAppCredentials.name}`,
      });
      
      // Update the local state
      if (appName) {
        setConnectedApps(prevApps => 
          prevApps.map(app => 
            app.name === appName ? { ...app, connected: true } : app
          )
        );
      } else {
        // Add new app to the list
        setConnectedApps(prevApps => [
          ...prevApps,
          { name: newAppCredentials.name, connected: true }
        ]);
        
        // Reset form
        setNewAppCredentials({
          name: 'Google Drive',
          apiKey: '',
          apiSecret: ''
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect to ${appName || newAppCredentials.name}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowConnectModal(false);
    }
  };

  const handleDisconnectApp = async (appName: string) => {
    setIsSaving(true);
    try {
      if (!userId) {
        throw new Error("You need to be logged in to disconnect apps");
      }
      
      // Simulate disconnecting from the app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "App Disconnected",
        description: `Successfully disconnected from ${appName}`,
      });
      
      // Update the local state
      setConnectedApps(prevApps => 
        prevApps.map(app => 
          app.name === appName ? { ...app, connected: false } : app
        )
      );
      
    } catch (error: any) {
      toast({
        title: "Disconnection Failed",
        description: error.message || `Failed to disconnect from ${appName}`,
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
          <Globe className="h-4 w-4" />
          <h3 className="font-medium">Integrations</h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Connect your account to external services for enhanced functionality.
          </p>
          
          {/* Connected Apps */}
          <div className="space-y-4">
            {connectedApps.map((app) => (
              <div key={app.name} className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">{app.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{app.name}</p>
                    {app.connected ? (
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
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
                    ? handleDisconnectApp(app.name) 
                    : setShowConnectModal(true)
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
            
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-input hover:bg-accent transition-colors"
              onClick={() => setShowConnectModal(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Connect New App</span>
            </button>
          </div>
        </div>
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
                  onClick={() => handleConnectApp('')}
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
