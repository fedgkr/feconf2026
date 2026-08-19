"use client";

import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { useInView, useStaggerChildren } from "@/hooks/useAnimation";
import { CONDUCT } from "@/data/site";

export default function ConductSection() {
  const { ref: tableRef, inView } = useInView<HTMLDivElement>({
    threshold: 0.1,
  });
  const stagger = useStaggerChildren(inView, CONDUCT.guidelines.length, 120);

  return (
    /* The extra room underneath is for phones. A section taller than the screen
       comes to rest with its foot behind the browser's bottom bar, which grows
       to about 150px when the address bar slides back out. The gap has to be a
       fixed number rather than the live bar height: the pane's resting place is
       worked out from its own height, so a height that changed with the bar
       would drag the whole section sideways mid-scroll. */
    <section className="flex flex-col items-center bg-surface pt-[clamp(56px,7.3vw,100px)] pb-[calc(clamp(56px,7.3vw,100px)+90px)] sm:pb-[clamp(56px,7.3vw,100px)]">
      <div className="flex w-full flex-col items-center gap-[clamp(48px,5.86vw,80px)]">
        <Reveal direction="left" threshold={0.3} className="w-full">
          <SectionHeading
            title={<MultiLine lines={CONDUCT.heading.title} />}
            subtitle={<MultiLine lines={CONDUCT.heading.subtitle} />}
          />
        </Reveal>
        <div className="flex w-full justify-center px-[16px] xl:px-0">
          <div ref={tableRef} className="relative w-full max-w-[1246px]">
            {/* vertical hairlines: outer edges + label column divider */}
            <div className="absolute inset-y-0 left-[30px] w-px bg-hairline max-md:hidden" />
            <div className="absolute inset-y-0 right-[30px] w-px bg-hairline max-md:hidden" />
            <div className="absolute inset-y-0 left-[344px] w-px bg-hairline max-lg:hidden" />
            <div className="py-[30px]">
              {CONDUCT.guidelines.map(({ title, body }, i) => (
                <div
                  key={title}
                  className={`flex flex-col gap-[10px] border-t border-hairline px-[24px] py-[24px] lg:h-[150px] lg:flex-row lg:items-center lg:gap-[54px] lg:px-[70px] lg:py-0 ${
                    i === CONDUCT.guidelines.length - 1 ? "border-b" : ""
                  }`}
                  style={stagger[i]}
                >
                  <p className="font-asta shrink-0 text-[clamp(20px,1.76vw,24px)] font-medium leading-[1.3] text-ink lg:w-[260px]">
                    {title}
                  </p>
                  <p className="font-pretendard min-w-px flex-1 whitespace-pre-line text-[clamp(15px,1.32vw,18px)] leading-[1.4] text-ink/80">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
