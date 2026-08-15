export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "purple" | "amber" | "gray";
  iconName: string;
  category: "characters" | "grammar" | "reading_listening" | "writing";
  isUpcoming?: boolean;
}

export const practiceCategories = [
  { id: "characters", label: "CHARACTERS", icon: "A" },
  { id: "grammar", label: "GRAMMAR", icon: "文" },
  { id: "reading_listening", label: "READING & LISTENING", icon: "📖" },
  { id: "writing", label: "WRITING", icon: "✏️" },
] as const;

export const practiceModules: PracticeModule[] = [
  // CHARACTERS
  {
    id: "kana-practice",
    title: "Kana Practice",
    description: "Practice hiragana and katakana with memory games, flashcards, and quizzes.",
    href: "/practice/kana",
    badge: "Active",
    badgeColor: "green",
    iconName: "book-a",
    category: "characters",
  },
  {
    id: "kana-speed",
    title: "Kana Speed Sprint",
    description: "How fast can you read kana? Type romaji as fast as possible in a 60-second timed sprint.",
    href: "/practice/kana-speed",
    badge: "Speed",
    badgeColor: "blue",
    iconName: "zap",
    category: "characters",
  },
  {
    id: "kanji-practice",
    title: "Kanji Practice",
    description: "Practice kanji recognition, readings, and meanings with JLPT level quizzes.",
    href: "/practice/kanji",
    badge: "Active",
    badgeColor: "green",
    iconName: "book-open-check",
    category: "characters",
  },
  {
    id: "radicals-practice",
    title: "Radicals Practice",
    description: "Learn and practice kanji radicals and components by JLPT level with breakdown drills.",
    href: "#",
    badge: "Upcoming",
    badgeColor: "purple",
    iconName: "puzzle",
    category: "characters",
    isUpcoming: true,
  },

  // GRAMMAR
  {
    id: "conjugation",
    title: "Verb & Adjective Conjugation",
    description: "Master 15 Japanese verb forms (Te, Nai, Ta, Potential, Passive, Conditional) across Godan & Ichidan.",
    href: "/practice/conjugation",
    badge: "Active",
    badgeColor: "green",
    iconName: "gamepad-2",
    category: "grammar",
  },
  {
    id: "numbers",
    title: "Numbers & Counters",
    description: "Master Japanese numbers, counters (本, 枚, 匹, つ), dates, and time listening drills.",
    href: "#",
    badge: "Upcoming",
    badgeColor: "purple",
    iconName: "calculator",
    category: "grammar",
    isUpcoming: true,
  },

  // READING & LISTENING
  {
    id: "reading",
    title: "Reading Comprehension",
    description: "Read graded Japanese stories and passages with interactive token tooltips and quiz checks.",
    href: "/practice/reading",
    badge: "Active",
    badgeColor: "green",
    iconName: "book-open",
    category: "reading_listening",
  },
  {
    id: "listening",
    title: "Listening Comprehension",
    description: "Listen to native Japanese audio words or sentences and pick the correct meaning.",
    href: "/practice/listening",
    badge: "Active",
    badgeColor: "green",
    iconName: "headphones",
    category: "reading_listening",
  },
  {
    id: "watch-listen",
    title: "Watch & Native Media",
    description: "Curated Japanese video clips and dialogue podcasts for authentic immersion.",
    href: "#",
    badge: "Upcoming",
    badgeColor: "purple",
    iconName: "play-circle",
    category: "reading_listening",
    isUpcoming: true,
  },

  // WRITING
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description: "Unscramble Japanese word tiles into grammatically correct sentence structures.",
    href: "#",
    badge: "Upcoming",
    badgeColor: "purple",
    iconName: "edit-3",
    category: "writing",
    isUpcoming: true,
  },
  {
    id: "story-builder",
    title: "Story & Essay Builder",
    description: "Compose Japanese paragraphs using target grammar points with instant lecturer feedback.",
    href: "#",
    badge: "Upcoming",
    badgeColor: "purple",
    iconName: "pen-tool",
    category: "writing",
    isUpcoming: true,
  },
];
