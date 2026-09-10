"use client";

import { useHeroMedia } from "@/hooks/useMedia";
import { useInView } from "@/hooks/useAnimation";
import { useTicketLabel } from "@/hooks/useTicketStatus";
import { FOOTER } from "@/data/site";
import { StripeCanvas, useStripeDpr } from "./HeroSection";

/**
 * Compact closing banner: venue line left, ticket link right, over the same
 * moving stripe field and palette as the hero.
 */
export default function FooterSection() {
  const media = useHeroMedia();
  const ticketLabel = useTicketLabel();
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
        <StripeCanvas
          media={media}
          dpr={dpr}
          frameloop={inView ? "always" : "demand"}
        />
      </div>
      <div className="relative z-[2] mx-auto h-full w-full max-w-[1366px] px-16 max-[900px]:px-7">
        <p className="font-jbmono absolute top-1/2 right-[424px] left-16 -translate-y-1/2 text-[18px] leading-[1.25] font-bold text-white max-[900px]:inset-x-7 max-[900px]:top-[42%] max-[900px]:text-center max-[900px]:text-[13px] max-[900px]:leading-[1.35]">
          {FOOTER.note}
        </p>
        <p className="absolute top-1/2 right-16 -translate-y-1/2 text-[24px] leading-[1.1] font-semibold whitespace-nowrap text-white uppercase max-[900px]:inset-x-7 max-[900px]:top-[62%] max-[900px]:text-center max-[900px]:text-[20px]">
          <span suppressHydrationWarning>{ticketLabel}</span>
        </p>
      </div>
    </footer>
  );
}
