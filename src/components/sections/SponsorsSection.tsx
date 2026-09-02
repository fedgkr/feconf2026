"use client";

import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
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
}: {
  sponsor: Sponsor;
  tier: SponsorTier["id"];
}) {
  return (
    <div className={`sponsor-cell is-${tier}`}>
      <SponsorMark sponsor={sponsor} tier={tier} />
    </div>
  );
}

function SponsorTierRow({
  tier,
}: {
  tier: SponsorTier;
}) {
  return (
    <div className={`sponsor-tier-row is-${tier.id}`}>
      <div className="sponsor-tier-label">
        <span className="sponsor-tier-title">{tier.title}</span>
      </div>
      <div className={`sponsor-tier-logos is-count-${tier.sponsors.length}`}>
        {tier.sponsors.map((sponsor) => (
          <SponsorCell
            key={sponsor.name}
            sponsor={sponsor}
            tier={tier.id}
          />
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSection() {
  const coverRef = useCoverRise<HTMLElement>();

  return (
    <section
      ref={coverRef}
      id="sponsors"
      data-nav-bg="#ffffff"
      className="z-30 bg-white px-6 py-24 max-sm:px-5 sm:py-36"
    >
      <div className="mx-auto max-w-[1246px]">
        <SectionHeading
          title={SPONSORS_SECTION.heading.title}
          subtitle={SPONSORS_SECTION.heading.subtitle}
          className="sponsor-section-heading mb-10 sm:mb-14"
        />
        <div className="sponsor-tier-stack">
          {SPONSORS_SECTION.tiers.map((tier) => (
            <SponsorTierRow key={tier.id} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}
