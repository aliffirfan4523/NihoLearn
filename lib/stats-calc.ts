export interface StudySessionItem {
  id?: string;
  userId?: string;
  date: Date | string;
  durationMinutes?: number | null;
  level?: string | null;
  activities?: string | string[] | null;
  wordsReviewed?: number | null;
  kanjiReviewed?: number | null;
  notes?: string | null;
}

export interface CalculatedUserStats {
  streak: number;
  totalStudiedMinutes: number;
  totalSessions: number;
  kanaReviews: number;
  kanaAttempts: number;
  kanaAnswers: number;
  kanaAccuracy: number;
  favoriteKana: { char: string; emoji: string };
}

export function calculateUserStreakAndStats(
  sessions: StudySessionItem[],
  kanaProgressCount: number = 0
): CalculatedUserStats {
  if (!sessions || sessions.length === 0) {
    return {
      streak: 0,
      totalStudiedMinutes: 0,
      totalSessions: 0,
      kanaReviews: kanaProgressCount,
      kanaAttempts: 0,
      kanaAnswers: 0,
      kanaAccuracy: 0,
      favoriteKana: { char: "あ", emoji: "🌸" },
    };
  }

  // 1. Calculate Streak
  // Get unique local dates (YYYY-MM-DD)
  const uniqueDates = Array.from(
    new Set(
      sessions
        .filter((s) => s && s.date)
        .map((s) => {
          const d = new Date(s.date);
          if (isNaN(d.getTime())) return "";
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")}`;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => (a > b ? -1 : 1)); // newest first

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(yesterday.getDate()).padStart(2, "0")}`;

  let streak = 0;
  let expectedDate = new Date();

  // Check if user practiced today or yesterday
  if (uniqueDates.includes(todayStr)) {
    expectedDate = new Date();
  } else if (uniqueDates.includes(yesterdayStr)) {
    expectedDate = new Date(yesterday);
  } else {
    // Streak broken
    expectedDate = new Date(0);
  }

  if (expectedDate.getTime() > 0) {
    let checkDate = new Date(expectedDate);
    while (true) {
      const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(checkDate.getDate()).padStart(2, "0")}`;

      if (uniqueDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 2. Aggregate Kana Practice stats
  let totalStudiedMinutes = 0;
  let kanaReviews = kanaProgressCount;
  let kanaAttempts = 0;
  let kanaAnswers = 0;
  let kanaCorrect = 0;

  for (const s of sessions) {
    if (!s) continue;
    totalStudiedMinutes += Number(s.durationMinutes || 0);

    const actStr = Array.isArray(s.activities)
      ? s.activities.join(" ").toLowerCase()
      : typeof s.activities === "string"
      ? s.activities.toLowerCase()
      : "";

    const levelStr = typeof s.level === "string" ? s.level.toLowerCase() : "";

    const isKanaSession =
      levelStr === "kana" ||
      actStr.includes("kana") ||
      actStr.includes("kana-practice");

    if (isKanaSession) {
      kanaAttempts += 1;
      const count = Number(s.wordsReviewed || 0);
      kanaAnswers += count;
      kanaReviews += count;

      // Try parsing notes if it contains accuracy
      if (s.notes) {
        try {
          const parsed = JSON.parse(s.notes);
          if (parsed.score !== undefined) {
            kanaCorrect += Number(parsed.score);
          } else if (parsed.accuracy !== undefined) {
            kanaCorrect += Math.round((Number(parsed.accuracy) / 100) * count);
          } else {
            kanaCorrect += Math.round(count * 0.85); // fallback estimate
          }
        } catch {
          kanaCorrect += Math.round(count * 0.85);
        }
      } else {
        kanaCorrect += Math.round(count * 0.85);
      }
    }
  }

  const kanaAccuracy =
    kanaAnswers > 0
      ? Number(((kanaCorrect / kanaAnswers) * 100).toFixed(1))
      : kanaAttempts > 0
      ? 100.0
      : 0;

  return {
    streak,
    totalStudiedMinutes,
    totalSessions: sessions.length,
    kanaReviews,
    kanaAttempts,
    kanaAnswers,
    kanaAccuracy,
    favoriteKana: { char: "あ", emoji: "🌸" },
  };
}
