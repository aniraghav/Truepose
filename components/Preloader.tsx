"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLenis } from "./SmoothScroll";

/* HUD style preloader.
   Corner brackets frame the screen; "Loading" and "truepose.ai" sit either side of a dot whose
   goniometer ring sweeps with the counter. The labels slide apart, the dot grows into a sky blue
   circle that fills the screen, then the whole layer lifts away to reveal the hero.
   Skipped for reduced motion and for repeat visits in the same browser session. */

const SEEN_KEY = "tp-intro-seen";
const R = 22, CIRC = 2 * Math.PI * R;

export default function Preloader({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    lenis?.stop();
    return () => { lenis?.start(); };
  }, [lenis]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* storage blocked: play it */ }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo(0, 0);
    document.documentElement.classList.add("is-loading");

    const finish = () => {
      document.documentElement.classList.remove("is-loading");
      setGone(true);
    };

    if (reduce || seen) {
      gsap.to(el, { autoAlpha: 0, duration: 0.35, onStart: onReveal, onComplete: finish });
      return;
    }

    const q = gsap.utils.selector(el);
    const pct = q(".pl__pct")[0] as HTMLElement | undefined;
    const counter = { v: 0 };
    const mobile = window.innerWidth < 720;
    const near = mobile ? 0 : 18, far = mobile ? 34 : 40; // vw

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tl.from(q(".pl__corner"), { scale: 0.4, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }, 0)
      .from(q(".pl__label, .pl__count"), { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.1)
      .from(q(".pl__logo"), { autoAlpha: 0, y: -10, duration: 0.6, ease: "power2.out" }, 0.4)
      .to(counter, {
        v: 100, duration: 1.9, ease: "power1.inOut",
        onUpdate: () => {
          if (pct) pct.textContent = String(Math.round(counter.v)).padStart(2, "0");
          gsap.set(q(".pl__sweep"), { strokeDashoffset: CIRC * (1 - counter.v / 100) });
        },
      }, 0.15)
      .to(q(".pl__label--l"), { x: `${-near}vw`, duration: 0.6 }, 0.7)
      .to(q(".pl__label--r"), { x: `${near}vw`, duration: 0.6 }, 0.7)
      .to(q(".pl__label--l"), { x: `${-far}vw`, duration: 0.8, ease: "power4.inOut" }, 1.35)
      .to(q(".pl__label--r"), { x: `${far}vw`, duration: 0.8, ease: "power4.inOut" }, 1.35)
      .to(q(".pl__fill"), { clipPath: "circle(18vmax at 50% 50%)", duration: 0.5, ease: "power2.inOut" }, 2.05)
      .to(q(".pl__fill"), { clipPath: "circle(150vmax at 50% 50%)", duration: 0.65, ease: "power3.out" }, 2.55)
      .add(() => onReveal(), 3.05)
      .to(el, { yPercent: -100, duration: 1.05, ease: "power3.inOut" }, 2.95)
      .add(() => {
        try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
        finish();
      });

    return () => { tl.kill(); };
  }, [onReveal]);

  if (gone) return null;

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <i className="pl__corner pl__corner--tl" /><i className="pl__corner pl__corner--tr" />
      <i className="pl__corner pl__corner--bl" /><i className="pl__corner pl__corner--br" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="pl__logo"><img className="pl__logoimg" src="/assets/logo-full-light.png" width={653} height={160} alt="" /></div>

      <div className="pl__row">
        <span className="pl__label pl__label--l">Loading</span>
        <span className="pl__core">
          <svg viewBox="0 0 60 60">
            <circle cx="30" cy="30" r={R} className="pl__track" />
            <circle cx="30" cy="30" r={R} className="pl__sweep" strokeDasharray={CIRC} strokeDashoffset={CIRC} transform="rotate(-90 30 30)" />
          </svg>
          <i className="pl__dot" />
        </span>
        <span className="pl__label pl__label--r">truepose.ai</span>
      </div>

      <div className="pl__count">( <span className="pl__pct">00</span>% )</div>
      <div className="pl__fill" />
    </div>
  );
}
