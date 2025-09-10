import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { forgetPassword } from '@/api/auth.api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from "@/components/ui/use-toast";
import Logo from '../../asset/img/logo.png'

export const ForgetPassForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({ defaultValues: { email: "", } });
  const { mutate: forgetPass, isPending } = useMutation({
    mutationKey: ['forget-password'],
    mutationFn: forgetPassword,
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: 'OTP',
          description: 'OTP send successfully',
        });
        reset()
        return navigate("/otp-verification", {
          state: { email: variables, }
        });
      } else {
        toast({
          variant: "destructive",
          title: "Forget password failed",
          description: data.message || "Something went wrong.",
        });
      }
    },
    onError: (error) => {
      const errorMsg = error.message === "Not found." ? "Email is not found" : error.message;
      toast({
        variant: "destructive",
        title: "Forget password failed",
        description: errorMsg || "forget-password failed. Please try again.",
      });
    }
  });

  const onSubmit = ({ email }) => {
    forgetPass({ email })
  }

  const demoCredentials = [
    { role: 'Admin', email: 'admin@restaurant.com', password: 'password' },
    { role: 'Manager', email: 'manager@restaurant.com', password: 'password' },
    { role: 'Staff', email: 'staff@restaurant.com', password: 'password' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Forget-password Form */}
        <Card className="shadow-card">
          <CardHeader className="space-y-1 pb-0">
            <div className="flex justify-center mb-3">
              <img src={Logo} alt='' className='w-52' />
            </div>
            <CardTitle className="text-2xl text-center">Forget Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address",
                      },
                      onChange: (e) => setValue("email", e.target.value.toLowerCase()),
                    })}
                    className={`pl-10 ${errors.email && "border-red-500"}`}
                    disabled={isPending}
                  />

                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
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