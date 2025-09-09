import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ChefHat, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/api/auth.api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

type FormValues = {
  password: string;
  confirmPassword: string;
};

export const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: resetPass, isPending } = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: resetPassword,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          variant: "default",
          title: "Password Reset successfully.",
          description: "Please login with your new password.",
        });
        navigate("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Password",
          description: data.message || "Password reset failed",
        })
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Password",
        description: error.message || "Password reset failed. Please try again.",
      })
    },
  });

  const onSubmit = (values: FormValues) => {
    resetPass({
      email,
      password: values.password,
    });
  };

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Restaurant Manager</h1>
          <p className="text-muted-foreground">Manage your restaurant operations efficiently</p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email and create a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...register("password", {
                      required: "Please enter a new password",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    })}
                    className="pl-10 pr-10 mb-1"
                    disabled={isPending}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    className="pl-10 pr-10 mb-1"
                    disabled={isPending}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isPending}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => navigate("/login")}
                  disabled={isPending}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Note */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Security Note</p>
              <p className="text-xs text-muted-foreground">
                Make sure to use a strong password with a mix of letters, numbers, and symbols
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};