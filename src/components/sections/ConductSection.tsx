"use client";

import SectionHeading from "../SectionHeading";
import { useCoverRise, useInView, useStaggerChildren } from "@/hooks/useAnimation";
import { useScrubHighlight } from "@/hooks/useTypeMotion";
import { CONDUCT } from "@/data/site";

function GuidelineBody({ body }: { body: string }) {
  const ref = useScrubHighlight();
  return (
    <p ref={ref} className="text-[18px] leading-[1.4] text-ink/80">
      {body}
    </p>
  );
}

export default function ConductSection() {
  const coverRef = useCoverRise<HTMLElement>();
  const { ref: tableRef, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const stagger = useStaggerChildren(inView, CONDUCT.guidelines.length, 120);

  return (
    <section
      ref={coverRef}
      data-nav-bg="#ffffff"
      className="z-32 bg-white px-6 py-24 [--heading-reveal-offset:48px] max-sm:px-5 sm:py-36 sm:[--heading-reveal-offset:80px]"
    >
      <div className="mx-auto max-w-[1366px]">
        <SectionHeading
          title={CONDUCT.heading.title}
          className="mb-12"
          revealOnEntry
        />
        <div className="mx-auto max-w-[1246px]">
          <div ref={tableRef} className="relative py-[30px]">
            <div className="fe-line-v fe-fade-30 absolute inset-y-0 left-[30px] hidden w-px lg:block" />
            <div className="fe-line-v fe-fade-30 absolute inset-y-0 right-[30px] hidden w-px lg:block" />
            <div
              className="fe-line-v fe-fade-0 absolute hidden w-px lg:block"
              style={{ left: "27.6083%", top: 30, bottom: 30 }}
            />
            <div className="px-[30px] max-sm:px-0">
              {CONDUCT.guidelines.map(({ title, body }, i) => (
                <div key={title} style={stagger[i]}>
                  <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
                  <div className="coc-row flex flex-col gap-6 sm:gap-0">
                    <h3 className="coc-title shrink-0 text-xl font-medium leading-[1.3] text-ink sm:text-[24px]">
                      {title}
                    </h3>
                    <div className="coc-body min-w-0 flex-1">
                      <GuidelineBody body={body} />
                    </div>
                  </div>
                  {i === CONDUCT.guidelines.length - 1 && (
                    <div className="fe-line-h fe-fade-30 -mx-[30px] h-px max-sm:mx-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
