"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed.");
        setLoading(false);
        return;
      }
      // If email confirmation is on, show info instead of redirecting.
      if (data.needsConfirmation) {
        setInfo(data.message);
        setLoading(false);
        return;
      }
      // Hard redirect so the middleware sees the new cookies.
      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Google sign-in failed.");
        setLoading(false);
      }
    } catch {
      setError("Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4 dark:bg-[#0A0A0A]">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C84B31] text-2xl font-bold text-white dark:bg-[#E85C40]">日</div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Create account</h1>
            <p className="mt-2 text-[#6B6B6B] dark:text-[#A0A0A0]">Start tracking your Japanese progress.</p>
          </div>

          {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
          {info && <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">{info}</div>}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 font-semibold text-[#1A1A1A] transition hover:bg-[#FAFAF8] disabled:opacity-50 dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:hover:bg-[#1A1A1A]"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.3 5.3C41.3 35.6 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">or</span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C84B31] py-3 font-semibold text-white transition hover:bg-[#2D5F8A] disabled:opacity-50 dark:bg-[#E85C40] dark:hover:bg-[#4A86B8]"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#C84B31] hover:underline dark:text-[#E85C40]">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
