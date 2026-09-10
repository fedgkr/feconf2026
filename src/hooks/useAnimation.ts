"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

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
const scrollSubscribers = new Set<(resized: boolean) => void>();
let scrollFrame = 0;
let resizeQueued = false;

const runScrollSubscribers = () => {
  scrollFrame = 0;
  const resized = resizeQueued;
  resizeQueued = false;
  for (const run of scrollSubscribers) run(resized);
};

const scheduleScrollRun = (resized = false) => {
  resizeQueued ||= resized;
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(runScrollSubscribers);
};

const onScroll = () => scheduleScrollRun();
const onResize = () => scheduleScrollRun(true);

function subscribeToScroll(run: (resized: boolean) => void) {
  if (scrollSubscribers.size === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  }
  scrollSubscribers.add(run);
  scheduleScrollRun();

  return () => {
    scrollSubscribers.delete(run);
    if (scrollSubscribers.size > 0) return;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    if (scrollFrame) {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
    resizeQueued = false;
  };
}

/**
 * Runs `update` on scroll and resize, coalesced with every other subscriber
 * into a single frame. The callback is read through a ref so re-renders never
 * re-subscribe.
 */
export function useScrollEffect(update: (resized: boolean) => void) {
  const latest = useRef(update);

  useEffect(() => {
    latest.current = update;
  });

  useEffect(() => subscribeToScroll((resized) => latest.current(resized)), []);
}

/** Per-child styles for a staggered fade-up entrance. */
export function useStaggerChildren(
  inView: boolean,
  count: number,
  stepMs = 80,
  {
    baseDelayMs = 0,
    distancePx = 40,
    durationS = 0.7,
  }: { baseDelayMs?: number; distancePx?: number; durationS?: number } = {},
): CSSProperties[] {
  return Array.from({ length: count }, (_, i) => {
    const delay = baseDelayMs + i * stepMs;
    return {
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${distancePx}px)`,
      transition: `opacity ${durationS}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${durationS}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    };
  });
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Devices with a fine pointer and hover keep a stable innerHeight; touch
 * devices (mobile browser chrome) step it as toolbars hide and show. */
export const allowsHeightResize = () =>
  navigator.maxTouchPoints === 0 &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Live `prefers-reduced-motion` check, read fresh at call time. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Mobile Safari steps innerHeight up and down as its toolbar hides and shows
 * mid-scroll; feeding that straight into a scroll calculation jolts it by
 * tens of px on every toggle. Outside the fine-pointer desktop gate, keep the
 * largest height seen at the current width so toolbar steps leave it alone.
 */
export function useStableViewportHeight() {
  const stableViewport = useRef({ width: 0, height: 0 });
  return useCallback(() => {
    const sv = stableViewport.current;
    if (window.innerWidth !== sv.width) {
      sv.width = window.innerWidth;
      sv.height = window.innerHeight;
    } else if (allowsHeightResize() || window.innerHeight > sv.height) {
      sv.height = window.innerHeight;
    }
    return sv.height;
  }, []);
}

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
  const stableVh = useStableViewportHeight();

  useEffect(() => {
    ref.current?.classList.add("fc-cover");
  }, []);

  useScrollEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vh = stableVh();
    // the transform moves the box, so read the layout top from under it
    const rect = el.getBoundingClientRect();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    const layoutTop = rect.top - (matrix.m42 || 0);
    const progress = smoothstep(clamp01((vh - layoutTop) / (vh * 0.82)));
    const coverY = `calc(var(--fc-vh, 100vh) * ${((1 - progress) * distanceVh) / 100})`;
    if (el.style.getPropertyValue("--fc-cover-y") !== coverY) {
      el.style.setProperty("--fc-cover-y", coverY);
    }
  });

  return ref;
}
