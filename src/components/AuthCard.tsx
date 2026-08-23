"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/actions/auth";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { PlatformMark } from "@/components/PlatformMark";
import { Notice } from "@/components/app/ui";

export function AuthCard({
  mode,
  action,
  notice,
}: {
  mode: "login" | "signup";
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const isSignup = mode === "signup";

  return (
    <div
      className="grid"
      style={{
        minHeight: "100vh",
        placeItems: "center",
        padding: "48px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 404 }}>
        <div className="flex justify-center" style={{ marginBottom: 28 }}>
          <Logo href="/" height={26} />
        </div>

        <h1 className="t-display" style={{ fontSize: 24, textAlign: "center", marginBottom: 8 }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p
          className="t-sm"
          style={{ textAlign: "center", margin: "0 0 28px" }}
        >
          {isSignup
            ? "One account, every platform you play on."
            : "Log in to pick up where you left off."}
        </p>

        <form action={formAction} className="card" style={{ padding: 24 }}>
          <a href="/api/auth/steam/start" className="btn btn-secondary" style={{ width: "100%" }}>
            <PlatformMark platform="steam" size={16} />
            Continue with Steam
          </a>

          <div className="flex items-center" style={{ gap: 12, margin: "20px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="t-label" style={{ fontSize: 9.5 }}>
              or
            </span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="display_name" className="t-label" style={{ display: "block", marginBottom: 7 }}>
                Display name
              </label>
              <div className="field">
                <span style={{ color: "var(--text-4)", display: "flex" }}>
                  <Icon name="user" size={15} />
                </span>
                <input
                  id="display_name"
                  name="display_name"
                  placeholder="How you want to appear"
                  autoComplete="nickname"
                  maxLength={40}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" className="t-label" style={{ display: "block", marginBottom: 7 }}>
              Email
            </label>
            <div className="field">
              <span style={{ color: "var(--text-4)", display: "flex" }}>
                <Icon name="mail" size={15} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 7 }}>
              <label htmlFor="password" className="t-label">
                Password
              </label>
              <span style={{ fontSize: 11.5, color: "var(--text-4)" }}>8 characters minimum</span>
            </div>
            <div className="field">
              <span style={{ color: "var(--text-4)", display: "flex" }}>
                <Icon name="lock" size={15} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Your password"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>
          </div>

          {(state.error || notice) && (
            <div style={{ marginBottom: 16 }}>
              <Notice kind={state.error ? "bad" : "info"}>{state.error ?? notice}</Notice>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={pending}>
            {pending ? "Working" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="t-sm" style={{ textAlign: "center", margin: "20px 0 0" }}>
          {isSignup ? (
            <>
              Already have an account? <Link href="/login">Log in</Link>
            </>
          ) : (
            <>
              No account yet? <Link href="/signup">Create one</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
