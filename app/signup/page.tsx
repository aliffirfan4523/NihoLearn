"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Customization state
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [hasCustomized, setHasCustomized] = useState(false);
  const [knowsKana, setKnowsKana] = useState(false);
  const [vocabGoal, setVocabGoal] = useState("5");
  const [grammarGoal, setGrammarGoal] = useState("2");
  const [japaneseLevel, setJapaneseLevel] = useState("Complete Beginner");

  // Agreements state
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!captchaChecked) {
      setError("Please check the 'I'm not a robot' box.");
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          email,
          password,
          // Customization settings
          knowsKana,
          dailyVocabGoal: parseInt(vocabGoal, 10),
          dailyGrammarGoal: parseInt(grammarGoal, 10),
          japaneseLevel,
          profileCompleted: hasCustomized,
        }),
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

  const isFormValid =
    username.length >= 3 &&
    email.includes("@") &&
    password.length >= 6 &&
    password === confirmPassword &&
    agreeTerms &&
    agreePrivacy &&
    captchaChecked;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E1117] py-12 px-4 text-[#F0F4F8] dark:bg-[#0E1117]">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-3xl border border-white/10 bg-[#161B22] p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-300 border border-red-900/30">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-xl bg-green-950/40 px-4 py-3 text-sm text-green-300 border border-green-900/30">
              {info}
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


          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-white">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#21262D] px-4 py-3 outline-none focus:border-[#C84B31] text-white placeholder-gray-500"
                placeholder="Choose a username"
              />
              <p className="mt-1.5 text-xs text-gray-400">Username must be at least 3 characters long</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#21262D] px-4 py-3 outline-none focus:border-[#C84B31] text-white placeholder-gray-500"
                placeholder="Enter your email"
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
                  minLength={6}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-white">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#21262D] pl-4 pr-11 py-3 outline-none focus:border-[#C84B31] text-white placeholder-gray-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Customize Account Button with Hover Popover */}
            <div 
              className="relative pt-2"
              onMouseEnter={() => {
                setCustomizeOpen(true);
                setHasCustomized(true);
              }}
              onMouseLeave={() => setCustomizeOpen(false)}
            >
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#21262D] py-3 text-sm font-bold text-white transition hover:bg-[#30363D]"
              >
                <Sparkles size={16} className="text-[#C84B31] dark:text-[#E85C40]" />
                {knowsKana || vocabGoal !== "5" || grammarGoal !== "2" || japaneseLevel !== "Complete Beginner" ? (
                  <span>Customized ({japaneseLevel === "Complete Beginner" ? "Beginner" : japaneseLevel.split(" ")[1]} • {vocabGoal}w/d)</span>
                ) : (
                  <span>Customize your account</span>
                )}
              </button>

              {/* Floating Customization Card */}
              {customizeOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 rounded-2xl border border-white/10 bg-[#161B22] p-5 shadow-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <span className="text-sm font-bold text-white">Japanese Learning Profile</span>
                  </div>

                  {/* Knows Kana Toggle */}
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">Kana Knowledge</span>
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#21262D] p-3">
                      <span className="text-xs text-gray-300">I already know hiragana & katakana</span>
                      <button
                        type="button"
                        onClick={() => setKnowsKana(!knowsKana)}
                        className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none ${
                          knowsKana ? "bg-[#C84B31] dark:bg-[#E85C40]" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            knowsKana ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Study Goals */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-400">Vocabulary Goal</span>
                      <select
                        value={vocabGoal}
                        onChange={(e) => setVocabGoal(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#21262D] p-2 text-xs font-semibold text-white outline-none"
                      >
                        <option value="5">5 words/day</option>
                        <option value="10">10 words/day</option>
                        <option value="15">15 words/day</option>
                        <option value="20">20 words/day</option>
                        <option value="30">30 words/day</option>
                        <option value="50">50 words/day</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Grammar Goal</span>
                      <select
                        value={grammarGoal}
                        onChange={(e) => setGrammarGoal(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#21262D] p-2 text-xs font-semibold text-white outline-none"
                      >
                        <option value="1">1 point/day</option>
                        <option value="2">2 points/day</option>
                        <option value="3">3 points/day</option>
                        <option value="5">5 points/day</option>
                        <option value="10">10 points/day</option>
                      </select>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400">Japanese Level</span>
                    <select
                      value={japaneseLevel}
                      onChange={(e) => setJapaneseLevel(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#21262D] p-2 text-xs font-semibold text-white outline-none"
                    >
                      <option value="Complete Beginner">Complete Beginner</option>
                      <option value="JLPT N5 Completed">JLPT N5 Completed</option>
                      <option value="JLPT N4 Completed">JLPT N4 Completed</option>
                      <option value="JLPT N3 Completed">JLPT N3 Completed</option>
                      <option value="JLPT N2 Completed">JLPT N2 Completed</option>
                      <option value="JLPT N1 Completed">JLPT N1 Completed</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-5 w-5 rounded-md border border-white/10 bg-[#21262D] checked:bg-[#C84B31]"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[#C84B31] hover:underline">
                    Terms of Service
                  </Link>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="h-5 w-5 rounded-md border border-white/10 bg-[#21262D] checked:bg-[#C84B31]"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{" "}
                  <Link href="/privacy" target="_blank" className="text-[#C84B31] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* reCAPTCHA Mock Box */}
            <div className="rounded-xl border border-white/10 bg-[#21262D] p-4 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="h-7 w-7 rounded-sm border border-gray-400 bg-white checked:bg-blue-600 focus:outline-none"
                />
                <span className="text-sm font-semibold text-gray-300">I'm not a robot</span>
              </label>
              <div className="flex flex-col items-center">
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-[9px] text-gray-500 font-medium mt-1">reCAPTCHA</span>
                <div className="flex gap-1 text-[8px] text-gray-600 font-medium">
                  <a href="https://policies.google.com/privacy" target="_blank" className="hover:underline">Privacy</a>
                  <span>•</span>
                  <a href="https://policies.google.com/terms" target="_blank" className="hover:underline">Terms</a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full rounded-2xl bg-[#5865F2] py-3.5 font-bold text-white transition hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#5865F2] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
