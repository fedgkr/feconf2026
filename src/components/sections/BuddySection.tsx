import ClickFrame from "../ClickFrame";
import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { BUDDY } from "@/data/site";

export default function BuddySection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-surface py-[clamp(56px,7.3vw,100px)]">
      <div className="flex w-full flex-col gap-[clamp(48px,5.86vw,80px)]">
        <div className="flex w-full flex-col items-center gap-[40px]">
          <Reveal direction="left" className="w-full">
            <SectionHeading
              title={<MultiLine lines={BUDDY.heading.title} />}
              subtitle={<MultiLine lines={BUDDY.heading.subtitle} />}
            />
          </Reveal>
          <ClickFrame
            label={BUDDY.download.label}
            href={BUDDY.download.href}
            icon="download"
          />
        </div>
        {/* infinite snail marquee */}
        <div className="relative h-[clamp(190px,24.2vw,330px)] w-full overflow-hidden">
          <div className="marquee-track flex items-center">
            {[...BUDDY.snails, ...BUDDY.snails].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="mr-[10px] h-[clamp(190px,24.2vw,330px)] w-auto max-w-none"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
