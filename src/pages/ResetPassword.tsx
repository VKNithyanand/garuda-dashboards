import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

interface ResetPasswordFormValues {
  email: string;
}

const ResetPassword: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send reset password email.",
        variant: "destructive",
      });
    } else {
      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Reset password email sent successfully!",
      });
    }
  };

  return (
    <div className="grid h-screen place-items-center">
      <Card className="w-[450px] p-4">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="text-center text-sm text-muted-foreground">
                We have sent a password reset link to your email address.
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit">Send Reset Link</Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link to="/auth" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
