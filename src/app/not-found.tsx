import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div
      className="grid"
      style={{ minHeight: "100vh", placeItems: "center", padding: "48px 20px", textAlign: "center" }}
    >
      <div>
        <div className="flex justify-center" style={{ marginBottom: 26 }}>
          <Logo height={24} />
        </div>
        <p className="t-num" style={{ fontSize: 56, color: "var(--accent-text)", marginBottom: 12 }}>
          404
        </p>
        <h1 className="t-display" style={{ fontSize: 20, marginBottom: 12 }}>
          Nothing here
        </h1>
        <p className="t-body" style={{ margin: "0 auto 24px", maxWidth: "40ch" }}>
          That page does not exist. It may have been a profile that was removed, or a link that
          was mistyped.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to TRACE
        </Link>
      </div>
    </div>
  );
}
