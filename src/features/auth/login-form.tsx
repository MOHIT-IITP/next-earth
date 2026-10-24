"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Github, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useAuth } from "./auth-context";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, isLoading } = useAuth();

  const [email, setEmail] = React.useState("elena.rostova@earth.org");
  const [password, setPassword] = React.useState("password123");
  const [showPassword, setShowPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<{ email?: string; password?: string; general?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    const res = await login(email, password);

    if (res.success && res.user) {
      toast.success("Welcome back", {
        description: `Signed in as ${res.user.name} (${res.user.role}).`,
      });
      router.push(redirectPath);
    } else {
      setErrors({ general: res.error || "Authentication failed. Please verify credentials." });
      toast.error("Sign-in failed", {
        description: res.error || "Please check your credentials.",
      });
    }
  };

  const handleFillDemo = () => {
    setEmail("elena.rostova@earth.org");
    setPassword("password123");
    setErrors({});
    toast.info("Demo credentials populated", {
      description: "Dr. Elena Rostova (Lead Field Ecologist)",
    });
  };

  return (
    <div className="space-y-5">
      {/* Optional demo fill banner */}
      <div className="flex items-center justify-between rounded-lg border border-earth-terracotta/20 bg-earth-terracotta-light/40 p-2.5 text-xs text-earth-terracotta-dark dark:bg-earth-terracotta-light/10 dark:text-earth-terracotta">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>Demo Account available</span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="font-medium underline hover:opacity-80 transition-opacity"
        >
          Auto-fill
        </button>
      </div>

      {errors.general && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email" required>
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@earth.org"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={!!errors.email}
              className="pl-9"
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" required>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-earth-terracotta hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={!!errors.password}
              className="pl-9 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Earth</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* GitHub Sign-In Button (Clearly labeled as unavailable until configured) */}
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center relative cursor-not-allowed opacity-60 hover:bg-background"
          onClick={() =>
            toast.info("OAuth Provider Status", {
              description: "GitHub OAuth is disabled until server client credentials are configured in Phase 3.",
            })
          }
        >
          <Github className="mr-2 h-4 w-4" />
          <span>Sign In with GitHub</span>
          <Badge variant="muted" size="sm" className="ml-2 text-[10px] tracking-normal font-normal">
            Unavailable
          </Badge>
        </Button>
        <p className="text-[10px] text-center text-muted-foreground">
          OAuth requires environment variables (Earth Phase 3)
        </p>
      </div>

      {/* Footer Link to Signup */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Do not have an account?{" "}
        <Link
          href="/signup"
          className="text-earth-terracotta font-medium hover:underline transition-colors"
        >
          Create an Earth account
        </Link>
      </div>
    </div>
  );
}
