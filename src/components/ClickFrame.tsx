import { assetPath } from "@/lib/assetPath";

const ICONS = {
  download: assetPath("/assets/icon-download.svg"),
  link: assetPath("/assets/icon-link.svg"),
  arrow: assetPath("/assets/icon-arrow-up-right.svg"),
} as const;

interface ClickFrameProps {
  label: string;
  icon: keyof typeof ICONS;
  boxClassName?: string;
  labelClassName?: string;
  href?: string;
}

/**
 * "▼ CLICK ▼" caption + crosshair-framed action box.
 * Geometry from Figma: frame 433x129, box 357x51 at (38, 39) — the
 * hairline offsets are kept as percentages (38/433 ≈ 8.8%) so the
 * frame can shrink on narrow screens.
 *
 * Hover: a rainbow conic beam orbits the 1px border of the box while
 * the box interior brightens (ring mechanism from the reference build).
 */
export default function ClickFrame({
  label,
  icon,
  boxClassName = "bg-white",
  labelClassName = "text-[18px]",
  href = "#",
}: ClickFrameProps) {
  return (
    <div className="flex w-full max-w-[433px] flex-col items-center">
      <div className="click-float flex items-center gap-[10px]">
        <img
          src={assetPath("/assets/chevron-double.svg")}
          alt=""
          loading="lazy"
          className="h-[17px] w-[27px]"
        />
        <p className="font-gothic text-[clamp(24px,2.35vw,32px)] font-medium uppercase leading-[1.2] tracking-[-0.64px] text-muted">
          click
        </p>
        <img
          src={assetPath("/assets/chevron-double.svg")}
          alt=""
          loading="lazy"
          className="h-[17px] w-[27px]"
        />
      </div>
      <div className="group relative h-[129px] w-full">
        <div className="absolute inset-x-0 top-[39px] h-px bg-hairline" />
        <div className="absolute inset-x-0 top-[90px] h-px bg-hairline" />
        <div className="absolute inset-y-0 left-[8.8%] w-px bg-hairline" />
        <div className="absolute inset-y-0 right-[8.8%] w-px bg-hairline" />
        {/* rotating rainbow border: the 1px rim shows the beam, the cover hides the rest */}
        <div className="pointer-events-none absolute inset-y-[39px] left-[8.8%] right-[8.8%] z-30 overflow-hidden">
          <div className="bt-spin absolute left-1/2 top-1/2 aspect-square w-[300%] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-[350ms] group-hover:opacity-100" />
          <div
            className={`absolute inset-px transition-colors duration-[400ms] group-hover:bg-white ${boxClassName}`}
          />
        </div>
        <a
          href={href}
          className="absolute left-[calc(8.8%+1px)] right-[calc(8.8%+1px)] top-[40px] z-40 flex h-[50px] items-center justify-center gap-[10px]"
        >
          <span
            className={`font-asta font-semibold leading-[1.4] tracking-[-0.08px] text-navy ${labelClassName}`}
          >
            {label}
          </span>
          <img src={ICONS[icon]} alt="" loading="lazy" className="size-[18px]" />
        </a>
      </div>
    </div>
  );
}
