"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useScrollEffect } from "@/hooks/useAnimation";
import { useHeroMedia, useManagedVideo } from "@/hooks/useMedia";
import { STORY_ASSETS, STORY_PHRASES } from "@/data/site";

const EASE = "cubic-bezier(.16,1,.3,1)";

function StoryCopy({
  lines,
  leaving,
}: {
  lines: readonly [string, string];
  leaving: boolean;
}) {
  // mounts hidden and reveals a frame later, so the rise-in transition plays
  const [on, setOn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const shown = on && !leaving;
  return (
    <div className="overflow-hidden">
      <p
        className="min-h-[60px] text-center text-xl font-semibold leading-[1.4] tracking-[-1.2px] text-ink sm:min-h-[90px] sm:text-2xl md:text-[32px]"
        style={{
          opacity: shown ? 1 : 0,
          transform: leaving
            ? "translateY(-8px)"
            : shown
              ? "translateY(0)"
              : "translateY(18px)",
          transition: `opacity 0.42s ${EASE}, transform 0.42s ${EASE}`,
        }}
      >
        <span>{lines[0]}</span>
        <br />
        <span>{lines[1]}</span>
      </p>
    </div>
  );
}

/** The car/snail silhouette filled with the hero-picked WEBM. */
function MediaMask({
  layerClass,
  maskSrc,
  src,
  wanted,
}: {
  layerClass: string;
  maskSrc: string;
  src?: string;
  wanted: boolean;
}) {
  const videoRef = useManagedVideo(wanted);
  return (
    <div
      className={`fc-story-media-mask ${layerClass}`}
      style={{ maskImage: `url(${maskSrc})` }}
    >
      <video ref={videoRef} src={src} loop muted playsInline preload="auto" aria-hidden="true" />
    </div>
  );
}

/**
 * 340vh brand-story interlude, pinned for its whole travel. It slides in over
 * the hero's tail (`.hero-sequence + section`), draws its centre frame once
 * on arrival, and walks three phrases through the frame — a pixel car races
 * past under the first, two snails relay under the rest.
 */
export default function StorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const media = useHeroMedia();

  const [phase, setPhase] = useState(0);
  const [active, setActive] = useState(false);
  const [run, setRun] = useState(false);
  // the copy on screen trails `phase` by a beat so each line gets its exit
  const [shownPhase, setShownPhase] = useState(-1);
  const seen = useRef(false);
  const lastPhase = useRef(0);
  // snails restart their relay each time the car phase hands over to them
  const [snailEpoch, setSnailEpoch] = useState(0);

  useScrollEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = Math.max(el.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    const next = Math.min(STORY_PHRASES.length - 1, Math.floor(progress * 3));
    if (lastPhase.current === 0 && next >= 1) setSnailEpoch((e) => e + 1);
    lastPhase.current = next;
    setPhase(next);
    const onStage =
      rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.2;
    setActive(onStage);
    if (onStage) setRun(true);
  });

  // The first line waits out the frame drawing; later swaps are quick.
  useEffect(() => {
    if (!active || shownPhase === phase) return;
    const delay = seen.current ? 120 : 1180;
    seen.current = true;
    const timer = setTimeout(() => setShownPhase(phase), delay);
    return () => clearTimeout(timer);
  }, [active, phase, shownPhase]);

  // infinite loops park while the section is far offscreen
  const { ref: motionRef, inView: motionActive } = useInView<HTMLDivElement>({
    threshold: 0.01,
    rootMargin: "180px 0px",
    once: false,
  });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "340vh" }}
      data-nav-bg="#fafafd"
    >
      <div
        ref={motionRef}
        className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-surface ${
          run ? "fc-run" : ""
        } ${motionActive ? "fc-motion-active" : ""}`}
      >
        <div className="fc-vL" />
        <div className="fc-vR" />
        <div className="fc-hLine" style={{ top: "calc(50% - 72px)" }} />
        <div className="fc-hLine" style={{ top: "calc(50% + 72px)" }} />
        <div className="fc-story-copy-grid">
          {shownPhase >= 0 && (
            <StoryCopy
              key={shownPhase}
              lines={STORY_PHRASES[shownPhase]}
              leaving={shownPhase !== phase}
            />
          )}
        </div>
        <div
          className="fc-car-loop absolute"
          style={{ bottom: "15%", display: phase === 0 ? "block" : "none" }}
        >
          {/* the still is only a fallback until the WEBM fill mounts */}
          <img
            src={STORY_ASSETS.carSrc}
            alt=""
            style={{ imageRendering: "pixelated", opacity: media ? 0 : 1 }}
          />
          <MediaMask
            layerClass="fc-car-media-mask"
            maskSrc={STORY_ASSETS.carSrc}
            src={media?.src}
            wanted={phase === 0 && motionActive}
          />
        </div>
        <div
          key={snailEpoch}
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{
            bottom: "15%",
            opacity: phase >= 1 ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          {(["fc-snail-a", "fc-snail-b"] as const).map((variant) => (
            <div key={variant} className={`fc-snail-autoplay ${variant}`} aria-hidden="true">
              <img
                src={STORY_ASSETS.snailSrc}
                alt=""
                style={{ imageRendering: "pixelated", opacity: media ? 0 : 1 }}
              />
              <MediaMask
                layerClass="fc-snail-media-mask"
                maskSrc={STORY_ASSETS.snailSrc}
                src={media?.src}
                wanted={phase >= 1 && motionActive}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
