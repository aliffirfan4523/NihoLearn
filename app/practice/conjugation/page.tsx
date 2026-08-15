"use client";

import { useState } from "react";
import {
  ConjugationDrillSetup,
  type ConjugationDrillConfig,
} from "@/components/practice/ConjugationDrillSetup";
import { ConjugationDrillGame } from "@/components/practice/ConjugationDrillGame";

export default function ConjugationPracticePage() {
  const [config, setConfig] = useState<ConjugationDrillConfig | null>(null);

  if (config) {
    return <ConjugationDrillGame config={config} onExit={() => setConfig(null)} />;
  }

  return <ConjugationDrillSetup onStart={(cfg) => setConfig(cfg)} />;
}
