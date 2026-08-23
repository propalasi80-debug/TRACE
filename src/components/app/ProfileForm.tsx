"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type FormState } from "@/actions/auth";

interface Toggle {
  name: "is_public" | "show_playtime" | "share_activity";
  label: string;
  help: string;
}

const TOGGLES: Toggle[] = [
  {
    name: "is_public",
    label: "Public profile",
    help: "Anyone with your link can see your rating and library.",
  },
  {
    name: "show_playtime",
    label: "Show playtime",
    help: "Display hours alongside each game on your public profile.",
  },
  {
    name: "share_activity",
    label: "Friend activity",
    help: "Let friends see what you last played.",
  },
];

export function ProfileForm({
  displayName,
  bio,
  username,
  isPublic,
  showPlaytime,
  shareActivity,
}: {
  displayName: string;
  bio: string | null;
  username: string;
  isPublic: boolean;
  showPlaytime: boolean;
  shareActivity: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, {});
  const [values, setValues] = useState<Record<Toggle["name"], boolean>>({
    is_public: isPublic,
    show_playtime: showPlaytime,
    share_activity: shareActivity,
  });

  return (
    <form action={action} className="card" style={{ padding: 24 }}>
      <h2 className="t-label" style={{ marginBottom: 18 }}>
        Profile and privacy
      </h2>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="display_name" className="t-label" style={{ display: "block", marginBottom: 7 }}>
          Display name
        </label>
        <div className="field">
          <input id="display_name" name="display_name" defaultValue={displayName} maxLength={40} />
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <label htmlFor="bio" className="t-label" style={{ display: "block", marginBottom: 7 }}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          className="field"
          defaultValue={bio ?? ""}
          rows={3}
          maxLength={280}
          placeholder="Slow with a new game, obsessive by hour twenty."
        />
      </div>

      <div className="stack" style={{ marginTop: 18 }}>
        {TOGGLES.map((t) => (
          <div
            key={t.name}
            className="flex items-center"
            style={{ gap: 16, padding: "14px 0", borderTop: "1px solid var(--line)" }}
          >
            {/* the checkbox carries the value; the switch is its visible control */}
            <input
              type="checkbox"
              name={t.name}
              id={t.name}
              className="sr-only"
              checked={values[t.name]}
              onChange={(e) => setValues((v) => ({ ...v, [t.name]: e.target.checked }))}
            />
            <label htmlFor={t.name} style={{ flex: 1, cursor: "pointer" }}>
              <span style={{ fontSize: 14, fontWeight: 600, display: "block" }}>{t.label}</span>
              <span className="t-sm" style={{ fontSize: 12.5 }}>
                {t.name === "is_public" ? `${t.help} Your link is /u/${username}` : t.help}
              </span>
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={values[t.name]}
              aria-label={t.label}
              className="switch"
              onClick={() => setValues((v) => ({ ...v, [t.name]: !v[t.name] }))}
            />
          </div>
        ))}
      </div>

      <div
        className="flex items-center flex-wrap"
        style={{ gap: 12, marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}
      >
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving" : "Save changes"}
        </button>
        {state.ok && <span style={{ fontSize: 13, color: "var(--ok)" }}>Saved.</span>}
        {state.error && <span style={{ fontSize: 13, color: "var(--bad)" }}>{state.error}</span>}
      </div>
    </form>
  );
}
