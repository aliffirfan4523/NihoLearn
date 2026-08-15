"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudyActivity } from "@/types";

const levels = ["N5", "N4", "N3", "N2", "N1", "kana", "mixed"];
const allActivities: StudyActivity[] = ["vocabulary", "kanji", "grammar", "reading", "listening", "writing", "kana"];

export default function NewSessionPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState("N5");
  const [activities, setActivities] = useState<StudyActivity[]>(["vocabulary"]);
  const [wordsReviewed, setWordsReviewed] = useState<number | "">("");
  const [kanjiReviewed, setKanjiReviewed] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleActivity(a: StudyActivity) {
    setActivities((current) => (current.includes(a) ? current.filter((x) => x !== a) : [...current, a]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          durationMinutes: duration,
          level,
          activities,
          wordsReviewed: wordsReviewed || undefined,
          kanjiReviewed: kanjiReviewed || undefined,
          notes: notes || undefined,
        }),
      });
      router.push("/sessions");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">New entry</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Log Study Session</h2>
        <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">Record what you studied to track your progress over time.</p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Duration (minutes)</label>
            <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]">
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Words reviewed</label>
              <input type="number" min={0} value={wordsReviewed} onChange={(e) => setWordsReviewed(e.target.value ? Number(e.target.value) : "")} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Kanji reviewed</label>
              <input type="number" min={0} value={kanjiReviewed} onChange={(e) => setKanjiReviewed(e.target.value ? Number(e.target.value) : "")} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Activities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {allActivities.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleActivity(a)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                  activities.includes(a) ? "bg-[#C84B31] text-white dark:bg-[#E85C40]" : "border border-black/10 bg-white text-[#6B6B6B] hover:bg-[#FAFAF8] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#A0A0A0] dark:hover:bg-[#1A1A1A]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]" placeholder="What did you study? Any observations?" />
        </div>

        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#C84B31] py-4 font-semibold text-white transition hover:bg-[#2D5F8A] disabled:opacity-50 dark:bg-[#E85C40] dark:hover:bg-[#4A86B8]">
          {submitting ? "Saving..." : "Save Session"}
        </button>
      </form>
    </div>
  );
}
