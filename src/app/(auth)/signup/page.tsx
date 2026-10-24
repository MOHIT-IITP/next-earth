import { Metadata } from "next";
import { AuthLayout } from "@/features/auth/auth-layout";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account — Earth",
  description: "Join the Earth ecological observatory consortium",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create Earth Account"
      subtitle="Register as an environmental researcher, field contributor, or biosphere observer."
    >
      <SignupForm />
    </AuthLayout>
  );
}
