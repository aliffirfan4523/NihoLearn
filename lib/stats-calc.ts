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
  kanaProgressCount: number = 0,
  tzOffset: number = 0
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

  // 1. Calculate Streak using user's local timezone adjusted date strings
  const uniqueDates = Array.from(
    new Set(
      sessions
        .filter((s) => s && s.date)
        .map((s) => {
          // Adjust UTC to user's local time (tzOffset is in minutes, e.g. -480 for GMT+8)
          const d = new Date(new Date(s.date).getTime() - tzOffset * 60 * 1000);
          if (isNaN(d.getTime())) return "";
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
            d.getUTCDate()
          ).padStart(2, "0")}`;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => (a > b ? -1 : 1)); // newest first

  const clientNow = new Date(Date.now() - tzOffset * 60 * 1000);
  const todayStr = `${clientNow.getUTCFullYear()}-${String(clientNow.getUTCMonth() + 1).padStart(2, "0")}-${String(
    clientNow.getUTCDate()
  ).padStart(2, "0")}`;

  const clientYesterday = new Date(Date.now() - tzOffset * 60 * 1000 - 24 * 60 * 60 * 1000);
  const yesterdayStr = `${clientYesterday.getUTCFullYear()}-${String(clientYesterday.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(clientYesterday.getUTCDate()).padStart(2, "0")}`;

  let streak = 0;
  let expectedDate: Date | null = null;

  // Check if user practiced today or yesterday in their local timezone
  if (uniqueDates.includes(todayStr)) {
    expectedDate = new Date(clientNow);
  } else if (uniqueDates.includes(yesterdayStr)) {
    expectedDate = new Date(clientYesterday);
  } else {
    // Streak broken
    expectedDate = null;
  }

  if (expectedDate) {
    let checkDate = new Date(expectedDate);
    while (true) {
      const checkStr = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(checkDate.getUTCDate()).padStart(2, "0")}`;

      if (uniqueDates.includes(checkStr)) {
        streak++;
        // Go back 24 hours
        checkDate.setTime(checkDate.getTime() - 24 * 60 * 60 * 1000);
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
