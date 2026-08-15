import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import Link from "next/link";

export default async function SessionsPage() {
  const user = await requireUser();
  const sessions = await prisma.studySession.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const levelColors: Record<string, string> = {
    N5: "bg-[#C84B31] text-white",
    N4: "bg-[#2D5F8A] text-white",
    N3: "bg-[#3D7D52] text-white",
    kana: "bg-[#6B6B6B] text-white",
    mixed: "bg-[#6B6B6B] text-white",
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="pointer-events-none absolute -right-6 -top-12 font-serif text-[12rem] leading-none text-[#C84B31]/5 dark:text-[#C84B31]/10">学</div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">Study log</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Study Sessions</h2>
            <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">{sessions.length} sessions logged.</p>
          </div>
          <Link href="/sessions/new" className="rounded-full bg-[#C84B31] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2D5F8A] dark:bg-[#E85C40] dark:hover:bg-[#4A86B8]">
            Log Session
          </Link>
        </div>
      </section>

      {sessions.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white p-12 text-center text-[#6B6B6B] dark:border-white/20 dark:bg-[#1A1A1A] dark:text-[#A0A0A0]">
          No study sessions yet. Log your first session to start tracking your progress!
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const activities: string[] = JSON.parse(session.activities);
            return (
              <article key={session.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${levelColors[session.level] ?? "bg-[#6B6B6B] text-white"}`}>
                    {session.level}
                  </span>
                  <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#FAFAFA]">
                    {new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <span className="rounded-full bg-[#FAFAF8] px-3 py-1 text-sm text-[#6B6B6B] dark:bg-[#2A2A2A] dark:text-[#A0A0A0]">
                    {session.durationMinutes} min
                  </span>
                  <div className="ml-auto flex gap-2">
                    {activities.map((a) => (
                      <span key={a} className="rounded-full border border-black/10 px-2 py-0.5 text-xs capitalize text-[#6B6B6B] dark:border-white/20 dark:text-[#A0A0A0]">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                {(session.wordsReviewed || session.kanjiReviewed) && (
                  <div className="mt-3 flex gap-4 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                    {session.wordsReviewed && <span>📖 {session.wordsReviewed} words</span>}
                    {session.kanjiReviewed && <span>✍️ {session.kanjiReviewed} kanji</span>}
                  </div>
                )}
                {session.notes && <p className="mt-3 text-sm text-[#1A1A1A] dark:text-[#FAFAFA]">{session.notes}</p>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
