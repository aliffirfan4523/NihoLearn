import Link from "next/link";
import { BookA, BookOpen, BookOpenCheck, GitFork, BookMarked, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Learning Progress | NihoLearn",
  description: "Track your overall Japanese learning progress across Kana, Kanji, Grammar, and Conjugation.",
};

const progressLinks = [
  {
    title: "Kana Progress",
    description: "Hiragana and Katakana row breakdown, accuracy overview, and struggle items.",
    href: "/progress/kana",
    icon: BookA,
    badge: "100% Basic",
    color: "text-[#C84B31] dark:text-[#E85C40]",
    bg: "bg-[#C84B31]/10 dark:bg-[#E85C40]/15",
  },
  {
    title: "JLPT Kanji Requirements",
    description: "Browse N5–N1 kanji list, readings, stroke counts, and radicals table.",
    href: "/progress/kanji",
    icon: BookOpenCheck,
    badge: "79 Kanji",
    color: "text-[#2D5F8A] dark:text-[#60A5FA]",
    bg: "bg-[#2D5F8A]/10 dark:bg-[#2D5F8A]/20",
  },
  {
    title: "Japanese Grammar Progress",
    description: "Sentence patterns, particles, formality levels, and structure rules.",
    href: "/progress/grammar",
    icon: BookOpen,
    badge: "N5 Points",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    title: "Conjugation Progress",
    description: "15 verb forms progress, Godan/Ichidan groups, and drill statistics.",
    href: "/progress/conjugation",
    icon: GitFork,
    badge: "15 Forms",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
  },
  {
    title: "Vocabulary Progress",
    description: "7,972 core vocabulary words across N5 to N1, audio pronunciation, and JLPT study tracker.",
    href: "/progress/vocabulary",
    icon: BookMarked,
    badge: "7,972 Words",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
];

export default function ProgressHubPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
          Learning Progress
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
          Select a category below to inspect your detailed mastery, struggle items, and test stats.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {progressLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-[#C84B31] hover:shadow-md dark:border-white/15 dark:bg-[#1A1A1A] dark:hover:border-[#E85C40]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold text-[#6B6B6B] dark:bg-white/10 dark:text-[#A0A0A0]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#1A1A1A] transition group-hover:text-[#C84B31] dark:text-[#FAFAFA] dark:group-hover:text-[#E85C40]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-4 text-xs font-bold text-[#C84B31] dark:border-white/10 dark:text-[#E85C40]">
                <span>View Progress</span>
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
