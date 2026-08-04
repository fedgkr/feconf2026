interface SectionHeadingProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Figma uses leading 1.1–1.4 depending on the section */
  titleLeading?: string;
}

/** 80px Archivo section heading + small Pretendard subtitle, left-aligned at 60px inset. */
export default function SectionHeading({
  title,
  subtitle,
  titleLeading = "leading-[1.2]",
}: SectionHeadingProps) {
  return (
    <div className="flex w-full max-w-[1366px] flex-col items-start px-[clamp(20px,4.4vw,60px)]">
      <div className="flex flex-col items-start gap-[18px]">
        <h2
          className={`font-archivo text-[clamp(38px,5.86vw,80px)] font-semibold uppercase tracking-[-2px] text-[#10183d] ${titleLeading}`}
        >
          {title}
        </h2>
        {subtitle && (
          <div className="px-[4px]">
            <p className="font-pretendard text-[clamp(14px,1.32vw,18px)] font-medium capitalize leading-[1.4] tracking-[-0.08px] text-[#10183d]/50">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
