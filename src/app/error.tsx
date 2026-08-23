"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[trace]", error);
  }, [error]);

  const missingConfig = /DATABASE_URL|does not exist|ENCRYPTION_KEY/i.test(error.message);

  return (
    <div
      className="grid"
      style={{ minHeight: "100vh", placeItems: "center", padding: "48px 20px" }}
    >
      <div className="card" style={{ padding: 32, maxWidth: 520, textAlign: "center" }}>
        <h1 className="t-display" style={{ fontSize: 22, marginBottom: 12 }}>
          Something broke
        </h1>
        <p className="t-body" style={{ margin: "0 0 20px" }}>
          {missingConfig
            ? "The server is missing a piece of configuration, so this page cannot load. If you run this deployment, check that DATABASE_URL and ENCRYPTION_KEY are set and that the migration has run."
            : "That page failed to load. Trying again usually clears it."}
        </p>
        <div className="flex justify-center flex-wrap" style={{ gap: 10 }}>
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/home" className="btn btn-secondary">
            Back to home
          </Link>
        </div>
        {error.digest && (
          <p className="t-sm" style={{ marginTop: 18, fontSize: 11.5 }}>
            Reference {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
