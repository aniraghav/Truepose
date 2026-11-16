import type { ReactNode, MouseEvent } from "react";
import type { IconName } from "@/lib/content";

/* Client logo (Inspirations/logo). Each file comes in two tones:
   light = original white + green (for dark backgrounds), dark = ink + green (for light backgrounds). */

/* The "T" mark on its own */
export function LogoMark({ className = "logo__mark", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={`/assets/logo-mark-${tone}.png`} width={194} height={160} alt="" aria-hidden="true" />
  );
}

/* Full logo (mark + Truepose wordmark). Both tones are rendered; CSS shows the one that suits the surface. */
export function Logo() {
  return (
    <a className="logo" href="#top" aria-label="Truepose home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo__img logo__img--light" src="/assets/logo-full-light.png" width={653} height={160} alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="logo__img logo__img--dark" src="/assets/logo-full-dark.png" width={653} height={160} alt="" />
    </a>
  );
}

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
  down: <path d="M12 5v13M6 13l6 6 6-6" />,
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  browser: (<><rect x="3.5" y="5" width="17" height="14" rx="3" /><path d="M3.5 9.5h17" /></>),
  repeat: (<><path d="M5 11a7 7 0 0 1 12-4.5L19 8.5" /><path d="M19 4v4.5h-4.5" /><path d="M19 13a7 7 0 0 1-12 4.5L5 15.5" /><path d="M5 20v-4.5h4.5" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

type CTAProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  type?: "submit" | "button";
  block?: boolean;
  tabIndex?: number;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
};

/* Pill button with arrow disc (from the Framer reference) */
export function CTA({ href = "#book", children, className = "", type, block, tabIndex, onClick }: CTAProps) {
  const cls = `btn ${block ? "btn--block" : ""} ${className}`.trim();
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      <span className="btn__disc"><Icon name="arrow" /></span>
    </>
  );
  return type ? (
    <button className={cls} type={type} onClick={onClick} tabIndex={tabIndex}>{inner}</button>
  ) : (
    <a className={cls} href={href} onClick={onClick} tabIndex={tabIndex}>{inner}</a>
  );
}
