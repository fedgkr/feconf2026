"use client";

import { Canvas } from "@react-three/fiber";
import { useHeroMedia } from "@/hooks/useMedia";
import { useInView } from "@/hooks/useAnimation";
import { useTicketDday } from "@/hooks/useTicketDday";
import { FOOTER, TICKET_LINK } from "@/data/site";
import { StripeField, useStripeDpr } from "./HeroSection";

/**
 * Compact closing banner: venue line left, ticket link right, over the same
 * moving stripe field and palette as the hero.
 */
export default function FooterSection() {
  const media = useHeroMedia();
  const dday = useTicketDday();
  const dpr = useStripeDpr();
  const { ref: footerRef, inView } = useInView<HTMLElement>({
    threshold: 0.01,
    rootMargin: "240px 0px",
    once: false,
  });

  return (
    <footer
      ref={footerRef}
      id="site-footer"
      className="relative isolate h-[377px] overflow-hidden bg-white max-[900px]:h-[300px]"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Canvas
          orthographic
          dpr={dpr}
          frameloop={inView ? "always" : "demand"}
          aria-hidden="true"
        >
          <color attach="background" args={["#ffffff"]} />
          {media && <StripeField ramp={media.ramp} />}
        </Canvas>
      </div>
      <div className="relative z-[2] mx-auto h-full w-full max-w-[1366px] px-16 max-[900px]:px-7">
        <p className="font-jbmono absolute left-16 right-[424px] top-1/2 -translate-y-1/2 text-[18px] font-bold leading-[1.25] text-white max-[900px]:inset-x-7 max-[900px]:top-[42%] max-[900px]:text-center max-[900px]:text-[13px] max-[900px]:leading-[1.35]">
        {FOOTER.note}
        </p>
        <a
          href={TICKET_LINK.href}
          className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap text-[24px] font-semibold uppercase leading-[1.1] text-white transition-opacity duration-200 hover:opacity-70 max-[900px]:inset-x-7 max-[900px]:top-[62%] max-[900px]:text-center max-[900px]:text-[20px]"
        >
          {TICKET_LINK.label}{" "}
          <span className="font-extrabold" suppressHydrationWarning>
            {dday}
          </span>
        </a>
      </div>
    </footer>
  );
}
