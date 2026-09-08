"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Matches the 1s `topBubbles`/`bottomBubbles` keyframes in globals.css. */
const CONFETTI_MS = 1000;

/**
 * Copy-confetti trigger, ported from lucide.dev's `useConfetti` composable
 * (lucide-icons/lucide, docs/.vitepress/theme/composables/useConfetti.ts).
 * `animate` drives the `.confetti-button.animate` class; writing the clipboard
 * stays with the caller, exactly as in lucide's `IconDetailName.vue`.
 *
 * Deviation from the Vue original: a second trigger while the burst is still
 * running drops the class for one frame so the keyframes replay instead of
 * silently doing nothing.
 */
export function useConfetti() {
  const [animate, setAnimate] = useState(false);
  const running = useRef(false);
  const timer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    timer.current = null;
    frame.current = null;
  }, []);

  const confetti = useCallback(() => {
    stop();
    const start = () => {
      running.current = true;
      setAnimate(true);
      timer.current = window.setTimeout(() => {
        running.current = false;
        setAnimate(false);
      }, CONFETTI_MS);
    };
    if (running.current) {
      setAnimate(false);
      frame.current = requestAnimationFrame(start);
      return;
    }
    start();
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { animate, confetti };
}
