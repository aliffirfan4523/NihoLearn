"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

export default function ProfileCustomizePage() {
  const router = useRouter();
  const [knowsKana, setKnowsKana] = useState(false);
  const [vocabGoal, setVocabGoal] = useState("5");
  const [grammarGoal, setGrammarGoal] = useState("2");
  const [japaneseLevel, setJapaneseLevel] = useState("Complete Beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowsKana,
          dailyVocabGoal: parseInt(vocabGoal, 10),
          dailyGrammarGoal: parseInt(grammarGoal, 10),
          japaneseLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save profile settings.");
      }

      setSuccess(true);
      setTimeout(() => {
        // Hard redirect to clear path and update headers
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#FAFAF8] px-4 dark:bg-[#0A0A0A]">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#1A1A1A] space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-black/5 pb-4 dark:border-white/5">
            <Sparkles className="h-6 w-6 text-[#C84B31] dark:text-[#E85C40]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
              Japanese Learning Profile
            </h1>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Settings saved! Redirecting to your dashboard...
            </div>
          )}

          <div className="space-y-6">
            {/* 1. Kana Knowledge Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                あ Kana Knowledge
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#252525]">
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">
                  I already know hiragana and katakana
                </span>
                <button
                  type="button"
                  onClick={() => setKnowsKana(!knowsKana)}
                  className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${
                    knowsKana ? "bg-[#C84B31] dark:bg-[#E85C40]" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      knowsKana ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. Daily Study Goals */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                🎯 Daily Study Goals
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Vocabulary</span>
                  <select
                    value={vocabGoal}
                    onChange={(e) => setVocabGoal(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] dark:border-white/10 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
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
                  <span className="text-xs text-gray-500 dark:text-gray-400">Grammar</span>
                  <select
                    value={grammarGoal}
                    onChange={(e) => setGrammarGoal(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] dark:border-white/10 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
                  >
                    <option value="1">1 point/day</option>
                    <option value="2">2 points/day</option>
                    <option value="3">3 points/day</option>
                    <option value="5">5 points/day</option>
                    <option value="10">10 points/day</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Japanese Level */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                🎓 Japanese Level
              </label>
              <select
                value={japaneseLevel}
                onChange={(e) => setJapaneseLevel(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C84B31] dark:border-white/10 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
              >
                <option value="Complete Beginner">Complete Beginner</option>
                <option value="JLPT N5 Completed">JLPT N5 Completed</option>
                <option value="JLPT N4 Completed">JLPT N4 Completed</option>
                <option value="JLPT N3 Completed">JLPT N3 Completed</option>
                <option value="JLPT N2 Completed">JLPT N2 Completed</option>
                <option value="JLPT N1 Completed">JLPT N1 Completed</option>
              </select>

              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <p>
                  Select the level you've completed, not studying for. If working toward N5 but
                  haven't passed, choose "Complete Beginner".
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4">
            <button
              type="button"
              disabled={loading || success}
              onClick={handleSave}
              className="w-full rounded-2xl bg-[#C84B31] py-3.5 font-bold text-white transition hover:bg-[#2D5F8A] disabled:opacity-50 dark:bg-[#E85C40] dark:hover:bg-[#4A86B8]"
            >
              {loading ? "Saving settings..." : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
