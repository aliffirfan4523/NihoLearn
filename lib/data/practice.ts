export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "purple" | "amber";
  iconName: string;
  category: "characters" | "grammar" | "reading_listening" | "writing";
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
    description: "Practice hiragana and katakana with memory games and writing exercises.",
    href: "/practice/kana",
    badge: "Start here",
    badgeColor: "green",
    iconName: "book-a",
    category: "characters",
  },
  {
    id: "kana-speed",
    title: "Kana Speed",
    description: "How fast can you read kana? Type romaji as fast as possible in a timed sprint.",
    href: "/practice/kana-speed",
    badge: "New",
    badgeColor: "blue",
    iconName: "zap",
    category: "characters",
  },
  {
    id: "kanji-practice",
    title: "Kanji Practice",
    description: "Practice kanji recognition and reading with JLPT level quizzes.",
    href: "/practice/kanji",
    iconName: "book-open-check",
    category: "characters",
  },
  {
    id: "radicals-practice",
    title: "Radicals Practice",
    description: "Learn and practice kanji radicals by JLPT level with flashcards and quizzes.",
    href: "/progress/kanji",
    badge: "Pro",
    badgeColor: "amber",
    iconName: "puzzle",
    category: "characters",
  },

  // GRAMMAR
  {
    id: "conjugation",
    title: "Conjugation",
    description: "Learn Japanese verb and adjective conjugations with fun exercises.",
    href: "/practice/conjugation",
    iconName: "gamepad-2",
    category: "grammar",
  },
  {
    id: "numbers",
    title: "Numbers",
    description: "Learn Japanese numbers through listening and reading exercises.",
    href: "/practice/listening",
    badge: "Pro",
    badgeColor: "amber",
    iconName: "calculator",
    category: "grammar",
  },

  // READING & LISTENING
  {
    id: "reading",
    title: "Reading",
    description: "Read Japanese texts with vocabulary help and grammar tips.",
    href: "/practice/reading",
    iconName: "book-open",
    category: "reading_listening",
  },
  {
    id: "listening",
    title: "Listening",
    description: "Hear words or full sentences and pick the correct meaning. Trains audio recognition.",
    href: "/practice/listening",
    iconName: "headphones",
    category: "reading_listening",
  },
  {
    id: "watch-listen",
    title: "Watch & Listen",
    description: "Curated JLPT videos and podcasts. Train long-form listening for the real exam.",
    href: "/practice/reading",
    badge: "New",
    badgeColor: "blue",
    iconName: "play-circle",
    category: "reading_listening",
  },

  // WRITING
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description: "Build Japanese sentences and get instant feedback.",
    href: "/practice/reading",
    badge: "Pro",
    badgeColor: "amber",
    iconName: "edit-3",
    category: "writing",
  },
  {
    id: "story-builder",
    title: "Story Builder",
    description: "Create stories using Japanese vocabulary and grammar.",
    href: "/practice/reading",
    badge: "Pro",
    badgeColor: "amber",
    iconName: "pen-tool",
    category: "writing",
  },
];
