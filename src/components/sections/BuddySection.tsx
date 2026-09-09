"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
import { useHeroMedia } from "@/hooks/useMedia";
import { mountBuddySnails } from "@/lib/buddySnails";
import { BUDDY } from "@/data/site";

/** Halves the default 80vh so the white gap after sponsors reads shorter. */
const BUDDY_COVER_RISE_DISTANCE_VH = 40;

/** how long the COPY label stays flipped to COPIED after a click */
const COPIED_LABEL_MS = 1000;

/**
 * Command box: the action button's crosshair frame with a third hairline
 * splitting the interior into the filled command cell and the COPY cell
 * (`.fc-cmd*` in globals.css).
 */
function CommandBox() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = () => {
    navigator.clipboard?.writeText(BUDDY.command.text).then(() => {
      setCopied(true);
      if (resetTimer.current !== null) clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(
        () => setCopied(false),
        COPIED_LABEL_MS,
      );
    }, () => {});
  };

  return (
    <div className="fc-cmd">
      <div className="fe-line-v fe-fade-39 absolute inset-y-0 left-[var(--cmd-inset)] z-10 w-px" />
      <div className="fe-line-v fe-fade-39 absolute inset-y-0 right-[calc(var(--cmd-inset)+var(--cmd-copy-w))] z-10 w-px" />
      <div className="fe-line-v fe-fade-39 absolute inset-y-0 right-[var(--cmd-inset)] z-10 w-px" />
      <div className="fe-line-h fe-fade-38 absolute inset-x-0 top-[39px] z-10 h-px" />
      <div className="fe-line-h fe-fade-38 absolute inset-x-0 top-[90px] z-10 h-px" />
      <p className="fc-cmd-fill font-jbmono">
        <span className="text-pink">{BUDDY.command.prompt}</span>
        {BUDDY.command.text}
      </p>
      <button type="button" onClick={copy} className="fc-cmd-copy font-jbmono">
        {copied ? BUDDY.command.copied : BUDDY.command.copy}
      </button>
      <span role="status" className="sr-only">
        {copied ? BUDDY.command.copied : ""}
      </span>
    </div>
  );
}

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
      className="relative z-31 flex flex-col overflow-hidden bg-surface pb-24 pt-24 [--fc-cover-min-h:calc(var(--fc-vh,100vh)*.77-100px)] [--heading-reveal-offset:48px] sm:pb-36 sm:pt-36 sm:[--heading-reveal-offset:80px]"
    >
      <div ref={layerRef} className="absolute inset-0 z-[1] overflow-hidden" />
      <div
        ref={stageRef}
        // desktop floor is 77% of the old 520px, matching the 77vh section
        // height; the taller mobile floor opens a free lane between the copy
        // and the button so the snails spread through the middle too
        className="pointer-events-none relative mx-auto flex min-h-[460px] w-full min-w-0 max-w-[1366px] flex-1 flex-col px-6 max-sm:px-5 sm:min-h-[300px]"
      >
        <div data-fc-keepout className="relative z-[3] [&_h2]:pointer-events-auto [&_p]:pointer-events-auto">
          <SectionHeading
            title={BUDDY.heading.title}
            subtitle={BUDDY.heading.subtitle}
            revealOnEntry
          />
        </div>
        <div className="relative z-[3] mt-auto flex justify-center pt-14">
          <div
            data-fc-keepout
            className="pointer-events-auto flex flex-col items-center max-sm:w-full"
          >
            <CommandBox />
            <a
              href={BUDDY.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.08px] text-navy"
            >
              {BUDDY.link.label}
              {/* inline so the stroke follows the text colour */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M7 4.5H4.5C4.10218 4.5 3.72064 4.65804 3.43934 4.93934C3.15804 5.22064 3 5.60218 3 6V13.5C3 13.8978 3.15804 14.2794 3.43934 14.5607C3.72064 14.842 4.10218 15 4.5 15H12C12.3978 15 12.7794 14.842 13.0607 14.5607C13.342 14.2794 13.5 13.8978 13.5 13.5V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M10 3H15V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
                <path
                  d="M8.25 9.75L15 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
