"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  ShieldAlert,
  Volume2,
  Bell,
  Globe,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Disc as DiscordIcon,
  HelpCircle,
  RotateCcw,
  Palette,
} from "lucide-react";
import { ThemeColorSelector } from "@/components/settings/ThemeColorSelector";

interface ProfileSettingsViewProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function ProfileSettingsView({ user }: ProfileSettingsViewProps) {
  const [username, setUsername] = useState(user.name ?? "Aekou");
  const [vocabGoal, setVocabGoal] = useState(5);
  const [grammarGoal, setGrammarGoal] = useState(2);
  const [reviewLevels, setReviewLevels] = useState<string[]>(["N5"]);
  const [notifications, setNotifications] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [answerFeedback, setAnswerFeedback] = useState(true);
  const [mascots, setMascots] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);
  const [blockFriends, setBlockFriends] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState("en");
  const [proficiencyLevel, setProficiencyLevel] = useState("beginner");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initials = (username || user.email).slice(0, 2).toUpperCase();

  const toggleLevel = (lvl: string) => {
    if (reviewLevels.includes(lvl)) {
      if (reviewLevels.length > 1) {
        setReviewLevels(reviewLevels.filter((l) => l !== lvl));
      }
    } else {
      setReviewLevels([...reviewLevels, lvl]);
    }
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">
          Manage your account preferences, study targets, and audio feedback.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          {/* Mini User Card */}
          <div className="rounded-3xl border border-black/10 bg-white p-5 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 font-bold text-white shadow-sm ring-2 ring-pink-500/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA] truncate">
                  {username}
                </div>
                <div className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0] truncate">
                  {user.email}
                </div>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="mt-5 space-y-2 border-t border-black/5 pt-4 text-xs dark:border-white/10">
              <div className="font-bold uppercase tracking-wider text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                Current Settings
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>🎓 Level</span>
                <span className="rounded bg-purple-500/15 px-1.5 py-0.5 font-bold text-purple-700 dark:text-purple-300">
                  Beginner
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>📚 Review levels</span>
                <span className="font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {reviewLevels.join(", ")}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>🎯 Daily goals</span>
                <span className="font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">
                  {vocabGoal}v / {grammarGoal}g
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>🌐 Language</span>
                <span className="font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">English</span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>⚡ Audio speed</span>
                <span className="font-medium text-[#1A1A1A] dark:text-[#FAFAFA]">{audioSpeed}x</span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>🔊 Answer feedback</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {answerFeedback ? "On" : "Off"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>🐱 Mascots</span>
                <span className="text-gray-400">{mascots ? "On" : "Off"}</span>
              </div>

              <div className="flex items-center justify-between text-[#6B6B6B] dark:text-[#A0A0A0]">
                <span>👁️ Activity feed</span>
                <span className="text-gray-400">{hideActivity ? "Hidden" : "Public"}</span>
              </div>
            </div>

            {/* Sections Quick Nav */}
            <div className="mt-5 space-y-1.5 border-t border-black/5 pt-4 text-xs font-semibold dark:border-white/10">
              <div className="font-bold uppercase tracking-wider text-[10px] text-[#6B6B6B] dark:text-[#A0A0A0]">
                Sections
              </div>
              <a
                href="#appearance"
                className="block rounded-lg px-2 py-1 text-[var(--color-vermillion)] hover:bg-black/5 dark:hover:bg-white/5 font-bold"
              >
                🎨 Appearance &amp; Themes
              </a>
              <a
                href="#profile-info"
                className="block rounded-lg px-2 py-1 text-[#6B6B6B] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#FAFAFA]"
              >
                👤 Profile
              </a>
              <a
                href="#connected-accounts"
                className="block rounded-lg px-2 py-1 text-[#6B6B6B] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#FAFAFA]"
              >
                👾 Connect Discord
              </a>
              <a
                href="#danger-zone"
                className="block rounded-lg px-2 py-1 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              >
                ⭐ Change JLPT Level
              </a>
              <a
                href="#danger-zone"
                className="block rounded-lg px-2 py-1 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              >
                🔤 Kana Progress
              </a>
              <a
                href="#language"
                className="block rounded-lg px-2 py-1 text-[#6B6B6B] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#FAFAFA]"
              >
                🌐 Language
              </a>
              <a
                href="#danger-zone"
                className="block rounded-lg px-2 py-1 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
              >
                🗑️ Delete Account
              </a>
            </div>
          </div>
        </div>

        {/* Right Main Settings Form */}
        <div className="space-y-8 lg:col-span-8">
          {/* Section 0: Appearance & Theme Customization */}
          <div
            id="appearance"
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#161B22] space-y-6"
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Appearance &amp; Theme Palette
                </h2>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Eye-friendly Japanese dark sumi surfaces and customizable accent colors.
                </p>
              </div>
            </div>

            <ThemeColorSelector />
          </div>

          {/* Section 1: Profile Information */}
          <div
            id="profile-info"
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#161B22] space-y-6"
          >
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
              Profile Information
            </h2>

            {/* Avatar Centered */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-3xl font-bold text-white shadow-lg ring-4 ring-pink-500/30 transition hover:scale-105">
                {initials}
              </div>
              <p className="mt-2 text-xs text-gray-400">Click on the image to change your profile picture</p>
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Username
                </label>
                <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  Can be changed
                </span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
              />
              <p className="mt-1 text-[11px] text-gray-400">Choose a unique username (minimum 3 characters)</p>
            </div>

            {/* Daily Goals */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Daily Study Goals
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Vocab words / day</span>
                  <input
                    type="number"
                    value={vocabGoal}
                    min={1}
                    max={50}
                    onChange={(e) => setVocabGoal(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Grammar Points per Day</span>
                  <input
                    type="number"
                    value={grammarGoal}
                    min={1}
                    max={20}
                    onChange={(e) => setGrammarGoal(Number(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] focus:border-[#C84B31] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
                  />
                </div>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">Set your daily learning targets</p>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Email
                </label>
                <span className="text-[11px] text-gray-400">Managed by Google</span>
              </div>
              <input
                type="email"
                disabled
                value={user.email}
                className="mt-2 w-full rounded-2xl border border-black/5 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-gray-500 dark:border-white/10 dark:bg-[#252525] dark:text-gray-400"
              />
            </div>

            {/* Review JLPT Levels */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                  Review JLPT Levels
                </label>
                <span className="rounded bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  Review Settings
                </span>
              </div>
              <div className="mt-3 flex gap-3">
                {["N5", "N4", "N3", "N2", "N1"].map((lvl) => {
                  const isChecked = reviewLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => toggleLevel(lvl)}
                      className={`flex h-10 w-12 items-center justify-center rounded-xl border text-xs font-bold transition ${
                        isChecked
                          ? "border-[#2D5F8A] bg-[#2D5F8A] text-white dark:border-[#4A86B8] dark:bg-[#4A86B8]"
                          : "border-black/10 bg-[#FAFAF8] text-gray-500 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-gray-400"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Select which JLPT levels to include in your reviews. Only items from selected levels will appear.
              </p>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
              <div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                  Push Notifications
                </div>
                <div className="text-xs text-gray-400">Get a daily reminder to do your review</div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  notifications ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Audio Speed Slider */}
            <div className="border-t border-black/5 pt-4 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Audio Speed</div>
                  <div className="text-xs text-gray-400">Playback speed for all Japanese audio and TTS</div>
                </div>
                <span className="rounded bg-purple-500/15 px-2 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  {audioSpeed}x
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>0.5x</span>
                <span>0.75x</span>
                <span>1x</span>
                <span>1.25x</span>
                <span>1.5x</span>
                <span>1.75x</span>
                <span>2x</span>
              </div>
            </div>

            {/* Answer Feedback Toggle */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
              <div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Answer Feedback</div>
                <div className="text-xs text-gray-400">Play a sound and feedback on correct/wrong answers</div>
              </div>
              <button
                type="button"
                onClick={() => setAnswerFeedback(!answerFeedback)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  answerFeedback ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    answerFeedback ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Study Mascots Toggle */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
              <div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Study Mascots</div>
                <div className="text-xs text-gray-400">Show mascot reactions during practice and reviews</div>
              </div>
              <button
                type="button"
                onClick={() => setMascots(!mascots)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  mascots ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    mascots ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Hide Activity Feed Toggle */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
              <div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Hide Activity Feed</div>
                <div className="text-xs text-gray-400">Hide all your learning sessions from the friends feed</div>
              </div>
              <button
                type="button"
                onClick={() => setHideActivity(!hideActivity)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  hideActivity ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    hideActivity ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Block Friend Requests Toggle */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
              <div>
                <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Block Friend Requests</div>
                <div className="text-xs text-gray-400">Stop anyone from sending you new friend requests</div>
              </div>
              <button
                type="button"
                onClick={() => setBlockFriends(!blockFriends)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  blockFriends ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    blockFriends ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between border-t border-black/5 pt-5 dark:border-white/10">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={16} /> Changes saved successfully!
                </div>
              )}
              {!saveSuccess && <div />}

              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-purple-700"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Section 2: Language */}
          <div
            id="language"
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-5"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Language</h2>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Beta
              </span>
            </div>

            <div className="rounded-2xl bg-black/5 p-4 text-xs text-[#6B6B6B] dark:bg-white/5 dark:text-[#A0A0A0] space-y-1">
              <div className="font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">
                Translations are powered by Google Translate
              </div>
              <p>
                Automatic translation can produce inaccurate or awkward results, especially for learning content. We strongly recommend using the app in English for the best experience. Japanese content (kana, kanji, romaji) is protected and will not be translated.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0]">
                Display Language
              </label>
              <select
                value={displayLanguage}
                onChange={(e) => setDisplayLanguage(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
              >
                <option value="en">GB English (Recommended)</option>
                <option value="ms">MY Bahasa Melayu</option>
                <option value="id">ID Bahasa Indonesia</option>
                <option value="ja">JP 日本語</option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">The page will reload to apply the selected language</p>
            </div>
          </div>

          {/* Section 3: Connected Accounts */}
          <div
            id="connected-accounts"
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-xs dark:border-white/15 dark:bg-[#1A1A1A] space-y-4"
          >
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Connected Accounts</h2>

            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-[#FAFAF8] p-4 dark:border-white/10 dark:bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <DiscordIcon size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Discord</div>
                  <div className="text-xs text-gray-400">Not connected</div>
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                Connect
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Link your Discord account to access community leaderboards and bot commands in our Discord server.
            </p>
          </div>

          {/* Section 4: Danger Zone */}
          <div
            id="danger-zone"
            className="rounded-3xl border-2 border-rose-500/40 bg-white p-7 shadow-xs dark:border-rose-500/50 dark:bg-[#1A1A1A] space-y-6"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-rose-500" />
              <h2 className="text-lg font-bold text-rose-500">Danger Zone</h2>
            </div>

            {/* Change Japanese Proficiency Level */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-500">
                  Change Japanese Proficiency Level
                </label>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  ⏱ Resets Progress
                </span>
              </div>
              <select
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#FAFAF8] px-4 py-3 text-sm font-semibold text-[#1A1A1A] focus:outline-none dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
              >
                <option value="beginner">Complete Beginner</option>
                <option value="n5">N5 (Elementary)</option>
                <option value="n4">N4 (Pre-Intermediate)</option>
                <option value="n3">N3 (Intermediate)</option>
              </select>
              <p className="mt-1 text-[11px] text-gray-400">This will reset your learning progress to match the new level</p>
            </div>

            {/* Kana Progress Reset / Known */}
            <div className="border-t border-rose-500/20 pt-4 space-y-2">
              <div className="text-sm font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">Kana Progress</div>
              <p className="text-xs text-gray-400">Mark all kanas as known or reset all progress to start fresh.</p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => alert("All 204 Kana marked as known!")}
                  className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-xs font-bold text-[#1A1A1A] shadow-xs hover:border-[#C84B31] dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
                >
                  Mark All as Known
                </button>
                <button
                  type="button"
                  onClick={() => alert("Kana progress reset to 0%!")}
                  className="flex-1 rounded-2xl border border-black/10 bg-[#FAFAF8] py-3 text-xs font-bold text-[#1A1A1A] shadow-xs hover:border-rose-500 hover:text-rose-500 dark:border-white/15 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]"
                >
                  Mark All as Unknown
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between border-t border-rose-500/20 pt-4">
              <p className="text-xs text-gray-400">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                    alert("Account deletion request submitted.");
                  }
                }}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-rose-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
