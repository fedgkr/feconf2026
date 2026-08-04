"use client";

import { useEffect, useState } from "react";
import { BUY_TICKET, NAV_MENU, PINK_SECTION_IDS } from "@/data/site";

/** Viewport-top band the fixed nav occupies (25px offset + 48px bar). */
const NAV_LINE = 73;

export default function SiteNav() {
  const [active, setActive] = useState<string>(NAV_MENU[0].id);
  const [onLight, setOnLight] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // Selected menu: the last panel whose top has passed the nav band.
      let current: string = NAV_MENU[0].id;
      for (const { id } of NAV_MENU) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= NAV_LINE) current = id;
      }
      setActive(current);
      // Invert colors whenever the nav is not over a pink section.
      const overPink = PINK_SECTION_IDS.some((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < NAV_LINE && rect.bottom > 0;
      });
      setOnLight(!overPink);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const itemClass = (id: string) => {
    if (active === id) {
      return onLight ? "text-[#10183d]" : "text-white";
    }
    return onLight
      ? "text-[#10183d]/30 hover:text-[#10183d]"
      : "text-white/30 hover:text-white";
  };

  return (
    <div className="fixed inset-x-[clamp(16px,2.93vw,40px)] top-[clamp(14px,1.83vw,25px)] z-50 flex h-[48px] items-center justify-between">
      <nav className="font-gothic flex items-center gap-[clamp(10px,1.76vw,24px)] text-[clamp(13px,2.35vw,32px)] font-medium uppercase leading-[0.78em] tracking-[-0.04px]">
        {NAV_MENU.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={() => setActive(id)}
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
            ? "text-[#10183d] hover:text-[#10183d]/60"
            : "text-white hover:text-white/60"
        }`}
      >
        {BUY_TICKET.label}
      </a>
    </div>
  );
}
