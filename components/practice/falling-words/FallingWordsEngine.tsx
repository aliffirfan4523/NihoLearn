"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Heart,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  ArrowLeft,
  Snowflake,
  Sparkles,
  Play,
  Settings2,
  X,
  CheckCircle2,
} from "lucide-react";
import { hiraganaSeed } from "@/lib/data/hiragana";
import { katakanaSeed } from "@/lib/data/katakana";
import { playJapaneseAudio } from "@/lib/audio";
import { sfx, romajiToHiragana, normalizeJapanese } from "@/lib/japanese-utils";

export interface FallingWord {
  id: string;
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  x: number; // Percentage (15% to 80%)
  y: number; // Percentage (0% to 100%)
  speed: number; // % per second (~10-15%/s)
  powerUp?: "bomb" | "freeze" | "heart";
  isBlasted?: boolean;
  pointsGained?: number;
}

export type DisplayHintMode = "full" | "no_romaji" | "kanji_only" | "meaning_only";
export type InputAcceptMode = "all" | "japanese_only" | "romaji_only";

const FALLING_VOCAB_PRESETS = [
  { word: "水", reading: "みず", romaji: "mizu", meaning: "water" },
  { word: "火", reading: "ひ", romaji: "hi", meaning: "fire" },
  { word: "木", reading: "き", romaji: "ki", meaning: "tree" },
  { word: "猫", reading: "ねこ", romaji: "neko", meaning: "cat" },
  { word: "犬", reading: "いぬ", romaji: "inu", meaning: "dog" },
  { word: "車", reading: "くるま", romaji: "kuruma", meaning: "car" },
  { word: "本", reading: "ほん", romaji: "hon", meaning: "book" },
  { word: "雨", reading: "あめ", romaji: "ame", meaning: "rain" },
  { word: "空", reading: "そら", romaji: "sora", meaning: "sky" },
  { word: "海", reading: "うみ", romaji: "umi", meaning: "sea" },
  { word: "山", reading: "やま", romaji: "yama", meaning: "mountain" },
  { word: "川", reading: "かわ", romaji: "kawa", meaning: "river" },
  { word: "魚", reading: "さかな", romaji: "sakana", meaning: "fish" },
  { word: "鳥", reading: "とり", romaji: "tori", meaning: "bird" },
  { word: "花", reading: "はな", romaji: "hana", meaning: "flower" },
  { word: "春", reading: "はる", romaji: "haru", meaning: "spring" },
  { word: "夏", reading: "なつ", romaji: "natsu", meaning: "summer" },
  { word: "秋", reading: "あき", romaji: "aki", meaning: "autumn" },
  { word: "冬", reading: "ふゆ", romaji: "fuyu", meaning: "winter" },
  { word: "月", reading: "つき", romaji: "tsuki", meaning: "moon" },
  { word: "星", reading: "ほし", romaji: "hoshi", meaning: "star" },
  { word: "友達", reading: "ともだち", romaji: "tomodachi", meaning: "friend" },
  { word: "先生", reading: "せんせい", romaji: "sensei", meaning: "teacher" },
  { word: "学校", reading: "がっこう", romaji: "gakkou", meaning: "school" },
  { word: "時間", reading: "じかん", romaji: "jikan", meaning: "time" },
  { word: "電車", reading: "でんしゃ", romaji: "densha", meaning: "train" },
  { word: "電話", reading: "でんわ", romaji: "denwa", meaning: "phone" },
  { word: "今日", reading: "きょう", romaji: "kyou", meaning: "today" },
  { word: "明日", reading: "あした", romaji: "ashita", meaning: "tomorrow" },
  { word: "昨日", reading: "きのう", romaji: "kinou", meaning: "yesterday" },
  { word: "部屋", reading: "へや", romaji: "heya", meaning: "room" },
  { word: "机", reading: "つくえ", romaji: "tsukue", meaning: "desk" },
  { word: "椅子", reading: "いす", romaji: "isu", meaning: "chair" },
  { word: "桜", reading: "さくら", romaji: "sakura", meaning: "cherry blossom" },
  { word: "太陽", reading: "たいよう", romaji: "taiyou", meaning: "sun" },
  { word: "心", reading: "こころ", romaji: "kokoro", meaning: "heart" },
  { word: "夢", reading: "ゆめ", romaji: "yume", meaning: "dream" },
  { word: "力", reading: "ちから", romaji: "chikara", meaning: "power" },
];

export function FallingWordsEngine() {
  const [gameMode, setGameMode] = useState<"n5" | "kana" | "mixed">("n5");
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [displayHintMode, setDisplayHintMode] = useState<DisplayHintMode>("no_romaji");
  const [inputAcceptMode, setInputAcceptMode] = useState<InputAcceptMode>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Words & Stats
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [destroyedCount, setDestroyedCount] = useState(0);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0);
  const [lastMatchNotice, setLastMatchNotice] = useState<string | null>(null);

  // Controlled Typing Input
  const [typedInput, setTypedInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mutable Game Refs to prevent stale closures in the 33ms interval loop
  const wordsRef = useRef<FallingWord[]>([]);
  const levelRef = useRef(1);
  const soundRef = useRef(true);
  const freezeRef = useRef(0);
  const scoreMultRef = useRef(1.0);
  const nextWordIdRef = useRef(1);

  levelRef.current = level;
  soundRef.current = soundEnabled;
  freezeRef.current = freezeTimeLeft;

  const scoreMultiplier = useMemo(() => {
    let mult = 1.0;
    if (displayHintMode === "no_romaji") mult *= 1.2;
    else if (displayHintMode === "kanji_only") mult *= 1.5;
    else if (displayHintMode === "meaning_only") mult *= 1.4;
    if (inputAcceptMode === "japanese_only") mult *= 1.3;
    else if (inputAcceptMode === "romaji_only") mult *= 1.1;
    return Math.round(mult * 100) / 100;
  }, [displayHintMode, inputAcceptMode]);

  scoreMultRef.current = scoreMultiplier;

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem("niholearn-falling-words-highscore");
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {}
  }, []);

  // Save Session on Game Over
  useEffect(() => {
    if (gameState === "gameover") {
      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem("niholearn-falling-words-highscore", score.toString());
        } catch {}
      }

      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round(destroyedCount / 10)),
          level: gameMode === "kana" ? "Kana" : "N5",
          activities: ["falling-words", "arcade", "typing-recall"],
          wordsReviewed: destroyedCount,
          notes: JSON.stringify({
            score,
            levelReached: level,
            maxCombo,
            mode: gameMode,
            multiplier: scoreMultiplier,
          }),
        }),
      }).catch(() => {});
    }
  }, [gameState, score, highScore, destroyedCount, level, maxCombo, gameMode, scoreMultiplier]);

  // Generate word pool
  const getWordPool = useCallback(() => {
    if (gameMode === "kana") {
      return [...hiraganaSeed, ...katakanaSeed].map((k) => ({
        word: k.character || "",
        reading: k.character || "",
        romaji: k.romaji || "",
        meaning: k.romaji || "",
      }));
    }
    if (gameMode === "n5") {
      return FALLING_VOCAB_PRESETS;
    }
    return [
      ...FALLING_VOCAB_PRESETS,
      ...hiraganaSeed.slice(0, 20).map((k) => ({
        word: k.character || "",
        reading: k.character || "",
        romaji: k.romaji || "",
        meaning: k.romaji || "",
      })),
    ];
  }, [gameMode]);

  // Clear Input helper
  const clearInput = useCallback(() => {
    setTypedInput("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // Freeze countdown interval
  useEffect(() => {
    if (freezeTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setFreezeTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [freezeTimeLeft]);

  // ────────────────────────────────────────────────────────────────────────────
  // START GAME
  // ────────────────────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const pool = getWordPool();
    const idx1 = Math.floor(Math.random() * pool.length);
    let idx2 = Math.floor(Math.random() * pool.length);
    if (idx2 === idx1 && pool.length > 1) idx2 = (idx1 + 1) % pool.length;

    const initialWords: FallingWord[] = [
      {
        id: `fw-${nextWordIdRef.current++}`,
        word: pool[idx1]?.word || "水",
        reading: pool[idx1]?.reading || "みず",
        romaji: pool[idx1]?.romaji || "mizu",
        meaning: pool[idx1]?.meaning || "water",
        x: Math.floor(Math.random() * 25) + 20, // 20% to 45%
        y: 8,
        speed: 10,
      },
      {
        id: `fw-${nextWordIdRef.current++}`,
        word: pool[idx2]?.word || "火",
        reading: pool[idx2]?.reading || "ひ",
        romaji: pool[idx2]?.romaji || "hi",
        meaning: pool[idx2]?.meaning || "fire",
        x: Math.floor(Math.random() * 25) + 55, // 55% to 80%
        y: 2,
        speed: 11,
      },
    ];

    wordsRef.current = initialWords;
    setFallingWords(initialWords);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setLevel(1);
    setDestroyedCount(0);
    setFreezeTimeLeft(0);
    setLastMatchNotice(null);
    clearInput();
    setGameState("playing");

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  }, [getWordPool, clearInput]);

  // ────────────────────────────────────────────────────────────────────────────
  // DESTROY WORD
  // ────────────────────────────────────────────────────────────────────────────
  const destroyWord = useCallback(
    (targetId: string) => {
      const target = wordsRef.current.find((w) => w.id === targetId);
      if (!target || target.isBlasted) return;

      if (soundRef.current) {
        sfx.playLaser();
        playJapaneseAudio(target.reading || target.word);
      }

      setCombo((prev) => {
        const next = prev + 1;
        setMaxCombo((mc) => Math.max(mc, next));
        return next;
      });

      const comboMult = combo >= 20 ? 3 : combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1;
      const basePoints = 100 + levelRef.current * 20;
      const finalPoints = Math.round(basePoints * scoreMultRef.current * comboMult);
      setScore((s) => s + finalPoints);

      setDestroyedCount((c) => {
        const next = c + 1;
        if (next % 10 === 0) {
          setLevel((lvl) => lvl + 1);
          if (soundRef.current) sfx.playCombo();
        }
        return next;
      });

      if (target.powerUp === "freeze") {
        setFreezeTimeLeft(6);
        if (soundRef.current) sfx.playCombo();
      } else if (target.powerUp === "bomb") {
        wordsRef.current = [];
        setFallingWords([]);
        if (soundRef.current) sfx.playCombo();
      } else if (target.powerUp === "heart") {
        setLives((l) => Math.min(3, l + 1));
      }

      // Mark blasted for animation, then remove after 200ms
      wordsRef.current = wordsRef.current.map((w) =>
        w.id === targetId ? { ...w, isBlasted: true, pointsGained: finalPoints } : w
      );
      setFallingWords([...wordsRef.current]);

      setTimeout(() => {
        wordsRef.current = wordsRef.current.filter((w) => w.id !== targetId);
        setFallingWords([...wordsRef.current]);
      }, 200);

      setLastMatchNotice(`✓ ${target.word} (+${finalPoints})`);
      setTimeout(() => setLastMatchNotice(null), 1200);
      clearInput();
    },
    [combo, clearInput]
  );

  // ────────────────────────────────────────────────────────────────────────────
  // MATCHING HELPERS (With defensive null-checks)
  // ────────────────────────────────────────────────────────────────────────────
  const isMatch = useCallback(
    (input: string, fw: FallingWord) => {
      if (!fw || fw.isBlasted) return false;
      const clean = (input || "").trim().toLowerCase();
      if (!clean) return false;

      const hira = romajiToHiragana(clean);
      const norm = normalizeJapanese(clean);

      const fwReading = fw.reading || "";
      const fwRomaji = (fw.romaji || "").toLowerCase();
      const fwMeaning = (fw.meaning || "").toLowerCase();
      const fwWord = fw.word || "";

      if (inputAcceptMode === "japanese_only") return hira === fwReading || norm === fwReading || norm === fwWord;
      if (inputAcceptMode === "romaji_only") return norm === fwRomaji;
      return (
        norm === fwRomaji ||
        hira === fwReading ||
        norm === fwReading ||
        norm === fwMeaning ||
        norm === fwWord
      );
    },
    [inputAcceptMode]
  );

  const isPrefix = useCallback(
    (input: string, fw: FallingWord) => {
      if (!fw || fw.isBlasted) return false;
      const clean = (input || "").trim().toLowerCase();
      if (!clean) return false;

      const hira = romajiToHiragana(clean);
      const norm = normalizeJapanese(clean);

      const fwReading = fw.reading || "";
      const fwRomaji = (fw.romaji || "").toLowerCase();
      const fwMeaning = (fw.meaning || "").toLowerCase();
      const fwWord = fw.word || "";

      if (inputAcceptMode === "japanese_only") return fwReading.startsWith(hira) || fwReading.startsWith(norm) || fwWord.startsWith(norm);
      if (inputAcceptMode === "romaji_only") return fwRomaji.startsWith(norm);
      return (
        fwRomaji.startsWith(norm) ||
        fwReading.startsWith(hira) ||
        fwReading.startsWith(norm) ||
        fwMeaning.startsWith(norm) ||
        fwWord.startsWith(norm)
      );
    },
    [inputAcceptMode]
  );

  // Handle typing in input box
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== "playing") return;
    const val = e.target.value;
    setTypedInput(val);

    const clean = val.trim().toLowerCase();
    if (!clean) return;

    const matched = wordsRef.current.find((fw) => isMatch(clean, fw));
    if (matched) destroyWord(matched.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
      e.preventDefault();
      const clean = typedInput.trim().toLowerCase();
      const matched = wordsRef.current.find((fw) => isMatch(clean, fw));
      if (matched) destroyWord(matched.id);
      else clearInput();
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // 33ms INTERVAL GAME LOOP (Managed strictly through useEffect([gameState]))
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastSpawnTime = Date.now();
    const TICK_MS = 33;
    const DELTA_SEC = TICK_MS / 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const pool = getWordPool();

      // 1. Check Spawning
      const spawnInterval = Math.max(1200, 2400 - levelRef.current * 160);
      const activeWords = wordsRef.current.filter((w) => !w.isBlasted);

      if (now - lastSpawnTime > spawnInterval && activeWords.length < 5 && pool.length > 0) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        let powerUp: FallingWord["powerUp"] = undefined;
        const r = Math.random();
        if (r < 0.05) powerUp = "freeze";
        else if (r < 0.09) powerUp = "bomb";
        else if (r < 0.12 && lives < 3) powerUp = "heart";

        wordsRef.current.push({
          id: `fw-${nextWordIdRef.current++}`,
          word: item?.word || "",
          reading: item?.reading || "",
          romaji: item?.romaji || "",
          meaning: item?.meaning || "",
          x: Math.floor(Math.random() * 55) + 20, // 20% to 75%
          y: 2,
          speed: 10 + levelRef.current * 1.5 + Math.random() * 2,
          powerUp,
        });
        lastSpawnTime = now;
      }

      // 2. Physics & Escape Detection
      let lostLife = false;
      const speedMult = freezeRef.current > 0 ? 0.25 : 1.0;

      const nextList: FallingWord[] = [];
      for (const fw of wordsRef.current) {
        if (fw.isBlasted) {
          nextList.push(fw);
          continue;
        }

        const nextY = fw.y + fw.speed * speedMult * DELTA_SEC;
        if (nextY >= 88) {
          lostLife = true; // Escaped laser barrier
        } else {
          nextList.push({ ...fw, y: nextY });
        }
      }

      wordsRef.current = nextList;
      setFallingWords([...nextList]);

      // 3. Handle Life Loss
      if (lostLife) {
        if (soundRef.current) sfx.playWrong();
        setCombo(0);
        setLives((prevLives) => {
          const nextLives = prevLives - 1;
          if (nextLives <= 0) {
            setGameState("gameover");
          }
          return nextLives;
        });
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [gameState, getWordPool, lives]);

  const isFieldEmpty = !typedInput.trim();
  const showRomaji = displayHintMode === "full";
  const showFurigana = displayHintMode !== "kanji_only" && displayHintMode !== "meaning_only";
  const showJapaneseWord = displayHintMode !== "meaning_only";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#1A1A1A] dark:text-[#94A3B8] dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          <span>Exit Arcade</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Sparkles size={12} /> {scoreMultiplier}x Score Multiplier
          </span>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-xl border border-black/10 bg-white p-2 text-gray-500 hover:text-black dark:border-white/10 dark:bg-[#161B22] dark:text-gray-400 dark:hover:text-white"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Main Arcade Frame */}
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-[#0E1117] shadow-2xl dark:border-white/10">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#161B22] px-6 py-3 text-white">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  size={18}
                  className={`transition ${i <= lives ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
                />
              ))}
            </div>
            <div className="text-xs font-bold text-gray-400">
              Wave: <span className="font-mono text-white">{level}</span>
            </div>
            {combo > 1 && (
              <div className="flex items-center gap-1 text-xs font-bold text-orange-400 animate-pulse">
                <Flame size={14} className="fill-current" />
                <span>{combo}x Combo!</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Score</div>
              <div className="font-mono text-base font-bold text-amber-400">{score.toLocaleString()}</div>
            </div>
            {highScore > 0 && (
              <div className="hidden sm:block border-l border-white/10 pl-4">
                <div className="text-[10px] uppercase font-bold text-gray-400">Record</div>
                <div className="font-mono text-base font-bold text-emerald-400">{highScore.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Drop Runway */}
        <div className="relative h-[530px] w-full overflow-hidden bg-[#0A0D12] select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {freezeTimeLeft > 0 && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-cyan-900/20 p-4 pointer-events-none">
              <span className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
                <Snowflake size={14} className="animate-spin" />
                Time Freeze Active ({freezeTimeLeft}s)
              </span>
            </div>
          )}

          {/* Falling Words Rendering */}
          {gameState === "playing" &&
            fallingWords.map((fw) => {
              const highlighted = typedInput.trim() ? isPrefix(typedInput, fw) : false;
              const blasted = fw.isBlasted;
              return (
                <div
                  key={fw.id}
                  style={{ left: `${fw.x}%`, top: `${fw.y}%` }}
                  className={`absolute -translate-x-1/2 ${
                    blasted
                      ? "transition-all duration-200 scale-125 opacity-0 z-30 pointer-events-none"
                      : highlighted
                      ? "scale-110 z-20"
                      : "scale-100 z-10"
                  }`}
                >
                  <div
                    className={`flex flex-col items-center rounded-2xl border px-3.5 py-2 shadow-lg backdrop-blur-md transition-colors ${
                      blasted
                        ? "border-emerald-400 bg-emerald-500 text-white"
                        : highlighted
                        ? "border-amber-400 bg-amber-500/30 text-amber-200 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                        : fw.powerUp === "freeze"
                        ? "border-cyan-400 bg-cyan-950/80 text-cyan-200"
                        : fw.powerUp === "bomb"
                        ? "border-orange-500 bg-orange-950/80 text-orange-200"
                        : fw.powerUp === "heart"
                        ? "border-rose-400 bg-rose-950/80 text-rose-200"
                        : "border-white/15 bg-[#1E232B]/90 text-white"
                    }`}
                  >
                    {blasted && <div className="text-xs font-bold text-amber-300">+{fw.pointsGained}!</div>}
                    {fw.powerUp && !blasted && (
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        {fw.powerUp === "freeze" && "❄️ FREEZE"}
                        {fw.powerUp === "bomb" && "💣 BOMB"}
                        {fw.powerUp === "heart" && "💖 +LIFE"}
                      </div>
                    )}
                    {showJapaneseWord ? (
                      <span className="font-serif text-xl font-bold tracking-wide">{fw.word}</span>
                    ) : (
                      <span className="text-sm font-bold text-amber-300">{fw.meaning}</span>
                    )}
                    {showFurigana && !blasted && (
                      <div className="text-[11px] font-mono text-gray-300">
                        <span>{fw.reading}</span>
                        {showRomaji && <span className="ml-1 text-gray-400">({fw.romaji})</span>}
                      </div>
                    )}
                    {displayHintMode !== "meaning_only" && !blasted && (
                      <span className="text-[10px] text-gray-400">{fw.meaning}</span>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Laser barrier */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-500 shadow-[0_0_12px_#F43F5E]" />

          {/* Start Menu */}
          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0E1117]/95 px-6 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
                <Flame size={26} />
              </div>
              <h1 className="mt-2 text-2xl font-bold text-white">Falling Words Arcade</h1>
              <p className="mt-0.5 max-w-sm text-xs text-gray-400">
                Destroy falling Japanese words by typing their romaji, kana, or meaning!
              </p>

              <div className="mt-3 flex gap-2">
                {(["n5", "kana", "mixed"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setGameMode(m)}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                      gameMode === m ? "bg-amber-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {m === "n5" ? "JLPT N5 Core" : m === "kana" ? "Kana Only" : "Mixed All"}
                  </button>
                ))}
              </div>

              <div className="mt-3 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-3 text-left space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                    <Settings2 size={13} /> Difficulty & Multipliers
                  </span>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-300 font-mono text-[11px]">
                    Total: {scoreMultiplier}x
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 mb-1">Word Card Display:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: "full", label: "Full (+ Romaji)", mult: "1.0x" },
                      { id: "no_romaji", label: "Kana Only", mult: "1.2x 🔥" },
                      { id: "kanji_only", label: "Kanji Only", mult: "1.5x 🔥🔥" },
                      { id: "meaning_only", label: "Meaning Only", mult: "1.4x ⚡" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDisplayHintMode(opt.id as DisplayHintMode)}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                          displayHintMode === opt.id ? "bg-amber-500 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-[10px] opacity-80">{opt.mult}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 mb-1">Accepted Input:</div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "all", label: "Romaji / Kana", mult: "1.0x" },
                      { id: "japanese_only", label: "Kana Only 🇯🇵", mult: "1.3x" },
                      { id: "romaji_only", label: "Romaji Only", mult: "1.1x" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setInputAcceptMode(opt.id as InputAcceptMode)}
                        className={`flex flex-col items-center rounded-xl p-1 text-[10px] font-bold transition ${
                          inputAcceptMode === opt.id ? "bg-amber-500 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-[9px] opacity-80">{opt.mult}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-2.5 text-xs font-bold text-white shadow-xl transition hover:bg-amber-600 active:scale-95"
              >
                <Play size={15} />
                <span>Launch Arcade ({scoreMultiplier}x Boost)</span>
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0E1117]/95 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-500">
                <ShieldAlert size={44} />
              </div>
              <h2 className="mt-4 text-3xl font-bold text-white">Defense Breached!</h2>
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-white/5 p-4 text-center">
                <div>
                  <div className="text-[11px] text-gray-400">Final Score</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-amber-400">{score.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Words Destroyed</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">{destroyedCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400">Max Combo</div>
                  <div className="mt-1 font-mono text-2xl font-bold text-orange-400">{maxCombo}x 🔥</div>
                </div>
              </div>
              <div className="mt-7 flex gap-3">
                <Link
                  href="/practice"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/10 transition"
                >
                  Practice Dojo
                </Link>
                <button
                  type="button"
                  onClick={startGame}
                  className="flex items-center gap-2 rounded-2xl bg-[#C84B31] px-6 py-3.5 text-xs font-bold text-white hover:bg-[#b03e26] transition"
                >
                  <RotateCcw size={16} />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="border-t border-white/10 bg-[#161B22] p-4 space-y-2">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameState !== "playing"}
              placeholder={gameState === "playing" ? "Type romaji, kana, or meaning..." : "Press start to play"}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              className="w-full rounded-2xl border-2 border-white/15 bg-[#0E1117] px-4 py-3.5 pr-28 text-center font-mono text-lg font-bold text-white placeholder:font-sans placeholder:text-sm placeholder:text-gray-500 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/20"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {lastMatchNotice ? (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>{lastMatchNotice}</span>
                </span>
              ) : isFieldEmpty ? (
                <span className="rounded-xl bg-white/5 px-2 py-1 text-[11px] font-medium text-gray-400">○ Empty</span>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="rounded-xl bg-amber-500/20 px-2 py-1 text-[11px] font-bold text-amber-300">
                    ● {typedInput.length} chars
                  </span>
                  <button
                    type="button"
                    onClick={clearInput}
                    className="flex items-center gap-1 rounded-xl bg-white/10 px-2 py-1 text-xs font-bold text-gray-300 hover:bg-white/20 hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
            <span>
              💡 Type freely. <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-amber-400">Space</kbd> or <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-amber-400">Enter</kbd> to clear mistypes.
            </span>
            <span className="font-mono text-amber-400 font-bold">{scoreMultiplier}x Multiplier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
