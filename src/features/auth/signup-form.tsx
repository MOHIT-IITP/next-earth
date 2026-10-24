"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useAuth } from "./auth-context";

export function SignupForm() {
  const router = useRouter();
  const { signup, isLoading } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Please provide your full name.";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    const res = await signup(name, email, password);

    if (res.success && res.user) {
      toast.success("Account Created", {
        description: `Welcome to Earth, ${res.user.name}.`,
      });
      router.push("/dashboard");
    } else {
      setErrors({ general: res.error || "Unable to register. Please check details." });
      toast.error("Registration failed", {
        description: res.error || "Please try again.",
      });
    }
  };

  return (
    <div className="space-y-5">
      {errors.general && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-name" required>
            Full Name
          </Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-name"
              placeholder="e.g. Dr. Julian Thorne"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={!!errors.name}
              className="pl-9"
              autoComplete="name"
              autoFocus
            />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-email" required>
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-email"
              type="email"
              placeholder="julian.thorne@earth.org"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={!!errors.email}
              className="pl-9"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-password" required>
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={!!errors.password}
              className="pl-9 pr-10"
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm-password" required>
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="signup-confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              error={!!errors.confirmPassword}
              className="pl-9"
              autoComplete="new-password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground leading-normal">
          By signing up, you participate in Earth&apos;s open ecological research and conservation protocol.
        </p>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* GitHub Sign-In Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center opacity-60 cursor-not-allowed hover:bg-background"
          onClick={() =>
            toast.info("OAuth Provider Status", {
              description: "GitHub registration requires OAuth server setup in Phase 3.",
            })
          }
        >
          <Github className="mr-2 h-4 w-4" />
          <span>Sign up with GitHub</span>
          <Badge variant="muted" size="sm" className="ml-2 text-[10px] tracking-normal font-normal">
            Unavailable
          </Badge>
        </Button>
      </div>

      {/* Footer Link to Login */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Already registered with Earth?{" "}
        <Link
          href="/login"
          className="text-earth-terracotta font-medium hover:underline transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
