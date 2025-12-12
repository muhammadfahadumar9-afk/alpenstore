import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";

const RESEND_COOLDOWN = 60; // seconds

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must include a lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must include an uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must include a number";
    }
    if (!/[@$!%*?&]/.test(password)) {
      return "Password must include a symbol (@$!%*?&)";
    }
    return null;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Reset link sent!",
          description: "Check your email for the password reset link.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    if (isResend) {
      setResending(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send OTP",
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        setCountdown(RESEND_COOLDOWN);
        setOtp("");
        toast({
          title: isResend ? "OTP Resent!" : "OTP Sent!",
          description: "Check your phone for the verification code.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setResending(false);
    }
  };

  const handleResendOtp = () => {
    handleSendOtp(undefined, true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({
        title: "Weak password",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, otp, newPassword },
      });

      if (error || (data && data.error)) {
        toast({
          title: "Error",
          description: data?.error || error?.message || "Failed to verify OTP",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset!",
          description: "Your password has been updated successfully.",
        });
        navigate("/auth");
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Forgot Password</CardTitle>
            <CardDescription>
              Choose how you'd like to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={resetMethod} onValueChange={(v) => setResetMethod(v as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                {emailSent ? (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        We've sent a password reset link to:
                      </p>
                      <p className="font-medium">{email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button 
                        onClick={() => setEmailSent(false)} 
                        className="text-primary hover:underline"
                      >
                        try again
                      </button>
                    </p>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link 
                        to="/auth" 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                      </Link>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="phone">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="e.g., 09168877858"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the phone number linked to your account
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send OTP Code"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link 
                        to="/auth" 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                      </Link>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Enter OTP Code</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Code sent to {phone}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Min 8 chars, uppercase, lowercase, number & symbol
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>

                    <div className="text-center space-y-2">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || resending}
                        className="text-sm"
                      >
                        {resending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resending...
                          </>
                        ) : countdown > 0 ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend in {countdown}s
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend OTP
                          </>
                        )}
                      </Button>
                      <div>
                        <button 
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setNewPassword("");
                            setConfirmPassword("");
                            setCountdown(0);
                          }} 
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          Use a different phone number
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
