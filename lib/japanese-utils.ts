// Japanese text processing, Romaji-to-Kana converter, diff engine, and audio FX

// ── 1. Romaji to Hiragana Mapping ──
const ROMAJI_TO_HIRA: Record<string, string> = {
  // Vowels
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  // K-row
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  // G-row (dakuten)
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  // S-row
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  sha: "しゃ", shu: "しゅ", sho: "しょ",
  // Z/J-row
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ja: "じゃ", ju: "じゅ", jo: "じょ",
  jya: "じゃ", jyu: "じゅ", jyo: "じょ",
  // T-row
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ",
  tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
  // D-row
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  dya: "ぢゃ", dyu: "ぢゅ", dyo: "ぢょ",
  // N-row
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  // H-row
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  // B-row
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  // P-row
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  // M-row
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  // Y-row
  ya: "や", yu: "ゆ", yo: "よ",
  // R-row
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  // W-row
  wa: "わ", wi: "うぃ", we: "うぇ", wo: "を",
  // Special
  n: "ん", nn: "ん",
  "-": "ー",
};

/**
 * Converts romaji text into Hiragana.
 * Handles sokuon (small tsu like 'kk' -> 'っk') and 'nn' -> 'ん'.
 */
export function romajiToHiragana(input: string): string {
  if (!input) return "";
  let text = input.toLowerCase();

  // Replace double letters with small tsu (except nn)
  text = text.replace(/([bcdfghjklmpqrstvwxyz])\1/g, (match, char) => {
    if (char === "n") return "nn";
    return "っ" + char;
  });

  // Long vowels / macrons
  text = text.replace(/ā/g, "ああ").replace(/ī/g, "いい").replace(/ū/g, "うう").replace(/ē/g, "ええ").replace(/ō/g, "おう");

  // Greedy match longest chunks
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "っ") {
      result += "っ";
      i++;
      continue;
    }

    // Try 4 chars, 3 chars, 2 chars, 1 char
    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const sub = text.substring(i, i + len);
      if (ROMAJI_TO_HIRA[sub]) {
        // Guard for single 'n': only convert to 'ん' if at the end or followed by a consonant (not vowel/y)
        if (sub === "n") {
          const nextChar = text[i + 1];
          if (nextChar && /[aeiouy]/.test(nextChar)) {
            // Wait for next vowel
            continue;
          }
        }
        result += ROMAJI_TO_HIRA[sub];
        i += len;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += text[i];
      i++;
    }
  }

  return result;
}

/**
 * Normalizes Japanese text by stripping spaces, symbols, and punctuation.
 */
export function normalizeJapanese(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\s\u3000\t\n\r]+/g, "") // Whitespace
    .replace(/[、。，．！？!?~〜・…\-–—:;\"'""''()（）[\]「」『』]/g, "") // Punctuation
    .toLowerCase()
    .trim();
}

/**
 * Converts Katakana to Hiragana for unified comparison.
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (match) => {
    const code = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(code);
  });
}

// ── 1b. Hiragana → Romaji (deterministic, used to backfill DB romaji) ──
const HIRA_TO_ROMAJI: Record<string, string> = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "wo", ん: "n", ゔ: "vu",
  // Small vowels (loanword spellings)
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  // Youon (combos) — 2-char keys matched greedily
  きゃ: "kya", きゅ: "kyu", きょ: "kyo", ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", じゃ: "ja", じゅ: "ju", じょ: "jo",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ぢゃ: "ja", ぢゅ: "ju", ぢょ: "jo",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo", びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  てぃ: "ti", てゅ: "tyu", でぃ: "di", でゅ: "dyu", とぅ: "tu", どぅ: "du",
  ちぇ: "che", しぇ: "she", じぇ: "je",
};

/**
 * Converts kana text (hiragana or katakana) into romaji.
 * Handles youon (きゃ), sokuon (っ), and the long-vowel mark (ー → "-").
 * Non-kana characters (kanji, punctuation) pass through unchanged.
 */
export function kanaToRomaji(text: string): string {
  if (!text) return "";
  const hira = katakanaToHiragana(text);

  let result = "";
  let i = 0;
  while (i < hira.length) {
    const ch = hira[i];

    // Sokuon: double the next mora's leading consonant
    if (ch === "っ") {
      const next = hira.substring(i + 1, i + 3);
      const nextRomaji =
        HIRA_TO_ROMAJI[next] ?? HIRA_TO_ROMAJI[hira[i + 1]] ?? "";
      const lead = nextRomaji.charAt(0);
      if (lead && !"aiueon".includes(lead)) result += lead;
      i++;
      continue;
    }

    // Long vowel mark maps to "-" (round-trips via romajiToHiragana)
    if (ch === "ー") {
      result += "-";
      i++;
      continue;
    }

    // Greedy 2-char (youon) then 1-char match
    const pair = hira.substring(i, i + 2);
    if (HIRA_TO_ROMAJI[pair]) {
      result += HIRA_TO_ROMAJI[pair];
      i += 2;
      continue;
    }
    if (HIRA_TO_ROMAJI[ch]) {
      result += HIRA_TO_ROMAJI[ch];
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

// ── 2. Character-by-Character Diff Engine ──

export interface DiffChar {
  char: string;
  type: "correct" | "incorrect" | "missing" | "extra";
}

/**
 * Calculates character-by-character diff using LCS (Longest Common Subsequence).
 */
export function diffJapaneseText(inputRaw: string, targetRaw: string): { diff: DiffChar[]; accuracy: number } {
  const input = normalizeJapanese(inputRaw);
  const target = normalizeJapanese(targetRaw);

  if (!input && !target) return { diff: [], accuracy: 100 };
  if (!input) {
    return {
      diff: target.split("").map((c) => ({ char: c, type: "missing" })),
      accuracy: 0,
    };
  }
  if (!target) {
    return {
      diff: input.split("").map((c) => ({ char: c, type: "extra" })),
      accuracy: 0,
    };
  }

  const m = input.length;
  const n = target.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (input[i] === target[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff: DiffChar[] = [];
  let i = m;
  let j = n;
  let matches = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && input[i - 1] === target[j - 1]) {
      diff.unshift({ char: input[i - 1], type: "correct" });
      matches++;
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ char: target[j - 1], type: "missing" });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ char: input[i - 1], type: "extra" });
      i--;
    }
  }

  const maxLength = Math.max(m, n);
  const accuracy = Math.round((matches / maxLength) * 100);

  return { diff, accuracy };
}

/**
 * Smart fuzzy matching against Japanese text, Hiragana reading, and Romaji.
 */
export function verifyDictationInput(
  rawInput: string,
  exercise: { japanese: string; reading: string; romaji?: string }
): {
  isMatch: boolean;
  score: number;
  bestDiff: DiffChar[];
  matchedTarget: string;
} {
  const cleanInput = rawInput.trim();
  const hiraInput = romajiToHiragana(cleanInput);

  // Compare against:
  // 1. Target Reading (Hiragana)
  // 2. Target Japanese (Kanji/Kana)
  // 3. Romaji (if user typed pure romaji)

  const diffReading = diffJapaneseText(katakanaToHiragana(hiraInput), katakanaToHiragana(exercise.reading));
  const diffJapanese = diffJapaneseText(cleanInput, exercise.japanese);
  const diffRomaji = exercise.romaji
    ? diffJapaneseText(cleanInput.toLowerCase(), exercise.romaji.toLowerCase())
    : { diff: [], accuracy: 0 };

  const bestScore = Math.max(diffReading.accuracy, diffJapanese.accuracy, diffRomaji.accuracy);

  let bestDiff = diffReading.diff;
  let matchedTarget = exercise.reading;

  if (diffJapanese.accuracy >= diffReading.accuracy && diffJapanese.accuracy >= diffRomaji.accuracy) {
    bestDiff = diffJapanese.diff;
    matchedTarget = exercise.japanese;
  } else if (diffRomaji.accuracy > diffReading.accuracy && diffRomaji.accuracy > diffJapanese.accuracy) {
    bestDiff = diffRomaji.diff;
    matchedTarget = exercise.romaji || exercise.reading;
  }

  // Exact or near-perfect match (>= 85%)
  const isMatch = bestScore >= 85;

  return {
    isMatch,
    score: bestScore,
    bestDiff,
    matchedTarget,
  };
}

// ── 3. Web Audio SFX Synthesizer (Zero asset dependency) ──

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Laser blast sound for shooting falling words
   */
  playLaser() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  /**
   * Correct chime (dual-tone harmonic ping)
   */
  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.36);
      });
    } catch {}
  }

  /**
   * Wrong / Damage buzzer
   */
  playWrong() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * Combo fanfare / Power-up sound
   */
  playCombo() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.26);
      });
    } catch {}
  }
}

export const sfx = new SoundEffects();
