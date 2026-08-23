"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { PlatformMark } from "@/components/PlatformMark";
import { Notice } from "@/components/app/ui";
import { MARQUEE_ORDER, PLATFORM_BRANDS } from "@/lib/platforms/registry";
import { PLATFORM_META, type Platform, type PlatformAccountRow } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const HELP: Record<
  Exclude<Platform, "steam">,
  { intro: string; steps: string[]; link: { href: string; label: string }; placeholder: string }
> = {
  psn: {
    intro: "PlayStation has no public API, so TRACE uses your own session token.",
    steps: [
      "Log in at playstation.com in this browser.",
      "Open the link below. It returns a small piece of JSON.",
      "Copy the value of npsso and paste it here.",
    ],
    link: {
      href: "https://ca.account.sony.com/api/v1/ssocookie",
      label: "Get your NPSSO token",
    },
    placeholder: "Paste your NPSSO token",
  },
  xbox: {
    intro: "Xbox has no public API either, so TRACE reads through OpenXBL.",
    steps: [
      "Sign in at xbl.io with your Microsoft account.",
      "Copy the API key it shows you. The free tier is enough.",
      "Paste it here.",
    ],
    link: { href: "https://xbl.io/", label: "Get an OpenXBL key" },
    placeholder: "Paste your OpenXBL API key",
  },
};

export function Connections({ accounts }: { accounts: PlatformAccountRow[] }) {
  const router = useRouter();
  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));

  const [open, setOpen] = useState<Platform | null>(null);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  async function link(platform: Exclude<Platform, "steam">) {
    setBusy(`link-${platform}`);
    setNote(null);
    try {
      const body = platform === "psn" ? { npsso: secret.trim() } : { apiKey: secret.trim() };
      const res = await fetch(`/api/connections/${platform}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; handle?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not connect that account.");
      setNote({ kind: "ok", text: `Connected as ${data.handle}. Run a sync to pull your library.` });
      setSecret("");
      setOpen(null);
      refresh();
    } catch (err) {
      setNote({ kind: "bad", text: err instanceof Error ? err.message : "Could not connect." });
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(platform: Platform) {
    const label = PLATFORM_META[platform].label;
    if (!window.confirm(`Disconnect ${label}? Games and achievements from it will be removed.`)) {
      return;
    }
    setBusy(`off-${platform}`);
    setNote(null);
    try {
      const res = await fetch(`/api/connections/${platform}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not disconnect that account.");
      setNote({ kind: "ok", text: `${label} disconnected.` });
      refresh();
    } catch (err) {
      setNote({ kind: "bad", text: err instanceof Error ? err.message : "Could not disconnect." });
    } finally {
      setBusy(null);
    }
  }

  async function sync(platform: Platform) {
    setBusy(`sync-${platform}`);
    setNote(null);
    try {
      const res = await fetch(`/api/sync/${platform}`, { method: "POST" });
      const data = (await res.json()) as { error?: string; message?: string; remaining?: number };
      if (!res.ok) throw new Error(data.error ?? "Sync failed.");
      setNote({ kind: "ok", text: data.message ?? "Synced." });
      refresh();
    } catch (err) {
      setNote({ kind: "bad", text: err instanceof Error ? err.message : "Sync failed." });
    } finally {
      setBusy(null);
    }
  }

  const live: Platform[] = ["steam", "psn", "xbox"];
  const upcoming = MARQUEE_ORDER.filter((k) => !PLATFORM_BRANDS[k].live);

  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 className="t-label" style={{ marginBottom: 18 }}>
        Connected platforms
      </h2>

      {note && (
        <div style={{ marginBottom: 16 }}>
          <Notice kind={note.kind}>{note.text}</Notice>
        </div>
      )}

      <div className="stack">
        {live.map((p) => {
          const account = byPlatform.get(p);
          const meta = PLATFORM_META[p];
          const help = p === "steam" ? null : HELP[p];
          const isOpen = open === p;

          return (
            <div key={p} style={{ padding: "16px 0", borderTop: "1px solid var(--line)" }}>
              <div className="flex items-center flex-wrap" style={{ gap: 14 }}>
                <span
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--r-sm)",
                    background: "var(--surface-3)",
                    border: "1px solid var(--line)",
                    flex: "none",
                  }}
                >
                  <PlatformMark platform={p} size={18} />
                </span>

                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{meta.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-4)" }}>
                    {account
                      ? `${account.handle ?? "Connected"} · synced ${timeAgo(account.last_synced_at)}`
                      : "Not connected"}
                  </div>
                </div>

                {account ? (
                  <div className="flex" style={{ gap: 8 }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => sync(p)}
                      disabled={busy !== null}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          animation:
                            busy === `sync-${p}` ? "trace-spin 0.9s linear infinite" : undefined,
                        }}
                      >
                        <Icon name="refresh" size={14} />
                      </span>
                      {busy === `sync-${p}` ? "Syncing" : "Sync"}
                    </button>
                    <button
                      className="btn btn-sm btn-quiet"
                      onClick={() => disconnect(p)}
                      disabled={busy !== null}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : p === "steam" ? (
                  <a href="/api/auth/steam/start" className="btn btn-sm btn-primary">
                    Connect
                  </a>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setSecret("");
                      setOpen(isOpen ? null : p);
                    }}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? "Cancel" : "Connect"}
                  </button>
                )}
              </div>

              {account?.sync_error && (
                <p style={{ fontSize: 12.5, color: "var(--bad)", margin: "10px 0 0" }}>
                  Last sync failed. {account.sync_error}
                </p>
              )}

              {isOpen && help && (
                <div
                  className="tile"
                  style={{ marginTop: 14, padding: 18, background: "var(--surface-2)" }}
                >
                  <p className="t-sm" style={{ margin: "0 0 12px" }}>
                    {help.intro}
                  </p>
                  <ol
                    className="t-sm"
                    style={{ margin: "0 0 14px", paddingLeft: 18, display: "grid", gap: 4 }}
                  >
                    {help.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <a
                    href={help.link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-sm btn-quiet"
                    style={{ marginBottom: 14 }}
                  >
                    {help.link.label}
                    <Icon name="external" size={13} />
                  </a>
                  <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
                    <div className="field" style={{ flex: 1, minWidth: 220 }}>
                      <input
                        type="password"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder={help.placeholder}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => link(p as Exclude<Platform, "steam">)}
                      disabled={busy !== null || secret.trim().length < 20}
                    >
                      {busy === `link-${p}` ? "Checking" : "Link account"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
        <h3 className="t-label" style={{ marginBottom: 12 }}>
          Not available yet
        </h3>
        <p className="t-sm" style={{ margin: "0 0 14px", maxWidth: "62ch" }}>
          None of these expose a public API for reading your library, so TRACE cannot connect
          to them honestly. They are listed here so you know they are on the roadmap rather
          than missing by accident.
        </p>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {upcoming.map((k) => (
            <span key={k} className="chip" style={{ opacity: 0.72, cursor: "default" }}>
              <PlatformMark platform={k} size={13} />
              {PLATFORM_BRANDS[k].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
