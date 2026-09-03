"use client";

import { useEffect, useState, type CSSProperties } from "react";
import ClickFrame from "../ClickFrame";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useInView } from "@/hooks/useAnimation";
import {
  HALL_COLOR,
  SCHEDULE,
  SESSIONS,
  TOSS_BADGE_SRC,
  type Session,
} from "@/data/site";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** per-row entrance delay: the header row settles first, then row by row */
const rowDelay = (row: number) => 120 + row * 80;

function fadeIn(inView: boolean, delay: number): CSSProperties {
  return {
    opacity: inView ? 1 : 0,
    transition: `opacity 700ms ${EASE} ${delay}ms`,
  };
}

function SessionCard({
  session,
  active,
  inView,
  delay,
  onToggle,
}: {
  session: Session;
  active: boolean;
  inView: boolean;
  delay: number;
  onToggle: () => void;
}) {
  const color = HALL_COLOR[session.hall];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={active}
      aria-label={`${session.title} 상세 펼치기`}
      className={`session-card group relative flex min-w-0 flex-1 cursor-pointer flex-col justify-between overflow-hidden p-6 ${
        active ? "is-active" : ""
      }`}
      style={{
        ...fadeIn(inView, delay),
        minHeight: 200,
        ["--badge-color" as string]: color,
      }}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {/* hover flood: the hall colour flat (A pink / B sky-blue / TOSS blue)
          with the original light streaks over it */}
      <div
        className="sched-flood absolute inset-0 opacity-0 transition-opacity duration-[260ms]"
        style={{
          backgroundColor: color,
          backgroundImage: `linear-gradient(118deg, rgba(255,255,255,.14) 0 10%, rgba(255,255,255,0) 11% 30%, rgba(255,255,255,.12) 31% 43%, rgba(255,255,255,0) 44% 100%)`,
          backgroundBlendMode: "screen",
        }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <div className="sched-speaker">
          <p className="sched-speaker-name text-[18px] font-medium leading-[1.4] text-navy/80">
            {session.speaker}
          </p>
          <span className="sched-affiliation">{session.affiliation}</span>
        </div>
        {session.hall === "TOSS" ? (
          <div className="sched-mark size-[50px] shrink-0 overflow-hidden opacity-0 transition-opacity duration-[400ms]">
            <img
              src={TOSS_BADGE_SRC}
              alt="TOSS"
              loading="lazy"
              width={50}
              height={50}
              className="size-full object-cover"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        ) : (
          <div className="sched-mark session-badge flex size-[50px] shrink-0 items-center justify-center text-[40px] font-bold leading-none text-white opacity-0 transition-opacity duration-[400ms]">
            {session.hall === "A hall" ? "A" : "B"}
          </div>
        )}
      </div>
      <p className="sched-title relative z-10 mt-4 text-[22px] font-semibold leading-[1.4] text-navy">
        {session.title}
      </p>
      <div className="sched-detail" aria-hidden={!active}>
        <p className="sched-detail-desc">{session.description}</p>
        <div className="sched-detail-tags">
          {session.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** captures the schedule table (`.sched-wrap`) and saves it as a JPG */
async function downloadScheduleJpg(wrap: HTMLElement) {
  const { toJpeg } = await import("html-to-image");
  const url = await toJpeg(wrap, {
    quality: 0.92,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });
  const link = document.createElement("a");
  link.href = url;
  link.download = "FullSchedule.jpg";
  link.click();
}

export default function ScheduleSection() {
  const [active, setActive] = useState<number | null>(null);
  // The single-column grid grows past 3000px on phones, so any ratio-based
  // threshold would hold the reveal until deep into the section.
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({ threshold: 0.01 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = Array.from({ length: SESSIONS.length / 3 }, (_, i) =>
    SESSIONS.slice(i * 3, i * 3 + 3),
  );

  return (
    <section
      id="sessions"
      data-nav-bg="#ffffff"
      className="relative isolate z-20 min-h-screen bg-white px-6 py-24 max-sm:px-5 sm:py-36"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading
          title={SCHEDULE.heading.title}
          subtitle={SCHEDULE.heading.subtitle}
          className="mb-8"
        />
        <div className="mx-auto max-w-[1246px]">
          <Reveal delay={100} threshold={0.01} className="sched-wrap">
            <div ref={gridRef} className="sched-grid">
              <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ left: 0 }} />
              <div className="sched-vline fe-line-v fe-fade-0" style={{ left: 132 }} />
              <div
                className="sched-vline fe-line-v fe-fade-0"
                style={{ left: "calc(132px + (100% - 132px) / 3)" }}
              />
              <div
                className="sched-vline fe-line-v fe-fade-0"
                style={{ left: "calc(132px + (100% - 132px) / 3 * 2)" }}
              />
              <div className="sched-vline sched-vline-out fe-line-v fe-fade-30" style={{ right: 0 }} />
              <div className="sched-hline fe-line-h fe-fade-30" />
              <div className="sched-cell sched-hall" />
              {SCHEDULE.halls.map((hall) => (
                <div key={hall} className="sched-cell sched-hall">
                  <p className="font-display text-xl font-semibold uppercase leading-[1.4] text-navy">
                    {hall}
                  </p>
                </div>
              ))}
              <div className="sched-hline sched-hline-head fe-line-h fe-fade-30" />
              {rows.map((row, r) => {
                const [start, end] = row[0].time.split("~");
                return (
                  <div key={r} className="contents">
                    <div className="sched-cell sched-time">
                      <div className="sched-time-inner" style={fadeIn(inView, rowDelay(r))}>
                        <span className="sched-time-start">{start}</span>
                        <span className="sched-time-end">{end}</span>
                      </div>
                    </div>
                    {row.map((session, c) => (
                      <div key={session.hall} className="contents">
                        <div className="sched-hline sched-hline-m fe-line-h fe-fade-30" />
                        <div className="sched-cell sched-card-cell">
                          <SessionCard
                            session={session}
                            active={active === r * 3 + c}
                            inView={inView}
                            delay={rowDelay(r)}
                            onToggle={() =>
                              setActive(active === r * 3 + c ? null : r * 3 + c)
                            }
                          />
                        </div>
                      </div>
                    ))}
                    <div className="sched-hline fe-line-h fe-fade-30" />
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="mt-12 flex justify-center">
          <ClickFrame
            label={SCHEDULE.download.label}
            href={SCHEDULE.download.href}
            icon="download"
            onClick={(e) => {
              e.preventDefault();
              const wrap = gridRef.current?.closest<HTMLElement>(".sched-wrap");
              if (wrap) void downloadScheduleJpg(wrap);
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}
