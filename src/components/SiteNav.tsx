"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { BUY_TICKET, NAV_MENU, PINK_SECTION_IDS } from "@/data/site";

/** Viewport-top band the fixed nav occupies (25px offset + 48px bar). */
const NAV_LINE = 73;

/** How long a menu jump takes to travel, whatever the distance. */
const JUMP_MS = 700;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Furthest the document can actually be scrolled right now. */
const maxScroll = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

/**
 * The browser abandons its own smooth scroll the moment a wheel reports in,
 * and a trackpad keeps reporting after the finger leaves, which left the jump
 * stranded partway down. Driving each frame ourselves takes that decision away
 * from the browser: the position is set outright every frame, so nothing can
 * call the movement off halfway.
 *
 * The destination is asked for again every frame. The quote section is 1200vh,
 * so a window that changes height mid-flight — a phone address bar folding
 * away, a rotation — moves the target by thousands of pixels, and a fixed
 * number would land somewhere else entirely.
 *
 * The trip owns `nav-jumping` outright. Hanging it on "has scrolling gone
 * quiet" instead made its life something else entirely: our own frames kept
 * pushing the release out, a finger dragging afterwards kept pushing it out
 * further, and a hidden tab let it expire while the trip was still pending.
 *
 * Returns a cancel: two of these running at once fight for the same scroll
 * position, one frame each.
 */
function travelTo(destination: () => number): () => void {
  const root = document.documentElement;
  root.classList.add("nav-jumping");
  const release = () => root.classList.remove("nav-jumping");
  const from = window.scrollY;
  const started = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / JUMP_MS);
    // ease-in-out: leaves and arrives gently, covers the middle quickly
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const target = Math.min(destination(), maxScroll());
    window.scrollTo({ top: from + (target - from) * eased, behavior: "instant" });
    // Releasing on the same frame as the last position lets the transitions
    // back before it is painted, and the sections passed over flicker.
    frame = requestAnimationFrame(t < 1 ? step : release);
  };
  frame = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(frame);
    release();
  };
}

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
  const cancelTravel = useRef<(() => void) | undefined>(undefined);


  // Each scroll frame pushes the release further out, so the hold lasts exactly
  // as long as the scroll does. Arming it on click too means a click that never
  // scrolls anywhere still lets go.
  const holdSelection = (id: string) => {
    setClicked(id);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => setClicked(null), 150);
  };

  useEffect(
    () => () => {
      clearTimeout(settle.current);
      cancelTravel.current?.();
    },
    [],
  );

  // Wheel is swallowed a little longer than the trip itself. A trackpad keeps
  // sending ticks after the finger leaves, and one of those landing right after
  // arrival reaches the damping handler in the quote section, which turns it
  // into a jump to nowhere. Riding on the selection hold gives exactly that
  // tail: a swallowed tick scrolls nothing, so nothing extends it further.
  useEffect(() => {
    if (clicked === null) return;
    const swallow = (e: WheelEvent) => e.preventDefault();
    window.addEventListener("wheel", swallow, {
      passive: false,
      capture: true,
    });
    return () => window.removeEventListener("wheel", swallow, { capture: true });
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
              // A modified click means open elsewhere, and that belongs to the
              // browser. Taking it over loses the new tab or window.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              const top = paneTop(id);
              if (top === null) return;
              e.preventDefault();
              holdSelection(id);
              cancelTravel.current?.();
              if (reducedMotion()) {
                window.scrollTo({
                  top: Math.min(top, maxScroll()),
                  behavior: "instant",
                });
                history.pushState(null, "", `#${id}`);
                return;
              }
              // Home means back to the start, so it lands there outright:
              // gliding up would replay every section in reverse on the way.
              // Nothing sweeps past, so the parallax keeps following the page.
              // Freezing it there would leave those sections showing the state
              // they held on the way out.
              cancelTravel.current = travelTo(() => paneTop(id) ?? top);
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
