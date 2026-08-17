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

  function handleApple() {
    alert("Apple sign-in is not configured for this project yet. Please use Google sign-in instead.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1117] py-12 px-4 text-[#F0F4F8] dark:bg-[#0E1117]">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#161B22] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-400">Sign in to continue your Japanese learning journey.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-300 border border-red-900/30">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Social Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#21262D] px-4 py-3 font-semibold text-white transition hover:bg-[#30363D] disabled:opacity-50"
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

            {/* Social Apple */}
            <button
              type="button"
              onClick={handleApple}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#21262D] px-4 py-3 font-semibold text-white transition hover:bg-[#30363D] disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.785 10.314c.022-2.457 2.016-3.262 2.036-3.272-1.139-1.666-2.909-1.893-3.535-1.933-1.498-.152-2.923.884-3.682.884-.76 0-1.961-.865-3.243-.842-1.688.026-3.242.984-4.11 2.498-1.753 3.056-.448 7.575 1.254 10.027.832 1.2 1.8 2.533 3.097 2.484 1.25-.05 1.723-.807 3.238-.807 1.515 0 1.942.807 3.24.782 1.32-.024 2.164-1.2 2.973-2.383.935-1.367 1.32-2.69 1.341-2.756-.045-.02-2.613-1.002-2.659-4.985zM11.696 2.76C12.37 1.944 12.822.812 12.698 0c-.973.04-2.15.65-2.848 1.465-.6.697-1.127 1.844-.985 2.64 1.085.084 2.186-.527 2.831-1.346z"
                  fill="white"
                />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#21262D] px-4 py-3 outline-none focus:border-[#C84B31] text-white placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#21262D] pl-4 pr-11 py-3 outline-none focus:border-[#C84B31] text-white placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#5865F2] py-3.5 font-bold text-white transition hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#5865F2] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
