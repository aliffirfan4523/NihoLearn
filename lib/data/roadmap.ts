// ─── Gamified Learning Roadmap: Kana → N1 ─────────────────────────────────
// Designed by a Japanese lecturer to guide students from absolute zero to N1 fluency.

export type SubstepType =
  | "kana"
  | "vocabulary"
  | "kanji"
  | "grammar"
  | "reading"
  | "listening"
  | "exam";

export interface RoadmapSubstep {
  id: string;
  title: string;
  type: SubstepType;
  targetCount: number;
  targetLabel: string;
  href: string;
  unlockAfter?: string;
  unlockThreshold?: number;
  xpReward: number;
}

export interface SenseiBriefing {
  quote: string;
  quoteEn: string;
  focus: string;
  pitfall: string;
  studyHours: string;
  bossTitle: string;
  bossDescription: string;
}

export interface RoadmapStage {
  id: string;
  step: number;
  title: string;
  subtitle: string; // Japanese
  locationName: string; // Gamified RPG quest location (e.g. 始まりの社)
  danjTitle: string; // Dojo belt/rank title (e.g. 白帯 · Apprentice)
  description: string;
  color: string;
  bgColor: string;
  accentGradient: string;
  icon: string;
  crest: string;
  sensei: SenseiBriefing;
  substeps: RoadmapSubstep[];
  unlockAfterExam?: string;
}

// ─── Stage 0: Kana Foundation ──────────────────────────────────────────────

const kanaStage: RoadmapStage = {
  id: "kana",
  step: 0,
  title: "Kana Foundation",
  subtitle: "仮名の基礎",
  locationName: "始まりの社 · Shrine of Beginnings",
  danjTitle: "白帯 · White Belt Apprentice",
  description:
    "Master Hiragana and Katakana — the two fundamental phonetic alphabets of the Japanese language.",
  color: "text-purple-600 dark:text-purple-400",
  bgColor: "bg-purple-600",
  accentGradient: "from-purple-500/20 via-pink-500/10 to-indigo-500/20",
  icon: "あ",
  crest: "⛩️",
  sensei: {
    quote: "千里の道も一歩から (A journey of a thousand miles begins with a single step)",
    quoteEn: "Master the sounds and strokes early — treat Katakana just as seriously as Hiragana!",
    focus: "Phonetic accuracy, stroke order, and distinguishing similar kana (like ぬ vs め, シ vs ツ).",
    pitfall: "Neglecting Katakana because 'most words are in Hiragana'. Foreign loanwords are everywhere!",
    studyHours: "15–30 Hours",
    bossTitle: "Trial of the 46 Sounds (仮名の試練)",
    bossDescription: "50-question rapid recognition trial across Hiragana & Katakana with timer.",
  },
  substeps: [
    {
      id: "kana_hira_basic",
      title: "Hiragana Basics",
      type: "kana",
      targetCount: 46,
      targetLabel: "46 characters",
      href: "/progress/kana",
      xpReward: 100,
    },
    {
      id: "kana_hira_dakuten",
      title: "Hiragana Dakuten & Handakuten",
      type: "kana",
      targetCount: 25,
      targetLabel: "25 characters",
      href: "/progress/kana",
      unlockAfter: "kana_hira_basic",
      unlockThreshold: 0.5,
      xpReward: 150,
    },
    {
      id: "kana_hira_combo",
      title: "Hiragana Combinations",
      type: "kana",
      targetCount: 33,
      targetLabel: "33 characters",
      href: "/progress/kana",
      unlockAfter: "kana_hira_dakuten",
      unlockThreshold: 0.5,
      xpReward: 200,
    },
    {
      id: "kana_kata_basic",
      title: "Katakana Basics",
      type: "kana",
      targetCount: 46,
      targetLabel: "46 characters",
      href: "/progress/kana",
      unlockAfter: "kana_hira_basic",
      unlockThreshold: 0.8,
      xpReward: 150,
    },
    {
      id: "kana_kata_dakuten",
      title: "Katakana Dakuten & Handakuten",
      type: "kana",
      targetCount: 25,
      targetLabel: "25 characters",
      href: "/progress/kana",
      unlockAfter: "kana_kata_basic",
      unlockThreshold: 0.5,
      xpReward: 150,
    },
    {
      id: "kana_kata_combo",
      title: "Katakana Combinations",
      type: "kana",
      targetCount: 33,
      targetLabel: "33 characters",
      href: "/progress/kana",
      unlockAfter: "kana_kata_dakuten",
      unlockThreshold: 0.5,
      xpReward: 200,
    },
    {
      id: "kana_exam",
      title: "Kana Mastery Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=kana",
      unlockAfter: "kana_kata_combo",
      unlockThreshold: 0.6,
      xpReward: 500,
    },
  ],
};

// ─── Stage 1: N5 ───────────────────────────────────────────────────────────

const n5Stage: RoadmapStage = {
  id: "n5",
  step: 1,
  title: "N5 Beginner",
  subtitle: "日本語能力試験 N5",
  locationName: "桜の里 · Village of Cherry Blossoms",
  danjTitle: "五級 · Novice Explorer",
  description:
    "Build your first survival vocabulary, learn 100 essential Kanji, and grasp core particles (は, が, を, に, で).",
  color: "text-blue-600 dark:text-blue-400",
  bgColor: "bg-blue-600",
  accentGradient: "from-blue-500/20 via-cyan-500/10 to-indigo-500/20",
  icon: "五",
  crest: "🌸",
  unlockAfterExam: "kana_exam",
  sensei: {
    quote: "基礎固めがすべて (A solid foundation is everything)",
    quoteEn: "N5 is your survival kit. Focus on polite speech (です・ます) and mastering the Te-form (て形).",
    focus: "Basic daily verbs, numbers, times, directions, and essential question structures (何, どこ, いつ).",
    pitfall: "Confusing は (topic marker) and が (subject identifier). Practice with full simple sentences!",
    studyHours: "100–150 Hours",
    bossTitle: "JLPT N5 Boss Trial (五級の関所)",
    bossDescription: "55-question full simulation across Vocab, Kanji, Grammar & Reading comprehension.",
  },
  substeps: [
    {
      id: "n5_vocab",
      title: "N5 Vocabulary",
      type: "vocabulary",
      targetCount: 800,
      targetLabel: "800 words",
      href: "/n5/vocabulary",
      xpReward: 300,
    },
    {
      id: "n5_kanji",
      title: "N5 Kanji",
      type: "kanji",
      targetCount: 103,
      targetLabel: "103 characters",
      href: "/progress/kanji",
      unlockAfter: "n5_vocab",
      unlockThreshold: 0.3,
      xpReward: 300,
    },
    {
      id: "n5_grammar",
      title: "N5 Grammar",
      type: "grammar",
      targetCount: 146,
      targetLabel: "146 points",
      href: "/progress/grammar",
      unlockAfter: "n5_kanji",
      unlockThreshold: 0.3,
      xpReward: 350,
    },
    {
      id: "n5_reading",
      title: "N5 Sentence Building & Reading",
      type: "reading",
      targetCount: 30,
      targetLabel: "30 passages",
      href: "/practice/reading",
      unlockAfter: "n5_grammar",
      unlockThreshold: 0.5,
      xpReward: 250,
    },
    {
      id: "n5_listening",
      title: "N5 Listening Comprehension",
      type: "listening",
      targetCount: 20,
      targetLabel: "20 exercises",
      href: "/practice/listening",
      unlockAfter: "n5_reading",
      unlockThreshold: 0.5,
      xpReward: 250,
    },
    {
      id: "n5_exam",
      title: "N5 Mock Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=n5",
      unlockAfter: "n5_listening",
      unlockThreshold: 0.6,
      xpReward: 1000,
    },
  ],
};

// ─── Stage 2: N4 ───────────────────────────────────────────────────────────

const n4Stage: RoadmapStage = {
  id: "n4",
  step: 2,
  title: "N4 Elementary",
  subtitle: "日本語能力試験 N4",
  locationName: "城下町 · The Castle Town",
  danjTitle: "四級 · Conversationalist",
  description:
    "Master everyday conversational Japanese, verb conjugations (Potential, Passive, Conditional), and 300 Kanji.",
  color: "text-teal-600 dark:text-teal-400",
  bgColor: "bg-teal-600",
  accentGradient: "from-teal-500/20 via-emerald-500/10 to-cyan-500/20",
  icon: "四",
  crest: "🏯",
  unlockAfterExam: "n5_exam",
  sensei: {
    quote: "習うより慣れよ (Practice makes permanent)",
    quoteEn: "Conjugations become second nature here. Master the 15 verb forms and Godan/Ichidan groups!",
    focus: "Conditional forms (たら, なら, ば), give/receive verbs (あげる, もらう, くれる), and polite vs casual transitions.",
    pitfall: "Getting tripped up on keigo basics (尊敬語・謙譲語) and transitive vs intransitive verb pairs (開ける vs 開く).",
    studyHours: "200–300 Hours",
    bossTitle: "JLPT N4 Boss Trial (四級の城門)",
    bossDescription: "Timed multi-section exam testing intermediate conversational grammar and reading.",
  },
  substeps: [
    {
      id: "n4_vocab",
      title: "N4 Vocabulary",
      type: "vocabulary",
      targetCount: 1500,
      targetLabel: "1,500 words",
      href: "/n4/vocabulary",
      xpReward: 400,
    },
    {
      id: "n4_kanji",
      title: "N4 Kanji",
      type: "kanji",
      targetCount: 300,
      targetLabel: "300 characters",
      href: "/n4/kanji",
      unlockAfter: "n4_vocab",
      unlockThreshold: 0.3,
      xpReward: 400,
    },
    {
      id: "n4_grammar",
      title: "N4 Grammar",
      type: "grammar",
      targetCount: 120,
      targetLabel: "120 points",
      href: "/n4/grammar",
      unlockAfter: "n4_kanji",
      unlockThreshold: 0.3,
      xpReward: 450,
    },
    {
      id: "n4_reading",
      title: "N4 Sentence Patterns & Reading",
      type: "reading",
      targetCount: 40,
      targetLabel: "40 passages",
      href: "/practice/reading",
      unlockAfter: "n4_grammar",
      unlockThreshold: 0.5,
      xpReward: 350,
    },
    {
      id: "n4_listening",
      title: "N4 Listening Comprehension",
      type: "listening",
      targetCount: 25,
      targetLabel: "25 exercises",
      href: "/practice/listening",
      unlockAfter: "n4_reading",
      unlockThreshold: 0.5,
      xpReward: 350,
    },
    {
      id: "n4_exam",
      title: "N4 Mock Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=n4",
      unlockAfter: "n4_listening",
      unlockThreshold: 0.6,
      xpReward: 1500,
    },
  ],
};

// ─── Stage 3: N3 ───────────────────────────────────────────────────────────

const n3Stage: RoadmapStage = {
  id: "n3",
  step: 3,
  title: "N3 Intermediate",
  subtitle: "日本語能力試験 N3",
  locationName: "浪人の峠 · Ronin's Mountain Pass",
  danjTitle: "三級 · Intermediate Challenger",
  description:
    "The crucial bridge between textbook learning and native immersion. Understand natural speech and essays.",
  color: "text-amber-600 dark:text-amber-400",
  bgColor: "bg-amber-600",
  accentGradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
  icon: "三",
  crest: "🌊",
  unlockAfterExam: "n4_exam",
  sensei: {
    quote: "壁を破る時 (Time to break through the intermediate plateau)",
    quoteEn: "Start consuming real native Japanese: manga, anime with JP subtitles, and news articles with furigana.",
    focus: "Nuances between similar grammar points (わけではない vs はずがない vs に違いない) and compound kanji.",
    pitfall: "Translating everything into English in your head. Train your mind to think directly in Japanese sentences!",
    studyHours: "400–500 Hours",
    bossTitle: "JLPT N3 Boss Trial (中級の難所)",
    bossDescription: "Rigorous test with authentic speed listening and longer reading comprehension passages.",
  },
  substeps: [
    {
      id: "n3_vocab",
      title: "N3 Vocabulary",
      type: "vocabulary",
      targetCount: 3750,
      targetLabel: "3,750 words",
      href: "/n3/vocabulary",
      xpReward: 500,
    },
    {
      id: "n3_kanji",
      title: "N3 Kanji",
      type: "kanji",
      targetCount: 650,
      targetLabel: "650 characters",
      href: "/n3/kanji",
      unlockAfter: "n3_vocab",
      unlockThreshold: 0.3,
      xpReward: 500,
    },
    {
      id: "n3_grammar",
      title: "N3 Grammar",
      type: "grammar",
      targetCount: 124,
      targetLabel: "124 points",
      href: "/n3/grammar",
      unlockAfter: "n3_kanji",
      unlockThreshold: 0.3,
      xpReward: 550,
    },
    {
      id: "n3_reading",
      title: "N3 Reading Comprehension",
      type: "reading",
      targetCount: 50,
      targetLabel: "50 passages",
      href: "/practice/reading",
      unlockAfter: "n3_grammar",
      unlockThreshold: 0.5,
      xpReward: 450,
    },
    {
      id: "n3_listening",
      title: "N3 Listening & Conversation",
      type: "listening",
      targetCount: 30,
      targetLabel: "30 exercises",
      href: "/practice/listening",
      unlockAfter: "n3_reading",
      unlockThreshold: 0.5,
      xpReward: 450,
    },
    {
      id: "n3_exam",
      title: "N3 Mock Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=n3",
      unlockAfter: "n3_listening",
      unlockThreshold: 0.6,
      xpReward: 2000,
    },
  ],
};

// ─── Stage 4: N2 ───────────────────────────────────────────────────────────

const n2Stage: RoadmapStage = {
  id: "n2",
  step: 4,
  title: "N2 Upper-Intermediate",
  subtitle: "日本語能力試験 N2",
  locationName: "達人の道場 · Master's Dojo",
  danjTitle: "二級 · Fluency Master",
  description:
    "Business and academic Japanese. Read newspapers, understand lectures, and communicate fluently in work environments.",
  color: "text-rose-600 dark:text-rose-400",
  bgColor: "bg-rose-600",
  accentGradient: "from-rose-500/20 via-red-500/10 to-pink-500/20",
  icon: "二",
  crest: "⚔️",
  unlockAfterExam: "n3_exam",
  sensei: {
    quote: "実用と教養の融合 (Bridging practical utility and intellectual refinement)",
    quoteEn: "N2 is the gold standard for working in Japan. You can handle 90% of real-world Japanese communication!",
    focus: "Formal writing styles (である体), newspaper headlines, business etiquette, and rapid contextual inference.",
    pitfall: "Speed during the reading section. You must read passages in minutes without looking up dictionary entries.",
    studyHours: "600–800 Hours",
    bossTitle: "JLPT N2 Boss Trial (上級の試練)",
    bossDescription: "High-level timed exam with nuanced editorial articles, opinion pieces, and conversational audio.",
  },
  substeps: [
    {
      id: "n2_vocab",
      title: "N2 Vocabulary",
      type: "vocabulary",
      targetCount: 6000,
      targetLabel: "6,000 words",
      href: "/n2/vocabulary",
      xpReward: 600,
    },
    {
      id: "n2_kanji",
      title: "N2 Kanji",
      type: "kanji",
      targetCount: 1000,
      targetLabel: "1,000 characters",
      href: "/n2/kanji",
      unlockAfter: "n2_vocab",
      unlockThreshold: 0.3,
      xpReward: 600,
    },
    {
      id: "n2_grammar",
      title: "N2 Grammar",
      type: "grammar",
      targetCount: 173,
      targetLabel: "173 points",
      href: "/n2/grammar",
      unlockAfter: "n2_kanji",
      unlockThreshold: 0.3,
      xpReward: 650,
    },
    {
      id: "n2_reading",
      title: "N2 Long-form Reading",
      type: "reading",
      targetCount: 60,
      targetLabel: "60 passages",
      href: "/practice/reading",
      unlockAfter: "n2_grammar",
      unlockThreshold: 0.5,
      xpReward: 550,
    },
    {
      id: "n2_listening",
      title: "N2 Listening & Discussion",
      type: "listening",
      targetCount: 40,
      targetLabel: "40 exercises",
      href: "/practice/listening",
      unlockAfter: "n2_reading",
      unlockThreshold: 0.5,
      xpReward: 550,
    },
    {
      id: "n2_exam",
      title: "N2 Mock Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=n2",
      unlockAfter: "n2_listening",
      unlockThreshold: 0.6,
      xpReward: 3000,
    },
  ],
};

// ─── Stage 5: N1 ───────────────────────────────────────────────────────────

const n1Stage: RoadmapStage = {
  id: "n1",
  step: 5,
  title: "N1 Advanced",
  subtitle: "日本語能力試験 N1",
  locationName: "富士の頂 · Summit of Fuji",
  danjTitle: "初段 · Grand Champion (師範代)",
  description:
    "The pinnacle of Japanese proficiency. Comprehend highly complex essays, philosophical texts, and native nuances.",
  color: "text-red-700 dark:text-red-400",
  bgColor: "bg-red-700",
  accentGradient: "from-red-600/20 via-rose-600/10 to-amber-600/20",
  icon: "一",
  crest: "🗻",
  unlockAfterExam: "n2_exam",
  sensei: {
    quote: "極限の境地 (The realm of true mastery)",
    quoteEn: "N1 tests not just language, but cultural depth, abstract reasoning, and rhetorical elegance.",
    focus: "Classical remnants, proverbs (四字熟語), subtle emotional tone, and complex multi-layered syntax.",
    pitfall: "Overthinking tricky distractors in the listening section. Trust your native-level intuition!",
    studyHours: "900–1200 Hours",
    bossTitle: "JLPT N1 Grand Trial (最高峰の審判)",
    bossDescription: "The ultimate 90-minute trial testing academic prose, rapid-fire listening, and literary kanji.",
  },
  substeps: [
    {
      id: "n1_vocab",
      title: "N1 Vocabulary",
      type: "vocabulary",
      targetCount: 10000,
      targetLabel: "10,000+ words",
      href: "/n1/vocabulary",
      xpReward: 800,
    },
    {
      id: "n1_kanji",
      title: "N1 Kanji",
      type: "kanji",
      targetCount: 2136,
      targetLabel: "2,136 characters",
      href: "/n1/kanji",
      unlockAfter: "n1_vocab",
      unlockThreshold: 0.3,
      xpReward: 800,
    },
    {
      id: "n1_grammar",
      title: "N1 Grammar",
      type: "grammar",
      targetCount: 244,
      targetLabel: "244 points",
      href: "/n1/grammar",
      unlockAfter: "n1_kanji",
      unlockThreshold: 0.3,
      xpReward: 850,
    },
    {
      id: "n1_reading",
      title: "N1 Academic Reading & Essays",
      type: "reading",
      targetCount: 80,
      targetLabel: "80 passages",
      href: "/practice/reading",
      unlockAfter: "n1_grammar",
      unlockThreshold: 0.5,
      xpReward: 700,
    },
    {
      id: "n1_listening",
      title: "N1 Advanced Listening",
      type: "listening",
      targetCount: 50,
      targetLabel: "50 exercises",
      href: "/practice/listening",
      unlockAfter: "n1_reading",
      unlockThreshold: 0.5,
      xpReward: 700,
    },
    {
      id: "n1_exam",
      title: "N1 Mock Exam",
      type: "exam",
      targetCount: 1,
      targetLabel: "Pass with ≥60%",
      href: "/practice/exam?level=n1",
      unlockAfter: "n1_listening",
      unlockThreshold: 0.6,
      xpReward: 5000,
    },
  ],
};

// ─── Stage 6: Mastery ──────────────────────────────────────────────────────

const masteryStage: RoadmapStage = {
  id: "mastery",
  step: 6,
  title: "Mastery",
  subtitle: "日本語マスター · 名人",
  locationName: "栄光の殿堂 · Hall of Legends",
  danjTitle: "宗家 · Grandmaster of Japanese",
  description:
    "Congratulations! You have conquered the entire curriculum, passed the N1 trial, and achieved full Japanese mastery.",
  color: "text-yellow-600 dark:text-yellow-400",
  bgColor: "bg-yellow-500",
  accentGradient: "from-yellow-500/20 via-amber-500/20 to-orange-500/20",
  icon: "👑",
  crest: "🏆",
  unlockAfterExam: "n1_exam",
  sensei: {
    quote: "免許皆伝 (Full mastery of all arts)",
    quoteEn: "You are now a true master. Japanese is no longer a study subject — it is your second voice.",
    focus: "Enjoying literature, speaking naturally with native speakers, and continuing lifelong exploration.",
    pitfall: "Forgetting to practice! Language is a living art that blooms with daily use.",
    studyHours: "1200+ Total Hours",
    bossTitle: "Mastery Crown",
    bossDescription: "Permanent recognition as a certified NihoLearn Grandmaster.",
  },
  substeps: [],
};

// ─── Exports ───────────────────────────────────────────────────────────────

export const roadmapStages: RoadmapStage[] = [
  kanaStage,
  n5Stage,
  n4Stage,
  n3Stage,
  n2Stage,
  n1Stage,
  masteryStage,
];

export const allSubsteps: RoadmapSubstep[] = roadmapStages.flatMap(
  (s) => s.substeps
);

export function computeUnlockedSubsteps(
  completions: Record<string, number>,
  passedExams: Set<string>
): Set<string> {
  const unlocked = new Set<string>();

  for (const stage of roadmapStages) {
    if (stage.unlockAfterExam && !passedExams.has(stage.unlockAfterExam)) {
      continue;
    }

    for (const sub of stage.substeps) {
      if (!sub.unlockAfter) {
        unlocked.add(sub.id);
      } else {
        const prereqCompletion = completions[sub.unlockAfter] ?? 0;
        const threshold = sub.unlockThreshold ?? 0;
        if (prereqCompletion >= threshold) {
          unlocked.add(sub.id);
        }
      }
    }
  }

  return unlocked;
}

export const substepTypeConfig: Record<
  SubstepType,
  { emoji: string; label: string; bgClass: string; textClass: string }
> = {
  kana: { emoji: "あ", label: "Kana", bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400", textClass: "text-purple-600" },
  vocabulary: { emoji: "📖", label: "Vocabulary", bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400", textClass: "text-blue-600" },
  kanji: { emoji: "漢", label: "Kanji", bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", textClass: "text-emerald-600" },
  grammar: { emoji: "📝", label: "Grammar", bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400", textClass: "text-amber-600" },
  reading: { emoji: "📕", label: "Reading", bgClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400", textClass: "text-teal-600" },
  listening: { emoji: "🎧", label: "Listening", bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400", textClass: "text-rose-600" },
  exam: { emoji: "⚔️", label: "Boss Exam", bgClass: "bg-[#C84B31]/10 text-[#C84B31] dark:text-[#E85C40]", textClass: "text-[#C84B31]" },
};
