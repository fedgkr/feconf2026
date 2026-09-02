"use client";

import type { CSSProperties } from "react";
import SectionHeading from "../SectionHeading";
import { useCoverRise, useInView, useStaggerChildren } from "@/hooks/useAnimation";
import { SPONSORS_SECTION, type Sponsor, type SponsorTier } from "@/data/site";

function SponsorMark({ sponsor, tier }: { sponsor: Sponsor; tier: SponsorTier["id"] }) {
  if (!sponsor.src) {
    return <span className="sponsor-wordmark">{sponsor.name}</span>;
  }

  return (
    <img
      src={sponsor.src}
      alt={sponsor.name}
      loading="lazy"
      width={sponsor.width}
      height={sponsor.height}
      className={`sponsor-logo is-${tier}`}
      style={{ width: "auto", height: "auto" }}
    />
  );
}

function SponsorCell({
  sponsor,
  tier,
  style,
}: {
  sponsor: Sponsor;
  tier: SponsorTier["id"];
  style: CSSProperties;
}) {
  return (
    <div className={`sponsor-cell is-${tier}`} style={style}>
      <SponsorMark sponsor={sponsor} tier={tier} />
    </div>
  );
}

function SponsorTierRow({
  tier,
  styles,
}: {
  tier: SponsorTier;
  styles: CSSProperties[];
}) {
  return (
    <div className={`sponsor-tier-row is-${tier.id}`}>
      <div className="sponsor-tier-label">
        <span className="sponsor-tier-title">{tier.title}</span>
      </div>
      <div className={`sponsor-tier-logos is-count-${tier.sponsors.length}`}>
        {tier.sponsors.map((sponsor, index) => (
          <SponsorCell
            key={sponsor.name}
            sponsor={sponsor}
            tier={tier.id}
            style={styles[index]}
          />
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  const coverRef = useCoverRise<HTMLElement>();
  const { ref: gridRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const totalSponsorCount = SPONSORS_SECTION.tiers.reduce(
    (total, tier) => total + tier.sponsors.length,
    0,
  );
  const stagger = useStaggerChildren(inView, totalSponsorCount, 70);
  const tierRows = SPONSORS_SECTION.tiers.map((tier, tierIndex) => {
    const startIndex = SPONSORS_SECTION.tiers
      .slice(0, tierIndex)
      .reduce((total, currentTier) => total + currentTier.sponsors.length, 0);

    return {
      tier,
      styles: stagger.slice(startIndex, startIndex + tier.sponsors.length),
    };
  });

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
                <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
                <div className="sponsor-tier-stack">
                  {tierRows.map(({ tier, styles }) => (
                    <SponsorTierRow key={tier.id} tier={tier} styles={styles} />
                  ))}
                </div>
                <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
