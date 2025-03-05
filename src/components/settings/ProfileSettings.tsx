
import React, { useState } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ProfileSettings() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}.${fileExt}`;

    setIsUploading(true);

    try {
      // Call Supabase edge function to upload profile image
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ filePath, fileType: file.type }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');
      
      const { uploadUrl, imageUrl } = await response.json();
      
      // Upload to the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image');
      
      setProfileImage(imageUrl);
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  return (
    <TabsContent value="profile" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your public profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-center">
            <Avatar className="h-24 w-24">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  <User size={32} />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="profile-image" className="cursor-pointer">
                <div className="flex items-center space-x-2 rounded-md bg-secondary px-4 py-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>Upload Image</span>
                </div>
                <Input 
                  id="profile-image" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </Label>
              <p className="text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" placeholder="Tell us about yourself" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile}>Save changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
