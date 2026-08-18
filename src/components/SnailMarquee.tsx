"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The track loops by shifting exactly half its width, so each half has to be at
 * least as wide as the window or the tail of the loop shows up as empty space.
 * The snails stop growing once they hit their height cap, so how many sets that
 * takes depends on the window and has to be measured rather than guessed.
 */
export default function SnailMarquee({
  sources,
  imageClassName,
}: {
  sources: readonly string[];
  imageClassName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [setsPerHalf, setSetsPerHalf] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const set = container.querySelector("[data-snail-set]");
      const setWidth = set?.getBoundingClientRect().width ?? 0;
      if (setWidth > 0) {
        setSetsPerHalf(Math.ceil(entry.contentRect.width / setWidth));
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div className="marquee-track flex items-center">
        {Array.from({ length: setsPerHalf * 2 }, (_, set) => (
          <div key={set} data-snail-set className="flex items-center">
            {sources.map((src, i) => (
              <img key={i} src={src} alt="" className={imageClassName} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
