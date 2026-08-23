import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { signupAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account · Trace" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/home");
  return <AuthCard mode="signup" action={signupAction} />;
}
