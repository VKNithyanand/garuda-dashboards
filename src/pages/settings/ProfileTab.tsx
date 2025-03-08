
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserSettings } from "@/lib/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProfileTabProps {
  userId?: string;
  userEmail?: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ userId, userEmail }) => {
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const updateUserSettings = useUpdateUserSettings();

  // Load user's display name and avatar if available
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!userId) return;
      
      try {
        // Try to get user data from Supabase
        const { data: user } = await supabase.auth.getUser();
        if (user?.user?.user_metadata?.avatar_url) {
          setAvatarUrl(user.user.user_metadata.avatar_url);
        }
        
        // Get display name from user_settings table
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (data) {
          // Now safely check for display_name, and fallback to empty string if not available
          setDisplayName(data.display_name || "");
        } else {
          // Check localStorage as a fallback
          const savedDisplayName = localStorage.getItem(`user_${userId}_display_name`);
          if (savedDisplayName) {
            setDisplayName(savedDisplayName);
          }
        }
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching user settings:", error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserSettings();
  }, [userId]);

  const handleUpdateProfile = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to Supabase if connected
      if (updateUserSettings) {
        await updateUserSettings.mutateAsync({
          userId,
          settings: {
            display_name: displayName,
          }
        });
      }
      
      // Also save to localStorage as a fallback
      localStorage.setItem(`user_${userId}_display_name`, displayName);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a profile image.",
        variant: "destructive"
      });
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 2MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      // Upload directly to Supabase Storage
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
        
      if (urlData) {
        setAvatarUrl(urlData.publicUrl);
        
        // Update user metadata with avatar URL
        await supabase.auth.updateUser({
          data: { avatar_url: urlData.publicUrl }
        });
      }
      
      toast({
        title: "Image Uploaded",
        description: "Your profile image has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your profile image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and avatar
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4 sm:items-start">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} />
            <AvatarFallback className="text-lg">
              {displayName ? displayName.substring(0, 2).toUpperCase() : userEmail ? userEmail.substring(0, 2).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <input
                type="file"
                id="avatar-upload"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
              />
              <Button 
                variant="outline" 
                className="relative min-w-32"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Change Avatar"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a profile picture (max 2MB)
            </p>
          </div>
        </div>
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
          <p className="text-xs text-muted-foreground">
            This name will be displayed in the application and notifications.
          </p>
        </div>

        <Button 
          onClick={handleUpdateProfile} 
          disabled={isLoading || !displayName.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
