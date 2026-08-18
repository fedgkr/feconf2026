"use client";

import { useEffect, useRef } from "react";

/**
 * Holds a section in place so the next one rides up over it.
 *
 * The stop position has to be `viewport height - own height`, which CSS cannot
 * express for a section whose height comes from its content, so the height is
 * measured and handed to the stylesheet as `--pane-h`.
 */
export default function CoverPane({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      el.style.setProperty("--pane-h", `${entry.contentRect.height}px`);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="cover-pane">
      {children}
    </div>
  );
}
