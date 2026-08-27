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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4 py-12 text-[#1A1A1A] dark:bg-[#0E1117] dark:text-[#F0F4F8]">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-xs dark:border-white/15 dark:bg-[#161B22]">
          <div className="mb-8 text-center">
            <p className="font-serif text-sm font-semibold tracking-widest text-[#C84B31] dark:text-[#E85C40]">
              ニホラーン
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Create Account</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-xl border border-[#3D7D52]/20 bg-[#3D7D52]/10 px-4 py-3 text-sm text-[#3D7D52] dark:border-[#34D399]/20 dark:bg-[#34D399]/15 dark:text-[#34D399]">
              {info}
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
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B]/60 outline-none transition focus:border-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:placeholder-[#A0A0A0]/60 dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                placeholder="Choose a username"
              />
              <p className="mt-1.5 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Username must be at least 3 characters long</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#6B6B6B]/60 outline-none transition focus:border-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:placeholder-[#A0A0A0]/60 dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                placeholder="Enter your email"
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
                  minLength={6}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-4 pr-11 text-sm text-[#1A1A1A] placeholder-[#6B6B6B]/60 outline-none transition focus:border-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:placeholder-[#A0A0A0]/60 dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-2.5 text-[#6B6B6B] transition hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#F0F4F8]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-2.5 text-xs font-semibold text-[#1A1A1A] shadow-xs transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:hover:bg-white/5 dark:focus-visible:ring-white/20"
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
                <div className="absolute left-0 right-0 z-50 mt-1 space-y-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-[#161B22]">
                  <div className="flex items-center gap-2 border-b border-black/5 pb-2 dark:border-white/10">
                    <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">Japanese Learning Profile</span>
                  </div>

                  {/* Knows Kana Toggle */}
                  <div className="space-y-1">
                    <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Kana Knowledge</span>
                    <div className="flex items-center justify-between rounded-xl border border-black/5 bg-[#F4F4F0] p-3 dark:border-white/10 dark:bg-[#1E232B]">
                      <span className="text-xs text-[#1A1A1A] dark:text-[#F0F4F8]">I already know hiragana &amp; katakana</span>
                      <button
                        type="button"
                        onClick={() => setKnowsKana(!knowsKana)}
                        aria-label="Toggle kana knowledge"
                        className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:focus-visible:ring-[#E85C40]/50 ${
                          knowsKana ? "bg-[#C84B31] dark:bg-[#E85C40]" : "bg-black/20 dark:bg-white/20"
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
                      <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Vocabulary Goal</span>
                      <select
                        value={vocabGoal}
                        onChange={(e) => setVocabGoal(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white p-2 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
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
                      <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Grammar Goal</span>
                      <select
                        value={grammarGoal}
                        onChange={(e) => setGrammarGoal(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-black/10 bg-white p-2 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
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
                    <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Japanese Level</span>
                    <select
                      value={japaneseLevel}
                      onChange={(e) => setJapaneseLevel(e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-white p-2 text-xs font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#F0F4F8] dark:focus:border-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
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
                  className="h-4 w-4 rounded border-black/20 bg-white accent-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/25 dark:bg-[#1E232B] dark:accent-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                />
                <span className="text-sm text-[#1A1A1A] dark:text-[#F0F4F8]">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="font-semibold text-[#C84B31] underline-offset-2 hover:underline dark:text-[#E85C40]">
                    Terms of Service
                  </Link>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 bg-white accent-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/25 dark:bg-[#1E232B] dark:accent-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                />
                <span className="text-sm text-[#1A1A1A] dark:text-[#F0F4F8]">
                  I agree to the{" "}
                  <Link href="/privacy" target="_blank" className="font-semibold text-[#C84B31] underline-offset-2 hover:underline dark:text-[#E85C40]">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* reCAPTCHA Mock Box */}
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-[#F4F4F0] p-4 dark:border-white/15 dark:bg-[#1E232B]">
              <label className="flex cursor-pointer select-none items-center gap-3">
                <input
                  type="checkbox"
                  checked={captchaChecked}
                  onChange={(e) => setCaptchaChecked(e.target.checked)}
                  className="h-6 w-6 rounded border-black/20 bg-white accent-[#C84B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 dark:border-white/25 dark:bg-[#161B22] dark:accent-[#E85C40] dark:focus-visible:ring-[#E85C40]/50"
                />
                <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0F4F8]">I&apos;m not a robot</span>
              </label>
              <div className="flex flex-col items-center">
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  className="h-8 w-8 object-contain"
                />
                <span className="mt-1 text-[9px] font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">reCAPTCHA</span>
                <div className="flex gap-1 text-[8px] font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
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
              className="w-full min-h-[44px] rounded-xl bg-[#C84B31] px-3.5 py-3 text-xs font-bold text-white shadow-xs transition hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C84B31]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#E85C40] dark:focus-visible:ring-[#E85C40]/50 dark:focus-visible:ring-offset-[#0E1117]"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#C84B31] underline-offset-2 hover:underline dark:text-[#E85C40]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
