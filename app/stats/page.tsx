import { prisma } from "@/lib/db";
import { ActivityChart } from "@/components/dashboard/ActivityChart";

export default async function StatsPage() {
  const sessions = await prisma.studySession.findMany({
    orderBy: { date: "asc" },
  });

  // Build last 7 days data
  const days: { day: string; minutes: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = dayNames[d.getDay()];
    const dayStr = d.toDateString();
    const minutes = sessions
      .filter((s) => new Date(s.date).toDateString() === dayStr)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    days.push({ day: dayName, minutes });
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalSessions = sessions.length;
  const avgPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  // Level distribution
  const levelCounts: Record<string, number> = {};
  for (const s of sessions) {
    levelCounts[s.level] = (levelCounts[s.level] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5">統</div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31]">Statistics</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">Study Statistics</h2>
          <p className="mt-4 text-[#6B6B6B]">Track your study activity and progress over time.</p>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6B6B]">Total Sessions</p>
          <p className="mt-2 text-3xl font-bold text-[#C84B31]">{totalSessions}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6B6B]">Total Minutes</p>
          <p className="mt-2 text-3xl font-bold text-[#2D5F8A]">{totalMinutes}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6B6B6B]">Avg / Session</p>
          <p className="mt-2 text-3xl font-bold text-[#3D7D52]">{avgPerSession} min</p>
        </div>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#1A1A1A]">Weekly Activity</h3>
        <ActivityChart data={days} />
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#1A1A1A]">Level Distribution</h3>
        <div className="space-y-3">
          {Object.entries(levelCounts).length === 0 ? (
            <p className="text-[#6B6B6B]">No sessions logged yet.</p>
          ) : (
            Object.entries(levelCounts).map(([level, count]) => {
              const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#1A1A1A]">{level}</span>
                    <span className="text-[#6B6B6B]">{count} sessions ({pct}%)</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
                    <div className="h-full rounded-full bg-[#C84B31]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
