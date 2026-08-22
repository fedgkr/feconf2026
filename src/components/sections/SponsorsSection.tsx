"use client";

import SectionHeading from "../SectionHeading";
import { useCoverRise, useInView, useStaggerChildren } from "@/hooks/useAnimation";
import { SPONSORS_SECTION, type Sponsor } from "@/data/site";

function SponsorCell({ sponsor, style }: { sponsor: Sponsor; style: React.CSSProperties }) {
  const logo = (
    <img
      src={sponsor.src}
      alt={sponsor.name}
      loading="lazy"
      width={sponsor.width}
      height={sponsor.height}
      className="max-h-[80px] max-w-[200px] object-contain"
      style={{ width: "auto", height: "auto" }}
    />
  );

  if (sponsor.label) {
    return (
      <div
        className="sponsor-cell flex h-[140px] w-full flex-col items-center justify-center gap-3 p-4"
        style={style}
      >
        <span className="text-base font-semibold leading-[1.4] text-ink/30">
          {sponsor.label}
        </span>
        {logo}
      </div>
    );
  }
  return (
    <div className="sponsor-cell" style={style}>
      <div className="flex h-[140px] w-full items-center justify-center p-4">{logo}</div>
    </div>
  );
}

export default function SponsorsSection() {
  const coverRef = useCoverRise<HTMLElement>();
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const stagger = useStaggerChildren(inView, SPONSORS_SECTION.sponsors.length, 70);
  const rows = [
    SPONSORS_SECTION.sponsors.slice(0, 4),
    SPONSORS_SECTION.sponsors.slice(4),
  ];

  return (
    <section
      ref={coverRef}
      id="sponsors"
      data-nav-bg="#ffffff"
      className="z-30 bg-white px-6 py-24 max-sm:px-5 sm:py-36"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading
          title={SPONSORS_SECTION.heading.title}
          subtitle={SPONSORS_SECTION.heading.subtitle}
          className="mb-12"
        />
        <div className="mx-auto max-w-[1246px]">
          <div className="relative py-[30px]">
            <div
              className="fe-line-v fe-fade-30 absolute inset-y-0 left-[30px] hidden w-px sm:block"
            />
            <div
              className="fe-line-v fe-fade-30 absolute inset-y-0 right-[30px] hidden w-px sm:block"
            />
            <div className="px-[30px] max-sm:px-0">
              <div ref={gridRef} className="relative">
                <div className="fe-line-v fe-fade-0 absolute inset-y-0 left-1/4 hidden w-px sm:block" />
                <div className="fe-line-v fe-fade-0 absolute inset-y-0 left-1/2 hidden w-px sm:block" />
                <div className="fe-line-v fe-fade-0 absolute inset-y-0 left-3/4 hidden w-px sm:block" />
                <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
                {rows.map((row, r) => (
                  <div key={r} className="contents">
                    <div className="grid grid-cols-1 sm:grid-cols-4">
                      {row.map((sponsor, i) => (
                        <SponsorCell
                          key={sponsor.name}
                          sponsor={sponsor}
                          style={stagger[r * 4 + i]}
                        />
                      ))}
                    </div>
                    <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
