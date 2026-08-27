"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Sparkles,
  Volume2,
  Trophy,
  Flame,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Skull,
  Lightbulb,
} from "lucide-react";
import {
  OPPONENTS,
  getShiritoriEndKana,
  getShiritoriStartKana,
  type ShiritoriWord,
  type OpponentProfile,
} from "@/lib/data/shiritori-data";
import { playJapaneseAudio } from "@/lib/audio";
import { romajiToHiragana, normalizeJapanese, katakanaToHiragana, sfx } from "@/lib/japanese-utils";
import { HowToPlay } from "@/components/practice/HowToPlay";

interface ChainEntry {
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  startKana: string;
  endKana: string;
  by: "player" | "ai";
}

/**
 * Fetches candidate words from the vocabulary database whose kana reading
 * starts with the required kana, excluding already-used words and (unless
 * allowed) readings that end with 「ん」.
 */
async function fetchShiritoriCandidates(
  startKana: string,
  usedWords: Set<string>,
  allowNEnding: boolean
): Promise<ShiritoriWord[]> {
  try {
    const res = await fetch(`/api/vocab?readingStarts=${encodeURIComponent(startKana)}&limit=60`);
    const json = await res.json();
    const rows: any[] = Array.isArray(json.data) ? json.data : [];

    return rows
      .map((row): ShiritoriWord => {
        const reading = katakanaToHiragana(String(row.reading || row.word || ""));
        return {
          word: String(row.word || reading),
          reading,
          romaji: String(row.romaji || ""),
          meaning: Array.isArray(row.meaning) ? row.meaning.join(", ") : String(row.meaning || ""),
          startKana: getShiritoriStartKana(reading),
          endKana: getShiritoriEndKana(reading),
        };
      })
      .filter((item) => {
        if (usedWords.has(item.word) || usedWords.has(item.reading)) return false;
        if (!allowNEnding && item.endKana === "ん") return false;
        return item.startKana === startKana;
      });
  } catch {
    return [];
  }
}

export function ShiritoriEngine() {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentProfile>(OPPONENTS[0]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const [defeatReason, setDefeatReason] = useState<string>("");

  // Game Chain & Turn State
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSpeechBubble, setAiSpeechBubble] = useState<string>("");

  // Player Input & Hints
  const [userInput, setUserInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [suggestedWords, setSuggestedWords] = useState<ShiritoriWord[]>([]);
  const [showHints, setShowHints] = useState(false);

  // High Score / Record
  const [maxChainRecord, setMaxChainRecord] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem("niholearn-shiritori-record");
      if (saved) setMaxChainRecord(parseInt(saved, 10));
    } catch {}
  }, []);

  // Save High Score on Game Over
  useEffect(() => {
    if (gameState === "gameover" && chain.length > maxChainRecord) {
      setMaxChainRecord(chain.length);
      try {
        localStorage.setItem("niholearn-shiritori-record", chain.length.toString());
      } catch {}
    }

    if (gameState === "gameover" && chain.length > 0) {
      // Log Study Session
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round(chain.length / 4)),
          level: selectedOpponent.level === "Beginner" ? "N5" : selectedOpponent.level === "Intermediate" ? "N4" : "N3",
          activities: ["shiritori", "vocabulary-recall", "word-chain"],
          wordsReviewed: chain.length,
          notes: JSON.stringify({
            chainLength: chain.length,
            result: gameResult,
            opponent: selectedOpponent.name,
          }),
        }),
      }).catch(() => {});
    }
  }, [gameState, chain.length, maxChainRecord, gameResult, selectedOpponent]);

  // Target starting kana required for player
  const lastEntry = chain[chain.length - 1];
  const requiredStartKana = lastEntry ? lastEntry.endKana : "し"; // Start with 'し' as in しりとり

  // Start New Match
  const startMatch = () => {
    // Opening word: "しりとり" (Shiritori) or "さくら" (Sakura)
    const starter: ChainEntry = {
      word: "しりとり",
      reading: "しりとり",
      romaji: "shiritori",
      meaning: "Word chain game",
      startKana: "し",
      endKana: "り",
      by: "ai",
    };

    setChain([starter]);
    setUsedWords(new Set(["しりとり"]));
    setGameState("playing");
    setGameResult(null);
    setDefeatReason("");
    setUserInput("");
    setInputError(null);
    setShowHints(false);
    setAiSpeechBubble(`「${starter.word}」から始めましょう！次は「${starter.endKana}」ですよ！`);

    playJapaneseAudio(starter.word);
  };

  // Focus input
  useEffect(() => {
    if (gameState === "playing" && !isAiThinking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, isAiThinking]);

  // Update Hints when required start kana changes
  useEffect(() => {
    if (gameState !== "playing") return;

    let cancelled = false;
    fetchShiritoriCandidates(requiredStartKana, usedWords, false).then((candidates) => {
      if (!cancelled) setSuggestedWords(candidates.slice(0, 3));
    });

    return () => {
      cancelled = true;
    };
  }, [requiredStartKana, usedWords, gameState]);

  // AI Turn Handler
  const triggerAiTurn = (updatedChain: ChainEntry[], updatedUsedWords: Set<string>) => {
    setIsAiThinking(true);
    setInputError(null);

    const playerLastEntry = updatedChain[updatedChain.length - 1];
    const aiTargetKana = playerLastEntry.endKana;

    setTimeout(async () => {
      // Find candidate words for AI from the database
      const candidates = await fetchShiritoriCandidates(aiTargetKana, updatedUsedWords, false);

      if (candidates.length === 0) {
        // AI has no valid words remaining! AI LOSES!
        sfx.playCombo();
        setAiSpeechBubble(selectedOpponent.loseQuote);
        setGameResult("win");
        setDefeatReason(`AI could not find any words starting with 「${aiTargetKana}」!`);
        setGameState("gameover");
        setIsAiThinking(false);
        return;
      }

      // Pick a word based on difficulty
      let chosen: ShiritoriWord;
      if (selectedOpponent.level === "Beginner") {
        // Tanaka picks common words
        chosen = candidates[0];
      } else if (selectedOpponent.level === "Intermediate") {
        // Sakura picks random words
        chosen = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        // Master Kenshin picks words that end on rare / difficult kana (e.g. ぬ, ぢ, づ, む, ろ)
        const tricky = candidates.find((c) => ["ぬ", "む", "る", "ろ", "づ"].includes(c.endKana));
        chosen = tricky || candidates[0];
      }

      const aiEntry: ChainEntry = {
        word: chosen.word,
        reading: chosen.reading,
        romaji: chosen.romaji,
        meaning: chosen.meaning,
        startKana: getShiritoriStartKana(chosen.reading),
        endKana: getShiritoriEndKana(chosen.reading),
        by: "ai",
      };

      const newChain = [...updatedChain, aiEntry];
      const newUsed = new Set(updatedUsedWords).add(chosen.word).add(chosen.reading);

      setChain(newChain);
      setUsedWords(newUsed);
      setIsAiThinking(false);

      sfx.playCorrect();
      playJapaneseAudio(chosen.word);
      setAiSpeechBubble(`次は「${aiEntry.endKana}」です！`);
    }, selectedOpponent.thinkDelayMs);
  };

  // Handle Player Word Submit
  const handlePlayerSubmit = async () => {
    if (gameState !== "playing" || isAiThinking) return;

    const raw = userInput.trim();
    if (!raw) return;

    // Convert Romaji to Hiragana if typed in Romaji
    const hira = romajiToHiragana(raw);
    const cleanWord = normalizeJapanese(hira);

    // 1. Check if word ends in 'ん' (Instant Defeat!)
    const endChar = getShiritoriEndKana(hira);
    if (endChar === "ん" || hira.endsWith("ん") || raw.toLowerCase().endsWith("n")) {
      sfx.playWrong();
      setGameResult("lose");
      setDefeatReason("You submitted a word ending in 「ん」(n)! In classic Shiritori, ending on 'ん' is an instant loss.");
      setGameState("gameover");
      return;
    }

    // 2. Check starting kana match
    const startChar = getShiritoriStartKana(hira);
    if (startChar !== requiredStartKana) {
      sfx.playWrong();
      setInputError(`Word must start with 「${requiredStartKana}」, but starts with 「${startChar}」!`);
      return;
    }

    // 3. Check duplicate word
    if (usedWords.has(raw) || usedWords.has(hira) || usedWords.has(cleanWord)) {
      sfx.playWrong();
      setInputError(`「${raw}」 has already been used in this chain! No repeated words.`);
      return;
    }

    // 4. Validate word and fetch its meaning from `/api/vocab`
    let meaning = "";
    let romaji = raw;

    try {
      const res = await fetch(`/api/vocab?q=${encodeURIComponent(hira)}&limit=1`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const vocab = json.data[0];
        meaning = Array.isArray(vocab.meaning) ? vocab.meaning.join(", ") : String(vocab.meaning);
        romaji = vocab.romaji || hira;
      } else {
        // If word is length >= 2, accept as valid custom submission
        if (hira.length >= 2) {
          meaning = "Japanese vocabulary";
        } else {
          sfx.playWrong();
          setInputError(`「${raw}」 is not recognized as a valid Japanese word. Please try another.`);
          return;
        }
      }
    } catch {
      meaning = "Japanese vocabulary";
    }

    // Valid Player Word! Add to chain
    const playerEntry: ChainEntry = {
      word: raw,
      reading: hira,
      romaji,
      meaning,
      startKana: startChar,
      endKana: endChar,
      by: "player",
    };

    const newChain = [...chain, playerEntry];
    const newUsed = new Set(usedWords).add(raw).add(hira).add(cleanWord);

    setChain(newChain);
    setUsedWords(newUsed);
    setUserInput("");
    setInputError(null);
    setShowHints(false);

    sfx.playCorrect();
    playJapaneseAudio(hira);

    // Trigger AI Turn
    triggerAiTurn(newChain, newUsed);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/practice"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] transition hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:text-[#FAFAFA]"
        >
          <ArrowLeft size={16} /> Practice Dojo
        </Link>

        <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Trophy size={15} />
          <span>Best Chain: {maxChainRecord} words</span>
        </div>
      </div>

      {/* Opponent Selection & Status Bar */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 text-2xl dark:bg-white/10">
              {selectedOpponent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {selectedOpponent.name}
                </h2>
                <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {selectedOpponent.level}
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                {selectedOpponent.title}
              </p>
            </div>
          </div>

          {/* Opponent Picker */}
          {gameState === "idle" && (
            <div className="flex gap-1.5">
              {OPPONENTS.map((opp) => (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => setSelectedOpponent(opp)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedOpponent.id === opp.id
                      ? "bg-[#C84B31] text-white shadow-2xs dark:bg-[#E85C40]"
                      : "border border-black/10 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#A0A0A0]"
                  }`}
                >
                  {opp.avatar} {opp.level}
                </button>
              ))}
            </div>
          )}

          {gameState === "playing" && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Flame size={16} />
                <span>Chain Length: {chain.length}</span>
              </span>
            </div>
          )}
        </div>

        {/* AI Dialogue Speech Bubble */}
        {aiSpeechBubble && gameState === "playing" && (
          <div className="mt-4 rounded-2xl border border-black/5 bg-[#FAFAF8] p-3 text-xs text-[#1A1A1A] dark:border-white/5 dark:bg-[#222222] dark:text-[#FAFAFA] animate-in fade-in duration-150">
            💬 <strong>{selectedOpponent.name}:</strong> {aiSpeechBubble}
          </div>
        )}
      </div>

      {/* ── Active Game Arena ── */}
      {gameState === "playing" && (
        <div className="space-y-4">
          {/* Target Next Mora Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider">
                Current Word Must Start With:
              </div>
              <div className="font-serif text-3xl font-bold">
                「{requiredStartKana}」
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-semibold">⚠️ Classic Rule:</span>
              <div className="text-[11px] text-amber-800 dark:text-amber-400">
                Words ending in 「ん」(n) lose instantly!
              </div>
            </div>
          </div>

          {/* Word Chain Stream (Scrollable) */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {chain.map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-2xs transition ${
                  entry.by === "player"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200"
                    : "border-purple-500/30 bg-purple-500/5 text-purple-950 dark:text-purple-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      entry.by === "player"
                        ? "bg-emerald-500 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-base font-bold">
                        {entry.word}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({entry.reading})
                      </span>
                      <span className="rounded-md bg-black/5 px-1.5 py-0.2 text-[10px] font-bold dark:bg-white/10">
                        Ends: {entry.endKana}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {entry.meaning}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playJapaneseAudio(entry.reading || entry.word)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition"
                  title="Pronounce Word"
                >
                  <Volume2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Player Typing Input Area */}
          <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePlayerSubmit();
                }}
                disabled={isAiThinking}
                placeholder={`Type a Japanese word starting with 「${requiredStartKana}」...`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full rounded-2xl border-2 border-black/15 bg-[#FAFAF8] px-4 py-3.5 text-center font-serif text-lg font-bold text-[#1A1A1A] placeholder:font-sans placeholder:text-sm placeholder:text-gray-400 focus:border-[#C84B31] focus:outline-none focus:ring-4 focus:ring-[#C84B31]/15 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA] dark:focus:border-[#E85C40]"
              />
            </div>

            {/* Error Feedback */}
            {inputError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs font-semibold text-red-700 dark:text-red-400 animate-in fade-in duration-100">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{inputError}</span>
              </div>
            )}

            {/* Actions & Hint Button */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowHints((h) => !h)}
                className="flex items-center gap-1 rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1.5 font-bold text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#A0A0A0]"
              >
                <Lightbulb size={14} className="text-amber-500" />
                <span>{showHints ? "Hide Word Hints" : "Sensei Hint"}</span>
              </button>

              <button
                type="button"
                onClick={handlePlayerSubmit}
                disabled={!userInput.trim() || isAiThinking}
                className="flex items-center gap-1.5 rounded-xl bg-[#C84B31] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#b03e26] disabled:opacity-40 dark:bg-[#E85C40]"
              >
                <span>Submit Word (Enter)</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Suggested Words List */}
            {showHints && suggestedWords.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-left space-y-2 animate-in fade-in duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  💡 Tanaka-Sensei Suggested Words:
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedWords.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserInput(item.word)}
                      className="rounded-xl border border-black/10 bg-white px-3 py-1 text-xs font-bold text-[#1A1A1A] shadow-2xs hover:border-[#C84B31] dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
                    >
                      <span className="font-serif">{item.word}</span> ({item.reading}) - {item.meaning}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Idle Menu ── */}
      {gameState === "idle" && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs text-4xl">
            ⛓️
          </div>

          <h1 className="mt-4 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            Shiritori Word Chain Dojo
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            Challenge the Sensei to the classic Japanese word chain game. Each word must start with
            the final mora of the previous word. Don&apos;t say a word ending in 「ん」!
          </p>

          <div className="mt-5 text-left">
            <HowToPlay
              gameKey="shiritori"
              steps={[
                "Pick an opponent (Beginner 🌱 / Intermediate ⚔️ / Master 🐉) and start the match — the AI opens with しりとり, so your first word must start with り.",
                "Type a Japanese word in hiragana or romaji (romaji converts automatically) that starts with the kana shown in the banner, then submit.",
                "Your word's last kana becomes the AI's starting kana — the AI replies, and its last kana becomes your next starting kana.",
                "Words ending in 「ん」 lose instantly, repeated words are rejected, and invalid words don't count.",
                "Win by making the AI run out of valid words; the longer your chain, the better your record.",
              ]}
              note="Tip: stuck on a kana? Reveal hints to see 3 possible words — using them has no penalty."
            />
          </div>

          <button
            type="button"
            onClick={startMatch}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-4 text-base font-bold text-white shadow-xs transition hover:bg-[#b03e26] dark:bg-[#E85C40]"
          >
            <Sparkles size={20} />
            <span>Start Shiritori Match</span>
          </button>
        </div>
      )}

      {/* ── Game Over Screen ── */}
      {gameState === "gameover" && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A] animate-in zoom-in-95 duration-150">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-md ${
              gameResult === "win"
                ? "bg-amber-500/20 text-amber-500"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {gameResult === "win" ? "🏆" : "💥"}
          </div>

          <h2 className="mt-4 text-3xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
            {gameResult === "win" ? "Victory! You Defeated the Sensei!" : "Match Over!"}
          </h2>

          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
            {defeatReason}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-[#FAFAF8] p-4 text-center dark:bg-[#1E232B]">
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Words in Chain</div>
              <div className="mt-1 font-mono text-2xl font-bold text-[#C84B31] dark:text-[#E85C40]">
                {chain.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Opponent</div>
              <div className="mt-1 text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                {selectedOpponent.name}
              </div>
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <Link
              href="/practice"
              className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3.5 text-center text-xs font-bold text-[#1A1A1A] hover:bg-black/5 dark:border-white/15 dark:bg-[#1E232B] dark:text-[#FAFAFA]"
            >
              Practice Dojo
            </Link>
            <button
              type="button"
              onClick={startMatch}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C84B31] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#b03e26] dark:bg-[#E85C40]"
            >
              <RotateCcw size={16} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
