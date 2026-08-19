"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { QUOTES, QUOTE_ASSETS, QUOTE_FINALE } from "@/data/site";

const HAIRLINE = "var(--color-hairline-soft)";

/** Keys the browser scrolls the page with. */
const SCROLL_KEYS = new Set([
  " ",
  "PageDown",
  "PageUp",
  "Home",
  "End",
  "ArrowDown",
  "ArrowUp",
]);

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * How far past a boundary the scroll has to travel before the quote changes.
 * A phase change remounts the line and replays its roll-up from the start, so
 * without a margin here a thumb resting on a boundary replays it over and
 * over: momentum and rubber-banding wobble the scroll by a few pixels, and
 * every crossing was a fresh 1.6s animation. 0.01 of the section is about 96px
 * of scroll, against the 1923px a whole quote lasts.
 */
const PHASE_MARGIN = 0.01;

/**
 * The finale holds the last quote on screen, so the closing phase shows the
 * same line as the one before it.
 */
const lineFor = (phase: number) => Math.min(phase, QUOTES.length - 1);

function nextPhase(p: number, prev: number) {
  const raw = Math.min(4, Math.floor(5 * p));
  if (raw === prev) return prev;
  // Anything skipping a whole phase arrived by jump — a restored scroll
  // position, a link with a hash — and was never near this boundary to wobble
  // across it. Holding those back stranded the section on phase 0, which put
  // the intro hold back in the reader's way and froze the page for over a
  // second in the middle of the sequence.
  if (Math.abs(raw - prev) > 1) return raw;
  // The margin exists to stop the line remounting and replaying its roll-up,
  // so it belongs only on boundaries that change the line. The last one does
  // not, and holding it there merely started the finale at a progress its
  // timings were not written for.
  if (lineFor(raw) === lineFor(prev)) return raw;
  const boundary = Math.max(raw, prev) / 5;
  return Math.abs(p - boundary) >= PHASE_MARGIN ? raw : prev;
}

/**
 * Sticky scroll sequence (from the reference build): the section is 1200vh
 * tall and pins its viewport-height stage. Scrolling advances through the
 * four quotes, a pixel car loops during the first phase, a snail crawls in
 * from the right, and the finale fades the frame out while the closing
 * message and the snail rise together.
 */
export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [damping, setDamping] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  // Latches when the section first reaches the top of the window, which is the
  // moment the grid starts drawing. Asking the geometry beats watching for the
  // stage to be 99% visible: a window shorter than it expects — a phone with
  // the address bar out — never reports that, and the hold below would then
  // wait on something that never arrives.
  const [reached, setReached] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useScrollEffect(() => {
    // This runs during menu jumps too. Holding the sequence still through one
    // looks broken: the section is 1200vh, so it fills most of a trip to or
    // from the top, and a frozen sequence turns that stretch into a still
    // frame while everything around it slides.
    const el = sectionRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    // How far the stage is pinned for, measured off the layout rather than the
    // window. On a phone the two disagree: the section is sized in `vh`, which
    // ignores the address bar, while `innerHeight` shrinks when the bar slides
    // back in. Dividing by the window made the whole sequence step sideways
    // every time the bar appeared, with the reader's thumb perfectly still.
    const scrollable = el.offsetHeight - stage.offsetHeight;
    if (scrollable <= 0) return;
    const rect = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, -rect.top / scrollable));
    setProgress(p);
    setPhase((prev) => nextPhase(p, prev));
    // The handler is bound a screen early and decides from a fresh rect, so
    // arriving at speed cannot slip past between two of these samples.
    setDamping(rect.top <= window.innerHeight && rect.bottom > 0);
    if (rect.top <= 0) setReached(true);
  });

  // Dampen the wheel while the quote sequence is playing so each line gets
  // read. The listener is bound only for that stretch: left on the whole page
  // it makes every wheel event elsewhere wait on this handler. At 0.45 a line
  // takes a third less scrolling than it did at 0.3, which still slows the
  // sequence down without holding the reader in place.
  useEffect(() => {
    if (!damping) return;
    const insideSequence = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      return !!rect && rect.top <= 0 && rect.bottom > 0;
    };
    const onWheel = (e: WheelEvent) => {
      if (!insideSequence()) return;
      e.preventDefault();
      // A menu jump animates the scroll and any scroll of our own cancels it.
      // A trackpad keeps sending ticks after the finger leaves, so one leftover
      // tick used to strand the reader partway down this section.
      if (document.documentElement.classList.contains("nav-jumping")) return;
      // The grid is still drawing itself. The page holds still until it has
      // finished, so the frame is never scrolled past mid-stroke.
      if (!introDone) return;
      window.scrollBy({ top: 0.45 * e.deltaY, behavior: "instant" });
    };
    const holding = (e: Event) => {
      if (!introDone && insideSequence()) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      // A keyboard scrolls the page too, and only holding the wheel let those
      // readers straight past the frame the hold exists to show.
      if (SCROLL_KEYS.has(e.key)) holding(e);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", holding, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", holding);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [damping, introDone]);

  // The stage is exactly one screen tall and sticks to the top, so it only
  // The line waits for the grid to finish, then arrives with the scroll rather
  // than on a clock of its own, so speed cannot outrun it.
  const textReady = introDone && progress >= 0.005;

  useEffect(() => {
    if (!reached || introDone) return;
    const stage = stageRef.current;
    // Nothing to wait for: the reader is already past the first quote, motion
    // is turned down, or the frame never mounted.
    if (phase > 0 || !stage || reducedMotion()) {
      const timer = setTimeout(() => setIntroDone(true), 0);
      return () => clearTimeout(timer);
    }
    // The hold lasts exactly as long as the grid takes to draw itself. A timer
    // guessing at the same length ran about a third of a second long, and that
    // overhang is spent discarding the reader's scrolling.
    const finish = () => setIntroDone(true);
    stage.addEventListener("animationend", finish, { once: true });
    // Nothing reports back if the frame never animates, and the hold must not
    // outlive the thing it is waiting for.
    const failsafe = setTimeout(finish, 1600);
    return () => {
      stage.removeEventListener("animationend", finish);
      clearTimeout(failsafe);
    };
  }, [reached, phase, introDone]);

  const closing = phase === 4;
  const closingT = closing ? Math.min(1, (progress - 0.8) / 0.2) : 0;
  const snailIn = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));
  // Both the car and the snail are placed by scroll, not by a clock. The car
  // covers 220vw in 0.3 of the section against the snail's 120vw in 0.6, so it
  // pulls away at roughly four times the snail's rate.
  const carIn = Math.min(1, progress / 0.3);
  const carTransform = `translateX(${-120 + 220 * carIn}vw)`;
  const snailVisible = phase >= 1;
  const snailRise = closing ? 55 * Math.min(1, closingT / 0.6) : 0;
  const snailTransform = closing
    ? `translateX(0) translateY(-${snailRise}vh)`
    : `translateX(${(1 - snailIn) * 120}vw)`;
  // TODO(디자이너 확인 필요): the quote is gone by closingT 0.25 and the message
  // only starts at 0.35, so progress 0.85~0.87 shows neither — about 198px of
  // scroll, a fifth of a second at a normal pace. Left as is because both ends
  // are authored timings rather than a mistake; close the gap if the pause was
  // not intended.
  const quoteOpacity = closing ? Math.max(0, 1 - 4 * closingT) : 1;
  const messageOpacity = closing
    ? Math.min(1, Math.max(0, (closingT - 0.35) / 0.35))
    : 0;
  const messageRise = closing
    ? 60 * Math.max(0, 1 - Math.min(1, (closingT - 0.35) / 0.4))
    : 60;
  // The finale fades the quote out over half a second, so the last one has to
  // stay mounted through phase 4 instead of being dropped the moment it starts.
  const quoteIndex = lineFor(phase);
  const lines = QUOTES[quoteIndex].split("\n");

  return (
    <section ref={sectionRef} className="relative" style={{ height: "1200vh" }}>
      <div
        ref={stageRef}
        className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden border-b border-navy/30 bg-surface pb-[var(--browser-chrome)] ${
          reached ? "fc-run" : ""
        } ${closing ? "fc-closing" : ""}`}
      >
        {/* crosshair frame */}
        <div
          className="fc-vl absolute w-px opacity-0"
          style={{ top: "10%", bottom: "10%", left: "50%", background: HAIRLINE }}
        />
        <div
          className="fc-vr absolute w-px opacity-0"
          style={{ top: "10%", bottom: "10%", right: "50%", background: HAIRLINE }}
        />
        <div
          className="fc-hline absolute h-px origin-center opacity-0"
          style={{
            left: "5%",
            right: "5%",
            top: "calc(50% - 72px)",
            background: HAIRLINE,
            transform: "scaleX(0.05)",
          }}
        />
        <div
          className="fc-hline absolute h-px origin-center opacity-0"
          style={{
            left: "5%",
            right: "5%",
            top: "calc(50% + 72px)",
            background: HAIRLINE,
            transform: "scaleX(0.05)",
          }}
        />
        {/* quote */}
        <div
          className="relative z-10 flex items-center justify-center px-[32px] py-[24px] sm:px-[44px] sm:py-[26px]"
          style={{
            maxWidth: "90vw",
            minWidth: "min(671px, 80vw)",
            opacity: quoteOpacity,
            // The fade is authored to finish at progress 0.85 and the closing
            // message to begin at 0.87, so the two are never on screen at once.
            // Smoothing it over half a second held that handoff open: touch
            // scrolling has no damping to slow it, and a flick left the quote
            // still 94% opaque while the message had risen to 43% — nine frames
            // of two texts stacked. Following the scroll exactly restores the
            // gap the timings were written around.
            transition: "none",
          }}
        >
          {textReady && (
            <div key={quoteIndex} className="overflow-hidden">
              <p className="fc-text-rollup font-asta min-h-[60px] text-center text-[clamp(20px,2.35vw,32px)] font-semibold leading-[1.4] tracking-[-1.2px] text-navy sm:min-h-[90px]">
                {lines.map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
        {/* closing message */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-[18vh]"
          style={{ opacity: messageOpacity }}
        >
          <p
            className="font-asta text-center text-[clamp(28px,4vw,60px)] font-semibold leading-[1.4] tracking-[-0.02em] text-navy"
            style={{
              transform: `translateY(${messageRise}px)`,
              transition: "transform 0.4s ease-out",
            }}
          >
            {QUOTE_FINALE.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.map((seg, j) =>
                  seg.highlight ? (
                    <span key={j} className="font-bold text-pink">
                      {seg.text}
                    </span>
                  ) : (
                    <span key={j}>{seg.text}</span>
                  ),
                )}
              </span>
            ))}
          </p>
        </div>
        {/* pixel car, driven across by scroll until it has left the screen.
            It is mounted for that whole stretch rather than from the end of the
            intro. Scroll can run on through the hold — a phone cannot call off
            momentum that has already started — and a car that waits then finds
            the scroll has carried it to the middle of the screen, where it
            appears out of nowhere. Mounted throughout it simply sits off the
            left edge until the scroll brings it in.
            TODO(디자이너 확인 필요): the original gated this on the intro so the
            car could not share the screen with the grid being drawn. That is
            now possible, in exchange for never appearing mid-screen. Restoring
            a scroll position inside the drive-in still places the car in one
            frame rather than driving it there. */}
        {carIn < 1 && (
          <div
            className="fc-car-loop absolute"
            style={{
              bottom: "calc(15% + var(--browser-chrome))",
              transform: carTransform,
            }}
          >
            <img
              src={QUOTE_ASSETS.carSrc}
              loading="lazy"
              alt=""
              className="h-auto w-[clamp(260px,32.9vw,450px)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}
        {/* snail crawls in, then rises with the closing message */}
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{
            bottom: "calc(12% + var(--browser-chrome))",
            opacity: snailVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          <div
            style={{
              transform: snailTransform,
              // TODO(디자이너 확인 필요): the rise covers 55vh in 0.12 of the
              // section against the crawl-in's 120vw in 0.6 — 0.42px of travel
              // per pixel scrolled against 0.08, five times steeper, which is
              // what reads as the snail lurching at the end. The long ease here
              // is what softens that step, so shortening it to settle sooner
              // made the lurch three times sharper instead (measured 0.156 vs
              // 0.052 px/px over the first frames). Both numbers are authored,
              // so widening the 0.12 window is a design call, not a fix.
              transition: closing
                ? "transform 1s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            <img
              src={QUOTE_ASSETS.snailSrc}
              loading="lazy"
              alt=""
              className="h-auto w-[clamp(200px,22.5vw,308px)]"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
