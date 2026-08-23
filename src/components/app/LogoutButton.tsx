"use client";

import { useFormStatus } from "react-dom";
import { logoutAction } from "@/actions/auth";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";

function Inner() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="nav-item"
      style={{ width: "100%", background: "none", border: 0, cursor: "pointer" }}
      disabled={pending}
    >
      <Icon name="logout" size={16} />
      <span style={{ flex: 1, textAlign: "left" }}>{pending ? "Logging out" : "Log out"}</span>
      {pending && <Spinner size={12} />}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Inner />
    </form>
  );
}
