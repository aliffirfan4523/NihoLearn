"use client";

import { useState } from "react";
import { KanaPracticeSetup, type KanaPracticeConfig } from "@/components/practice/KanaPracticeSetup";
import { KanaPracticeQuiz } from "@/components/practice/KanaPracticeQuiz";

export default function KanaPracticePage() {
  const [activeConfig, setActiveConfig] = useState<KanaPracticeConfig | null>(null);

  if (activeConfig) {
    return <KanaPracticeQuiz config={activeConfig} onExit={() => setActiveConfig(null)} />;
  }

  return <KanaPracticeSetup onStart={(cfg) => setActiveConfig(cfg)} />;
}
