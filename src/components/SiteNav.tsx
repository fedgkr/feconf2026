"use client";

import { useState } from "react";
import { useScrollEffect } from "@/hooks/useAnimation";
import { useTicketDday } from "@/hooks/useTicketDday";
import { NAV_MENU, TICKET_LINK } from "@/data/site";

/**
 * Fixed top navigation.
 *
 * The bar's background follows the section under it via `--fe-nav-bg`,
 * measured here from each section's `data-nav-bg`.
 */
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
  const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  const top = el.getBoundingClientRect().top - (matrix.m42 || 0) + window.scrollY;
  window.scrollTo({ top, behavior: "smooth" });
  history.pushState(null, "", href);
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const dday = useTicketDday();

  useScrollEffect(() => {
    const probe = Math.min(89, Math.max(0, window.innerHeight - 1));
    let bg = "transparent";
    for (const el of document.querySelectorAll<HTMLElement>("[data-nav-bg]")) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) bg = el.dataset.navBg!;
    }
    document.documentElement.style.setProperty("--fe-nav-bg", bg);
  });

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        backgroundColor: "var(--fe-nav-bg, transparent)",
        transition: "background-color 0.4s ease",
      }}
    >
      <nav className="mx-auto flex max-w-[1366px] items-center justify-between px-10 py-6">
        <div className="hidden items-center gap-6 md:flex">
          {NAV_MENU.map(({ id, label, href }, i) => (
            <a
              key={id}
              href={href}
              onClick={(e) => jumpTo(e, href)}
              className="font-display text-[24px] font-medium uppercase leading-[1.03] tracking-tight transition-colors duration-300"
              style={{
                color: i === 0 ? "rgb(21, 21, 21)" : "rgba(21, 21, 21, 0.35)",
              }}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href={TICKET_LINK.href}
          className="font-display hidden text-[24px] font-semibold uppercase leading-[1.5] tracking-tight transition-colors duration-300 md:block"
          style={{ color: "rgb(21, 21, 21)" }}
        >
          {TICKET_LINK.label}&nbsp;&nbsp;
          <span suppressHydrationWarning>{dday}</span>
        </a>
        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          style={{ color: "rgba(21, 21, 21, 0.65)" }}
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
