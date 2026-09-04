"use client";

import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
import { SPONSORS_SECTION, type Sponsor, type SponsorTier } from "@/data/site";

/** Matches the cover-rise distance used by the neighbouring sections. */
const SPONSORS_COVER_RISE_DISTANCE_VH = 40;

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
      className={[
        "sponsor-logo",
        `is-${tier}`,
        sponsor.logoVariant ? `is-${sponsor.logoVariant}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
      <span className="sponsor-tier-rule" aria-hidden="true" />
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
  const coverRef = useCoverRise<HTMLElement>(SPONSORS_COVER_RISE_DISTANCE_VH);

  return (
    <section
      ref={coverRef}
      id="sponsors"
      data-nav-bg="#ffffff"
      // the cover's default 100vh min-height left a tall blank strip under the
      // last tier row — content height keeps the buddy boundary tight
      className="relative isolate z-30 bg-white px-6 pb-16 pt-24 [--fc-cover-min-h:0px] [--heading-reveal-offset:48px] max-sm:px-5 sm:pb-24 sm:pt-36 sm:[--heading-reveal-offset:80px]"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading
          title={SPONSORS_SECTION.heading.title}
          subtitle={SPONSORS_SECTION.heading.subtitle}
          className="sponsor-section-heading mb-10 sm:mb-14"
          revealOnEntry
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
