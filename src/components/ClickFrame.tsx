import { assetPath } from "@/lib/assetPath";

const ICONS = {
  copy: assetPath("/images/copy-icon.svg"),
  download: assetPath("/images/download-icon.svg"),
  external: assetPath("/images/external-link-icon.svg"),
  link: assetPath("/images/link-icon.svg"),
  arrow: assetPath("/images/link-arrow.svg"),
} as const;

export type ClickFrameIcon = keyof typeof ICONS;

interface ClickFrameProps {
  label: string;
  icon: ClickFrameIcon;
  href?: string;
  target?: "_self" | "_blank";
  /** save the href as a file with this name instead of navigating */
  download?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** wraps the label as a `.confetti-button` carrying this burst label */
  confettiText?: string;
  /** plays the burst while true — see hooks/useConfetti */
  animate?: boolean;
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
  target,
  download,
  onClick,
  confettiText,
  animate = false,
}: ClickFrameProps) {
  // external destinations (npm, socials) open in a new tab unless the
  // caller pins a target explicitly
  const resolvedTarget =
    target ?? (href.startsWith("http") ? "_blank" : undefined);
  const rel = resolvedTarget === "_blank" ? "noopener noreferrer" : undefined;
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
          target={resolvedTarget}
          rel={rel}
          download={download}
          onClick={onClick}
          className="absolute top-[39px] right-[38px] left-[38px] z-40 flex h-[51px] items-center justify-center gap-2.5 text-lg font-semibold tracking-[-0.08px] text-navy"
        >
          {confettiText ? (
            <span
              // inline-flex so the burst's percentage offsets resolve against
              // a real box instead of the inline text's font metrics
              className={`confetti-button inline-flex ${animate ? "animate" : ""}`}
              data-confetti-text={confettiText}
            >
              {label}
            </span>
          ) : (
            label
          )}
          <img
            src={ICONS[icon]}
            alt=""
            loading="lazy"
            className="size-[18px]"
          />
        </a>
      </div>
    </div>
  );
}
