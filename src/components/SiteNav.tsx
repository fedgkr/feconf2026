"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { BUY_TICKET, NAV_MENU, PINK_SECTION_IDS } from "@/data/site";

/** Viewport-top band the fixed nav occupies (25px offset + 48px bar). */
const NAV_LINE = 73;

/**
 * Panes pin as they are passed, so a section that is already behind reports
 * where it is pinned rather than where it sits in the page, and the browser
 * sends the anchor there. Adding up the panes ahead of it gives the position
 * the menu actually means, from anywhere on the page.
 */
function paneTop(id: string): number | null {
  const pane = document.getElementById(id)?.closest(".cover-pane");
  const parent = pane?.parentElement;
  if (!pane || !parent) return null;
  let top = parent.getBoundingClientRect().top + window.scrollY;
  for (const sibling of parent.querySelectorAll(":scope > .cover-pane")) {
    if (sibling === pane) break;
    top += sibling.getBoundingClientRect().height;
  }
  return top;
}

export default function SiteNav() {
  const [active, setActive] = useState<string>(NAV_MENU[0].id);
  const [onLight, setOnLight] = useState(false);
  // A clicked menu stays selected until scrolling goes quiet. Without it the
  // scroll pass overwrites the click within a frame and the label flicks
  // through every section on the way down to the target.
  const [clicked, setClicked] = useState<string | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Each scroll frame pushes the release further out, so the hold lasts exactly
  // as long as the scroll does. Arming it on click too means a click that never
  // scrolls anywhere still lets go.
  const holdSelection = (id: string) => {
    setClicked(id);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => setClicked(null), 150);
  };

  useEffect(() => () => clearTimeout(settle.current), []);

  // A menu jump flies past several sections at once and their reveals would
  // fire one after another on the way down, which reads as a glitch. The hold
  // above already lasts exactly as long as the jump, so it doubles as the
  // window in which those transitions are switched off.
  //
  // Wheel input is swallowed for that same window. A smooth scroll is cancelled
  // by any scroll input, and a trackpad keeps sending ticks after the finger
  // leaves, so a single leftover tick used to strand the reader partway down
  // the quote section. Capturing keeps those ticks away from the damping
  // handler there, which would otherwise turn one into a jump to nowhere.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("nav-jumping", clicked !== null);
    if (clicked === null) return;
    const swallow = (e: WheelEvent) => e.preventDefault();
    window.addEventListener("wheel", swallow, {
      passive: false,
      capture: true,
    });
    return () => {
      root.classList.remove("nav-jumping");
      window.removeEventListener("wheel", swallow, { capture: true });
    };
  }, [clicked]);

  useScrollEffect(() => {
    // Selected menu: the last panel whose top has passed the nav band.
    let current: string = NAV_MENU[0].id;
    for (const { id } of NAV_MENU) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= NAV_LINE) current = id;
    }
    setActive(current);
    if (clicked) holdSelection(clicked);
    // Invert colors whenever the nav is not over a pink section.
    const overPink = PINK_SECTION_IDS.some((id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.top >= NAV_LINE || rect.bottom <= 0) return false;
      // A pinned pane keeps its box under the nav even after the next section
      // has covered it, so it only counts while nothing is drawn over there.
      // The section sits inside its pane wrapper, so ask the wrapper.
      const pane = el.closest(".cover-pane") ?? el;
      const next = pane.nextElementSibling;
      return !next || next.getBoundingClientRect().top > NAV_LINE;
    });
    setOnLight(!overPink);
  });

  const selected = clicked ?? active;

  const itemClass = (id: string) => {
    if (selected === id) {
      return onLight ? "text-navy" : "text-white";
    }
    return onLight
      ? "text-navy/30 hover:text-navy"
      : "text-white/30 hover:text-white";
  };

  return (
    // TODO(디자이너 확인 필요): the bar has no background of its own, so on light
    // sections the navy labels sit straight on whatever scrolls past underneath.
    // Confirm that the transparent top is intended, or whether it needs a
    // background or blur once the text turns navy.
    <div className="fixed inset-x-[clamp(16px,2.93vw,40px)] top-[clamp(14px,1.83vw,25px)] z-50 flex h-[48px] items-center justify-between">
      <nav className="font-gothic flex items-center gap-[clamp(10px,1.76vw,24px)] text-[clamp(13px,2.35vw,32px)] font-medium uppercase leading-[0.78em] tracking-[-0.04px]">
        {NAV_MENU.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              holdSelection(id);
              const top = paneTop(id);
              if (top === null) return;
              e.preventDefault();
              // Set before scrolling, not from the effect the state change
              // schedules: a wheel tick landing in that gap would cancel the
              // scroll on its very first frame.
              document.documentElement.classList.add("nav-jumping");
              window.scrollTo({ top, behavior: "smooth" });
              // The anchor this replaces left an entry behind, so back still
              // walks through the sections visited.
              history.pushState(null, "", `#${id}`);
            }}
            className={`transition-colors duration-200 ${itemClass(id)}`}
          >
            {label}
          </a>
        ))}
      </nav>
      <a
        href={BUY_TICKET.href}
        className={`font-gothic whitespace-nowrap text-[clamp(13px,2.35vw,32px)] font-semibold uppercase leading-[1.5] tracking-[-0.04px] transition-colors duration-200 ${
          onLight
            ? "text-navy hover:text-navy/60"
            : "text-white hover:text-white/60"
        }`}
      >
        {BUY_TICKET.label}
      </a>
    </div>
  );
}
