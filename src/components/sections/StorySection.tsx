"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useScrollEffect } from "@/hooks/useAnimation";
import { useHeroMedia, useManagedVideo } from "@/hooks/useMedia";
import { STORY_ASSETS, STORY_PHRASES } from "@/data/site";

const EASE = "cubic-bezier(.16,1,.3,1)";

/** a displayed phrase counts as seen once it has risen and been readable —
 * this is the whole dwell a parked scroller gets, so it carries the reading */
const PHRASE_SEEN_MS = 1200;
/** the car returns this long after phase 0 does, so the snails clear first */
const CAR_RETURN_MS = 300;
/** snails gone at least this long count as cleared; only then does a return
 * to the snail phases restart their relay from the top */
const SNAIL_CLEARED_MS = 400;
/** how long wheel/touch/key input keeps counting as "the user is scrolling" */
const INPUT_GRACE_MS = 2000;
/** keys that scroll the page downward */
const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);

function getScrollMetrics(sectionHeight: number, viewportHeight: number) {
  const travel = Math.max(sectionHeight - viewportHeight, 1);
  return { travel, segment: travel / STORY_PHRASES.length };
}

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

/**
 * The snails' stage. Mounts hidden and reveals a frame later (the StoryCopy
 * pattern), so a relay restart actually plays its fade-in instead of
 * remounting straight at full opacity.
 */
function SnailStage({
  shown,
  children,
}: {
  shown: boolean;
  children: React.ReactNode;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const visible = on && shown;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex justify-center"
      style={{
        bottom: "15%",
        opacity: visible ? 1 : 0,
        // slow entrance over an empty stage, quick exit ahead of the car
        transition: `opacity ${visible ? 0.8 : 0.25}s ease`,
      }}
    >
      {children}
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
 *
 * Every phrase owns an equal third of the pinned travel: the copy starts
 * counting from the pin, not from the slide-in. And until each phrase has
 * actually been seen, user scrolling (wheel, touch, keys) cannot leave that
 * phrase's segment — programmatic scrolling like the menu's smooth jump
 * carries no input events and passes through untouched.
 */
export default function StorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const media = useHeroMedia();

  const [phase, setPhase] = useState(0);
  const [active, setActive] = useState(false);
  const [run, setRun] = useState(false);
  // the copy on screen trails `phase` by a beat so each line gets its exit
  const [shownPhase, setShownPhase] = useState(-1);
  // snails restart their relay when the car phrase hands over to them — but
  // only after they had fully cleared, so boundary jitter can't teleport them
  const [snailEpoch, setSnailEpoch] = useState(0);
  const snailsHiddenAt = useRef(0);
  // the car enters with the first phrase and waits out the snails' exit
  const [carOn, setCarOn] = useState(false);
  // when the centre frame started drawing; the first phrase waits it out
  const runAt = useRef(0);
  // fully unlocked segments; the full length also represents lock stand-down
  const unlockedSegmentCount = useRef(0);
  const lockInit = useRef(false);
  const lastInputAt = useRef(-Infinity);
  const lastTouchY = useRef(0);
  // a touch gesture we canceled once: we drive its scrolling until touchend
  const touchOwned = useRef(false);
  // last scrollY the scroll pass saw: the hold only fights downward movement
  const lastScrollY = useRef(Infinity);

  useScrollEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const { travel, segment } = getScrollMetrics(el.offsetHeight, vh);
    let along = -rect.top;
    const scrollingDown = window.scrollY > lastScrollY.current;
    lastScrollY.current = window.scrollY;

    // a load restored mid-story credits the phrases already scrolled past
    if (!lockInit.current) {
      lockInit.current = true;
      if (along >= travel)
        unlockedSegmentCount.current = STORY_PHRASES.length;
      else if (along > 0)
        unlockedSegmentCount.current = Math.min(
          STORY_PHRASES.length - 1,
          Math.floor(along / segment),
        );
    }

    if (unlockedSegmentCount.current < STORY_PHRASES.length) {
      const limit = segment * (unlockedSegmentCount.current + 1) - 1;
      if (
        along > limit &&
        scrollingDown &&
        performance.now() - lastInputAt.current < INPUT_GRACE_MS
      ) {
        // user scrolling down past the first unseen phrase: hold the line.
        // This also catches touch momentum, which outlives its touchmove
        // events. Only downward movement is fought — snapping while the user
        // scrolls up (or while a mobile URL-bar resize shifts the metrics)
        // would yank the page against them.
        const held = window.scrollY + rect.top + limit;
        window.scrollTo({ top: held, behavior: "instant" });
        lastScrollY.current = held;
        along = limit;
      } else if (along >= travel) {
        // got past without user input (menu jump, scrollbar drag): stand down
        unlockedSegmentCount.current = STORY_PHRASES.length;
      }
    }

    const progress = Math.min(1, Math.max(0, along / travel));
    const next = Math.min(
      STORY_PHRASES.length - 1,
      Math.floor(progress * STORY_PHRASES.length),
    );
    setPhase(next);
    const onStage = rect.top < vh * 0.72 && rect.bottom > vh * 0.2;
    if (onStage && !runAt.current) runAt.current = performance.now();
    if (onStage) setRun(true);
    // the copy only counts from the pin, so every phrase gets an equal third
    setActive(rect.top <= 0 && rect.bottom > vh * 0.2);
  });

  // The first line still waits out the frame drawing (which starts on the
  // slide-in), measured from when the drawing began; later swaps are quick.
  useEffect(() => {
    if (!active || shownPhase === phase) return;
    const delay =
      shownPhase < 0
        ? Math.max(120, 1180 - (performance.now() - runAt.current))
        : 120;
    const timer = setTimeout(() => {
      // the actors swap with the copy, not with the raw scroll boundary:
      // note when the snails leave, and restart their relay only when they
      // come back after having fully cleared
      if (shownPhase >= 1 && phase === 0)
        snailsHiddenAt.current = performance.now();
      if (shownPhase <= 0 && phase >= 1) {
        const hiddenFor =
          snailsHiddenAt.current === 0
            ? Infinity
            : performance.now() - snailsHiddenAt.current;
        if (hiddenFor > SNAIL_CLEARED_MS) setSnailEpoch((e) => e + 1);
      }
      setShownPhase(phase);
    }, delay);
    return () => clearTimeout(timer);
  }, [active, phase, shownPhase]);

  // the car runs while the first phrase is the copy on screen: it enters
  // with the text, leaves the moment the copy hands over to the snail
  // phrases, and on a return waits out the snails' exit before re-entering
  useEffect(() => {
    const timer = setTimeout(
      () => setCarOn(shownPhase === 0),
      // the wait applies only to returns; the first entrance is with the text
      shownPhase === 0 && snailsHiddenAt.current !== 0 ? CAR_RETURN_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [shownPhase]);

  // a phrase counts as seen once its rise-in has settled; each seen phrase
  // opens the lock one more segment
  useEffect(() => {
    if (shownPhase < 0) return;
    const timer = setTimeout(() => {
      unlockedSegmentCount.current = Math.max(unlockedSegmentCount.current, shownPhase + 1);
    }, PHRASE_SEEN_MS);
    return () => clearTimeout(timer);
  }, [shownPhase]);

  // infinite loops park while the section is far offscreen
  const { ref: motionRef, inView: motionActive } = useInView<HTMLDivElement>({
    threshold: 0.01,
    rootMargin: "180px 0px",
    once: false,
  });

  // the lock's input side: wheel is blocked at the source, touch drags are
  // blocked at the limit, and touch/key input is timestamped so the scroll
  // pass above can hold the line against momentum and keyboard scrolling
  useEffect(() => {
    if (!motionActive) return;

    /** the last document Y user scrolling may reach right now */
    const lockLimit = () => {
      const el = sectionRef.current;
      if (!el) return Infinity;
      const rect = el.getBoundingClientRect();
      const { segment } = getScrollMetrics(el.offsetHeight, window.innerHeight);
      return window.scrollY + rect.top + segment * (unlockedSegmentCount.current + 1) - 1;
    };

    // A menu click starts a programmatic scroll. Clear any prior input grace
    // before it can be mistaken for touch momentum or keyboard scrolling.
    const onNavClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest(".site-nav a[href^='#']"))
        lastInputAt.current = -Infinity;
    };

    const onWheel = (e: WheelEvent) => {
      if (unlockedSegmentCount.current >= STORY_PHRASES.length || e.ctrlKey || e.deltaY <= 0)
        return;
      lastInputAt.current = performance.now();
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      const limit = lockLimit();
      // Chromium latches wheel gestures: unless a gesture's FIRST event is
      // canceled, the rest arrive cancelable:false and preventDefault is
      // ignored. A cancel only at the boundary therefore misses mid-gesture
      // crossings, and the rAF hold above would paint the overshoot for a
      // frame before snapping back — the jolt at the last phrase, where the
      // limit is also the unpin point. So while the lock is armed, cancel
      // every downward tick from the gesture's start and walk the page
      // ourselves, clamped to the limit.
      if (e.cancelable) {
        e.preventDefault();
        const target = Math.min(window.scrollY + e.deltaY * unit, limit);
        if (target > window.scrollY)
          window.scrollTo({ top: target, behavior: "instant" });
      } else if (window.scrollY > limit) {
        // a gesture latched before the lock armed: clamp per tick, ahead of
        // the per-frame rAF hold, so the overshoot never reaches a paint
        window.scrollTo({ top: limit, behavior: "instant" });
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0]?.clientY ?? 0;
      touchOwned.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const dy = lastTouchY.current - touch.clientY; // > 0: pulling down
      lastTouchY.current = touch.clientY;
      if (touchOwned.current) {
        // iOS kills a gesture's native scroll for good once any of its
        // touchmoves is canceled — without this, reversing upward in the
        // same gesture goes dead and the page "catches" until the next
        // touch. So after the first cancel, walk the page ourselves for the
        // rest of the gesture: down stays clamped to the limit, up follows
        // the finger immediately.
        if (e.cancelable) e.preventDefault();
        if (dy > 0) lastInputAt.current = performance.now();
        const limit =
          unlockedSegmentCount.current >= STORY_PHRASES.length
            ? Infinity
            : lockLimit();
        const target = Math.max(0, Math.min(window.scrollY + dy, limit));
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      if (unlockedSegmentCount.current >= STORY_PHRASES.length) return;
      // only downward drags arm the hold: an upward drag must never let the
      // scroll pass snap the page against the user's direction
      if (dy <= 0) return;
      lastInputAt.current = performance.now();
      if (e.cancelable && window.scrollY >= lockLimit() - 1) {
        e.preventDefault();
        touchOwned.current = true;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (unlockedSegmentCount.current < STORY_PHRASES.length && DOWN_KEYS.has(e.key))
        lastInputAt.current = performance.now();
    };

    window.addEventListener("click", onNavClick, { capture: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("click", onNavClick, { capture: true });
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [motionActive]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "340vh" }}
      data-nav-bg="#fafafd"
    >
      <div
        ref={motionRef}
        className={`sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden bg-surface ${
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
          style={{ bottom: "15%", display: carOn ? "block" : "none" }}
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
            wanted={carOn && motionActive}
          />
        </div>
        <SnailStage key={snailEpoch} shown={shownPhase >= 1}>
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
                wanted={shownPhase >= 1 && motionActive}
              />
            </div>
          ))}
        </SnailStage>
      </div>
    </section>
  );
}
