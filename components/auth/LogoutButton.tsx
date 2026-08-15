"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Hard redirect so the middleware sees the cleared cookies.
      window.location.href = "/login";
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#C84B31] transition hover:bg-red-50 disabled:opacity-50 dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#E85C40] dark:hover:bg-red-900/20"
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
