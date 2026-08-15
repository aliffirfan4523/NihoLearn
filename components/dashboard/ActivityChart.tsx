"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ActivityChart({ data }: { data: { day: string; minutes: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--color-sumi, #6B6B6B)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--color-sumi, #6B6B6B)" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
          contentStyle={{ borderRadius: 12, border: "1px solid rgba(128, 128, 128, 0.2)", backgroundColor: "var(--color-surface, #FFFFFF)", color: "var(--color-ink, #1A1A1A)", fontSize: 14 }}
          formatter={(value) => [`${value} min`, "Studied"]}
        />
        <Bar dataKey="minutes" fill="var(--color-vermillion, #C84B31)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
