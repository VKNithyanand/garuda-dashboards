
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Just redirect to dashboard immediately
    navigate("/");
    
    // Optional: Show a toast to inform the user
    toast({
      title: "Welcome!",
      description: "You've been redirected to the dashboard.",
    });
  }, [navigate, toast]);

  // Return null as we're just redirecting
  return null;
};

export default Auth;
