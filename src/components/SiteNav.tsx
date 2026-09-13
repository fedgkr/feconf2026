"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { useTicketLabel } from "@/hooks/useTicketStatus";
import { GA_EVENT, trackEvent } from "@/lib/analytics";
import { NAV_MENU, TICKET_LINK } from "@/data/site";

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
  if (!href.startsWith("#")) return;
  const el = document.querySelector<HTMLElement>(href === "#" ? "#home" : href);
  if (!el) return;
  e.preventDefault();
  const focusTarget = el.querySelector<HTMLElement>("h1, h2") ?? el;
  if (focusTarget.offsetHeight > 1) {
    if (!focusTarget.hasAttribute("tabindex")) focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }
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
 * Fixed top navigation, pinned to the top of the viewport at every scroll
 * position.
 * Its background follows the section under it via `--fe-nav-bg`, measured
 * here from each section's `data-nav-bg`, and its text is drawn white over the
 * hero and over any dark surface, ink over the light ones. The menu item for
 * the section being read is the one at full strength.
 */
export default function SiteNav() {
  const header = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // The bar row paints white the instant the menu opens (a fading row
  // visibly split from the already-white panel). On close the row fades on
  // the panel's own opacity curve, from the same moment — the collapsing
  // panel is already fading, and any row white outliving it reads as a
  // second, separate animation.
  const [menuPaint, setMenuPaint] = useState<"off" | "on" | "fade">("off");

  // safety net: if the dissolve's transitionend never fires (the section
  // under the bar was already white, so nothing transitioned), unstick
  useEffect(() => {
    if (menuPaint !== "fade") return;
    const timer = window.setTimeout(() => setMenuPaint("off"), 400);
    return () => window.clearTimeout(timer);
  }, [menuPaint]);
  // the bar starts over the hero, where the reference holds it white
  const [whiteInk, setWhiteInk] = useState(true);
  const [active, setActive] = useState<string>(NAV_MENU[0].id);
  const ticketLabel = useTicketLabel();
  const ticketHref = TICKET_LINK.href;

  useScrollEffect(() => {
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
    const rootStyle = document.documentElement.style;
    if (rootStyle.getPropertyValue("--fe-nav-bg") !== bg) {
      rootStyle.setProperty("--fe-nav-bg", bg);
    }

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

  // over the white-painted bar the glyphs draw in ink even when the section
  // under it wanted white text — including while the close is animating
  const whiteText = whiteInk && menuPaint === "off";
  const fg = whiteText ? "rgb(255, 255, 255)" : "rgb(21, 21, 21)";
  const dim = whiteText ? "rgba(255, 255, 255, 0.35)" : "rgba(21, 21, 21, 0.35)";
  const closeMenu = () => {
    setOpen(false);
    menuToggle.current?.focus({ preventScroll: true });
  };

  // solid white while the menu is open or closing: over the hero the row is
  // otherwise transparent and the panel looked detached — translucency let
  // the hero tint through, so no alpha here
  const bgTransition =
    menuPaint === "on"
      ? "background-color 0s"
      : menuPaint === "fade"
        ? "background-color 0.3s ease" // the panel's opacity curve
        : "background-color 0.4s ease";
  return (
    <header
      ref={header}
      className="site-nav fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor:
          menuPaint === "on" ? "rgb(255, 255, 255)" : "var(--fe-nav-bg, transparent)",
        transition: bgTransition,
      }}
      onKeyDown={(e) => {
        if (open && e.key === "Escape") {
          e.preventDefault();
          closeMenu();
        }
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "background-color" && menuPaint === "fade")
          setMenuPaint("off");
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
              aria-current={id === active ? "location" : undefined}
              className="font-display text-[24px] font-medium uppercase leading-[1.03] tracking-tight transition-colors duration-300"
              style={{ color: id === active ? fg : dim }}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href={ticketHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(GA_EVENT.clickTicketFromNav)}
          className="font-display hidden cursor-pointer text-[24px] font-semibold uppercase leading-[1.5] tracking-tight md:block"
          style={{ color: fg, transition: "color 0.4s ease" }}
        >
          <span suppressHydrationWarning>{ticketLabel}</span>
        </a>
        <button
          ref={menuToggle}
          type="button"
          className="ml-auto md:hidden"
          onClick={() => {
            const next = !open;
            setOpen(next);
            setMenuPaint(next ? "on" : "fade");
          }}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="site-nav-menu"
          style={{ color: dim, transition: "color 0.4s ease" }}
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>
      <div
        // solid white like the bar row above it — 5% translucency drew a
        // faint seam between the two boxes over vivid hero colours
        id="site-nav-menu"
        inert={!open}
        aria-hidden={!open}
        className="overflow-hidden bg-white md:hidden"
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
              closeMenu();
              jumpTo(e, href);
            }}
            aria-current={id === active ? "location" : undefined}
            className="block py-3 text-lg font-bold uppercase tracking-tight text-ink/65 transition-colors hover:text-ink"
          >
            {label}
          </a>
        ))}
        <a
          href={ticketHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            trackEvent(GA_EVENT.clickTicketFromNavMobile);
            closeMenu();
            jumpTo(e, ticketHref);
          }}
          className="mt-2 block cursor-pointer rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold text-white"
        >
          <span suppressHydrationWarning>{ticketLabel}</span>
        </a>
      </div>
    </header>
  );
}
