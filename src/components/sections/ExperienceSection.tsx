"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "../SectionHeading";
import { useInView } from "@/hooks/useAnimation";
import { EXPERIENCE } from "@/data/site";

const AUTOPLAY_MS = 3200;

/**
 * Full-bleed horizontal carousel of the five on-site moments. Advances by
 * itself while it is on screen and untouched; the arrows and free scrolling
 * both stay in charge when used.
 */
export default function ExperienceSection() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref: sectionRef, inView } = useInView<HTMLElement>({
    threshold: 0.18,
  });
  const { ref: playRef, inView: playing } = useInView<HTMLDivElement>({
    threshold: 0.2,
    once: false,
  });

  const go = useCallback((index: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.children;
    const next = (index + cards.length) % cards.length;
    const card = cards[next] as HTMLElement;
    grid.scrollTo({ left: card.offsetLeft - grid.offsetLeft, behavior: "smooth" });
    setActive(next);
  }, []);

  // `active` in the deps restarts the wait after any manual move, so the
  // autoplay never fires right on the heels of an arrow press
  useEffect(() => {
    if (!playing || paused) return;
    const id = setInterval(() => {
      if (!document.hidden) go(active + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, paused, go, active]);

  // free scrolling (touch, trackpad) keeps the active marker in step
  const onScroll = () => {
    const grid = gridRef.current;
    if (!grid || grid.children.length < 2) return;
    const step =
      (grid.children[1] as HTMLElement).offsetLeft -
      (grid.children[0] as HTMLElement).offsetLeft;
    setActive(
      Math.max(
        0,
        Math.min(
          grid.children.length - 1,
          Math.round(grid.scrollLeft / Math.max(step, 1)),
        ),
      ),
    );
  };

  return (
    <section
      ref={sectionRef}
      id="feconf-experience"
      data-nav-bg="#fafafd"
      className="overflow-hidden bg-surface text-navy"
    >
      <div className="mx-auto pt-24 sm:pt-36">
        <div className="mx-auto mb-16 max-w-[1366px] px-[60px] max-sm:px-6">
          <SectionHeading
            title={EXPERIENCE.heading.title}
            subtitle={EXPERIENCE.heading.subtitle}
            className="!px-0"
            revealOnEntry
          />
          <div className="mt-8 flex justify-end gap-[22px] max-sm:mt-7 max-sm:gap-[18px]">
            <button
              type="button"
              className="fe-exp-arrow"
              aria-label="이전 Experience"
              onClick={() => go(active - 1)}
            >
              ←
            </button>
            <button
              type="button"
              className="fe-exp-arrow"
              aria-label="다음 Experience"
              onClick={() => go(active + 1)}
            >
              →
            </button>
          </div>
        </div>
        <div ref={playRef}>
          <div
            ref={gridRef}
            className="fe-exp-grid"
            onScroll={onScroll}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {EXPERIENCE.cards.map((card, i) => (
              <article
                key={card.no}
                className={`fe-exp-card ${i === active ? "is-active" : ""}`}
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(22px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${40 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${40 + i * 80}ms`,
                }}
              >
                <img
                  src={card.image}
                  alt={card.alt}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="relative z-[2] flex h-full w-full flex-col p-6">
                  <h3 className="text-[21px] font-bold leading-[1.2] text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 break-keep text-sm font-medium leading-[1.35] text-white/85">
                    {card.description}
                  </p>
                  <span className="font-jbmono mt-auto text-[13px] font-semibold leading-none text-white/80">
                    {card.no}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
