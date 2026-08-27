"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Lock, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { readingStories, type ReadingStory } from "@/lib/data/stories";
import { ReadingStoryModal } from "@/components/practice/ReadingStoryModal";

export function ReadingPracticeView() {
  const [selectedLevel, setSelectedLevel] = useState<string>("N5");
  const [activeStory, setActiveStory] = useState<ReadingStory | null>(null);

  const levels = ["N5", "N4", "N3", "N2", "N1", "All"];
  const filteredStories = readingStories.filter((s) => {
    if (selectedLevel !== "All" && s.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/practice"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Practice
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">Reading</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Reading Practice
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Read stories, tap words for furigana & hints, and test your understanding with comprehension quizzes.
          </p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-black/10 bg-white p-1.5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedLevel === lvl
                  ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="group relative cursor-pointer rounded-2xl border border-black/10 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-[#C84B31] hover:shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAFAF8] text-3xl shadow-xs transition dark:bg-[#1E232B]">
                  {story.pixelArtEmoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#C84B31]/10 px-2 py-0.5 text-[10px] font-bold text-[#C84B31] dark:bg-[#E85C40]/20 dark:text-[#E85C40]">
                      {story.level}
                    </span>
                    <span className="text-xs text-gray-400">{story.category}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-xl font-bold text-[#1A1A1A] transition group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                    {story.titleJapanese}
                  </h3>
                  <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{story.titleEnglish}</div>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#C84B31] dark:text-gray-600 dark:group-hover:text-[#E85C40]"
              />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#6B6B6B] line-clamp-2 dark:text-[#A0A0A0]">
              {story.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 text-xs text-[#6B6B6B] dark:border-white/10 dark:text-[#A0A0A0]">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                <span>{story.readTime}</span>
              </div>

              <div className="flex items-center gap-1 font-semibold text-[#C84B31] dark:text-[#E85C40]">
                <span>Read Story</span>
                <ArrowLeft size={12} className="rotate-180" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeStory && (
        <ReadingStoryModal story={activeStory} onClose={() => setActiveStory(null)} />
      )}
    </div>
  );
}
