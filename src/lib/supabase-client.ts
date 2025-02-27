
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

// Sales Data
export const useSalesData = (dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['sales', dateRange],
    queryFn: async () => {
      let query = supabase.from('sales').select('*');
      
      if (dateRange) {
        query = query
          .gte('transaction_date', dateRange.start)
          .lte('transaction_date', dateRange.end);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useSalesByCategory = () => {
  return useQuery({
    queryKey: ['sales-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('category, amount');
      
      if (error) throw error;
      
      // Group and aggregate data
      const result = data.reduce((acc: Record<string, number>, item) => {
        if (!acc[item.category]) {
          acc[item.category] = 0;
        }
        acc[item.category] += Number(item.amount);
        return acc;
      }, {});
      
      return Object.entries(result).map(([name, value]) => ({ name, value }));
    },
  });
};

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
};

// Insights
export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insights')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
};

// User Settings
export const useUserSettings = (userId?: string) => {
  return useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!userId,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: any }) => {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...settings })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', variables.userId] });
    },
  });
};

// Real-time data 
export const subscribeToSalesUpdates = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('public:sales')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales' }, callback)
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
