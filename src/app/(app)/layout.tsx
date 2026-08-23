import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/Sidebar";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div
      data-shell
      className="grid"
      style={{ gridTemplateColumns: "236px minmax(0,1fr)", minHeight: "100vh" }}
    >
      <Sidebar />
      <main data-main style={{ padding: "36px 44px 64px", maxWidth: 1500 }}>{children}</main>
    </div>
  );
}
