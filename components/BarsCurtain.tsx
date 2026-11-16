"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Section transition: a field of paired bars (left / right side readings) that rise in a
   shuffled order as you scroll, like measurements coming in. Decorative only. */
const PAIRS = 16;
/* Fixed heights so server and browser render the same thing */
const H = [0.62, 0.58, 0.8, 0.77, 0.45, 0.7, 0.92, 0.9, 0.55, 0.38, 0.74, 0.76, 0.66, 0.5, 0.86, 0.84,
  0.4, 0.42, 0.7, 0.52, 0.95, 0.93, 0.6, 0.62, 0.78, 0.8, 0.48, 0.3, 0.88, 0.87, 0.57, 0.6];

export default function BarsCurtain() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const bars = gsap.utils.shuffle(gsap.utils.toArray<HTMLElement>(".bars__bar"));
      gsap.set(bars, { scaleY: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", end: "bottom 60%", scrub: 0.8 } });
      bars.forEach((b, i) => tl.to(b, { scaleY: 1, ease: "none", duration: 1 }, i * 0.07 + (i % 3) * 0.05));
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="bars" ref={wrap} aria-hidden="true">
      {Array.from({ length: PAIRS }, (_, p) => {
        const a = H[p * 2] ?? 0.6, b = H[p * 2 + 1] ?? 0.6;
        const flag = Math.abs(a - b) > 0.12;
        return (
          <div className="bars__pair" key={p}>
            <span className={`bars__bar ${flag && a < b ? "is-flag" : ""}`} style={{ height: `${a * 100}%` }} />
            <span className={`bars__bar ${flag && b < a ? "is-flag" : ""}`} style={{ height: `${b * 100}%` }} />
          </div>
        );
      })}
    </div>
  );
}
