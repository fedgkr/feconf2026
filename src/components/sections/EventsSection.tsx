"use client";

import type { CSSProperties } from "react";
import ClickFrame from "../ClickFrame";
import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useInView, useStaggerChildren } from "@/hooks/useAnimation";
import {
  BADGE_STYLE,
  EVENTS,
  TOSS_BADGE_SRC,
  type Session,
  type SessionBadge,
} from "@/data/site";

function SessionBadgeMark({ badge }: { badge: SessionBadge }) {
  if (badge === "toss") {
    return (
      <div className="size-[50px] shrink-0 overflow-hidden rounded-[12px] transition-all duration-[400ms]">
        <img
          src={TOSS_BADGE_SRC}
          alt="TOSS"
          className="size-full object-cover transition-all duration-[400ms] group-hover:brightness-0 group-hover:invert"
        />
      </div>
    );
  }
  return (
    <div
      className="session-badge flex size-[50px] shrink-0 items-center justify-center rounded-full text-white transition-all duration-[400ms]"
      style={{
        background: BADGE_STYLE[badge].badge,
        ["--badge-color" as string]: BADGE_STYLE[badge].badge,
      }}
    >
      <span className="font-archivo text-[28px] font-semibold leading-[1.4] tracking-[-0.08px] text-inherit">
        {badge}
      </span>
    </div>
  );
}

function SessionCard({
  session,
  style,
}: {
  session: Session;
  style?: CSSProperties;
}) {
  const { title, badge } = session;
  return (
    // TODO(디자이너 확인 필요): the card shows a pointer cursor and a full hover
    // treatment but nothing happens on click. Either it should open a session
    // detail, or the pointer cursor is misleading.
    <div className="group w-full cursor-pointer overflow-hidden" style={style}>
      <div className="relative flex h-[220px] w-full flex-col justify-between p-[24px]">
        {/* resting / hover background layers */}
        <div className="absolute inset-0 bg-card transition-opacity duration-[400ms] group-hover:opacity-0" />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
          style={{ background: BADGE_STYLE[badge].hover }}
        />
        <div className="relative z-10 flex w-full items-start justify-between">
          <div className="font-asta flex flex-col gap-[2px] text-[18px] font-medium text-navy/80">
            <p className="leading-[1.5] transition-colors duration-[400ms] group-hover:text-white/80">
              13:00 - 13:40
            </p>
            <p className="leading-[1.4] transition-colors duration-[400ms] group-hover:text-white">
              최수범
            </p>
          </div>
          <SessionBadgeMark badge={badge} />
        </div>
        <p className="font-asta relative z-10 mt-[16px] text-[22px] font-semibold leading-[1.4] text-navy transition-colors duration-[400ms] group-hover:text-white">
          {title}
        </p>
      </div>
    </div>
  );
}

export default function EventsSection() {
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.05,
  });
  const stagger = useStaggerChildren(inView, 6, 80);

  return (
    <section
      id="events"
      className="relative bg-white px-[16px] py-[clamp(56px,7.3vw,100px)]"
    >
      <div className="mx-auto w-full max-w-[1366px]">
        <Reveal direction="left" className="mb-[32px] w-full">
          <SectionHeading
            title={<MultiLine lines={EVENTS.heading.title} />}
            subtitle={<MultiLine lines={EVENTS.heading.subtitle} />}
            titleLeading="leading-[1.1]"
          />
        </Reveal>
        <div className="mx-auto w-full max-w-[1246px]">
          {/* hall header bar */}
          <Reveal delay={100}>
            <div className="relative py-[16px]">
              <div className="absolute inset-y-0 left-0 w-px bg-hairline" />
              <div className="absolute inset-y-0 left-[33.333%] w-px bg-hairline" />
              <div className="absolute inset-y-0 left-[66.666%] w-px bg-hairline" />
              <div className="absolute inset-y-0 right-0 w-px bg-hairline" />
              <div className="h-px w-full bg-hairline" />
              <div className="grid grid-cols-3">
                {EVENTS.halls.map(({ hall }) => (
                  <div
                    key={hall}
                    className="flex items-center justify-center py-[26px]"
                  >
                    <p className="font-asta text-[20px] font-semibold uppercase leading-[1.4] tracking-[-0.08px] text-navy">
                      {hall}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-px w-full bg-hairline" />
            </div>
          </Reveal>
          {/* session cards */}
          <div ref={gridRef} className="grid grid-cols-1 gap-0 lg:grid-cols-3">
            {EVENTS.halls.map(({ hall, sessions }) => (
              <div
                key={hall}
                className="flex flex-col gap-[32px] px-[16px] pt-[32px]"
              >
                {sessions.map((session, row) => (
                  <SessionCard
                    key={row}
                    session={session}
                    style={stagger[row]}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* full schedule download */}
          <Reveal delay={200} className="mt-[48px] flex justify-center">
            <ClickFrame
              label={EVENTS.download.label}
              href={EVENTS.download.href}
              icon="download"
              boxClassName="bg-surface"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
