"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scramble } from "@/lib/scramble";
import { useIntro } from "./Intro";

gsap.registerPlugin(ScrollTrigger);

/* Site wide text effects:
   1. Hover scramble on [data-scramble] elements (nav links, text links).
   2. Headings marked [data-decrypt] are revealed by a vertical scan line as they scroll into view. */
export default function Effects() {
  const { ready } = useIntro();

  /* 1: hover scramble */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onOver = (e: Event) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-scramble]");
      const from = (e as PointerEvent).relatedTarget as Node | null;
      if (!el || (from && el.contains(from))) return;
      scramble(el, { duration: 420, lockWidth: true });
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("focusin", onOver);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver);
    };
  }, []);

  /* 2: vertical scanner reveal on headings (starts after the intro).
     Each [data-decrypt] heading is hidden, then a vertical scan line sweeps left to right
     across it and the text appears behind the line. */
  useEffect(() => {
    if (!ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = gsap.utils.toArray<HTMLElement>("[data-decrypt]");
    const run = (el: HTMLElement, duration: number) => {
      gsap.killTweensOf(el);
      el.classList.add("vscan");
      gsap.fromTo(el, { "--p": "0%" }, {
        "--p": "100%", duration, ease: "power2.inOut",
        onComplete: () => el.classList.remove("vscan"),
      });
    };
    els.forEach((el) => { el.classList.add("vscan"); gsap.set(el, { "--p": "0%" }); });
    const triggers = els.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => run(el, 1.1),
        onEnterBack: () => run(el, 0.8),
      })
    );
    return () => {
      triggers.forEach((t) => t.kill());
      els.forEach((el) => { gsap.killTweensOf(el); el.classList.remove("vscan"); });
    };
  }, [ready]);

  return null;
}
