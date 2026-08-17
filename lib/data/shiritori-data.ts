// Shiritori Japanese Word Chain Data & Rules Engine

export interface ShiritoriWord {
  word: string;
  reading: string; // Hiragana reading
  romaji: string;
  meaning: string;
  startKana: string;
  endKana: string;
}

export interface OpponentProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  level: "Beginner" | "Intermediate" | "Master";
  description: string;
  winQuote: string;
  loseQuote: string;
  thinkDelayMs: number;
}

export const OPPONENTS: OpponentProfile[] = [
  {
    id: "tanaka",
    name: "田中先生 (Tanaka-Sensei)",
    title: "Gentle Academy Teacher",
    avatar: "👨‍🏫",
    level: "Beginner",
    description: "Tanaka-Sensei loves helping students expand their everyday vocabulary.",
    winQuote: "素晴らしいですね！あなたの語彙力に感心しました。(Wonderful! I am impressed by your vocabulary.)",
    loseQuote: "あっ、私の負けですね！お見事でした！(Ah, my loss! Splendid game!)",
    thinkDelayMs: 1200,
  },
  {
    id: "sakura",
    name: "さくら (Sakura-chan)",
    title: "Enthusiastic High Schooler",
    avatar: "🌸",
    level: "Intermediate",
    description: "Sakura knows lots of trendy words, animals, food, and pop culture terms.",
    winQuote: "やったー！私の勝ちだよ！また勝負しようね！(Yay! I won! Let's play again!)",
    loseQuote: "えぇー！「ん」で終わっちゃった！もう一回！(Ehh! I ended on 'n'! One more time!)",
    thinkDelayMs: 900,
  },
  {
    id: "kenshin",
    name: "剣心師範 (Master Kenshin)",
    title: "Ancient Wordblade Samurai",
    avatar: "⚔️",
    level: "Master",
    description: "A master of deep traditional Japanese, four-character idioms, and tricky terminal mora.",
    winQuote: "我が言の葉の刃、見事にかわしてみせよ！(Parry the blade of my words if you can!)",
    loseQuote: "ぬぅ…見事な言葉遣い。我が敗北を認めよう。(Ngh... superb wording. I concede my defeat.)",
    thinkDelayMs: 600,
  },
];

/**
 * Extracts the effective ending kana for Shiritori chaining.
 * - Handles small kana (ゃ, ゅ, ょ, っ) -> maps to normal or accepts both
 * - Handles long vowel 'ー' -> matches previous vowel mora
 */
export function getShiritoriEndKana(reading: string): string {
  if (!reading) return "";
  const last = reading.slice(-1);

  if (last === "ー") {
    if (reading.length < 2) return "あ";
    const secondLast = reading.slice(-2, -1);
    // Vowel of second last
    const aVowels = "ああかがさざただなはばぱまやらわ";
    const iVowels = "いいきぎしじちぢにひびぴみり";
    const uVowels = "ううくぐすずつづぬふぶぷむゆる";
    const eVowels = "ええけげせぜてでねへべぺめれ";
    const oVowels = "おおこごそぞとどのほぼぽもよろを";

    if (aVowels.includes(secondLast)) return "あ";
    if (iVowels.includes(secondLast)) return "い";
    if (uVowels.includes(secondLast)) return "う";
    if (eVowels.includes(secondLast)) return "い"; // e.g. ケーキ -> き
    if (oVowels.includes(secondLast)) return "う"; // e.g. タロー -> ろ
    return "う";
  }

  // Small kana normalization
  const smallMap: Record<string, string> = {
    ぁ: "あ", ぃ: "い", ぅ: "う", ぇ: "え", ぉ: "お",
    ゃ: "や", ゅ: "ゆ", ょ: "よ",
    っ: "つ",
    ゎ: "わ",
  };

  return smallMap[last] || last;
}

/**
 * Extracts the starting kana of a reading.
 */
export function getShiritoriStartKana(reading: string): string {
  if (!reading) return "";
  const first = reading[0];
  return first;
}
