export interface DailyQuestion {
  id: string;
  category: "kanji" | "vocabulary" | "grammar" | "audio" | "culture";
  typeLabel: string;
  prompt: string;
  subtitle?: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  details?: {
    kanji?: string;
    reading?: string;
    romaji?: string;
    meaning?: string;
  };
}
