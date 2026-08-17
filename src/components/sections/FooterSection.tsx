"use client";

import { useInView } from "@/hooks/useAnimation";
import { FOOTER } from "@/data/site";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function FooterSection() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <footer
      ref={ref}
      id="site-footer"
      className="relative h-[clamp(520px,57.1vw,780px)] overflow-hidden bg-hero"
    >
      <img
        src={FOOTER.bgSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* date + ticket button */}
      <div
        className="absolute left-1/2 top-[26.3%] w-[min(419px,90vw)] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(30px)",
          transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        }}
      >
        <div className="flex w-full flex-col items-center gap-[clamp(24px,2.93vw,40px)]">
          <div className="flex w-full flex-col items-center text-center uppercase leading-[1.5] tracking-[-0.04px] text-white">
            <p className="font-asta mb-[-2px] w-full text-[clamp(34px,4.39vw,60px)] font-bold">
              {FOOTER.date}
            </p>
            <p className="font-asta w-full text-[clamp(15px,1.76vw,24px)] font-medium">
              {FOOTER.note}
            </p>
          </div>
          <a
            href={FOOTER.ticket.href}
            className="font-asta flex items-center justify-center bg-white px-[clamp(14px,1.76vw,24px)] py-[10px] text-[clamp(15px,1.76vw,24px)] font-semibold uppercase leading-[1.4] tracking-[-0.2px] text-ink transition-all duration-300 hover:bg-ink hover:text-white"
          >
            {FOOTER.ticket.label}&nbsp;
            <span className="font-bold">{FOOTER.ticket.dday}</span>
          </a>
        </div>
      </div>
      {/* venue line */}
      <p
        className="font-jbmono absolute inset-x-0 top-[69.1%] px-[16px] text-center text-[clamp(12px,1.96vw,26.79px)] font-semibold uppercase leading-[1.1] tracking-[-0.54px] text-white"
        style={{
          opacity: inView ? 1 : 0,
          transition: "opacity 1s ease 0.3s",
        }}
      >
        {FOOTER.venue}
      </p>
      {/* FECONF wordmark: same fade-up entrance as the other reveals */}
      <div
        className="absolute left-1/2 top-[87%] w-[min(1310.9px,96vw)] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(40px)",
          transition: `opacity 0.8s ${EASE} 0.2s, transform 0.8s ${EASE} 0.2s`,
        }}
      >
        <img
          src={FOOTER.logoSrc}
          alt="FECONF"
          className="h-auto w-full max-w-none"
        />
      </div>
    </footer>
  );
}
