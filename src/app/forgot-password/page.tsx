import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/field";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function Forgot() {
  return <AuthShell title="Reset your password" subtitle="Enter your email and we'll generate a reset link."><ForgotForm /></AuthShell>;
}
