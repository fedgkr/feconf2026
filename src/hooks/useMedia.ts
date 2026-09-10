"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { heroMedia } from "@/lib/heroMedia";
import { prefersReducedMotion } from "@/hooks/useAnimation";

const noopSubscribe = () => () => {};

/** The shared random pick, resolved on the client so the static export stays deterministic. */
export function useHeroMedia() {
  return useSyncExternalStore(noopSubscribe, heroMedia, () => null);
}

/**
 * Plays a looping decorative video only while it is worth decoding: near the
 * viewport, in a visible tab, and — via `wanted` — while its owner actually
 * shows it (a hovered card, an active phase). Eighteen schedule cards each
 * carry one of these, so the gate is what keeps the page from running that
 * many decoders at once.
 */
export function useManagedVideo(wanted: boolean) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const near = useRef(false);
  const wantedRef = useRef(wanted);

  const sync = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    const play =
      wantedRef.current &&
      near.current &&
      !document.hidden &&
      !prefersReducedMotion();
    if (play && video.paused) video.play().catch(() => {});
    if (!play && !video.paused) video.pause();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        near.current = entry.isIntersecting;
        sync();
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [sync]);

  useEffect(() => {
    wantedRef.current = wanted;
    sync();
  }, [wanted, sync]);

  return ref;
}
