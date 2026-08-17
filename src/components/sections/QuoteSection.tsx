"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useScrollEffect } from "@/hooks/useAnimation";
import { QUOTES, QUOTE_ASSETS, QUOTE_FINALE } from "@/data/site";

const HAIRLINE = "#dee2ec";

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
  const [textReady, setTextReady] = useState(false);

  useScrollEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const p = Math.max(
      0,
      Math.min(1, -el.getBoundingClientRect().top / scrollable),
    );
    setProgress(p);
    setPhase(Math.min(4, Math.floor(5 * p)));
  });

  const { ref: stageRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.3,
  });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setTextReady(true), 1250);
    return () => clearTimeout(timer);
  }, [inView]);

  const closing = phase === 4;
  const closingT = closing ? Math.min(1, (progress - 0.8) / 0.2) : 0;
  const snailIn = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));
  const snailVisible = phase >= 1;
  const snailRise = closing ? 55 * Math.min(1, closingT / 0.6) : 0;
  const snailTransform = closing
    ? `translateX(0) translateY(-${snailRise}vh)`
    : `translateX(${(1 - snailIn) * 120}vw)`;
  const quoteOpacity = closing ? Math.max(0, 1 - 4 * closingT) : 1;
  const messageOpacity = closing
    ? Math.min(1, Math.max(0, (closingT - 0.35) / 0.35))
    : 0;
  const messageRise = closing
    ? 60 * Math.max(0, 1 - Math.min(1, (closingT - 0.35) / 0.4))
    : 60;
  const lines = phase < QUOTES.length ? QUOTES[phase].split("\n") : [];

  return (
    <section ref={sectionRef} className="relative" style={{ height: "1200vh" }}>
      <div
        ref={stageRef}
        className={`sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden border-b border-[#10183d]/30 bg-[#fafafd] ${
          inView ? "fc-run" : ""
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
            transition: closing ? "opacity 0.5s ease" : "none",
          }}
        >
          {textReady && phase < QUOTES.length && (
            <div key={phase} className="overflow-hidden">
              <p className="fc-text-rollup font-asta min-h-[60px] text-center text-[clamp(20px,2.35vw,32px)] font-semibold leading-[1.4] tracking-[-1.2px] text-[#10183d] sm:min-h-[90px]">
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
            className="font-asta text-center text-[clamp(28px,4vw,60px)] font-semibold leading-[1.4] tracking-[-0.02em] text-[#10183d]"
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
                    <span key={j} className="font-bold text-[#ff1762]">
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
        {/* pixel car pass (first phase only) */}
        {phase === 0 && (
          <div className="fc-car-loop absolute" style={{ bottom: "15%" }}>
            <img
              src={QUOTE_ASSETS.carSrc}
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
            bottom: "12%",
            opacity: snailVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          <div
            style={{
              transform: snailTransform,
              transition: closing
                ? "transform 1s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            <img
              src={QUOTE_ASSETS.snailSrc}
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
