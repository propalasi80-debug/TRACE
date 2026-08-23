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
      style={{
        display: "grid",
        gridTemplateColumns: "var(--sidebar-w) minmax(0, 1fr)",
        minHeight: "100vh",
      }}
    >
      <Sidebar />
      <main
        data-main
        style={{
          position: "relative",
          padding: "32px var(--shell-pad-x) 72px",
          maxWidth: "var(--page-max)",
          width: "100%",
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
