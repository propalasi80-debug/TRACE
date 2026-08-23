import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { loginAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log in · Trace" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/home");
  return <AuthCard mode="login" action={loginAction} />;
}
