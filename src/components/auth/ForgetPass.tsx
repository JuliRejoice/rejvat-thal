import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ChefHat, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { forgetPassword } from '@/api/auth.api';
import { useLocation, useNavigate } from 'react-router-dom';

export const ForgetPassForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const { mutate: forgetPass, isPending,data } = useMutation({
    mutationKey: ['forget-password'],
    mutationFn: forgetPassword,
    onSuccess: (data) => {
      
      if (data.success) {
        return navigate("/otp-verification", { 
            state: { 
                email: email,
            } 
        }); 
      } else {
        setError(data.message || 'forget-password failed');
      }
    },
    onError: (error) => {
      console.error('forget-password error:', error);
      setError(error.message || 'forget-password failed. Please try again.');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    forgetPass(email);
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@restaurant.com', password: 'password' },
    { role: 'Manager', email: 'manager@restaurant.com', password: 'password' },
    { role: 'Staff', email: 'staff@restaurant.com', password: 'password' }
  ];

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

        {/* Forget-password Form */}
        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Forget Password</CardTitle>
            <CardDescription className="text-center">
            Enter your email to receive a OTP for resetting your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isPending}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
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
      </div>
    </div>
  );
};