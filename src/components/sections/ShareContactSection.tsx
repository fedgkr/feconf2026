import ClickFrame from "../ClickFrame";
import MultiLine from "../MultiLine";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { SHARE_CONTACT } from "@/data/site";

export default function ShareContactSection() {
  return (
    <section className="flex flex-col items-center bg-white py-[clamp(56px,7.3vw,100px)]">
      <div className="flex w-full flex-col items-center gap-[clamp(48px,5.86vw,80px)]">
        <Reveal direction="left" threshold={0.3} className="w-full">
          <SectionHeading
            title={<MultiLine lines={SHARE_CONTACT.heading.title} />}
            titleLeading="leading-[1.4]"
          />
        </Reveal>
        <div className="flex w-full max-w-[1366px] flex-col gap-[clamp(48px,5.86vw,80px)] px-[clamp(20px,4.4vw,60px)]">
          {SHARE_CONTACT.rows.map(({ title, lines, mail, button }) => (
            <Reveal key={title} className="w-full">
              <div className="flex w-full flex-col items-start gap-[32px] lg:flex-row lg:items-center lg:justify-center lg:gap-[80px]">
                <div className="flex min-w-px flex-1 flex-col gap-[20px]">
                  <h3 className="font-asta text-[clamp(28px,2.93vw,40px)] font-medium leading-[1.4] text-ink">
                    {title}
                  </h3>
                  <p className="font-pretendard text-[clamp(15px,1.32vw,18px)] leading-[1.5] text-ink/80">
                    <MultiLine lines={lines} />
                  </p>
                  {mail && (
                    <p className="font-pretendard text-[clamp(16px,1.46vw,20px)] font-medium leading-[1.5] text-ink/40">
                      {mail}
                    </p>
                  )}
                </div>
                <div className="flex w-full justify-center lg:w-[433px]">
                  <ClickFrame
                    label={button.label}
                    icon={button.icon}
                    href={button.href}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
