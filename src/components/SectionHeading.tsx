"use client";

import MultiLine from "./MultiLine";
import { useSplitReveal } from "@/hooks/useTypeMotion";

interface SectionHeadingProps {
  title: readonly string[];
  subtitle?: readonly string[];
  className?: string;
}

/**
 * 80px display heading + small grey subtitle at the 60px inset. Both rise out
 * of per-line masks (GSAP SplitText) when scrolled to.
 */
export default function SectionHeading({
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  const titleRef = useSplitReveal<HTMLHeadingElement>("line");
  const subRef = useSplitReveal<HTMLParagraphElement>("sub", 0.18);

  return (
    <div className={`px-[60px] max-sm:px-0 ${className}`}>
      <h2
        ref={titleRef}
        className="font-display text-5xl font-semibold uppercase leading-[1.2] tracking-[-0.025em] text-navy sm:text-7xl md:text-[80px]"
      >
        <MultiLine lines={title} />
      </h2>
      {subtitle && (
        <p ref={subRef} className="mt-4 text-lg leading-[1.4] text-navy/50">
          <MultiLine lines={subtitle} />
        </p>
      )}
    </div>
  );
}
