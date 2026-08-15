"use client";

import { useState } from "react";
import { X, Volume2, CheckCircle2, XCircle, ArrowRight, HelpCircle, Trophy, BookOpen } from "lucide-react";
import type { ReadingStory, StoryWordToken } from "@/lib/data/stories";

import { playJapaneseAudio } from "@/lib/audio";

export function ReadingStoryModal({
  story,
  onClose,
}: {
  story: ReadingStory;
  onClose: () => void;
}) {
  const [selectedToken, setSelectedToken] = useState<StoryWordToken | null>(null);
  const [currentTab, setCurrentTab] = useState<"story" | "quiz">("story");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectAnswer = (qIndex: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    story.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-black/10 bg-white shadow-2xl dark:border-white/15 dark:bg-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 p-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{story.pixelArtEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#C84B31] px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-[#E85C40]">
                  {story.level}
                </span>
                <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {story.titleJapanese}
                </h2>
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{story.titleEnglish}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-[#FAFAF8] p-1 dark:bg-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setCurrentTab("story")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  currentTab === "story"
                    ? "bg-[#C84B31] text-white dark:bg-[#E85C40]"
                    : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                }`}
              >
                Story
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab("quiz")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  currentTab === "quiz"
                    ? "bg-[#C84B31] text-white dark:bg-[#E85C40]"
                    : "text-[#6B6B6B] dark:text-[#A0A0A0]"
                }`}
              >
                Comprehension ({story.questions.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#2A2A2A] dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === "story" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                💡 <strong>Tip:</strong> Tap on any underlined Japanese word to view its furigana reading, English meaning, and grammar notes.
              </div>

              {/* Story Sentences */}
              <div className="space-y-5">
                {story.sentences.map((sent, idx) => (
                  <div
                    key={sent.id}
                    className="rounded-2xl border border-black/5 bg-[#FAFAF8] p-4.5 dark:border-white/10 dark:bg-[#2A2A2A]"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>Sentence {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => playJapaneseAudio(sent.fullJapanese)}
                        className="flex items-center gap-1 text-[#C84B31] hover:underline dark:text-[#E85C40]"
                      >
                        <Volume2 size={14} /> Listen
                      </button>
                    </div>

                    {/* Interactive Tokens */}
                    <div className="flex flex-wrap items-baseline gap-1 font-serif text-xl font-medium leading-loose text-[#1A1A1A] dark:text-[#FAFAFA]">
                      {sent.tokens.map((token, tIdx) => {
                        const hasDetails = token.meaning || token.furigana || token.grammarHint;
                        return (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => (hasDetails ? setSelectedToken(token) : null)}
                            className={`rounded px-1 transition ${
                              hasDetails
                                ? "cursor-pointer border-b-2 border-dashed border-[#C84B31] hover:bg-[#C84B31]/10 dark:border-[#E85C40]"
                                : ""
                            }`}
                          >
                            {token.text}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {sent.fullEnglish}
                    </div>
                  </div>
                ))}
              </div>

              {/* Word Details Popover / Card */}
              {selectedToken && (
                <div className="rounded-2xl border border-[#C84B31]/30 bg-[#C84B31]/5 p-4 animate-in fade-in duration-150 dark:border-[#E85C40]/30 dark:bg-[#E85C40]/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                          {selectedToken.text}
                        </span>
                        {selectedToken.furigana && (
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            【{selectedToken.furigana}】
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => playJapaneseAudio(selectedToken.text)}
                          className="rounded-full bg-white p-1 text-[#C84B31] shadow-xs hover:scale-110 dark:bg-[#1A1A1A] dark:text-[#E85C40]"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                      {selectedToken.meaning && (
                        <div className="mt-1 text-sm font-semibold text-[#C84B31] dark:text-[#E85C40]">
                          Meaning: {selectedToken.meaning}
                        </div>
                      )}
                      {selectedToken.grammarHint && (
                        <div className="mt-1 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                          Note: {selectedToken.grammarHint}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedToken(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentTab === "quiz" && (
            <div className="space-y-6">
              {story.questions.map((q, qIndex) => {
                const selected = selectedAnswers[qIndex];
                return (
                  <div
                    key={qIndex}
                    className="rounded-2xl border border-black/10 bg-[#FAFAF8] p-5 dark:border-white/10 dark:bg-[#2A2A2A]"
                  >
                    <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                      {qIndex + 1}. {q.question}
                    </div>

                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, optIndex) => {
                        const isChosen = selected === optIndex;
                        const isCorrect = q.correctIndex === optIndex;

                        let style =
                          "border-black/10 bg-white text-[#1A1A1A] hover:border-[#C84B31] dark:border-white/10 dark:bg-[#1A1A1A] dark:text-[#FAFAFA]";

                        if (showResults) {
                          if (isCorrect) {
                            style = "border-emerald-500 bg-emerald-500/10 text-emerald-800 font-bold dark:text-emerald-300";
                          } else if (isChosen && !isCorrect) {
                            style = "border-rose-500 bg-rose-500/10 text-rose-800 font-bold dark:text-rose-300";
                          }
                        } else if (isChosen) {
                          style = "border-[#C84B31] bg-[#C84B31]/10 text-[#C84B31] font-bold dark:border-[#E85C40] dark:bg-[#E85C40]/15 dark:text-[#E85C40]";
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectAnswer(qIndex, optIndex)}
                            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition ${style}`}
                          >
                            <span>{opt}</span>
                            {showResults && isCorrect && <CheckCircle2 size={16} className="text-emerald-600" />}
                            {showResults && isChosen && !isCorrect && <XCircle size={16} className="text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {showResults && (
                      <div className="mt-3 rounded-xl bg-black/5 p-2.5 text-xs text-[#6B6B6B] dark:bg-white/5 dark:text-[#A0A0A0]">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!showResults ? (
                <button
                  type="button"
                  disabled={Object.keys(selectedAnswers).length < story.questions.length}
                  onClick={() => {
                    setShowResults(true);
                    const score = calculateScore();
                    const total = story.questions.length;
                    const acc = total > 0 ? Math.round((score / total) * 100) : 100;

                    // Extract vocabulary tokens with meanings from story
                    const storyTokens = story.sentences.flatMap((s) =>
                      s.tokens.filter((t) => t.meaning && t.meaning.trim() !== "")
                    );

                    // Log reading study session
                    fetch("/api/sessions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        durationMinutes: 5,
                        level: story.level,
                        activities: ["reading", "comprehension"],
                        wordsReviewed: storyTokens.length || 10,
                        notes: JSON.stringify({
                          storyId: story.id,
                          title: story.titleJapanese,
                          score,
                          total,
                          accuracy: acc,
                        }),
                      }),
                    }).catch(() => {});

                    // Update vocabulary progress for story tokens
                    if (storyTokens.length > 0) {
                      const vocabBatch = storyTokens.map((t) => ({
                        wordId: t.text,
                        level: story.level,
                        status: acc >= 70 ? ("mastered" as const) : ("reviewing" as const),
                        notes: `Read in story: ${story.titleJapanese} (${t.meaning})`,
                      }));

                      fetch("/api/vocab", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ batch: vocabBatch }),
                      }).catch(() => {});
                    }
                  }}
                  className="w-full rounded-2xl bg-[#C84B31] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#b03e26] disabled:opacity-40 dark:bg-[#E85C40]"
                >
                  Check Answers
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-500/15 p-4 text-emerald-900 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Trophy size={20} />
                    <span>
                      Score: {calculateScore()} / {story.questions.length} correct!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setShowResults(false);
                    }}
                    className="rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 dark:bg-white dark:text-black"
                  >
                    Retry Quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
