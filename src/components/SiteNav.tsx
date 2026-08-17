"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { BUY_TICKET, NAV_MENU, PINK_SECTION_IDS } from "@/data/site";

/** Viewport-top band the fixed nav occupies (25px offset + 48px bar). */
const NAV_LINE = 73;

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
      const next = el.nextElementSibling;
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
    <div className="fixed inset-x-[clamp(16px,2.93vw,40px)] top-[clamp(14px,1.83vw,25px)] z-50 flex h-[48px] items-center justify-between">
      <nav className="font-gothic flex items-center gap-[clamp(10px,1.76vw,24px)] text-[clamp(13px,2.35vw,32px)] font-medium uppercase leading-[0.78em] tracking-[-0.04px]">
        {NAV_MENU.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={() => {
              holdSelection(id);
              // The first pane is pinned, so its own anchor is always in view
              // and the browser has nowhere to scroll it to.
              if (id === NAV_MENU[0].id) window.scrollTo({ top: 0 });
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
