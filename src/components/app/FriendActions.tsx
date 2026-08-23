"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export function AddFriend() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send that request.");
      setNote({ ok: true, text: "Request sent." });
      setUsername("");
      router.refresh();
    } catch (err) {
      setNote({ ok: false, text: err instanceof Error ? err.message : "Could not send that request." });
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <Icon name="plus" size={14} />
        Add a friend
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="stack" style={{ gap: 8, minWidth: 280 }}>
      <div className="flex" style={{ gap: 8 }}>
        <div className="field" style={{ flex: 1 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Their TRACE username"
            aria-label="Friend's username"
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || username.trim().length < 3}>
          {busy ? "Sending" : "Send"}
        </button>
      </div>
      {note && (
        <span style={{ fontSize: 12.5, color: note.ok ? "var(--ok)" : "var(--bad)" }}>
          {note.text}
        </span>
      )}
    </form>
  );
}

export function RequestActions({ friendshipId }: { friendshipId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function respond(action: "accept" | "ignore") {
    setBusy(action);
    await fetch(`/api/friends/${friendshipId}`, {
      method: action === "accept" ? "PATCH" : "DELETE",
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="flex" style={{ gap: 8 }}>
      <button
        className="btn btn-primary btn-sm"
        style={{ flex: 1 }}
        onClick={() => respond("accept")}
        disabled={busy !== null}
      >
        {busy === "accept" ? "Accepting" : "Accept"}
      </button>
      <button
        className="btn btn-quiet btn-sm"
        style={{ flex: 1 }}
        onClick={() => respond("ignore")}
        disabled={busy !== null}
      >
        Ignore
      </button>
    </div>
  );
}
