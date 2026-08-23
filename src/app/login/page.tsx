import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { loginAction } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/home");
  const { error } = await searchParams;
  return <AuthCard mode="login" action={loginAction} notice={error} />;
}
