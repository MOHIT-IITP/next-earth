import { Metadata } from "next";
import { AuthLayout } from "@/features/auth/auth-layout";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recover Password — Earth",
  description: "Reset your Earth account authentication credentials",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recover Access"
      subtitle="Enter the email associated with your observatory account to receive a reset authorization."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
