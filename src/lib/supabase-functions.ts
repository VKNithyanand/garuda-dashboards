
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the URL for a Supabase Edge Function
 * @param functionName The name of the Edge Function
 * @returns The full URL to the Edge Function
 */
export const getFunctionUrl = (functionName: string): string => {
  const url = supabase.functions.url(functionName);
  if (typeof url !== 'string') {
    throw new Error(`Failed to get URL for function: ${functionName}`);
  }
  return url;
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
