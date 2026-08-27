"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart2 } from "lucide-react";

const ActivityChart = dynamic(
  () => import("@/components/dashboard/ActivityChart").then((mod) => mod.ActivityChart),
  { ssr: false, loading: () => <div className="flex h-[300px] items-center justify-center text-xs text-[#6B6B6B]">Loading chart…</div> }
);

export function WeeklyActivity({ data }: { data: { day: string; minutes: number }[] }) {
  const [interactive, setInteractive] = useState(false);
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setInteractive((v) => !v)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
            interactive
              ? "bg-[#C84B31] text-white dark:bg-[#E85C40]"
              : "border border-black/10 bg-white text-[#6B6B6B] hover:text-[#1A1A1A] dark:border-white/10 dark:bg-[#161B22] dark:text-[#A0A0A0]"
          }`}
        >
          <BarChart2 size={12} />
          <span>{interactive ? "Simple View" : "Interactive"}</span>
        </button>
      </div>

      {interactive ? (
        <ActivityChart data={data} />
      ) : (
        <div className="flex h-[300px] items-end gap-2 sm:gap-3 p-4 pb-8">
          {data.map((d) => {
            const pct = (d.minutes / maxMinutes) * 100;
            return (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-[#C84B31] dark:bg-[#E85C40] transition-all duration-500"
                    style={{ height: `${Math.max(pct, d.minutes > 0 ? 8 : 2)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {d.day}
                </span>
                <span className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {d.minutes}m
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
