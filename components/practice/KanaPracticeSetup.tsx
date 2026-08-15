"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Volume2, Sparkles, CheckCircle2, RotateCcw, ArrowRight } from "lucide-react";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import type { KanaCharacter } from "@/types";

export type PracticeMode =
  | "romaji_to_typing"
  | "kana_to_choice"
  | "romaji_to_choice"
  | "kana_to_typing"
  | "audio_to_choice"
  | "audio_to_typing";

export interface KanaPracticeConfig {
  type: "hiragana" | "katakana";
  modes: PracticeMode[];
  order: "random" | "sequential";
  sessionSize: number;
  selectedRows: string[];
}

const basicRows = ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa"];
const dakutenRows = ["ga", "za", "da", "ba", "pa"];
const combinationRows = ["kya", "sha", "cha", "nya", "hya", "mya", "rya", "gya", "ja", "bya", "pya"];

const modeOptions: { id: PracticeMode; label: string; icon: string }[] = [
  { id: "romaji_to_typing", label: "Romaji ➔ Type", icon: "a ➔ ✏️" },
  { id: "kana_to_choice", label: "Kana ➔ Choice", icon: "あ ➔ 🔲" },
  { id: "romaji_to_choice", label: "Romaji ➔ Choice", icon: "a ➔ 🔲" },
  { id: "kana_to_typing", label: "Kana ➔ Type", icon: "あ ➔ ⌨️" },
  { id: "audio_to_choice", label: "Audio ➔ Choice", icon: "🎧 ➔ 🔲" },
  { id: "audio_to_typing", label: "Audio ➔ Type", icon: "🎧 ➔ ✏️" },
];

export function KanaPracticeSetup({ onStart }: { onStart: (config: KanaPracticeConfig) => void }) {
  const [type, setType] = useState<"hiragana" | "katakana">("hiragana");
  const [selectedModes, setSelectedModes] = useState<PracticeMode[]>(["kana_to_choice", "romaji_to_typing"]);
  const [order, setOrder] = useState<"random" | "sequential">("random");
  const [sessionSize, setSessionSize] = useState(20);
  const [selectedRows, setSelectedRows] = useState<string[]>(["a", "ka", "sa", "ta", "na"]);

  const pool = type === "hiragana" ? hiraganaSeed : katakanaSeed;

  const toggleMode = (mode: PracticeMode) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const toggleRow = (row: string) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const selectAll = () => {
    const all = [...basicRows, ...dakutenRows, ...combinationRows];
    setSelectedRows(all);
  };

  const selectCategory = (rows: string[]) => {
    const allIncluded = rows.every((r) => selectedRows.includes(r));
    if (allIncluded) {
      setSelectedRows(selectedRows.filter((r) => !rows.includes(r)));
    } else {
      setSelectedRows(Array.from(new Set([...selectedRows, ...rows])));
    }
  };

  const selectedCount = pool.filter((k) => selectedRows.includes(k.row)).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Kana Practice</h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Customize game modes, select character groups, and drill your memory.
          </p>
        </div>

        {/* Hiragana / Katakana Switcher */}
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white p-1.5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <button
            type="button"
            onClick={() => setType("hiragana")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              type === "hiragana"
                ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
            }`}
          >
            あ Hiragana
          </button>
          <button
            type="button"
            onClick={() => setType("katakana")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              type === "katakana"
                ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                : "text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
            }`}
          >
            ア Katakana
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Settings Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
              Game Modes
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {modeOptions.map((opt) => {
                const isSelected = selectedModes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMode(opt.id)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                      isSelected
                        ? "border-[#C84B31] bg-[#C84B31]/10 text-[#C84B31] font-bold dark:border-[#E85C40] dark:bg-[#E85C40]/15 dark:text-[#E85C40]"
                        : "border-black/5 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
                    }`}
                  >
                    <span className="font-mono text-sm">{opt.icon}</span>
                    <span className="mt-1 text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Session Size & Order */}
            <div className="mt-6 space-y-4 border-t border-black/10 pt-5 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">Order</span>
                <div className="flex rounded-xl bg-[#FAFAF8] p-1 dark:bg-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => setOrder("random")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      order === "random"
                        ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                        : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                    }`}
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrder("sequential")}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      order === "sequential"
                        ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                        : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                    }`}
                  >
                    Sequential
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">Session Size</span>
                <div className="flex items-center gap-2">
                  {[10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSessionSize(num)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                        sessionSize === num
                          ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                          : "border border-black/5 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/10 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="mt-6">
              <button
                type="button"
                disabled={selectedRows.length === 0}
                onClick={() =>
                  onStart({
                    type,
                    modes: selectedModes,
                    order,
                    sessionSize,
                    selectedRows,
                  })
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#b03e26] disabled:opacity-40 dark:bg-[#E85C40] dark:hover:bg-[#d44e33]"
              >
                <span>Start Practice ({selectedCount} kana)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Speed Sprint Banner */}
          <Link
            href="/practice/kana-speed"
            className="flex items-center gap-4 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-5 transition hover:scale-[1.02] dark:border-purple-500/30"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md">
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Kana Speed Sprint</span>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  Timed
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Type romaji as fast as possible in 60s</p>
            </div>
          </Link>
        </div>

        {/* Right Groups Grid */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Select Characters</h2>
            <button
              type="button"
              onClick={selectAll}
              className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-xs hover:border-[#C84B31] dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
            >
              Select All Rows
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Basic Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C84B31] dark:text-[#E85C40]">
                  Basic (10 rows)
                </span>
                <button
                  type="button"
                  onClick={() => selectCategory(basicRows)}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Toggle
                </button>
              </div>
              <div className="space-y-2">
                {basicRows.map((row) => {
                  const items = pool.filter((k) => k.row === row);
                  const isSelected = selectedRows.includes(row);
                  return (
                    <button
                      key={row}
                      type="button"
                      onClick={() => toggleRow(row)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-[#C84B31] bg-[#C84B31]/10 dark:border-[#E85C40] dark:bg-[#E85C40]/15"
                          : "border-black/5 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#1A1A1A]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{row} row</div>
                        <div className="mt-1 flex gap-1 font-serif text-sm font-bold text-[#2D5F8A] dark:text-[#4A86B8]">
                          {items.map((i) => i.character).join(" ")}
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs ${
                          isSelected
                            ? "border-[#C84B31] bg-[#C84B31] text-white dark:border-[#E85C40] dark:bg-[#E85C40]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dakuten Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5F8A] dark:text-[#4A86B8]">
                  Dakuten (5 rows)
                </span>
                <button
                  type="button"
                  onClick={() => selectCategory(dakutenRows)}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Toggle
                </button>
              </div>
              <div className="space-y-2">
                {dakutenRows.map((row) => {
                  const items = pool.filter((k) => k.row === row);
                  const isSelected = selectedRows.includes(row);
                  return (
                    <button
                      key={row}
                      type="button"
                      onClick={() => toggleRow(row)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-[#2D5F8A] bg-[#2D5F8A]/10 dark:border-[#4A86B8] dark:bg-[#4A86B8]/15"
                          : "border-black/5 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#1A1A1A]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{row} row</div>
                        <div className="mt-1 flex gap-1 font-serif text-sm font-bold text-[#2D5F8A] dark:text-[#4A86B8]">
                          {items.map((i) => i.character).join(" ")}
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs ${
                          isSelected
                            ? "border-[#2D5F8A] bg-[#2D5F8A] text-white dark:border-[#4A86B8] dark:bg-[#4A86B8]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Combinations Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Combinations
                </span>
                <button
                  type="button"
                  onClick={() => selectCategory(combinationRows)}
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  Toggle
                </button>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {combinationRows.map((row) => {
                  const items = pool.filter((k) => k.row === row);
                  const isSelected = selectedRows.includes(row);
                  return (
                    <button
                      key={row}
                      type="button"
                      onClick={() => toggleRow(row)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-purple-600 bg-purple-500/10 dark:border-purple-400 dark:bg-purple-500/15"
                          : "border-black/5 bg-white hover:border-black/20 dark:border-white/10 dark:bg-[#1A1A1A]"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{row} row</div>
                        <div className="mt-1 flex gap-1 font-serif text-sm font-bold text-purple-600 dark:text-purple-400">
                          {items.map((i) => i.character).join(" ")}
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border text-xs ${
                          isSelected
                            ? "border-purple-600 bg-purple-600 text-white dark:border-purple-400 dark:bg-purple-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
