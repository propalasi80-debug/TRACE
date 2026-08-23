"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import type { FormState } from "@/actions/auth";
import { Icon } from "@/components/Icon";

export function AuthCard({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (prev: FormState, data: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const isSignup = mode === "signup";

  return (
    <div
      className="grid place-items-center"
      style={{ minHeight: "100vh", padding: "56px 20px", background: "var(--bg)" }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        <Link
          href="/"
          className="flex items-center justify-center gap-[14px]"
          style={{ marginBottom: 26, color: "var(--text)" }}
        >
          <Image
            src="/assets/trace-mark.png"
            alt="Trace"
            width={44}
            height={30}
            style={{ height: 30, width: "auto" }}
            priority
          />
          <span
            className="font-display font-bold uppercase"
            style={{ fontSize: 22, letterSpacing: ".3em" }}
          >
            Trace
          </span>
        </Link>

        <h1
          className="font-display font-bold text-center"
          style={{ fontSize: 34, letterSpacing: ".02em", margin: "0 0 8px" }}
        >
          {isSignup ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-center" style={{ fontSize: 14.5, color: "var(--text-3)", margin: "0 0 34px" }}>
          {isSignup ? "Start tracing your gaming history" : "Log in to your account"}
        </p>

        <form action={formAction} className="card" style={{ padding: 26 }}>
          <a href="/api/auth/steam/start" className="btn-ghost" style={{ width: "100%", height: 46 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#66C0F4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8M3 15.6l4.4 1.8M16.4 6.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2M13.9 12.6a3 3 0 1 1-5.6 2.2 3 3 0 0 1 5.6-2.2" />
            </svg>
            Continue with Steam
          </a>

          <div className="flex items-center gap-[14px]" style={{ margin: "22px 0" }}>
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,.09)" }} />
            <span style={{ fontSize: 10.5, letterSpacing: ".2em", color: "var(--text-4)" }}>OR</span>
            <span className="flex-1 h-px" style={{ background: "rgba(255,255,255,.09)" }} />
          </div>

          {isSignup && (
            <>
              <label htmlFor="display_name" className="block" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Display name
              </label>
              <div className="field" style={{ marginBottom: 18 }}>
                <span style={{ color: "rgba(245,246,247,.5)" }}>
                  <Icon name="user" size={16} />
                </span>
                <input id="display_name" name="display_name" placeholder="NEXUS_PRIME" autoComplete="nickname" />
              </div>
            </>
          )}

          <label htmlFor="email" className="block" style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Email
          </label>
          <div className="field" style={{ marginBottom: 18 }}>
            <span style={{ color: "rgba(245,246,247,.5)" }}>
              <Icon name="mail" size={16} />
            </span>
            <input id="email" name="email" type="email" required placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className="flex justify-between items-baseline" style={{ marginBottom: 8 }}>
            <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600 }}>
              Password
            </label>
            {!isSignup && (
              <span style={{ fontSize: 12.5, color: "var(--text-4)" }}>Min. 8 characters</span>
            )}
          </div>
          <div className="field" style={{ marginBottom: 22 }}>
            <span style={{ color: "rgba(245,246,247,.5)" }}>
              <Icon name="lock" size={16} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              style={{ letterSpacing: ".18em" }}
            />
          </div>

          {state.error && (
            <p
              role="alert"
              style={{
                fontSize: 13,
                color: "var(--danger)",
                background: "rgba(255,90,90,.08)",
                border: "1px solid rgba(255,90,90,.25)",
                borderRadius: 8,
                padding: "10px 12px",
                margin: "0 0 16px",
              }}
            >
              {state.error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ width: "100%", height: 46 }} disabled={pending}>
            {pending ? "Working…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="text-center" style={{ fontSize: 13.5, color: "var(--text-3)", margin: "24px 0 0" }}>
          {isSignup ? (
            <>
              Already have an account? <Link href="/login" style={{ fontWeight: 700 }}>Log in</Link>
            </>
          ) : (
            <>
              Don&apos;t have an account? <Link href="/signup" style={{ fontWeight: 700 }}>Create one</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
