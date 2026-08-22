"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/* GSAP SplitText typography layer, shared by every section:
 * - `reveal`: lines (or words) rise out of a per-line mask when scrolled to,
 *   and replay on every re-entry.
 * - `highlight`: body copy brightens character by character, scrubbed by
 *   scroll position. */

let ease = "power3.out";
let registered = false;

function register() {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // the same curve as the page's cubic-bezier(0.16, 1, 0.3, 1)
  CustomEase.create("feOut", "M0,0 C0.16,1 0.3,1 1,1");
  ease = "feOut";
}

const PRESET = {
  line: { type: "lines", unit: "lines", stagger: 0.075, duration: 1.05 },
  sub: { type: "lines,words", unit: "words", stagger: 0.035, duration: 0.9 },
} as const;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Splitting before the webfont settles bakes the fallback font's line breaks
 * in, so both hooks hold their work until fonts are ready.
 */
function whenReady(run: () => () => void) {
  let cleanup: (() => void) | undefined;
  let cancelled = false;
  const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();
  fonts.then(
    () => {
      if (!cancelled) cleanup = run();
    },
    () => {
      if (!cancelled) cleanup = run();
    },
  );
  return () => {
    cancelled = true;
    cleanup?.();
  };
}

/** Masked rise-in for headings and sub copy. */
export function useSplitReveal<T extends HTMLElement = HTMLHeadingElement>(
  kind: keyof typeof PRESET = "line",
  delay = 0,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    register();

    return whenReady(() => {
      const p = PRESET[kind];
      el.classList.add("fe-split", "fe-hide");
      const split = SplitText.create(el, {
        type: p.type,
        mask: "lines",
        autoSplit: true,
        linesClass: "fe-line",
        wordsClass: "fe-word",
        onSplit(self) {
          el.classList.remove("fe-hide");
          // Replays on every entry: `once` dies after the first pass and
          // `reverse` stalls offscreen, so leave resets the state outright
          // and enter restarts from the top.
          return gsap.from(self[p.unit], {
            yPercent: 120,
            opacity: 0,
            duration: p.duration,
            ease,
            stagger: p.stagger,
            delay,
            scrollTrigger: {
              trigger: el,
              start: "clamp(top 86%)",
              toggleActions: "restart none none reset",
            },
          });
        },
      });
      return () => split.revert();
    });
  }, [kind, delay]);

  return ref;
}

/** Scroll-scrubbed character brightening for body copy. */
export function useScrubHighlight<T extends HTMLElement = HTMLParagraphElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    register();

    return whenReady(() => {
      el.classList.add("fe-split");
      const split = SplitText.create(el, {
        type: "lines,words,chars",
        autoSplit: true,
        linesClass: "fe-line",
        wordsClass: "fe-word",
        charsClass: "fe-letter",
        onSplit(self) {
          const byLine = self.lines.map((line) =>
            self.chars.filter((c) => line.contains(c)),
          );
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "clamp(top 92%)",
              end: "clamp(bottom 58%)",
              scrub: true,
            },
          });
          byLine.forEach((chars, i) => {
            if (chars.length) {
              tl.from(chars, { opacity: 0.22, stagger: 0.1, ease: "none" }, i * 0.3);
            }
          });
          return tl;
        },
      });
      return () => split.revert();
    });
  }, []);

  return ref;
}
