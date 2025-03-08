
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No active session, redirect to auth page
          if (isMounted) {
            console.log("No session found, redirecting to auth");
            navigate('/auth');
          }
          return;
        }
        
        // Session exists, set user
        if (isMounted) {
          console.log("Session found, user:", session.user.email);
          setUser(session.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          navigate('/auth');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log("Auth state change:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user || null);
        }
      }
    );
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { user, loading };
};
