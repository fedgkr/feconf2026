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

/** Overall document scroll progress in [0, 1]. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return progress;
}
