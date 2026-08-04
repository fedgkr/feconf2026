import { HERO } from "@/data/site";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative h-[clamp(480px,57.1vw,780px)] overflow-hidden bg-[#fb4967]"
    >
      <img
        src={HERO.bgSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="animate-fade-in-up absolute left-1/2 top-[41%] flex w-full -translate-x-1/2 flex-col items-center gap-[4px]">
        <img
          src={HERO.logoSrc}
          alt="FECONF"
          className="h-auto w-[min(955px,76vw)]"
        />
        <p className="font-archivo text-center text-[clamp(26px,3.91vw,53.45px)] font-semibold uppercase leading-[1.05] tracking-[-0.53px] text-white">
          {HERO.tagline}
        </p>
      </div>
      <p className="font-jbmono absolute inset-x-0 bottom-[7.3%] px-[16px] text-center text-[clamp(10px,1.58vw,21.53px)] font-semibold uppercase leading-[1.1] tracking-[-0.43px] text-white">
        {HERO.info}
      </p>
    </section>
  );
}
