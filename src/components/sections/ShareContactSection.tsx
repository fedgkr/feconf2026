"use client";

import ClickFrame from "../ClickFrame";
import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useCoverRise } from "@/hooks/useAnimation";
import { useScrubHighlight } from "@/hooks/useTypeMotion";
import { SHARE_CONTACT } from "@/data/site";

function RowBody({ lines }: { lines: readonly string[] }) {
  const ref = useScrubHighlight();
  return (
    <p ref={ref} className="text-base font-medium leading-[1.5] text-ink/80">
      <MultiLine lines={lines} />
    </p>
  );
}

export default function ShareContactSection() {
  const coverRef = useCoverRise<HTMLElement>();

  return (
    <section
      ref={coverRef}
      data-nav-bg="#fafafd"
      className="z-33 bg-surface px-6 py-24 max-sm:px-5 sm:py-36"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading title={SHARE_CONTACT.heading.title} className="mb-12" />
        {SHARE_CONTACT.rows.map(({ title, lines, mail, button }, i) => (
          <Reveal
            key={title}
            delay={100 + i * 100}
            className={`flex flex-col gap-8 px-[60px] py-8 max-sm:px-0 lg:flex-row lg:items-start lg:justify-between ${
              i > 0 ? "mt-8" : ""
            }`}
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
            <ClickFrame label={button.label} icon={button.icon} href={button.href} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
