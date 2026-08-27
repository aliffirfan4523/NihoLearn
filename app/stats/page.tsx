import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { WeeklyActivity } from "@/components/dashboard/WeeklyActivity";

export default async function StatsPage() {
  const user = await requireUser();
  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

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

  const levelCounts: Record<string, number> = {};
  for (const s of sessions) {
    levelCounts[s.level] = (levelCounts[s.level] ?? 0) + 1;
  }

  return (
    <div className="space-y-8">
      {/* Hero — flat editorial header, no oversized kanji ghost, no filler subtitle */}
      <section className="border-b border-black/10 pb-6 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">Statistics</p>
        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Study Statistics</h2>
      </section>

      {/* Stats — inline text, single vermillion accent on the hero metric */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border-t-2 border-[#C84B31] pt-3 dark:border-[#E85C40]">
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Total Sessions</p>
          <p className="mt-1 text-3xl font-bold text-[#C84B31] dark:text-[#E85C40]">{totalSessions}</p>
        </div>
        <div className="border-t border-black/10 pt-3 dark:border-white/10">
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Total Minutes</p>
          <p className="mt-1 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{totalMinutes}</p>
        </div>
        <div className="border-t border-black/10 pt-3 dark:border-white/10">
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Avg / Session</p>
          <p className="mt-1 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{avgPerSession} min</p>
        </div>
      </div>

      {/* Weekly Activity — flat section, hairline below */}
      <section className="space-y-4 border-b border-black/10 pb-6 dark:border-white/10">
        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Weekly Activity</h3>
        <WeeklyActivity data={days} />
      </section>

      {/* Level Distribution — flat section */}
      <section className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Level Distribution</h3>
        <div className="space-y-3">
          {Object.entries(levelCounts).length === 0 ? (
            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">No sessions logged yet.</p>
          ) : (
            Object.entries(levelCounts).map(([level, count]) => {
              const pct = totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">{level}</span>
                    <span className="text-[#6B6B6B] dark:text-[#A0A0A0]">{count} sessions ({pct}%)</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div className="h-full rounded-full bg-[#C84B31] dark:bg-[#E85C40]" style={{ width: `${pct}%` }} />
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
