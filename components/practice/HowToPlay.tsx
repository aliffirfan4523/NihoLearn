"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, X } from "lucide-react";

interface HowToPlayProps {
  /** Unique key per game, used to remember first visit, e.g. "falling-words" */
  gameKey: string;
  title?: string;
  /** Ordered steps describing how the game works */
  steps: string[];
  /** Optional one-line tip shown under the steps */
  note?: string;
}

/**
 * Progressive-disclosure help for practice games (NN/g-style onboarding):
 * a compact "?" pill that opens a full instruction dialog on demand.
 * The dialog auto-opens ONCE on a user's first visit to teach the game,
 * then only ever appears when they tap the button.
 */
export function HowToPlay({ gameKey, title = "How to Play", steps, note }: HowToPlayProps) {
  const storageKey = `niholearn-howto-${gameKey}`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gotItRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(storageKey) === "dismissed";
    } catch {}
    setOpen(!seen); // First visit: teach once. Returning players are never interrupted.
    setMounted(true);
  }, [storageKey]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch {}
  }, [storageKey]);

  // Esc closes; focus lands on the confirm button for keyboard users.
  useEffect(() => {
    if (!open) return;
    gotItRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      {/* Compact entry point — minimal footprint above the game */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-bold text-gray-400 shadow-xs transition hover:border-amber-400/50 hover:text-amber-600 dark:border-white/10 dark:bg-[#1A1A1A] dark:text-gray-500 dark:hover:border-amber-400/40 dark:hover:text-amber-400"
        >
          <CircleHelp size={13} />
          {title}
        </button>
      </div>

      {/* Instruction dialog */}
      {mounted && open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:border-white/15 dark:bg-[#1A1A1A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <CircleHelp size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[#1A1A1A] dark:text-[#FAFAFA]">{title}</h2>
                  <p className="text-[11px] text-gray-400">Read once — then jump straight in</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-xl p-1.5 text-gray-400 transition hover:bg-black/5 hover:text-gray-600 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <ol className="mt-5 space-y-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-[#4B4B4B] dark:text-[#A0A0A0]">{step}</span>
                </li>
              ))}
            </ol>

            {note && (
              <p className="mt-4 rounded-2xl bg-amber-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                {note}
              </p>
            )}

            <button
              ref={gotItRef}
              type="button"
              onClick={close}
              className="mt-5 w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-600 active:scale-[0.98]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
