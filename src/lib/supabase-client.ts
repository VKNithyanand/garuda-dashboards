
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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

// Get sales data
export function useSalesData() {
  return useQuery({
    queryKey: ["salesData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

// Get customers
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });
}

// Add customer
export function useAddCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: { name: string, email: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Get sales by category
export function useSalesByCategory() {
  return useQuery({
    queryKey: ["salesByCategory"],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('category, amount');
      
      if (error) throw error;
      
      // Process sales data to group by category
      const categoryMap = new Map<string, number>();
      
      sales?.forEach(sale => {
        const category = sale.category;
        const amount = Number(sale.amount);
        
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category)! + amount);
        } else {
          categoryMap.set(category, amount);
        }
      });
      
      // Convert map to array of objects
      const result = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value
      }));
      
      return result;
    },
  });
}

// Get insights
export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
}

// Subscribe to real-time sales updates
export function subscribeToSalesUpdates(callback: (payload: any) => void) {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sales'
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
