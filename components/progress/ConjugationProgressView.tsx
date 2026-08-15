"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, ArrowLeft, RotateCw, CheckCircle2, Trophy, BarChart2 } from "lucide-react";
import { conjugationFormsList } from "@/lib/data/conjugation";

export function ConjugationProgressView() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
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
            <span className="text-xs font-bold text-[#C84B31] dark:text-[#E85C40]">Conjugation</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
            Conjugation Progress
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Track your mastery and review practice attempts across all 15 Japanese verb forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/practice/conjugation"
            className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <RotateCw size={16} />
            <span>Practice Conjugation</span>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left 15 Forms Grid */}
        <div className="space-y-4 lg:col-span-8">
          <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Progress by Form</h2>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {conjugationFormsList.map((form) => (
              <Link
                key={form.key}
                href="/practice/conjugation"
                className="group relative flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-[#1A1A1A] transition group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                    {form.label}
                  </h3>
                  <ArrowRight
                    size={14}
                    className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#C84B31] dark:text-gray-600 dark:group-hover:text-[#E85C40]"
                  />
                </div>

                <div className="mt-6">
                  <span className="text-[11px] text-gray-400">Mastered in drills</span>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-full w-1/4 rounded-full bg-[#C84B31] dark:bg-[#E85C40]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Stats & Overview Widgets */}
        <div className="space-y-6 lg:col-span-4">
          {/* Accuracy Ring Widget */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Conjugation Accuracy</h3>
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-purple-500/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">85%</div>
                  <div className="text-[10px] text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              Based on your last 50 conjugation drill responses.
            </div>
          </div>

          {/* Quick Reference Rules */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A] space-y-3">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Verb Groups Guide</h3>
            <div className="space-y-2 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
              <div className="rounded-xl bg-[#FAFAF8] p-2.5 dark:bg-[#2A2A2A]">
                <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">Group 1 (Godan):</strong> Ends in u, ku, su, tsu, nu, mu, ru, bu, gu.
              </div>
              <div className="rounded-xl bg-[#FAFAF8] p-2.5 dark:bg-[#2A2A2A]">
                <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">Group 2 (Ichidan):</strong> Ends in -iru or -eru. Drop る + form.
              </div>
              <div className="rounded-xl bg-[#FAFAF8] p-2.5 dark:bg-[#2A2A2A]">
                <strong className="text-[#1A1A1A] dark:text-[#FAFAFA]">Group 3 (Irregular):</strong> する (to do) & 来る (to come).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
