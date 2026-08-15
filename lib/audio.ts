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

/**
 * Plays clean Japanese pronunciation with multi-tier fallback.
 */
export function playJapaneseAudio(
  text: string,
  options?: { rate?: number; onEnd?: () => void }
): void {
  if (typeof window === "undefined") return;

  const cleanText = cleanJapaneseText(text);
  if (!cleanText) return;

  // 1. Stop any currently playing audio stream immediately
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {}
    activeAudioElement = null;
  }

  // 2. Helper to play high-quality online Japanese TTS stream (Google & Youdao)
  const playOnlineStream = () => {
    try {
      const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(
        cleanText
      )}`;
      const secondaryUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(
        cleanText
      )}&le=jap`;

      const audio = new Audio(primaryUrl);
      activeAudioElement = audio;
      audio.volume = 1.0;

      audio.onended = () => {
        activeAudioElement = null;
        options?.onEnd?.();
      };

      audio.onerror = () => {
        // Fallback to secondary Youdao stream
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          activeAudioElement = fallbackAudio;
          fallbackAudio.volume = 1.0;
          fallbackAudio.onended = () => {
            activeAudioElement = null;
            options?.onEnd?.();
          };
          fallbackAudio.play().catch((err) => {
            console.warn("Secondary audio fallback failed:", err);
            activeAudioElement = null;
          });
        } catch {
          activeAudioElement = null;
        }
      };

      audio.play().catch(() => {
        // If primary stream blocked by browser policy, try secondary stream
        try {
          const fallbackAudio = new Audio(secondaryUrl);
          activeAudioElement = fallbackAudio;
          fallbackAudio.play().catch(() => {
            activeAudioElement = null;
          });
        } catch {
          activeAudioElement = null;
        }
      });
    } catch (err) {
      console.warn("Online audio stream failed:", err);
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

        let hasEnded = false;
        utterance.onend = () => {
          hasEnded = true;
          options?.onEnd?.();
        };

        utterance.onerror = () => {
          if (!hasEnded) playOnlineStream();
        };

        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (err) {
      console.warn("SpeechSynthesis error:", err);
    }
  }

  // 4. If no Japanese voice is found on the client OS (common on Windows without JP pack), use online streaming TTS
  playOnlineStream();
}
