"use client";

import { useScrollProgress } from "@/hooks/useAnimation";

export default function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
  );
}
