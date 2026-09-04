"use client";

import { useEffect, useRef } from "react";
import ClickFrame from "../ClickFrame";
import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
import { useHeroMedia } from "@/hooks/useMedia";
import { mountBuddySnails } from "@/lib/buddySnails";
import { BUDDY } from "@/data/site";

/** Halves the default 80vh so the white gap after sponsors reads shorter. */
const BUDDY_COVER_RISE_DISTANCE_VH = 40;

/**
 * Forever Buddy: the copy and the button keep their places while the
 * draggable snails (dyed to the hero pick's accent) roam the lanes between
 * them — see lib/buddySnails.
 */
export default function BuddySection() {
  const coverRef = useCoverRise<HTMLElement>(BUDDY_COVER_RISE_DISTANCE_VH);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const media = useHeroMedia();

  useEffect(() => {
    // wait out the accent pick so the dye job starts with the right colour
    if (!media || !layerRef.current || !stageRef.current) return;
    return mountBuddySnails(layerRef.current, stageRef.current, media.accent);
  }, [media]);

  return (
    <section
      ref={coverRef}
      data-nav-bg="#fafafd"
      className="relative z-31 flex flex-col overflow-hidden bg-surface pb-24 pt-16 [--fc-cover-min-h:77vh] [--heading-reveal-offset:48px] sm:pb-36 sm:pt-24 sm:[--heading-reveal-offset:80px]"
    >
      <div ref={layerRef} className="absolute inset-0 z-[1] overflow-hidden" />
      <div
        ref={stageRef}
        // desktop floor is 77% of the old 520px, matching the 77vh section
        // height; the taller mobile floor opens a free lane between the copy
        // and the button so the snails spread through the middle too
        className="pointer-events-none relative mx-auto flex min-h-[560px] w-full min-w-0 max-w-[1366px] flex-1 flex-col px-6 max-sm:px-5 sm:min-h-[400px]"
      >
        <div data-fc-keepout className="relative z-[3] [&_h2]:pointer-events-auto [&_p]:pointer-events-auto">
          <SectionHeading
            title={BUDDY.heading.title}
            subtitle={BUDDY.heading.subtitle}
            revealOnEntry
          />
        </div>
        <div className="relative z-[3] mt-auto flex justify-center pt-14">
          <div data-fc-keepout className="pointer-events-auto max-sm:w-full">
            <ClickFrame
              label={BUDDY.button.label}
              icon={BUDDY.button.icon}
              href={BUDDY.button.href}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
