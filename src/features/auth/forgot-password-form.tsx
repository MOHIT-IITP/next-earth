"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { useAuth } from "./auth-context";

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please provide your account email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await resetPassword(trimmed);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      toast.success("Recovery Instructions Dispatched", {
        description: `Reset link forwarded to ${trimmed}.`,
      });
    } else {
      setError(res.error || "Unable to process password reset.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center py-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-earth-olive-light text-earth-olive-dark dark:bg-earth-olive-light/20 dark:text-earth-olive">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-normal text-foreground">
            Check Your Transmission Box
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We sent a secure password recovery authorization link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          Mock Authentication: In this frontend preview, recovery emails are simulated.
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full"
          >
            Try another email address
          </Button>
          <Button asChild className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email" required>
            Registered Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="elena.rostova@earth.org"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              error={!!error}
              className="pl-9"
              autoComplete="email"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Sending Link...</span>
          ) : (
            <>
              <span>Send Recovery Link</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center text-earth-terracotta hover:underline transition-colors"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to sign in
        </Link>
        <Link
          href="/signup"
          className="hover:underline transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
