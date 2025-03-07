
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the URL for a Supabase Edge Function
 * @param functionName The name of the Edge Function
 * @returns The full URL to the Edge Function
 */
export const getFunctionUrl = (functionName: string): string => {
  // Get the base URL from the Supabase client
  const baseUrl = `${process.env.SUPABASE_URL || "https://pjgxeexnyculxivmtccj.supabase.co"}/functions/v1`;
  return `${baseUrl}/${functionName}`;
};

/**
 * Gets the authentication header for Supabase requests
 * @returns The Authorization header object
 */
export const getAuthHeader = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};
