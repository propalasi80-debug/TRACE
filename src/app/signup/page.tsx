import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { signupAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/home");
  const { error } = await searchParams;
  return <AuthCard mode="signup" action={signupAction} notice={error} />;
}
