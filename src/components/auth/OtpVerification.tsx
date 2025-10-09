import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ChefHat, Shield, Timer } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { otpVerification } from '@/api/auth.api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const OTPVerificationForm = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get email from navigation state (passed from login/signup) and normalize it to a string
  const rawEmail = (location as any)?.state?.email;
  const email: string = typeof rawEmail === "string"
    ? rawEmail
    : (rawEmail && typeof rawEmail === "object" && typeof (rawEmail as any).email === "string"
        ? (rawEmail as any).email
        : "");



  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const { mutate: verifyOTP, isPending } = useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: otpVerification,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          variant: "default",
          title: "OTP Verified successfully",
          description: "Please reset your password.",
        });
        navigate("/reset-password", {
          state: { 
            email: email,
          } 
        });
      } else {
        toast({
          variant: "destructive",
          title: "OTP Verified failes",
          description: "Please Enter valid OTP.",
        });
      }
    },
    onError: (error) => {
      console.error('OTP verification error:', error);
      setError(error.message === ("invalid OTP") && "OTP is not valid" || 'Verification failed. Please try again.');
    }
  });

//   const { mutate: resendOTPCode, isPending: isResending } = useMutation({
//     mutationKey: ['resend-otp'],
//     mutationFn: resendOTP,
//     onSuccess: (data) => {
//       if (data.success) {
//         setTimeLeft(300); // Reset timer
//         setCanResend(false);
//         setError('');
//         setOtp(['', '', '', '', '', '']); // Clear current OTP
//         // Focus first input
//         inputRefs.current[0]?.focus();
//       } else {
//         setError(data.message || 'Failed to resend OTP');
//       }
//     },
//     onError: (error) => {
//       setError(error.message || 'Failed to resend OTP. Please try again.');
//     }
//   });

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);
    setError(''); // Clear error on input

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < digits.length; i++) {
          if (i < 6) newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    const userData = {
        email, 
        otp: otpString
    }

    verifyOTP(userData);
  };

//   const handleResendOTP = () => {
//     if (canResend && !isResending) {
//       resendOTPCode({ email });
//     }
//   };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-gradient-primary p-3 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Verify Your Account</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
          {email && (
            <p className="text-sm text-primary font-medium">{email}</p>
          )}
        </div>

        {/* OTP Form */}
        <Card className="shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Enter OTP</CardTitle>
            <CardDescription className="text-center">
              Please check your email for the verification code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* OTP Input Fields */}
              <div className="space-y-2">
                <Label className="text-center block">Verification Code</Label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-bold border-2 focus:border-primary"
                      disabled={isPending}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-4 w-4" />
                  <span>
                    {timeLeft > 0 
                      ? `Code expires in ${formatTime(timeLeft)}` 
                      : 'Code expired'
                    }
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending || otp.some(digit => !digit)}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>

              {/* Resend OTP */}
              {/* <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  className={`text-sm font-medium transition-colors ${
                    canResend && !isResending
                      ? 'text-primary hover:underline cursor-pointer'
                      : 'text-muted-foreground cursor-not-allowed'
                  }`}
                  onClick={handleResendOTP}
                  disabled={!canResend || isResending || isPending}
                >
                  {isResending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div> */}

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => navigate("/login")}
                  disabled={isPending}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Demo Mode</p>
              <p className="text-xs text-muted-foreground">
                In demo mode, use any 6-digit code (e.g., 123456)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};