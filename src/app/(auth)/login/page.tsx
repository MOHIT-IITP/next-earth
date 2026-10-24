import { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/features/auth/auth-layout";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Earth",
  description: "Sign in to your Earth environmental observatory workspace",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Access your active territories, field observation logs, and biome archives."
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading workspace...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
