"use client";

import { useCallback, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { useTicketDday } from "@/hooks/useTicketDday";
import { NAV_MENU, TICKET_LINK } from "@/data/site";

/**
 * How far into the page the bar finishes climbing, as a share of the viewport.
 * The reference reaches the top about 5vh into its 220vh hero sequence; this
 * hero is one screen tall, so the distance comes off the scroll position.
 */
const RISE_VH = 0.05;

const smoothstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** The sections the menu highlights, in document order. */
const TRACKED = NAV_MENU.filter(({ href }) => href !== "#");

/** How far down the viewport a section has to reach to take the highlight. */
const ACTIVE_LINE = 200;

/** Whether a `data-nav-bg` colour is dark enough to need white text over it. */
function isDarkSurface(bg: string) {
  const hex = /^#([0-9a-f]{6})$/i.exec(bg);
  if (!hex) return false;
  const n = parseInt(hex[1], 16);
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luma < 0.5;
}

/** Whether the box at `y` down the viewport belongs to this element. */
function spans(el: Element | null, y: number) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top <= y && rect.bottom > y;
}

/**
 * Anchor jumps aim at where the box is drawn, and a covered section is drawn
 * up to 80vh below its slot until its rise finishes — the browser would land
 * that far past it. Aim at the layout position under the transform instead.
 */
function jumpTo(e: React.MouseEvent, href: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!href.startsWith("#") || href === "#") return;
  const el = document.querySelector<HTMLElement>(href);
  if (!el) return;
  e.preventDefault();
  const style = getComputedStyle(el);
  const matrix = new DOMMatrixReadOnly(style.transform);
  // manual scrolls skip CSS scroll-margin, so honour it here: targets whose
  // own top padding is shallower than the fixed header (e.g. experience)
  // declare their clearance with scroll-margin-top
  const margin = parseFloat(style.scrollMarginTop) || 0;
  const top =
    el.getBoundingClientRect().top - (matrix.m42 || 0) + window.scrollY - margin;
  window.scrollTo({ top, behavior: "smooth" });
  history.pushState(null, "", href);
}

/**
 * Fixed top navigation.
 *
 * Over the top of the hero the bar sits at the bottom of the viewport, then
 * climbs to the top over the first 5vh of scroll — desktop only.
 * Its background follows the section under it via `--fe-nav-bg`, measured
 * here from each section's `data-nav-bg`, and its text is drawn white over the
 * hero and over any dark surface, ink over the light ones. The menu item for
 * the section being read is the one at full strength.
 */
export default function SiteNav() {
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  // the bar starts over the hero, where the reference holds it white
  const [whiteInk, setWhiteInk] = useState(true);
  const [active, setActive] = useState<string>(NAV_MENU[0].id);
  const dday = useTicketDday();

  /**
   * Written straight to the element rather than through state: this runs on
   * every frame of the climb, and the bar's own transform is all it changes.
   */
  const applyDock = useCallback(() => {
    const el = header.current;
    if (!el) return;
    // below md, and with reduced motion, the bar never leaves the top
    const docks =
      window.matchMedia("(min-width: 768px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!docks) {
      el.style.transform = "translate3d(0, 0, 0)";
      return;
    }
    const nav = el.querySelector("nav");
    const navHeight = nav?.offsetHeight || el.offsetHeight;
    // scroll position alone drives the climb, so a reader who skips the logo
    // intro still meets the bar at the top before the story section arrives
    const rise = smoothstep(window.scrollY / (window.innerHeight * RISE_VH));
    const drop = (1 - rise) * Math.max(0, window.innerHeight - navHeight);
    el.style.transform = `translate3d(0, ${drop}px, 0)`;
  }, []);

  useScrollEffect(() => {
    applyDock();

    // one pixel under the bar's own bottom edge, so the surface it reports is
    // the one it actually sits on at any header height
    const probe = Math.min(
      (header.current?.offsetHeight ?? 80) + 1,
      Math.max(0, window.innerHeight - 1),
    );
    let bg = "transparent";
    for (const el of document.querySelectorAll<HTMLElement>("[data-nav-bg]")) {
      if (spans(el, probe)) bg = el.dataset.navBg!;
    }
    document.documentElement.style.setProperty("--fe-nav-bg", bg);

    // No annotated section under the bar means nothing has been drawn over the
    // hero yet, and the hero is the one surface the reference keeps white.
    setWhiteInk(
      bg === "transparent"
        ? spans(document.getElementById("home"), probe)
        : isDarkSurface(bg),
    );

    // `offsetTop`, not the drawn rect: a covered section is drawn up to 80vh
    // below its slot until its rise finishes, and the highlight follows the
    // layout order regardless. The last section past the line wins.
    const line = window.scrollY + ACTIVE_LINE;
    let next: string = NAV_MENU[0].id;
    for (const { id, href } of TRACKED) {
      const el = document.getElementById(href.slice(1));
      if (el && el.offsetTop <= line) next = id;
    }
    setActive(next);
  });

  // over the open mobile menu the bar is painted white (below), so its
  // glyphs draw in ink even when the section under it wanted white text
  const whiteText = whiteInk && !open;
  const fg = whiteText ? "rgb(255, 255, 255)" : "rgb(21, 21, 21)";
  const dim = whiteText ? "rgba(255, 255, 255, 0.35)" : "rgba(21, 21, 21, 0.35)";

  return (
    <header
      ref={header}
      className="site-nav fixed inset-x-0 top-0 z-50"
      style={{
        // an open mobile menu paints the bar row like its dropdown panel:
        // over the hero the row is otherwise transparent, and the panel
        // looked detached from the top of the screen
        backgroundColor: open
          ? "rgba(255, 255, 255, 0.95)"
          : "var(--fe-nav-bg, transparent)",
        backdropFilter: open ? "blur(24px)" : undefined,
        WebkitBackdropFilter: open ? "blur(24px)" : undefined,
        transition: "background-color 0.4s ease",
      }}
    >
      <nav
        className="mx-auto flex max-w-[1366px] items-center justify-between px-10 py-6"
        style={{ transition: "color 0.4s ease" }}
      >
        <div className="hidden items-center gap-6 md:flex">
          {NAV_MENU.map(({ id, label, href }) => (
            <a
              key={id}
              href={href}
              onClick={(e) => jumpTo(e, href)}
              className="font-display text-[24px] font-medium uppercase leading-[1.03] tracking-tight transition-colors duration-300"
              style={{ color: id === active ? fg : dim }}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href={TICKET_LINK.href}
          className="font-display hidden text-[24px] font-semibold uppercase leading-[1.5] tracking-tight md:block"
          style={{ color: fg, transition: "color 0.4s ease" }}
        >
          {TICKET_LINK.label}&nbsp;&nbsp;
          <span suppressHydrationWarning>{dday}</span>
        </a>
        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          style={{ color: dim, transition: "color 0.4s ease" }}
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>
      <div
        className="overflow-hidden bg-white/95 backdrop-blur-xl md:hidden"
        style={{
          maxHeight: open ? "300px" : "0",
          opacity: open ? 1 : 0,
          padding: open ? "16px 24px" : "0 24px",
          transition:
            "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, padding 0.3s ease",
        }}
      >
        {NAV_MENU.map(({ id, label, href }) => (
          <a
            key={id}
            href={href}
            onClick={(e) => {
              setOpen(false);
              jumpTo(e, href);
            }}
            className="block py-3 text-lg font-bold uppercase tracking-tight text-ink/65 transition-colors hover:text-ink"
          >
            {label}
          </a>
        ))}
        <a
          href={TICKET_LINK.href}
          onClick={() => setOpen(false)}
          className="mt-2 block rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
        >
          {TICKET_LINK.label}&nbsp;&nbsp;
          <span suppressHydrationWarning>{dday}</span>
        </a>
      </div>
    </header>
  );
}
