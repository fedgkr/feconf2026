"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/* GSAP SplitText typography layer, shared by every section:
 * lines (or words) rise out of a per-line mask when scrolled to and replay on
 * every re-entry. */

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
const HEADING_REVEAL_PERCENT = 86;
const HEADING_REVEAL_OFFSET_PROPERTY = "--heading-reveal-offset";

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
  observeEntry = false,
  onComplete?: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    register();

    return whenReady(() => {
      const p = PRESET[kind];
      let observer: IntersectionObserver | undefined;
      let exitObserver: IntersectionObserver | undefined;
      let removeResizeListener: (() => void) | undefined;
      // SplitText auto-split recreates the tween; keep the reveal gate intact.
      let armed = true;
      el.classList.add("fe-split", "fe-hide");
      const split = SplitText.create(el, {
        type: p.type,
        mask: "lines",
        autoSplit: true,
        linesClass: "fe-line",
        wordsClass: "fe-word",
        onSplit(self) {
          observer?.disconnect();
          exitObserver?.disconnect();
          removeResizeListener?.();
          el.classList.remove("fe-hide");
          // Replays on re-entry from below, but only after a full exit under
          // the viewport: resetting or replaying right at the reveal line
          // would blink visible copy on every direction change near it, so
          // `armed` gates the replay on both trigger paths.
          const tween = gsap.from(self[p.unit], {
            yPercent: 120,
            opacity: 0,
            duration: p.duration,
            ease,
            stagger: p.stagger,
            delay,
            onComplete,
            ...(observeEntry
              ? { paused: true }
              : {
                  scrollTrigger: {
                    trigger: el,
                    // the trigger spans from "top at viewport bottom" to the
                    // reveal line: crossing the line down plays an armed
                    // reveal, and only a full exit below (crossing the start
                    // back up) rewinds it and arms the next entrance
                    start: "clamp(top bottom)",
                    end: `clamp(top ${HEADING_REVEAL_PERCENT}%)`,
                    toggleActions: "none none none none",
                    onLeave: (st) => {
                      if (!armed) return;
                      armed = false;
                      st.animation?.restart(true);
                    },
                    onLeaveBack: (st) => {
                      armed = true;
                      st.animation?.pause(0);
                    },
                  },
                }),
          });

          if (!observeEntry) {
            // a load restored past the reveal line still plays the entrance
            const st = tween.scrollTrigger;
            if (st && st.progress >= 1 && armed) {
              armed = false;
              tween.restart(true);
            }
            return tween;
          }

          // A section-specific lead-in observes painted bounds so its CSS
          // offset changes only the trigger without moving the content.
          let viewportWidth = window.innerWidth;
          let viewportHeight = window.innerHeight;
          const observeAtSharedLine = () => {
            observer?.disconnect();
            const revealOffset =
              Number.parseFloat(
                getComputedStyle(el).getPropertyValue(
                  HEADING_REVEAL_OFFSET_PROPERTY,
                ),
              ) || 0;
            const bottomRootMargin =
              revealOffset -
              viewportHeight * (1 - HEADING_REVEAL_PERCENT / 100);
            observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting && armed) {
                  armed = false;
                  tween.restart(true);
                }
              },
              { rootMargin: `0px 0px ${bottomRootMargin}px 0px` },
            );
            observer.observe(el);
          };
          // the reset side watches the raw viewport: only a full exit below
          // rewinds the reveal and arms the next entrance
          exitObserver = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
              armed = true;
              tween.pause(0);
            }
          });
          exitObserver.observe(el);
          const onResize = () => {
            if (window.innerWidth === viewportWidth) return;
            viewportWidth = window.innerWidth;
            viewportHeight = window.innerHeight;
            observeAtSharedLine();
          };
          window.addEventListener("resize", onResize);
          removeResizeListener = () =>
            window.removeEventListener("resize", onResize);
          observeAtSharedLine();
          return tween;
        },
      });
      return () => {
        observer?.disconnect();
        exitObserver?.disconnect();
        removeResizeListener?.();
        split.revert();
      };
    });
  }, [kind, delay, observeEntry, onComplete]);

  return ref;
}
