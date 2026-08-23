"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export function AddFriend() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function submit() {
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
      setNote("Request sent.");
      setUsername("");
      router.refresh();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not send that request.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <Icon name="plus" size={15} />
        Add a friend
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2" style={{ minWidth: 300 }}>
      <div className="flex gap-2">
        <div className="field" style={{ flex: 1 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Their Trace username"
            autoFocus
          />
        </div>
        <button className="btn-primary" onClick={submit} disabled={busy || username.trim().length < 3}>
          {busy ? "…" : "Send"}
        </button>
      </div>
      {note && <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{note}</span>}
    </div>
  );
}

export function RequestActions({ friendshipId }: { friendshipId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function respond(action: "accept" | "ignore") {
    setBusy(true);
    await fetch(`/api/friends/${friendshipId}`, {
      method: action === "accept" ? "PATCH" : "DELETE",
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-[9px]">
      <button
        className="btn-primary"
        style={{ flex: 1, minHeight: 38, fontSize: 13 }}
        onClick={() => respond("accept")}
        disabled={busy}
      >
        Accept
      </button>
      <button
        className="btn-ghost"
        style={{ flex: 1, minHeight: 38 }}
        onClick={() => respond("ignore")}
        disabled={busy}
      >
        Ignore
      </button>
    </div>
  );
}
