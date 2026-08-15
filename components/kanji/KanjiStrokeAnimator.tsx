"use client";

import { useState, useEffect } from "react";
import { Play, Sparkles } from "lucide-react";

interface StrokeInfo {
  path: string;
  number?: { x: number; y: number; num: string };
  color: string;
}

const STROKE_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#E11D48", // Rose
];

export function KanjiStrokeAnimator({
  character,
  strokesCount = 1,
}: {
  character: string;
  strokesCount?: number;
}) {
  const [strokes, setStrokes] = useState<StrokeInfo[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingStrokeIdx, setAnimatingStrokeIdx] = useState<number | null>(null);
  const [loadingSvg, setLoadingSvg] = useState(true);

  // Fetch KanjiVG SVG data for accurate strokes & numbers
  useEffect(() => {
    let isMounted = true;
    setLoadingSvg(true);
    setStrokes([]);
    setIsAnimating(false);
    setAnimatingStrokeIdx(null);

    const hexCode = character.codePointAt(0)?.toString(16).padStart(5, "0");
    if (!hexCode) return;

    const url = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hexCode}.svg`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("KanjiVG SVG not found");
        return res.text();
      })
      .then((svgText) => {
        if (!isMounted) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");

        const pathNodes = Array.from(doc.querySelectorAll("path[d]"));
        const textNodes = Array.from(doc.querySelectorAll("text"));

        const parsedStrokes: StrokeInfo[] = pathNodes.map((p, idx) => {
          const d = p.getAttribute("d") || "";
          const color = STROKE_COLORS[idx % STROKE_COLORS.length];

          const numNode = textNodes[idx];
          let numberInfo: { x: number; y: number; num: string } | undefined = undefined;

          if (numNode) {
            const transform = numNode.getAttribute("transform") || "";
            const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,([^,]+),([^)]+)\)/);
            if (match) {
              numberInfo = {
                x: parseFloat(match[1]) || 10,
                y: parseFloat(match[2]) || 10,
                num: numNode.textContent || String(idx + 1),
              };
            } else {
              const x = parseFloat(numNode.getAttribute("x") || "0");
              const y = parseFloat(numNode.getAttribute("y") || "0");
              if (x || y) {
                numberInfo = { x, y, num: numNode.textContent || String(idx + 1) };
              }
            }
          }

          if (!numberInfo) {
            numberInfo = { x: 10 + (idx * 6) % 80, y: 15 + (idx * 8) % 80, num: String(idx + 1) };
          }

          return { path: d, number: numberInfo, color };
        });

        if (parsedStrokes.length > 0) {
          setStrokes(parsedStrokes);
        }
      })
      .catch(() => {
        if (isMounted) setStrokes([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSvg(false);
      });

    return () => {
      isMounted = false;
    };
  }, [character]);

  const handleStartAnimation = () => {
    if (strokes.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setAnimatingStrokeIdx(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current >= strokes.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimating(false);
          setAnimatingStrokeIdx(null);
        }, 800);
      } else {
        setAnimatingStrokeIdx(current);
      }
    }, 650);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        onClick={handleStartAnimation}
        className="group relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-3xl border border-black/10 bg-[#FAFAF8] p-3 shadow-inner transition hover:border-[#C84B31]/50 hover:bg-[#F4F4F0] dark:border-white/10 dark:bg-[#12151B] dark:hover:border-[#E85C40]/50 dark:hover:bg-[#181C24]"
      >
        {strokes.length > 0 ? (
          <svg
            viewBox="0 0 109 109"
            className="h-full w-full select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background grid lines for calligraphy precision */}
            <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="currentColor" className="text-black/10 dark:text-white/10" strokeDasharray="2,2" />
            <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="currentColor" className="text-black/10 dark:text-white/10" strokeDasharray="2,2" />

            {/* Stroke paths */}
            {strokes.map((s, idx) => {
              const isVisible =
                !isAnimating || (animatingStrokeIdx !== null && idx <= animatingStrokeIdx);
              const isCurrentDrawing = isAnimating && animatingStrokeIdx === idx;

              if (!isVisible) return null;

              return (
                <path
                  key={`path-${idx}`}
                  d={s.path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isCurrentDrawing ? "animate-pulse" : ""}
                  style={{
                    filter: isCurrentDrawing ? `drop-shadow(0 0 4px ${s.color})` : "none",
                  }}
                />
              );
            })}

            {/* Stroke Numbers (shown when not actively animating) */}
            {!isAnimating &&
              strokes.map((s, idx) => {
                if (!s.number) return null;
                return (
                  <text
                    key={`num-${idx}`}
                    x={s.number.x}
                    y={s.number.y}
                    fontSize="7"
                    fill="currentColor"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    className="select-none text-[#64748B] dark:text-[#94A3B8] opacity-80"
                  >
                    {s.number.num}
                  </text>
                );
              })}
          </svg>
        ) : (
          <div className="font-serif text-7xl font-bold text-[#1A1A1A] transition group-hover:scale-105 dark:text-white">
            {character}
          </div>
        )}

        {/* Play Overlay Indicator */}
        <div className="absolute bottom-2 right-2 rounded-full bg-black/10 p-1 text-gray-700 opacity-0 transition group-hover:opacity-100 dark:bg-black/60 dark:text-gray-300">
          <Play size={10} className="fill-current" />
        </div>
      </div>

      <button
        type="button"
        onClick={handleStartAnimation}
        className="mt-2.5 flex items-center gap-1.5 text-xs italic text-[#64748B] transition hover:text-[#C84B31] dark:text-[#8E9CAE] dark:hover:text-[#E85C40]"
      >
        <Sparkles size={12} className="text-[#C84B31] dark:text-[#E85C40]" />
        <span>Click to see stroke order animation</span>
      </button>
    </div>
  );
}
