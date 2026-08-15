"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  EyeOff,
  Eye,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Trophy,
  HelpCircle,
  Check,
  X,
  Layers,
  MousePointerClick,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { FURIGANA_PASSAGES, type FuriganaPassage } from "@/lib/data/vocab-practice-suite";

export type FuriganaDisplayMode = "all_visible" | "hover_only" | "completely_hidden" | "interactive_drill";

export function FuriganaDrillEngine() {
  // Passage selection
  const [selectedPassageId, setSelectedPassageId] = useState<string>(FURIGANA_PASSAGES[0].id);
  const [displayMode, setDisplayMode] = useState<FuriganaDisplayMode>("interactive_drill");

  // Interactive Kanji Recall Drill State
  const [revealedKanjiMap, setRevealedKanjiMap] = useState<Record<string, boolean>>({});
  const [activeKanjiModal, setActiveKanjiModal] = useState<{
    surface: string;
    reading: string;
    meaning?: string;
    options: string[];
    tokenKey: string;
  } | null>(null);

  const [recallScore, setRecallScore] = useState<number>(0);
  const [recallTotal, setRecallTotal] = useState<number>(0);
  const [selectedRecallOption, setSelectedRecallOption] = useState<string | null>(null);
  const [recallIsAnswered, setRecallIsAnswered] = useState<boolean>(false);

  // Comprehension Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  const passage = useMemo(
    () => FURIGANA_PASSAGES.find((p) => p.id === selectedPassageId) || FURIGANA_PASSAGES[0],
    [selectedPassageId]
  );

  // Collect all kanji tokens in passage to know total drillable kanji
  const allKanjiTokens = useMemo(() => {
    const list: Array<{ surface: string; reading: string; meaning?: string; key: string }> = [];
    passage.sentences.forEach((sent, sIdx) => {
      sent.tokens.forEach((tok, tIdx) => {
        if (tok.isKanji && tok.reading) {
          list.push({
            surface: tok.surface,
            reading: tok.reading,
            meaning: tok.meaning,
            key: `${passage.id}-${sIdx}-${tIdx}`,
          });
        }
      });
    });
    return list;
  }, [passage]);

  // Handle clicking a kanji token
  const handleKanjiClick = (surface: string, reading: string, meaning?: string, tokenKey?: string) => {
    if (!tokenKey) return;

    if (displayMode === "interactive_drill") {
      if (revealedKanjiMap[tokenKey]) {
        // Already revealed, just play audio
        playJapaneseAudio(surface);
        return;
      }

      // Generate 4 reading options
      const otherReadings = allKanjiTokens
        .filter((k) => k.reading !== reading)
        .map((k) => k.reading);

      const fakeOptions = ["ほんとう", "じかん", "がくせい", "きょう", "あした", "みち", "いえ"]
        .filter((r) => r !== reading);

      const distractors = [...otherReadings, ...fakeOptions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [reading, ...distractors].sort(() => Math.random() - 0.5);

      setActiveKanjiModal({
        surface,
        reading,
        meaning,
        options,
        tokenKey,
      });
      setSelectedRecallOption(null);
      setRecallIsAnswered(false);
    } else {
      playJapaneseAudio(surface);
    }
  };

  // Submit Kanji Recall Option
  const handleRecallOptionSelect = (option: string) => {
    if (recallIsAnswered || !activeKanjiModal) return;

    const isRight = option === activeKanjiModal.reading;
    setSelectedRecallOption(option);
    setRecallIsAnswered(true);

    setRecallTotal((t) => t + 1);
    if (isRight) {
      setRecallScore((s) => s + 1);
      playJapaneseAudio(activeKanjiModal.surface);
    } else {
      playJapaneseAudio(activeKanjiModal.reading);
    }

    // Mark as revealed on board
    setRevealedKanjiMap((prev) => ({ ...prev, [activeKanjiModal.tokenKey]: true }));
  };

  // Switch Passage
  const handleSelectPassage = (pId: string) => {
    setSelectedPassageId(pId);
    setRevealedKanjiMap({});
    setActiveKanjiModal(null);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
  };

  // Reveal all kanji
  const handleRevealAll = () => {
    const map: Record<string, boolean> = {};
    allKanjiTokens.forEach((k) => {
      map[k.key] = true;
    });
    setRevealedKanjiMap(map);
  };

  // Reset drill
  const handleResetDrill = () => {
    setRevealedKanjiMap({});
    setActiveKanjiModal(null);
    setRecallScore(0);
    setRecallTotal(0);
    setQuizAnswers({});
    setIsQuizSubmitted(false);
  };

  // Submit Comprehension Quiz
  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);

    let correctCount = 0;
    passage.comprehensionQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    // Log study session
    fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: 3,
        level: passage.level,
        activities: JSON.stringify(["reading", "kanji"]),
        wordsReviewed: allKanjiTokens.length,
        notes: `Completed Furigana Removal Drill on "${passage.title}" (${correctCount}/${passage.comprehensionQuestions.length} comprehension score).`,
      }),
    }).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[var(--color-vermillion)] dark:text-[#94A3B8]"
          >
            <ArrowLeft size={14} />
            <span>Back to Practice Dojo</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F4F8] flex items-center gap-2">
            <EyeOff className="text-[var(--color-vermillion)]" size={28} />
            <span>Furigana Removal Drill</span>
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Practice unassisted Japanese reading. Tap masked kanji to test reading recall or listen to pronunciation.
          </p>
        </div>

        {/* Passage Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FURIGANA_PASSAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPassage(p.id)}
              className={`rounded-2xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedPassageId === p.id
                  ? "bg-[var(--color-vermillion)] text-white shadow-xs"
                  : "border border-black/10 bg-white text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]"
              }`}
            >
              {p.level} • {p.title.split("(")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Furigana Mode Toggle & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-[#161B22]">
        {/* Modes */}
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDisplayMode("interactive_drill")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              displayMode === "interactive_drill"
                ? "bg-white text-[var(--color-vermillion)] shadow-xs dark:bg-[#1E232B]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <MousePointerClick size={14} />
            <span>Interactive Drill</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode("completely_hidden")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              displayMode === "completely_hidden"
                ? "bg-white text-[var(--color-vermillion)] shadow-xs dark:bg-[#1E232B]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <EyeOff size={14} />
            <span>Hidden</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode("hover_only")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              displayMode === "hover_only"
                ? "bg-white text-[var(--color-vermillion)] shadow-xs dark:bg-[#1E232B]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <Eye size={14} />
            <span>Hover Reveal</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode("all_visible")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              displayMode === "all_visible"
                ? "bg-white text-[var(--color-vermillion)] shadow-xs dark:bg-[#1E232B]"
                : "text-[#64748B] dark:text-[#94A3B8]"
            }`}
          >
            <BookOpen size={14} />
            <span>Full Furigana</span>
          </button>
        </div>

        {/* Drill Score & Quick Actions */}
        <div className="flex items-center gap-2">
          {displayMode === "interactive_drill" && (
            <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] px-2">
              Recalled: <span className="text-[var(--color-vermillion)]">{Object.keys(revealedKanjiMap).length}</span> / {allKanjiTokens.length} Kanji
            </div>
          )}

          <button
            type="button"
            onClick={handleRevealAll}
            className="rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
          >
            Reveal All
          </button>
          <button
            type="button"
            onClick={handleResetDrill}
            className="rounded-xl border border-black/10 bg-[#FAFAF8] p-2 text-[#1A1A1A] hover:bg-black/5 dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
            title="Reset Drill"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Reading Passage Container */}
      <div className="rounded-3xl border border-black/10 bg-white p-7 sm:p-9 shadow-xs dark:border-white/10 dark:bg-[#161B22] space-y-7">
        {/* Story Metadata */}
        <div className="flex items-start justify-between border-b border-black/5 pb-4 dark:border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--color-vermillion)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-vermillion)]">
                JLPT {passage.level}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">• {passage.category}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
              {passage.title}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {passage.summary}
            </p>
          </div>

          <button
            type="button"
            onClick={() => playJapaneseAudio(passage.sentences.map((s) => s.japanese).join(" "))}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-[#FAFAF8] px-3.5 py-2 text-xs font-bold text-[#1A1A1A] transition hover:bg-[var(--color-vermillion)]/10 hover:text-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]"
          >
            <Volume2 size={15} />
            <span>Listen All</span>
          </button>
        </div>

        {/* Story Paragraph with Graded Tokens */}
        <div className="space-y-6 text-lg sm:text-xl leading-loose font-medium text-[#1A1A1A] dark:text-[#F0F4F8]">
          {passage.sentences.map((sentence, sIdx) => (
            <div key={sentence.id} className="group relative rounded-2xl p-3 transition hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {sentence.tokens.map((token, tIdx) => {
                    const tokenKey = `${passage.id}-${sIdx}-${tIdx}`;
                    const isKanji = token.isKanji && token.reading;
                    const isRevealed = revealedKanjiMap[tokenKey];

                    if (!isKanji) {
                      return <span key={tIdx}>{token.surface}</span>;
                    }

                    // Render Kanji with Furigana Ruby or Mask
                    return (
                      <span
                        key={tIdx}
                        onClick={() => handleKanjiClick(token.surface, token.reading!, token.meaning, tokenKey)}
                        className={`group/token relative inline-block mx-0.5 px-1 py-0.5 rounded-lg transition cursor-pointer ${
                          displayMode === "interactive_drill"
                            ? isRevealed
                              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold"
                              : "border-b-2 border-dashed border-[var(--color-vermillion)] hover:bg-[var(--color-vermillion)]/10 text-[#1A1A1A] dark:text-[#F0F4F8]"
                            : displayMode === "completely_hidden"
                            ? "hover:bg-black/5 dark:hover:bg-white/5"
                            : "hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                        title={displayMode === "hover_only" ? `${token.reading} (${token.meaning || ""})` : undefined}
                      >
                        {/* Display Mode 1: All Visible */}
                        {displayMode === "all_visible" && (
                          <ruby>
                            {token.surface}
                            <rt className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                              {token.reading}
                            </rt>
                          </ruby>
                        )}

                        {/* Display Mode 2: Completely Hidden */}
                        {displayMode === "completely_hidden" && <span>{token.surface}</span>}

                        {/* Display Mode 3: Hover Only */}
                        {displayMode === "hover_only" && (
                          <span className="relative">
                            {token.surface}
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-black/90 px-1.5 py-0.5 text-[10px] font-normal text-white opacity-0 transition-opacity group-hover/token:opacity-100 dark:bg-white/90 dark:text-black pointer-events-none whitespace-nowrap">
                              {token.reading}
                            </span>
                          </span>
                        )}

                        {/* Display Mode 4: Interactive Drill */}
                        {displayMode === "interactive_drill" && (
                          <ruby>
                            {token.surface}
                            <rt className="text-[11px]">
                              {isRevealed ? (
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {token.reading}
                                </span>
                              ) : (
                                <span className="text-[var(--color-vermillion)] text-[10px]">●</span>
                              )}
                            </rt>
                          </ruby>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Sentence audio button */}
                <button
                  type="button"
                  onClick={() => playJapaneseAudio(sentence.japanese)}
                  className="rounded-lg p-1.5 text-[#64748B] hover:text-[var(--color-vermillion)] dark:text-[#94A3B8] opacity-60 hover:opacity-100 transition"
                  title="Listen to this sentence"
                >
                  <Volume2 size={16} />
                </button>
              </div>

              {/* Translation snippet underneath */}
              <div className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {sentence.translation}
              </div>
            </div>
          ))}
        </div>

        {/* Comprehension Quiz Section */}
        <div className="border-t border-black/5 pt-6 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
            <CheckCircle2 size={18} className="text-[var(--color-vermillion)]" />
            <span>Story Comprehension Check</span>
          </div>

          <div className="space-y-4">
            {passage.comprehensionQuestions.map((q, qIdx) => {
              const userAnswer = quizAnswers[qIdx];
              const isSubmitted = isQuizSubmitted;

              return (
                <div key={qIdx} className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 text-xs dark:border-white/5 dark:bg-[#1E232B] space-y-2.5">
                  <div className="font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                    {qIdx + 1}. {q.question}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswer === oIdx;
                      const isCorrect = q.correctIndex === oIdx;

                      let style =
                        "border-black/10 bg-white text-[#1A1A1A] hover:border-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#161B22] dark:text-[#F0F4F8]";

                      if (isSubmitted) {
                        if (isCorrect) {
                          style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                        } else if (isSelected && !isCorrect) {
                          style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                        } else {
                          style = "opacity-40 border-black/5";
                        }
                      } else if (isSelected) {
                        style = "border-[var(--color-vermillion)] bg-[var(--color-vermillion)]/10 text-[var(--color-vermillion)] font-bold";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                          className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="pt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isQuizSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="w-full rounded-2xl bg-[var(--color-vermillion)] py-3 text-xs font-bold text-white shadow-md transition hover:opacity-90 cursor-pointer"
            >
              Submit Comprehension Answers
            </button>
          ) : (
            <div className="rounded-2xl bg-emerald-500/10 p-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Comprehension check logged to your study record!
            </div>
          )}
        </div>
      </div>

      {/* Interactive Kanji Recall Mini-Modal */}
      {activeKanjiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveKanjiModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#161B22] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--color-vermillion)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-vermillion)]">
                Kanji Reading Recall
              </span>
              <button
                type="button"
                onClick={() => setActiveKanjiModal(null)}
                className="rounded-full p-1 text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="text-4xl font-bold text-[#1A1A1A] dark:text-[#F0F4F8]">
                {activeKanjiModal.surface}
              </div>
              {activeKanjiModal.meaning && (
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Meaning: {activeKanjiModal.meaning}
                </div>
              )}
            </div>

            {/* Reading Options */}
            <div className="grid grid-cols-2 gap-2">
              {activeKanjiModal.options.map((opt) => {
                const isSelected = selectedRecallOption === opt;
                const isTarget = opt === activeKanjiModal.reading;

                let style =
                  "border-black/10 bg-[#FAFAF8] text-[#1A1A1A] hover:border-[var(--color-vermillion)] dark:border-white/10 dark:bg-[#1E232B] dark:text-[#F0F4F8]";

                if (recallIsAnswered) {
                  if (isTarget) {
                    style = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (isSelected && !isTarget) {
                    style = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300";
                  } else {
                    style = "opacity-40 border-black/5";
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={recallIsAnswered}
                    onClick={() => handleRecallOptionSelect(opt)}
                    className={`rounded-2xl border p-3 text-center text-sm font-bold transition cursor-pointer ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {recallIsAnswered && (
              <button
                type="button"
                onClick={() => setActiveKanjiModal(null)}
                className="w-full rounded-2xl bg-[var(--color-vermillion)] py-3 text-xs font-bold text-white transition hover:opacity-90"
              >
                Continue Reading
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
