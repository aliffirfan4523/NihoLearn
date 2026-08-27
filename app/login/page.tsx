"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam === "oauth") {
      setError("Google sign-in failed. Please try again.");
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4 py-12 text-[#1A1A1A] dark:bg-[#0E1117] dark:text-[#F0F4F8]">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/15 dark:bg-[#161B22]">
          <div className="mb-8 text-center">
            <p className="font-serif text-sm font-semibold tracking-widest text-[#C84B31] dark:text-[#E85C40]">
              ニホラーン
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Welcome back</h1>
            <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">Sign in to continue your Japanese learning journey.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Social Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 active:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.3 5.3C41.3 35.6 44 30.3 44 24c0-1.3-.1-2.6-.4-3.9z"
                />
              </svg>
              Continue with Google
            </button>


          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] dark:text-[#A0A0A0]">or</span>
            <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B]/60 outline-none transition focus:border-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:placeholder-[#A0A0A0]/60 dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-4 pr-11 text-sm text-[#1A1A1A] placeholder-[#6B6B6B]/60 outline-none transition focus:border-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:placeholder-[#A0A0A0]/60 dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-[#6B6B6B] transition hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#F0F4F8]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl bg-[#C84B31] px-3.5 py-3 text-xs font-bold text-white shadow-xs transition hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#E85C40] dark:focus-visible:ring-[#E85C40]/50 dark:focus-visible:ring-offset-[#0E1117]"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#C84B31] underline-offset-2 hover:underline dark:text-[#E85C40]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
