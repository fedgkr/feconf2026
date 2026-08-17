"use client";

import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useInView, useStaggerChildren } from "@/hooks/useAnimation";
import { SPONSORS_SECTION, type Sponsor } from "@/data/site";

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  if (sponsor.variant === "carrot") {
    return (
      <div className="relative h-[54px] w-[109.5px]">
        <img
          src={sponsor.iconSrc}
          alt=""
          className="absolute inset-y-0 left-0 h-full w-[28.8%]"
        />
        <img
          src={sponsor.textSrc}
          alt={sponsor.name}
          className="absolute bottom-[7.5%] left-[38.65%] right-0 top-1/4"
        />
      </div>
    );
  }
  if (sponsor.variant === "media-partner") {
    return (
      <div className="flex flex-col items-center gap-[16px]">
        <p className="font-pretendard text-[18px] font-semibold leading-[1.4] text-ink/30">
          {sponsor.label}
        </p>
        <img
          src={sponsor.src}
          alt={sponsor.name}
          style={{ width: sponsor.width, height: sponsor.height }}
          className="max-w-full object-cover"
        />
      </div>
    );
  }
  return (
    <img
      src={sponsor.src}
      alt={sponsor.name}
      style={{ width: sponsor.width, height: sponsor.height }}
      className={`max-w-full object-contain ${sponsor.className ?? ""}`}
    />
  );
}

export default function SponsorsSection() {
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.1,
  });
  const stagger = useStaggerChildren(
    inView,
    SPONSORS_SECTION.sponsors.length,
    70,
  );

  return (
    <section
      id="sponsors"
      className="flex flex-col items-center bg-white py-[clamp(56px,7.3vw,100px)]"
    >
      <div className="flex w-full flex-col items-center gap-[clamp(48px,5.86vw,80px)]">
        <Reveal direction="left" className="w-full">
          <SectionHeading
            title={<MultiLine lines={SPONSORS_SECTION.heading.title} />}
            subtitle={<MultiLine lines={SPONSORS_SECTION.heading.subtitle} />}
            titleLeading="leading-[1.4]"
          />
        </Reveal>
        <div className="w-full max-w-[1246px] overflow-hidden px-[16px] xl:px-0">
          <div
            ref={gridRef}
            className="-ml-px -mt-px grid grid-cols-2 lg:grid-cols-4"
          >
            {SPONSORS_SECTION.sponsors.map((sponsor, i) => (
              // The reveal owns the outer transform; the cell keeps its own so
              // the hover lift is not overridden by the inline entrance style.
              <div key={sponsor.name} className="sponsor-slot" style={stagger[i]}>
                <div className="sponsor-cell flex h-[120px] items-center justify-center border-l border-t border-hairline bg-white p-[10px] md:h-[140px]">
                  <SponsorLogo sponsor={sponsor} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
