import { assetPath } from "@/lib/assetPath";

const ICONS = {
  download: assetPath("/images/download-icon.svg"),
  external: assetPath("/images/external-link-icon.svg"),
  link: assetPath("/images/link-icon.svg"),
  arrow: assetPath("/images/link-arrow.svg"),
} as const;

interface ClickFrameProps {
  label: string;
  icon: keyof typeof ICONS;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Crosshair-framed action box. Geometry from the handoff: frame 433x129 with
 * the box between the hairlines at (38, 39)-(395, 90); the line ends fade out
 * where they cross the frame edge. Hover spins a pink beam around the box rim
 * (`.bt-*` in globals.css).
 */
export default function ClickFrame({
  label,
  icon,
  href = "#",
  onClick,
}: ClickFrameProps) {
  // external destinations (npm, socials) open in a new tab
  const external = href.startsWith("http");
  return (
    <div className="click-btn-group flex flex-col items-center max-sm:w-full">
      <div className="click-btn-wrap relative h-[129px] w-[433px] max-w-[90vw] max-sm:w-full max-sm:max-w-none">
        <div className="fe-line-v fe-fade-39 absolute inset-y-0 left-[38px] z-10 w-px" />
        <div className="fe-line-v fe-fade-39 absolute inset-y-0 right-[38px] z-10 w-px" />
        <div className="fe-line-h fe-fade-38 absolute inset-x-0 top-[39px] z-10 h-px" />
        <div className="fe-line-h fe-fade-38 absolute inset-x-0 top-[90px] z-10 h-px" />
        <div className="bt-ring">
          <div className="bt-spin" />
          <div className="bt-cover" />
        </div>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          onClick={onClick}
          className="absolute left-[38px] right-[38px] top-[39px] z-40 flex h-[51px] items-center justify-center gap-2.5 text-lg font-semibold tracking-[-0.08px] text-navy"
        >
          {label}
          <img src={ICONS[icon]} alt="" loading="lazy" className="size-[18px]" />
        </a>
      </div>
    </div>
  );
}
