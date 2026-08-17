// ─── High-Fidelity Japanese Audio Player Utility ─────────────────────────────
// Supports SpeechSynthesis (with ja-JP voice auto-detection) and online fallback
// streaming (Google Japanese Studio Voice / Youdao JP Voice) with automatic text cleaning.

/**
 * Strips non-Japanese annotations, brackets, translation notes, and punctuation.
 * e.g. "本を読む (ほんをよむ)" -> "本を読む"
 *      "雨 / 飴" -> "雨"
 *      "と as in とり" -> "とり"
 */
export function cleanJapaneseText(raw: string): string {
  if (!raw) return "";

  // 1. Remove bracketed / parenthetical text: (something), （something）, [something]
  let text = raw.replace(/[\(\（\[][^\)\）\]]*[\)\）\]]/g, "").trim();

  // 2. If text contains slashes like "雨 / 飴", take the primary word
  if (text.includes("/")) {
    text = text.split("/")[0].trim();
  }

  // 3. Remove punctuation / symbols
  text = text.replace(/^[「『"'·・\s]+|[」』"'·・\s]+$/g, "").trim();

  // 4. Remove leading Latin phrases like "as in ", "like "
  text = text.replace(/^[a-zA-Z\s]+/, "").trim();

  return text || raw.trim();
}

let activeAudioElement: HTMLAudioElement | null = null;
let lastPlayTimestamp = 0;
let lastPlayText = "";

// ── Autoplay-policy bridge ──────────────────────────────────────────────────
// Browsers block audio that starts before the first user gesture (games often
// auto-play on load). When that happens we park the play and flush it on the
// first pointer/key interaction.
let gestureRetry: (() => void) | null = null;

function flushGestureRetry() {
  const retry = gestureRetry;
  gestureRetry = null;
  retry?.();
}

if (typeof window !== "undefined") {
  const opts = { capture: true } as AddEventListenerOptions;
  window.addEventListener("pointerdown", flushGestureRetry, opts);
  window.addEventListener("keydown", flushGestureRetry, opts);
}

/**
 * Plays clean Japanese pronunciation with multi-tier fallback and duplicate prevention.
 */
export function playJapaneseAudio(
  text: string,
  options?: { rate?: number; onEnd?: () => void }
): void {
  if (typeof window === "undefined") return;

  const cleanText = cleanJapaneseText(text);
  if (!cleanText) return;

  // Debounce guard: prevent duplicate simultaneous audio triggers within 350ms for same word
  const now = Date.now();
  if (cleanText === lastPlayText && now - lastPlayTimestamp < 350) {
    return;
  }
  lastPlayTimestamp = now;
  lastPlayText = cleanText;

  // 1. Stop any currently playing audio stream immediately
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {}
    activeAudioElement = null;
  }

  // 2. Helper to play high-quality online Japanese TTS stream.
  //    Both providers are streamed through our /api/tts proxy (same-origin) to
  //    avoid browser-side referer/extension blocks on the raw endpoints.
  const playOnlineStream = () => {
    try {
      const primaryUrl = `/api/tts?p=google&q=${encodeURIComponent(cleanText)}`;
      const secondaryUrl = `/api/tts?p=youdao&q=${encodeURIComponent(cleanText)}`;

      const audio = new Audio(primaryUrl);
      activeAudioElement = audio;
      audio.volume = 1.0;

      audio.onended = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        if (activeAudioElement !== audio) return;
        // Fallback to secondary Youdao stream
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          activeAudioElement = fallbackAudio;
          fallbackAudio.volume = 1.0;
          fallbackAudio.onended = () => {
            if (activeAudioElement === fallbackAudio) activeAudioElement = null;
            options?.onEnd?.();
          };
          fallbackAudio.play().catch(() => {
            if (activeAudioElement === fallbackAudio) activeAudioElement = null;
          });
        } catch {
          activeAudioElement = null;
        }
      };

      audio.play().catch((err) => {
        if (activeAudioElement !== audio) return;
        if (err && err.name === "NotAllowedError") {
          // Autoplay policy: no user gesture yet. Park the audio; the bridge
          // above replays it on the first interaction.
          activeAudioElement = null;
          gestureRetry = () => playJapaneseAudio(cleanText, options);
          return;
        }
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          activeAudioElement = fallbackAudio;
          fallbackAudio.play().catch(() => {
            if (activeAudioElement === fallbackAudio) activeAudioElement = null;
          });
        } catch {
          activeAudioElement = null;
        }
      });
    } catch (err) {
      console.warn("Online audio stream error:", err);
    }
  };

  // 3. Try Web Speech API (SpeechSynthesis) first if a Japanese voice is installed
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes("ja") ||
          v.lang.toLowerCase().includes("jp") ||
          v.name.toLowerCase().includes("japanese") ||
          v.name.toLowerCase().includes("kyoko") ||
          v.name.toLowerCase().includes("otoya") ||
          v.name.toLowerCase().includes("ayumi") ||
          v.name.toLowerCase().includes("haruka")
      );

      // If a native Japanese voice is available on device, use it
      if (jaVoice) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = jaVoice;
        utterance.lang = "ja-JP";
        utterance.rate = options?.rate ?? 0.85;
        utterance.volume = 1.0;

        let hasStarted = false;
        let hasEnded = false;

        // Watchdog: speechSynthesis can be blocked by autoplay policy or stall
        // silently (no error event). If it never starts, fall to the online stream.
        const watchdog = setTimeout(() => {
          if (hasStarted || hasEnded) return;
          try {
            window.speechSynthesis.cancel();
          } catch {}
          playOnlineStream();
        }, 900);

        const clearWatchdog = () => clearTimeout(watchdog);

        utterance.onstart = () => {
          hasStarted = true;
          clearWatchdog();
        };

        utterance.onend = () => {
          hasEnded = true;
          clearWatchdog();
          options?.onEnd?.();
        };

        utterance.onerror = (e) => {
          clearWatchdog();
          // Ignore cancelled or interrupted events (happens when user clicks again)
          if (e.error === "canceled" || e.error === "interrupted") {
            return;
          }
          if (!hasStarted && !hasEnded) {
            playOnlineStream();
          }
        };

        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (err) {
      console.warn("SpeechSynthesis error:", err);
    }
  }

  // 4. If no Japanese voice is found on the client OS, use online streaming TTS
  playOnlineStream();
}
