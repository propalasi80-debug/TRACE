"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/actions/auth";

export function ProfileForm({
  displayName,
  bio,
  isPublic,
  username,
}: {
  displayName: string;
  bio: string | null;
  isPublic: boolean;
  username: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});

  return (
    <form action={action} className="card" style={{ padding: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Profile &amp; privacy
      </div>

      <label htmlFor="display_name" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
        Display name
      </label>
      <div className="field" style={{ marginBottom: 18 }}>
        <input id="display_name" name="display_name" defaultValue={displayName} maxLength={40} />
      </div>

      <label htmlFor="bio" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
        Bio
      </label>
      <textarea
        id="bio"
        name="bio"
        defaultValue={bio ?? ""}
        rows={3}
        maxLength={280}
        placeholder="Slow with a new game, obsessive by hour twenty."
        style={{
          width: "100%",
          background: "var(--input-bg)",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 9,
          color: "var(--text)",
          fontSize: 14,
          padding: "12px 14px",
          outline: "none",
          resize: "vertical",
          marginBottom: 18,
        }}
      />

      <label
        className="flex items-center gap-3"
        style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}
      >
        <input type="checkbox" name="is_public" defaultChecked={isPublic} style={{ accentColor: "var(--accent)", width: 18, height: 18 }} />
        <span className="flex-1">
          <span style={{ fontSize: 14.5, fontWeight: 600, display: "block" }}>Public profile</span>
          <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
            Anyone with your link can see your rating and library — /u/{username}
          </span>
        </span>
      </label>

      <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.ok && <span style={{ fontSize: 13, color: "var(--success)" }}>Saved.</span>}
        {state.error && <span style={{ fontSize: 13, color: "var(--danger)" }}>{state.error}</span>}
      </div>
    </form>
  );
}
