"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { PLATFORM_META, type Platform, type PlatformAccountRow } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const HELP: Record<Platform, { how: string; link?: { href: string; label: string } }> = {
  steam: {
    how: "Sign in through Steam — Trace never sees your password. Your profile and game details must be set to Public for the library to come through.",
    link: { href: "https://steamcommunity.com/my/edit/settings", label: "Steam privacy settings" },
  },
  psn: {
    how: "Log in to the PlayStation site, then open the SSO endpoint below and copy the npsso value it returns. It expires roughly every two months.",
    link: { href: "https://ca.account.sony.com/api/v1/ssocookie", label: "Get your NPSSO token" },
  },
  xbox: {
    how: "Xbox has no public API, so Trace uses OpenXBL. Sign in there with your Microsoft account and paste the API key it gives you — the free tier is enough.",
    link: { href: "https://xbl.io/", label: "Get an OpenXBL key" },
  },
};

interface Props {
  accounts: PlatformAccountRow[];
}

export function Connections({ accounts }: Props) {
  const router = useRouter();
  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));
  const [open, setOpen] = useState<Platform | null>(null);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  async function connect(platform: Platform) {
    setBusy(`connect-${platform}`);
    setNote(null);
    try {
      const body = platform === "psn" ? { npsso: secret.trim() } : { apiKey: secret.trim() };
      const res = await fetch(`/api/connections/${platform}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; handle?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not connect.");
      setNote({ kind: "ok", text: `Connected as ${data.handle}. Run a sync to pull your library.` });
      setSecret("");
      setOpen(null);
      refresh();
    } catch (err) {
      setNote({ kind: "err", text: err instanceof Error ? err.message : "Could not connect." });
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(platform: Platform) {
    setBusy(`dc-${platform}`);
    setNote(null);
    try {
      const res = await fetch(`/api/connections/${platform}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not disconnect.");
      setNote({ kind: "ok", text: `${PLATFORM_META[platform].label} disconnected.` });
      refresh();
    } catch (err) {
      setNote({ kind: "err", text: err instanceof Error ? err.message : "Could not disconnect." });
    } finally {
      setBusy(null);
    }
  }

  async function sync(platform: Platform) {
    setBusy(`sync-${platform}`);
    setNote(null);
    try {
      const res = await fetch(`/api/sync/${platform}`, { method: "POST" });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? "Sync failed.");
      setNote({ kind: "ok", text: data.message ?? "Synced." });
      refresh();
    } catch (err) {
      setNote({ kind: "err", text: err instanceof Error ? err.message : "Sync failed." });
    } finally {
      setBusy(null);
    }
  }

  const platforms: Platform[] = ["steam", "psn", "xbox"];
  const soon = ["Epic Games", "Nintendo", "GOG", "Battle.net", "Riot", "itch.io"];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Connected platforms
      </div>

      {note && (
        <p
          role="status"
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: note.kind === "ok" ? "var(--success)" : "var(--danger)",
            background: note.kind === "ok" ? "rgba(63,191,127,.08)" : "rgba(255,90,90,.08)",
            border: `1px solid ${note.kind === "ok" ? "rgba(63,191,127,.25)" : "rgba(255,90,90,.25)"}`,
            borderRadius: 8,
            padding: "10px 12px",
            margin: "0 0 16px",
          }}
        >
          {note.text}
        </p>
      )}

      <div className="flex flex-col">
        {platforms.map((p) => {
          const acct = byPlatform.get(p);
          const meta = PLATFORM_META[p];
          const help = HELP[p];
          return (
            <div key={p} style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <div className="flex items-center gap-4">
                <div
                  className="grid place-items-center font-display font-bold"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: "var(--surface-4)",
                    flex: "none",
                    fontSize: 11,
                    letterSpacing: ".06em",
                  }}
                >
                  <span className={meta.text}>{meta.short}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{meta.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-4)" }}>
                    {acct
                      ? `${acct.handle ?? "Connected"} · synced ${timeAgo(acct.last_synced_at)}`
                      : "Not connected"}
                  </div>
                </div>
                {acct ? (
                  <div className="flex gap-2">
                    <button
                      className="btn-ghost"
                      style={{ minHeight: 36 }}
                      onClick={() => sync(p)}
                      disabled={busy !== null}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          animation: busy === `sync-${p}` ? "gvspin 1s linear infinite" : undefined,
                        }}
                      >
                        <Icon name="refresh" size={14} />
                      </span>
                      {busy === `sync-${p}` ? "Syncing…" : "Sync"}
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ minHeight: 36, background: "none", color: "var(--text-2)" }}
                      onClick={() => disconnect(p)}
                      disabled={busy !== null}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : p === "steam" ? (
                  // Full navigation: Steam's OpenID flow leaves the app.
                  <a className="btn-primary" href="/api/auth/steam/start" style={{ minHeight: 36, fontSize: 12.5 }}>
                    Connect
                  </a>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ minHeight: 36, fontSize: 12.5 }}
                    onClick={() => setOpen(open === p ? null : p)}
                    disabled={busy !== null}
                  >
                    Connect
                  </button>
                )}
              </div>

              {acct?.sync_error && (
                <p style={{ fontSize: 12, color: "var(--danger)", margin: "8px 0 0" }}>
                  Last sync failed: {acct.sync_error}
                </p>
              )}

              {open === p && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 16,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                  }}
                >
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-2)", margin: "0 0 12px" }}>
                    {help.how}
                  </p>
                  {help.link && (
                    <a
                      href={help.link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontSize: 12.5, fontWeight: 600, display: "inline-block", marginBottom: 12 }}
                    >
                      {help.link.label} ↗
                    </a>
                  )}
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="field" style={{ flex: 1, minWidth: 240 }}>
                      <input
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder={p === "psn" ? "Paste your NPSSO token" : "Paste your OpenXBL API key"}
                        autoComplete="off"
                      />
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => connect(p)}
                      disabled={busy !== null || secret.trim().length < 20}
                    >
                      {busy === `connect-${p}` ? "Checking…" : "Link account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {soon.map((name) => (
          <div
            key={name}
            className="flex items-center gap-4"
            style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.06)", opacity: 0.5 }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface-4)", flex: "none" }} />
            <div className="flex-1">
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, color: "var(--text-4)" }}>No public API yet — on the roadmap</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-4)" }}>Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
