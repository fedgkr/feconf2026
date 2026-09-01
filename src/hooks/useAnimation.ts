"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  /** keep the element revealed after the first intersection (default) */
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  rootMargin = "0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

/**
 * One window listener pair and one animation frame for the whole page: every
 * subscriber runs together, once per frame, so a frame reads layout only once.
 */
const scrollSubscribers = new Set<() => void>();
let scrollFrame = 0;

const runScrollSubscribers = () => {
  scrollFrame = 0;
  for (const run of scrollSubscribers) run();
};

const scheduleScrollRun = () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(runScrollSubscribers);
};

function subscribeToScroll(run: () => void) {
  if (scrollSubscribers.size === 0) {
    window.addEventListener("scroll", scheduleScrollRun, { passive: true });
    window.addEventListener("resize", scheduleScrollRun);
  }
  scrollSubscribers.add(run);
  scheduleScrollRun();

  return () => {
    scrollSubscribers.delete(run);
    if (scrollSubscribers.size > 0) return;
    window.removeEventListener("scroll", scheduleScrollRun);
    window.removeEventListener("resize", scheduleScrollRun);
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
  };
}

/**
 * Runs `update` on scroll and resize, coalesced with every other subscriber
 * into a single frame. The callback is read through a ref so re-renders never
 * re-subscribe.
 */
export function useScrollEffect(update: () => void) {
  const latest = useRef(update);

  useEffect(() => {
    latest.current = update;
  });

  useEffect(() => subscribeToScroll(() => latest.current()), []);
}

/** Per-child styles for a staggered fade-up entrance. */
export function useStaggerChildren(
  inView: boolean,
  count: number,
  stepMs = 80,
): CSSProperties[] {
  return Array.from({ length: count }, (_, i) => ({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(40px)",
    transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * stepMs}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * stepMs}ms`,
  }));
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * The section rises from `distanceVh` below (default 80vh) into its place
 * while it approaches, about 5.5x scroll speed, and settles by the time its
 * top reaches 18% of the window. The class carrying the transform is added
 * here rather than in the markup so a render without JavaScript stays in
 * plain flow.
 */
export function useCoverRise<T extends HTMLElement = HTMLElement>(
  distanceVh = 80,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current?.classList.add("fc-cover");
  }, []);

  useScrollEffect(() => {
    const el = ref.current;
    if (!el) return;
    // the transform moves the box, so read the layout top from under it
    const rect = el.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    const layoutTop = rect.top - (matrix.m42 || 0);
    const progress = smoothstep(
      clamp01((window.innerHeight - layoutTop) / (window.innerHeight * 0.82)),
    );
    el.style.setProperty("--fc-cover-y", `${(1 - progress) * distanceVh}vh`);
  });

  return ref;
}
