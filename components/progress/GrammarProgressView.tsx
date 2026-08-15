"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, RotateCcw, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { n5Grammar } from "@/lib/data/n5-grammar";

export function GrammarProgressView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredGrammar = n5Grammar.filter((g) => {
    if (selectedLevel !== "all" && g.level.toLowerCase() !== selectedLevel.toLowerCase()) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchMeaning = g.meaning.toLowerCase().includes(q);
      const matchStructure = g.structure.toLowerCase().includes(q);
      return matchTitle || matchMeaning || matchStructure;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/progress"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Progress
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">Grammar</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Japanese Grammar Progress
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Study Japanese sentence patterns, particles, and grammar rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/practice/conjugation"
            className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <BookOpen size={16} />
            <span>Learn Grammar</span>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search grammar patterns..."
            className="w-full rounded-xl border border-black/10 bg-[#FAFAF8] pl-10 pr-4 py-2 text-sm text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
          />
        </div>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="all">All Levels</option>
          <option value="n5">N5 Level</option>
          <option value="n4">N4 Level</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#FAFAF8] px-4 py-2 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
        >
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="mastered">Mastered</option>
        </select>
      </div>

      {/* Grammar Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
              N5 Grammar Points
            </span>
            <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
              {filteredGrammar.length} points
            </span>
          </div>

          <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Progress: 0%</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGrammar.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-6 shadow-xs transition hover:-translate-y-0.5 hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                    {item.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Circle size={10} /> Not Started
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {item.meaning}
                </p>

                <div className="mt-4 rounded-xl bg-[#FAFAF8] p-2.5 text-xs text-gray-600 dark:bg-[#2A2A2A] dark:text-gray-300">
                  <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">Pattern:</strong> {item.structure}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
                <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  neutral
                </span>

                <span className="text-xs text-[#C84B31] font-semibold hover:underline dark:text-[#E85C40]">
                  View Details ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
