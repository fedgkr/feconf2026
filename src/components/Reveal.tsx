"use client";

import { useInView } from "@/hooks/useAnimation";

interface RevealProps {
  children: React.ReactNode;
  /** entrance direction: fade up (default) or slide in from the left */
  direction?: "up" | "left";
  delay?: number;
  threshold?: number;
  className?: string;
}

/** Fades its children in when they scroll into view. */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  threshold = 0.2,
  className = "",
}: RevealProps) {
  const { ref, inView } = useInView({ threshold });
  const hidden =
    direction === "left" ? "translateX(-50px)" : "translateY(40px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0, 0)" : hidden,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
