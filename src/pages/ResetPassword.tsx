
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setSubmitted(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Colorful gradient top bar */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-purple via-brand-blue to-brand-green z-50"></div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            {!submitted 
              ? "Enter your email and we'll send you a link to reset your password" 
              : "Check your email for the reset link"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-r-transparent" />
                    Sending reset link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mb-4 bg-green-100 text-green-800 p-3 rounded-md">
                We've sent a password reset link to <strong>{email}</strong>. Please check your
                email and follow the instructions to reset your password.
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
                className="mt-2"
              >
                Return to login
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/auth")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
