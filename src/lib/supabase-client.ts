
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Get user settings
export function useUserSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Update user settings
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string, settings: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: userId, 
          ...settings
        }, { 
          onConflict: 'user_id' 
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the user settings query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ["userSettings", variables.userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });
}
