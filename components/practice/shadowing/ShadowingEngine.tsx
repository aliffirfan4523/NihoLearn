"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Gauge,
  CheckCircle2,
  Trophy,
  Flame,
  Info,
  Radio,
} from "lucide-react";
import { playJapaneseAudio } from "@/lib/audio";
import { HowToPlay } from "@/components/practice/HowToPlay";

interface ShadowingLine {
  speaker?: string;
  japanese: string;
  reading: string;
  english: string;
}

interface ShadowingExercise {
  id: string;
  title: string;
  level: "N5" | "N4" | "N3";
  theme: string;
  description: string;
  lines: ShadowingLine[];
}

// Placeholder used only while the fetched pool is still empty
const EMPTY_SHADOWING_EXERCISE: ShadowingExercise = {
  id: "",
  title: "",
  level: "N5",
  theme: "",
  description: "",
  lines: [],
};

const EMPTY_SHADOWING_LINE: ShadowingLine = {
  japanese: "",
  reading: "",
  english: "",
};

export function ShadowingEngine() {
  const [exercises, setExercises] = useState<ShadowingExercise[]>([]);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 0.85 | 1 | 1.2>(0.85);

  // Modes & Toggles
  const [playMode, setPlayMode] = useState<"continuous" | "step">("continuous");
  const [isRepeatActive, setIsRepeatActive] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showFurigana, setShowFurigana] = useState(true);

  // Mic Recording State (MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Shadowing Progress & Stats
  const [shadowedCount, setShadowedCount] = useState(0);
  const [completedConversations, setCompletedConversations] = useState<string[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const activeExercise: ShadowingExercise =
    exercises[selectedExerciseIndex] || exercises[0] || EMPTY_SHADOWING_EXERCISE;
  const activeLine: ShadowingLine =
    activeExercise.lines[currentLineIndex] || activeExercise.lines[0] || EMPTY_SHADOWING_LINE;

  // Fetch the shadowing conversations from the database on mount
  useEffect(() => {
    fetch("/api/content/shadowing")
      .then((res) => res.json())
      .then((json) => setExercises(json.data || []))
      .catch(() => setExercises([]));
  }, []);

  // Stop any active recordings and clean URLs when switching
  useEffect(() => {
    setCurrentLineIndex(0);
    setIsPlaying(false);
    setRecordedAudioUrl(null);
  }, [selectedExerciseIndex]);

  // Handle Play Line Audio
  const playCurrentLine = (onEndCallback?: () => void) => {
    if (!activeLine) return;
    setIsPlaying(true);

    const rate = playbackSpeed;
    playJapaneseAudio(activeLine.reading || activeLine.japanese, {
      rate,
      onEnd: () => {
        setIsPlaying(false);
        setShadowedCount((c) => c + 1);
        if (onEndCallback) onEndCallback();
      },
    });
  };

  // Continuous Autoplay controller
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggleContinuousPlay = () => {
    if (isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
      return;
    }

    // Start continuous playback loop
    const runLine = (lineIdx: number) => {
      if (lineIdx >= activeExercise.lines.length) {
        if (isRepeatActive) {
          setCurrentLineIndex(0);
          runLine(0);
        } else {
          setIsPlaying(false);
          setIsSessionComplete(true);
          if (!completedConversations.includes(activeExercise.id)) {
            setCompletedConversations((prev) => [...prev, activeExercise.id]);
          }
        }
        return;
      }

      setCurrentLineIndex(lineIdx);
      setIsPlaying(true);

      const targetLine = activeExercise.lines[lineIdx];
      playJapaneseAudio(targetLine.reading || targetLine.japanese, {
        rate: playbackSpeed,
        onEnd: () => {
          // Pause for shadowing repeat interval (approx 2.5 seconds)
          autoPlayTimeoutRef.current = setTimeout(() => {
            runLine(lineIdx + 1);
          }, 2200);
        },
      });
    };

    runLine(currentLineIndex);
  };

  // Step-by-Step Manual Next
  const handleNextLine = () => {
    if (currentLineIndex + 1 < activeExercise.lines.length) {
      setCurrentLineIndex((i) => i + 1);
      setRecordedAudioUrl(null);
    } else {
      setIsSessionComplete(true);
      if (!completedConversations.includes(activeExercise.id)) {
        setCompletedConversations((prev) => [...prev, activeExercise.id]);
      }
    }
  };

  const handlePrevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((i) => i - 1);
      setRecordedAudioUrl(null);
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access not permitted or unavailable:", err);
      alert("Microphone permission is required to record your shadowing voice.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Auto-log study session on completion
  useEffect(() => {
    if (isSessionComplete && shadowedCount > 0) {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Math.max(1, Math.round((shadowedCount * 12) / 60)),
          level: activeExercise.level,
          activities: ["shadowing", "pronunciation", "listening"],
          wordsReviewed: activeExercise.lines.length,
          notes: JSON.stringify({
            exerciseId: activeExercise.id,
            title: activeExercise.title,
            linesShadowed: shadowedCount,
            speed: playbackSpeed,
          }),
        }),
      }).catch(() => {});
    }
  }, [isSessionComplete, activeExercise, shadowedCount, playbackSpeed]);

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
        Loading shadowing exercises...
      </div>
    );
  }

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

        {/* Conversation Selector Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">Scenario:</span>
          <select
            value={selectedExerciseIndex}
            onChange={(e) => setSelectedExerciseIndex(parseInt(e.target.value, 10))}
            className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] shadow-2xs focus:outline-none dark:border-white/15 dark:bg-[#1A1A1A] dark:text-[#FAFAFA]"
          >
            {exercises.map((ex, idx) => (
              <option key={ex.id} value={idx}>
                {ex.level} • {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* How to Play */}
      <HowToPlay
        gameKey="shadowing"
        steps={[
          "Pick a conversation scenario from the Scenario dropdown, then press Play to hear each line — the active line is highlighted in the script.",
          "Shadow it: repeat the line out loud immediately after it plays, imitating the pronunciation and rhythm.",
          "Choose Step mode to go line by line manually, or Continuous mode to play the whole conversation with a pause after each line for you to repeat.",
          "Toggle Repeat to loop the conversation endlessly, and adjust speed (0.75x–1.2x) if the audio is too fast.",
          "Record yourself with the mic button and play it back to compare against the native audio — hide the English or furigana for an extra challenge.",
          "Each line you finish practicing counts toward your Lines Practiced total; finish all lines to complete the scenario.",
        ]}
        note="Tip: grant microphone permission when your browser asks — recording and comparing your voice is the fastest way to improve accent."
      />

      {/* Conversation Info Banner */}
      <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                {activeExercise.level}
              </span>
              <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
                {activeExercise.theme}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              {activeExercise.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
            <Flame size={16} />
            <span>{shadowedCount} lines practiced</span>
          </div>
        </div>
      </div>

      {/* Dialogue Script with Synchronized Highlighting */}
      <div className="space-y-3">
        {activeExercise.lines.map((line, idx) => {
          const isActive = idx === currentLineIndex;

          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentLineIndex(idx);
                setRecordedAudioUrl(null);
              }}
              className={`group cursor-pointer rounded-2xl border p-4 transition duration-200 ${
                isActive
                  ? "border-[#C84B31] bg-white shadow-md ring-2 ring-[#C84B31]/20 dark:border-[#E85C40] dark:bg-[#1E232B] dark:ring-[#E85C40]/25"
                  : "border-black/5 bg-[#FAFAF8] opacity-70 hover:opacity-100 hover:bg-white dark:border-white/5 dark:bg-[#141414] dark:hover:bg-[#1A1A1A]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {/* Speaker Tag */}
                  {line.speaker && (
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-[#C84B31]/15 text-[#C84B31] dark:bg-[#E85C40]/20 dark:text-[#E85C40]"
                          : "bg-black/5 text-[#6B6B6B] dark:bg-white/10 dark:text-[#A0A0A0]"
                      }`}
                    >
                      {line.speaker}
                    </span>
                  )}

                  {/* Japanese Kanji / Main Text */}
                  <div className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA] sm:text-xl">
                    {line.japanese}
                  </div>

                  {/* Furigana Reading */}
                  {showFurigana && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {line.reading}
                    </div>
                  )}

                  {/* English Translation */}
                  {showEnglish && (
                    <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                      {line.english}
                    </div>
                  )}
                </div>

                {/* Individual Line Play Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentLineIndex(idx);
                    playJapaneseAudio(line.reading || line.japanese, { rate: playbackSpeed });
                  }}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                    isActive
                      ? "bg-[#C84B31] text-white shadow-xs dark:bg-[#E85C40]"
                      : "bg-black/5 text-[#6B6B6B] group-hover:bg-[#C84B31] group-hover:text-white dark:bg-white/10 dark:text-[#A0A0A0] dark:group-hover:bg-[#E85C40]"
                  }`}
                  title="Play this line"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shadowing Master Controls Bar */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/15 dark:bg-[#1A1A1A]">
        {/* Playback & Loop Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/5">
          {/* Main Continuous Autoplay Button */}
          <button
            type="button"
            onClick={handleToggleContinuousPlay}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-700 animate-pulse"
                : "bg-[#C84B31] hover:bg-[#b03e26] dark:bg-[#E85C40]"
            }`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span>{isPlaying ? "Pause Continuous" : "Autoplay Shadowing"}</span>
          </button>

          {/* Speed Controls */}
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs font-bold text-[#6B6B6B] dark:text-[#A0A0A0]">
              <Gauge size={13} />
            </span>
            {([0.75, 0.85, 1, 1.2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                  playbackSpeed === spd
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-2xs"
                    : "border border-black/10 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Repeat Toggle */}
          <button
            type="button"
            onClick={() => setIsRepeatActive((r) => !r)}
            className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isRepeatActive
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "border-black/10 bg-[#FAFAF8] text-[#6B6B6B] hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#A0A0A0]"
            }`}
            title="Loop entire conversation"
          >
            <Repeat size={14} />
            <span>Loop: {isRepeatActive ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Visibility Toggles & Step Navigation */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFurigana((f) => !f)}
              className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#FAFAF8] px-2.5 py-1 font-semibold text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300"
            >
              {showFurigana ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showFurigana ? "Hide Furigana" : "Show Furigana"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEnglish((e) => !e)}
              className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#FAFAF8] px-2.5 py-1 font-semibold text-gray-700 hover:bg-black/5 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-300"
            >
              {showEnglish ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showEnglish ? "Hide English" : "Show English"}</span>
            </button>
          </div>

          {/* Line by line step buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentLineIndex === 0}
              onClick={handlePrevLine}
              className="rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1 text-xs font-bold text-[#1A1A1A] disabled:opacity-40 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
            >
              Prev Line
            </button>
            <span className="text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A0A0]">
              {currentLineIndex + 1} / {activeExercise.lines.length}
            </span>
            <button
              type="button"
              disabled={currentLineIndex === activeExercise.lines.length - 1}
              onClick={handleNextLine}
              className="rounded-xl border border-black/10 bg-[#FAFAF8] px-3 py-1 text-xs font-bold text-[#1A1A1A] disabled:opacity-40 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
            >
              Next Line
            </button>
          </div>
        </div>

        {/* 🎙️ Voice Recorder: Mic Shadow Test */}
        <div className="mt-6 rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/5 dark:bg-[#222222]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                }`}
              >
                <Mic size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Shadow Voice Recorder
                </div>
                <div className="text-[11px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Record and compare your pronunciation with native audio.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-1 rounded-xl bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 transition"
                >
                  <Mic size={14} />
                  <span>Record Shadowing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1 rounded-xl bg-gray-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-black dark:bg-white dark:text-black transition"
                >
                  <MicOff size={14} />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>
          </div>

          {/* Recorded Audio Playback */}
          {recordedAudioUrl && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-2.5 dark:border-white/10 dark:bg-[#1A1A1A]">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                🎙️ Your Recording Ready
              </span>
              <audio controls src={recordedAudioUrl} className="h-8 w-60" />
            </div>
          )}
        </div>

        {/* Tanaka Sensei Shadowing Tips */}
        <div className="mt-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 text-xs text-[#1A1A1A] dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-[#FAFAFA]">
          💡 <strong>Shadowing Technique:</strong> Listen to the native rhythm and speak along simultaneously with only a fraction of a second delay. Pay special attention to high/low pitch changes!
        </div>
      </div>
    </div>
  );
}
