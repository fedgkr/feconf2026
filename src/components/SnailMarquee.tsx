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
  width,
  height,
  imageClassName,
}: {
  sources: readonly string[];
  width: number;
  height: number;
  imageClassName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [setsPerHalf, setSetsPerHalf] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Both boxes matter: the container tracks the window, and the set only
    // reaches its real width once the images have their size. Measuring the
    // container alone once counted an unloaded set as its margins and asked for
    // hundreds of copies.
    const observer = new ResizeObserver(() => {
      const set = container.querySelector("[data-snail-set]");
      const setWidth = set?.getBoundingClientRect().width ?? 0;
      const containerWidth = container.getBoundingClientRect().width;
      if (setWidth > 0 && containerWidth > 0) {
        setSetsPerHalf(Math.ceil(containerWidth / setWidth));
      }
    });
    observer.observe(container);
    const set = container.querySelector("[data-snail-set]");
    if (set) observer.observe(set);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div className="marquee-track flex items-center">
        {Array.from({ length: setsPerHalf * 2 }, (_, set) => (
          <div key={set} data-snail-set className="flex items-center">
            {sources.map((src, i) => (
              // The intrinsic size keeps the set at its real width before the
              // images load, so the count above is measured against the layout
              // the user will actually see.
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                width={width}
                height={height}
                className={imageClassName}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
