"use client";

import ClickFrame from "../ClickFrame";
import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
import { useConfetti } from "@/hooks/useConfetti";
import { SHARE_CONTACT } from "@/data/site";

/** Halves the default 80vh so the gap after buddy reads shorter. */
const SHARE_CONTACT_COVER_RISE_DISTANCE_VH = 40;

/**
 * Copies `href` instead of opening it, and answers with the lucide-style
 * confetti burst around the label.
 */
function CopyLinkButton({
  label,
  icon,
  href,
  copiedText,
}: {
  label: string;
  icon: "link";
  href: string;
  copiedText: string;
}) {
  const { animate, confetti } = useConfetti();

  return (
    <ClickFrame
      label={label}
      icon={icon}
      href={href}
      confettiText={copiedText}
      animate={animate}
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard?.writeText(href).then(confetti, () => {});
      }}
    />
  );
}

function RowBody({ lines }: { lines: readonly string[] }) {
  return (
    <p className="text-base font-medium leading-[1.5] text-ink/80">
      <MultiLine lines={lines} />
    </p>
  );
}

export default function ShareContactSection() {
  const coverRef = useCoverRise<HTMLElement>(SHARE_CONTACT_COVER_RISE_DISTANCE_VH);

  return (
    <section
      ref={coverRef}
      data-nav-bg="#fafafd"
      className="z-33 bg-surface px-6 pb-16 pt-24 [--fc-cover-min-h:0px] [--heading-reveal-offset:48px] max-sm:px-5 sm:pb-28 sm:pt-36 sm:[--heading-reveal-offset:80px]"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading
          title={SHARE_CONTACT.heading.title}
          className="mb-12"
          revealOnEntry
        />
        {SHARE_CONTACT.rows.map(({ title, lines, mail, button }, i) => (
          <Reveal
            key={title}
            delay={100 + i * 100}
            className={`flex flex-col gap-8 px-[60px] py-8 max-sm:px-0 lg:flex-row lg:justify-between ${
              mail ? "lg:items-center" : "lg:items-start"
            } ${i > 0 ? "mt-8" : ""}`}
          >
            <div className="max-w-[733px]">
              <h3 className="font-display mb-5 text-3xl leading-[1.4] text-ink sm:text-[44px]">
                {title}
              </h3>
              <RowBody lines={lines} />
              {mail && (
                <p className="mt-4 text-xl font-medium leading-[1.5] text-ink/40">
                  {mail}
                </p>
              )}
            </div>
            {button.copy ? (
              <CopyLinkButton
                label={button.label}
                icon={button.icon}
                href={button.href}
                copiedText={button.copiedText}
              />
            ) : (
              <ClickFrame
                label={button.label}
                icon={button.icon}
                href={button.href}
              />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
